var Formidable = require('formidable');

var EventEmitter = require('events').EventEmitter;

var App = require('./katana');

var config = App.Config().multipart;

App.on('connection', function(request, response, callback) {
	var need_parse = request.method != 'GET' && request.method != 'HEAD';
	
	request.form = null;
	
	request.on('end', function() {
		if (!need_parse) {
			callback();
		}
	});
	
	if (need_parse) {
		var mime = (request.headers['content-type'] || '').split(';')[0];

		if (mime != 'multipart/form-data' && mime != 'application/x-www-form-urlencoded') {
			return callback();
		}

		var Form = new Formidable.IncomingForm();
		Form.data = {};
		Form.files = {};

		request.form = Form;
		
		App.emit('request_multipart', request);

    for (key in config) {
	    Form[key] = config[key];
    }

		Form.on('field', function(name, value) {
			on_data(name, value, Form.data);
		});

		Form.on('file', function(name, value) {
			on_data(name, value, Form.files);
		});

		Form.on('error', function(error) {
			config.wait_end && callback(error);
		});

	  Form.on('end', function() {
		  config.wait_end && callback();
	  });

	  Form.parse(request);
	
	  !config.wait_end && callback();
	}
});

function on_data(name, value, data) {
	if (Array.isArray(data[name])) {
		data[name].push(value);
	} else if (data[name]) {
		data[name] = [data[name], value];
	} else {
		data[name] = value;
	}
}













