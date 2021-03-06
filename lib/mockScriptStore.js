'use strict';
var MockScriptStore = function() {
  this.data = {};
};

MockScriptStore.prototype.get = function(key, cb) {
  cb(null, (this.data && this.data[key] || null));
};

MockScriptStore.prototype.set = function(key, value, cb) {
  this.data[key] = value;
  cb && cb(null);
};

MockScriptStore.prototype.del = function(key, cb) {
  delete this.data[key];
  cb && cb(null);
};

MockScriptStore.prototype.clear = function(cb) {
  this.data = {};
  cb && cb(null);
};

module.exports = MockScriptStore;
