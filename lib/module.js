var root = global.root;

var Fs      = require('fs');
var Path    = require('path');

var App = require('katana');

var Config = App.Config;
var View   = App.View;
var Model  = App.Model;
var Router = require('./router');

var load   = require('./utils').load;

var modules = {};

require('joose');

Class('Katana.Core.Module', {
	have: {
		name: 'Katana.Module',
		controllers: {}
	},
	
	methods: {
		initialize: function() {
			var Module = this;
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
					console.log('Could not find action '+ action +' for controller '+ controller +' in module '+ Module.name);
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
			
			var route = Router.route(uri, Config(Module.name +':routing'), Module.name);
			
			route.arguments = args.concat(route.arguments);
			
			var Controller = Module.controllers[route.directory + route.controller];
			 
			if (Controller != undefined) {
				if (typeof(Controller[route.action]) === 'function') {
					Controller[route.action].apply(Controller, route.arguments);
				} else {
					console.log('Could not find action '+ route.action +' for controller '+ route.controller +' in module ' + Module.name);
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

if (Path.existsSync(root + 'modules')) {
	Fs.readdirSync(root + 'modules').forEach(function(module) {
		module = Path.basename(module, Path.extname(module));
		
		modules[module] = module;
	});
}

App.on('boot.config', function(callback) {
	for (module in modules) {
		Config.load(module);
	}
	
	callback();
});

App.on('boot.models', function(callback) {
	var pending = Object.keys(modules).length;
	
	for (module in modules) {
		Model.load(module, function() {
			if (!--pending) { callback(); }
		});
	}
});

App.on('boot.views', function(callback) {
	var pending = Object.keys(modules).length;
	
	for (module in modules) {
		View.load(module, function() {
			if (!--pending) { callback(); }
		})
	}
});

App.on('boot.modules', function(callback) {	
	for (module in modules) {
		modules[module] = require(root +'modules/'+ module);
	}
	
	callback();
});

App.on('boot.controllers', function(callback) {
	var pending = Object.keys(modules).length;
	
	Object.keys(modules).forEach(function(module) {
		load(root +'modules/'+ module +'/controllers', function(error, controllers) {
			if (error) { throw error; }
			
			modules[module].controllers = controllers;
			
			if (!--pending) { callback(); }
		});
	});
});



















