'use strict';

var util = require('util');
var statsd = require('./statsdLogger');

var decorate = (s, c) => {
  s.tags = c.tags || {};
  s.prefix = c.prefix;
  return s;
};

module.exports = (topic, client, done) => {
  client.listSubscriptions(topic.TopicName, (err, subs) => {
    if(err){
      return done(err);
    }

    subs.forEach((s) => {
      statsd.subscription(decorate(s, client));
    });

    return done();
  });
};
