'use strict';

var async = require('async');
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

var azuresbServers = require(path.join(configDir, 'azure-sb.json')).map((c) => {
  var client = azuresb.createServiceBusService(`Endpoint=${c.endpoint};SharedAccessKeyName=${c.keyname};SharedAccessKey=${c.key}`);
  client.endpoint = c.endpoint;
  client.tags = c.tags;
  client.prefix = c.prefix;
  client.queues = c.queues;
  client.topics = c.topics;
  client.ignoredsubscriptions = c.ignoredsubscriptions;

  if(!client.queues && !client.topics){
    util.log(`[${c.endpoint}]: WARN queues = false, topics = false, not doing anything`);
  }

  return client;
});

azuresbServers.prototype.ignoredsubscriptions = []

azuresbServers.forEach((c) => {
  setInterval(() => {
    if(c.queues){
      queues(c, (err, qs) => {
        if(err){
          util.log(`[${c.endpoint}]: ${err.toString()}`);
          return;
        }
      });
    }

    if(c.topics){
      topics(c, (err, ts) => {
        if(err){
          util.log(`[${c.endpoint}]: ${err.toString()}`);
          return;
        }

        async.forEach(ts, (topic, done) => {
          subscriptions(topic, c, done);
        }, (err) => {
          if(err){
            util.log(`[${c.endpoint}]: ${err.toString()}`);
          }
        });
      });
    }
  }, (statsConfig.interval || 10) * 1000);
});
