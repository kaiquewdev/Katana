var Formidable = require('formidable');
var EventEmitter = require('events').EventEmitter;

var App = require('katana');

var config = App.Config().multipart;

Class('Katana.Core.Multiparser', {
	isa: EventEmitter,
	
	methods: {
		
	}
});

var Multiparser = module.exports = new Katana.Core.Multiparser;

App.on('connection', function(request, response, callback) {
	var need_parse = request.method != 'GET' && request.method != 'HEAD';
	
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
		var data = {};
		var files = {};

		request.form = Form;

		Object.keys(config).forEach(function(key) {
			Form[key] = config[key];
		});

		Multiparser.emit('form', request);

		Form.on('field', function(name, value) {
			Multiparser.emit('field', request, name, value);

			on_data(name, value, data);
		});

		Form.on('file', function(name, value) {
			Multiparser.emit('file', request, name, value);

			on_data(name, value, files);
		});

    Form.on('progress', function(received, expected) {
	    Multiparser.emit('progress', request, received, expected);
    });

    Form.on('fileBegin', function(name, file) {
	    Multiparser.emit('fileBegin', request, name, file);
    });

    Form.on('aborted', function() {
	    Multiparser.emit('aborted');
    });

		Form.on('error', function(error) {
			Multiparser.emit('error', request, error);

			callback(error);
		});

	  Form.on('end', function() {
		  request.data = data;
		  request.files = files;

		  Multiparser.emit('end', request);

		  callback();
	  });

	  Form.parse(request);
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













