var Formidable = require('formidable');
var EventEmitter = require('events').EventEmitter;

var App = require('katana');

var config = App.Config().multipart;

Class('Katana.Core.Multipart', {
	isa: EventEmitter,
	
	methods: {
		
	}
});

var Multipart = module.exports = new Katana.Core.Multipart;

App.on('connection', function(request, response, callback) {
	if (request.method == 'GET' || request.method == 'HEAD') {
		return callback();
	}
	
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
	
	Multipart.emit('form', request);
	
	Form.on('field', function(name, value) {
		Multipart.emit('field', request, name, value);
		
		on_data(name, value, data);
	});
	
	Form.on('file', function(name, value) {
		Multipart.emit('file', request, name, value);
		
		on_data(name, value, files);
	});
	
	Form.on('error', function(error) {
		Multipart.emit('error', request, error);
		
		callback(error);
	});

  Form.on('end', function() {
	  request.data = data;
	  request.files = files;
	
	  Multipart.emit('end', request);
	
	  callback();
  });

  Form.parse(request);
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













