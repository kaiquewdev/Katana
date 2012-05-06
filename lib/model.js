var root = global.root;

var Path = require('path');

var App = require('katana');

var load = require('./utils').load;

var models = {};

module.exports = Model = function(model, module) {
	if (!model) { return models; }
	
	var module = module || 'application';
	
	model = model.replace('.', '/');
	
	if (m = model.match(/(.*)\:(.*)/i)) {
		module = m[1];
		model  = m[2];
	}
	
	return models[module][model];
}

module.exports.load = load_models = function(module, callback) {
	module = module || 'application';
	
	var path = module=='application' ? root +'application/models' : root+'modules/'+ module +'/models';
	
	load(path, function(error, mds) {
		if (error) { throw error; }
		
		models[module] = mds;
		
		callback && callback();
	});
}



























