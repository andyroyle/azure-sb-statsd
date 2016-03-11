Azure-SB StatsD [![Build Status](https://travis-ci.org/andyroyle/azure-sb-statsd.svg?branch=master)](https://travis-ci.org/andyroyle/azure-sb-statsd)
---

A little app that will poll one or more azure-servicebus endpoints and push their statistics out to statsd.

```
npm i -g azure-sb-statsd
azure-sb-statsd /path/to/config/files/
```

###Gauges

Queue

- sizeinbytes
- percentused (calculated from MaxSizeInMegabytes and SizeInBytes)
- activemessagecount
- deadlettermessagecount
- scheduledmessagecount
- transfermessagecount
- transferdeadlettermessagecount

Topic

- subscriptioncount
- sizeinbytes
- percentused (calculated from MaxSizeInMegabytes and SizeInBytes)

Subscription

- activemessagecount
- deadlettermessagecount
- scheduledmessagecount
- transfermessagecount
- transferdeadlettermessagecount

###Config Files

###azure-sb.json
```javascript
[
  {
    "host": "https://my.servicebus.windows.net",
    "key": "accesskey",
    "keyname": "RootManageSharedAccessKey", // chances are you'll need to use the rootmanage key
    "queues": true,                         // log info for queues
    "topics": true,                         // log info for topics (and subscriptions)
    "prefix": "foo.bar.azuresb.yay",        // optional prefix for metrics from this instance
    "tags": {                               // optional, tags are supported by the influxdb backend
      "foo": "bar"
    }
  },
  {
     //...
  }
]
```

###statsd.json
```javascript
{
  "host": "localhost",
  "port": 8125,          // default: 8125
  "interval": 10,        // how often to poll the azuresb servers, default: 10 seconds
  "debug": true,         // show debug output from the statsd client
  "prefix": "my.stats"   // global prefix for metrics
}
```
