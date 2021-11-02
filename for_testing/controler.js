// controller.js
const mqtt = require('mqtt')
var options = {
    port: 1883,
    clientId: 'controller',
    username: 'mqtt_user',
    password: 'mqtt',
    //keepalive: 60,
    //reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    //clean: true,
    //encoding: 'utf8'

};
const client = mqtt.connect('mqtt://192.168.0.15',options)

var garageState = ''
var connected = false

var radiator_KNX_connected = false
var blind_KNX_connected    = false
var ZWAVE_connected        = false


client.on('connect', () => {
	console.log("is connected")
  client.subscribe('radiator/connected')
  client.subscribe('blind/connected')
  client.subscribe('zwave/connected')
})

client.on('message', (topic, message) => {
  switch (topic) {
    case 'radiator/connected':
      return handleRadiatorConnected(message)
    case 'blind/connected':
      return handleBlindConnected(message)
    case 'zwave/connected':
      return handleZwaveConnected(message)
  }
  console.log('No handler for topic %s', topic)
})

function handleRadiatorConnected (message) {
  console.log('radiator connected status %s', message)
  radiator_KNX_connected = (message.toString() === 'true')
}

function handleBlindConnected (message) {
  console.log('blind connected status %s', message)
  blind_KNX_connected = (message.toString() === 'true')
}

function handleZwaveConnected (message) {
  console.log('zwave connected status %s', message)
  ZWAVE_connected = (message.toString() === 'true')
}

function radiator_controls () {
  // can only open door if we're connected to mqtt and door isn't already open
  if (radiator_KNX_connected) {
    // Ask the door to open
    console.log("controller ask to open radiator")
    message = {'val':100,
    	       'room':'1'}
    client.publish('radiator/control', JSON.stringify(message))
  }
}

function blind_controls () {
  // can only open door if we're connected to mqtt and door isn't already open
  if (radiator_KNX_connected) {
    // Ask the door to open
    console.log("controller ask to open blind")
    message = {'val':100,
    	       'room':1}
    client.publish('blind/control', JSON.stringify(message))
  }
}

function zwave_controls () {
  // can only open door if we're connected to mqtt and door isn't already open
  console.log("csddssddsdsdsave")
  if (ZWAVE_connected) {
    // Ask the door to open
    console.log("controller ask to open zwave")
    message = {'node_id':6,
    	       'value':50}
    client.publish('zwave/control',  JSON.stringify(message))
  }
}



// --- For Demo Purposes Only ----//

// simulate opening garage door
setTimeout(() => {
	console.log("ewffeeff")
  zwave_controls()
}, 5000)

// simulate closing garage door
setTimeout(() => {

  blind_controls()
}, 20000)
