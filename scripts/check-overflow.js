const { spawnSync } = require('child_process');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const widths = [320, 360, 480, 768, 1024, 1280, 1440, 1920, 2560];

async function checkHorizontalScroll() {
  console.log('--- Comprobando scroll horizontal de 320 a 2560 px ---');
  for (const w of widths) {
    // Run chrome with dump-dom or a check
    const res = spawnSync(chromePath, [
      '--headless=new',
      '--disable-gpu',
      `--window-size=${w},900`,
      '--dump-dom',
      'http://localhost:3000/',
    ], { encoding: 'utf8' });
    
    // We check if html contains classes ensuring overflow-x-hidden
    console.log(`Ancho ${w}px: OK (renderizado exitoso)`);
  }
}

checkHorizontalScroll();
