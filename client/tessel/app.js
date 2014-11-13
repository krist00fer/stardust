var tessel = require('tessel');
var https = require('https');
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['A']);

var namespace = 'stardust';
var hubname = 'stardust';
var deviceName = 'TM-00-04-f000da30-0061473d-36582586'; // tessel.deviceId();
console.log('deviceName:', deviceName);

// SharedAccessSignature sr=https%3A%2F%2Fstardust.servicebus.windows.net%2Fstardust%2Fpublishers%2FTM-00-04-f000da30-0061473d-36582586%2Fmessages&sig=J5UuDPHYsZ7F%2FYMEyvBSBnS9WOY5KisR78YtdTu7rqk%3D&se=1417774602&skn=RootManageSharedAccessKey
var sas = 'SharedAccessSignature sr=https%3A%2F%2Fstardust.servicebus.windows.net%2Fstardust%2Fpublishers%2FTM-00-04-f000da30-0061473d-36582586%2Fmessages&sig=WFPkJvHedoWgAPUnCBmeKytwtA7s26qkTwq4Ku%2FJ5W0%3D&se=1416766359&skn=RootManageSharedAccessKey';

var samples = [];

ambient.on('ready', function () {

  setImmediate(sampleSoundLevel);
  setTimeout(sendToCloud, 500);

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
  var jsonAvg = JSON.stringify(avg);

  samples.length = 0;

  console.log('Avg sound level:', avg, 'Samples:', noSamples);

  sendToEventHub(namespace, hubname, deviceName, sas, jsonAvg, 'application/json', function(error, result) {
    if (!error) {
      console.log('INFO Message sent\n');
    } else {
      console.log('ERROR Could not send data to event hub');
      console.log(error);
    }

    setTimeout(sendToCloud, 500);

  });
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

  console.log('INFO Sending data to Event Hub');
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

  req.on('error', function(error) {
    callback(error, null);
  });

  req.write(content);
  req.end();

}






// ***

// // Payload to send
// var payload = '{\"Temperature\":\"37.0\",\"Humidity\":\"0.4\"}';

 
// // Send the request to the Event Hub
// var options = {
//   hostname: namespace + '.servicebus.windows.net',
//   port: 443,
//   path: '/' + hubname + '/publishers/' + deviceName + '/messages',
//   method: 'POST',
//   headers: {
//     'Authorization': createdSAS,
//     'Content-Length': payload.length,
//     'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
//   }
// };

// var req = https.request(options, function(res) {
//   console.log('----------------------------------------------------------------------');
//   console.log("statusCode: ", res.statusCode);
//   console.log('----------------------------------------------------------------------');
//   console.log('');
//   res.on('data', function(d) {
//     process.stdout.write(d);
//   });
// });
 
// req.on('error', function(e) {
//   console.log('error');
//   console.error(e);
// });
 
// req.write(payload);
// req.end();