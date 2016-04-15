'use strict';

var proxyquire = require('proxyquire').noCallThru();
var should = require('should');
var listSubscriptions = (topicName, cb) => {
  return cb(null, [{
    TopicName: 'foo-topic',
    SubscriptionName: 'foo-subscription'
  }]);
};

var subscriptions;

describe('subscriptions tests', () => {
  var metrics = [];

  beforeEach(() => {
    metrics = [];
    subscriptions = proxyquire('../lib/subscriptions', {
      './statsdLogger': {
        subscription: (t) => { metrics.push(t); }
      }
    });
  });

  it('should decorate the topic with tags', () => {
    subscriptions([{
      TopicName: 'foo-topic'
    }], {
      listSubscriptions: listSubscriptions,
      ignoredsubscriptions: [],
      tags: {
        foo: 'bar'
      }
    }, () => {
      metrics[0].tags.foo.should.equal('bar');
    });
  });

  it('should decorate the topic with the prefix', () => {
    subscriptions([{
      TopicName: 'foo-topic'
    }], {
      listSubscriptions: listSubscriptions,
      ignoredsubscriptions: [],
      tags: {},
      prefix: 'boo'
    }, () => {
      metrics[0].prefix.should.equal('boo');
    });
  });
  
  it('should not send ignored subscriptions', () => {
    subscriptions([{
      TopicName: 'foo-topic'
    }], {
      listSubscriptions: listSubscriptions,
      ignoredsubscriptions: [ 'foo' ],
      tags: {}
    }, () => {
      metrics.length.should.equal(0);
    });
  });
});
