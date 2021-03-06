var mod_root = global.mod_root = require('path').normalize(__dirname + '/../');
var root     = global.root     = process.cwd() + '/';
var env      = global.env      = process.env.NODE_ENV || 'development';

require('./bootstrap');

var Http  = require('http');
var Https = require('https');
var Path  = require('path');
var Fs    = require('fs');

var EventEmitter = require('events').EventEmitter;

var Config = require('./config');
var config = Config();
var routing = Config('routing');

var View   = require('./view');
var Model  = require('./model');

var Log = new (require('logme').Logme)({ theme: 'socket.io' });

var load = require('./utils').load;

require('joose');

Class('Katana', {
	meta: Joose.Meta.Class,
	
	isa: EventEmitter,
	
	have: {
		about: {},
		server: null,
		controllers: []
	},
	
	methods: {
		initialize: function() {
			var App = this;
			
			App.about = require(mod_root + 'package.json');
			
			process.nextTick(function() {
				App.boot();
			})
		},
		
		run: function() {
			var App = this;
			
			App.series('run', function(error, results) {
				if (config.ssl.enabled) {
					var options = {
						key: Fs.readFileSync(config.ssl.key),
						cert: Fs.readFileSync(config.ssl.cert)
					};

					App.server = Https.Server(options);
				} else {
					App.server = Http.Server();
				}
				
				App.server.on('request', function(request, response) {
					if (request.url == '/favicon.ico') {
						response.writeHead(404, { 'Content-Type': 'text/plain' });
						response.end();
					} else if (config.static.enabled && request.url.indexOf('/'+ config.static.path)===0) {
						require('./static')(request, response);
					} else {
						App.series('connection', function(error, results) {
						  App.handle_connection(request, response);
						}, request, response);
					}
				});
				
				App.server.listen(config.port, config.host);
				
				Log.debug('['+ process.pid +'] Listen at: '+ config.host +':'+ config.port);
				
				App.parallel('ready', function(error, results) {
					if (error) { throw error; }
				});
			});
		},
		
		handle_connection: function(request, response) {
			var App = this;
			
			var Request  = new Katana.Core.Request(request, response);
			var Response = new Katana.Core.Response(response, Request);
			
			App.series('request', function(error, results) {
				if (Request.module) {
					var Module = require('./module');
					
					if (Module(Request.module) != undefined) {
						Module(Request.module).run_uri(Request.routed_uri, Response, Request);
					} else {
						if (App.controllers[routing.controller_404] && typeof(App.controllers[routing.controller_404][routing.action_404]) == 'function') {
					    App.controllers[routing.controller_404][routing.action_404](Response, Request);
					  } else {
					    Response.send('404 - Page not found', 'text/plain', 404);
					  }
					}
				} else {
					var Controller = App.controllers[Request.directory + Request.controller];

					if (Controller != undefined) {
				    if (typeof(Controller[Request.action]) == 'function') {
					    Controller[Request.action](Response, Request);
				    } else {
					    if (typeof(Controller[routing.action_404]) == 'function') {
						    Controller[routing.action_404](Response, Request);
					    } else if (App.controllers[routing.controller_404] && typeof(App.controllers[routing.controller_404][routing.action_404]) == 'function') {
						    App.controllers[routing.controller_404][routing.action_404](Response, Request);
					    } else {
						    Response.send('404 - Page not found', 'text/plain', 404);
						  }
				    }
			    } else {
				    if (App.controllers[routing.controller_404] && typeof(App.controllers[routing.controller_404][routing.action_404]) == 'function') {
					    App.controllers[routing.controller_404][routing.action_404](Response, Request);
					  } else {
					    Response.send('404 - Page not found', 'text/plain', 404);
					  }
			    }
				}
			}, Request, Response);
		},
		
		boot: function() {
			var App = this;
			
			App.series('boot.config', function(error, results) {
				App.boot_stores();
			});
		},
		
		boot_stores: function() {
			var App = this;
			
			App.series('boot.stores', function(error, results) {
				App.boot_models();
			});
		},
		
		boot_models: function() {
			var App = this;
			
			Model.load(null, function() {
				App.series('boot.models', function(error, results) {
					App.boot_views();
				});
			});
		},
		
		boot_views: function() {
			var App = this;
			
			View.load(null, function() {
				App.series('boot.views', function(error, results) {
					App.boot_modules();
				});
			});
		},
		
		boot_modules: function() {
			var App = this;
			
			App.series('boot.modules', function() {
				App.boot_controllers();
			});
		},
		
		boot_controllers: function() {
			var App = this;
			
			load(root + 'application/controllers', function(error, controllers) {
				App.controllers = controllers;
				
				App.series('boot.controllers', function(error, results) {
					App.run();
				});
			});
		}
		
		/*boot: function() {
			var App = this;
			
			App.series('boot.config', function(error, results) {
				App.series('boot.stores', function(error, results) {
					Model.load(null, function() {
						App.series('boot.models', function(error, results) {
		          View.load(null, function() {
			          App.series('boot.views', function(error, results) {
		              App.series('boot.modules', function(error, results) {
			              load(root + 'application/controllers', function(error, controllers) {
											App.controllers = controllers;

		                  App.series('boot.controllers', function(error, results) {
		                    App.run();
											});
										});
									});
								});
		          });
						});
					});
				});
			});
		},*/
	}
});

global.App = module.exports = new Katana;

module.exports.Log         = Log;
module.exports.Utils       = require('./utils');
module.exports.Config      = require('./config');
module.exports.Store       = require('./store');
module.exports.View        = require('./view');
module.exports.Router      = require('./router');
module.exports.Static      = require('./static');
module.exports.Multiparser = require('./multiparser');
module.exports.Request     = require('./request');
module.exports.Response    = require('./response');
module.exports.Model       = require('./model');
module.exports.Module      = require('./module');
module.exports.Controller  = require('./controller');

if (config.cookie.enabled) module.exports.Cookie = require('./cookie');
if (config.session.enabled) module.exports.Session = require('./session');























































