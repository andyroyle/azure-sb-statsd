'use strict';

var util = require('util');
var statsd = require('./statsdLogger');

var decorate = (s, c) => {
  s.tags = c.tags || {};
  s.prefix = c.prefix;
  return s;
};

var validateSendSubscription = (s, ignoredsubscriptions) => {
  var send = true;
  ignoredsubscriptions.forEach((subscriptionPattern)=> {
    var regex = new RegExp(subscriptionPattern);
    if (regex.test(s.SubscriptionName)){
      send = false;
    }
  });
  
  return send;
}

module.exports = (topic, client, done) => {
  client.listSubscriptions(topic.TopicName, (err, subs) => {
    if(err){
      return done(err);
    }

    subs.forEach((s) => {     
      var send = validateSendSubscription(s, client.ignoredsubscriptions);
      if (send){
        statsd.subscription(decorate(s, client));
      }
    });

    return done();
  });
};
