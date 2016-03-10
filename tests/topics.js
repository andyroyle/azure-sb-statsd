'use strict';

var proxyquire = require('proxyquire').noCallThru();
var should = require('should');

var listTopics = (cb) => {
  return cb(null, [{
    TopicName: 'foo-topic',
    MaxSizeInMegabytes: 12,
    SizeInBytes: 6 * 1024 * 1024
  }]);
};

var topics;

describe('topics tests', () => {
  var metrics = [];

  beforeEach(() => {
    metrics = [];
    topics = proxyquire('../lib/topics', {
      './statsdLogger': {
        topic: (t) => { metrics.push(t); }
      }
    });
  });

  it('should calculate PercentUsed', () => {
    topics({
      listTopics: listTopics,
      tags: {}
    }, () => {
      metrics[0].PercentUsed.should.equal((0.5).toFixed(5));
    });


  });

  it('should decorate the topic with tags', () => {
    topics({
      listTopics: listTopics,
      tags: {
        foo: 'bar'
      }
    }, () => {
      metrics[0].tags.foo.should.equal('bar');
    });
  });

  it('should decorate the topic with the prefix', () => {
    topics({
      listTopics: listTopics,
      tags: {},
      prefix: 'boo'
    }, () => {
      metrics[0].prefix.should.equal('boo');
    });
  });
});
