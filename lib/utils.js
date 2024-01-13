const path = require('path');
const fs = require('fs');
const {WriteToFileError, CreateFolderError} = require("../errors/appError")

async function writeJsonDataToFile(filePath, fileName, data) {
  const jsonString = JSON.stringify(data, null, 2);

  try {
    if (!fs.existsSync(filePath)) {
      try {
        fs.mkdirSync(filePath);
      }
      catch(err) {
        throw new CreateFolderError(err);
      }
    }
    const fullPath = path.join(filePath, fileName);
    fs.writeFileSync(fullPath, jsonString);
  } catch (err) {
    throw new WriteToFileError(err);
  }
}
function generateTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  }
module.exports = {writeJsonDataToFile, generateTimestamp}