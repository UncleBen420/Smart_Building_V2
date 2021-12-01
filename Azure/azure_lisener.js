const mqtt = require('mqtt')
const { spawnSync } = require("child_process");
const config = require('../config/default.json');
const db = require('../config/local_database.json');

// for local broker
var options = {
    port: config.server.port_mqtt,
    clientId: 'google_listener',
    username: config.server.mqtt_user,
    password: config.server.mqtt_password,

};
const client = mqtt.connect(config.server.url_mqtt, options)

client.on('connect', () => {
console.log("is connected")
  client.subscribe('data/#')
  
  client.publish('azure_listener/connected', 'true')
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
  // We use specific case to ensure only right data are send
    case 'data/radiator':
      return handleMessage(JSON.parse(message))
    case 'data/blind':
      return handleMessage(JSON.parse(message))
    case 'data/zwave':
      return handleMessage(JSON.parse(message))
  }
  console.log("topic not found")
})


function handleMessage (message) {
	// the message a transfert to azure iot hub
	client.publish('devices/azure_device/messages/events/',  JSON.stringify(message))	
}
