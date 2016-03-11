'use strict';

var gauges = require('./gauges');
var StatsD = require('statsd-client');
var path = require('path');
var configDir = path.resolve(process.argv[2] || './');
var statsConfig = require(path.join(configDir, 'statsd'));
var util = require('util');

var statsdClient = new StatsD({
  host: statsConfig.host,
  port: statsConfig.port,
  prefix: statsConfig.prefix,
  debug: statsConfig.debug || false
});

var buildTags = (tags) => {
  return Object
    .keys(tags || {})
    .map((k, v) => {
      return `${k}=${tags[k]}`;
    }).join(',');
};

var getPrefix = (prefix) => {
  var pre = '';

  if(prefix && prefix.length > 0){
    pre = `${prefix}.`;
  }

  return pre;
};

var getSuffix = (tags) => {
  var suffix = '';
  if(tags && Object.keys(tags).length > 0){
    suffix = `,${buildTags(tags)}`;
  }
  return suffix;
};

var logSubscription = (s, tags) => {
  var prefix = getPrefix(s.prefix);
  var suffix = getSuffix(tags);

  gauges.countdetails.map((f) => {
    return [
      `${prefix}topics.${s.TopicName.toLowerCase()}.${s.SubscriptionName.toLowerCase()}.${f.toLowerCase()}${suffix}`,
      s.CountDetails[`d2p1:${f}`] || 0
    ];
  }).forEach((f) => {
    statsdClient.gauge(f[0], f[1]);
  });
};

var logTopic = (t, tags) => {
  var prefix = getPrefix(t.prefix);
  var suffix = getSuffix(tags);
  gauges.topic.map((f) => {
    return [
      `${prefix}topics.${t.TopicName.toLowerCase()}.${f.toLowerCase()}${suffix}`,
      t[f] || 0
    ];
  }).forEach((f) => {
    statsdClient.gauge(f[0], f[1]);
  });
};

var logQueue = (q, tags) => {
  var prefix = `${getPrefix(q.prefix)}queues.${q.QueueName.toLowerCase()}`;
  var suffix = getSuffix(tags);

  var metrics = gauges.queue.map((f) => {
    return [
      `${prefix}.${f.toLowerCase()}${suffix}`,
      q[f] || 0
    ];
  });

  metrics = metrics.concat(gauges.countdetails.map((f) => {
    return [
      `${prefix}.${f.toLowerCase()}${suffix}`,
      q.CountDetails[`d2p1:${f}`] || 0
    ];
  }));

  metrics.forEach((f) => {
    statsdClient.gauge(f[0], f[1]);
  });
};

module.exports = {
  subscription: (subscription) => {
    logSubscription(subscription, subscription.tags);
  },
  topic: (topic) => {
    logTopic(topic, topic.tags);
  },
  queue: (queue) => {
    logQueue(queue, queue.tags);
  }
};
