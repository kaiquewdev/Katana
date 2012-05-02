var mod_root = global.mod_root = require('path').normalize(__dirname + '/../');
var root     = global.root     = process.cwd() + '/';
var env      = global.env      = process.env.NODE_ENV || 'development';

require('./bootstrap');

var Http  = require('http');
var Https = require('https');
var Fs    = require('fs');

var EventEmitter = require('events').EventEmitter;

var Config = require('./config')();

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
			
			App.about = JSON.parse(Fs.readFileSync(mod_root + 'package.json', 'utf-8'));
			
			process.nextTick(function() {
				App.boot();
			})
		},
		
		boot: function() {
			var App = this;
			
			App.series('boot', function(error, results) {
				if (error) { throw error; }
				
				load(root + 'application/controllers', function(error, controllers) {
					if (error) { throw error; }
					
					App.controllers = controllers;
					
					App.run();
				});
			});
		},
		
		run: function() {
			var App = this;
			
			App.series('run', function(error, results) {
				if (Config.ssl.enabled) {
					var options = {
						key: Fs.readFileSync(Config.ssl.key),
						cert: Fs.readFileSync(Config.ssl.cert)
					};

					App.server = Https.Server(options);
				} else {
					App.server = Http.Server();
				}
				
				App.server.on('request', function(request, response) {
					if (request.url == '/favicon.ico') {
						response.writeHead(404, { 'Content-Type': 'text/plain' });
						response.end();
					} else if (Config.static.enabled && request.url.indexOf('/'+ Config.static.path)===0) {
						require('./static')(request, response);
					} else {
						App.series('connection', function(error, results) {
						  App.handle_connection(request, response);
						}, request, response);
					}
				});
				
				App.server.listen(Config.port, Config.host);
				
				App.parallel('ready', function(error, results) {
					if (error) { throw error; }
					
					Log.debug('['+ process.pid +'] Listen at: '+ Config.host +':'+ Config.port);
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
					
					Module(Request.module).run_uri(Request.routed_uri, Response, Request);
				} else {
					var Controller = App.controllers[Request.directory + Request.controller];

					if (Controller != undefined) {
				    if (typeof(Controller[Request.action]) == 'function') {
					    Controller[Request.action](Response, Request);
				    } else {
					    if (typeof(Controller._404) == 'function') {
						    Controller._404(Response, Request);
					    } else if (typeof(App.controllers[Config.controller_404][Config.action_404]) == 'function') {
						    App.controllers[Config.controller_404][Config.action_404](Response, Request);
					    } else { 
						    Response.send('404 - Page not found', 'text/plain', 404);
						  }
				    }
			    } else {
				    Response.send('404 - Page not found', 'text/plain', 404);
			    }
				}
			}, Request, Response);
		}
	}
});

module.exports = new Katana;

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

if (Config.cookie.enabled) module.exports.Cookie = require('./cookie');
if (Config.session.enabled) module.exports.Session = require('./session');
























































