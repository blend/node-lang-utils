'use strict';

var crypto = require('crypto');
var assert = require('assert');
var async = require('async');
var _ = require('lodash');

function cbify(fn, cb) {
  return function(err, ret) {
    if (err) return cb(err);
    cb(null, fn(ret));
  };
}

var timed = function(label, fn, cb, minToShow) {
  assert(_.isFunction(fn), 'expected main function but was ' + JSON.stringify(fn));
  assert(_.isFunction(cb), 'expected callback function but was ' + JSON.stringify(cb));

  if (!minToShow) {
    console.log('"' + label + '" timed execution starting...');
  }

  var start = Date.now();
  fn(function(err, ret) {
    var duration = Date.now() - start;
    if (!minToShow || duration > minToShow) {
      console.log('"' + label + '" took ' + duration + 'ms');
    }

    if (err) {
      console.log('"' + label + '" returned with an error.');
      console.trace(err);
      return cb(err);
    }

    cb(null, ret);
  });
};

var md5 = function(str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
};

var endsWith = function(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

var provide = function(cb, v) {
  assert(_.isFunction(cb));

  return function(err, x) {
    if (err) return cb(err);
    cb(null, v);
  };
};

var asyncCompactMap = function(inputs, fn, cb) {
  async.map(
    inputs,
    fn,
    function(err, ret) {
      if (err) return cb(err);
      return cb(null, _.compact(ret));
    }
  );
};

var asyncFlatMap = function(inputs, fn, cb) {
  async.map(
    inputs,
    fn,
    function(err, ret) {
      if (err) return cb(err);
      return cb(err, _.flatten(_.compact(ret)));
    }
  );
};

var isNullOrUndefined = function(val) {
  return _.isNull(val) || _.isUndefined(val);
};

// TODO (em) JSON.stringify is not a unique hash... find a better hash.
var uniqObjs = function(objs) {
  var m = {};
  objs.forEach(function(obj) {
    m[JSON.stringify(obj)] = obj;
  });
  return _.values(m);
};

// TODO (em) does this exist in lodash already?
var mapPick = function(arr, fields, cb) {
  return arr.map(function(e) {
    return _.pick(e, fields);
  });
};

function cbPluck(cb, field) {
  return function(err, ret) {
    if (err) return cb(err);
    cb(null, ret ? ret[field] : null);
  };
}

function asyncFilter2(items, fn, cb) {
  async.filter(
    items,
    function(item, cb) {
      fn(item, function(err, ret) {
        if (err) {
          console.trace(err);
          return cb(false);
        }
        cb(ret);
      });
    },
    function(filteredItems) {
      cb(null, filteredItems);
    }
  );
}

function index(items, fn_) {
  var fn = _.isString(fn_) ? function(x) { return x[fn_]; } : fn_;

  var out = {};
  items.forEach(function(item) {
    out[fn(item)] = item;
  });
  return out;
}

function startsWith(s1, s2) {
  return s1.indexOf(s2) === 0;
}

function assertFieldsPresent(obj, fields) {
  fields.forEach(function(field) {
    assert(_.has(obj, field), ('"' + field + '" is missing in ' + JSON.stringify(obj)).red);
  });
}

function str() {
  return Array.prototype.slice.call(arguments).join(' ');
}

function timedFn(fn, minToShow) {
  return function() {
    var args = arguments;
    var cb = args[args.length - 1];

    timed(
      fn.name || 'anonymous function',
      function(cb) {
        args[args.length - 1] = cb;
        fn.apply(null, args);
      },
      cb,
      minToShow
    );
  };
}

function kv(key, value) {
  var x = {};
  x[key] = value;
  return x;
}

function requireString(v, name) {
  if (!_.isString(v)) {
    throw new Error('expected ' + name + ' to be string but was ' + JSON.stringify(v));
  }
}

function requireObject(v, name) {
  if (!_.isObject(v)) {
    throw new Error('expected ' + name + ' to be object but was ' + JSON.stringify(v));
  }
}

function requireFunction(v, name) {
  if (!_.isFunction(v)) {
    throw new Error('expected ' + name + ' to be function but was ' + JSON.stringify(v));
  }
}

function getPath(obj, path) {
  if (!obj) return null;

  var cur = obj;
  for (var i = 0; i < path.length; i += 1) {
    cur = cur[path[i]];
    if (!cur) return null;
  }

  return cur;
}

function arrDeref(o, ref, i) {
  return !ref || !o ? o : (o[ref.slice(0, i ? -1 : ref.length)]);
}

function dotDeref(o, ref) {
  return !ref || !o ? o : ref.split('[').reduce(arrDeref, o);
}

function setObjWithPath(obj, path, value) {
  var paths = path.split('.');
  var lastPath = paths.pop();
  var lastObj = paths.reduce(dotDeref, obj);
  lastObj[lastPath] = value;
}

function selectObjWithPath(obj, path) {
  return path.split('.').reduce(dotDeref, obj);
}

function fileExt(filename) {
  return _.last(filename.split('.'));
}

module.exports = {
  // Async wrappers.
  asyncFilter2: asyncFilter2,
  asyncCompactMap: asyncCompactMap,
  asyncFlatMap: asyncFlatMap,

  // Callback utils.
  cbPluck: cbPluck,
  cbify: cbify,
  provide: provide,

  // String utils.
  str: str,
  strContains: _.contains, // TODO - remove this
  startsWith: startsWith,
  endsWith: endsWith,

  // Validators.
  assertFieldsPresent: assertFieldsPresent,
  requireFunction: requireFunction,
  requireObject: requireObject,
  requireString: requireString,

  // Timers.
  timed: timed,
  timedFn: timedFn,

  // Collection utils.
  kv: kv,
  index: index,
  uniqObjs: uniqObjs,
  mapPick: mapPick,

  // Misc.
  isNullOrUndefined: isNullOrUndefined,
  md5: md5,
  fileExt: fileExt,

  // Object path selection
  getPath: getPath,
  setObjWithPath: setObjWithPath,
  selectObjWithPath: selectObjWithPath
};
