const topics = require('./layers');

const topicIndex = new Map(topics.map(t => [t.topic, t]));

function getBaseRadius(topic) {
  const t = topicIndex.get(topic);
  return t ? t.radius : null;
}

module.exports = { topicIndex, getBaseRadius };
