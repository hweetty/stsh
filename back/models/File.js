var mongoose = require('mongoose'),
    troop = require('mongoose-troop');

var File = mongoose.Schema({
    "fid"       : { type: String, required: true },
	"path"		: { type: String, required: true },
    "num_downloads" : { type: Number, required: true },
    "expiry_date"   : Date, // needed?
    "ip"            : String,
    "user_id"       : String,
    "access_code"   : { type: String, required: true },
    "filename"      : { type: String, required: true }
});

File.plugin(troop.timestamp, {
    createdPath: 'created_at',
    modifiedPath: 'updated_at',
    useVirtual: false
});

module.exports = mongoose.model('File', File);

