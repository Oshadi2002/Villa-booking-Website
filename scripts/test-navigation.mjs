import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function evaluate(cdp, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true
  });
  return res.result.value;
}

async function run() {
  console.log('Starting headless Chrome for navigation testing...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1440,900',
    '--disable-gpu',
    '--disable-extensions',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\HP\\AppData\\Local\\Temp\\chrome-nav-test'
  ], { stdio: 'ignore' });

  try {
    let version = null;
    for (let i = 0; i < 20; i++) {
      try {
        version = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
        break;
      } catch (_e) {
        await sleep(300);
      }
    }

    if (!version) throw new Error('Chrome CDP failed to start');

    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
    const target = targets.find(t => t.type === 'page') || (await fetchJson(`http://127.0.0.1:${PORT}/json/new`));
    const cdp = new CDPClient(target.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log('\n--- TEST 1: Page-to-Page Navigation Back & Forward ---');
    // Start at an external site simulation
    await cdp.send('Page.navigate', { url: 'https://example.com' });
    await sleep(1500);

    // User visits lankagama homepage
    console.log('1. User lands on http://localhost:3000');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2000);

    // User clicks "Blogs & Guides" in Navbar
    console.log('2. User clicks Blogs & Guides link');
    await evaluate(cdp, `
      (() => {
        const link = document.querySelector('header a[href="/blogs"]');
        if (link) link.click();
      })()
    `);
    await sleep(1500);
    let currentUrl = await evaluate(cdp, `window.location.href`);
    console.log('   Current URL:', currentUrl);

    // User clicks "Reviews & FAQ"
    console.log('3. User clicks Reviews & FAQ link');
    await evaluate(cdp, `
      (() => {
        const link = document.querySelector('header a[href="/reviews"]');
        if (link) link.click();
      })()
    `);
    await sleep(1500);
    currentUrl = await evaluate(cdp, `window.location.href`);
    console.log('   Current URL:', currentUrl);

    // User presses Back
    console.log('4. User presses browser BACK button');
    await evaluate(cdp, `window.history.back()`);
    await sleep(1500);
    currentUrl = await evaluate(cdp, `window.location.href`);
    console.log('   After Back URL (expected /blogs):', currentUrl);

    // User presses Back again
    console.log('5. User presses browser BACK button again');
    await evaluate(cdp, `window.history.back()`);
    await sleep(1500);
    currentUrl = await evaluate(cdp, `window.location.href`);
    console.log('   After Back URL (expected /):', currentUrl);

    // User presses Forward
    console.log('6. User presses browser FORWARD button');
    await evaluate(cdp, `window.history.forward()`);
    await sleep(1500);
    currentUrl = await evaluate(cdp, `window.location.href`);
    console.log('   After Forward URL (expected /blogs):', currentUrl);

    console.log('\n--- TEST 2: Villa Details & Modals with Browser Back ---');
    // Go to homepage
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2000);

    // Click "Photos & Details" on first villa
    console.log('1. User opens Villa Detail modal');
    await evaluate(cdp, `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Photos & Details'));
        if (btn) {
          btn.scrollIntoView({ behavior: 'instant', block: 'center' });
          btn.click();
        }
      })()
    `);
    await sleep(1000);
    let isModalOpen = await evaluate(cdp, `
      !!document.querySelector('.fixed.inset-0.z-50')
    `);
    console.log('   Modal open state:', isModalOpen);
    console.log('   Current URL with modal:', await evaluate(cdp, `window.location.href`));

    // User presses Back button expecting modal to close
    console.log('2. User presses browser BACK button (expecting modal to close)');
    await evaluate(cdp, `window.history.back()`);
    await sleep(1500);
    isModalOpen = await evaluate(cdp, `
      !!document.querySelector('.fixed.inset-0.z-50')
    `);
    currentUrl = await evaluate(cdp, `window.location.href`);
    console.log('   Current URL after Back:', currentUrl);
    console.log('   Is modal still open?', isModalOpen);
    console.log('   Did browser navigate to previous external/previous site?', currentUrl.includes('example.com'));

    console.log('\n--- TEST 3: Booking Modal with Browser Back ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2000);

    console.log('1. User clicks Reserve Room (opens BookingModal)');
    await evaluate(cdp, `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Reserve Room'));
        if (btn) {
          btn.scrollIntoView({ behavior: 'instant', block: 'center' });
          btn.click();
        }
      })()
    `);
    await sleep(1000);
    let isBookingOpen = await evaluate(cdp, `
      !!document.querySelector('.fixed.inset-0.z-50 form')
    `);
    console.log('   Booking modal open state:', isBookingOpen);

    console.log('2. User presses browser BACK button');
    await evaluate(cdp, `window.history.back()`);
    await sleep(1500);
    isBookingOpen = await evaluate(cdp, `
      !!document.querySelector('.fixed.inset-0.z-50 form')
    `);
    currentUrl = await evaluate(cdp, `window.location.href`);
    console.log('   Current URL after Back:', currentUrl);
    console.log('   Is booking modal still open?', isBookingOpen);
    console.log('   Did it exit to external site?', currentUrl.includes('example.com'));

    console.log('\n--- TEST 4: Section Hash Links Back & Forward ---');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2000);

    console.log('1. User clicks Camping Gear link (/#camping)');
    await evaluate(cdp, `
      (() => {
        const link = document.querySelector('header a[href="/#camping"]');
        if (link) link.click();
      })()
    `);
    await sleep(1000);
    console.log('   Current URL:', await evaluate(cdp, `window.location.href`));

    console.log('2. User clicks Kithul & Toddy link (/#kithul)');
    await evaluate(cdp, `
      (() => {
        const link = document.querySelector('header a[href="/#kithul"]');
        if (link) link.click();
      })()
    `);
    await sleep(1000);
    console.log('   Current URL:', await evaluate(cdp, `window.location.href`));

    console.log('3. User presses Back');
    await evaluate(cdp, `window.history.back()`);
    await sleep(1000);
    console.log('   Current URL after Back (expected #camping):', await evaluate(cdp, `window.location.href`));

    cdp.close();
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('Nav test error:', err);
  process.exit(1);
});
