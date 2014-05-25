var fs  = require("fs");
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-config.json.private');

var BUCKET = "bckt-ca";

var s3 = new AWS.S3();
// s3.listBuckets(function(err, data) {
//   for (var index in data.Buckets) {
//     var bucket = data.Buckets[index];
//     console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
//   }
// });


// path:    file path of file to upload
// fid:      id of file
// f:       function
exports.uploadFileAtPath = function (path, fid, callback)
{
    console.log("uploading fid: " + fid);
    fs.readFile(path, function(err, file_buffer)
    {
        var params = {
            Bucket: BUCKET,
            Key: fid,
            Body: file_buffer,
            ServerSideEncryption: 'AES256',
            StorageClass: 'STANDARD'
        };

        s3.putObject(params, function (err, res) {
            console.log("s3 received");
            console.log(res);
            callback(err || res);
        });
    });    
}

// fid: file id
exports.getUrlForFile = function (fid)
{
    var params = {Bucket: BUCKET, Key: fid, Expires: 30};
    return s3.getSignedUrl('getObject', params);
}


