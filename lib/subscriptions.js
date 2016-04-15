'use strict';

var util = require('util');
var statsd = require('./statsdLogger');

var decorate = (s, c) => {
  s.tags = c.tags || {};
  s.prefix = c.prefix;
  return s;
};

var isIgnored = (s, ignoredsubscriptions) => {
  ignoredsubscriptions.forEach((subscriptionPattern)=> {
    var regex = new RegExp(subscriptionPattern);
    if (regex.test(s.SubscriptionName)){
      return true;
    }
  });
  
  return false;
};

module.exports = (topic, client, done) => {
  client.listSubscriptions(topic.TopicName, (err, subs) => {
    if(err){
      return done(err);
    }

    subs.forEach((s) => {
      if (!isIgnored(s, client.ignoredsubscriptions)){
        statsd.subscription(decorate(s, client));
      }
    });

    return done();
  });
};
