var App = global.App;

require('joose');

Class('Home_Controller', {
	isa: App.Controller,
	
	methods: {
		index: function(Response, Request) {
			Response.render('index', { title: 'Katana - Easy to use, hmvc scalable web framework for any Node.js samurai.' });
		}
	}
});

module.exports = new Home_Controller;
