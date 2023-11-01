const fs = require("fs");

async function writeToFile(fileName, content) {
  // Output the HTML to a file
  await fs.writeFile(fileName, content, (err) => {
    if (err) throw new Error("Error writing to file", err);
  });
}

async function parseReviewsFromNodes(reviewNodes) {
  const reviews = await Promise.all(
    reviewNodes.map(async (review) => {
      const reviewText = await review.$eval(
        'span[data-hook="review-body"]',
        (node) => node.innerText
      );
      const reviewerName = await review.$eval(
        "span.a-profile-name",
        (node) => node.innerText
      );
      const reviewDate = await review.$eval(
        'span[data-hook="review-date"]',
        // Get the date instead of location of review
        (node) => node.innerText.split(" on ")[1]
      );
      return {
        reviewText,
        reviewerName,
        reviewDate,
      };
    })
  );

  return reviews;
}

module.exports = {
  writeToFile,
  parseReviewsFromNodes,
};
