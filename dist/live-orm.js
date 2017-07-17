var Connector, ORM, applyFilter, debug,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

debug = require('debug')('loopback:connector:live');

Connector = require('loopback-connector').Connector;

applyFilter = require('loopback-filters');

ORM = (function(superClass) {
  extend(ORM, superClass);

  function ORM() {
    return ORM.__super__.constructor.apply(this, arguments);
  }

  ORM.prototype.create = function(model, data, options, callback) {
    var id, idName, properties, ref, type;
    properties = this._models[model].properties;
    idName = this.idName(model);
    type = (ref = properties[idName]) != null ? ref.type : void 0;
    id = this.getIdValue(model, data);
    if (type) {
      id = type(id) || id;
    }
    this.setIdValue(model, data, id);
    if (this.collection(model).has(id)) {
      return callback(new Error('Duplicate entry for ' + model + '.' + idName));
    }
    this.collection(model).push(data);
    return callback(null, id);
  };

  ORM.prototype.count = function(model, where, options, callback) {
    var count, data, result;
    data = this.collection(model);
    count = data.length;
    if (where) {
      result = applyFilter(data, {
        where: where
      });
      count = result.length;
    }
    return callback(null, count);
  };

  ORM.prototype.destroy = function(model, id, options, callback) {
    return callback(null, {
      count: this.collection(model).remove(id)
    });
  };

  ORM.prototype.destroyAll = function(model, where, options, callback) {
    var count, data, result;
    data = this.collection(model);
    count = data.length;
    if (where) {
      result = applyFilter(data, {
        where: where
      });
      this.collection(model, result);
      count = count - result.length;
    } else {
      this.collection(model, []);
    }
    return callback(null, {
      count: count
    });
  };

  ORM.prototype.exists = function(model, id, options, callback) {
    return callback(null, this.collection(model).has(id));
  };

  ORM.prototype.all = function(model, filter, options, callback) {
    var data, idNames, results;
    data = this.collection(model);
    if (!filter) {
      return data;
    }
    if (!filter.order) {
      idNames = this.idNames(model);
      if (idNames && idNames.length) {
        filter.order = idNames.map(function(name) {
          return name + ' ASC';
        });
      }
    }
    results = applyFilter(data, filter);
    if (results.length && (filter != null ? filter.include : void 0)) {
      return this._models[model].model.include(results, filter.include, options, callback);
    } else {
      return callback(null, results);
    }
  };

  ORM.prototype.find = function(model, id, options, callback) {
    return callback(null, this.collection(model).get(id));
  };

  ORM.prototype.findOrCreate = function(model, filter, data, callback) {
    return this.all(model, filter, {}, (function(_this) {
      return function(err, arg) {
        var data;
        data = arg[0];
        if (err || data) {
          return callback(err, data, false);
        }
        return _this.create(model, data, function(err, id) {
          return callback(err, data, true);
        });
      };
    })(this));
  };

  ORM.prototype.replaceById = function(model, id, data, options, cb) {
    if (!id) {
      return cb(new Error('You must provide an id when replacing!'));
    }
    this.setIdValue(model, data, id);
    if (!this.collection(model).has(id)) {
      return cb(new Error('Could not replace. Object with id ' + id + ' does not exist!'));
    }
    return cb(null, this.collection(model).replace(data));
  };

  ORM.prototype.replaceOrCreate = function(model, data, options, callback) {
    var filter, id, idName;
    idName = this.idNames(model)[0];
    id = this.getIdValue(model, data);
    filter = {
      where: {}
    };
    filter.where[idName] = id;
    return this.all(model, filter, {}, (function(_this) {
      return function(err, arg) {
        var data;
        data = arg[0];
        if (!data) {
          return _this.create(model, data, function(err, id) {
            return callback(err, data, {
              isNewInstance: true
            });
          });
        } else {
          _this.collection(model).replace(data);
          return callback(err, data, {
            isNewInstance: false
          });
        }
      };
    })(this));
  };

  ORM.prototype.save = function(model, data, options, callback) {
    var exists;
    exists = this.collection(model).has(data);
    this.collection(model).update(data, true);
    return callback(null, data, {
      isNewInstance: !exists
    });
  };

  ORM.prototype.update = function(model, where, update, options, callback) {
    var data, results;
    if (where == null) {
      where = {};
    }
    data = this.collection(model);
    results = applyFilter(data, {
      where: where
    });
    results.forEach((function(_this) {
      return function(item) {
        var id;
        id = _this.getIdValue(model, item);
        return _this.updateAttributes(model, id, data, options, done);
      };
    })(this));
    return callback(null, {
      count: results.length
    });
  };

  ORM.prototype.updateAll = ORM.prototype.update;

  ORM.prototype.updateAttributes = function(model, id, data, options, callback) {
    if (id) {
      this.setIdValue(model, data, id);
      if (this.collection(model).has(data)) {
        return this.save(model, data, options, callback);
      }
    }
    return callback(new Error('Could not update attributes. Object with id ' + id + ' does not exist!'));
  };

  ORM.prototype.updateOrCreate = function(model, data, options, callback) {
    var exists;
    exists = this.collection(model).has(data);
    this.collection(model).update(data, true);
    return callback(null, data, {
      isNewInstance: !exists
    });
  };

  return ORM;

})(Connector);

module.exports = ORM;
