var App = global.App;

require('joose');

Class('Home_Controller', {
	isa: App.Controller,
	
	methods: {
		index: function(Response, Request) {
			Response.render('index', { title: 'Katana is MVC/HMVC object-oriented web application development framework for any Node.js samurai.' });
		}
	}
});

module.exports = new Home_Controller;
