const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'frontend', 'public');
const files = ['logo_horizontal.png', 'logo_stacked.png', 'logo_icon.png', 'logo_app.png', 'logo-icon.svg'];

files.forEach(f => {
  const p = path.join(dir, f);
  if (!fs.existsSync(p)) {
    console.log(`Missing: ${f}`);
    return;
  }
  const buf = fs.readFileSync(p);
  if (f.endsWith('.png')) {
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    console.log(`${f}: ${w}x${h}px, ${(buf.length / 1024).toFixed(1)} KB`);
  } else {
    console.log(`${f}: SVG, ${(buf.length / 1024).toFixed(1)} KB`);
  }
});
