// npm i azure-iot-device azure-iot-device-mqtt colors
require('colors')
var deviceConnectionString = '';
var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var deviceClient = Client.fromConnectionString(deviceConnectionString, Protocol);

deviceClient.open(function (err) {
    if(err){
        console.log('Unable to connect to IoT Hub. '.red + err)
    }
    else{
        console.log('Successfully connected to IoT Hub. '.green)
    }
});