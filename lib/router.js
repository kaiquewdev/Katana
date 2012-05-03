var sanitize = require('./utils').sanitize;
var check    = require('./utils').check;
var inspect  = require('util').inspect;

var App = require('katana');

require('joose');

Class('Katana.Core.Router', {
	have: {
		cache: {}
	},
	
	methods: {
		route: function(uri, Config, module) {
			var Router = this;
			
			var source = '';
			var routed = uri;
			var routes = Config.routes ? Config.routes : {};
			var mod;
			
			if (!Config.route) { Config.route = {}; }
			
			var route = {
				module: module ? module : '',
				directory: Config.route.directory || '',
				controller: Config.route.controller || (module || 'home'),
				action: Config.route.index || 'index',
				arguments: Config.route.arguments || [],
				routed: routed
			};
			
			if (!Router.cache[module || 'default']) { Router.cache[module || 'default'] = {}; }
			
			if (Router.cache[module || 'default'][uri]) {
				return Router.cache[uri];
			}
			
			if (!uri || (Config.allowed_characters && uri.match(new RegExp('^['+ Config.allowed_characters +']+$', 'i')) === null)) {
				return route;
			}
			
			for (var i=0; i<routes.length; i++) {
				source = routes[i][0];
				
				var m = uri.match(new RegExp('^'+ source +'$', 'i'));
				
				if (m !== null) {
					routed = routes[i][1];
					
					m = m.slice(1);
					
					for (var j=0; j<m.length; j++) {
						routed = routed.replace('$' + (j+1), m[j]);
					}
					
					if (!route.module) {
						mod = routed.match(/^(M|Mod|Module):(.*)$/i);
						if (mod) {
							routed = routed.replace(new RegExp('^'+ mod[1] +':'), '');
						}
					}
					
					var dir = routed.match(new RegExp('\\[(.*)\\]', 'i'));
          if (dir !== null) {
	          dir = dir.slice(1)[0];

	          routed = routed.replace('['+ dir +']', '');

	          route.directory = sanitize(dir.toLowerCase()).trim('\\s\/') + '/';
          }
          
          route.routed = routed;

		      break;
				}
			}
			
		  var segments = routed.indexOf('/')!=-1 ? routed.split('/') : (routed!='' ? [routed] : {});

      if (segments.length > 0 && mo && !route.module) { 
	      route.module = segments.shift().toLowerCase();
	
	      route.routed = route.routed.replace(new RegExp('^'+ route.module +'[\/]?', 'i'), '');
	    }
	
		  if (segments.length > 0) { route.controller = segments.shift().toLowerCase(); }
		  if (segments.length > 0) { route.action = segments.shift().toLowerCase(); }
		  if (segments.length > 0) { route.arguments = segments; }
		
      Router.cache[module || 'default'][uri] = route;

	    return route;
		}
	}
});

module.exports = new Katana.Core.Router;












































