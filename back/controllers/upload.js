//
// Uploads.js - Handle uploads from bckt.ca
//

/*
current assumptions:

- 15mb limit
- time limit is 3hrs (not # of downloads, which is just for stats)
- assume no one will use up bandwith (solve this later)

*/


var crypto = require('crypto');
var passwordHash = require('password-hash');
var fs = require('fs');
var s3 = require("../helpers/s3-helper.js");
var File = require('../models/File.js');

// CONST
var MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB



exports.get = function (req, res)
{
	var path = req.params.path;
	console.log(path);

	// do file checking
	File.findOne ({
		"path"		: path
	}, function (e, file)
	{
		console.log(file);
		if (!e)
		{
			var url = s3.getUrlForFile(file.fid);
			console.log("redirecting to " + url);
			res.redirect (url);
		}
	}); // findOne
	// look at cache

	// or get signed link and put in cache

	// update stats

	// redirect to signed url
}


function verifyFile (file)
{
	return true;
}
function generateFID (callback)
{
	// TODO: remove numbers, ambiguous chars
	crypto.randomBytes(32, function(ex, buf) {
		callback (buf.toString('hex'));
	});
}
function createDBEntry (fid, file, callback)
{
	console.log("creating db entry...");
console.log(file);
	var file = new File ({
		"fid"       : fid,
		"path"		: fid.substring(0, 6),
    	"num_downloads" : 0,
    	// "expiry_date"   : Date, // needed?
    	// "user_id"       : String,
    	"access_code"   : fid.substring(10, 14),
    	"filename"      : file.name
	});

	file.save (function saved (e)
	{
		callback(e || file);
	}); // file.save
}
exports.post = function (req, res)
{
	var file = req.files.file;

		console.log("s3");
	if (verifyFile(file))
	{
		console.log("start");
		var done = function (fid, s3, db, callback)
		{
			console.log("done");
			console.log(fid);
			console.log(s3);
			console.log(db);
			res.send ({
				status: 200,
				fid: 	fid,
				s3: 	s3,
				db: 	db
			});
			callback();
		};

		nest (["$fid", generateFID],
			  ["$s3-res", s3.uploadFileAtPath, file.ws.path, "$fid"],
			  ["$db-res", createDBEntry, "$fid", file],
			  ["$ok", done, "$fid", "$s3-res", "$db-res"]);
	}
	else
	{
		res.send("error");
	}
}


function test (a, b, c, callback)
{
	console.log("calling 'test' with:  '" + a + " " + b + " " + c + " '");

	setTimeout(function () {
		callback("hi" + a + " " + b);
	}, 200);
}

function result (a)
{
	console.log("received: '" + a +"'");
	console.log("\n\n");
}
// test(1, 2, 3);
// test.apply([1, 2, 3]);

// nest (["$a", test, 1, 2, 3],
// 	  [result, "$a"]);


function nest ()
{
	var index = 0;
	var functions = arguments;
	var data = {};
	var previousVars = "";

	var next = function ()
	{
		// console.log("returning to next, args: ");
		// console.log(arguments);
		// console.log();
		// console.log("previous:");
		// console.log(previousVars);
		// console.log();

		var previous = previousVars.split(" ");
		for (var i = 0; i < arguments.length && i < previous.length; i ++)
		{
			var str = previous[i];
			var val = arguments[i];
// console.log("adding: " + str)
			if (str[0] !== "$")
				console.log("??? no money?");
			else
				data[str.substring(1)] = val;
		}
		// console.log(data);

		if (index >= functions.length)
			return;

		var arr = functions[index];
		var f = arr[1];
		previousVars = arr[0];
		var start = 2;
		if (typeof f !== 'function')
		{
			f = arr[0];
			previousVars = [];
			start = 1;
		}

		// Populate args
		var args = [];
		for (var i = start; i < arr.length; i ++)
		{
			var str = arr[i];
			if (typeof str === "string" && str.length >= 2 && str[0] == "$")
				args.push (data[str.substring(1)] || str);
			else
				args.push (str);
		}
		args.push(next);

		process.nextTick (function () {
			f.apply(null, args);
		});
		index++;
	}

	process.nextTick(next);
}




