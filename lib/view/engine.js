var root   = global.root;

var Fs     = require('fs');
var extend = require('../utils').extend;
var load   = require('../utils').load;

var App = require('katana');

require('joose');

Role('Katana.Core.View.Engine', {
	requires: ['set', 'render'],
	
	have: {
		engine: 'Engine',
		app: null,
		views: {},
		data: {}
	},
	
	methods: {
		set: function(name, value) {
			if (typeof(name) == 'object') {
				this.data = extend(this.data, name);
			} else {
				this.data[name] = value;
			}
		},
		
		load: function(module) {
			var View = this;
			
			module = module || 'application';

			var path = module=='application' ? root +'application/views/' : root+'modules/'+ module +'/views/';
			
			load(path, function(error, views) {
				if (error) { console.log(error); }
				
				View.views[module] = views;
			}, function(file, callback) {
				callback(Fs.readFileSync(path + file.dirname + file.name, 'utf-8'));
			});
		}
	}
});

module.exports = Katana.Core.View.Engine;

























































