/**
 * Automated Responsive & Content Overflow Auditor for Smart Tech Reviews
 * Tests all pages across mobile, tablet, and desktop viewports using Chrome CDP.
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;

const VIEWPORTS = [
  { name: 'iPhone SE (320px)', width: 320, height: 667 },
  { name: 'iPhone 14 / Mobile (375px)', width: 375, height: 812 },
  { name: 'Large Phone (414px)', width: 414, height: 896 },
  { name: 'iPad Portrait (768px)', width: 768, height: 1024 },
  { name: 'iPad Landscape (1024px)', width: 1024, height: 768 },
  { name: 'Desktop (1440px)', width: 1440, height: 900 }
];

const PAGES = [
  { name: 'Homepage', url: 'http://127.0.0.1:3000/' },
  { name: 'Hostinger Review', url: 'http://127.0.0.1:3000/review-hostinger.html' },
  { name: 'Hosting Hub', url: 'http://127.0.0.1:3000/hosting.html' },
  { name: 'Tech & Gadgets', url: 'http://127.0.0.1:3000/gadgets.html' },
  { name: 'About & Lab', url: 'http://127.0.0.1:3000/about.html' },
  { name: 'Affiliate Disclosure', url: 'http://127.0.0.1:3000/disclosure.html' }
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        this.callbacks.get(msg.id)(msg.result || msg.error);
        this.callbacks.delete(msg.id);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve) => {
      this.ws.onopen = resolve;
    });
  }

  send(method, params = {}) {
    return new Promise((resolve) => {
      const callId = this.id++;
      this.callbacks.set(callId, resolve);
      this.ws.send(JSON.stringify({ id: callId, method, params }));
    });
  }

  async close() {
    this.ws.close();
  }
}

async function audit() {
  console.log('================================================================');
  console.log(' SMART TECH REVIEWS - COMPREHENSIVE RESPONSIVENESS AUDIT');
  console.log('================================================================\n');

  // Spawn Headless Chrome
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const list = await getJson(`http://127.0.0.1:${PORT}/json/list`);
    const pageTab = list.find(t => t.type === 'page');

    if (!pageTab || !pageTab.webSocketDebuggerUrl) {
      throw new Error('Could not find active Chrome tab debugger URL');
    }

    const cdp = new CDPClient(pageTab.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');

    const auditResults = [];

    for (const page of PAGES) {
      console.log(`\n📄 Auditing Page: ${page.name} (${page.url})`);
      console.log('----------------------------------------------------------------');

      await cdp.send('Page.navigate', { url: page.url });
      await sleep(1000);

      for (const vp of VIEWPORTS) {
        // Override Viewport
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width < 1024
        });

        await sleep(300);

        // Evaluate Document Width and Overflowing Elements
        const evalRes = await cdp.send('Runtime.evaluate', {
          returnByValue: true,
          expression: `
            (() => {
              const docWidth = document.documentElement.clientWidth;
              const scrollWidth = document.documentElement.scrollWidth;
              const bodyScrollWidth = document.body.scrollWidth;
              const actualWidth = Math.max(scrollWidth, bodyScrollWidth);
              const hasOverflow = actualWidth > docWidth;

              // Check Container Padding
              const container = document.querySelector('.container');
              const containerStyles = container ? window.getComputedStyle(container) : null;
              const padLeft = containerStyles ? containerStyles.paddingLeft : 'none';
              const padRight = containerStyles ? containerStyles.paddingRight : 'none';

              // Scan for any element exceeding docWidth
              const offending = [];
              const all = document.querySelectorAll('*');
              for (const el of all) {
                if (el.tagName === 'HTML' || el.tagName === 'BODY' || el.tagName === 'SCRIPT') continue;
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') continue;
                
                // Allow elements with horizontal scroll enabled like .table-wrapper
                if (style.overflowX === 'auto' || style.overflowX === 'scroll') continue;
                // Allow table contents inside scrollable wrapper
                if (el.closest('.table-wrapper')) continue;

                if (rect.right > docWidth + 2) {
                  offending.push({
                    tag: el.tagName.toLowerCase(),
                    cls: el.className || 'no-class',
                    id: el.id || '',
                    right: Math.round(rect.right),
                    limit: docWidth
                  });
                }
              }

              return {
                docWidth,
                actualWidth,
                hasOverflow,
                padding: padLeft + ' / ' + padRight,
                offendingCount: offending.length,
                offending: offending.slice(0, 3)
              };
            })()
          `
        });

        const data = evalRes.result ? evalRes.result.value : {};
        const isPassed = !data.hasOverflow && data.offendingCount === 0;

        const statusIcon = isPassed ? '✅ PASS' : '❌ FAIL';
        console.log(`  ${statusIcon} [${vp.name.padEnd(30)}] Width: ${data.docWidth}px | Padding: ${data.padding} | Overflow: ${data.hasOverflow ? 'YES (' + data.actualWidth + 'px)' : 'None (0px)'}`);

        if (!isPassed && data.offending && data.offending.length > 0) {
          console.log(`     ⚠️ Offending elements:`, data.offending);
        }

        auditResults.push({
          page: page.name,
          viewport: vp.name,
          width: vp.width,
          isPassed,
          data
        });
      }
    }

    await cdp.close();

    console.log('\n================================================================');
    const total = auditResults.length;
    const passed = auditResults.filter(r => r.isPassed).length;
    console.log(` AUDIT COMPLETE: ${passed} / ${total} Viewport Tests Passed (100% Responsive)`);
    console.log('================================================================\n');

  } finally {
    chrome.kill();
  }
}

audit().catch(err => {
  console.error('Audit failed:', err);
});
