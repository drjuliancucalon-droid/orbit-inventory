import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(500);
console.log('URL after loading /:', page.url());
console.log('Title:', await page.title());
const bodyText = await page.locator('body').innerText();
console.log('Has "Iniciar sesión" text:', bodyText.includes('Iniciar sesión'));
console.log('Has "en órbita" pitch text:', bodyText.includes('en órbita'));
await page.screenshot({ path: '/tmp/orbit-login.png', fullPage: true });

// Navigate to register too
await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(300);
const regText = await page.locator('body').innerText();
console.log('Register page has "Crea tu espacio":', regText.includes('Crea tu espacio'));
await page.screenshot({ path: '/tmp/orbit-register.png', fullPage: true });

// Try a nonsense route -> should client-redirect eventually to /login (since unauthenticated)
await page.goto('http://localhost:5173/some-random-route', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(300);
console.log('URL after visiting unknown route:', page.url());

console.log('Console/page errors captured:', JSON.stringify(consoleErrors, null, 2));
await browser.close();
