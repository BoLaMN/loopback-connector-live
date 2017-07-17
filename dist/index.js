var KeyArray, Live, ORM, debug,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

debug = require('debug')('loopback:connector:live');

ORM = require('./live-orm');

KeyArray = require('./key-array');

Live = (function(superClass) {
  extend(Live, superClass);

  function Live(url, dataSource1) {
    this.url = url;
    this.dataSource = dataSource1;
    Live.__super__.constructor.apply(this, arguments);
    this.name = 'live';
    this.data = {};
    this.settings = this.dataSource.settings || {};
    debug('Settings: %j', this.settings);
  }

  Live.initialize = function(dataSource, callback) {
    var connector;
    connector = new Live(null, dataSource);
    dataSource.connector = connector;
    dataSource.connector.connect(callback);
  };

  Live.prototype.getTypes = function() {
    return ['db', 'nosql', 'mongodb'];
  };

  Live.prototype.getDefaultIdType = function() {
    return this.dataSource.ObjectID;
  };

  Live.prototype.define = function(definition) {
    var model;
    Live.__super__.define.call(this, definition);
    model = definition.model.modelName;
    this.collection(model);
  };

  Live.prototype.collection = function(model, data) {
    var base, id, name, prop;
    name = this.collectionName(model);
    id = this.idName(model);
    prop = this._models[model].properties[id];
    if (data) {
      this.data[name] = new KeyArray(id, prop, data);
    }
    if ((base = this.data)[name] == null) {
      base[name] = new KeyArray(id, prop);
    }
    return this.data[name];
  };

  Live.prototype.collectionName = function(model) {
    var modelClass, ref;
    modelClass = this._models[model];
    return ((ref = modelClass.settings[this.name]) != null ? ref.collection : void 0) || model;
  };

  Live.prototype.connect = function(callback) {
    return process.nextTick(callback);
  };

  Live.prototype.disconnect = function(callback) {
    debug('disconnect');
    if (callback) {
      return process.nextTick(callback);
    }
  };

  return Live;

})(ORM);

module.exports = Live;
