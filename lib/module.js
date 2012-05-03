var root = global.root;

var Fs      = require('fs');
var Path    = require('path');

var App = require('katana');

var Config = App.Config;

var Router = require('./router');
var load   = require('./utils').load;

var Model = require('./model');

var modules = {};

require('joose');

Class('Katana.Core.Module', {
	have: {
		name: 'Katana.Module',
		config: {},
		controllers: {}
	},
	
	methods: {
		initialize: function() {
			var Module = this;
			
			Module.config = Config.load(Module.name);
			if (!Module.config.routing) { Module.config.routing = {}; }
			
			App.on('run', function(callback) {
				Model.load(Module.name, function() {
					App.View.load(Module.name);
					
					load(root +'modules/'+ Module.name +'/controllers', function(error, controllers) {
						if (error) { throw error; }

						Module.controllers = controllers;
						
						callback();
					});
				});
			});
		},
		
		run: function() {
			var Module = this;
			
			var args = Array.prototype.slice.call(arguments);
			
			var uri = args.shift();
			
			uri = uri.replace('.', '/').split('/');
			
			var directory  = '';
			var controller = Module.name;
			var action     = 'index';
			
			if (uri.length > 1) {
				action = uri.pop();
				controller = uri.pop();
			}
			
			if (uri.length) {
				directory = uri.join('/') +'/';
			}
			
		  var Controller = Module.controllers[directory + controller];
			
			if (Controller != undefined) {
				if (typeof(Controller[action]) === 'function') {
					Controller[action].apply(Controller, args);
				} else {
					console.log('Could not find action '+ action +' for controller '+ controller +' in module'+ Module.name);
				}
			} else {
				console.log('Could not find controller '+ controller +' for module '+ Module.name);
			}
		},
		
		run_uri: function() {
			var Module = this;
			
			var args = Array.prototype.slice.call(arguments);
			
			var uri = args.shift();
			
			uri = uri ? uri.replace('.', '/') : uri;
			
			var route = Router.route(uri, Module.config.routing, Module.name);
			
			route.arguments = args.concat(route.arguments);
			
			var Controller = Module.controllers[route.directory + route.controller];
			 
			if (Controller != undefined) {
				if (typeof(Controller[route.action]) === 'function') {
					Controller[route.action].apply(Controller, route.arguments);
				} else {
					console.log('Could not find action '+ route.action +' for controller '+ route.controller +' in module' + Module.name);
				}
			} else {
				console.log('Could not find controller '+ route.controller +' for module '+ Module.name);
			}
		}
	}
});

module.exports = Module = function(module) {
	if (module === '*') {
		return modules;
	} else if (module) {
		return modules[module];
	}
	
	return Katana.Core.Module;
}

App.on('boot', function(callback) {
	Path.exists(root + 'modules', function(exists) {
		if (exists) {
			Fs.readdirSync(root + 'modules').forEach(function(module) {
				var module = Path.basename(module, Path.extname(module));

				modules[module] = require(root +'modules/'+ module);
			});
		}
		
		callback();
	});
});

























