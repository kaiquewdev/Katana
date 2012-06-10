var App = require('../katana');

var config = App.Config().session;

var Memory = App.Store(config.store);

require('./store');
require('joose');

Class('Katana.Core.Session.Memory', {
	does: Katana.Core.Session.Store,
	
	have: {
		name: 'memory'
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
			
			var sess = Memory.get('session'+ session_id);
			
			if (!sess || (sess.updated_at + config.lifetime) < Date.now()) {
				Session.create();
				
				return callback(Session);
			}
			
			Session.id = session_id;
			Session.data = sess.data;
			
			callback(Session);
		},
		
		save: function(callback) {
			var Session = this;
			
			Memory.set('session'+ Session.id, { data: Session.data, updated_at: Date.now() });
			
			callback();
		}
	}
});

module.exports = Katana.Core.Session.Memory;




























