var Formidable = require('formidable');

var App = require('katana');

var Log = App.Log;

App.on('connection', function(request, response, callback) {
	if (request.method == 'POST' || request.method == 'PUT') {
	  var Form = new Formidable.IncomingForm();
	
	  request.form = Form;
	
	  Form.parse(request, function(error, fields, files) {
		  if (error) { Log.error('Error parsing request:\n' + error); return callback(); }
		
		  request.data  = fields;
		  request.files = files;
		
		  return callback();
	  });
	} else {
		callback();
	}
});

module.exports = {}
