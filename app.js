

// npm i azure-iot-device azure-iot-device-mqtt colors
require('colors');
var deviceConnectionString = 'HostName=demo-AzureIoTHub.azure-devices.net;DeviceId=mikael;SharedAccessKey=8R8GGoX4dFKr6s0b04kpzwEgAipuf+BmohJci00fOV0=';
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var deviceClient = Client.fromConnectionString(deviceConnectionString, Protocol);

deviceClient.open(function (err) {
    if (err) {
        console.log('Unable to connect to IoT Hub. '.red + err);
    }
    else {
        console.log('Successfully connected to IoT Hub. '.green);

        deviceClient.getTwin(function (err, twin) {
            if (err) {
                console.log('AZURE IoT: Could not get twin: ' + err);
            }
            else {
                console.log("AZURE IoT: Device twin is ready");
                twin.on('properties.desired', function (desiredChange) {
                    console.log('desiredChange: ' + desiredChange);
                });
                var switchNodes = [{"id":6,"value":false},{"id":7,"value":true}];
                var patch = {
                    lampa: {
                        xxx: {"id":6,"value":false}
                    }
                };
                twin.properties.reported.update(patch, function(err) {
                    if (err) {
                      console.error('Could not update twin: ' + err.constructor.name + ': ' + err.message);
                    } else {
                      console.log(twin.deviceId + ' twin updated successfully');

                    }
                  });
            }
        });
    }
});