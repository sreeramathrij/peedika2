const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "../peedika-green/dist");
const destDir = path.join(__dirname, "../server/dist/client");

function copyRecursive(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("Copying client build to server/dist/client...");

if (!fs.existsSync(sourceDir)) {
  console.error(
    "Error: peedika-green/dist does not exist. Run npm run build:client first."
  );
  process.exit(1);
}

copyRecursive(sourceDir, destDir);
console.log("Client build copied successfully!");
