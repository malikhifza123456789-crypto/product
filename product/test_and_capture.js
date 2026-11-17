const http = require('http');
const fs = require('fs');

async function run() {
  console.log('Fetching targets from Chrome...');
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = list.find(item => item.type === 'page' && item.url.includes('localhost:3000'));
  if (!page) {
    console.error('Target page not found');
    process.exit(1);
  }

  console.log('Connecting to WebSocket:', page.webSocketDebuggerUrl);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const { resolve, reject } = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res.result ? res.result.value : null;
  }

  async function captureShot(filename, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const { data } = await send('Page.captureScreenshot', params);
    fs.writeFileSync(filename, Buffer.from(data, 'base64'));
    console.log(`Saved ${filename}`);
  }

  ws.onopen = async () => {
    try {
      await send('Page.enable');
      await send('DOM.enable');

      console.log('Testing page interactions...');

      // 1. Check Initial Theme
      const initialTheme = await evalJs(`document.documentElement.getAttribute('data-theme')`);
      console.log('Initial theme:', initialTheme);

      // 2. Toggle Theme to Light
      await evalJs(`document.getElementById('theme-toggle').click()`);
      const lightTheme = await evalJs(`document.documentElement.getAttribute('data-theme')`);
      console.log('After toggle theme:', lightTheme);

      // Capture Desktop Light Mode View
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });
      await new Promise(r => setTimeout(r, 400));
      await captureShot('C:/Users/SDF/.gemini/antigravity/brain/8059829a-cd7a-4f8d-9253-5eee6b9e1aa2/desktop-light.png');

      // Toggle Theme back to Dark
      await evalJs(`document.getElementById('theme-toggle').click()`);

      // 3. Test Pricing Toggle
      const growthPriceAnnual = await evalJs(`document.getElementById('price-growth').textContent`);
      console.log('Growth Price (Annual):', growthPriceAnnual); // should be 24

      await evalJs(`document.getElementById('billing-toggle').click()`);
      const growthPriceMonthly = await evalJs(`document.getElementById('price-growth').textContent`);
      console.log('Growth Price (Monthly):', growthPriceMonthly); // should be 29

      // Toggle back to Annual
      await evalJs(`document.getElementById('billing-toggle').click()`);

      // 4. Test FAQ Accordion
      const faq1ExpandedBefore = await evalJs(`document.getElementById('faq-btn-1').getAttribute('aria-expanded')`);
      await evalJs(`document.getElementById('faq-btn-1').click()`);
      const faq1ExpandedAfter = await evalJs(`document.getElementById('faq-btn-1').getAttribute('aria-expanded')`);
      const faq1AnswerHidden = await evalJs(`document.getElementById('faq-ans-1').hidden`);
      console.log('FAQ 1 Toggle:', { before: faq1ExpandedBefore, after: faq1ExpandedAfter, hidden: faq1AnswerHidden });

      // 5. Test Demo Modal Dialog
      await evalJs(`document.getElementById('open-demo-btn').click()`);
      const modalOpen = await evalJs(`document.getElementById('demo-modal').open`);
      console.log('Demo Modal Open:', modalOpen);

      // Switch to Chapter 2 in demo modal
      await evalJs(`document.querySelector('.chapter-btn[data-chapter="2"]').click()`);
      await new Promise(r => setTimeout(r, 300));
      const chapterBadge = await evalJs(`document.getElementById('demo-step-badge').textContent`);
      console.log('Chapter Badge after click:', chapterBadge);

      // Capture Demo Modal screenshot
      await captureShot('C:/Users/SDF/.gemini/antigravity/brain/8059829a-cd7a-4f8d-9253-5eee6b9e1aa2/demo-modal.png');

      // Close Demo Modal
      await evalJs(`document.getElementById('close-demo-btn').click()`);
      const modalClosed = await evalJs(`document.getElementById('demo-modal').open`);
      console.log('Demo Modal Open after close:', modalClosed);

      // 6. Test Form Validation & Submission
      // Test Invalid email
      await evalJs(`
        const input = document.getElementById('user-email');
        input.value = 'invalid-email';
        document.getElementById('signup-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      `);
      const errorText = await evalJs(`document.getElementById('email-error').textContent`);
      console.log('Form Error Text for invalid email:', errorText);

      // Test Valid email
      await evalJs(`
        const input = document.getElementById('user-email');
        input.value = 'alex.chen@innovate.io';
        document.getElementById('signup-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      `);

      // Wait 1s for submission simulation
      await new Promise(r => setTimeout(r, 1100));
      const successHidden = await evalJs(`document.getElementById('form-success').hidden`);
      const confirmedEmail = await evalJs(`document.getElementById('confirmed-email').textContent`);
      console.log('Form Success Banner Status:', { hidden: successHidden, email: confirmedEmail });

      // 7. Test Mobile Viewport (iPhone 14 / 390x844)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await new Promise(r => setTimeout(r, 500));

      // Test Mobile Navigation Hamburger Drawer
      await evalJs(`document.getElementById('menu-toggle').click()`);
      const menuExpanded = await evalJs(`document.getElementById('menu-toggle').getAttribute('aria-expanded')`);
      const navOpen = await evalJs(`document.getElementById('mobile-nav').classList.contains('open')`);
      console.log('Mobile Hamburger Menu Open:', { expanded: menuExpanded, open: navOpen });

      await captureShot('C:/Users/SDF/.gemini/antigravity/brain/8059829a-cd7a-4f8d-9253-5eee6b9e1aa2/mobile-drawer.png');

      // Close Hamburger Menu
      await evalJs(`document.getElementById('menu-toggle').click()`);

      // Scroll to pricing on mobile and capture viewport
      await evalJs(`document.getElementById('pricing').scrollIntoView()`);
      await new Promise(r => setTimeout(r, 500));
      await captureShot('C:/Users/SDF/.gemini/antigravity/brain/8059829a-cd7a-4f8d-9253-5eee6b9e1aa2/mobile-pricing-view.png');

      // Scroll to FAQ on mobile and capture viewport
      await evalJs(`document.getElementById('faq').scrollIntoView()`);
      await new Promise(r => setTimeout(r, 500));
      await captureShot('C:/Users/SDF/.gemini/antigravity/brain/8059829a-cd7a-4f8d-9253-5eee6b9e1aa2/mobile-faq-view.png');

      // Scroll to CTA on mobile and capture viewport
      await evalJs(`document.getElementById('cta').scrollIntoView()`);
      await new Promise(r => setTimeout(r, 500));
      await captureShot('C:/Users/SDF/.gemini/antigravity/brain/8059829a-cd7a-4f8d-9253-5eee6b9e1aa2/mobile-cta-view.png');

      console.log('All tests completed successfully!');
      ws.close();
      process.exit(0);
    } catch (err) {
      console.error('Error during testing:', err);
      process.exit(1);
    }
  };
}

run().catch(console.error);
