//Require main modules
var express = require('express'),
	mongoose = require('mongoose'),
	fileSystem = require('fs'),
	app = express();

//Load configuration file
var config = JSON.parse(fileSystem.readFileSync(__dirname + '/config.json'));

//Connect to database
if (!config.mongodb.username) {
	mongoose.connect('mongodb://localhost/' + config.mongodb.database);
}
else {
	mongoose.connect('mongodb://' + config.mongodb.username + ':' + config.mongodb.password + '@' + config.mongodb.domain + '/' + config.mongodb.database);
}

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Setup express
app.configure(function() {
	app.use(express.limit('10mb')); // 10mb hard limit, 2mb warning limit in upload.js
    app.use(express.bodyParser());  // upload files

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
		res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
		next();
	});
});

var api = "/api/1/";
var upload = require('./controllers/upload.js');

// Uploads
app.get ("/f/:path",         upload.get);
app.post(api+ "upload",           upload.post);
app.use("/", express.static("../"));


//Start server
var server = app.listen(2718);

console.log('Node/Express server started on ' + config.environment + ' server!');