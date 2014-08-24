//Require main modules
var express = require('express'),
	mongoose = require('mongoose'),
	fs = require('fs'),
	app = express();

//Load configuration file (check debug config first)
var config;
var paths = [
	__dirname + "/config-debug-private.json",
	__dirname + "/config-prod-private.json"
]

for (var i in paths) {
	if (fs.existsSync(paths[i])) {
		config = JSON.parse(fs.readFileSync(paths[i]));
		break;
	}
}

// Connect mongodb
var mongo = config.mongo;
var url = 'mongodb://' + mongo.username +':'+ mongo.password + '@' + mongo.url;
mongoose.connect(url);

console.log(url);
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Setup express
app.configure(function() {
	app.use(express.limit('20mb')); // 10mb hard limit, 2mb warning limit in upload.js
   app.use(express.bodyParser());  // upload files

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
		res.header("Access-Control-Allow-Methods", "GET, POST");
		res.header("Cache-Control", "max-age=86400");
		next();
	});
});

var api = "/api/1/";
var upload = require('./controllers/upload.js');

// Uploads
app.get ("/f/:path",   		upload.get);
app.post(api+ "upload",		upload.post);
app.use("/", express.static("../front"));


//Start server
var server = app.listen(config.port);

console.log('Server started on port ' + config.port);
