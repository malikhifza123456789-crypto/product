const http = require('http');

async function capture() {
  // 1. Fetch webSocketDebuggerUrl from Chrome
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = list.find(item => item.type === 'page');
  if (!page) {
    console.error('No page found');
    process.exit(1);
  }

  console.log('Connecting to page:', page.webSocketDebuggerUrl);
  // We can use standard WebSocket in Node 24!
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

  ws.onopen = async () => {
    try {
      await send('Page.enable');
      await send('DOM.enable');

      // Set viewport for desktop
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Page.navigate', { url: 'http://localhost:3000' });
      await new Promise(r => setTimeout(r, 1500));

      // Trigger scroll animations so everything is visible
      await send('Runtime.evaluate', {
        expression: `
          document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('in-view'));
        `
      });

      await new Promise(r => setTimeout(r, 500));

      // Capture full page screenshot
      const { data: fullPageData } = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true
      });

      const fs = require('fs');
      fs.writeFileSync('screenshot-full-desktop.png', Buffer.from(fullPageData, 'base64'));
      console.log('Saved screenshot-full-desktop.png');

      // Now set viewport for mobile (iPhone 14 / 390x844)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });

      await new Promise(r => setTimeout(r, 1000));

      const { data: mobileData } = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true
      });

      fs.writeFileSync('screenshot-full-mobile.png', Buffer.from(mobileData, 'base64'));
      console.log('Saved screenshot-full-mobile.png');

      // Test Light Theme on Desktop
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Runtime.evaluate', {
        expression: `
          document.getElementById('theme-toggle').click();
        `
      });

      await new Promise(r => setTimeout(r, 600));

      const { data: lightData } = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true
      });

      fs.writeFileSync('screenshot-full-light.png', Buffer.from(lightData, 'base64'));
      console.log('Saved screenshot-full-light.png');

      ws.close();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
}

capture().catch(console.error);
