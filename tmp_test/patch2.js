const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');
const norm = content.replace(/\r\n/g, '\n');

let updated = norm;

// 1. Change "LATAM15" to "gonza"
updated = updated.replace('"LATAM15"', '"gonza"');

// 2. Remove the OopBuy card entirely
const oopStart = '\n                    <!-- Card 2: OopBuy -->';
const oopEnd   = '\n                    <!-- Card 3: Discord -->';
const i1 = updated.indexOf(oopStart);
const i2 = updated.indexOf(oopEnd);
if (i1 !== -1 && i2 !== -1) {
    updated = updated.slice(0, i1) + updated.slice(i2);
    console.log('OopBuy card removed OK');
} else {
    console.error('Could not find OopBuy card bounds. i1=' + i1 + ' i2=' + i2);
}

// 3. Update the comment label for the Discord card (was Card 3, now Card 2)
updated = updated.replace('<!-- Card 3: Discord -->', '<!-- Card 2: Discord -->');

// 4. Remove the 3rd dot (OopBuy dot), keep only 2 dots
// Replace the 3-dot block with a 2-dot block
const threeDots = '<div class="rs-promo-dots" id="rsPromoDots">\n                        <button class="rs-promo-dot active" data-idx="0" aria-label="Slide 1"></button>\n                        <button class="rs-promo-dot" data-idx="1" aria-label="Slide 2"></button>\n                        <button class="rs-promo-dot" data-idx="2" aria-label="Slide 3"></button>\n                    </div>';
const twoDots   = '<div class="rs-promo-dots" id="rsPromoDots">\n                        <button class="rs-promo-dot active" data-idx="0" aria-label="Slide 1"></button>\n                        <button class="rs-promo-dot" data-idx="1" aria-label="Slide 2"></button>\n                    </div>';
if (updated.includes(threeDots)) {
    updated = updated.replace(threeDots, twoDots);
    console.log('Dots updated to 2 OK');
} else {
    console.error('Three dots block not found');
}

// Save back with original line endings
content = updated.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, content, 'utf8');

// Verify
const final = fs.readFileSync(filePath, 'utf8');
console.log('Has LATAM15:', final.includes('LATAM15'));
console.log('Has gonza:', final.includes('"gonza"'));
console.log('Has OopBuy card (OOPBUY):', final.includes('>OOPBUY<'));
console.log('Has KakoBuy card:', final.includes('>KAKOBUY<'));
console.log('Has Discord card:', final.includes('Comunidad RepsHub'));
console.log('Done!');
