var App = require('katana');
var Log = App.Log;

var config = App.Config().session;

var Store;

App.on('run', function(callback) {
	Store = require('./' + config.store);
	
	callback();
});

App.on('request', function(Request, Response, callback) {
	new Store(Request.cookie.get(config.key_name), function(Session) {
		Request.session = Session;
		
		callback();
	});
});

App.on('cookie.send', function(Response, Request, callback) {
	Request.session.save(function(error) {
		if (error) { Log.error('Error saving session: ' + Request.session.id); return callback(); }
		
		Request.cookie.set(config.key_name, Request.session.id, { lifetime: config.lifetime });
		
		callback();
	});
});

module.exports = {};
















