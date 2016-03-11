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
        queue: [ 'SizeInBytes', 'PercentUsed' ],
        countdetails: [ 'baz', 'flarg' ]
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
      metrics[0].m.should.equal('topics.foo-topic.foo-subscription.baz');
      metrics[0].v.should.equal(1);
      metrics[1].m.should.equal('topics.foo-topic.foo-subscription.flarg');
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
      metrics[0].m.should.equal('topics.foo-topic.foo-subscription.baz,foo=bar,flarg=baz');
      metrics[1].m.should.equal('topics.foo-topic.foo-subscription.flarg,foo=bar,flarg=baz');
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
      metrics[0].m.should.equal('boo.topics.foo-topic.foo-subscription.baz');
      metrics[1].m.should.equal('boo.topics.foo-topic.foo-subscription.flarg');
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
      metrics[0].m.should.equal('topics.foo-topic.sizeinbytes');
      metrics[0].v.should.equal(13);
      metrics[1].m.should.equal('topics.foo-topic.subscriptioncount');
      metrics[1].v.should.equal(2);
      metrics[2].m.should.equal('topics.foo-topic.percentused');
      metrics[2].v.should.equal(0);
    });

    it('should log missing fields as zero', () => {
      statsdLogger.topic({
        TopicName: 'foo-queue'
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
        CountDetails: {},
        tags: {
          'foo': 'bar',
          'flarg': 'baz'
        }
      });
      metrics.length.should.equal(3);
      metrics[0].m.should.equal('topics.foo-topic.sizeinbytes,foo=bar,flarg=baz');
      metrics[1].m.should.equal('topics.foo-topic.subscriptioncount,foo=bar,flarg=baz');
      metrics[2].m.should.equal('topics.foo-topic.percentused,foo=bar,flarg=baz');
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
      metrics[0].m.should.equal('boo.topics.foo-topic.sizeinbytes');
      metrics[1].m.should.equal('boo.topics.foo-topic.subscriptioncount');
      metrics[2].m.should.equal('boo.topics.foo-topic.percentused');
    });
  });

  describe('logging a queue', () => {
    it('should log all the given fields', () => {
      statsdLogger.queue({
        QueueName: 'foo-queue',
        MaxSizeInMegabytes: 12,
        SizeInBytes: 13,
        SubscriptionCount: 2,
        CountDetails: {
          'd2p1:baz': 1,
          'd2p1:flarg': 2
        }
      });
      metrics.length.should.equal(4);
      metrics[0].m.should.equal('queues.foo-queue.sizeinbytes');
      metrics[0].v.should.equal(13);
      metrics[1].m.should.equal('queues.foo-queue.percentused');
      metrics[1].v.should.equal(0);
      metrics[2].m.should.equal('queues.foo-queue.baz');
      metrics[2].v.should.equal(1);
      metrics[3].m.should.equal('queues.foo-queue.flarg');
      metrics[3].v.should.equal(2);
    });

    it('should log missing fields as zero', () => {
      statsdLogger.queue({
        QueueName: 'foo-queue',
        CountDetails: {}
      });
      metrics.length.should.equal(4);
      metrics.forEach(function(f){
        f.v.should.equal(0);
      });
    });

    it('should append given tags', () => {
      statsdLogger.queue({
        QueueName: 'foo-queue',
        MaxSizeInMegabytes: 12,
        SizeInBytes: 13,
        SubscriptionCount: 2,
        CountDetails: {},
        tags: {
          'foo': 'bar',
          'flarg': 'baz'
        }
      });
      metrics.length.should.equal(4);
      metrics[0].m.should.equal('queues.foo-queue.sizeinbytes,foo=bar,flarg=baz');
      metrics[1].m.should.equal('queues.foo-queue.percentused,foo=bar,flarg=baz');
      metrics[2].m.should.equal('queues.foo-queue.baz,foo=bar,flarg=baz');
      metrics[3].m.should.equal('queues.foo-queue.flarg,foo=bar,flarg=baz');
    });

    it('should use instance prefix', () => {
      statsdLogger.queue({
        QueueName: 'foo-queue',
        MaxSizeInMegabytes: 12,
        SizeInBytes: 13,
        SubscriptionCount: 2,
        CountDetails: {},
        prefix: 'boo'
      });
      metrics.length.should.equal(4);
      metrics[0].m.should.equal('boo.queues.foo-queue.sizeinbytes');
      metrics[1].m.should.equal('boo.queues.foo-queue.percentused');
      metrics[2].m.should.equal('boo.queues.foo-queue.baz');
      metrics[3].m.should.equal('boo.queues.foo-queue.flarg');
    });
  });
});
