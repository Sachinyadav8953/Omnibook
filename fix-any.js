const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // 1. Single param without parens: .map(item =>
      const regex1 = /\.(map|filter|reduce|forEach|find|some|every)\(\s*(async\s+)?([a-zA-Z0-9_]+)\s*=>/g;
      if (regex1.test(content)) {
        content = content.replace(regex1, '.$1($2($3: any) =>');
        modified = true;
      }

      // 2. Single param with parens: .map((item) =>
      const regex2 = /\.(map|filter|reduce|forEach|find|some|every)\(\s*(async\s+)?\(\s*([a-zA-Z0-9_]+)\s*\)\s*=>/g;
      if (regex2.test(content)) {
        content = content.replace(regex2, '.$1($2($3: any) =>');
        modified = true;
      }

      // 3. Two params with parens: .map((item, i) =>
      const regex3 = /\.(map|filter|reduce|forEach|find|some|every)\(\s*(async\s+)?\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)\s*=>/g;
      if (regex3.test(content)) {
        content = content.replace(regex3, '.$1($2($3: any, $4: any) =>');
        modified = true;
      }

      if (modified) {
        // Fix double spaces or weird artifacts if async matched undefined
        content = content.replace(/\(undefined\(/g, '((');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log("Done checking and fixing implicit any in array callbacks.");
