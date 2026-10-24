/**
 * Deploy website files directly to Hostinger public_html using the official Hostinger API
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

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
const TOKEN = env.HOSTINGER_API_TOKEN;
const USERNAME = 'u815431668';
const DOMAIN = 'forgewealth.org';

function apiRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'developers.hostinger.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function uploadTusFile(uploadBaseUrl, authKey, restAuthKey, relativePath, localFilePath) {
  return new Promise((resolve, reject) => {
    const fileBytes = fs.readFileSync(localFilePath);
    const fileSize = fileBytes.length;
    const targetUrl = new URL(`${uploadBaseUrl}/${relativePath}?override=true`);
    const isHttps = targetUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    // Step 1: Create TUS Upload (POST)
    const postOptions = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (isHttps ? 443 : 80),
      path: targetUrl.pathname + targetUrl.search,
      method: 'POST',
      headers: {
        'X-Auth': authKey,
        'X-Auth-Rest': restAuthKey,
        'Tus-Resumable': '1.0.0',
        'Upload-Length': fileSize.toString(),
        'Upload-Offset': '0'
      }
    };

    const postReq = client.request(postOptions, (postRes) => {
      if (postRes.statusCode !== 201 && postRes.statusCode !== 200 && postRes.statusCode !== 204) {
        return reject(new Error(`TUS POST failed with status ${postRes.statusCode}`));
      }

      // Step 2: Upload Data (PATCH)
      const patchOptions = {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (isHttps ? 443 : 80),
        path: targetUrl.pathname + targetUrl.search,
        method: 'PATCH',
        headers: {
          'X-Auth': authKey,
          'X-Auth-Rest': restAuthKey,
          'Tus-Resumable': '1.0.0',
          'Content-Type': 'application/offset+octet-stream',
          'Upload-Offset': '0',
          'Content-Length': fileSize
        }
      };

      const patchReq = client.request(patchOptions, (patchRes) => {
        if (patchRes.statusCode === 204 || patchRes.statusCode === 200) {
          resolve(true);
        } else {
          reject(new Error(`TUS PATCH failed with status ${patchRes.statusCode}`));
        }
      });

      patchReq.on('error', reject);
      patchReq.write(fileBytes);
      patchReq.end();
    });

    postReq.on('error', reject);
    postReq.end();
  });
}

async function deploy() {
  console.log(`[1] Requesting file upload credentials for ${DOMAIN} (username: ${USERNAME})...`);
  const creds = await apiRequest('POST', '/api/hosting/v1/files/upload-urls', {
    username: USERNAME,
    domain: DOMAIN
  });

  if (!creds.url || !creds.auth_key) {
    throw new Error(`Failed to get credentials: ${JSON.stringify(creds)}`);
  }

  console.log(`[2] Credentials received. Uploading site files to public_html...`);

  const filesToUpload = [
    { rel: 'index.html', local: path.join(__dirname, 'index.html') },
    { rel: 'review-hostinger.html', local: path.join(__dirname, 'review-hostinger.html') },
    { rel: 'hosting.html', local: path.join(__dirname, 'hosting.html') },
    { rel: 'gadgets.html', local: path.join(__dirname, 'gadgets.html') },
    { rel: 'about.html', local: path.join(__dirname, 'about.html') },
    { rel: 'disclosure.html', local: path.join(__dirname, 'disclosure.html') },
    { rel: 'styles.css', local: path.join(__dirname, 'styles.css') },
    { rel: 'app.js', local: path.join(__dirname, 'app.js') },
    { rel: 'assets/logo.png', local: path.join(__dirname, 'assets', 'logo.png') },
    { rel: 'assets/hosting-cloud.jpg', local: path.join(__dirname, 'assets', 'hosting-cloud.jpg') },
    { rel: 'assets/tech-gear.jpg', local: path.join(__dirname, 'assets', 'tech-gear.jpg') }
  ];

  for (const f of filesToUpload) {
    process.stdout.write(`Uploading ${f.rel}... `);
    try {
      await uploadTusFile(creds.url, creds.auth_key, creds.rest_auth_key, f.rel, f.local);
      console.log('✓ Success');
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
    }
  }

  console.log(`\n🎉 Deployment Complete! Site is live on Hostinger for ${DOMAIN}`);
}

deploy().catch(err => console.error('Deployment error:', err.message));
