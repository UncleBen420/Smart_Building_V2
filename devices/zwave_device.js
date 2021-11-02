// garage.js
const mqtt = require('mqtt')
const { spawnSync } = require("child_process");
const config = require('../config/default.json');
const db = require('../config/local_database.json');
const http = require('http')
const http_post = require('http')

var options_zwave = {
  hostname: config.server.address_zwave,
  port: config.server.port_zwave,
}

var options_zwave_post = {
  hostname: config.server.address_zwave,
  port: config.server.port_zwave,
}
var options = {
    port: config.server.port_mqtt,
    clientId: 'zwave',
    username: config.server.mqtt_user,
    password: config.server.mqtt_password,

};
const client = mqtt.connect(config.server.url_mqtt, options)

client.on('connect', () => {
console.log("is connected")
  client.subscribe('zwave/control')
  
  // Inform controllers that garage is connected
  client.publish('zwave/connected', 'true')
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
    case 'zwave/control':
      return handleControlRequest(message)
  }
  console.log("topic not found")
})

// this function is called when an control instruction is received
function handleControlRequest (message) {

	options_zwave_post.method = "POST"
	options_zwave_post.path = '/dimmer/set_level'
	options_zwave_post.headers = {
        'Content-Type': 'application/json',
        'Content-Length': message.length
    }
	
	callback = function(response) {
	  var str = ''
	  response.on('data', function (chunk) {
	    str += chunk;
	  });

	  response.on('end', function () {
	    console.log(str);
	  });
	}


	var req = http_post.request(options_zwave_post, callback);
	//This is the data we are posting, it needs to be a string or a buffer
	req.write(message);
	req.end();

}


/**
 * Want to notify controller that garage is disconnected before shutting down
 */
function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    client.publish('zwave/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}

// This function publish data by calling knx
function intervalFunc() {

	db.rooms.forEach(function(room, index){
	console.log(room.dimmer_num)
	options_zwave.method = "GET"
	options_zwave.path = '/sensor/' + room.dimmer_num + '/readings'
	const req = http.request(options_zwave, res => {
		res.on("data", function(chunk) {
		console.log("BODY: " + chunk)
		
		ret = JSON.parse(chunk)
		
		var data = JSON.stringify({
			"messageId" : "zwave",
			"time" : new Date(),
			"temperature" : ret.temperature,
			"luminance" : ret.luminance,
			"humidity" : ret.humidity,
			"sensor" : ret.sensor,
			"id_room" : room.id})
		
		client.publish('data/zwave', data)
		
		console.log(data);
		})
	})
		
	req.end()
	
	})

}

// data are send each 5 seconds
setInterval(intervalFunc, 5000);

/**
 * Handle the different ways an application can shutdown
 */
process.on('exit', handleAppExit.bind(null, {
  cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))
