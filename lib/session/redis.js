var App   = require('../katana');
var Redis = App.Store('redis');

var config = App.Config().session;

require('./store');
require('joose');

Class('Katana.Core.Session.Redis', {
	does: Katana.Core.Session.Store,
	
	have: {
		name: 'redis'
	},
	
	methods: {
		BUILD: function(session_id, callback) {
			return {
				session_id: session_id,
				callback: callback
			}
		},
		
		initialize: function(args) {
			var Session = this;
			
			var session_id = args.session_id;
			var callback   = args.callback;
			
			if (!session_id) {
				Session.create();
				
				return callback(Session);
			}
			
			Redis.get('session:'+ session_id, function(error, data) {
				if (error || data===null) { 
					Session.create();
					
					return callback(Session);
				}
				
				Session.id = session_id;
				Session.data = JSON.parse(data);
				
				callback(Session);
			});
		},
		
		save: function(callback) {
			var Session = this;
			
			Redis.setex('session:'+ this.id, config.lifetime, JSON.stringify(this.data), function(error) {
				callback(error);
			});
		}
	}
});

module.exports = Katana.Core.Session.Redis;




























