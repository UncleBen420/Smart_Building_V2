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
  "battery": 100,
  "controller": "Pi lab1",
  "humidity": 22,
  "location": "Room A401",
  "luminance": 60,
  "motion": false,
  "sensor": 6,
  "temperature": 30.0,
  "updateTime": 1454682568
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
