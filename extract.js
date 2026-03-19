const fs = require('fs');
const PNG = require('pngjs').PNG;

function extractColors(imagePath) {
    fs.createReadStream(imagePath)
    .pipe(new PNG())
    .on('parsed', function() {
        const colorCounts = {};
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = (this.width * y + x) << 2;
                const r = this.data[idx];
                const g = this.data[idx+1];
                const b = this.data[idx+2];
                const a = this.data[idx+3];
                
                if (a > 10) { // ignore very transparent pixels
                    const hex = '#' + 
                        r.toString(16).padStart(2, '0') + 
                        g.toString(16).padStart(2, '0') + 
                        b.toString(16).padStart(2, '0');
                    colorCounts[hex] = (colorCounts[hex] || 0) + 1;
                }
            }
        }
        
        const sortedColors = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        console.log(`Top colors for ${imagePath}:`);
        sortedColors.forEach(([hex, count]) => {
            console.log(`${hex} - count: ${count}`);
        });
    });
}

extractColors('docs/temp/Layout/Logo Transparente/LOGO PADRÃO-1.png');
extractColors('docs/temp/Layout/Logo Transparente/LOGO BR-1.png');
