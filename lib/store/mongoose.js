var Log = require('../katana').Log;
var Mongoose = require('mongoose');

module.exports = function(store, config, callback) {
	var connection;
	
	if (config.uri) {
		connection = Mongoose.createConnection(uri);
	} else {
		connection = Mongoose.createConnection(config.host, config.database, config.port, config.options);
	}
	
	connection.on('open', function() {
		Log.debug('Mongoose['+ store +'] connected');
		
		callback(store, connection);
	});
}
