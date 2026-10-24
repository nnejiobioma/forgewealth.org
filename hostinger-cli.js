/**
 * Hostinger API Utility for Smart Tech Reviews / ForgeWealth
 * Securely uses the API token saved in .env to interact with developers.hostinger.com
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  });
  return env;
}

const env = loadEnv();
const TOKEN = env.HOSTINGER_API_TOKEN || process.env.HOSTINGER_API_TOKEN;

if (!TOKEN) {
  console.error('Error: HOSTINGER_API_TOKEN not found in .env');
  process.exit(1);
}

function request(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'developers.hostinger.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  const cmd = process.argv[2] || 'status';

  console.log('--- Connecting to Hostinger API ---');

  if (cmd === 'status') {
    const orders = await request('GET', '/api/hosting/v1/orders');
    console.log('\n[1] Hosting Orders:');
    console.dir(orders.data, { depth: null });

    const domains = await request('GET', '/api/domains/v1/portfolio');
    console.log('\n[2] Domain Portfolio:');
    console.dir(domains.data, { depth: null });

    const websites = await request('GET', '/api/hosting/v1/websites');
    console.log('\n[3] Active Websites:');
    console.dir(websites.data, { depth: null });
  } else if (cmd === 'onboard-empty') {
    const domain = process.argv[3] || env.HOSTINGER_DOMAIN || 'forgewealth.org';
    const orderId = env.HOSTINGER_ORDER_ID || '1009687632';

    console.log(`\nStarting website setup for domain "${domain}" on order ${orderId}...`);
    const res = await request('POST', `/api/hosting/v1/orders/${orderId}/onboardings`, {
      domain: domain,
      type: null // empty website for static HTML/CSS/JS deployment
    });

    console.log('Result:', res);
  } else {
    console.log(`Unknown command: ${cmd}`);
    console.log('Usage: node hostinger-cli.js [status|onboard-empty]');
  }
}

main().catch(err => console.error('Error:', err.message));
