var App  = require('./katana');
var View = App.View;

var to_json = JSON.stringify;

require('joose');

Class('Katana.Core.Response', {
	have: {
		response: null, request: null,
		status: 200, type: 'text/html', charset: 'utf-8',
		content: '', redirect_url: null
	},
	
	methods: {
		BUILD: function(Response, Request) {
			return {
				response: Response,
				request: Request
			}
		},
		
		send: function(content, type, status, charset) {
			var Response = this;
			
			content && (this.content = content);
			type    && (this.type    = type);
			charset && (this.charset = charset);
			status  && (this.status  = status);
			
			App.series('send_response', function(error, results) {
				if (error) { throw error; }
				
				if (typeof(Response.content) === 'object') {
					Response.content = to_json(Response.content);
					Response.type = 'application/json';
				}

				Response.response.writeHead(Response.status, { 'Content-Type': Response.type, 'charset': Response.charset });
				Response.response.end(Response.content);
			}, Response, Response.request);
		},
		
	  header: function(name, value) {
		  if (arguments.length == 1) { return this.response.getHeader(name); }
		
		  this.response.setHeader(name, value);
		
		  return this;
	  },
	
	  set: function(name, value) {
		  if (arguments.length == 2) {
			  this.response.setHeader(name, value);
		  } else {
			  for (var key in name) {
				  this.response.setHeader(key, name[key]);
			  }
		  }
		
		  return this;
	  },
	
	  get: function(name) {
		  return this.response.getHeader(name);
	  },
	
	  cache: function(type, time) {
		  if (time) { type += ', max-age=' + time; }
		
		  this.set('Cache-Control', type);
	  },
	
	  redirect: function(url) {
		  var Response = this;
		
		  var status = 302;
		
		  if (arguments.length == 2) {
			  status = arguments[0];
			  url = arguments[1];
		  }
		
		  url = url || '/';
		
		  Response.redirect_url = url;
		
		  App.series('send_response', function(error, results) {
				if (error) { throw error; }

        Response.response.setHeader('location', url);

				Response.response.writeHead(status, { 'Content-Type': Response.type, 'charset': Response.charset });
				Response.response.end('Redirecting to: '+ url);
			}, Response, Response.request);
	  },
	
	  render: function(template, data, type, status, charset) {
		  this.send(View.render(template, data), type, status, charset);
	  }
	}
});

module.exports = Katana.Core.Response;


































































