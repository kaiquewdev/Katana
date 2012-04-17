var App = require('katana');

require('joose');

Class('Home_Controller', {
	isa: App.Controller,
	
	methods: {
		index: function(Response, Request) {
			Response.render('index', { title: 'Katana - HMVC web application development framework.' });
		}
	}
});

module.exports = new Home_Controller;
