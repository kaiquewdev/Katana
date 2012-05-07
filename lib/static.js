var root = global.root;

var Path   = require('path');
var Fs     = require('fs');
var Url    = require('url');
var Buffer = require('buffer');
var Mime   = require('mime');

var parse_range = require('./utils').parse_range;
var request_modified = require('./utils').request_modified;

var App = require('./katana');

var domain = App.Config().domain;
var config = App.Config().static;

module.exports = function(request, response) {
	var path = request.url;
	var public_path = Path.join(root, config.path);
	
	if (config.get_only && request.method!='GET' && request.method!='HEAD') {
		// Ignore non GET methods
	}
	
	try {
		path = decodeURIComponent(path);
	} catch(error) {
		reponse.writeHead(400, { 'Content-Type': 'text/plain' });
		reponse.end('invalid request');
		
		return;
	}
	
	if (~path.indexOf('\0')) {
		reponse.writeHead(400, { 'Content-Type': 'text/plain' });
		reponse.end('invalid request');
		
		return;
	}
	
	path = Path.join(root, path);
	
	if (path.indexOf(public_path) !== 0) {
		response.writeHead(403, { 'Content-Type': 'text/plain' });
		response.end('403 - Forbidden');
		
		return;
	}
	
	if (!config.hiddens && Path.basename(path)[0]=='.') {
		response.writeHead(403, { 'Content-Type': 'text/plain' });
		response.end('403 - Forbidden');
		
		return;
	}
	
	Fs.stat(path, function(error, stat) {
		if (error) {
			response.writeHead(404, { 'Content-Type': 'text/plain' });
			response.end('404 - Not found');

			return;
		} else if (stat.isDirectory()) {
			response.statusCode = 301;
			response.setHeader('Location:', domain);
			response.end('Redirecting to /');
			
			return;
		}
		
		var type = Mime.lookup(path);
		
		if (!response.getHeader('Date')) { response.setHeader('Date', new Date().toUTCString()); }
		if (!response.getHeader('Cache-Control')) { response.setHeader('Cache-Control', 'public, max-age=' + (config.max_age / 1000)); }
		if (!response.getHeader('Last-Modified')) { response.setHeader('Last-Modified', stat.mtime.toUTCString()); }
		
		if (!response.getHeader('Content-Type')) {
		  var charset = Mime.charsets.lookup(type);
		
		  response.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
		}
		
		response.setHeader('Accept-Ranges', 'bytes');
		
		if (request.headers['if-modified-since'] || request.headers['if-none-match']) {
			if (!request_modified(request, response)) {
				request.emit('static');
				
				Object.keys(response._headers).forEach(function(header) {
					if (header.indexOf('Content') == 0) {
						response.removeHeader(header);
					}
				});
				
				response.statusCode = 304;
				return response.end();
			}
		}
		
		var ranges = request.headers.range;
		
		var options = {};
		var len     = stat.size;
		
		if (ranges) {
			ranges = parse_range(len, ranges);
			
			if (ranges) {
				options.start = ranges[0].start;
				options.end   = ranges[0].end;

				if (options.start > len - 1) {
          response.setHeader('Content-Range', 'bytes */' + stat.size);

          return response.end('invalid range');
        }
				        
        if (options.end > len - 1) { options.end = len - 1; }

				len = options.end - opts.start + 1;
				
		    response.statusCode = 206;
		
        response.setHeader('Content-Range', 'bytes '+ opts.start +'-'+ opts.end +'/'+ stat.size);
			}
		}
		
		response.setHeader('Content-Length', len);

		if (request.method == 'HEAD') {
			return response.end();
		}
		
		var stream = Fs.createReadStream(path);
		
		request.emit('static', stream);
		
		request.on('close', stream.destroy.bind(stream));
		
		stream.pipe(response);
		
		// handle errors...
	});
}









































