const mqtt = require('mqtt')
const { spawnSync } = require("child_process");
const config = require('../config/default.json');
const db = require('../config/local_database.json');
const http = require('http')
const http_post = require('http')

// Variable used for the fonctionalities
var radiator_connected = false;
var blind_connected = false;
var zwave_connected = false;

var room_occupied = false;
var room_still_occupied = false;


var luminance = 0.;
var luminance_threshold = 20.;


var temperature = 0.;
var temperature_threshold_low = 30.;
var temperature_threshold_high = 80.;

var humidity = 0.;
var humidity_threshold = 80.;
var zwave_connected = false;

var commands = [1,1,1,1]

var options = {
    port: config.server.port_mqtt,
    clientId: 'fonctionality',
    username: config.server.mqtt_user,
    password: config.server.mqtt_password,
};
const client = mqtt.connect(config.server.url_mqtt, options)

// subscribe to the topic
client.on('connect', () => {
console.log("is connected")

  client.subscribe('blind/connected')
  client.subscribe('radiator/connected')
  client.subscribe('zwave/connected')
  client.subscribe('fonctionality/commands')
  client.subscribe('fonctionality/temperature_threshold_low')
  client.subscribe('fonctionality/temperature_threshold_high')
  client.subscribe('fonctionality/humidity_threshold')
  client.subscribe('fonctionality/luminance_threshold')
  client.subscribe('data/room')
  client.subscribe('data/zwave')
  
  // inform the network
  client.publish('fonctionality/connected', 'true')
})


// Check the topic and react in function
client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
    case 'blind/connected':
    	console.log("blind/connected")
    	blind_connected = true
      	break;
      	
    case 'radiator/connected':
        console.log("radiator/connected")
        radiator_connected = true
      	break;
      	
    case 'zwave/connected':
        console.log("zwave/connected")
        zwave_connected = true
      	break;
      	
    case 'fonctionality/commands':
        console.log("fonctionality/commands")
        data = JSON.parse(message)
        commands = data.commands
      	break;
      	
    case 'fonctionality/temperature_threshold_low':
        console.log("fonctionality/temperature_threshold_low")
        data = JSON.parse(message)
        temperature_threshold_low = data.temperature_threshold
      	break;
      	
    case 'fonctionality/temperature_threshold_high':
        console.log("fonctionality/temperature_threshold_high")
        data = JSON.parse(message)
        temperature_threshold_high = data.temperature_threshold
      	break;
      	
    case 'fonctionality/luminance_threshold':
        console.log("fonctionality/luminance_threshold")
        data = JSON.parse(message)
        luminance_threshold = data.luminance_threshold
      	break;
      	
    case 'fonctionality/humidity_threshold':
        console.log("fonctionality/humidity_threshold")
        data = JSON.parse(message)
        humidity_threshold = data.humidity_threshold
      	break;

    case 'data/room':
        console.log("data/room")
        data = JSON.parse(message)
        room_still_occupied = data.room
        
      	break;

    case 'data/zwave':
        console.log("data/zwave")
        data = JSON.parse(message)
        var luminance = data["Luminance"];
	var temperature = data["Temperature"];
	var humidity = data["Relative Humidity"];	
	console.log(luminance + " " + temperature + " " + humidity)
      	break;
    default:
      console.log("topic not found")

  }

})


/**
 * Want to notify controller that garage is disconnected before shutting down
 */
function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    client.publish('fonctionality/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}

// This function is used to control the blind and radiator
function intervalFunc() {

	room_occupied = room_still_occupied
	room_still_occupied = 0
	console.log(room_occupied)


	if(commands[0] == 1 && room_occupied > 0){
		if(zwave_connected && radiator_connected){
			console.log("warm the room")
			var data = JSON.stringify({
				"room": room_occupied,
				"val" : temperature_threshold_high
				})
			client.publish('radiator/control', data)
		}
	}

	if(commands[1]  == 1 && room_occupied == 0){
		if(zwave_connected && radiator_connected){
			console.log("cold the room")
			var data = JSON.stringify({
				"room": 1,
				"val" : temperature_threshold_low
				})
			client.publish('radiator/control', data)
			var data = JSON.stringify({
				"room": 2,
				"val" : temperature_threshold_low
				})
			client.publish('radiator/control', data)
		}


	}

	if(commands[2]  == 1 && humidity_threshold <= humidity){
		if(zwave_connected && blind_connected){
			console.log("close the blind")
			var data = JSON.stringify({
				"room": 1,
				"val" : 0
				})
			client.publish('blind/control', data)
			var data = JSON.stringify({
				"room": 2,
				"val" : 0
				})
			client.publish('blind/control', data)
		}


	}

	if(commands[3]  == 1 && room_occupied > 0 && luminance_threshold >= luminance){
		if(zwave_connected && blind_connected){
			console.log("open the blind")
			var data = JSON.stringify({
				"room": room_occupied,
				"val" : 99
				})
			client.publish('blind/control', data)
		}


	}

}

// data are send each 1 minute
setInterval(intervalFunc, 60000);

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
