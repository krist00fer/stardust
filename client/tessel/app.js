var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['A']);

var samples = [];

ambient.on('ready', function () {

  setImmediate(sampleSoundLevel);
  setTimeout(sendToCloud, 1000);

});

function sampleSoundLevel() {
  ambient.getSoundLevel(function (error, data) {
    if (!error) {
      // console.log('Sound level:', data);
      samples.push(data);

      setImmediate(sampleSoundLevel);
    }
  });
}

function sendToCloud() {
  var noSamples = samples.length;
  var sum = samples.reduce(function(a, b) { return a + b });
  var avg = sum / samples.length;

  samples.length = 0;

  console.log('Avg sound level:', avg, 'Samples:', noSamples);

  setTimeout(sendToCloud, 1000);
}

function sendToEventHub(namespace, hubname, deviceName, sas, content, contentType, callback) {

  var options = {
    hostname: namespace + '.servicebus.windows.net',
    port: 443,
    path: '/' + hubname + '/publishers/' + deviceName + '/messages',
    method: 'POST',
    headers: {
        'Authorization': sas,
        'Content-Length' : content.length,
        'Content-Type' : contentType,

        'Accept' : 'application/json'
    }
  };

  var req = https.request(options, function(res) {
  var body = '';

  console.log('INFO HTTP StatusCode:', res.statusCode);

  res.on('data', function(data) {
    body += data;
  });

  res.on('end', function() {
    callback(null, body);
  });
  });
}






***

// Payload to send
var payload = '{\"Temperature\":\"37.0\",\"Humidity\":\"0.4\"}';

 
// Send the request to the Event Hub
var options = {
  hostname: namespace + '.servicebus.windows.net',
  port: 443,
  path: '/' + hubname + '/publishers/' + deviceName + '/messages',
  method: 'POST',
  headers: {
    'Authorization': createdSAS,
    'Content-Length': payload.length,
    'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
  }
};

var req = https.request(options, function(res) {
  console.log('----------------------------------------------------------------------');
  console.log("statusCode: ", res.statusCode);
  console.log('----------------------------------------------------------------------');
  console.log('');
  res.on('data', function(d) {
    process.stdout.write(d);
  });
});
 
req.on('error', function(e) {
  console.log('error');
  console.error(e);
});
 
req.write(payload);
req.end();