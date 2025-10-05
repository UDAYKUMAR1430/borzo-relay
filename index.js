const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json({limit: '200kb'}));

const BORZO_TOKEN = process.env.BORZO_TOKEN || '';
const PROXY_KEY = process.env.PROXY_KEY || 'change_this_secret_long';

if (!BORZO_TOKEN) console.warn('BORZO_TOKEN not set in env');

app.post('/relay/create-order', async (req, res) => {
  try {
    const key = req.headers['x-proxy-key'] || req.query.key;
    if (!key || key !== PROXY_KEY) return res.status(403).json({ error: 'forbidden' });

    const borzoUrl = 'https://robot.borzo.in/api/business/1.2/create-order';
    const resp = await fetch(borzoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DV-Auth-Token': BORZO_TOKEN
      },
      body: JSON.stringify(req.body),
      timeout: 20000
    });
    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (err) {
    console.error('relay error', err && (err.stack || err.toString()));
    res.status(500).json({ error: err.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Relay started on', port));
