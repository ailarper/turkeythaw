import fs from 'fs';
import path from 'path';

function processHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processHtmlFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const comment = '<!-- mylead-verification: 8830cae546df00ba0cef3812afb28a78 -->';
      const meta = '<meta name="mylead-verification" content="8830cae546df00ba0cef3812afb28a78"/>';
      
      let modified = false;
      if (!content.includes(comment)) {
        content = content.replace('<head>', `<head>${comment}`);
        modified = true;
      }
      if (!content.includes('8830cae546df00ba0cef3812afb28a78')) {
        content = content.replace('<head>', `<head>${meta}`);
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Injected mylead verification into ${fullPath}`);
      }
    }
  }
}

processHtmlFiles('./out');
