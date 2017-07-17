'use strict';
var KeyArray,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

KeyArray = (function(superClass) {
  extend(KeyArray, superClass);

  function KeyArray(key, prop, data) {
    var collection, define;
    if (data == null) {
      data = [];
    }
    collection = [];
    collection.__proto__ = this;
    define = function(prop, desc) {
      return Object.defineProperty(collection, prop, {
        writable: false,
        enumerable: false,
        value: desc
      });
    };
    define('key', key);
    define('property', prop);
    define('sequence', 1);
    define('ids', []);
    data.forEach(function(item) {
      return collection.push(item);
    });
    return collection;
  }

  KeyArray.prototype["new"] = function(arr) {
    if (arr == null) {
      arr = [];
    }
    return new this.constructor(this.key, this.property, arr);
  };

  KeyArray.prototype.concat = function() {
    return this["new"](Array.prototype.concat.apply(this, arguments));
  };

  KeyArray.prototype.filter = function() {
    return this["new"](Array.prototype.filter.apply(this, arguments));
  };

  KeyArray.prototype.remove = function(id) {
    var idx;
    idx = this.ids.indexOf(id[this.key] || id);
    if (idx > -1) {
      this.splice(idx, 1);
    }
    return idx > -1;
  };

  KeyArray.prototype.pop = function() {
    var removed;
    removed = Array.prototype.pop.apply(this, arguments);
    this.deindex(removed);
    return removed;
  };

  KeyArray.prototype.push = function(added) {
    var count;
    if (!Array.isArray(added)) {
      added = [added];
    }
    count = this.length;
    this.build(added).forEach((function(_this) {
      return function(add) {
        _this.index(add);
        return count = Array.prototype.push.apply(_this, [add]);
      };
    })(this));
    return count;
  };

  KeyArray.prototype.get = function(id) {
    return this[this.ids.indexOf(id)];
  };

  KeyArray.prototype.has = function(id) {
    return this.ids.indexOf(id[this.key] || id) > -1;
  };

  KeyArray.prototype.update = function(obj, create) {
    var idx, key, val;
    if (create == null) {
      create = false;
    }
    idx = this.ids.indexOf(obj[this.key]);
    if (create && idx === -1) {
      return this.push(obj);
    }
    for (key in obj) {
      if (!hasProp.call(obj, key)) continue;
      val = obj[key];
      if (!(val != null)) {
        continue;
      }
      if (typeof val === 'function') {
        continue;
      }
      this[idx][key] = val;
    }
    return idx;
  };

  KeyArray.prototype.replace = function(obj) {
    var idx;
    idx = this.ids.indexOf(obj[this.key]);
    if (idx === -1) {
      return false;
    }
    this[idx] = obj;
    return this[idx];
  };

  KeyArray.prototype.index = function(obj) {
    if (this.ids.indexOf(obj[this.key] || obj) > -1) {
      return;
    }
    this.ids[this.length] = obj[this.key];
    return this.length;
  };

  KeyArray.prototype.deindex = function(obj) {
    var idx;
    idx = this.ids.indexOf(obj[this.key] || obj);
    if (idx === -1) {
      return;
    }
    this.ids.splice(idx, 1);
    return this.ids;
  };

  KeyArray.prototype.chunk = function(size) {
    var chunks, i;
    if (size == null) {
      size = 1;
    }
    chunks = [];
    i = 0;
    while (i < this.length) {
      chunks.push(this["new"](this.slice(i, i + size)));
      i += size;
    }
    return chunks;
  };

  KeyArray.prototype.shift = function() {
    var removed;
    removed = Array.prototype.shift.apply(this, arguments);
    this.deindex(removed);
    return removed;
  };

  KeyArray.prototype.splice = function(index, count, elements) {
    var args, removed;
    args = [index, count];
    if (elements) {
      if (!Array.isArray(elements)) {
        elements = [elements];
      }
      elements = this.build(elements);
      args[3] = elements;
    }
    removed = Array.prototype.splice.apply(this, args);
    if (elements) {
      elements.forEach((function(_this) {
        return function(element) {
          return _this.index(element);
        };
      })(this));
    }
    removed.forEach((function(_this) {
      return function(element) {
        return _this.deindex(element);
      };
    })(this));
    return removed;
  };

  KeyArray.prototype.build = function(arr) {
    return arr.filter((function(_this) {
      return function(obj) {
        var base, exists;
        if (!obj[_this.key]) {
          obj[_this.key] = (typeof (base = _this.property).type === "function" ? base.type() : void 0) || _this.sequence++;
          exists = false;
        } else {
          exists = _this.has(obj);
        }
        return !exists;
      };
    })(this));
  };

  KeyArray.prototype.unshift = function(added) {
    var count;
    if (!Array.isArray(added)) {
      added = [added];
    }
    count = this.length;
    this.build(added).forEach((function(_this) {
      return function(add) {
        _this.index(add);
        return count = Array.prototype.unshift.apply(_this, [add]);
      };
    })(this));
    return count;
  };

  return KeyArray;

})(Array);

module.exports = KeyArray;
