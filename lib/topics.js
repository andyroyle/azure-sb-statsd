'use strict';

var util = require('util');
var async = require('async');
var statsd = require('./statsdLogger');

var decorate = (t, c) => {
  t.tags = c.tags || {};
  t.prefix = c.prefix;
  var maxSizeInBytes = parseInt(t.MaxSizeInMegabytes || '1') * 1024 * 1024;
  t.PercentUsed = (parseInt(t.SizeInBytes || '1') / (maxSizeInBytes)).toFixed(5);
  return t;
};

module.exports = (client, done) => {
  client.listTopics((err, topics) => {
    if(err){
      return done(err);
    }

    topics.forEach((t) => {
      statsd.topic(decorate(t, client));
    });

    return done(null, topics);
  });
};
