const mqtt = require('mqtt')
const { spawnSync } = require("child_process");
const config = require('../config/default.json');
const db = require('../config/local_database.json');


var options = {
    port: config.server.port_mqtt,
    clientId: 'blind',
    username: config.server.mqtt_user,
    password: config.server.mqtt_password,

};
// creation of the client
const client = mqtt.connect(config.server.url_mqtt, options)

client.on('connect', () => {
console.log("is connected")
  client.subscribe('blind/control')
  
  client.publish('blind/connected', 'true')
})

client.on('message', (topic, message) => {
  console.log('received message %s %s', topic, message)
  switch (topic) {
    case 'blind/control':
      return handleControlRequest(JSON.parse(message))
  }
  console.log("topic not found")
})

function percent_knx (percent,base) {
     return parseInt(percent / 100. * base);
}

// this function is called when an control instruction is received
function handleControlRequest (message) {
	console.log("message")
	
	// this switch select which room will be used
	console.log(message.room)
	var id_room = 0
	switch (message.room) {
	    case 1 :
	      break
	    case 2:
	      id_room = 9
	      break
	    default :
	    	console.log("cannot find the room")
	  }
	
	var percent = percent_knx(message.val,255)
	var e = "test" + 1
	console.log('0/4/' + (id_room + 1))

	const cmd = spawnSync(config.server.PATH_knx, ['raw', '3/4/' + (id_room + 1) , percent, '2', '2'])
	if(cmd.stdout.toString()){
		res_str = cmd.stdout.toString()
		console.log(`KNX server response: ${cmd.stdout.toString()}`)
	}
	const cmd2 = spawnSync(config.server.PATH_knx, ['raw', '3/4/' + (id_room + 2) , percent, '2', '2'])
	if(cmd2.stdout.toString()){
		res_str = cmd.stdout.toString()
		console.log(`KNX server response: ${cmd.stdout.toString()}`)
	}

}


// if the device is disconnected
function handleAppExit (options, err) {
  if (err) {
    console.log(err.stack)
  }

  if (options.cleanup) {
    client.publish('blind/connected', 'false')
  }

  if (options.exit) {
    process.exit()
  }
}

// This function publish data by calling knx
function intervalFunc() {
 console.log("send data blind")

	// foreach blind in each room
	db.rooms.forEach(function(room){
	room.blinds.forEach(function(blind) {
	var num = -1
	const cmd = spawnSync(config.server.PATH_knx, ['raw', '4/4/' + blind, '0', '1', '0'])
		
	// Cast the response		
	if(cmd.stdout.toString()){
		res_str = cmd.stdout.toString();
		res_str = res_str.slice(0, -5);
		var num = res_str.replace(/\D/g, '')
	}

	// format of the message
	var data = JSON.stringify({
		messageId: "blind",
		blind_number:blind,
		value:num,
		room_id:room.id
		});
	
	console.log(data)
	
	client.publish('data/blind', data)
	
	});
	});

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
