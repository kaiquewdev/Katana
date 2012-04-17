var Url        = require('url');
var sanitize   = require('./utils').sanitize;
var check      = require('./utils').check;

var App = require('katana');

var Log    = App.Log;
var Router = require('./router');

var routing = require('./config')('routing');

require('joose');

Class('Katana.Core.Request', {
	have: {
		request: null, response: null,
		method: 'get', url: null, uri: '/', routed_uri: '',
		module: '', directory: '', controller: '', action: '', arguments: [],
		client: {}, data: {}, files: {}, cookie: {}, session: {},
		
		methods: ['get', 'post', 'put', 'delete']
	},
	
	methods: {
		BUILD: function(Request, Response) {
			return {
				request: Request,
				response: Response
			}
		},
		
		initialize: function() {
		  var Request = this;
		
	 	  Request.method = Request.request.method.toLowerCase();
	    Request.url = Url.parse(Request.request.url);
	    Request.uri = sanitize(Request.url.pathname).trim('\\s\/');
	
	    Request.data  = Request.request.data;
	    Request.files = Request.request.files;
	
	    Request.client = {
		    ip: Request.request.connection.remoteAddress
	    }
	
	    var route = Router.route(Request.uri, routing);
	
	    Request.module     = route.module;
	    Request.directory  = route.directory;
		  Request.controller = route.controller;
		  Request.action     = route.action;
		  Request.arguments  = route.arguments;
		  Request.routed_uri = route.routed;
	  }
	}
});

module.exports = Katana.Core.Request;
