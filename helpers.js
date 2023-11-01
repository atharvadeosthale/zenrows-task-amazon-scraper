const fs = require("fs");

async function writeToFile(fileName, content) {
  // Output the HTML to a file
  await fs.writeFile(fileName, content, (err) => {
    if (err) throw new Error("Error writing to file", err);
  });
}

module.exports = {
  writeToFile,
};
