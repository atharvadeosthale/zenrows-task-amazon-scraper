const puppeteer = require("puppeteer");
const fs = require("fs");
const { writeToFile, parseReviewsFromNodes } = require("./helpers");
const dotenv = require("dotenv");
const converter = require("json-2-csv");

dotenv.config();

// Top level config
const config = {
  url: "https://www.amazon.com/ENHANCE-Headphone-Customizable-Lighting-Flexible/dp/B07DR59JLP/",
  headlessMode: false,
  email: process.env.AMAZON_EMAIL,
  password: process.env.AMAZON_PASSWORD,
};

async function main() {
  // Initialize puppeteer and open a page
  const browser = await puppeteer.launch({
    headless: config.headlessMode ? "new" : false,
  });
  const page = await browser.newPage();
  await page.goto(config.url, { waitUntil: "domcontentloaded" });

  // Get all rendered HTML now that DOM is loaded
  const publicHTML = await page.evaluate(
    () => document.documentElement.outerHTML
  );

  await writeToFile("outputs/publicPage.html", publicHTML);
  console.log("✅ Public product page written to outputs/publicPage.html!");

  // Go to login page, get the URL so you can check DOM content loaded
  const signInUrl = await page.$eval(
    'a[data-nav-role="signin"]',
    (tag) => tag.href
  );
  await page.goto(signInUrl, { waitUntil: "domcontentloaded" });

  // Type in email and password
  await page.type("input[type=email]", config.email);
  await page.click("#continue");
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.type("input[type=password]", config.password);
  await page.click("#signInSubmit");

  await page.waitForNavigation({ waitUntil: "domcontentloaded" });

  // Back at product page, get the rendered HTML
  const authenticatedHTML = await page.evaluate(
    () => document.documentElement.outerHTML
  );

  await writeToFile("outputs/authenticatedPage.html", authenticatedHTML);
  console.log(
    "✅ Authenticated product page written to outputs/authenticatedPage.html!"
  );

  // Get the review nodes
  const reviewNodes = await page.$$('div[data-hook="review"]');

  // Parse review nodes
  const reviews = await parseReviewsFromNodes(reviewNodes);

  // Convert reviews to CSV
  const csv = await converter.json2csv(reviews);
  await writeToFile("outputs/reviews.csv", csv);
  console.log("✅ Reviews written to outputs/reviews.csv!");

  await browser.close();
}

main();
