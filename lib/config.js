var root = global.root;
var env  = global.env;

var Path = require('path');
var Fs   = require('fs');

var merge = require('./utils').merge;

var Config = {};

module.exports = function(config) {
	if (!config) { return Config.application.application; }
	
	var module = 'application';
	
	if (m = config.match(/(.*)(\:|\.)(.*)/i)) {
		module = m[1];
		config = m[3]!=='' ? m[3] : module;
	}
	
	if (!Config[module]) { Config[module] = {}; }
	
	if (config === '*') {
		return Config[module];
	}
	
	if (Config[module][config] === undefined) { Config[module][config] = {}; }
	
	return Config[module][config];
}

module.exports.load = function(module) {
	module = module || 'application';
	
	var path = module=='application' ? root+'application/config/' : root+'modules/'+module+'/config/';
	
	if (!Config[module]) { Config[module] = {}; }
	
	if (Fs.statSync(path + 'development').isDirectory()) {
		Fs.readdirSync(path + 'development').forEach(function(file) {
			var name = Path.basename(file, Path.extname(file));

		  Config[module][name] = require(path +'development/'+ name);
		});
	}
	
	if (env !== 'development') {
		if (Fs.statSync(path + env).isDirectory()) {

			Fs.readdirSync(path + env).forEach(function(file) {
				var name = Path.basename(file, Path.extname(file));
       
				var config = require(path + env +'/'+ name);

				merge(Config[module][name], Config[module][name], config);
			});
		}
	}
	
	return Config[module];
}

module.exports.Config = Config;

module.exports.load();















