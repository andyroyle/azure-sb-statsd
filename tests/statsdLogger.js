'use strict';

var proxyquire = require('proxyquire').noCallThru();
var should = require('should');
var statsdLogger;

describe('statsdLogger tests', () => {
  var metrics = [];

  function Client() {}
  Client.prototype.gauge = (m, v) => {
    metrics.push({ m: m, v: v });
  };

  beforeEach(() => {
    metrics = [];
    statsdLogger = proxyquire('../lib/statsdLogger', {
      'statsd': {
        host: 'foo'
      },
      'statsd-client': Client,
      './gauges': {
        topic: [ 'SizeInBytes', 'SubscriptionCount', 'PercentUsed' ],
        subscription: [ 'baz', 'flarg' ]
      },
      path: {
        resolve: (a) => { return a; },
        join: (a, b) => { return b; }
      }
    });
  });

  describe('logging a subscription', () => {
    it('should log all the given fields', () => {
      statsdLogger.subscription({
        TopicName: 'foo-topic',
        SubscriptionName: 'foo-subscription',
        CountDetails: {
          'd2p1:baz': 1,
          'd2p1:flarg': 2
        }
      });
      metrics.length.should.equal(2);
      metrics[0].m.should.equal('foo-topic.foo-subscription.baz');
      metrics[0].v.should.equal(1);
      metrics[1].m.should.equal('foo-topic.foo-subscription.flarg');
      metrics[1].v.should.equal(2);
    });

    it('should log missing fields as zero', () => {
      statsdLogger.subscription({
        TopicName: 'foo-topic',
        SubscriptionName: 'foo-subscription',
        CountDetails: {}
      });
      metrics.length.should.equal(2);
      metrics.forEach(function(f){
        f.v.should.equal(0);
      });
    });

    it('should append given tags', () => {
      statsdLogger.subscription({
        TopicName: 'foo-topic',
        SubscriptionName: 'foo-subscription',
        CountDetails: {
          'd2p1:baz': 1,
          'd2p1:flarg': 2
        },
        tags: {
          'foo': 'bar',
          'flarg': 'baz'
        }
      });
      metrics.length.should.equal(2);
      metrics[0].m.should.equal('foo-topic.foo-subscription.baz,foo=bar,flarg=baz');
      metrics[1].m.should.equal('foo-topic.foo-subscription.flarg,foo=bar,flarg=baz');
    });

    it('should use instance prefix', () => {
      statsdLogger.subscription({
        TopicName: 'foo-topic',
        SubscriptionName: 'foo-subscription',
        CountDetails: {
          'd2p1:baz': 1,
          'd2p1:flarg': 2
        },
        prefix: 'boo'
      });
      metrics.length.should.equal(2);
      metrics[0].m.should.equal('boo.foo-topic.foo-subscription.baz');
      metrics[1].m.should.equal('boo.foo-topic.foo-subscription.flarg');
    });
  });

  describe('logging a topic', () => {
    it('should log all the given fields', () => {
      statsdLogger.topic({
        TopicName: 'foo-topic',
        MaxSizeInMegabytes: 12,
        SizeInBytes: 13,
        SubscriptionCount: 2
      });
      metrics.length.should.equal(3);
      metrics[0].m.should.equal('foo-topic.sizeinbytes');
      metrics[0].v.should.equal(13);
      metrics[1].m.should.equal('foo-topic.subscriptioncount');
      metrics[1].v.should.equal(2);
      metrics[2].m.should.equal('foo-topic.percentused');
      metrics[2].v.should.equal(0);
    });

    it('should log missing fields as zero', () => {
      statsdLogger.topic({
        TopicName: 'foo-topic',
      });
      metrics.length.should.equal(3);
      metrics.forEach(function(f){
        f.v.should.equal(0);
      });
    });

    it('should append given tags', () => {
      statsdLogger.topic({
        TopicName: 'foo-topic',
        MaxSizeInMegabytes: 12,
        SizeInBytes: 13,
        SubscriptionCount: 2,
        tags: {
          'foo': 'bar',
          'flarg': 'baz'
        }
      });
      metrics.length.should.equal(3);
      metrics[0].m.should.equal('foo-topic.sizeinbytes,foo=bar,flarg=baz');
      metrics[1].m.should.equal('foo-topic.subscriptioncount,foo=bar,flarg=baz');
      metrics[2].m.should.equal('foo-topic.percentused,foo=bar,flarg=baz');
    });

    it('should use instance prefix', () => {
      statsdLogger.topic({
        TopicName: 'foo-topic',
        MaxSizeInMegabytes: 12,
        SizeInBytes: 13,
        SubscriptionCount: 2,
        prefix: 'boo'
      });
      metrics.length.should.equal(3);
      metrics[0].m.should.equal('boo.foo-topic.sizeinbytes');
      metrics[1].m.should.equal('boo.foo-topic.subscriptioncount');
      metrics[2].m.should.equal('boo.foo-topic.percentused');
    });
  });
});
