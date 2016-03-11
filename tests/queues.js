'use strict';

var proxyquire = require('proxyquire').noCallThru();
var should = require('should');

var listQueues = (cb) => {
  return cb(null, [{
    QueueName: 'foo-queue',
    MaxSizeInMegabytes: 12,
    SizeInBytes: 6 * 1024 * 1024
  }]);
};

var topics;

describe('queues tests', () => {
  var metrics = [];

  beforeEach(() => {
    metrics = [];
    topics = proxyquire('../lib/queues', {
      './statsdLogger': {
        queue: (q) => { metrics.push(q); }
      }
    });
  });

  it('should calculate PercentUsed', () => {
    topics({
      listQueues: listQueues,
      tags: {}
    }, () => {
      metrics[0].PercentUsed.should.equal((0.5).toFixed(5));
    });


  });

  it('should decorate the topic with tags', () => {
    topics({
      listQueues: listQueues,
      tags: {
        foo: 'bar'
      }
    }, () => {
      metrics[0].tags.foo.should.equal('bar');
    });
  });

  it('should decorate the topic with the prefix', () => {
    topics({
      listQueues: listQueues,
      tags: {},
      prefix: 'boo'
    }, () => {
      metrics[0].prefix.should.equal('boo');
    });
  });
});
