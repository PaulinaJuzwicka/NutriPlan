const fs = require('fs');
const path = require('path');
const strip = require('strip-comments');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (/(\.js|\.ts|\.tsx|\.jsx)$/.test(filePath)) {
    const code = fs.readFileSync(filePath, 'utf8');
    const noComments = strip(code);
    fs.writeFileSync(filePath, noComments, 'utf8');
    console.log('Comments removed from:', filePath);
  }
}); 