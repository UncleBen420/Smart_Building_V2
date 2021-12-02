var express = require('express');
var app = express();
// for parsing the body in POST request
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// GET /api/users
app.get('/sensor/6/readings', function(req, res){

	console.log("GET request incoming");
	
	var data = {
  "Alarm Level": 0, 
  "Alarm Type": 0, 
  "Battery Level": 100, 
  "Burglar": 8, 
  "Luminance": 135.0, 
  "Relative Humidity": 31.0, 
  "Sensor": false, 
  "SourceNodeId": 0, 
  "Temperature": 25.200000762939453, 
  "Ultraviolet": 0.0

};


	return res.json(data);    
});


app.post('/dimmer/set_level', function (req, res) {

	console.log("the dimmer: " + req.body.node_id + " has now the value: " + req.body.value);

	return res.send('Ok');
    
});


app.listen(5000, function(){
	console.log('Server listening on port 5000');
	});
