var Memory = function(config) {
	this.config = config;
	this.data = {};
	
	this.set = function(key, value) {
		this.data[key] = value;
	}
	
	this.get = function(key, def_value) {
		if (!key) { return this.data; }
		
		return (this.data[key] !== undefined ? this.data[key] : def_value);
	}
	
	this.delete = function(key) {
		if (!key) { return this.data = {}; }
		
		if (this.data[key] !== undefined) {
			return delete this.data[key];
		}
	}
}

module.exports = function(name, config, callback) {
	var store = new Memory(config);
	
	callback(name, store);
}
