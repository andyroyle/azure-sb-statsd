'use strict';

var Async = require('async');
var azuresb = require('azure-sb');
var path = require('path');
var util = require('util');

var topics = require('./lib/topics');
var subscriptions = require('./lib/subscriptions');
var queues = require('./lib/queues');

var configDir = path.resolve(process.argv[2] || './');
var statsConfig = require(path.join(configDir, 'statsd'));

util.log('starting...');
util.log(`using config from ${configDir}`);

var createRegex = (patterns) => {
  return patterns.map((p) => {
    return new RegExp(p, 'i');
  });
};

var azuresbServers = require(path.join(configDir, 'azure-sb.json')).map((c) => {
  var client = azuresb.createServiceBusService(`Endpoint=${c.endpoint};SharedAccessKeyName=${c.keyname};SharedAccessKey=${c.key}`);
  client.endpoint = c.endpoint;
  client.tags = c.tags;
  client.prefix = c.prefix;
  client.queues = c.queues;
  client.topics = c.topics;
  client.ignoredsubscriptions = createRegex(c.ignoredsubscriptions || [])

  if(!client.queues && !client.topics){
    util.log(`[${c.endpoint}]: WARN queues = false, topics = false, not doing anything`);
  }

  return client;
});

var execute = (c, finished) => {
  if(!c.queues && !c.topics){
    return finished();
  }

  if(c.queues){
    queues(c, (err, qs) => {
      if(err){
        return finished(err);
      }
    });
  }

  if(c.topics){
    topics(c, (err, ts) => {
      if(err){
        return finished(err);
      }

      Async.forEach(ts, (topic, done) => {
        subscriptions(topic, c, done);
      }, (err) => {
        return finished(err);
      });
    });
  }
};

var interval = (statsConfig.interval || 10) * 1000;

azuresbServers.forEach((c) => {
  var running = false;
  setInterval(() => {

    if(running){
      util.log(`[${c.endpoint}] previous operation still in process`);
      return;
    }

    running = true;
    execute(c, (err) => {
      if(err){
        util.log(`[${c.endpoint}]: ${err.toString()}`);
      }
      running = false;
    });

  }, interval);
});
