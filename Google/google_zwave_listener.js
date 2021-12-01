const mqtt = require('mqtt')
const { spawnSync } = require("child_process");
const config = require('../config/default.json');
const db = require('../config/local_database.json');

const jwt = require('jsonwebtoken');
const {readFileSync} = require('fs');

// We need to have 2 client mqtt because the broker mosquitto cannot communicate in bridge mode unlike azure or aws
//-----------------------------------------------------------------------------------------------
// for google mqtt
const projet_id = "my-first-project-326708"
const registery_id = "Smartbuild"
const device_id = "zwave2"
const region = "europe-west1"

const mqttBridgeHostname = 'mqtt.googleapis.com'
const mqttBridgePort = 8883
const algorithm = 'RS256'
const privateKeyFile = '../Google/Zwave/rsa_private.pem'
const serverCertFile = '../Google/roots.pem'
 
 
const createJwt = (projectId, privateKeyFile, algorithm) => {
  // Create a JWT to authenticate this device. The device will be disconnected
  // after the token expires, and will have to reconnect with a new token. The
  // audience field should always be set to the GCP project id.
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    aud: projectId,
  };
  const privateKey = readFileSync(privateKeyFile);
  return jwt.sign(token, privateKey, {algorithm: algorithm});
};
 
client_id = 'projects/'+ projet_id +'/locations/'+ region +'/registries/'+ registery_id +'/devices/'+device_id

const options_google = {
  host: mqttBridgeHostname,
  port: mqttBridgePort,
  clientId: client_id,
  username: 'unused',
  password: createJwt(projet_id, privateKeyFile, algorithm),
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method',
  ca: [readFileSync(serverCertFile)],
};
topic_publish = '/devices/'+device_id+'/events'
const client_google = mqtt.connect(options_google);
//-----------------------------------------------------------------------------------------------

// for local broker
var options = {
    port: config.server.port_mqtt,
    clientId: 'azure_listener',
    username: config.server.mqtt_user,
    password: config.server.mqtt_password,

};

const client_local = mqtt.connect(config.server.url_mqtt, options)

client_local.on('connect', () => {
console.log("is connected")
  client_local.subscribe('data/#')
  
  // Inform controllers that garage is connected
  client_local.publish('google_listener/connected', 'true')
})

client_google.on('connect', () => {
console.log("google iot is connected")
client_google.publish(topic_publish,  "hello world")
})

client_local.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
    case 'data/zwave':
      return handleMessage(JSON.parse(message))
    default:
      console.log("topic not found")
  }

})


function handleMessage (message) {
	client_google.publish(topic_publish,  JSON.stringify(message))	
}
