var root = global.root;

var Fs = require('fs');

var App = require('../katana');

var extend = App.Utils.extend;
var load   = App.Utils.load;

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
		
		load: function(module, callback) {
			var View = this;
			
			module = module || 'application';

			var path = module=='application' ? root +'application/views/' : root+'modules/'+ module +'/views/';
			
			load(path, function(error, views) {
				View.views[module] = views;
				
				callback && callback();
			}, function(file, cb) {
				Fs.readFile(path + file.dirname + file.name, 'utf-8', function(error, data) {
					if (error) { throw error; };
					
					cb(data);
				});
			});
		}
	}
});

module.exports = Katana.Core.View.Engine;

























































