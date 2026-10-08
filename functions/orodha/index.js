const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..');
const rootFiles = fs.readdirSync(buildDir);

const productDataPath = path.join(buildDir, 'js', 'products-data.js');
const productData = fs.existsSync(productDataPath) ? fs.readFileSync(productDataPath, 'utf8') : '';

const productsMatch = productData.match(/const\s+PRODUCTS\s*=\s*(\[[\s\S]*?\]);\s*const\s+CATEGORIES\s*=/);
let products = [];
if (productsMatch) {
  try {
    const literal = productsMatch[1];
    products = Function(`return (${literal});`)();
  } catch (e) {
    products = [];
  }
}

const json = JSON.stringify({
  total: products.length,
  products: products.slice(0, 200),
  generatedAt: new Date().toISOString(),
  files: rootFiles.filter((name) => !name.startsWith('.'))
}, null, 2);

return new Response(json, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300'
  }
});
