var root = global.root;

var extend = require('../utils').extend;

var Config = require('../config')().view;

require('./engine');
require('joose');

Class('Katana.Core.View.Ejs', {
	does: Katana.Core.View.Engine,
	
	have: {
		ejs: null
	},
	
	methods: {
		initialize: function() {
			this.ejs = require('ejs');
			this.ejs.open = Config.o_tag;
		  this.ejs.close = Config.c_tag;
			
			this.load();
		},
		
		render: function(template, data) {
			template = template.replace('.', '/');
			data = data || {};
			
			var module = 'application';
			
			if (m = template.match(/(.*)\:(.*)/i)) {
				module   = m[1];
				template = m[2];
			}
			
			data = extend(this.data, data);
			
			if (this.views[module] && this.views[module][template]) {
				return this.ejs.render(this.views[module][template], { locals: data });
			} else {
				// handle no view exception...
				return '';
			}
		}
	}
});

module.exports = Katana.Core.View.Ejs;





























































































