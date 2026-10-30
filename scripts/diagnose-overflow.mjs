import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

const VIEWPORTS = [
  { name: '1365x768', width: 1365, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x800', width: 360, height: 800 },
];

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

async function run() {
  console.log('Starting headless Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\HP\\AppData\\Local\\Temp\\chrome-overflow-test'
  ], { stdio: 'ignore' });

  try {
    // Wait for Chrome CDP to be available
    let version = null;
    for (let i = 0; i < 20; i++) {
      try {
        version = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
        break;
      } catch (e) {
        await sleep(300);
      }
    }

    if (!version) {
      throw new Error('Chrome CDP failed to start');
    }

    const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
    const target = targets[0] || (await fetchJson(`http://127.0.0.1:${PORT}/json/new`));
    const cdp = new CDPClient(target.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');

    console.log('Navigating to https://the-sinharaja-collection-lankagama-nine.vercel.app ...');
    await cdp.send('Page.navigate', { url: 'https://the-sinharaja-collection-lankagama-nine.vercel.app' });
    await sleep(3500);

    console.log('\n=== RUNNING OVERFLOW AUDIT ACROSS VIEWPORTS ===\n');

    for (const vp of VIEWPORTS) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768
      });

      await sleep(500);

      const evalRes = await cdp.send('Runtime.evaluate', {
        expression: `
          (() => {
            const clientWidth = document.documentElement.clientWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const bodyScrollWidth = document.body.scrollWidth;
            const overflow = Math.max(scrollWidth, bodyScrollWidth) - clientWidth;

            // Find all elements sticking out beyond clientWidth
            const offenders = [];
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > clientWidth + 1) {
                // Ignore elements hidden by overflow-hidden ancestors
                let curr = el;
                let isClipped = false;
                while (curr && curr !== document.body && curr !== document.documentElement) {
                  const style = window.getComputedStyle(curr);
                  if (style.overflowX === 'hidden' || style.overflowX === 'clip') {
                    // Check if el is inside this clipped ancestor
                    const pRect = curr.getBoundingClientRect();
                    if (pRect.right <= clientWidth + 1) {
                      isClipped = true;
                      break;
                    }
                  }
                  curr = curr.parentElement;
                }

                if (!isClipped) {
                  let path = el.tagName.toLowerCase();
                  if (el.id) path += '#' + el.id;
                  let p = el.parentElement;
                  let depth = 0;
                  while (p && p !== document.body && depth < 3) {
                    path = p.tagName.toLowerCase() + (p.id ? '#' + p.id : '') + ' > ' + path;
                    p = p.parentElement;
                    depth++;
                  }

                  offenders.push({
                    path,
                    tag: el.tagName.toLowerCase(),
                    id: el.id,
                    className: (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 6).join(' ') : '',
                    rectRight: Math.round(rect.right),
                    rectLeft: Math.round(rect.left),
                    rectWidth: Math.round(rect.width),
                    overflowBy: Math.round(rect.right - clientWidth),
                    outerHtml: el.outerHTML ? el.outerHTML.slice(0, 120) : '',
                    snippet: (el.innerText || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40)
                  });
                }
              }
            }

            // Navbar items check
            const header = document.querySelector('header');
            const headerRect = header ? header.getBoundingClientRect() : null;
            const waButton = document.querySelector('header a[href*="wa.me"]');
            const waRect = waButton ? waButton.getBoundingClientRect() : null;
            const trackBtn = document.querySelector('header button');
            const trackRect = trackBtn ? trackBtn.getBoundingClientRect() : null;

            return {
              clientWidth,
              scrollWidth,
              bodyScrollWidth,
              overflow,
              hasHorizontalScroll: overflow > 1,
              offenderCount: offenders.length,
              topOffenders: offenders.slice(0, 5),
              headerWidth: headerRect ? Math.round(headerRect.width) : null,
              headerRight: headerRect ? Math.round(headerRect.right) : null,
              waButtonRight: waRect ? Math.round(waRect.right) : null,
              waButtonClipped: waRect ? waRect.right > clientWidth : false
            };
          })()
        `,
        returnByValue: true
      });

      const data = evalRes.result.value;
      const status = data.hasHorizontalScroll ? '❌ FAIL (Overflow)' : '✅ PASS';
      console.log(`[${vp.name}] ${status}`);
      console.log(`  clientWidth: ${data.clientWidth}px | scrollWidth: ${data.scrollWidth}px (Overflow: +${data.overflow}px)`);
      if (data.headerRight) {
        console.log(`  Header right: ${data.headerRight}px (width: ${data.headerWidth}px)`);
      }
      if (data.waButtonRight) {
        console.log(`  Header WhatsApp button right: ${data.waButtonRight}px (Clipped offscreen: ${data.waButtonClipped})`);
      }
      if (data.topOffenders && data.topOffenders.length > 0) {
        console.log('  Offending elements:');
        for (const off of data.topOffenders) {
          console.log(`    - [${off.path}] right:${off.rectRight}px (overflows by +${off.overflowBy}px)`);
          console.log(`      HTML: ${off.outerHtml}`);
        }
      }
      console.log('');
    }

    cdp.close();
  } finally {
    chrome.kill();
  }
}

run().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
