const mqtt = require('mqtt')
const { spawnSync } = require("child_process");
const config = require('../config/default.json');
const db = require('../config/local_database.json');
const http = require('http')
const http_post = require('http')

// used to communicate with zwave REST api with get request
var options_zwave = {
  hostname: config.server.address_zwave,
  port: config.server.port_zwave,
}

// used to communicate with zwave REST api with post request
var options_zwave_post = {
  hostname: config.server.address_zwave,
  port: config.server.port_zwave,
}

// mqtt option
var options = {
    port: config.server.port_mqtt,
    clientId: 'zwave',
    username: config.server.mqtt_user,
    password: config.server.mqtt_password,
};
const client = mqtt.connect(config.server.url_mqtt, options)

// when the client is connect to the broker
client.on('connect', () => {
console.log("is connected")
  client.subscribe('zwave/control')
  
  client.publish('zwave/connected', 'true')
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
  // if we have an upcoming command
    case 'zwave/control':
      return handleControlRequest(message)
  }
  console.log("topic not found")
})

// this function is called when an control instruction is received
function handleControlRequest (message) {

	// Post a new dimmer value
	options_zwave_post.method = "POST"
	options_zwave_post.path = '/dimmer/set_level'
	options_zwave_post.headers = {
        'Content-Type': 'application/json',
        'Content-Length': message.length
    	}
	
	// we get the response from the server
	callback = function(response) {
	  var str = ''
	  response.on('data', function (chunk) {
	    str += chunk;
	  });

	  response.on('end', function () {
	    console.log(str);
	  });
	}

	// do the request
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
	console.log(room.sensor_num)
	
	// use http to get the sensor value
	options_zwave.method = "GET"
	options_zwave.path = '/sensor/' + room.sensor_num + '/readings'
	const req = http.request(options_zwave, res => {
		res.on("data", function(chunk) {
		console.log("BODY: " + chunk)
		
		// the data are already casted so they are directly send
		client.publish('data/zwave', chunk)
		
//		console.log(chunk);
		})
	})
		
	req.end()
	
	})

}

// data are send each 5 seconds
setInterval(intervalFunc, 5000);

process.on('exit', handleAppExit.bind(null, {
  cleanup: true
}))
process.on('SIGINT', handleAppExit.bind(null, {
  exit: true
}))
process.on('uncaughtException', handleAppExit.bind(null, {
  exit: true
}))
