const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve(__dirname, '../docs/design/screenshots');

const sizes = [
  { name: 'v2-360.png', width: 360, height: 800 },
  { name: 'v2-768.png', width: 768, height: 1024 },
  { name: 'v2-1280.png', width: 1280, height: 900 },
];

for (const s of sizes) {
  const outFile = path.join(outDir, s.name);
  console.log('Capturing', s.name, '...');
  spawnSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--window-size=${s.width},${s.height}`,
    `--screenshot=${outFile}`,
    'http://localhost:3000/',
  ]);
  if (fs.existsSync(outFile)) {
    console.log(s.name, 'bytes:', fs.statSync(outFile).size);
  } else {
    console.error('Failed to capture', s.name);
  }
}
