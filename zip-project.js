const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

const zip = new AdmZip();
const sourceDir = process.cwd();
const outputZip = path.join(sourceDir, "StoreSnapAI-ReadyToUpload.zip");

// Folders and files to exclude
const excludeList = ["node_modules", ".next", "downloads", ".env.local", "StoreSnapAI-ReadyToUpload.zip"];

fs.readdirSync(sourceDir).forEach(file => {
  if (!excludeList.includes(file)) {
    const filePath = path.join(sourceDir, file);
    if (fs.statSync(filePath).isDirectory()) {
      zip.addLocalFolder(filePath, file);
    } else {
      zip.addLocalFile(filePath);
    }
  }
});

zip.writeZip(outputZip);
console.log("Created StoreSnapAI-ReadyToUpload.zip successfully.");
