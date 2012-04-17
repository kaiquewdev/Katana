var rand_str = require('../utils').rand_str;

var config = require('katana').Config().session;

require('joose');

Role('Katana.Core.Session.Store', {
	requires: ['create', 'save', 'set', 'get'],
	
	have: {
		id: null, data: {}
	},
	
	methods: {
		create: function() {
			this.id = rand_str(config.key_length);
			this.data = config.defaults;
		},
		
		set: function(name, value) {
			var Session = this;
			
			if (typeof(name) === 'object') {
				for (var key in name) {
					Session.data[key] = name[key];
				}
			} else { Session.data[name] = value; }
		},
		
		get: function(name, def_value) {
			if (name === '*') { return this.data; }
			
			return (this.data[name] !== undefined ? this.data[name] : def_value);
		}
	}
});

module.exports = Katana.Core.Session.Store;


















