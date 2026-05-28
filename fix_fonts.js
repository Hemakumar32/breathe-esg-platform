const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'src', 'pages');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Change H1 headers to text-3xl font-semibold text-[#0f172a]
  content = content.replace(/className="(.*?)text-2xl font-bold text-gray-900(.*?)"/g, 'className="$1text-[32px] font-semibold text-[#0f172a] tracking-tight$2"');
  content = content.replace(/className="(.*?)text-2xl font-bold(.*?)"/g, 'className="$1text-[32px] font-semibold tracking-tight$2"');

  // 2. Change subtext paragraphs from text-sm to text-[15px]
  content = content.replace(/<p className="(.*?)text-gray-500 text-sm mt-1(.*?)"/g, '<p className="$1text-gray-500 text-[15px] mt-2$2"');

  // 3. Change generic tables from text-xs to text-sm
  content = content.replace(/<table className="(.*?)text-xs(.*?)"/g, '<table className="$1text-sm$2"');

  // 4. Update table headers to match picture (uppercase, small, gray, bold)
  content = content.replace(/<th className="(.*?)font-bold text-gray-900 tracking-wider(.*?)"/g, '<th className="$1text-xs font-bold text-gray-500 uppercase tracking-wider$2"');

  // 5. In ReviewPage, there are "text-xs text-gray-400" elements in the table. Let's let text-sm cascade down, or bump up specific ones.

  fs.writeFileSync(filePath, content, 'utf-8');
});

// Also update App.jsx TopHeader
const appJsxPath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
let appJsx = fs.readFileSync(appJsxPath, 'utf-8');
appJsx = appJsx.replace(/<h2 className="(.*?)text-2xl font-bold text-gray-900(.*?)"/g, '<h2 className="$1text-[32px] font-semibold text-[#0f172a] tracking-tight$2"');
fs.writeFileSync(appJsxPath, appJsx, 'utf-8');

console.log('Fonts fixed!');
