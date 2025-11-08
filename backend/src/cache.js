const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 60_000);
const cache = new Map(); // key => { expiresAt, data }

function makeKey({ topic, lon, lat, radius }) {
  return `${topic}|${Number(lon).toFixed(6)}|${Number(lat).toFixed(6)}|${radius}`;
}

function getCached(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

function setCached(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

module.exports = { makeKey, getCached, setCached };
