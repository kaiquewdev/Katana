var Log   = require('../katana').Log;
var Redis = require('redis');

module.exports = function(store, config, callback) {
	var connection = Redis.createClient(config.port || config.socket, config.host, config.options);
	
	connection.on('error', function(error) {
		Log.error('Redis error:\n' + error);
	});
	
	if (config.password) {
		connection.auth(password, function(error) {
			Log.error('Redis error:\n Invalid authentication password');
		});
	}
	
	connection.on('connect', function() {
		if (config.database) {
			connection.send_anyways = true;
			connection.select(config.database);
			connection.send_anyways = false;
		}
	});
	
	connection.on('ready', function() {
		Log.debug('Redis connected');
		
		callback(store, connection);
	});
}






















