var Log = require('katana').Log;

var MongoDB = require('mongodb');

module.exports = function(store, config, callback) {
	var server = new MongoDB.Server(config.host, config.port, config.server_options);
	var db     = new MongoDB.Db(config.database, server, config.database_options);
	
	db.open(function() {
		Log.debug('MongoDB connected');
		
		callback(store, db);
	});
}
