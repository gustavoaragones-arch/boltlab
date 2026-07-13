const fs = require("node:fs");
const path = require("node:path");

function projectRoot() {
  return path.resolve(__dirname, "..", "..");
}

function walkFiles(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) {
    return fileList;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const absolute = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(absolute, fileList);
    } else {
      fileList.push(absolute);
    }
  }
  return fileList;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, value);
}

module.exports = {
  projectRoot,
  walkFiles,
  readJson,
  writeJson,
  writeText
};
