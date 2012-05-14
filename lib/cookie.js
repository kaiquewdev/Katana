var App = require('./katana');
var Log = App.Log;

var sanitize = require('./utils').sanitize;

var config = App.Config().cookie;

require('joose');

Class('Katana.Core.Cookie', {
	have: {
		data: {}
	},
	
	methods: {
		parse: function(Request) {
			var Cookies = this;
			
			if (Request.request.headers['cookie']) {
				var c = Request.request.headers['cookie'].split(';');

				var item, parsed, name, value;

				for (var i=0; i<c.length; i++) {
					item = sanitize(c[i]).trim();

					parsed = item.split('=');

					name = parsed[0];
				  value = parsed[1];

				  Cookies.data[name] = new Cookie(name, value, config);
				}
			}
		},
		
		to_array: function() {
		  var send = [];
	
	    for (var cookie in this.data) {
	      var c = this.data[cookie];
	
	      if (c.send) {
	        send.push(c.toString());
	      }
	    }
	
	    return send;	
		},
		
		get: function(name, def_value) {
			if (!name) { return this.data; }
			
			var cookie = this.data[name] !== undefined ? this.data[name].value : def_value;
			
			return cookie;
		},
		
		set: function(name, value, options) {
			this.data[name] = new Cookie(name, value, options);
		}
	}
});

var Cookie = function(name, value, options) {
	this.name = name;
	this.value = value;
	
	options = options || {};
	this.path     = options.path || '/';
	
	this.expires = null;
	
	if (options.lifetime != null) {
		this.expires = new Date(Date.now() + options.lifetime).toGMTString();
	}
	
	this.domain   = options.domain || null;
	this.httpOnly = options.httpOnly || true;
	this.send     = true;
	
	this.toString = function() {
		var arr = [this.name +'='+ this.value];
		var keys = ['path', 'expires', 'domain'];
		
		for (var i=0; i<keys.length; i++) {
			key = keys[i];
			
			if (this[key]) {
				arr.push(key +'='+ this[key]);
			}
		}
		
		if (this.httpOnly) {
			arr.push('HttpOnly');
		}
		
		return arr.join('; ');
	}
}

App.on('request', function(Request, Response, callback) {
	var Cookies = new Katana.Core.Cookie;
	
	Cookies.parse(Request);
	
	Request.cookie = Cookies;
	
	callback();
});

App.on('send_response', function(Response, Request, callback) {
	App.series('cookie.send', function() {
		Response.header('Set-Cookie', Request.cookie.to_array());

		callback();
	}, Response, Request);
});

module.exports = Katana.Core.Cookie;





























