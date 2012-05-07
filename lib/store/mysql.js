var Log = require('../katana').Log;

var MySQL = require('mysql');

module.exports = function(store, config, callback) {
	var connection = MySQL.createClient({
		host: config.host,
		port: config.port,
		user: config.user,
		password: config.password,
		database: config.database
	});
	
	connection.on('error', function(error) {
		Log.error('MySQL error:\n' + error);
	});
	
	Log.debug('MySQL connected');
	
	callback(store, connection);
}
