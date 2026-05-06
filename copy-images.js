const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\JDM.D\\.gemini\\antigravity\\brain\\13fc08b6-25f8-421d-8897-7a3524fbd8c1';
const dest = path.join(__dirname, 'assets', 'images');

const files = [
  ['profile_placeholder_1776340237934.png', 'profile-placeholder.png'],
  ['hero_banner_bg_1776340255397.png',       'hero-bg.png'],
  ['project_placeholder1_1776340281676.png', 'project-1.png'],
  ['project_placeholder2_1776340298169.png', 'project-2.png'],
  ['project_placeholder3_1776340316077.png', 'project-3.png'],
];

files.forEach(([s, d]) => {
  const srcPath  = path.join(src, s);
  const destPath = path.join(dest, d);
  try {
    fs.copyFileSync(srcPath, destPath);
    console.log(`[+] Copied ${d}`);
  } catch (e) {
    console.log(`[!] Could not copy ${d}: ${e.message}`);
  }
});
console.log('Done!');
