var Path = require('path');
var Fs   = require('fs');
var Util = require('util');

var Crypto     = require('crypto');
var Validator  = require('validator');
var Underscore = require('underscore');

var Arr = require('joose').A;
var Str = require('joose').S;
var Obj = require('joose').O;

var exec  = require('child_process').exec;
var pump  = require('util').pump;
var mkdir = require('mkdirp');

var ANSI_CODES = {
  "off": 0,
  "bold": 1,
  "italic": 3,
  "underline": 4,
  "blink": 5,
  "inverse": 7,
  "hidden": 8,
  "black": 30,
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
  "magenta": 35,
  "cyan": 36,
  "white": 37,
  "black_bg": 40,
  "red_bg": 41,
  "green_bg": 42,
  "yellow_bg": 43,
  "blue_bg": 44,
  "magenta_bg": 45,
  "cyan_bg": 46,
  "white_bg": 47
};

module.exports = {
	md5: function md5(str, encoding) {
		return Crypto.createHash('md5').update(str).digest(encoding || 'hex');
	},
	
	sha1: function sha1(str, encoding) {
		return Crypto.createHash('sha1').update(str).digest(encoding || 'hex');
	},
	
	sha256: function sha256(str, encoding) {
		return Crypto.createHash('sha256').update(str).digest(encoding || 'hex');
	},
	
	sha512: function sha512(str, encoding) {
		return Crypto.createHash('sha512').update(str).digest(encoding || 'hex');
	},
	
	hmac: function hmac(str, key) {
     return Crypto.createHmac('sha1', key).update(str).digest('hex');
   },
	
	sign: function sign(str, key, delimiter) {
		return str + (delimiter || '||') + this.hmac(str, key);
	},
   
	unsign: function unsign(signed_str, key, delimiter) {
		delimiter = delimiter || '||';
		
		if (signed_str.indexOf(delimiter) == -1) { return signed_str; }
		
		var parts = signed_str.split(delimiter), str = parts[0];
		
		return this.sign(str, key, delimiter) === signed_str ? str : false;
	},
	
	encrypt: function encrypt(str, key) {
		var cipher = Crypto.createCipher('aes192', key);
		
		return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
	},
	
	decrypt: function decrypt(str, key) {
		var decipher = Crypto.createDecipher('aes192', key);
		
		return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
	},

  encode64: function encode64(str) {
		return new Buffer(str || '').toString('base64');
	},

	decode64: function decode64(encoded) {
		return new Buffer(encoded || '', 'base64').toString('utf8');
	},
	
	merge: function merge() {
		var options, name, source, copy, copy_array, clone,
		    target = arguments[0] || {},
		    length = arguments.length,
		    deep = true,
		    i = 1;
	
	  if (typeof(target) == 'boolean') {
		  deep = target;
		  target = arguments[1] || {};
		  i = 2;
	  }
	
	  if (typeof(target) !== 'object' && typeof(target) !== 'function') { 
		  target = {}; 
		}
		
		for (; i<length; i++) {
			if ((options = arguments[i]) != null) {
				for (name in options) {
					source = target[name];
					copy = options[name];
					
					if (target === copy) {
						continue;
					}
					
					copy_array = copy instanceof Array;
					
					if (deep && copy && (typeof(copy)=='object' || copy_array)) {
						if (copy_array) {
							copy_array = false;
							clone = source && typeof(source)=='array' ? source : [];
						} else {
							clone = source && typeof(source)=='object' ? source : {};
						}
						
						target[name] = merge(deep, clone, copy);
					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}
		
		return target;
	},
	
	escape: function escape(html) {
		return String(html)
		  .replace(/&(?!\w+;)/g, '&amp;')
		  .replace(/</g, '&lt;')
		  .replace(/>/g, '&gt;')
		  .replace(/"/g, '&quot;');
	},
	
	rand_str: function rand_str(length) {
		length = length || 10;
		
		var buf = [], 
		    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 
		    chars_len = chars.length;

		for (var i=0; i<length; ++i) {
		  buf.push(chars[Math.random() * chars_len | 0]);
		}

		return buf.join('');
	},
	
	rand: function rand(min, max) {
		min = min || 0;
		
		if (max !== undefined) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		} else {
			return Math.floor(Math.random() * (min + 1));
		}
	},
	
	to_array: function to_array(object) {
		var length = object.length, 
		    array = new Array(length);
		
		for (var i=0; i<length; ++i) { array[i] = object[i]; }
		
		return array;
	},
	
	ansi_color: function ansi_color(str, color) {
		if(!color) return str;

	  var color_attrs = color.toLowerCase().replace(/\s/gi, '').split("+");
	  var ansi_str = "";

	  for(var i=0, attr; attr = color_attrs[i]; i++) {
	    ansi_str += "\033[" + ANSI_CODES[attr] + "m";
	  }

	  ansi_str += str + "\033[" + ANSI_CODES["off"] + "m";

	  return ansi_str;
	},
	
	load: function load(path, done, callback, dir, basedir) {
		var results = {};
		var pending = 0;

		path = Path.resolve(path) + '/';

		if (!dir) {
			dir = Path.basename(path, '/') +'/';
			basedir = dir;
			path = Path.dirname(path) +'/';
		} else {
			dir = Path.normalize(dir) +'/';
		}

	  Path.exists(path + dir, function(exists) {
	    if (!exists) {
		    return (typeof(done)==='function' ? done(null, results) : null);
	    }

	    Fs.readdir(path + dir, function(error, files) {
			  if (error) { return done(error); }

			  pending = files.length;

			  if (!pending) { return (typeof(done)==='function' ? done(null, results) : null); }

			  files.forEach(function(filename) {
				  var file    = path + dir + filename;
	        var dirname = dir.replace(new RegExp('^'+basedir+''), '');
	        var fname   = Path.basename(filename, Path.extname(filename));

				  Fs.stat(file, function(error, stat) {
					  if (stat && stat.isDirectory()) {
						  load(path, function(error, result) {
							  if (error) { return done(error); }

								for (key in result) {
									results[key] = result[key];
								}

	              if (typeof(callback) == 'function') {
		              var item = {
			              name: filename,
			              dirname: dirname,
			              path: path + basedir,
			              fname: fname,
			              isdir: true
		              };

		              callback(item, function(result) {
			              if (result !== undefined) {
				              results[dirname + fname] = result;
				            }

			              if (!--pending) { return (typeof(done)==='function' ? done(null, results) : null); }
		              });
	              } else {
		              if (!--pending) { return (typeof(done)==='function' ? done(null, results) : null); }
	              }
							}, callback, dir + filename, basedir);
					  } else {
	            if (typeof(callback) == 'function') {
		            var item = {
		              name: filename,
		              dirname: dirname,
		              path: path + basedir,
		              fname: fname,
		              isdir: false
	              };

		            callback(item, function(result) {
			            if (result !== undefined) {
				            results[dirname + fname] = result;
			            }

			            if (!--pending) { return (typeof(done)==='function' ? done(null, results) : null); }
		            });
	            } else {
		            results[dirname + fname] = require(path + basedir + dirname + fname);

		            if (!--pending) { return (typeof(done)==='function' ? done(null, results) : null); }
	            }
					  }
				  });
			  });
			});
	  });
	},
	
	copy_dir: function copy(src, dest, cb) {
		var load = module.exports.load;
		
		src = Path.normalize(src);
		dest = Path.normalize(dest);
		
		load(src, function(error) {
			cb(error);
		}, function(file, callback) {
			if (!Path.existsSync(dest + file.dirname)) {
				mkdir.sync(dest + file.dirname, 0777);
			}

			if (file.isdir && !Path.existsSync(dest + file.dirname + file.fname)) {
				mkdir.sync(dest + file.dirname + file.fname, 0777);
			}

			if (!file.isdir) {
				var source = Fs.createReadStream(file.path + file.dirname + file.name);
				var destination = Fs.createWriteStream(dest + file.dirname + file.name);

				pump(source, destination, function(error) {
					if (error) { console.log(error); }

					callback();
				});
			} else { callback(); }
		});
	},
	
	to_json: JSON.stringify,
	
	parse_json: JSON.parse,
	
	sanitize: Validator.sanitize,
	
	check: Validator.check,
	
	extend: Underscore.extend
}





























































