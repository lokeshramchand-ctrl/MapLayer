require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const { client, requestCounter, responseHistogram } = require('./metrics');
const { topicIndex, getBaseRadius } = require('./topics');
const { makeKey, getCached, setCached } = require('./cache');

const app = express();

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || '*',
  credentials: false,
}));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

/**
 * /api/layer
 * query: topic, lon, lat, radius?
 * Validates topic, uses default radius if missing,
 * builds the SANDAG GeoJSON URL server-side,
 * proxies the result.
 */
app.get('/api/layer', async (req, res) => {
  try {
    const { topic, lon, lat } = req.query;
    let { radius } = req.query;

    if (!topic || !lon || !lat) {
      return res.status(400).json({ error: 'Missing topic, lon, or lat' });
    }

    if (!topicIndex.has(topic)) {
      return res.status(400).json({ error: `Unknown topic: ${topic}` });
    }

    const defaultRadius = getBaseRadius(topic);
    radius = radius ? Number(radius) : defaultRadius;

    if (!Number.isFinite(Number(lon)) || !Number.isFinite(Number(lat)) || !Number.isFinite(radius)) {
      return res.status(400).json({ error: 'Invalid lon/lat/radius' });
    }

    const cacheKey = makeKey({ topic, lon, lat, radius });
    const cached = getCached(cacheKey);
    if (cached) {
      // count & return cached response quickly
      requestCounter.labels(topic).inc();
      return res.json(cached);
    }

    const url =
      `https://geo.sandag.org/server/rest/services/Hosted/${encodeURIComponent(topic)}/FeatureServer/0/query` +
      `?geometry=${encodeURIComponent(`${lon},${lat}`)}` +
      `&geometryType=esriGeometryPoint` +
      `&inSR=4326` +
      `&spatialRel=esriSpatialRelIntersects` +
      `&distance=${radius}` +
      `&units=esriSRUnit_Meter` +
      `&outFields=*` +
      `&returnGeometry=true` +
      `&f=geojson`;

    const endTimer = responseHistogram.labels(topic).startTimer();
    requestCounter.labels(topic).inc();

    const upstream = await fetch(url, { timeout: Number(process.env.FETCH_TIMEOUT_MS || 15000) });
    if (!upstream.ok) {
      endTimer();
      return res.status(upstream.status).json({ error: `Upstream error ${upstream.status}` });
    }

    const data = await upstream.json();
    endTimer();

    setCached(cacheKey, data);

    res.json(data);
  } catch (err) {
    console.error('Error in /api/layer:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Prometheus metrics
app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`Backend listening on :${PORT}`);
});
