const client = require('prom-client');

// Create a global registry
client.collectDefaultMetrics();

// 🔢 Count number of requests per topic
const requestCounter = new client.Counter({
  name: 'geojson_requests_total',
  help: 'Total number of GeoJSON requests by topic',
  labelNames: ['topic'],
});

// ⏱️ Record response duration per topic
const responseHistogram = new client.Histogram({
  name: 'geojson_response_duration_seconds',
  help: 'Response duration (seconds) by topic',
  labelNames: ['topic'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

module.exports = {
  client,
  requestCounter,
  responseHistogram,
};
