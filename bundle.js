(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("vue-validator/index.js", function(exports, require, module){
var slice = [].slice
var hasOwn = ({}).hasOwnProperty


/**
 * export(s)
 */

module.exports = function (Vue) {
  var utils = Vue.require('utils')
  var Directive = Vue.require('directive')
  var Binding = Vue.require('binding')
  var Observer = Vue.require('observer')

  var validationKey = '$validation'
  var validationPropertyName = validationKey.split('$')[1]
  var validKey = '$valid'

  Vue.filter('required', validateRequired)
  Vue.filter('pattern', validatePattern)
  Vue.filter('length', validateLength)
  Vue.filter('numeric', validateNumeric)
  Vue.filter('validator', validateCustom)

  Vue.directive('validate', {
    bind: function () {
      var compiler = this.compiler
      var $validation = compiler[validationPropertyName] || {}
      var el = this.el
      var vm = this.vm
      var observer = compiler.observer
      var validationBindings = this.validationBindings = {}

      // enable $validation
      vm[validationKey] = compiler[validationPropertyName] = $validation
      Observer.observe($validation, validationKey, compiler.observer)
      compiler.bindings[validationKey] = new Binding(compiler, validationKey)
      validationBindings[validationKey] = compiler.bindings[validationKey]

      // register validation state from v-model directive
      function registerValidation (element) {
        if (element.nodeType === 1 
          && element.tagName !== 'SCRIPT' 
          && element.hasChildNodes()) {
          slice.call(element.childNodes).forEach(function (node) {
            if (node.nodeType === 1) {
              if (node.hasChildNodes()) {
                registerValidation(node)
              } else {
                var tag = node.tagName
                if ((tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') 
                  && node.hasAttributes) {
                  var attrs = slice.call(node.attributes)
                  for (var i = 0; i < attrs.length; i++) {
                    var attr = attrs[i]
                    if (attr.name === 'v-model') {
                      var asts = Directive.parse(attr.value)
                      var key = asts[0].key
                      var filters = asts[0].filters
                      if (filters) {
                        initValidationState($validation, key, filters, compiler, validationBindings)
                        attr.value = makeFilterExpression($validation, key, filters)
                      }
                    }
                  }
                }
              }
            }
          })
        }
      }
      registerValidation(el)

      // enable $valid
      var validBinding = compiler.bindings[validKey] = new Binding(compiler, validKey)
      validationBindings[validKey] = validBinding
      Object.defineProperty(vm, validKey, {
        enumerable: true,
        configurable: true,
        get: function () {
          observer.emit('get', validKey)
          return validBinding.value
        }
      })

      // inject validation checking handle
      function updateValid () {
        var valid = true
        for (var key in $validation) {
          if ($validation[key]) {
            valid = false
            break
          }
        }
        validBinding.update(valid)
      }
      this._handleValid = function (key) {
        if (validationKey === key || validKey === key) { return }
        if (key in validationBindings) {
          updateValid()
        }
      }
      observer.on('set', this._handleValid)
    },

    unbind: function () {
      var compiler = this.compiler
      var vm = this.vm
      var observer = compiler.observer
      var $validation = compiler[validationPropertyName]
      var validationBindings = this.validationBindings
      var bindings = compiler.bindings

      // disable $valid
      observer.off(this._handleValid)
      delete this._handleValid
      delete vm[validKey]

      // release bindings
      for (var key in validationBindings) {
        var binding = bindings[key]
        if (binding) {
          binding.unbind()
          delete bindings[key]
        }
        validationBindings[key] = null
      }
      delete this.validationBindings

      // disable $validation
      Observer.unobserve($validation, validationKey, compiler.observer)
      delete compiler[validationPropertyName]
      delete vm[validationKey]
    }
  })


  function initValidationState ($validation, key, filters, compiler, validationBindings) {
    var path, bindingPath, args = []
    for (var i = 0; i < filters.length; i++) {
      var filterName = filters[i].name
      if (filterName === 'required' || filterName === 'pattern') {
        path = [key, filterName].join('.')
        bindingPath = [validationKey, key, filterName].join('.')
        makeBinding(path, bindingPath)
      } else if (filterName === 'length' || filterName === 'numeric') {
        args = parseFilterArgs(filters[i].args)
        if (filterName === 'numeric') { args.push('value') }
        for (var j = 0; j < args.length; j++) {
          path = [key, filterName, args[j]].join('.')
          bindingPath = [validationKey, key, filterName, args[j]].join('.')
          makeBinding(path, bindingPath)
        }
      } else if (filterName === 'validator') {
        path = [key, filterName, filters[i].args[0]].join('.')
        bindingPath = [validationKey, key, filterName, filters[i].args[0]].join('.')
        makeBinding(path, bindingPath)
      }
    }

    function makeBinding (path, bindingPath) {
      var binding = validationBindings[bindingPath] || new Binding(compiler, bindingPath)
      compiler.bindings[bindingPath] = validationBindings[bindingPath] = binding
      defineProperty($validation, path, binding)
    }
  }

  function parseFilterArgs (args) {
    var ret = []

    for (var i = 0; i < args.length; i++) {
      var arg = args[i], parsed = arg.split(':')
      if (parsed.length !== 2) { continue }
      ret.push(parsed[0])
    }

    return ret
  }

  function makeFilterExpression ($validation, key, filters) {
    var elements = [key]
    var ret = ''

    for (var i = 0; i < filters.length; i++) {
      var filterName = filters[i].name
      if (filters[i].args) {
        elements.push([filterName].concat(filters[i].args).concat([key]).join(' '))
      } else {
        elements.push(filterName + ' ' + key)
      }
    }

    ret = elements.join('|')
    utils.log('makeFilterExpression: ' + ret)

    return ret
  }

  function defineProperty ($validation, key, binding) {
    var observer = $validation.__emitter__

      if (!(hasOwn.call($validation, key))) {
        $validation[key] = undefined
      }

    if (observer && !(hasOwn.call(observer.values, key))) {
      Observer.convertKey($validation, key)
    }

    binding.value = $validation[key]
  }
}


/**
 * validate filters
 */

function validateRequired (val, key) {
  try {
    this.$validation[[key, 'required'].join('.')] = (val.length === 0)
  } catch (e) {
    console.error('required filter error:', e)
  }

  return val
}

function validatePattern (val) {
  try {
    var key = arguments[arguments.length - 1]
    var pattern = arguments[1].replace(/^'/, "").replace(/'$/, "")

    var match = pattern.match(/^\/(.*)\/([gim]*)$/)
    if (match) {
      var re = new RegExp(match[1], match[2])
      this.$validation[[key, 'pattern'].join('.')] = !re.test(val)
    }
  } catch (e) {
    console.error('pattern filter error:', e)
  }

  return val
}

function validateLength (val) {
  try {
    var key = arguments[arguments.length - 1]
      var minKey = [key, 'length', 'min'].join('.')
      var maxKey = [key, 'length', 'max'].join('.')
      var args = {}

    // parse length condition arguments
    for (var i = 1; i < arguments.length - 1; i++) {
      var parsed = arguments[i].split(':')
      if (parsed.length !== 2) { continue }
      if (isNaN(parsed[1])) { continue }
      args[parsed[0]] = parseInt(parsed[1])
    }

    // validate min
    if ('min' in args) {
      this.$validation[minKey] = (val.length < args['min'])
    }

    // validate max
    if ('max' in args) {
      this.$validation[maxKey] = (val.length > args['max'])
    }
  } catch (e) {
    console.error('length filter error:', e)
  }

  return val
}

function validateNumeric (val) {
  try {
    var key = arguments[arguments.length - 1]
    var minKey = [key, 'numeric', 'min'].join('.')
    var maxKey = [key, 'numeric', 'max'].join('.')
    var valueKey = [key, 'numeric', 'value'].join('.')
    var args = {}

    // parse numeric condition arguments
    for (var i = 1; i < arguments.length - 1; i++) {
      var parsed = arguments[i].split(':')
      if (parsed.length !== 2) { continue }
      if (isNaN(parsed[1])) { continue }
      args[parsed[0]] = parseInt(parsed[1])
    }

    if (isNaN(val)) {
      this.$validation[valueKey] = true
      if ('min' in args) {
        this.$validation[minKey] = false
      }
      if ('max' in args) {
        this.$validation[maxKey] = false
      }
    } else {
      this.$validation[valueKey] = false

      var value = parseInt(val)

      // validate min
      if ('min' in args) {
        this.$validation[minKey] = (value < args['min'])
      }

      // validate max
      if ('max' in args) {
        this.$validation[maxKey] = (value > args['max'])
      }
    }
  } catch (e) {
    console.error('numeric filter error:', e)
  }

  return val
}

function validateCustom (val, custom) {
  try {
    var fn = this.$options.methods[custom]
    if (typeof fn === 'function') {
      val = fn.call(this, val)
    }
  } catch (e) {
    console.error('custom filter error:', e)
  }

  return val
}

});if (typeof exports == "object") {
  module.exports = require("./vue-validator.js");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("./vue-validator.js"); });
} else {
  this["vue-validator"] = require("./vue-validator.js");
}})();
},{"./vue-validator.js":1}],2:[function(require,module,exports){
/**
 * Vue.js v0.11.0
 * (c) 2014 Evan You
 * Released under the MIT License.
 */

(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Vue"] = factory();
	else
		root["Vue"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var extend = _.extend

	/**
	 * The exposed Vue constructor.
	 *
	 * API conventions:
	 * - public API methods/properties are prefiexed with `$`
	 * - internal methods/properties are prefixed with `_`
	 * - non-prefixed properties are assumed to be proxied user
	 *   data.
	 *
	 * @constructor
	 * @param {Object} [options]
	 * @public
	 */

	function Vue (options) {
	  this._init(options)
	}

	/**
	 * Mixin global API
	 */

	extend(Vue, __webpack_require__(2))

	/**
	 * Vue and every constructor that extends Vue has an
	 * associated options object, which can be accessed during
	 * compilation steps as `this.constructor.options`.
	 *
	 * These can be seen as the default options of every
	 * Vue instance.
	 */

	Vue.options = {
	  directives  : __webpack_require__(8),
	  filters     : __webpack_require__(9),
	  partials    : {},
	  transitions : {},
	  components  : {}
	}

	/**
	 * Build up the prototype
	 */

	var p = Vue.prototype

	/**
	 * $data has a setter which does a bunch of
	 * teardown/setup work
	 */

	Object.defineProperty(p, '$data', {
	  get: function () {
	    return this._data
	  },
	  set: function (newData) {
	    this._setData(newData)
	  }
	})

	/**
	 * Mixin internal instance methods
	 */

	extend(p, __webpack_require__(10))
	extend(p, __webpack_require__(11))
	extend(p, __webpack_require__(12))
	extend(p, __webpack_require__(13))

	/**
	 * Mixin public API methods
	 */

	extend(p, __webpack_require__(3))
	extend(p, __webpack_require__(4))
	extend(p, __webpack_require__(5))
	extend(p, __webpack_require__(6))
	extend(p, __webpack_require__(7))

	module.exports = _.Vue = Vue

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var lang   = __webpack_require__(14)
	var extend = lang.extend

	extend(exports, lang)
	extend(exports, __webpack_require__(15))
	extend(exports, __webpack_require__(16))
	extend(exports, __webpack_require__(17))
	extend(exports, __webpack_require__(18))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var mergeOptions = __webpack_require__(19)

	/**
	 * Expose useful internals
	 */

	exports.util       = _
	exports.nextTick   = _.nextTick
	exports.config     = __webpack_require__(20)

	/**
	 * Each instance constructor, including Vue, has a unique
	 * cid. This enables us to create wrapped "child
	 * constructors" for prototypal inheritance and cache them.
	 */

	exports.cid = 0
	var cid = 1

	/**
	 * Class inehritance
	 *
	 * @param {Object} extendOptions
	 */

	exports.extend = function (extendOptions) {
	  extendOptions = extendOptions || {}
	  var Super = this
	  var Sub = createClass(extendOptions.name || 'VueComponent')
	  Sub.prototype = Object.create(Super.prototype)
	  Sub.prototype.constructor = Sub
	  Sub.cid = cid++
	  Sub.options = mergeOptions(
	    Super.options,
	    extendOptions
	  )
	  Sub['super'] = Super
	  // allow further extension
	  Sub.extend = Super.extend
	  // create asset registers, so extended classes
	  // can have their private assets too.
	  createAssetRegisters(Sub)
	  return Sub
	}

	/**
	 * A function that returns a sub-class constructor with the
	 * given name. This gives us much nicer output when
	 * logging instances in the console.
	 *
	 * @param {String} name
	 * @return {Function}
	 */

	function createClass (name) {
	  return new Function(
	    'return function ' + _.camelize(name, true) +
	    ' (options) { this._init(options) }'
	  )()
	}

	/**
	 * Plugin system
	 *
	 * @param {Object} plugin
	 */

	exports.use = function (plugin) {
	  // additional parameters
	  var args = _.toArray(arguments, 1)
	  args.unshift(this)
	  if (typeof plugin.install === 'function') {
	    plugin.install.apply(plugin, args)
	  } else {
	    plugin.apply(null, args)
	  }
	  return this
	}

	/**
	 * Define asset registration methods on a constructor.
	 *
	 * @param {Function} Constructor
	 */

	var assetTypes = [
	  'directive',
	  'filter',
	  'partial',
	  'transition'
	]

	function createAssetRegisters (Constructor) {

	  /* Asset registration methods share the same signature:
	   *
	   * @param {String} id
	   * @param {*} definition
	   */

	  assetTypes.forEach(function (type) {
	    Constructor[type] = function (id, definition) {
	      if (!definition) {
	        return this.options[type + 's'][id]
	      } else {
	        this.options[type + 's'][id] = definition
	      }
	    }
	  })

	  /**
	   * Component registration needs to automatically invoke
	   * Vue.extend on object values.
	   *
	   * @param {String} id
	   * @param {Object|Function} definition
	   */

	  Constructor.component = function (id, definition) {
	    if (!definition) {
	      return this.options.components[id]
	    } else {
	      if (_.isPlainObject(definition)) {
	        definition.name = id
	        definition = _.Vue.extend(definition)
	      }
	      this.options.components[id] = definition
	    }
	  }
	}

	createAssetRegisters(exports)

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Watcher = __webpack_require__(21)
	var Path = __webpack_require__(41)
	var textParser = __webpack_require__(42)
	var dirParser = __webpack_require__(43)
	var expParser = __webpack_require__(44)
	var filterRE = /[^|]\|[^|]/

	/**
	 * Get the value from an expression on this vm.
	 *
	 * @param {String} exp
	 * @return {*}
	 */

	exports.$get = function (exp) {
	  var res = expParser.parse(exp)
	  if (res) {
	    return res.get.call(this, this)
	  }
	}

	/**
	 * Set the value from an expression on this vm.
	 * The expression must be a valid left-hand
	 * expression in an assignment.
	 *
	 * @param {String} exp
	 * @param {*} val
	 */

	exports.$set = function (exp, val) {
	  var res = expParser.parse(exp, true)
	  if (res && res.set) {
	    res.set.call(this, this, val)
	  }
	}

	/**
	 * Add a property on the VM
	 *
	 * @param {String} key
	 * @param {*} val
	 */

	exports.$add = function (key, val) {
	  this._data.$add(key, val)
	}

	/**
	 * Delete a property on the VM
	 *
	 * @param {String} key
	 */

	exports.$delete = function (key) {
	  this._data.$delete(key)
	}

	/**
	 * Watch an expression, trigger callback when its
	 * value changes.
	 *
	 * @param {String} exp
	 * @param {Function} cb
	 * @param {Boolean} [deep]
	 * @param {Boolean} [immediate]
	 * @return {Function} - unwatchFn
	 */

	exports.$watch = function (exp, cb, deep, immediate) {
	  var vm = this
	  var key = deep ? exp + '**deep**' : exp
	  var watcher = vm._userWatchers[key]
	  var wrappedCb = function (val, oldVal) {
	    cb.call(vm, val, oldVal)
	  }
	  if (!watcher) {
	    watcher = vm._userWatchers[key] =
	      new Watcher(vm, exp, wrappedCb, null, false, deep)
	  } else {
	    watcher.addCb(wrappedCb)
	  }
	  if (immediate) {
	    wrappedCb(watcher.value)
	  }
	  return function unwatchFn () {
	    watcher.removeCb(wrappedCb)
	    if (!watcher.active) {
	      vm._userWatchers[key] = null
	    }
	  }
	}

	/**
	 * Evaluate a text directive, including filters.
	 *
	 * @param {String} text
	 * @return {String}
	 */

	exports.$eval = function (text) {
	  // check for filters.
	  if (filterRE.test(text)) {
	    var dir = dirParser.parse(text)[0]
	    // the filter regex check might give false positive
	    // for pipes inside strings, so it's possible that
	    // we don't get any filters here
	    return dir.filters
	      ? _.applyFilters(
	          this.$get(dir.expression),
	          _.resolveFilters(this, dir.filters).read,
	          this
	        )
	      : this.$get(dir.expression)
	  } else {
	    // no filter
	    return this.$get(text)
	  }
	}

	/**
	 * Interpolate a piece of template text.
	 *
	 * @param {String} text
	 * @return {String}
	 */

	exports.$interpolate = function (text) {
	  var tokens = textParser.parse(text)
	  var vm = this
	  if (tokens) {
	    return tokens.length === 1
	      ? vm.$eval(tokens[0].value)
	      : tokens.map(function (token) {
	          return token.tag
	            ? vm.$eval(token.value)
	            : token.value
	        }).join('')
	  } else {
	    return text
	  }
	}

	/**
	 * Log instance data as a plain JS object
	 * so that it is easier to inspect in console.
	 * This method assumes console is available.
	 *
	 * @param {String} [path]
	 */

	exports.$log = function (path) {
	  var data = path
	    ? Path.get(this, path)
	    : this._data
	  console.log(JSON.parse(JSON.stringify(data)))
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var transition = __webpack_require__(45)

	/**
	 * Append instance to target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$appendTo = function (target, cb, withTransition) {
	  target = query(target)
	  var targetIsDetached = !_.inDoc(target)
	  var op = withTransition === false || targetIsDetached
	    ? append
	    : transition.append
	  insert(this, target, op, targetIsDetached, cb)
	  return this
	}

	/**
	 * Prepend instance to target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$prependTo = function (target, cb, withTransition) {
	  target = query(target)
	  if (target.hasChildNodes()) {
	    this.$before(target.firstChild, cb, withTransition)
	  } else {
	    this.$appendTo(target, cb, withTransition)
	  }
	  return this
	}

	/**
	 * Insert instance before target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$before = function (target, cb, withTransition) {
	  target = query(target)
	  var targetIsDetached = !_.inDoc(target)
	  var op = withTransition === false || targetIsDetached
	    ? before
	    : transition.before
	  insert(this, target, op, targetIsDetached, cb)
	  return this
	}

	/**
	 * Insert instance after target
	 *
	 * @param {Node} target
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$after = function (target, cb, withTransition) {
	  target = query(target)
	  if (target.nextSibling) {
	    this.$before(target.nextSibling, cb, withTransition)
	  } else {
	    this.$appendTo(target.parentNode, cb, withTransition)
	  }
	  return this
	}

	/**
	 * Remove instance from DOM
	 *
	 * @param {Function} [cb]
	 * @param {Boolean} [withTransition] - defaults to true
	 */

	exports.$remove = function (cb, withTransition) {
	  var inDoc = this._isAttached && _.inDoc(this.$el)
	  // if we are not in document, no need to check
	  // for transitions
	  if (!inDoc) withTransition = false
	  var op
	  var self = this
	  var realCb = function () {
	    if (inDoc) self._callHook('detached')
	    if (cb) cb()
	  }
	  if (
	    this._isBlock &&
	    !this._blockFragment.hasChildNodes()
	  ) {
	    op = withTransition === false
	      ? append
	      : transition.removeThenAppend 
	    blockOp(this, this._blockFragment, op, realCb)
	  } else {
	    op = withTransition === false
	      ? remove
	      : transition.remove
	    op(this.$el, this, realCb)
	  }
	  return this
	}

	/**
	 * Shared DOM insertion function.
	 *
	 * @param {Vue} vm
	 * @param {Element} target
	 * @param {Function} op
	 * @param {Boolean} targetIsDetached
	 * @param {Function} [cb]
	 */

	function insert (vm, target, op, targetIsDetached, cb) {
	  var shouldCallHook =
	    !targetIsDetached &&
	    !vm._isAttached &&
	    !_.inDoc(vm.$el)
	  if (vm._isBlock) {
	    blockOp(vm, target, op, cb)
	  } else {
	    op(vm.$el, target, vm, cb)
	  }
	  if (shouldCallHook) {
	    vm._callHook('attached')
	  }
	}

	/**
	 * Execute a transition operation on a block instance,
	 * iterating through all its block nodes.
	 *
	 * @param {Vue} vm
	 * @param {Node} target
	 * @param {Function} op
	 * @param {Function} cb
	 */

	function blockOp (vm, target, op, cb) {
	  var current = vm._blockStart
	  var end = vm._blockEnd
	  var next
	  while (next !== end) {
	    next = current.nextSibling
	    op(current, target, vm)
	    current = next
	  }
	  op(end, target, vm, cb)
	}

	/**
	 * Check for selectors
	 *
	 * @param {String|Element} el
	 */

	function query (el) {
	  return typeof el === 'string'
	    ? document.querySelector(el)
	    : el
	}

	/**
	 * Append operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Node} target
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function append (el, target, vm, cb) {
	  target.appendChild(el)
	  if (cb) cb()
	}

	/**
	 * InsertBefore operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Node} target
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function before (el, target, vm, cb) {
	  _.before(el, target)
	  if (cb) cb()
	}

	/**
	 * Remove operation that takes a callback.
	 *
	 * @param {Node} el
	 * @param {Vue} vm - unused
	 * @param {Function} [cb]
	 */

	function remove (el, vm, cb) {
	  _.remove(el)
	  if (cb) cb()
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$on = function (event, fn) {
	  (this._events[event] || (this._events[event] = []))
	    .push(fn)
	  modifyListenerCount(this, event, 1)
	  return this
	}

	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$once = function (event, fn) {
	  var self = this
	  function on () {
	    self.$off(event, on)
	    fn.apply(this, arguments)
	  }
	  on.fn = fn
	  this.$on(event, on)
	  return this
	}

	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 */

	exports.$off = function (event, fn) {
	  var cbs
	  // all
	  if (!arguments.length) {
	    if (this.$parent) {
	      for (event in this._events) {
	        cbs = this._events[event]
	        if (cbs) {
	          modifyListenerCount(this, event, -cbs.length)
	        }
	      }
	    }
	    this._events = {}
	    return this
	  }
	  // specific event
	  cbs = this._events[event]
	  if (!cbs) {
	    return this
	  }
	  if (arguments.length === 1) {
	    modifyListenerCount(this, event, -cbs.length)
	    this._events[event] = null
	    return this
	  }
	  // specific handler
	  var cb
	  var i = cbs.length
	  while (i--) {
	    cb = cbs[i]
	    if (cb === fn || cb.fn === fn) {
	      modifyListenerCount(this, event, -1)
	      cbs.splice(i, 1)
	      break
	    }
	  }
	  return this
	}

	/**
	 * Trigger an event on self.
	 *
	 * @param {String} event
	 */

	exports.$emit = function (event) {
	  this._eventCancelled = false
	  var cbs = this._events[event]
	  if (cbs) {
	    // avoid leaking arguments:
	    // http://jsperf.com/closure-with-arguments
	    var i = arguments.length - 1
	    var args = new Array(i)
	    while (i--) {
	      args[i] = arguments[i + 1]
	    }
	    i = 0
	    cbs = cbs.length > 1
	      ? _.toArray(cbs)
	      : cbs
	    for (var l = cbs.length; i < l; i++) {
	      if (cbs[i].apply(this, args) === false) {
	        this._eventCancelled = true
	      }
	    }
	  }
	  return this
	}

	/**
	 * Recursively broadcast an event to all children instances.
	 *
	 * @param {String} event
	 * @param {...*} additional arguments
	 */

	exports.$broadcast = function (event) {
	  // if no child has registered for this event,
	  // then there's no need to broadcast.
	  if (!this._eventsCount[event]) return
	  var children = this._children
	  if (children) {
	    for (var i = 0, l = children.length; i < l; i++) {
	      var child = children[i]
	      child.$emit.apply(child, arguments)
	      if (!child._eventCancelled) {
	        child.$broadcast.apply(child, arguments)
	      }
	    }
	  }
	  return this
	}

	/**
	 * Recursively propagate an event up the parent chain.
	 *
	 * @param {String} event
	 * @param {...*} additional arguments
	 */

	exports.$dispatch = function () {
	  var parent = this.$parent
	  while (parent) {
	    parent.$emit.apply(parent, arguments)
	    parent = parent._eventCancelled
	      ? null
	      : parent.$parent
	  }
	  return this
	}

	/**
	 * Modify the listener counts on all parents.
	 * This bookkeeping allows $broadcast to return early when
	 * no child has listened to a certain event.
	 *
	 * @param {Vue} vm
	 * @param {String} event
	 * @param {Number} count
	 */

	var hookRE = /^hook:/
	function modifyListenerCount (vm, event, count) {
	  var parent = vm.$parent
	  // hooks do not get broadcasted so no need
	  // to do bookkeeping for them
	  if (!parent || !count || hookRE.test(event)) return
	  while (parent) {
	    parent._eventsCount[event] =
	      (parent._eventsCount[event] || 0) + count
	    parent = parent.$parent
	  }
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * Create a child instance that prototypally inehrits
	 * data on parent. To achieve that we create an intermediate
	 * constructor with its prototype pointing to parent.
	 *
	 * @param {Object} opts
	 * @param {Function} [BaseCtor]
	 * @return {Vue}
	 * @public
	 */

	exports.$addChild = function (opts, BaseCtor) {
	  BaseCtor = BaseCtor || _.Vue
	  opts = opts || {}
	  var parent = this
	  var ChildVue
	  var inherit = opts.inherit !== undefined
	    ? opts.inherit
	    : BaseCtor.options.inherit
	  if (inherit) {
	    var ctors = parent._childCtors
	    if (!ctors) {
	      ctors = parent._childCtors = {}
	    }
	    ChildVue = ctors[BaseCtor.cid]
	    if (!ChildVue) {
	      var optionName = BaseCtor.options.name
	      var className = optionName
	        ? _.camelize(optionName, true)
	        : 'VueComponent'
	      ChildVue = new Function(
	        'return function ' + className + ' (options) {' +
	        'this.constructor = ' + className + ';' +
	        'this._init(options) }'
	      )()
	      ChildVue.options = BaseCtor.options
	      ChildVue.prototype = this
	      ctors[BaseCtor.cid] = ChildVue
	    }
	  } else {
	    ChildVue = BaseCtor
	  }
	  opts._parent = parent
	  opts._root = parent.$root
	  var child = new ChildVue(opts)
	  if (!this._children) {
	    this._children = []
	  }
	  this._children.push(child)
	  return child
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var compile = __webpack_require__(46)

	/**
	 * Set instance target element and kick off the compilation
	 * process. The passed in `el` can be a selector string, an
	 * existing Element, or a DocumentFragment (for block
	 * instances).
	 *
	 * @param {Element|DocumentFragment|string} el
	 * @public
	 */

	exports.$mount = function (el) {
	  if (this._isCompiled) {
	    _.warn('$mount() should be called only once.')
	    return
	  }
	  if (!el) {
	    el = document.createElement('div')
	  } else if (typeof el === 'string') {
	    var selector = el
	    el = document.querySelector(el)
	    if (!el) {
	      _.warn('Cannot find element: ' + selector)
	      return
	    }
	  }
	  this._compile(el)
	  this._isCompiled = true
	  this._callHook('compiled')
	  if (_.inDoc(this.$el)) {
	    this._callHook('attached')
	    this._initDOMHooks()
	    ready.call(this)
	  } else {
	    this._initDOMHooks()
	    this.$once('hook:attached', ready)
	  }
	  return this
	}

	/**
	 * Mark an instance as ready.
	 */

	function ready () {
	  this._isAttached = true
	  this._isReady = true
	  this._callHook('ready')
	}

	/**
	 * Teardown an instance, unobserves the data, unbind all the
	 * directives, turn off all the event listeners, etc.
	 *
	 * @param {Boolean} remove - whether to remove the DOM node.
	 * @public
	 */

	exports.$destroy = function (remove) {
	  if (this._isBeingDestroyed) {
	    return
	  }
	  this._callHook('beforeDestroy')
	  this._isBeingDestroyed = true
	  var i
	  // remove self from parent. only necessary
	  // if parent is not being destroyed as well.
	  var parent = this.$parent
	  if (parent && !parent._isBeingDestroyed) {
	    i = parent._children.indexOf(this)
	    parent._children.splice(i, 1)
	  }
	  // destroy all children.
	  if (this._children) {
	    i = this._children.length
	    while (i--) {
	      this._children[i].$destroy()
	    }
	  }
	  // teardown all directives. this also tearsdown all
	  // directive-owned watchers.
	  i = this._directives.length
	  while (i--) {
	    this._directives[i]._teardown()
	  }
	  // teardown all user watchers.
	  for (i in this._userWatchers) {
	    this._userWatchers[i].teardown()
	  }
	  // remove reference to self on $el
	  if (this.$el) {
	    this.$el.__vue__ = null
	  }
	  // remove DOM element
	  var self = this
	  if (remove && this.$el) {
	    this.$remove(function () {
	      cleanup(self)
	    })
	  } else {
	    cleanup(self)
	  }
	}

	/**
	 * Clean up to ensure garbage collection.
	 * This is called after the leave transition if there
	 * is any.
	 *
	 * @param {Vue} vm
	 */

	function cleanup (vm) {
	  // remove reference from data ob
	  vm._data.__ob__.removeVm(vm)
	  vm._data =
	  vm._watchers =
	  vm._userWatchers =
	  vm._watcherList =
	  vm.$el =
	  vm.$parent =
	  vm.$root =
	  vm._children =
	  vm._bindings =
	  vm._directives = null
	  // call the last hook...
	  vm._isDestroyed = true
	  vm._callHook('destroyed')
	  // turn off all instance listeners.
	  vm.$off() 
	}

	/**
	 * Partially compile a piece of DOM and return a
	 * decompile function.
	 *
	 * @param {Element|DocumentFragment} el
	 * @return {Function}
	 */

	exports.$compile = function (el) {
	  return compile(el, this.$options, true)(this, el)
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// manipulation directives
	exports.text       = __webpack_require__(22)
	exports.html       = __webpack_require__(23)
	exports.attr       = __webpack_require__(24)
	exports.show       = __webpack_require__(25)
	exports['class']   = __webpack_require__(26)
	exports.el         = __webpack_require__(27)
	exports.ref        = __webpack_require__(28)
	exports.cloak      = __webpack_require__(29)
	exports.style      = __webpack_require__(30)
	exports.partial    = __webpack_require__(31)
	exports.transition = __webpack_require__(32)

	// event listener directives
	exports.on         = __webpack_require__(33)
	exports.model      = __webpack_require__(48)

	// child vm directives
	exports.component  = __webpack_require__(34)
	exports.repeat     = __webpack_require__(35)
	exports['if']      = __webpack_require__(36)
	exports['with']    = __webpack_require__(37)

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * Stringify value.
	 *
	 * @param {Number} indent
	 */

	exports.json = function (value, indent) {
	  return JSON.stringify(value, null, Number(indent) || 2)
	}

	/**
	 * 'abc' => 'Abc'
	 */

	exports.capitalize = function (value) {
	  if (!value && value !== 0) return ''
	  value = value.toString()
	  return value.charAt(0).toUpperCase() + value.slice(1)
	}

	/**
	 * 'abc' => 'ABC'
	 */

	exports.uppercase = function (value) {
	  return (value || value === 0)
	    ? value.toString().toUpperCase()
	    : ''
	}

	/**
	 * 'AbC' => 'abc'
	 */

	exports.lowercase = function (value) {
	  return (value || value === 0)
	    ? value.toString().toLowerCase()
	    : ''
	}

	/**
	 * 12345 => $12,345.00
	 *
	 * @param {String} sign
	 */

	var digitsRE = /(\d{3})(?=\d)/g

	exports.currency = function (value, sign) {
	  value = parseFloat(value)
	  if (!value && value !== 0) return ''
	  sign = sign || '$'
	  var s = Math.floor(Math.abs(value)).toString(),
	    i = s.length % 3,
	    h = i > 0
	      ? (s.slice(0, i) + (s.length > 3 ? ',' : ''))
	      : '',
	    f = '.' + value.toFixed(2).slice(-2)
	  return (value < 0 ? '-' : '') +
	    sign + h + s.slice(i).replace(digitsRE, '$1,') + f
	}

	/**
	 * 'item' => 'items'
	 *
	 * @params
	 *  an array of strings corresponding to
	 *  the single, double, triple ... forms of the word to
	 *  be pluralized. When the number to be pluralized
	 *  exceeds the length of the args, it will use the last
	 *  entry in the array.
	 *
	 *  e.g. ['single', 'double', 'triple', 'multiple']
	 */

	exports.pluralize = function (value) {
	  var args = _.toArray(arguments, 1)
	  return args.length > 1
	    ? (args[value % 10 - 1] || args[args.length - 1])
	    : (args[0] + (value === 1 ? '' : 's'))
	}

	/**
	 * A special filter that takes a handler function,
	 * wraps it so it only gets triggered on specific
	 * keypresses. v-on only.
	 *
	 * @param {String} key
	 */

	var keyCodes = {
	  enter    : 13,
	  tab      : 9,
	  'delete' : 46,
	  up       : 38,
	  left     : 37,
	  right    : 39,
	  down     : 40,
	  esc      : 27
	}

	exports.key = function (handler, key) {
	  if (!handler) return
	  var code = keyCodes[key]
	  if (!code) {
	    code = parseInt(key, 10)
	  }
	  return function (e) {
	    if (e.keyCode === code) {
	      return handler.call(this, e)
	    }
	  }
	}

	/**
	 * Install special array filters
	 */

	_.extend(exports, __webpack_require__(38))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var mergeOptions = __webpack_require__(19)

	/**
	 * The main init sequence. This is called for every
	 * instance, including ones that are created from extended
	 * constructors.
	 *
	 * @param {Object} options - this options object should be
	 *                           the result of merging class
	 *                           options and the options passed
	 *                           in to the constructor.
	 */

	exports._init = function (options) {

	  options = options || {}

	  this.$el           = null
	  this.$parent       = options._parent
	  this.$root         = options._root || this
	  this.$             = {} // child vm references
	  this.$$            = {} // element references
	  this._watcherList  = [] // all watchers as an array
	  this._watchers     = {} // internal watchers as a hash
	  this._userWatchers = {} // user watchers as a hash
	  this._directives   = [] // all directives

	  // a flag to avoid this being observed
	  this._isVue = true

	  // events bookkeeping
	  this._events         = {}    // registered callbacks
	  this._eventsCount    = {}    // for $broadcast optimization
	  this._eventCancelled = false // for event cancellation

	  // block instance properties
	  this._isBlock     = false
	  this._blockStart  =          // @type {CommentNode}
	  this._blockEnd    = null     // @type {CommentNode}

	  // lifecycle state
	  this._isCompiled  =
	  this._isDestroyed =
	  this._isReady     =
	  this._isAttached  =
	  this._isBeingDestroyed = false

	  // children
	  this._children =         // @type {Array}
	  this._childCtors = null  // @type {Object} - hash to cache
	                           // child constructors

	  // merge options.
	  options = this.$options = mergeOptions(
	    this.constructor.options,
	    options,
	    this
	  )

	  // set data after merge.
	  this._data = options.data || {}

	  // initialize data observation and scope inheritance.
	  this._initScope()

	  // setup event system and option events.
	  this._initEvents()

	  // call created hook
	  this._callHook('created')

	  // if `el` option is passed, start compilation.
	  if (options.el) {
	    this.$mount(options.el)
	  }
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var inDoc = _.inDoc

	/**
	 * Setup the instance's option events & watchers.
	 * If the value is a string, we pull it from the
	 * instance's methods by name.
	 */

	exports._initEvents = function () {
	  var options = this.$options
	  registerCallbacks(this, '$on', options.events)
	  registerCallbacks(this, '$watch', options.watch)
	}

	/**
	 * Register callbacks for option events and watchers.
	 *
	 * @param {Vue} vm
	 * @param {String} action
	 * @param {Object} hash
	 */

	function registerCallbacks (vm, action, hash) {
	  if (!hash) return
	  var handlers, key, i, j
	  for (key in hash) {
	    handlers = hash[key]
	    if (_.isArray(handlers)) {
	      for (i = 0, j = handlers.length; i < j; i++) {
	        register(vm, action, key, handlers[i])
	      }
	    } else {
	      register(vm, action, key, handlers)
	    }
	  }
	}

	/**
	 * Helper to register an event/watch callback.
	 *
	 * @param {Vue} vm
	 * @param {String} action
	 * @param {String} key
	 * @param {*} handler
	 */

	function register (vm, action, key, handler) {
	  var type = typeof handler
	  if (type === 'function') {
	    vm[action](key, handler)
	  } else if (type === 'string') {
	    var methods = vm.$options.methods
	    var method = methods && methods[handler]
	    if (method) {
	      vm[action](key, method)
	    } else {
	      _.warn(
	        'Unknown method: "' + handler + '" when ' +
	        'registering callback for ' + action +
	        ': "' + key + '".'
	      )
	    }
	  }
	}

	/**
	 * Setup recursive attached/detached calls
	 */

	exports._initDOMHooks = function () {
	  this.$on('hook:attached', onAttached)
	  this.$on('hook:detached', onDetached)
	}

	/**
	 * Callback to recursively call attached hook on children
	 */

	function onAttached () {
	  this._isAttached = true
	  var children = this._children
	  if (!children) return
	  for (var i = 0, l = children.length; i < l; i++) {
	    var child = children[i]
	    if (!child._isAttached && inDoc(child.$el)) {
	      child._callHook('attached')
	    }
	  }
	}

	/**
	 * Callback to recursively call detached hook on children
	 */

	function onDetached () {
	  this._isAttached = false
	  var children = this._children
	  if (!children) return
	  for (var i = 0, l = children.length; i < l; i++) {
	    var child = children[i]
	    if (child._isAttached && !inDoc(child.$el)) {
	      child._callHook('detached')
	    }
	  }
	}

	/**
	 * Trigger all handlers for a hook
	 *
	 * @param {String} hook
	 */

	exports._callHook = function (hook) {
	  var handlers = this.$options[hook]
	  if (handlers) {
	    for (var i = 0, j = handlers.length; i < j; i++) {
	      handlers[i].call(this)
	    }
	  }
	  this.$emit('hook:' + hook)
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Observer = __webpack_require__(49)
	var Binding = __webpack_require__(39)

	/**
	 * Setup the scope of an instance, which contains:
	 * - observed data
	 * - computed properties
	 * - user methods
	 * - meta properties
	 */

	exports._initScope = function () {
	  this._initData()
	  this._initComputed()
	  this._initMethods()
	  this._initMeta()
	}

	/**
	 * Initialize the data. 
	 */

	exports._initData = function () {
	  // proxy data on instance
	  var data = this._data
	  var keys = Object.keys(data)
	  var i = keys.length
	  var key
	  while (i--) {
	    key = keys[i]
	    if (!_.isReserved(key)) {
	      this._proxy(key)
	    }
	  }
	  // observe data
	  Observer.create(data).addVm(this)
	}

	/**
	 * Swap the isntance's $data. Called in $data's setter.
	 *
	 * @param {Object} newData
	 */

	exports._setData = function (newData) {
	  newData = newData || {}
	  var oldData = this._data
	  this._data = newData
	  var keys, key, i
	  // unproxy keys not present in new data
	  keys = Object.keys(oldData)
	  i = keys.length
	  while (i--) {
	    key = keys[i]
	    if (!_.isReserved(key) && !(key in newData)) {
	      this._unproxy(key)
	    }
	  }
	  // proxy keys not already proxied,
	  // and trigger change for changed values
	  keys = Object.keys(newData)
	  i = keys.length
	  while (i--) {
	    key = keys[i]
	    if (!this.hasOwnProperty(key) && !_.isReserved(key)) {
	      // new property
	      this._proxy(key)
	    }
	  }
	  oldData.__ob__.removeVm(this)
	  Observer.create(newData).addVm(this)
	  this._digest()
	}

	/**
	 * Proxy a property, so that
	 * vm.prop === vm._data.prop
	 *
	 * @param {String} key
	 */

	exports._proxy = function (key) {
	  // need to store ref to self here
	  // because these getter/setters might
	  // be called by child instances!
	  var self = this
	  Object.defineProperty(self, key, {
	    configurable: true,
	    enumerable: true,
	    get: function proxyGetter () {
	      return self._data[key]
	    },
	    set: function proxySetter (val) {
	      self._data[key] = val
	    }
	  })
	}

	/**
	 * Unproxy a property.
	 *
	 * @param {String} key
	 */

	exports._unproxy = function (key) {
	  delete this[key]
	}

	/**
	 * Force update on every watcher in scope.
	 */

	exports._digest = function () {
	  var i = this._watcherList.length
	  while (i--) {
	    this._watcherList[i].update()
	  }
	  var children = this._children
	  var child
	  if (children) {
	    i = children.length
	    while (i--) {
	      child = children[i]
	      if (child.$options.inherit) {
	        child._digest()
	      }
	    }
	  }
	}

	/**
	 * Setup computed properties. They are essentially
	 * special getter/setters
	 */

	function noop () {}
	exports._initComputed = function () {
	  var computed = this.$options.computed
	  if (computed) {
	    for (var key in computed) {
	      var userDef = computed[key]
	      var def = {
	        enumerable: true,
	        configurable: true
	      }
	      if (typeof userDef === 'function') {
	        def.get = _.bind(userDef, this)
	        def.set = noop
	      } else {
	        def.get = userDef.get
	          ? _.bind(userDef.get, this)
	          : noop
	        def.set = userDef.set
	          ? _.bind(userDef.set, this)
	          : noop
	      }
	      Object.defineProperty(this, key, def)
	    }
	  }
	}

	/**
	 * Setup instance methods. Methods must be bound to the
	 * instance since they might be called by children
	 * inheriting them.
	 */

	exports._initMethods = function () {
	  var methods = this.$options.methods
	  if (methods) {
	    for (var key in methods) {
	      this[key] = _.bind(methods[key], this)
	    }
	  }
	}

	/**
	 * Initialize meta information like $index, $key & $value.
	 */

	exports._initMeta = function () {
	  var metas = this.$options._meta
	  if (metas) {
	    for (var key in metas) {
	      this._defineMeta(key, metas[key])
	    }
	  }
	}

	/**
	 * Define a meta property, e.g $index, $key, $value
	 * which only exists on the vm instance but not in $data.
	 *
	 * @param {String} key
	 * @param {*} value
	 */

	exports._defineMeta = function (key, value) {
	  var binding = new Binding()
	  Object.defineProperty(this, key, {
	    enumerable: true,
	    configurable: true,
	    get: function metaGetter () {
	      if (Observer.target) {
	        Observer.target.addDep(binding)
	      }
	      return value
	    },
	    set: function metaSetter (val) {
	      if (val !== value) {
	        value = val
	        binding.notify()
	      }
	    }
	  })
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Directive = __webpack_require__(40)
	var compile = __webpack_require__(46)
	var transclude = __webpack_require__(47)

	/**
	 * Transclude, compile and link element.
	 *
	 * If a pre-compiled linker is available, that means the
	 * passed in element will be pre-transcluded and compiled
	 * as well - all we need to do is to call the linker.
	 *
	 * Otherwise we need to call transclude/compile/link here.
	 *
	 * @param {Element} el
	 * @return {Element}
	 */

	exports._compile = function (el) {
	  var options = this.$options
	  if (options._linker) {
	    this._initElement(el)
	    options._linker(this, el)
	  } else {
	    var raw = el
	    el = transclude(el, options)
	    this._initElement(el)
	    var linker = compile(el, options)
	    linker(this, el)
	    if (options.replace) {
	      _.replace(raw, el)
	    }
	  }
	  return el
	}

	/**
	 * Initialize instance element. Called in the public
	 * $mount() method.
	 *
	 * @param {Element} el
	 */

	exports._initElement = function (el) {
	  if (el instanceof DocumentFragment) {
	    this._isBlock = true
	    this.$el = this._blockStart = el.firstChild
	    this._blockEnd = el.lastChild
	    this._blockFragment = el
	  } else {
	    this.$el = el
	  }
	  this.$el.__vue__ = this
	  this._callHook('beforeCompile')
	}

	/**
	 * Create and bind a directive to an element.
	 *
	 * @param {String} name - directive name
	 * @param {Node} node   - target node
	 * @param {Object} desc - parsed directive descriptor
	 * @param {Object} def  - directive definition object
	 * @param {Function} [linker] - pre-compiled linker fn
	 */

	exports._bindDir = function (name, node, desc, def, linker) {
	  this._directives.push(
	    new Directive(name, node, this, desc, def, linker)
	  )
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Check is a string starts with $ or _
	 *
	 * @param {String} str
	 * @return {Boolean}
	 */

	exports.isReserved = function (str) {
	  var c = str.charCodeAt(0)
	  return c === 0x24 || c === 0x5F
	}

	/**
	 * Guard text output, make sure undefined outputs
	 * empty string
	 *
	 * @param {*} value
	 * @return {String}
	 */

	exports.toString = function (value) {
	  return value == null
	    ? ''
	    : value.toString()
	}

	/**
	 * Check and convert possible numeric numbers before
	 * setting back to data
	 *
	 * @param {*} value
	 * @return {*|Number}
	 */

	exports.toNumber = function (value) {
	  return (
	    isNaN(value) ||
	    value === null ||
	    typeof value === 'boolean'
	  ) ? value
	    : Number(value)
	}

	/**
	 * Strip quotes from a string
	 *
	 * @param {String} str
	 * @return {String | false}
	 */

	exports.stripQuotes = function (str) {
	  var a = str.charCodeAt(0)
	  var b = str.charCodeAt(str.length - 1)
	  return a === b && (a === 0x22 || a === 0x27)
	    ? str.slice(1, -1)
	    : false
	}

	/**
	 * Camelize a hyphen-delmited string.
	 *
	 * @param {String} str
	 * @return {String}
	 */

	var camelRE = /[-_](\w)/g
	var capitalCamelRE = /(?:^|[-_])(\w)/g

	exports.camelize = function (str, cap) {
	  var RE = cap ? capitalCamelRE : camelRE
	  return str.replace(RE, function (_, c) {
	    return c ? c.toUpperCase () : '';
	  })
	}

	/**
	 * Simple bind, faster than native
	 *
	 * @param {Function} fn
	 * @param {Object} ctx
	 * @return {Function}
	 */

	exports.bind = function (fn, ctx) {
	  return function () {
	    return fn.apply(ctx, arguments)
	  }
	}

	/**
	 * Convert an Array-like object to a real Array.
	 *
	 * @param {Array-like} list
	 * @param {Number} [start] - start index
	 * @return {Array}
	 */

	exports.toArray = function (list, start) {
	  start = start || 0
	  var i = list.length - start
	  var ret = new Array(i)
	  while (i--) {
	    ret[i] = list[i + start]
	  }
	  return ret
	}

	/**
	 * Mix properties into target object.
	 *
	 * @param {Object} to
	 * @param {Object} from
	 */

	exports.extend = function (to, from) {
	  for (var key in from) {
	    to[key] = from[key]
	  }
	}

	/**
	 * Quick object check - this is primarily used to tell
	 * Objects from primitive values when we know the value
	 * is a JSON-compliant type.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	exports.isObject = function (obj) {
	  return obj && typeof obj === 'object'
	}

	/**
	 * Strict object type check. Only returns true
	 * for plain JavaScript objects.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	var toString = Object.prototype.toString
	exports.isPlainObject = function (obj) {
	  return toString.call(obj) === '[object Object]'
	}

	/**
	 * Array type check.
	 *
	 * @param {*} obj
	 * @return {Boolean}
	 */

	exports.isArray = function (obj) {
	  return Array.isArray(obj)
	}

	/**
	 * Define a non-enumerable property
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @param {*} val
	 * @param {Boolean} [enumerable]
	 */

	exports.define = function (obj, key, val, enumerable) {
	  Object.defineProperty(obj, key, {
	    value        : val,
	    enumerable   : !!enumerable,
	    writable     : true,
	    configurable : true
	  })
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Can we use __proto__?
	 *
	 * @type {Boolean}
	 */

	exports.hasProto = '__proto__' in {}

	/**
	 * Indicates we have a window
	 *
	 * @type {Boolean}
	 */

	var toString = Object.prototype.toString
	var inBrowser = exports.inBrowser =
	  typeof window !== 'undefined' &&
	  toString.call(window) !== '[object Object]'

	/**
	 * Defer a task to the start of the next event loop
	 *
	 * @param {Function} cb
	 * @param {Object} ctx
	 */

	var defer = inBrowser
	  ? (window.requestAnimationFrame ||
	    window.webkitRequestAnimationFrame ||
	    setTimeout)
	  : setTimeout

	exports.nextTick = function (cb, ctx) {
	  if (ctx) {
	    defer(function () { cb.call(ctx) }, 0)
	  } else {
	    defer(cb, 0)
	  }
	}

	/**
	 * Detect if we are in IE9...
	 *
	 * @type {Boolean}
	 */

	exports.isIE9 =
	  inBrowser &&
	  navigator.userAgent.indexOf('MSIE 9.0') > 0

	/**
	 * Sniff transition/animation events
	 */

	if (inBrowser && !exports.isIE9) {
	  var isWebkitTrans =
	    window.ontransitionend === undefined &&
	    window.onwebkittransitionend !== undefined
	  var isWebkitAnim =
	    window.onanimationend === undefined &&
	    window.onwebkitanimationend !== undefined
	  exports.transitionProp = isWebkitTrans
	    ? 'WebkitTransition'
	    : 'transition'
	  exports.transitionEndEvent = isWebkitTrans
	    ? 'webkitTransitionEnd'
	    : 'transitionend'
	  exports.animationProp = isWebkitAnim
	    ? 'WebkitAnimation'
	    : 'animation'
	  exports.animationEndEvent = isWebkitAnim
	    ? 'webkitAnimationEnd'
	    : 'animationend'
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(20)

	/**
	 * Check if a node is in the document.
	 *
	 * @param {Node} node
	 * @return {Boolean}
	 */

	var doc =
	  typeof document !== 'undefined' &&
	  document.documentElement

	exports.inDoc = function (node) {
	  return doc && doc.contains(node)
	}

	/**
	 * Extract an attribute from a node.
	 *
	 * @param {Node} node
	 * @param {String} attr
	 */

	exports.attr = function (node, attr) {
	  attr = config.prefix + attr
	  var val = node.getAttribute(attr)
	  if (val !== null) {
	    node.removeAttribute(attr)
	  }
	  return val
	}

	/**
	 * Insert el before target
	 *
	 * @param {Element} el
	 * @param {Element} target 
	 */

	exports.before = function (el, target) {
	  target.parentNode.insertBefore(el, target)
	}

	/**
	 * Insert el after target
	 *
	 * @param {Element} el
	 * @param {Element} target 
	 */

	exports.after = function (el, target) {
	  if (target.nextSibling) {
	    exports.before(el, target.nextSibling)
	  } else {
	    target.parentNode.appendChild(el)
	  }
	}

	/**
	 * Remove el from DOM
	 *
	 * @param {Element} el
	 */

	exports.remove = function (el) {
	  el.parentNode.removeChild(el)
	}

	/**
	 * Prepend el to target
	 *
	 * @param {Element} el
	 * @param {Element} target 
	 */

	exports.prepend = function (el, target) {
	  if (target.firstChild) {
	    exports.before(el, target.firstChild)
	  } else {
	    target.appendChild(el)
	  }
	}

	/**
	 * Replace target with el
	 *
	 * @param {Element} target
	 * @param {Element} el
	 */

	exports.replace = function (target, el) {
	  var parent = target.parentNode
	  if (parent) {
	    parent.replaceChild(el, target)
	  }
	}

	/**
	 * Copy attributes from one element to another.
	 *
	 * @param {Element} from
	 * @param {Element} to
	 */

	exports.copyAttributes = function (from, to) {
	  if (from.hasAttributes()) {
	    var attrs = from.attributes
	    for (var i = 0, l = attrs.length; i < l; i++) {
	      var attr = attrs[i]
	      to.setAttribute(attr.name, attr.value)
	    }
	  }
	}

	/**
	 * Add event listener shorthand.
	 *
	 * @param {Element} el
	 * @param {String} event
	 * @param {Function} cb
	 */

	exports.on = function (el, event, cb) {
	  el.addEventListener(event, cb)
	}

	/**
	 * Remove event listener shorthand.
	 *
	 * @param {Element} el
	 * @param {String} event
	 * @param {Function} cb
	 */

	exports.off = function (el, event, cb) {
	  el.removeEventListener(event, cb)
	}

	/**
	 * Add class with compatibility for IE & SVG
	 *
	 * @param {Element} el
	 * @param {Strong} cls
	 */

	exports.addClass = function (el, cls) {
	  if (el.classList) {
	    el.classList.add(cls)
	  } else {
	    var cur = ' ' + (el.getAttribute('class') || '') + ' '
	    if (cur.indexOf(' ' + cls + ' ') < 0) {
	      el.setAttribute('class', (cur + cls).trim())
	    }
	  }
	}

	/**
	 * Remove class with compatibility for IE & SVG
	 *
	 * @param {Element} el
	 * @param {Strong} cls
	 */

	exports.removeClass = function (el, cls) {
	  if (el.classList) {
	    el.classList.remove(cls)
	  } else {
	    var cur = ' ' + (el.getAttribute('class') || '') + ' '
	    var tar = ' ' + cls + ' '
	    while (cur.indexOf(tar) >= 0) {
	      cur = cur.replace(tar, ' ')
	    }
	    el.setAttribute('class', cur.trim())
	  }
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(18)

	/**
	 * Resolve read & write filters for a vm instance. The
	 * filters descriptor Array comes from the directive parser.
	 *
	 * This is extracted into its own utility so it can
	 * be used in multiple scenarios.
	 *
	 * @param {Vue} vm
	 * @param {Array<Object>} filters
	 * @param {Object} [target]
	 * @return {Object}
	 */

	exports.resolveFilters = function (vm, filters, target) {
	  if (!filters) {
	    return
	  }
	  var res = target || {}
	  // var registry = vm.$options.filters
	  filters.forEach(function (f) {
	    var def = vm.$options.filters[f.name]
	    _.assertAsset(def, 'filter', f.name)
	    if (!def) return
	    var args = f.args
	    var reader, writer
	    if (typeof def === 'function') {
	      reader = def
	    } else {
	      reader = def.read
	      writer = def.write
	    }
	    if (reader) {
	      if (!res.read) res.read = []
	      res.read.push(function (value) {
	        return args
	          ? reader.apply(vm, [value].concat(args))
	          : reader.call(vm, value)
	      })
	    }
	    if (writer) {
	      if (!res.write) res.write = []
	      res.write.push(function (value, oldVal) {
	        return args
	          ? writer.apply(vm, [value, oldVal].concat(args))
	          : writer.call(vm, value, oldVal)
	      })
	    }
	  })
	  return res
	}

	/**
	 * Apply filters to a value
	 *
	 * @param {*} value
	 * @param {Array} filters
	 * @param {Vue} vm
	 * @param {*} oldVal
	 * @return {*}
	 */

	exports.applyFilters = function (value, filters, vm, oldVal) {
	  if (!filters) {
	    return value
	  }
	  for (var i = 0, l = filters.length; i < l; i++) {
	    value = filters[i].call(vm, value, oldVal)
	  }
	  return value
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(20)

	/**
	 * Enable debug utilities. The enableDebug() function and
	 * all _.log() & _.warn() calls will be dropped in the
	 * minified production build.
	 */

	enableDebug()

	function enableDebug () {
	  var hasConsole = typeof console !== 'undefined'
	  
	  /**
	   * Log a message.
	   *
	   * @param {String} msg
	   */

	  exports.log = function (msg) {
	    if (hasConsole && config.debug) {
	      console.log('[Vue info]: ' + msg)
	    }
	  }

	  /**
	   * We've got a problem here.
	   *
	   * @param {String} msg
	   */

	  exports.warn = function (msg) {
	    if (hasConsole && !config.silent) {
	      console.warn('[Vue warn]: ' + msg)
	      if (config.debug && console.trace) {
	        console.trace()
	      }
	    }
	  }

	  /**
	   * Assert asset exists
	   */

	  exports.assertAsset = function (val, type, id) {
	    if (!val) {
	      exports.warn('Failed to resolve ' + type + ': ' + id)
	    }
	  }
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var extend = _.extend

	/**
	 * Option overwriting strategies are functions that handle
	 * how to merge a parent option value and a child option
	 * value into the final value.
	 *
	 * All strategy functions follow the same signature:
	 *
	 * @param {*} parentVal
	 * @param {*} childVal
	 * @param {Vue} [vm]
	 */

	var strats = Object.create(null)

	/**
	 * Data
	 */

	strats.data = function (parentVal, childVal, vm) {
	  // in a class merge, both should be functions
	  // so we just return child if it exists
	  if (!vm) {
	    if (childVal && typeof childVal !== 'function') {
	      _.warn(
	        'The "data" option should be a function ' +
	        'that returns a per-instance value in component ' +
	        'definitions.'
	      )
	      return
	    }
	    return childVal || parentVal
	  }
	  var instanceData = typeof childVal === 'function'
	    ? childVal.call(vm)
	    : childVal
	  var defaultData = typeof parentVal === 'function'
	    ? parentVal.call(vm)
	    : undefined
	  if (instanceData) {
	    // mix default data into instance data
	    for (var key in defaultData) {
	      if (!instanceData.hasOwnProperty(key)) {
	        instanceData.$add(key, defaultData[key])
	      }
	    }
	    return instanceData
	  } else {
	    return defaultData
	  }
	}

	/**
	 * El
	 */

	strats.el = function (parentVal, childVal, vm) {
	  if (!vm && childVal && typeof childVal !== 'function') {
	    _.warn(
	      'The "el" option should be a function ' +
	      'that returns a per-instance value in component ' +
	      'definitions.'
	    )
	    return
	  }
	  var ret = childVal || parentVal
	  // invoke the element factory if this is instance merge
	  return vm && typeof ret === 'function'
	    ? ret.call(vm)
	    : ret
	}

	/**
	 * Hooks and param attributes are merged as arrays.
	 */

	strats.created =
	strats.ready =
	strats.attached =
	strats.detached =
	strats.beforeCompile =
	strats.compiled =
	strats.beforeDestroy =
	strats.destroyed =
	strats.paramAttributes = function (parentVal, childVal) {
	  return childVal
	    ? parentVal
	      ? parentVal.concat(childVal)
	      : _.isArray(childVal)
	        ? childVal
	        : [childVal]
	    : parentVal
	}

	/**
	 * Assets
	 *
	 * When a vm is present (instance creation), we need to do
	 * a three-way merge between constructor options, instance
	 * options and parent options.
	 */

	strats.directives =
	strats.filters =
	strats.partials =
	strats.transitions =
	strats.components = function (parentVal, childVal, vm, key) {
	  var ret = Object.create(
	    vm && vm.$parent
	      ? vm.$parent.$options[key]
	      : _.Vue.options[key]
	  )
	  if (parentVal) {
	    var keys = Object.keys(parentVal)
	    var i = keys.length
	    var field
	    while (i--) {
	      field = keys[i]
	      ret[field] = parentVal[field]
	    }
	  }
	  if (childVal) extend(ret, childVal)
	  return ret
	}

	/**
	 * Events & Watchers.
	 *
	 * Events & watchers hashes should not overwrite one
	 * another, so we merge them as arrays.
	 */

	strats.watch =
	strats.events = function (parentVal, childVal) {
	  if (!childVal) return parentVal
	  if (!parentVal) return childVal
	  var ret = {}
	  extend(ret, parentVal)
	  for (var key in childVal) {
	    var parent = ret[key]
	    var child = childVal[key]
	    ret[key] = parent
	      ? parent.concat(child)
	      : [child]
	  }
	  return ret
	}

	/**
	 * Other object hashes.
	 */

	strats.methods =
	strats.computed = function (parentVal, childVal) {
	  if (!childVal) return parentVal
	  if (!parentVal) return childVal
	  var ret = Object.create(parentVal)
	  extend(ret, childVal)
	  return ret
	}

	/**
	 * Default strategy.
	 */

	var defaultStrat = function (parentVal, childVal) {
	  return childVal === undefined
	    ? parentVal
	    : childVal
	}

	/**
	 * Make sure component options get converted to actual
	 * constructors.
	 *
	 * @param {Object} components
	 */

	function guardComponents (components) {
	  if (components) {
	    var def
	    for (var key in components) {
	      def = components[key]
	      if (_.isPlainObject(def)) {
	        def.name = key
	        components[key] = _.Vue.extend(def)
	      }
	    }
	  }
	}

	/**
	 * Merge two option objects into a new one.
	 * Core utility used in both instantiation and inheritance.
	 *
	 * @param {Object} parent
	 * @param {Object} child
	 * @param {Vue} [vm] - if vm is present, indicates this is
	 *                     an instantiation merge.
	 */

	module.exports = function mergeOptions (parent, child, vm) {
	  guardComponents(child.components)
	  var options = {}
	  var key
	  for (key in parent) {
	    merge(parent[key], child[key], key)
	  }
	  for (key in child) {
	    if (!(parent.hasOwnProperty(key))) {
	      merge(parent[key], child[key], key)
	    }
	  }
	  var mixins = child.mixins
	  if (mixins) {
	    for (var i = 0, l = mixins.length; i < l; i++) {
	      for (key in mixins[i]) {
	        merge(options[key], mixins[i][key], key)
	      }
	    }
	  }
	  function merge (parentVal, childVal, key) {
	    var strat = strats[key] || defaultStrat
	    options[key] = strat(parentVal, childVal, vm, key)
	  }
	  return options
	}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

	  /**
	   * The prefix to look for when parsing directives.
	   *
	   * @type {String}
	   */

	  prefix: 'v-',

	  /**
	   * Whether to print debug messages.
	   * Also enables stack trace for warnings.
	   *
	   * @type {Boolean}
	   */

	  debug: false,

	  /**
	   * Whether to suppress warnings.
	   *
	   * @type {Boolean}
	   */

	  silent: false,

	  /**
	   * Whether allow observer to alter data objects'
	   * __proto__.
	   *
	   * @type {Boolean}
	   */

	  proto: true,

	  /**
	   * Whether to parse mustache tags in templates.
	   *
	   * @type {Boolean}
	   */

	  interpolate: true,

	  /**
	   * Whether to use async rendering.
	   */

	  async: true,

	  /**
	   * Internal flag to indicate the delimiters have been
	   * changed.
	   *
	   * @type {Boolean}
	   */

	  _delimitersChanged: true

	}

	/**
	 * Interpolation delimiters.
	 * We need to mark the changed flag so that the text parser
	 * knows it needs to recompile the regex.
	 *
	 * @type {Array<String>}
	 */

	var delimiters = ['{{', '}}']
	Object.defineProperty(module.exports, 'delimiters', {
	  get: function () {
	    return delimiters
	  },
	  set: function (val) {
	    delimiters = val
	    this._delimitersChanged = true
	  }
	})

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(20)
	var Observer = __webpack_require__(49)
	var expParser = __webpack_require__(44)
	var Batcher = __webpack_require__(50)

	var batcher = new Batcher()
	var uid = 0

	/**
	 * A watcher parses an expression, collects dependencies,
	 * and fires callback when the expression value changes.
	 * This is used for both the $watch() api and directives.
	 *
	 * @param {Vue} vm
	 * @param {String} expression
	 * @param {Function} cb
	 * @param {Array} [filters]
	 * @param {Boolean} [needSet]
	 * @param {Boolean} [deep]
	 * @constructor
	 */

	function Watcher (vm, expression, cb, filters, needSet, deep) {
	  this.vm = vm
	  vm._watcherList.push(this)
	  this.expression = expression
	  this.cbs = [cb]
	  this.id = ++uid // uid for batching
	  this.active = true
	  this.deep = deep
	  this.deps = Object.create(null)
	  // setup filters if any.
	  // We delegate directive filters here to the watcher
	  // because they need to be included in the dependency
	  // collection process.
	  this.readFilters = filters && filters.read
	  this.writeFilters = filters && filters.write
	  // parse expression for getter/setter
	  var res = expParser.parse(expression, needSet)
	  this.getter = res.get
	  this.setter = res.set
	  this.value = this.get()
	}

	var p = Watcher.prototype

	/**
	 * Add a binding dependency to this directive.
	 *
	 * @param {Binding} binding
	 */

	p.addDep = function (binding) {
	  var id = binding.id
	  if (!this.newDeps[id]) {
	    this.newDeps[id] = binding
	    if (!this.deps[id]) {
	      this.deps[id] = binding
	      binding.addSub(this)
	    }
	  }
	}

	/**
	 * Evaluate the getter, and re-collect dependencies.
	 */

	p.get = function () {
	  this.beforeGet()
	  var vm = this.vm
	  var value
	  try {
	    value = this.getter.call(vm, vm)
	  } catch (e) {}
	  // use JSON.stringify to "touch" every property
	  // so they are all tracked as dependencies for
	  // deep watching
	  if (this.deep) JSON.stringify(value)
	  value = _.applyFilters(value, this.readFilters, vm)
	  this.afterGet()
	  return value
	}

	/**
	 * Set the corresponding value with the setter.
	 *
	 * @param {*} value
	 */

	p.set = function (value) {
	  var vm = this.vm
	  value = _.applyFilters(
	    value, this.writeFilters, vm, this.value
	  )
	  try {
	    this.setter.call(vm, vm, value)
	  } catch (e) {}
	}

	/**
	 * Prepare for dependency collection.
	 */

	p.beforeGet = function () {
	  Observer.target = this
	  this.newDeps = {}
	}

	/**
	 * Clean up for dependency collection.
	 */

	p.afterGet = function () {
	  Observer.target = null
	  for (var id in this.deps) {
	    if (!this.newDeps[id]) {
	      this.deps[id].removeSub(this)
	    }
	  }
	  this.deps = this.newDeps
	}

	/**
	 * Subscriber interface.
	 * Will be called when a dependency changes.
	 */

	p.update = function () {
	  if (config.async) {
	    batcher.push(this)
	  } else {
	    this.run()
	  }
	}

	/**
	 * Batcher job interface.
	 * Will be called by the batcher.
	 */

	p.run = function () {
	  if (this.active) {
	    var value = this.get()
	    if (
	      (typeof value === 'object' && value !== null) ||
	      value !== this.value
	    ) {
	      var oldValue = this.value
	      this.value = value
	      var cbs = this.cbs
	      for (var i = 0, l = cbs.length; i < l; i++) {
	        cbs[i](value, oldValue)
	        // if a callback also removed other callbacks,
	        // we need to adjust the loop accordingly.
	        var removed = l - cbs.length
	        if (removed) {
	          i -= removed
	          l -= removed
	        }
	      }
	    }
	  }
	}

	/**
	 * Add a callback.
	 *
	 * @param {Function} cb
	 */

	p.addCb = function (cb) {
	  this.cbs.push(cb)
	}

	/**
	 * Remove a callback.
	 *
	 * @param {Function} cb
	 */

	p.removeCb = function (cb) {
	  var cbs = this.cbs
	  if (cbs.length > 1) {
	    var i = cbs.indexOf(cb)
	    if (i > -1) {
	      cbs.splice(i, 1)
	    }
	  } else if (cb === cbs[0]) {
	    this.teardown()
	  }
	}

	/**
	 * Remove self from all dependencies' subcriber list.
	 */

	p.teardown = function () {
	  if (this.active) {
	    // remove self from vm's watcher list
	    // we can skip this if the vm if being destroyed
	    // which can improve teardown performance.
	    if (!this.vm._isBeingDestroyed) {
	      var list = this.vm._watcherList
	      list.splice(list.indexOf(this))
	    }
	    for (var id in this.deps) {
	      this.deps[id].removeSub(this)
	    }
	    this.active = false
	    this.vm = this.cbs = this.value = null
	  }
	}

	module.exports = Watcher

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  bind: function () {
	    this.attr = this.el.nodeType === 3
	      ? 'nodeValue'
	      : 'textContent'
	  },

	  update: function (value) {
	    this.el[this.attr] = _.toString(value)
	  }
	  
	}

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var templateParser = __webpack_require__(51)

	module.exports = {

	  bind: function () {
	    // a comment node means this is a binding for
	    // {{{ inline unescaped html }}}
	    if (this.el.nodeType === 8) {
	      // hold nodes
	      this.nodes = []
	    }
	  },

	  update: function (value) {
	    value = _.toString(value)
	    if (this.nodes) {
	      this.swap(value)
	    } else {
	      this.el.innerHTML = value
	    }
	  },

	  swap: function (value) {
	    // remove old nodes
	    var i = this.nodes.length
	    while (i--) {
	      _.remove(this.nodes[i])
	    }
	    // convert new value to a fragment
	    var frag = templateParser.parse(value, true)
	    // save a reference to these nodes so we can remove later
	    this.nodes = _.toArray(frag.childNodes)
	    _.before(frag, this.el)
	  }

	}

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// xlink
	var xlinkNS = 'http://www.w3.org/1999/xlink'
	var xlinkRE = /^xlink:/

	module.exports = {

	  priority: 850,

	  bind: function () {
	    var name = this.arg
	    this.update = xlinkRE.test(name)
	      ? xlinkHandler
	      : defaultHandler
	  }

	}

	function defaultHandler (value) {
	  if (value || value === 0) {
	    this.el.setAttribute(this.arg, value)
	  } else {
	    this.el.removeAttribute(this.arg)
	  }
	}

	function xlinkHandler (value) {
	  if (value != null) {
	    this.el.setAttributeNS(xlinkNS, this.arg, value)
	  } else {
	    this.el.removeAttributeNS(xlinkNS, 'href')
	  }
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var transition = __webpack_require__(45)

	module.exports = function (value) {
	  var el = this.el
	  transition.apply(el, value ? 1 : -1, function () {
	    el.style.display = value ? '' : 'none'
	  }, this.vm)
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var addClass = _.addClass
	var removeClass = _.removeClass

	module.exports = function (value) {
	  if (this.arg) {
	    var method = value ? addClass : removeClass
	    method(this.el, this.arg)
	  } else {
	    if (this.lastVal) {
	      removeClass(this.el, this.lastVal)
	    }
	    if (value) {
	      addClass(this.el, value)
	      this.lastVal = value
	    }
	  }
	}

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

	  isLiteral: true,

	  bind: function () {
	    this.vm.$$[this.expression] = this.el
	  },

	  unbind: function () {
	    delete this.vm.$$[this.expression]
	  }
	  
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  isLiteral: true,

	  bind: function () {
	    if (this.el !== this.vm.$el) {
	      _.warn(
	        'v-ref should only be used on instance root nodes.'
	      )
	      return
	    }
	    this.owner = this.vm.$parent
	    this.owner.$[this.expression] = this.vm
	  },

	  unbind: function () {
	    if (this.owner.$[this.expression] === this.vm) {
	      delete this.owner.$[this.expression]
	    }
	  }
	  
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var config = __webpack_require__(20)

	module.exports = {

	  bind: function () {
	    var el = this.el
	    this.vm.$once('hook:compiled', function () {
	      el.removeAttribute(config.prefix + 'cloak')
	    })
	  }

	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var prefixes = ['-webkit-', '-moz-', '-ms-']
	var importantRE = /!important;?$/

	module.exports = {

	  bind: function () {
	    var prop = this.arg
	    if (!prop) return
	    if (prop.charAt(0) === '$') {
	      // properties that start with $ will be auto-prefixed
	      prop = prop.slice(1)
	      this.prefixed = true
	    }
	    this.prop = prop
	  },

	  update: function (value) {
	    var prop = this.prop
	    // cast possible numbers/booleans into strings
	    if (value != null) {
	      value += ''
	    }
	    if (prop) {
	      var isImportant = importantRE.test(value)
	        ? 'important'
	        : ''
	      if (isImportant) {
	        value = value.replace(importantRE, '').trim()
	      }
	      this.el.style.setProperty(prop, value, isImportant)
	      if (this.prefixed) {
	        var i = prefixes.length
	        while (i--) {
	          this.el.style.setProperty(
	            prefixes[i] + prop,
	            value,
	            isImportant
	          )
	        }
	      }
	    } else {
	      this.el.style.cssText = value
	    }
	  }

	}

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var templateParser = __webpack_require__(51)
	var transition = __webpack_require__(45)

	module.exports = {

	  isLiteral: true,

	  bind: function () {
	    var el = this.el
	    this.start = document.createComment('v-partial-start')
	    this.end = document.createComment('v-partial-end')
	    if (el.nodeType !== 8) {
	      el.innerHTML = ''
	    }
	    if (el.tagName === 'TEMPLATE' || el.nodeType === 8) {
	      _.replace(el, this.end)
	    } else {
	      el.appendChild(this.end)
	    }
	    _.before(this.start, this.end)
	    if (!this._isDynamicLiteral) {
	      this.compile(this.expression)
	    }
	  },

	  update: function (id) {
	    this.teardown()
	    this.compile(id)
	  },

	  compile: function (id) {
	    var partial = this.vm.$options.partials[id]
	    _.assertAsset(partial, 'partial', id)
	    if (!partial) {
	      return
	    }
	    var vm = this.vm
	    var frag = templateParser.parse(partial, true)
	    var decompile = vm.$compile(frag)
	    this.decompile = function () {
	      decompile()
	      transition.blockRemove(this.start, this.end, vm)
	    }
	    transition.blockAppend(frag, this.end, vm)
	  },

	  teardown: function () {
	    if (this.decompile) {
	      this.decompile()
	      this.decompile = null
	    }
	  }

	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {

	  priority: 1000,
	  isLiteral: true,

	  bind: function () {
	    this.el.__v_trans = {
	      id: this.expression
	    }
	  }

	}

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  acceptStatement: true,
	  priority: 700,

	  bind: function () {
	    // deal with iframes
	    if (
	      this.el.tagName === 'IFRAME' &&
	      this.arg !== 'load'
	    ) {
	      var self = this
	      this.iframeBind = function () {
	        _.on(self.el.contentWindow, self.arg, self.handler)
	      }
	      _.on(this.el, 'load', this.iframeBind)
	    }
	  },

	  update: function (handler) {
	    if (typeof handler !== 'function') {
	      _.warn(
	        'Directive "v-on:' + this.expression + '" ' +
	        'expects a function value.'
	      )
	      return
	    }
	    this.reset()
	    var vm = this.vm
	    this.handler = function (e) {
	      e.targetVM = vm
	      vm.$event = e
	      var res = handler(e)
	      vm.$event = null
	      return res
	    }
	    if (this.iframeBind) {
	      this.iframeBind()
	    } else {
	      _.on(this.el, this.arg, this.handler)
	    }
	  },

	  reset: function () {
	    var el = this.iframeBind
	      ? this.el.contentWindow
	      : this.el
	    if (this.handler) {
	      _.off(el, this.arg, this.handler)
	    }
	  },

	  unbind: function () {
	    this.reset()
	    _.off(this.el, 'load', this.iframeBind)
	  }
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var templateParser = __webpack_require__(51)

	module.exports = {

	  isLiteral: true,

	  /**
	   * Setup. Two possible usages:
	   *
	   * - static:
	   *   v-component="comp"
	   *
	   * - dynamic:
	   *   v-component="{{currentView}}"
	   */

	  bind: function () {
	    if (!this.el.__vue__) {
	      // create a ref anchor
	      this.ref = document.createComment('v-component')
	      _.replace(this.el, this.ref)
	      // check keep-alive options
	      this.checkKeepAlive()
	      // check parent directives
	      this.parentLinker = this.el._parentLinker
	      // if static, build right now.
	      if (!this._isDynamicLiteral) {
	        this.resolveCtor(this.expression)
	        this.build()
	      }
	    } else {
	      _.warn(
	        'v-component="' + this.expression + '" cannot be ' +
	        'used on an already mounted instance.'
	      )
	    }
	  },

	  /**
	   * Check if the "keep-alive" flag is present.
	   * If yes, instead of destroying the active vm when
	   * hiding (v-if) or switching (dynamic literal) it,
	   * we simply remove it from the DOM and save it in a
	   * cache object, with its constructor id as the key.
	   */

	  checkKeepAlive: function () {
	    // check keep-alive flag
	    this.keepAlive = this.el.hasAttribute('keep-alive')
	    if (this.keepAlive) {
	      this.el.removeAttribute('keep-alive')
	      this.cache = {}
	    }
	  },

	  /**
	   * Resolve the component constructor to use when creating
	   * the child vm.
	   */

	  resolveCtor: function (id) {
	    this.ctorId = id
	    this.Ctor = this.vm.$options.components[id]
	    _.assertAsset(this.Ctor, 'component', id)
	  },

	  /**
	   * Instantiate/insert a new child vm.
	   * If keep alive and has cached instance, insert that
	   * instance; otherwise build a new one and cache it.
	   */

	  build: function () {
	    if (this.keepAlive) {
	      var cached = this.cache[this.ctorId]
	      if (cached) {
	        this.childVM = cached
	        cached.$before(this.ref)
	        return
	      }
	    }
	    var vm = this.vm
	    if (this.Ctor && !this.childVM) {
	      this.childVM = vm.$addChild({
	        el: templateParser.clone(this.el)
	      }, this.Ctor)
	      if (this.parentLinker) {
	        var dirCount = vm._directives.length
	        var targetVM = this.childVM.$options.inherit
	          ? this.childVM
	          : vm
	        this.parentLinker(targetVM, this.childVM.$el)
	        this.parentDirs = vm._directives.slice(dirCount)
	      }
	      if (this.keepAlive) {
	        this.cache[this.ctorId] = this.childVM
	      }
	      this.childVM.$before(this.ref)
	    }
	  },

	  /**
	   * Teardown the active vm.
	   * If keep alive, simply remove it; otherwise destroy it.
	   *
	   * @param {Boolean} remove
	   */

	  unbuild: function (remove) {
	    var child = this.childVM
	    if (!child) {
	      return
	    }
	    if (this.keepAlive) {
	      if (remove) {
	        child.$remove()
	      }
	    } else {
	      child.$destroy(remove)
	      var parentDirs = this.parentDirs
	      if (parentDirs) {
	        var i = parentDirs.length
	        while (i--) {
	          parentDirs[i]._teardown()
	        }
	      }
	    }
	    this.childVM = null
	  },

	  /**
	   * Update callback for the dynamic literal scenario,
	   * e.g. v-component="{{view}}"
	   */

	  update: function (value) {
	    this.unbuild(true)
	    if (value) {
	      this.resolveCtor(value)
	      this.build()
	    }
	  },

	  /**
	   * Unbind.
	   * Make sure keepAlive is set to false so that the
	   * instance is always destroyed.
	   */

	  unbind: function () {
	    this.keepAlive = false
	    this.unbuild()
	  }

	}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var isObject = _.isObject
	var textParser = __webpack_require__(42)
	var expParser = __webpack_require__(44)
	var templateParser = __webpack_require__(51)
	var compile = __webpack_require__(46)
	var transclude = __webpack_require__(47)
	var mergeOptions = __webpack_require__(19)
	var uid = 0

	module.exports = {

	  /**
	   * Setup.
	   */

	  bind: function () {
	    // uid as a cache identifier
	    this.id = '__v_repeat_' + (++uid)
	    // we need to insert the objToArray converter
	    // as the first read filter.
	    if (!this.filters) {
	      this.filters = {}
	    }
	    // add the object -> array convert filter
	    var objectConverter = _.bind(objToArray, this)
	    if (!this.filters.read) {
	      this.filters.read = [objectConverter]
	    } else {
	      this.filters.read.unshift(objectConverter)
	    }
	    // setup ref node
	    this.ref = document.createComment('v-repeat')
	    _.replace(this.el, this.ref)
	    // check if this is a block repeat
	    this.template = this.el.tagName === 'TEMPLATE'
	      ? templateParser.parse(this.el, true)
	      : this.el
	    // check other directives that need to be handled
	    // at v-repeat level
	    this.checkIf()
	    this.checkRef()
	    this.checkTrackById()
	    this.checkComponent()
	    // cache for primitive value instances
	    this.cache = Object.create(null)
	  },

	  /**
	   * Warn against v-if usage.
	   */

	  checkIf: function () {
	    if (_.attr(this.el, 'if') !== null) {
	      _.warn(
	        'Don\'t use v-if with v-repeat. ' +
	        'Use v-show or the "filterBy" filter instead.'
	      )
	    }
	  },

	  /**
	   * Check if v-ref/ v-el is also present.
	   */

	  checkRef: function () {
	    var childId = _.attr(this.el, 'ref')
	    this.childId = childId
	      ? this.vm.$interpolate(childId)
	      : null
	    var elId = _.attr(this.el, 'el')
	    this.elId = elId
	      ? this.vm.$interpolate(elId)
	      : null
	  },

	  /**
	   * Check for a track-by ID, which allows us to identify
	   * a piece of data and its associated instance by its
	   * unique id.
	   */

	  checkTrackById: function () {
	    this.idKey = this.el.getAttribute('trackby')
	    if (this.idKey !== null) {
	      this.el.removeAttribute('trackby')
	    }
	  },

	  /**
	   * Check the component constructor to use for repeated
	   * instances. If static we resolve it now, otherwise it
	   * needs to be resolved at build time with actual data.
	   */

	  checkComponent: function () {
	    var id = _.attr(this.el, 'component')
	    var options = this.vm.$options
	    if (!id) {
	      this.Ctor = _.Vue // default constructor
	      this.inherit = true // inline repeats should inherit
	      // important: transclude with no options, just
	      // to ensure block start and block end
	      this.template = transclude(this.template)
	      this._linker = compile(this.template, options)
	    } else {
	      var tokens = textParser.parse(id)
	      if (!tokens) { // static component
	        var Ctor = this.Ctor = options.components[id]
	        _.assertAsset(Ctor, 'component', id)
	        if (Ctor) {
	          // merge an empty object with owner vm as parent
	          // so child vms can access parent assets.
	          var merged = mergeOptions(
	            Ctor.options,
	            {},
	            { $parent: this.vm }
	          )
	          this.template = transclude(this.template, merged)
	          this._linker = compile(this.template, merged)
	        }
	      } else {
	        // to be resolved later
	        var ctorExp = textParser.tokensToExp(tokens)
	        this.ctorGetter = expParser.parse(ctorExp).get
	      }
	    }
	  },

	  /**
	   * Update.
	   * This is called whenever the Array mutates.
	   *
	   * @param {Array} data
	   */

	  update: function (data) {
	    if (typeof data === 'number') {
	      data = range(data)
	    }
	    this.vms = this.diff(data || [], this.vms)
	    // update v-ref
	    if (this.childId) {
	      this.vm.$[this.childId] = this.vms
	    }
	    if (this.elId) {
	      this.vm.$$[this.elId] = this.vms.map(function (vm) {
	        return vm.$el
	      })
	    }
	  },

	  /**
	   * Diff, based on new data and old data, determine the
	   * minimum amount of DOM manipulations needed to make the
	   * DOM reflect the new data Array.
	   *
	   * The algorithm diffs the new data Array by storing a
	   * hidden reference to an owner vm instance on previously
	   * seen data. This allows us to achieve O(n) which is
	   * better than a levenshtein distance based algorithm,
	   * which is O(m * n).
	   *
	   * @param {Array} data
	   * @param {Array} oldVms
	   * @return {Array}
	   */

	  diff: function (data, oldVms) {
	    var idKey = this.idKey
	    var converted = this.converted
	    var ref = this.ref
	    var alias = this.arg
	    var init = !oldVms
	    var vms = new Array(data.length)
	    var obj, raw, vm, i, l
	    // First pass, go through the new Array and fill up
	    // the new vms array. If a piece of data has a cached
	    // instance for it, we reuse it. Otherwise build a new
	    // instance.
	    for (i = 0, l = data.length; i < l; i++) {
	      obj = data[i]
	      raw = converted ? obj.value : obj
	      vm = !init && this.getVm(raw)
	      if (vm) { // reusable instance
	        vm._reused = true
	        vm.$index = i // update $index
	        if (converted) {
	          vm.$key = obj.key // update $key
	        }
	        if (idKey) { // swap track by id data
	          if (alias) {
	            vm[alias] = raw
	          } else {
	            vm._setData(raw)
	          }
	        }
	      } else { // new instance
	        vm = this.build(obj, i)
	        vm._new = true
	      }
	      vms[i] = vm
	      // insert if this is first run
	      if (init) {
	        vm.$before(ref)
	      }
	    }
	    // if this is the first run, we're done.
	    if (init) {
	      return vms
	    }
	    // Second pass, go through the old vm instances and
	    // destroy those who are not reused (and remove them
	    // from cache)
	    for (i = 0, l = oldVms.length; i < l; i++) {
	      vm = oldVms[i]
	      if (!vm._reused) {
	        this.uncacheVm(vm)
	        vm.$destroy(true)
	      }
	    }
	    // final pass, move/insert new instances into the
	    // right place. We're going in reverse here because
	    // insertBefore relies on the next sibling to be
	    // resolved.
	    var targetNext, currentNext
	    i = vms.length
	    while (i--) {
	      vm = vms[i]
	      // this is the vm that we should be in front of
	      targetNext = vms[i + 1]
	      if (!targetNext) {
	        // This is the last item. If it's reused then
	        // everything else will eventually be in the right
	        // place, so no need to touch it. Otherwise, insert
	        // it.
	        if (!vm._reused) {
	          vm.$before(ref)
	        }
	      } else {
	        if (vm._reused) {
	          // this is the vm we are actually in front of
	          currentNext = findNextVm(vm, ref)
	          // we only need to move if we are not in the right
	          // place already.
	          if (currentNext !== targetNext) {
	            vm.$before(targetNext.$el, null, false)
	          }
	        } else {
	          // new instance, insert to existing next
	          vm.$before(targetNext.$el)
	        }
	      }
	      vm._new = false
	      vm._reused = false
	    }
	    return vms
	  },

	  /**
	   * Build a new instance and cache it.
	   *
	   * @param {Object} data
	   * @param {Number} index
	   */

	  build: function (data, index) {
	    var original = data
	    var meta = { $index: index }
	    if (this.converted) {
	      meta.$key = original.key
	    }
	    var raw = this.converted ? data.value : data
	    var alias = this.arg
	    var hasAlias = !isObject(raw) || alias
	    // wrap the raw data with alias
	    data = hasAlias ? {} : raw
	    if (alias) {
	      data[alias] = raw
	    } else if (hasAlias) {
	      meta.$value = raw
	    }
	    // resolve constructor
	    var Ctor = this.Ctor || this.resolveCtor(data, meta)
	    var vm = this.vm.$addChild({
	      el: templateParser.clone(this.template),
	      _linker: this._linker,
	      _meta: meta,
	      data: data,
	      inherit: this.inherit
	    }, Ctor)
	    // cache instance
	    this.cacheVm(raw, vm)
	    return vm
	  },

	  /**
	   * Resolve a contructor to use for an instance.
	   * The tricky part here is that there could be dynamic
	   * components depending on instance data.
	   *
	   * @param {Object} data
	   * @param {Object} meta
	   * @return {Function}
	   */

	  resolveCtor: function (data, meta) {
	    // create a temporary context object and copy data
	    // and meta properties onto it.
	    // use _.define to avoid accidentally overwriting scope
	    // properties.
	    var context = Object.create(this.vm)
	    var key
	    for (key in data) {
	      _.define(context, key, data[key])
	    }
	    for (key in meta) {
	      _.define(context, key, meta[key])
	    }
	    var id = this.ctorGetter.call(context, context)
	    var Ctor = this.vm.$options.components[id]
	    _.assertAsset(Ctor, 'component', id)
	    return Ctor
	  },

	  /**
	   * Unbind, teardown everything
	   */

	  unbind: function () {
	    if (this.childId) {
	      delete this.vm.$[this.childId]
	    }
	    if (this.vms) {
	      var i = this.vms.length
	      var vm
	      while (i--) {
	        vm = this.vms[i]
	        this.uncacheVm(vm)
	        vm.$destroy()
	      }
	    }
	  },

	  /**
	   * Cache a vm instance based on its data.
	   *
	   * If the data is an object, we save the vm's reference on
	   * the data object as a hidden property. Otherwise we
	   * cache them in an object and for each primitive value
	   * there is an array in case there are duplicates.
	   *
	   * @param {Object} data
	   * @param {Vue} vm
	   */

	  cacheVm: function (data, vm) {
	    var idKey = this.idKey
	    var cache = this.cache
	    var id
	    if (idKey) {
	      id = data[idKey]
	      if (!cache[id]) {
	        cache[id] = vm
	      } else {
	        _.warn('Duplicate ID in v-repeat: ' + id)
	      }
	    } else if (isObject(data)) {
	      id = this.id
	      if (data.hasOwnProperty(id)) {
	        if (data[id] === null) {
	          data[id] = vm
	        } else {
	          _.warn(
	            'Duplicate objects are not supported in v-repeat.'
	          )
	        }
	      } else {
	        _.define(data, this.id, vm)
	      }
	    } else {
	      if (!cache[data]) {
	        cache[data] = [vm]
	      } else {
	        cache[data].push(vm)
	      }
	    }
	    vm._raw = data
	  },

	  /**
	   * Try to get a cached instance from a piece of data.
	   *
	   * @param {Object} data
	   * @return {Vue|undefined}
	   */

	  getVm: function (data) {
	    if (this.idKey) {
	      return this.cache[data[this.idKey]]
	    } else if (isObject(data)) {
	      return data[this.id]
	    } else {
	      var cached = this.cache[data]
	      if (cached) {
	        var i = 0
	        var vm = cached[i]
	        // since duplicated vm instances might be a reused
	        // one OR a newly created one, we need to return the
	        // first instance that is neither of these.
	        while (vm && (vm._reused || vm._new)) {
	          vm = cached[++i]
	        }
	        return vm
	      }
	    }
	  },

	  /**
	   * Delete a cached vm instance.
	   *
	   * @param {Vue} vm
	   */

	  uncacheVm: function (vm) {
	    var data = vm._raw
	    if (this.idKey) {
	      this.cache[data[this.idKey]] = null
	    } else if (isObject(data)) {
	      data[this.id] = null
	      vm._raw = null
	    } else {
	      this.cache[data].pop()
	    }
	  }

	}

	/**
	 * Helper to find the next element that is an instance
	 * root node. This is necessary because a destroyed vm's
	 * element could still be lingering in the DOM before its
	 * leaving transition finishes, but its __vue__ reference
	 * should have been removed so we can skip them.
	 *
	 * @param {Vue} vm
	 * @param {CommentNode} ref
	 * @return {Vue}
	 */

	function findNextVm (vm, ref) {
	  var el = (vm._blockEnd || vm.$el).nextSibling
	  while (!el.__vue__ && el !== ref) {
	    el = el.nextSibling
	  }
	  return el.__vue__
	}

	/**
	 * Attempt to convert non-Array objects to array.
	 * This is the default filter installed to every v-repeat
	 * directive.
	 *
	 * It will be called with **the directive** as `this`
	 * context so that we can mark the repeat array as converted
	 * from an object.
	 *
	 * @param {*} obj
	 * @return {Array}
	 * @private
	 */

	function objToArray (obj) {
	  if (!_.isPlainObject(obj)) {
	    return obj
	  }
	  var keys = Object.keys(obj)
	  var i = keys.length
	  var res = new Array(i)
	  var key
	  while (i--) {
	    key = keys[i]
	    res[i] = {
	      key: key,
	      value: obj[key]
	    }
	  }
	  // `this` points to the repeat directive instance
	  this.converted = true
	  return res
	}

	/**
	 * Create a range array from given number.
	 *
	 * @param {Number} n
	 * @return {Array}
	 */

	function range (n) {
	  var i = -1
	  var ret = new Array(n)
	  while (++i < n) {
	    ret[i] = i
	  }
	  return ret
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var compile = __webpack_require__(46)
	var templateParser = __webpack_require__(51)
	var transition = __webpack_require__(45)

	module.exports = {

	  bind: function () {
	    var el = this.el
	    if (!el.__vue__) {
	      this.start = document.createComment('v-if-start')
	      this.end = document.createComment('v-if-end')
	      _.replace(el, this.end)
	      _.before(this.start, this.end)
	      if (el.tagName === 'TEMPLATE') {
	        this.template = templateParser.parse(el, true)
	      } else {
	        this.template = document.createDocumentFragment()
	        this.template.appendChild(el)
	      }
	      // compile the nested partial
	      this.linker = compile(
	        this.template,
	        this.vm.$options,
	        true
	      )
	    } else {
	      this.invalid = true
	      _.warn(
	        'v-if="' + this.expression + '" cannot be ' +
	        'used on an already mounted instance.'
	      )
	    }
	  },

	  update: function (value) {
	    if (this.invalid) return
	    if (value) {
	      this.insert()
	    } else {
	      this.teardown()
	    }
	  },

	  insert: function () {
	    // avoid duplicate inserts, since update() can be
	    // called with different truthy values
	    if (this.decompile) {
	      return
	    }
	    var vm = this.vm
	    var frag = templateParser.clone(this.template)
	    var decompile = this.linker(vm, frag)
	    this.decompile = function () {
	      decompile()
	      transition.blockRemove(this.start, this.end, vm)
	    }
	    transition.blockAppend(frag, this.end, vm)
	  },

	  teardown: function () {
	    if (this.decompile) {
	      this.decompile()
	      this.decompile = null
	    }
	  }

	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Watcher = __webpack_require__(21)

	module.exports = {

	  priority: 900,

	  bind: function () {
	    var vm = this.vm
	    if (this.el !== vm.$el) {
	      _.warn(
	        'v-with can only be used on instance root elements.'
	      )
	    } else if (!vm.$parent) {
	      _.warn(
	        'v-with must be used on an instance with a parent.'
	      )
	    } else {
	      var key = this.arg
	      this.watcher = new Watcher(
	        vm.$parent,
	        this.expression,
	        key
	          ? function (val) {
	              vm.$set(key, val)
	            }
	          : function (val) {
	              vm.$data = val
	            }
	      )
	      // initial set
	      var initialVal = this.watcher.value
	      if (key) {
	        vm.$set(key, initialVal)
	      } else {
	        vm.$data = initialVal
	      }
	    }
	  },

	  unbind: function () {
	    if (this.watcher) {
	      this.watcher.teardown()
	    }
	  }

	}

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Path = __webpack_require__(41)

	/**
	 * Filter filter for v-repeat
	 *
	 * @param {String} searchKey
	 * @param {String} [delimiter]
	 * @param {String} dataKey
	 */

	exports.filterBy = function (arr, searchKey, delimiter, dataKey) {
	  // allow optional `in` delimiter
	  // because why not
	  if (delimiter && delimiter !== 'in') {
	    dataKey = delimiter
	  }
	  // get the search string
	  var search =
	    _.stripQuotes(searchKey) ||
	    this.$get(searchKey)
	  if (!search) {
	    return arr
	  }
	  search = search.toLowerCase()
	  // get the optional dataKey
	  dataKey =
	    dataKey &&
	    (_.stripQuotes(dataKey) || this.$get(dataKey))
	  return arr.filter(function (item) {
	    return dataKey
	      ? contains(Path.get(item, dataKey), search)
	      : contains(item, search)
	  })
	}

	/**
	 * Filter filter for v-repeat
	 *
	 * @param {String} sortKey
	 * @param {String} reverseKey
	 */

	exports.orderBy = function (arr, sortKey, reverseKey) {
	  var key =
	    _.stripQuotes(sortKey) ||
	    this.$get(sortKey)
	  if (!key) {
	    return arr
	  }
	  var order = 1
	  if (reverseKey) {
	    if (reverseKey === '-1') {
	      order = -1
	    } else if (reverseKey.charCodeAt(0) === 0x21) { // !
	      reverseKey = reverseKey.slice(1)
	      order = this.$get(reverseKey) ? 1 : -1
	    } else {
	      order = this.$get(reverseKey) ? -1 : 1
	    }
	  }
	  // sort on a copy to avoid mutating original array
	  return arr.slice().sort(function (a, b) {
	    a = Path.get(a, key)
	    b = Path.get(b, key)
	    return a === b ? 0 : a > b ? order : -order
	  })
	}

	/**
	 * String contain helper
	 *
	 * @param {*} val
	 * @param {String} search
	 */

	function contains (val, search) {
	  if (_.isObject(val)) {
	    for (var key in val) {
	      if (contains(val[key], search)) {
	        return true
	      }
	    }
	  } else if (val != null) {
	    return val.toString().toLowerCase().indexOf(search) > -1
	  }
	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var uid = 0

	/**
	 * A binding is an observable that can have multiple
	 * directives subscribing to it.
	 *
	 * @constructor
	 */

	function Binding () {
	  this.id = ++uid
	  this.subs = []
	}

	var p = Binding.prototype

	/**
	 * Add a directive subscriber.
	 *
	 * @param {Directive} sub
	 */

	p.addSub = function (sub) {
	  this.subs.push(sub)
	}

	/**
	 * Remove a directive subscriber.
	 *
	 * @param {Directive} sub
	 */

	p.removeSub = function (sub) {
	  if (this.subs.length) {
	    var i = this.subs.indexOf(sub)
	    if (i > -1) this.subs.splice(i, 1)
	  }
	}

	/**
	 * Notify all subscribers of a new value.
	 */

	p.notify = function () {
	  for (var i = 0, l = this.subs.length; i < l; i++) {
	    this.subs[i].update()
	  }
	}

	module.exports = Binding

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(20)
	var Watcher = __webpack_require__(21)
	var textParser = __webpack_require__(42)
	var expParser = __webpack_require__(44)

	/**
	 * A directive links a DOM element with a piece of data,
	 * which is the result of evaluating an expression.
	 * It registers a watcher with the expression and calls
	 * the DOM update function when a change is triggered.
	 *
	 * @param {String} name
	 * @param {Node} el
	 * @param {Vue} vm
	 * @param {Object} descriptor
	 *                 - {String} expression
	 *                 - {String} [arg]
	 *                 - {Array<Object>} [filters]
	 * @param {Object} def - directive definition object
	 * @param {Function} [linker] - pre-compiled linker function
	 * @constructor
	 */

	function Directive (name, el, vm, descriptor, def, linker) {
	  // public
	  this.name = name
	  this.el = el
	  this.vm = vm
	  // copy descriptor props
	  this.raw = descriptor.raw
	  this.expression = descriptor.expression
	  this.arg = descriptor.arg
	  this.filters = _.resolveFilters(vm, descriptor.filters)
	  // private
	  this._linker = linker
	  this._locked = false
	  this._bound = false
	  // init
	  this._bind(def)
	}

	var p = Directive.prototype

	/**
	 * Initialize the directive, mixin definition properties,
	 * setup the watcher, call definition bind() and update()
	 * if present.
	 *
	 * @param {Object} def
	 */

	p._bind = function (def) {
	  if (this.name !== 'cloak' && this.el.removeAttribute) {
	    this.el.removeAttribute(config.prefix + this.name)
	  }
	  if (typeof def === 'function') {
	    this.update = def
	  } else {
	    _.extend(this, def)
	  }
	  this._watcherExp = this.expression
	  this._checkDynamicLiteral()
	  if (this.bind) {
	    this.bind()
	  }
	  if (
	    this.update && this._watcherExp &&
	    (!this.isLiteral || this._isDynamicLiteral) &&
	    !this._checkStatement()
	  ) {
	    // use raw expression as identifier because filters
	    // make them different watchers
	    var watcher = this.vm._watchers[this.raw]
	    // wrapped updater for context
	    var dir = this
	    var update = this._update = function (val, oldVal) {
	      if (!dir._locked) {
	        dir.update(val, oldVal)
	      }
	    }
	    if (!watcher) {
	      watcher = this.vm._watchers[this.raw] = new Watcher(
	        this.vm,
	        this._watcherExp,
	        update, // callback
	        this.filters,
	        this.twoWay // need setter
	      )
	    } else {
	      watcher.addCb(update)
	    }
	    this._watcher = watcher
	    if (this._initValue != null) {
	      watcher.set(this._initValue)
	    } else {
	      this.update(watcher.value)
	    }
	  }
	  this._bound = true
	}

	/**
	 * check if this is a dynamic literal binding.
	 *
	 * e.g. v-component="{{currentView}}"
	 */

	p._checkDynamicLiteral = function () {
	  var expression = this.expression
	  if (expression && this.isLiteral) {
	    var tokens = textParser.parse(expression)
	    if (tokens) {
	      var exp = textParser.tokensToExp(tokens)
	      this.expression = this.vm.$get(exp)
	      this._watcherExp = exp
	      this._isDynamicLiteral = true
	    }
	  }
	}

	/**
	 * Check if the directive is a function caller
	 * and if the expression is a callable one. If both true,
	 * we wrap up the expression and use it as the event
	 * handler.
	 *
	 * e.g. v-on="click: a++"
	 *
	 * @return {Boolean}
	 */

	p._checkStatement = function () {
	  var expression = this.expression
	  if (
	    expression && this.acceptStatement &&
	    !expParser.pathTestRE.test(expression)
	  ) {
	    var fn = expParser.parse(expression).get
	    var vm = this.vm
	    var handler = function () {
	      fn.call(vm, vm)
	    }
	    if (this.filters) {
	      handler = _.applyFilters(
	        handler,
	        this.filters.read,
	        vm
	      )
	    }
	    this.update(handler)
	    return true
	  }
	}

	/**
	 * Teardown the watcher and call unbind.
	 */

	p._teardown = function () {
	  if (this._bound) {
	    if (this.unbind) {
	      this.unbind()
	    }
	    var watcher = this._watcher
	    if (watcher && watcher.active) {
	      watcher.removeCb(this._update)
	      if (!watcher.active) {
	        this.vm._watchers[this.raw] = null
	      }
	    }
	    this._bound = false
	    this.vm = this.el = this._watcher = null
	  }
	}

	/**
	 * Set the corresponding value with the setter.
	 * This should only be used in two-way directives
	 * e.g. v-model.
	 *
	 * @param {*} value
	 * @param {Boolean} lock - prevent wrtie triggering update.
	 * @public
	 */

	p.set = function (value, lock) {
	  if (this.twoWay) {
	    if (lock) {
	      this._locked = true
	    }
	    this._watcher.set(value)
	    if (lock) {
	      var self = this
	      _.nextTick(function () {
	        self._locked = false        
	      })
	    }
	  }
	}

	module.exports = Directive

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Cache = __webpack_require__(52)
	var pathCache = new Cache(1000)
	var identRE = /^[$_a-zA-Z]+[\w$]*$/

	/**
	 * Path-parsing algorithm scooped from Polymer/observe-js
	 */

	var pathStateMachine = {
	  'beforePath': {
	    'ws': ['beforePath'],
	    'ident': ['inIdent', 'append'],
	    '[': ['beforeElement'],
	    'eof': ['afterPath']
	  },

	  'inPath': {
	    'ws': ['inPath'],
	    '.': ['beforeIdent'],
	    '[': ['beforeElement'],
	    'eof': ['afterPath']
	  },

	  'beforeIdent': {
	    'ws': ['beforeIdent'],
	    'ident': ['inIdent', 'append']
	  },

	  'inIdent': {
	    'ident': ['inIdent', 'append'],
	    '0': ['inIdent', 'append'],
	    'number': ['inIdent', 'append'],
	    'ws': ['inPath', 'push'],
	    '.': ['beforeIdent', 'push'],
	    '[': ['beforeElement', 'push'],
	    'eof': ['afterPath', 'push']
	  },

	  'beforeElement': {
	    'ws': ['beforeElement'],
	    '0': ['afterZero', 'append'],
	    'number': ['inIndex', 'append'],
	    "'": ['inSingleQuote', 'append', ''],
	    '"': ['inDoubleQuote', 'append', '']
	  },

	  'afterZero': {
	    'ws': ['afterElement', 'push'],
	    ']': ['inPath', 'push']
	  },

	  'inIndex': {
	    '0': ['inIndex', 'append'],
	    'number': ['inIndex', 'append'],
	    'ws': ['afterElement'],
	    ']': ['inPath', 'push']
	  },

	  'inSingleQuote': {
	    "'": ['afterElement'],
	    'eof': 'error',
	    'else': ['inSingleQuote', 'append']
	  },

	  'inDoubleQuote': {
	    '"': ['afterElement'],
	    'eof': 'error',
	    'else': ['inDoubleQuote', 'append']
	  },

	  'afterElement': {
	    'ws': ['afterElement'],
	    ']': ['inPath', 'push']
	  }
	}

	function noop () {}

	/**
	 * Determine the type of a character in a keypath.
	 *
	 * @param {Char} char
	 * @return {String} type
	 */

	function getPathCharType (char) {
	  if (char === undefined) {
	    return 'eof'
	  }

	  var code = char.charCodeAt(0)

	  switch(code) {
	    case 0x5B: // [
	    case 0x5D: // ]
	    case 0x2E: // .
	    case 0x22: // "
	    case 0x27: // '
	    case 0x30: // 0
	      return char

	    case 0x5F: // _
	    case 0x24: // $
	      return 'ident'

	    case 0x20: // Space
	    case 0x09: // Tab
	    case 0x0A: // Newline
	    case 0x0D: // Return
	    case 0xA0:  // No-break space
	    case 0xFEFF:  // Byte Order Mark
	    case 0x2028:  // Line Separator
	    case 0x2029:  // Paragraph Separator
	      return 'ws'
	  }

	  // a-z, A-Z
	  if ((0x61 <= code && code <= 0x7A) ||
	      (0x41 <= code && code <= 0x5A)) {
	    return 'ident'
	  }

	  // 1-9
	  if (0x31 <= code && code <= 0x39) {
	    return 'number'
	  }

	  return 'else'
	}

	/**
	 * Parse a string path into an array of segments
	 * Todo implement cache
	 *
	 * @param {String} path
	 * @return {Array|undefined}
	 */

	function parsePath (path) {
	  var keys = []
	  var index = -1
	  var mode = 'beforePath'
	  var c, newChar, key, type, transition, action, typeMap

	  var actions = {
	    push: function() {
	      if (key === undefined) {
	        return
	      }
	      keys.push(key)
	      key = undefined
	    },
	    append: function() {
	      if (key === undefined) {
	        key = newChar
	      } else {
	        key += newChar
	      }
	    }
	  }

	  function maybeUnescapeQuote () {
	    var nextChar = path[index + 1]
	    if ((mode === 'inSingleQuote' && nextChar === "'") ||
	        (mode === 'inDoubleQuote' && nextChar === '"')) {
	      index++
	      newChar = nextChar
	      actions.append()
	      return true
	    }
	  }

	  while (mode) {
	    index++
	    c = path[index]

	    if (c === '\\' && maybeUnescapeQuote()) {
	      continue
	    }

	    type = getPathCharType(c)
	    typeMap = pathStateMachine[mode]
	    transition = typeMap[type] || typeMap['else'] || 'error'

	    if (transition === 'error') {
	      return // parse error
	    }

	    mode = transition[0]
	    action = actions[transition[1]] || noop
	    newChar = transition[2] === undefined
	      ? c
	      : transition[2]
	    action()

	    if (mode === 'afterPath') {
	      return keys
	    }
	  }
	}

	/**
	 * Format a accessor segment based on its type.
	 *
	 * @param {String} key
	 * @return {Boolean}
	 */

	function formatAccessor(key) {
	  if (identRE.test(key)) { // identifier
	    return '.' + key
	  } else if (+key === key >>> 0) { // bracket index
	    return '[' + key + ']';
	  } else { // bracket string
	    return '["' + key.replace(/"/g, '\\"') + '"]';
	  }
	}

	/**
	 * Compiles a getter function with a fixed path.
	 *
	 * @param {Array} path
	 * @return {Function}
	 */

	exports.compileGetter = function (path) {
	  var body =
	    'try{return o' +
	    path.map(formatAccessor).join('') +
	    '}catch(e){};'
	  return new Function('o', body)
	}

	/**
	 * External parse that check for a cache hit first
	 *
	 * @param {String} path
	 * @return {Array|undefined}
	 */

	exports.parse = function (path) {
	  var hit = pathCache.get(path)
	  if (!hit) {
	    hit = parsePath(path)
	    if (hit) {
	      hit.get = exports.compileGetter(hit)
	      pathCache.put(path, hit)
	    }
	  }
	  return hit
	}

	/**
	 * Get from an object from a path string
	 *
	 * @param {Object} obj
	 * @param {String} path
	 */

	exports.get = function (obj, path) {
	  path = exports.parse(path)
	  if (path) {
	    return path.get(obj)
	  }
	}

	/**
	 * Set on an object from a path
	 *
	 * @param {Object} obj
	 * @param {String | Array} path
	 * @param {*} val
	 */

	exports.set = function (obj, path, val) {
	  if (typeof path === 'string') {
	    path = exports.parse(path)
	  }
	  if (!path || !_.isObject(obj)) {
	    return false
	  }
	  var last, key
	  for (var i = 0, l = path.length - 1; i < l; i++) {
	    last = obj
	    key = path[i]
	    obj = obj[key]
	    if (!_.isObject(obj)) {
	      obj = {}
	      last.$add(key, obj)
	    }
	  }
	  key = path[i]
	  if (key in obj) {
	    obj[key] = val
	  } else {
	    obj.$add(key, val)
	  }
	  return true
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var Cache = __webpack_require__(52)
	var config = __webpack_require__(20)
	var dirParser = __webpack_require__(43)
	var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
	var cache, tagRE, htmlRE, firstChar, lastChar

	/**
	 * Escape a string so it can be used in a RegExp
	 * constructor.
	 *
	 * @param {String} str
	 */

	function escapeRegex (str) {
	  return str.replace(regexEscapeRE, '\\$&')
	}

	/**
	 * Compile the interpolation tag regex.
	 *
	 * @return {RegExp}
	 */

	function compileRegex () {
	  config._delimitersChanged = false
	  var open = config.delimiters[0]
	  var close = config.delimiters[1]
	  firstChar = open.charAt(0)
	  lastChar = close.charAt(close.length - 1)
	  var firstCharRE = escapeRegex(firstChar)
	  var lastCharRE = escapeRegex(lastChar)
	  var openRE = escapeRegex(open)
	  var closeRE = escapeRegex(close)
	  tagRE = new RegExp(
	    firstCharRE + '?' + openRE +
	    '(.+?)' +
	    closeRE + lastCharRE + '?',
	    'g'
	  )
	  htmlRE = new RegExp(
	    '^' + firstCharRE + openRE +
	    '.*' +
	    closeRE + lastCharRE + '$'
	  )
	  // reset cache
	  cache = new Cache(1000)
	}

	/**
	 * Parse a template text string into an array of tokens.
	 *
	 * @param {String} text
	 * @return {Array<Object> | null}
	 *               - {String} type
	 *               - {String} value
	 *               - {Boolean} [html]
	 *               - {Boolean} [oneTime]
	 */

	exports.parse = function (text) {
	  if (config._delimitersChanged) {
	    compileRegex()
	  }
	  var hit = cache.get(text)
	  if (hit) {
	    return hit
	  }
	  if (!tagRE.test(text)) {
	    return null
	  }
	  var tokens = []
	  var lastIndex = tagRE.lastIndex = 0
	  var match, index, value, first, oneTime, partial
	  /* jshint boss:true */
	  while (match = tagRE.exec(text)) {
	    index = match.index
	    // push text token
	    if (index > lastIndex) {
	      tokens.push({
	        value: text.slice(lastIndex, index)
	      })
	    }
	    // tag token
	    first = match[1].charCodeAt(0)
	    oneTime = first === 0x2A // *
	    partial = first === 0x3E // >
	    value = (oneTime || partial)
	      ? match[1].slice(1)
	      : match[1]
	    tokens.push({
	      tag: true,
	      value: value.trim(),
	      html: htmlRE.test(match[0]),
	      oneTime: oneTime,
	      partial: partial
	    })
	    lastIndex = index + match[0].length
	  }
	  if (lastIndex < text.length) {
	    tokens.push({
	      value: text.slice(lastIndex)
	    })
	  }
	  cache.put(text, tokens)
	  return tokens
	}

	/**
	 * Format a list of tokens into an expression.
	 * e.g. tokens parsed from 'a {{b}} c' can be serialized
	 * into one single expression as '"a " + b + " c"'.
	 *
	 * @param {Array} tokens
	 * @param {Vue} [vm]
	 * @return {String}
	 */

	exports.tokensToExp = function (tokens, vm) {
	  return tokens.length > 1
	    ? tokens.map(function (token) {
	        return formatToken(token, vm)
	      }).join('+')
	    : formatToken(tokens[0], vm, true)
	}

	/**
	 * Format a single token.
	 *
	 * @param {Object} token
	 * @param {Vue} [vm]
	 * @param {Boolean} single
	 * @return {String}
	 */

	function formatToken (token, vm, single) {
	  return token.tag
	    ? vm && token.oneTime
	      ? '"' + vm.$eval(token.value) + '"'
	      : single
	        ? token.value
	        : inlineFilters(token.value)
	    : '"' + token.value + '"'
	}

	/**
	 * For an attribute with multiple interpolation tags,
	 * e.g. attr="some-{{thing | filter}}", in order to combine
	 * the whole thing into a single watchable expression, we
	 * have to inline those filters. This function does exactly
	 * that. This is a bit hacky but it avoids heavy changes
	 * to directive parser and watcher mechanism.
	 *
	 * @param {String} exp
	 * @return {String}
	 */

	var filterRE = /[^|]\|[^|]/
	function inlineFilters (exp) {
	  if (!filterRE.test(exp)) {
	    return '(' + exp + ')'
	  } else {
	    var dir = dirParser.parse(exp)[0]
	    if (!dir.filters) {
	      return '(' + exp + ')'
	    } else {
	      exp = dir.expression
	      for (var i = 0, l = dir.filters.length; i < l; i++) {
	        var filter = dir.filters[i]
	        var args = filter.args
	          ? ',"' + filter.args.join('","') + '"'
	          : ''
	        exp = 'this.$options.filters["' + filter.name + '"]' +
	          '.apply(this,[' + exp + args + '])'
	      }
	      return exp
	    }
	  }
	}

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Cache = __webpack_require__(52)
	var cache = new Cache(1000)
	var argRE = /^[^\{\?]+$|^'[^']*'$|^"[^"]*"$/
	var filterTokenRE = /[^\s'"]+|'[^']+'|"[^"]+"/g

	/**
	 * Parser state
	 */

	var str
	var c, i, l
	var inSingle
	var inDouble
	var curly
	var square
	var paren
	var begin
	var argIndex
	var dirs
	var dir
	var lastFilterIndex
	var arg

	/**
	 * Push a directive object into the result Array
	 */

	function pushDir () {
	  dir.raw = str.slice(begin, i).trim()
	  if (dir.expression === undefined) {
	    dir.expression = str.slice(argIndex, i).trim()
	  } else if (lastFilterIndex !== begin) {
	    pushFilter()
	  }
	  if (i === 0 || dir.expression) {
	    dirs.push(dir)
	  }
	}

	/**
	 * Push a filter to the current directive object
	 */

	function pushFilter () {
	  var exp = str.slice(lastFilterIndex, i).trim()
	  var filter
	  if (exp) {
	    filter = {}
	    var tokens = exp.match(filterTokenRE)
	    filter.name = tokens[0]
	    filter.args = tokens.length > 1 ? tokens.slice(1) : null
	  }
	  if (filter) {
	    (dir.filters = dir.filters || []).push(filter)
	  }
	  lastFilterIndex = i + 1
	}

	/**
	 * Parse a directive string into an Array of AST-like
	 * objects representing directives.
	 *
	 * Example:
	 *
	 * "click: a = a + 1 | uppercase" will yield:
	 * {
	 *   arg: 'click',
	 *   expression: 'a = a + 1',
	 *   filters: [
	 *     { name: 'uppercase', args: null }
	 *   ]
	 * }
	 *
	 * @param {String} str
	 * @return {Array<Object>}
	 */

	exports.parse = function (s) {

	  var hit = cache.get(s)
	  if (hit) {
	    return hit
	  }

	  // reset parser state
	  str = s
	  inSingle = inDouble = false
	  curly = square = paren = begin = argIndex = 0
	  lastFilterIndex = 0
	  dirs = []
	  dir = {}
	  arg = null

	  for (i = 0, l = str.length; i < l; i++) {
	    c = str.charCodeAt(i)
	    if (inSingle) {
	      // check single quote
	      if (c === 0x27) inSingle = !inSingle
	    } else if (inDouble) {
	      // check double quote
	      if (c === 0x22) inDouble = !inDouble
	    } else if (
	      c === 0x2C && // comma
	      !paren && !curly && !square
	    ) {
	      // reached the end of a directive
	      pushDir()
	      // reset & skip the comma
	      dir = {}
	      begin = argIndex = lastFilterIndex = i + 1
	    } else if (
	      c === 0x3A && // colon
	      !dir.expression &&
	      !dir.arg
	    ) {
	      // argument
	      arg = str.slice(begin, i).trim()
	      // test for valid argument here
	      // since we may have caught stuff like first half of
	      // an object literal or a ternary expression.
	      if (argRE.test(arg)) {
	        argIndex = i + 1
	        dir.arg = _.stripQuotes(arg) || arg
	      }
	    } else if (
	      c === 0x7C && // pipe
	      str.charCodeAt(i + 1) !== 0x7C &&
	      str.charCodeAt(i - 1) !== 0x7C
	    ) {
	      if (dir.expression === undefined) {
	        // first filter, end of expression
	        lastFilterIndex = i + 1
	        dir.expression = str.slice(argIndex, i).trim()
	      } else {
	        // already has filter
	        pushFilter()
	      }
	    } else {
	      switch (c) {
	        case 0x22: inDouble = true; break // "
	        case 0x27: inSingle = true; break // '
	        case 0x28: paren++; break         // (
	        case 0x29: paren--; break         // )
	        case 0x5B: square++; break        // [
	        case 0x5D: square--; break        // ]
	        case 0x7B: curly++; break         // {
	        case 0x7D: curly--; break         // }
	      }
	    }
	  }

	  if (i === 0 || begin !== i) {
	    pushDir()
	  }

	  cache.put(s, dirs)
	  return dirs
	}

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Path = __webpack_require__(41)
	var Cache = __webpack_require__(52)
	var expressionCache = new Cache(1000)

	var keywords =
	  'Math,break,case,catch,continue,debugger,default,' +
	  'delete,do,else,false,finally,for,function,if,in,' +
	  'instanceof,new,null,return,switch,this,throw,true,try,' +
	  'typeof,var,void,while,with,undefined,abstract,boolean,' +
	  'byte,char,class,const,double,enum,export,extends,' +
	  'final,float,goto,implements,import,int,interface,long,' +
	  'native,package,private,protected,public,short,static,' +
	  'super,synchronized,throws,transient,volatile,' +
	  'arguments,let,yield'

	var wsRE = /\s/g
	var newlineRE = /\n/g
	var saveRE = /[\{,]\s*[\w\$_]+\s*:|'[^']*'|"[^"]*"/g
	var restoreRE = /"(\d+)"/g
	var pathTestRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*$/
	var pathReplaceRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
	var keywordsRE = new RegExp('^(' + keywords.replace(/,/g, '\\b|') + '\\b)')

	/**
	 * Save / Rewrite / Restore
	 *
	 * When rewriting paths found in an expression, it is
	 * possible for the same letter sequences to be found in
	 * strings and Object literal property keys. Therefore we
	 * remove and store these parts in a temporary array, and
	 * restore them after the path rewrite.
	 */

	var saved = []

	/**
	 * Save replacer
	 *
	 * @param {String} str
	 * @return {String} - placeholder with index
	 */

	function save (str) {
	  var i = saved.length
	  saved[i] = str.replace(newlineRE, '\\n')
	  return '"' + i + '"'
	}

	/**
	 * Path rewrite replacer
	 *
	 * @param {String} raw
	 * @return {String}
	 */

	function rewrite (raw) {
	  var c = raw.charAt(0)
	  var path = raw.slice(1)
	  if (keywordsRE.test(path)) {
	    return raw
	  } else {
	    path = path.indexOf('"') > -1
	      ? path.replace(restoreRE, restore)
	      : path
	    return c + 'scope.' + path
	  }
	}

	/**
	 * Restore replacer
	 *
	 * @param {String} str
	 * @param {String} i - matched save index
	 * @return {String}
	 */

	function restore (str, i) {
	  return saved[i]
	}

	/**
	 * Rewrite an expression, prefixing all path accessors with
	 * `scope.` and generate getter/setter functions.
	 *
	 * @param {String} exp
	 * @param {Boolean} needSet
	 * @return {Function}
	 */

	function compileExpFns (exp, needSet) {
	  // reset state
	  saved.length = 0
	  // save strings and object literal keys
	  var body = exp
	    .replace(saveRE, save)
	    .replace(wsRE, '')
	  // rewrite all paths
	  // pad 1 space here becaue the regex matches 1 extra char
	  body = (' ' + body)
	    .replace(pathReplaceRE, rewrite)
	    .replace(restoreRE, restore)
	  var getter = makeGetter(body)
	  if (getter) {
	    return {
	      get: getter,
	      body: body,
	      set: needSet
	        ? makeSetter(body)
	        : null
	    }
	  }
	}

	/**
	 * Compile getter setters for a simple path.
	 *
	 * @param {String} exp
	 * @return {Function}
	 */

	function compilePathFns (exp) {
	  var getter, path
	  if (exp.indexOf('[') < 0) {
	    // really simple path
	    path = exp.split('.')
	    getter = Path.compileGetter(path)
	  } else {
	    // do the real parsing
	    path = Path.parse(exp)
	    getter = path.get
	  }
	  return {
	    get: getter,
	    // always generate setter for simple paths
	    set: function (obj, val) {
	      Path.set(obj, path, val)
	    }
	  }
	}

	/**
	 * Build a getter function. Requires eval.
	 *
	 * We isolate the try/catch so it doesn't affect the
	 * optimization of the parse function when it is not called.
	 *
	 * @param {String} body
	 * @return {Function|undefined}
	 */

	function makeGetter (body) {
	  try {
	    return new Function('scope', 'return ' + body + ';')
	  } catch (e) {
	    _.warn(
	      'Invalid expression. ' + 
	      'Generated function body: ' + body
	    )
	  }
	}

	/**
	 * Build a setter function.
	 *
	 * This is only needed in rare situations like "a[b]" where
	 * a settable path requires dynamic evaluation.
	 *
	 * This setter function may throw error when called if the
	 * expression body is not a valid left-hand expression in
	 * assignment.
	 *
	 * @param {String} body
	 * @return {Function|undefined}
	 */

	function makeSetter (body) {
	  try {
	    return new Function('scope', 'value', body + '=value;')
	  } catch (e) {
	    _.warn('Invalid setter function body: ' + body)
	  }
	}

	/**
	 * Check for setter existence on a cache hit.
	 *
	 * @param {Function} hit
	 */

	function checkSetter (hit) {
	  if (!hit.set) {
	    hit.set = makeSetter(hit.body)
	  }
	}

	/**
	 * Parse an expression into re-written getter/setters.
	 *
	 * @param {String} exp
	 * @param {Boolean} needSet
	 * @return {Function}
	 */

	exports.parse = function (exp, needSet) {
	  exp = exp.trim()
	  // try cache
	  var hit = expressionCache.get(exp)
	  if (hit) {
	    if (needSet) {
	      checkSetter(hit)
	    }
	    return hit
	  }
	  // we do a simple path check to optimize for them.
	  // the check fails valid paths with unusal whitespaces,
	  // but that's too rare and we don't care.
	  var res = pathTestRE.test(exp)
	    ? compilePathFns(exp)
	    : compileExpFns(exp, needSet)
	  expressionCache.put(exp, res)
	  return res
	}

	// Export the pathRegex for external use
	exports.pathTestRE = pathTestRE

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var applyCSSTransition = __webpack_require__(53)
	var applyJSTransition = __webpack_require__(54)

	/**
	 * Append with transition.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.append = function (el, target, vm, cb) {
	  apply(el, 1, function () {
	    target.appendChild(el)
	  }, vm, cb)
	}

	/**
	 * InsertBefore with transition.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.before = function (el, target, vm, cb) {
	  apply(el, 1, function () {
	    _.before(el, target)
	  }, vm, cb)
	}

	/**
	 * Remove with transition.
	 *
	 * @oaram {Element} el
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.remove = function (el, vm, cb) {
	  apply(el, -1, function () {
	    _.remove(el)
	  }, vm, cb)
	}

	/**
	 * Remove by appending to another parent with transition.
	 * This is only used in block operations.
	 *
	 * @oaram {Element} el
	 * @param {Element} target
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	exports.removeThenAppend = function (el, target, vm, cb) {
	  apply(el, -1, function () {
	    target.appendChild(el)
	  }, vm, cb)
	}

	/**
	 * Append the childNodes of a fragment to target.
	 *
	 * @param {DocumentFragment} block
	 * @param {Node} target
	 * @param {Vue} vm
	 */

	exports.blockAppend = function (block, target, vm) {
	  var nodes = _.toArray(block.childNodes)
	  for (var i = 0, l = nodes.length; i < l; i++) {
	    exports.before(nodes[i], target, vm)
	  }
	}

	/**
	 * Remove a block of nodes between two edge nodes.
	 *
	 * @param {Node} start
	 * @param {Node} end
	 * @param {Vue} vm
	 */

	exports.blockRemove = function (start, end, vm) {
	  var node = start.nextSibling
	  var next
	  while (node !== end) {
	    next = node.nextSibling
	    exports.remove(node, vm)
	    node = next
	  }
	}

	/**
	 * Apply transitions with an operation callback.
	 *
	 * @oaram {Element} el
	 * @param {Number} direction
	 *                  1: enter
	 *                 -1: leave
	 * @param {Function} op - the actual DOM operation
	 * @param {Vue} vm
	 * @param {Function} [cb]
	 */

	var apply = exports.apply = function (el, direction, op, vm, cb) {
	  var transData = el.__v_trans
	  if (
	    !transData ||
	    !vm._isCompiled ||
	    // if the vm is being manipulated by a parent directive
	    // during the parent's compilation phase, skip the
	    // animation.
	    (vm.$parent && !vm.$parent._isCompiled)
	  ) {
	    op()
	    if (cb) cb()
	    return
	  }
	  // determine the transition type on the element
	  var jsTransition = vm.$options.transitions[transData.id]
	  if (jsTransition) {
	    // js
	    applyJSTransition(
	      el,
	      direction,
	      op,
	      transData,
	      jsTransition,
	      vm,
	      cb
	    )
	  } else if (_.transitionEndEvent) {
	    // css
	    applyCSSTransition(
	      el,
	      direction,
	      op,
	      transData,
	      cb
	    )
	  } else {
	    // not applicable
	    op()
	    if (cb) cb()
	  }
	}

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(20)
	var textParser = __webpack_require__(42)
	var dirParser = __webpack_require__(43)
	var templateParser = __webpack_require__(51)

	/**
	 * Compile a template and return a reusable composite link
	 * function, which recursively contains more link functions
	 * inside. This top level compile function should only be
	 * called on instance root nodes.
	 *
	 * @param {Element|DocumentFragment} el
	 * @param {Object} options
	 * @param {Boolean} partial
	 * @return {Function}
	 */

	module.exports = function compile (el, options, partial) {
	  var params = !partial && options.paramAttributes
	  var paramsLinkFn = params
	    ? compileParamAttributes(el, params, options)
	    : null
	  var nodeLinkFn = el instanceof DocumentFragment
	    ? null
	    : compileNode(el, options)
	  var childLinkFn =
	    (!nodeLinkFn || !nodeLinkFn.terminal) &&
	    el.hasChildNodes()
	      ? compileNodeList(el.childNodes, options)
	      : null

	  /**
	   * A linker function to be called on a already compiled
	   * piece of DOM, which instantiates all directive
	   * instances.
	   *
	   * @param {Vue} vm
	   * @param {Element|DocumentFragment} el
	   * @return {Function|undefined}
	   */

	  return function link (vm, el) {
	    var originalDirCount = vm._directives.length
	    if (paramsLinkFn) paramsLinkFn(vm, el)
	    if (nodeLinkFn) nodeLinkFn(vm, el)
	    if (childLinkFn) childLinkFn(vm, el.childNodes)

	    /**
	     * If this is a partial compile, the linker function
	     * returns an unlink function that tearsdown all
	     * directives instances generated during the partial
	     * linking.
	     */

	    if (partial) {
	      var dirs = vm._directives.slice(originalDirCount)
	      return function unlink () {
	        var i = dirs.length
	        while (i--) {
	          dirs[i]._teardown()
	        }
	        i = vm._directives.indexOf(dirs[0])
	        vm._directives.splice(i, dirs.length)
	      }
	    }
	  }
	}

	/**
	 * Compile a node and return a nodeLinkFn based on the
	 * node type.
	 *
	 * @param {Node} node
	 * @param {Object} options
	 * @return {Function|undefined}
	 */

	function compileNode (node, options) {
	  var type = node.nodeType
	  if (type === 1 && node.tagName !== 'SCRIPT') {
	    return compileElement(node, options)
	  } else if (type === 3 && config.interpolate) {
	    return compileTextNode(node, options)
	  }
	}

	/**
	 * Compile an element and return a nodeLinkFn.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function|null}
	 */

	function compileElement (el, options) {
	  var linkFn, tag, component
	  // check custom element component, but only on non-root
	  if (!el.__vue__) {
	    tag = el.tagName.toLowerCase()
	    component =
	      tag.indexOf('-') > 0 &&
	      options.components[tag]
	    if (component) {
	      el.setAttribute(config.prefix + 'component', tag)
	    }
	  }
	  if (component || el.hasAttributes()) {
	    // check terminal direcitves
	    linkFn = checkTerminalDirectives(el, options)
	    // if not terminal, build normal link function
	    if (!linkFn) {
	      var directives = collectDirectives(el, options)
	      linkFn = directives.length
	        ? makeDirectivesLinkFn(directives)
	        : null
	    }
	  }
	  // if the element is a textarea, we need to interpolate
	  // its content on initial render.
	  if (el.tagName === 'TEXTAREA') {
	    var realLinkFn = linkFn
	    linkFn = function (vm, el) {
	      el.value = vm.$interpolate(el.value)
	      if (realLinkFn) realLinkFn(vm, el)      
	    }
	    linkFn.terminal = true
	  }
	  return linkFn
	}

	/**
	 * Build a multi-directive link function.
	 *
	 * @param {Array} directives
	 * @return {Function} directivesLinkFn
	 */

	function makeDirectivesLinkFn (directives) {
	  return function directivesLinkFn (vm, el) {
	    // reverse apply because it's sorted low to high
	    var i = directives.length
	    var dir, j, k
	    while (i--) {
	      dir = directives[i]
	      if (dir._link) {
	        // custom link fn
	        dir._link(vm, el)
	      } else {
	        k = dir.descriptors.length
	        for (j = 0; j < k; j++) {
	          vm._bindDir(dir.name, el,
	                      dir.descriptors[j], dir.def)
	        }
	      }
	    }
	  }
	}

	/**
	 * Compile a textNode and return a nodeLinkFn.
	 *
	 * @param {TextNode} node
	 * @param {Object} options
	 * @return {Function|null} textNodeLinkFn
	 */

	function compileTextNode (node, options) {
	  var tokens = textParser.parse(node.nodeValue)
	  if (!tokens) {
	    return null
	  }
	  var frag = document.createDocumentFragment()
	  var dirs = options.directives
	  var el, token, value
	  for (var i = 0, l = tokens.length; i < l; i++) {
	    token = tokens[i]
	    value = token.value
	    if (token.tag) {
	      if (token.oneTime) {
	        el = document.createTextNode(value)
	      } else {
	        if (token.html) {
	          el = document.createComment('v-html')
	          token.type = 'html'
	          token.def = dirs.html
	          token.descriptor = dirParser.parse(value)[0]
	        } else if (token.partial) {
	          el = document.createComment('v-partial')
	          token.type = 'partial'
	          token.def = dirs.partial
	          token.descriptor = dirParser.parse(value)[0]
	        } else {
	          // IE will clean up empty textNodes during
	          // frag.cloneNode(true), so we have to give it
	          // something here...
	          el = document.createTextNode(' ')
	          token.type = 'text'
	          token.def = dirs.text
	          token.descriptor = dirParser.parse(value)[0]
	        }
	      }
	    } else {
	      el = document.createTextNode(value)
	    }
	    frag.appendChild(el)
	  }
	  return makeTextNodeLinkFn(tokens, frag, options)
	}

	/**
	 * Build a function that processes a textNode.
	 *
	 * @param {Array<Object>} tokens
	 * @param {DocumentFragment} frag
	 */

	function makeTextNodeLinkFn (tokens, frag) {
	  return function textNodeLinkFn (vm, el) {
	    var fragClone = frag.cloneNode(true)
	    var childNodes = _.toArray(fragClone.childNodes)
	    var token, value, node
	    for (var i = 0, l = tokens.length; i < l; i++) {
	      token = tokens[i]
	      value = token.value
	      if (token.tag) {
	        node = childNodes[i]
	        if (token.oneTime) {
	          value = vm.$eval(value)
	          if (token.html) {
	            _.replace(node, templateParser.parse(value, true))
	          } else {
	            node.nodeValue = value
	          }
	        } else {
	          vm._bindDir(token.type, node,
	                      token.descriptor, token.def)
	        }
	      }
	    }
	    _.replace(el, fragClone)
	  }
	}

	/**
	 * Compile a node list and return a childLinkFn.
	 *
	 * @param {NodeList} nodeList
	 * @param {Object} options
	 * @return {Function|undefined}
	 */

	function compileNodeList (nodeList, options) {
	  var linkFns = []
	  var nodeLinkFn, childLinkFn, node
	  for (var i = 0, l = nodeList.length; i < l; i++) {
	    node = nodeList[i]
	    nodeLinkFn = compileNode(node, options)
	    childLinkFn =
	      (!nodeLinkFn || !nodeLinkFn.terminal) &&
	      node.hasChildNodes()
	        ? compileNodeList(node.childNodes, options)
	        : null
	    linkFns.push(nodeLinkFn, childLinkFn)
	  }
	  return linkFns.length
	    ? makeChildLinkFn(linkFns)
	    : null
	}

	/**
	 * Make a child link function for a node's childNodes.
	 *
	 * @param {Array<Function>} linkFns
	 * @return {Function} childLinkFn
	 */

	function makeChildLinkFn (linkFns) {
	  return function childLinkFn (vm, nodes) {
	    // stablize nodes
	    nodes = _.toArray(nodes)
	    var node, nodeLinkFn, childrenLinkFn
	    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
	      node = nodes[n]
	      nodeLinkFn = linkFns[i++]
	      childrenLinkFn = linkFns[i++]
	      if (nodeLinkFn) {
	        nodeLinkFn(vm, node)
	      }
	      if (childrenLinkFn) {
	        childrenLinkFn(vm, node.childNodes)
	      }
	    }
	  }
	}

	/**
	 * Compile param attributes on a root element and return
	 * a paramAttributes link function.
	 *
	 * @param {Element} el
	 * @param {Array} attrs
	 * @param {Object} options
	 * @return {Function} paramsLinkFn
	 */

	function compileParamAttributes (el, attrs, options) {
	  var params = []
	  var i = attrs.length
	  var name, value, param
	  while (i--) {
	    name = attrs[i]
	    value = el.getAttribute(name)
	    if (value !== null) {
	      param = {
	        name: name,
	        value: value
	      }
	      var tokens = textParser.parse(value)
	      if (tokens) {
	        el.removeAttribute(name)
	        if (tokens.length > 1) {
	          _.warn(
	            'Invalid param attribute binding: "' +
	            name + '="' + value + '"' +
	            '\nDon\'t mix binding tags with plain text ' +
	            'in param attribute bindings.'
	          )
	          continue
	        } else {
	          param.dynamic = true
	          param.value = tokens[0].value
	        }
	      }
	      params.push(param)
	    }
	  }
	  return makeParamsLinkFn(params, options)
	}

	/**
	 * Build a function that applies param attributes to a vm.
	 *
	 * @param {Array} params
	 * @param {Object} options
	 * @return {Function} paramsLinkFn
	 */

	var dataAttrRE = /^data-/

	function makeParamsLinkFn (params, options) {
	  var def = options.directives['with']
	  return function paramsLinkFn (vm, el) {
	    var i = params.length
	    var param, path
	    while (i--) {
	      param = params[i]
	      // params could contain dashes, which will be
	      // interpreted as minus calculations by the parser
	      // so we need to wrap the path here
	      path = _.camelize(param.name.replace(dataAttrRE, ''))
	      if (param.dynamic) {
	        // dynamic param attribtues are bound as v-with.
	        // we can directly duck the descriptor here beacuse
	        // param attributes cannot use expressions or
	        // filters.
	        vm._bindDir('with', el, {
	          arg: path,
	          expression: param.value
	        }, def)
	      } else {
	        // just set once
	        vm.$set(path, param.value)
	      }
	    }
	  }
	}

	/**
	 * Check an element for terminal directives in fixed order.
	 * If it finds one, return a terminal link function.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Function} terminalLinkFn
	 */

	var terminalDirectives = [
	  'repeat',
	  'if',
	  'component'
	]

	function skip () {}
	skip.terminal = true

	function checkTerminalDirectives (el, options) {
	  if (_.attr(el, 'pre') !== null) {
	    return skip
	  }
	  var value, dirName
	  /* jshint boss: true */
	  for (var i = 0; i < 3; i++) {
	    dirName = terminalDirectives[i]
	    if (value = _.attr(el, dirName)) {
	      return makeTeriminalLinkFn(el, dirName, value, options)
	    }
	  }
	}

	/**
	 * Build a link function for a terminal directive.
	 *
	 * @param {Element} el
	 * @param {String} dirName
	 * @param {String} value
	 * @param {Object} options
	 * @return {Function} terminalLinkFn
	 */

	function makeTeriminalLinkFn (el, dirName, value, options) {
	  var descriptor = dirParser.parse(value)[0]
	  var def = options.directives[dirName]
	  // special case: we need to collect directives found
	  // on a component root node, but defined in the parent
	  // template. These directives need to be compiled in
	  // the parent scope.
	  if (dirName === 'component') {
	    var dirs = collectDirectives(el, options, true)
	    el._parentLinker = dirs.length
	      ? makeDirectivesLinkFn(dirs)
	      : null
	  }
	  var terminalLinkFn = function (vm, el) {
	    vm._bindDir(dirName, el, descriptor, def)
	  }
	  terminalLinkFn.terminal = true
	  return terminalLinkFn
	}

	/**
	 * Collect the directives on an element.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @param {Boolean} asParent
	 * @return {Array}
	 */

	function collectDirectives (el, options, asParent) {
	  var attrs = _.toArray(el.attributes)
	  var i = attrs.length
	  var dirs = []
	  var attr, attrName, dir, dirName, dirDef
	  while (i--) {
	    attr = attrs[i]
	    attrName = attr.name
	    if (attrName.indexOf(config.prefix) === 0) {
	      dirName = attrName.slice(config.prefix.length)
	      if (
	        asParent &&
	        (dirName === 'with' || dirName === 'ref')
	      ) {
	        continue
	      }
	      dirDef = options.directives[dirName]
	      _.assertAsset(dirDef, 'directive', dirName)
	      if (dirDef) {
	        dirs.push({
	          name: dirName,
	          descriptors: dirParser.parse(attr.value),
	          def: dirDef
	        })
	      }
	    } else if (config.interpolate) {
	      dir = collectAttrDirective(el, attrName, attr.value,
	                                 options)
	      if (dir) {
	        dirs.push(dir)
	      }
	    }
	  }
	  // sort by priority, LOW to HIGH
	  dirs.sort(directiveComparator)
	  return dirs
	}

	/**
	 * Check an attribute for potential dynamic bindings,
	 * and return a directive object.
	 *
	 * @param {Element} el
	 * @param {String} name
	 * @param {String} value
	 * @param {Object} options
	 * @return {Object}
	 */

	function collectAttrDirective (el, name, value, options) {
	  var tokens = textParser.parse(value)
	  if (tokens) {
	    var def = options.directives.attr
	    var i = tokens.length
	    var allOneTime = true
	    while (i--) {
	      var token = tokens[i]
	      if (token.tag && !token.oneTime) {
	        allOneTime = false
	      }
	    }
	    return {
	      def: def,
	      _link: allOneTime
	        ? function (vm, el) {
	            el.setAttribute(name, vm.$interpolate(value))
	          }
	        : function (vm, el) {
	            var value = textParser.tokensToExp(tokens, vm)
	            var desc = dirParser.parse(name + ':' + value)[0]
	            vm._bindDir('attr', el, desc, def)
	          }
	    }
	  }
	}

	/**
	 * Directive priority sort comparator
	 *
	 * @param {Object} a
	 * @param {Object} b
	 */

	function directiveComparator (a, b) {
	  a = a.def.priority || 0
	  b = b.def.priority || 0
	  return a > b ? 1 : -1
	}

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var templateParser = __webpack_require__(51)

	/**
	 * Process an element or a DocumentFragment based on a
	 * instance option object. This allows us to transclude
	 * a template node/fragment before the instance is created,
	 * so the processed fragment can then be cloned and reused
	 * in v-repeat.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Element|DocumentFragment}
	 */

	module.exports = function transclude (el, options) {
	  // for template tags, what we want is its content as
	  // a documentFragment (for block instances)
	  if (el.tagName === 'TEMPLATE') {
	    el = templateParser.parse(el)
	  }
	  if (options && options.template) {
	    el = transcludeTemplate(el, options)
	  }
	  if (el instanceof DocumentFragment) {
	    _.prepend(document.createComment('v-start'), el)
	    el.appendChild(document.createComment('v-end'))
	  }
	  return el
	}

	/**
	 * Process the template option.
	 * If the replace option is true this will swap the $el.
	 *
	 * @param {Element} el
	 * @param {Object} options
	 * @return {Element|DocumentFragment}
	 */

	function transcludeTemplate (el, options) {
	  var template = options.template
	  var frag = templateParser.parse(template, true)
	  if (!frag) {
	    _.warn('Invalid template option: ' + template)
	  } else {
	    collectRawContent(el)
	    if (options.replace) {
	      if (frag.childNodes.length > 1) {
	        transcludeContent(frag)
	        return frag
	      } else {
	        var replacer = frag.firstChild
	        _.copyAttributes(el, replacer)
	        transcludeContent(replacer)
	        return replacer
	      }
	    } else {
	      el.appendChild(frag)
	      transcludeContent(el)
	      return el
	    }
	  }
	}

	/**
	 * Collect raw content inside $el before they are
	 * replaced by template content.
	 */

	var rawContent
	function collectRawContent (el) {
	  var child
	  rawContent = null
	  if (el.hasChildNodes()) {
	    rawContent = document.createElement('div')
	    /* jshint boss:true */
	    while (child = el.firstChild) {
	      rawContent.appendChild(child)
	    }
	  }
	}

	/**
	 * Resolve <content> insertion points mimicking the behavior
	 * of the Shadow DOM spec:
	 *
	 *   http://w3c.github.io/webcomponents/spec/shadow/#insertion-points
	 *
	 * @param {Element|DocumentFragment} el
	 */

	function transcludeContent (el) {
	  var outlets = getOutlets(el)
	  var i = outlets.length
	  if (!i) return
	  var outlet, select, selected, j, main
	  // first pass, collect corresponding content
	  // for each outlet.
	  while (i--) {
	    outlet = outlets[i]
	    if (rawContent) {
	      select = outlet.getAttribute('select')
	      if (select) {  // select content
	        selected = rawContent.querySelectorAll(select)
	        outlet.content = _.toArray(
	          selected.length
	            ? selected
	            : outlet.childNodes
	        )
	      } else { // default content
	        main = outlet
	      }
	    } else { // fallback content
	      outlet.content = _.toArray(outlet.childNodes)
	    }
	  }
	  // second pass, actually insert the contents
	  for (i = 0, j = outlets.length; i < j; i++) {
	    outlet = outlets[i]
	    if (outlet !== main) {
	      insertContentAt(outlet, outlet.content)
	    }
	  }
	  // finally insert the main content
	  if (main) {
	    insertContentAt(main, _.toArray(rawContent.childNodes))
	  }
	}

	/**
	 * Get <content> outlets from the element/list
	 *
	 * @param {Element|Array} el
	 * @return {Array}
	 */

	var concat = [].concat
	function getOutlets (el) {
	  return _.isArray(el)
	    ? concat.apply([], el.map(getOutlets))
	    : el.querySelectorAll
	      ? _.toArray(el.querySelectorAll('content'))
	      : []
	}

	/**
	 * Insert an array of nodes at outlet,
	 * then remove the outlet.
	 *
	 * @param {Element} outlet
	 * @param {Array} contents
	 */

	function insertContentAt (outlet, contents) {
	  // not using util DOM methods here because
	  // parentNode can be cached
	  var parent = outlet.parentNode
	  for (var i = 0, j = contents.length; i < j; i++) {
	    parent.insertBefore(contents[i], outlet)
	  }
	  parent.removeChild(outlet)
	}

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	var handlers = {
	  _default: __webpack_require__(55),
	  radio: __webpack_require__(56),
	  select: __webpack_require__(57),
	  checkbox: __webpack_require__(58)
	}

	module.exports = {

	  priority: 800,
	  twoWay: true,
	  handlers: handlers,

	  /**
	   * Possible elements:
	   *   <select>
	   *   <textarea>
	   *   <input type="*">
	   *     - text
	   *     - checkbox
	   *     - radio
	   *     - number
	   *     - TODO: more types may be supplied as a plugin
	   */

	  bind: function () {
	    // friendly warning...
	    var filters = this.filters
	    if (filters && filters.read && !filters.write) {
	      _.warn(
	        'It seems you are using a read-only filter with ' +
	        'v-model. You might want to use a two-way filter ' +
	        'to ensure correct behavior.'
	      )
	    }
	    var el = this.el
	    var tag = el.tagName
	    var handler
	    if (tag === 'INPUT') {
	      handler = handlers[el.type] || handlers._default
	    } else if (tag === 'SELECT') {
	      handler = handlers.select
	    } else if (tag === 'TEXTAREA') {
	      handler = handlers._default
	    } else {
	      _.warn("v-model doesn't support element type: " + tag)
	      return
	    }
	    handler.bind.call(this)
	    this.update = handler.update
	    this.unbind = handler.unbind
	  }

	}

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var config = __webpack_require__(20)
	var Binding = __webpack_require__(39)
	var arrayMethods = __webpack_require__(59)
	var arrayKeys = Object.getOwnPropertyNames(arrayMethods)
	__webpack_require__(60)

	var uid = 0

	/**
	 * Type enums
	 */

	var ARRAY  = 0
	var OBJECT = 1

	/**
	 * Augment an target Object or Array by intercepting
	 * the prototype chain using __proto__
	 *
	 * @param {Object|Array} target
	 * @param {Object} proto
	 */

	function protoAugment (target, src) {
	  target.__proto__ = src
	}

	/**
	 * Augment an target Object or Array by defining
	 * hidden properties.
	 *
	 * @param {Object|Array} target
	 * @param {Object} proto
	 */

	function copyAugment (target, src, keys) {
	  var i = keys.length
	  var key
	  while (i--) {
	    key = keys[i]
	    _.define(target, key, src[key])
	  }
	}

	/**
	 * Observer class that are attached to each observed
	 * object. Once attached, the observer converts target
	 * object's property keys into getter/setters that
	 * collect dependencies and dispatches updates.
	 *
	 * @param {Array|Object} value
	 * @param {Number} type
	 * @constructor
	 */

	function Observer (value, type) {
	  this.id = ++uid
	  this.value = value
	  this.active = true
	  this.bindings = []
	  _.define(value, '__ob__', this)
	  if (type === ARRAY) {
	    var augment = config.proto && _.hasProto
	      ? protoAugment
	      : copyAugment
	    augment(value, arrayMethods, arrayKeys)
	    this.observeArray(value)
	  } else if (type === OBJECT) {
	    this.walk(value)
	  }
	}

	Observer.target = null

	var p = Observer.prototype

	/**
	 * Attempt to create an observer instance for a value,
	 * returns the new observer if successfully observed,
	 * or the existing observer if the value already has one.
	 *
	 * @param {*} value
	 * @return {Observer|undefined}
	 * @static
	 */

	Observer.create = function (value) {
	  if (
	    value &&
	    value.hasOwnProperty('__ob__') &&
	    value.__ob__ instanceof Observer
	  ) {
	    return value.__ob__
	  } else if (_.isArray(value)) {
	    return new Observer(value, ARRAY)
	  } else if (
	    _.isPlainObject(value) &&
	    !value._isVue // avoid Vue instance
	  ) {
	    return new Observer(value, OBJECT)
	  }
	}

	/**
	 * Walk through each property and convert them into
	 * getter/setters. This method should only be called when
	 * value type is Object. Properties prefixed with `$` or `_`
	 * and accessor properties are ignored.
	 *
	 * @param {Object} obj
	 */

	p.walk = function (obj) {
	  var keys = Object.keys(obj)
	  var i = keys.length
	  var key, prefix
	  while (i--) {
	    key = keys[i]
	    prefix = key.charCodeAt(0)
	    if (prefix !== 0x24 && prefix !== 0x5F) { // skip $ or _
	      this.convert(key, obj[key])
	    }
	  }
	}

	/**
	 * Try to carete an observer for a child value,
	 * and if value is array, link binding to the array.
	 *
	 * @param {*} val
	 * @return {Binding|undefined}
	 */

	p.observe = function (val) {
	  return Observer.create(val)
	}

	/**
	 * Observe a list of Array items.
	 *
	 * @param {Array} items
	 */

	p.observeArray = function (items) {
	  var i = items.length
	  while (i--) {
	    this.observe(items[i])
	  }
	}

	/**
	 * Convert a property into getter/setter so we can emit
	 * the events when the property is accessed/changed.
	 *
	 * @param {String} key
	 * @param {*} val
	 */

	p.convert = function (key, val) {
	  var ob = this
	  var childOb = ob.observe(val)
	  var binding = new Binding()
	  if (childOb) {
	    childOb.bindings.push(binding)
	  }
	  Object.defineProperty(ob.value, key, {
	    enumerable: true,
	    configurable: true,
	    get: function () {
	      // Observer.target is a watcher whose getter is
	      // currently being evaluated.
	      if (ob.active && Observer.target) {
	        Observer.target.addDep(binding)
	      }
	      return val
	    },
	    set: function (newVal) {
	      if (newVal === val) return
	      // remove binding from old value
	      var oldChildOb = val && val.__ob__
	      if (oldChildOb) {
	        var oldBindings = oldChildOb.bindings
	        oldBindings.splice(oldBindings.indexOf(binding), 1)
	      }
	      val = newVal
	      // add binding to new value
	      var newChildOb = ob.observe(newVal)
	      if (newChildOb) {
	        newChildOb.bindings.push(binding)
	      }
	      binding.notify()
	    }
	  })
	}

	/**
	 * Notify change on all self bindings on an observer.
	 * This is called when a mutable value mutates. e.g.
	 * when an Array's mutating methods are called, or an
	 * Object's $add/$delete are called.
	 */

	p.notify = function () {
	  var bindings = this.bindings
	  for (var i = 0, l = bindings.length; i < l; i++) {
	    bindings[i].notify()
	  }
	}

	/**
	 * Add an owner vm, so that when $add/$delete mutations
	 * happen we can notify owner vms to proxy the keys and
	 * digest the watchers. This is only called when the object
	 * is observed as an instance's root $data.
	 *
	 * @param {Vue} vm
	 */

	p.addVm = function (vm) {
	  (this.vms = this.vms || []).push(vm)
	}

	/**
	 * Remove an owner vm. This is called when the object is
	 * swapped out as an instance's $data object.
	 *
	 * @param {Vue} vm
	 */

	p.removeVm = function (vm) {
	  this.vms.splice(this.vms.indexOf(vm), 1)
	}

	module.exports = Observer


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	/**
	 * The Batcher maintains a job queue to be run
	 * async on the next event loop.
	 */

	function Batcher () {
	  this.reset()
	}

	var p = Batcher.prototype

	/**
	 * Push a job into the job queue.
	 * Jobs with duplicate IDs will be skipped unless it's
	 * pushed when the queue is being flushed.
	 *
	 * @param {Object} job
	 *   properties:
	 *   - {String|Number} id
	 *   - {Function}      run
	 */

	p.push = function (job) {
	  if (!job.id || !this.has[job.id] || this.flushing) {
	    this.queue.push(job)
	    this.has[job.id] = job
	    if (!this.waiting) {
	      this.waiting = true
	      _.nextTick(this.flush, this)
	    }
	  }
	}

	/**
	 * Flush the queue and run the jobs.
	 * Will call a preFlush hook if has one.
	 */

	p.flush = function () {
	  this.flushing = true
	  // do not cache length because more jobs might be pushed
	  // as we run existing jobs
	  for (var i = 0; i < this.queue.length; i++) {
	    var job = this.queue[i]
	    if (!job.cancelled) {
	      job.run()
	    }
	  }
	  this.reset()
	}

	/**
	 * Reset the batcher's state.
	 */

	p.reset = function () {
	  this.has = {}
	  this.queue = []
	  this.waiting = false
	  this.flushing = false
	}

	module.exports = Batcher

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Cache = __webpack_require__(52)
	var templateCache = new Cache(100)

	/**
	 * Test for the presence of the Safari template cloning bug
	 * https://bugs.webkit.org/show_bug.cgi?id=137755
	 */

	var hasBrokenTemplate = _.inBrowser
	  ? (function () {
	      var a = document.createElement('div')
	      a.innerHTML = '<template>1</template>'
	      return !a.cloneNode(true).firstChild.innerHTML
	    })()
	  : false

	var map = {
	  _default : [0, '', ''],
	  legend   : [1, '<fieldset>', '</fieldset>'],
	  tr       : [2, '<table><tbody>', '</tbody></table>'],
	  col      : [
	    2,
	    '<table><tbody></tbody><colgroup>',
	    '</colgroup></table>'
	  ]
	}

	map.td =
	map.th = [
	  3,
	  '<table><tbody><tr>',
	  '</tr></tbody></table>'
	]

	map.option =
	map.optgroup = [
	  1,
	  '<select multiple="multiple">',
	  '</select>'
	]

	map.thead =
	map.tbody =
	map.colgroup =
	map.caption =
	map.tfoot = [1, '<table>', '</table>']

	map.g =
	map.defs =
	map.symbol =
	map.use =
	map.image =
	map.text =
	map.circle =
	map.ellipse =
	map.line =
	map.path =
	map.polygon =
	map.polyline =
	map.rect = [
	  1,
	  '<svg ' +
	    'xmlns="http://www.w3.org/2000/svg" ' +
	    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
	    'xmlns:ev="http://www.w3.org/2001/xml-events"' +
	    'version="1.1">',
	  '</svg>'
	]

	var TAG_RE = /<([\w:]+)/

	/**
	 * Convert a string template to a DocumentFragment.
	 * Determines correct wrapping by tag types. Wrapping
	 * strategy found in jQuery & component/domify.
	 *
	 * @param {String} templateString
	 * @return {DocumentFragment}
	 */

	function stringToFragment (templateString) {
	  // try a cache hit first
	  var hit = templateCache.get(templateString)
	  if (hit) {
	    return hit
	  }

	  var frag = document.createDocumentFragment()
	  var tagMatch = TAG_RE.exec(templateString)

	  if (!tagMatch) {
	    // text only, return a single text node.
	    frag.appendChild(
	      document.createTextNode(templateString)
	    )
	  } else {

	    var tag    = tagMatch[1]
	    var wrap   = map[tag] || map._default
	    var depth  = wrap[0]
	    var prefix = wrap[1]
	    var suffix = wrap[2]
	    var node   = document.createElement('div')

	    node.innerHTML = prefix + templateString.trim() + suffix
	    while (depth--) {
	      node = node.lastChild
	    }

	    var child
	    /* jshint boss:true */
	    while (child = node.firstChild) {
	      frag.appendChild(child)
	    }
	  }

	  templateCache.put(templateString, frag)
	  return frag
	}

	/**
	 * Convert a template node to a DocumentFragment.
	 *
	 * @param {Node} node
	 * @return {DocumentFragment}
	 */

	function nodeToFragment (node) {
	  var tag = node.tagName
	  // if its a template tag and the browser supports it,
	  // its content is already a document fragment.
	  if (
	    tag === 'TEMPLATE' &&
	    node.content instanceof DocumentFragment
	  ) {
	    return node.content
	  }
	  return tag === 'SCRIPT'
	    ? stringToFragment(node.textContent)
	    : stringToFragment(node.innerHTML)
	}

	/**
	 * Deal with Safari cloning nested <template> bug by
	 * manually cloning all template instances.
	 *
	 * @param {Element|DocumentFragment} node
	 * @return {Element|DocumentFragment}
	 */

	exports.clone = function (node) {
	  var res = node.cloneNode(true)
	  /* istanbul ignore if */
	  if (hasBrokenTemplate) {
	    var templates = node.querySelectorAll('template')
	    if (templates.length) {
	      var cloned = res.querySelectorAll('template')
	      var i = cloned.length
	      while (i--) {
	        cloned[i].parentNode.replaceChild(
	          templates[i].cloneNode(true),
	          cloned[i]
	        )
	      }
	    }
	  }
	  return res
	}

	/**
	 * Process the template option and normalizes it into a
	 * a DocumentFragment that can be used as a partial or a
	 * instance template.
	 *
	 * @param {*} template
	 *    Possible values include:
	 *    - DocumentFragment object
	 *    - Node object of type Template
	 *    - id selector: '#some-template-id'
	 *    - template string: '<div><span>{{msg}}</span></div>'
	 * @param {Boolean} clone
	 * @return {DocumentFragment|undefined}
	 */

	exports.parse = function (template, clone) {
	  var node, frag

	  // if the template is already a document fragment,
	  // do nothing
	  if (template instanceof DocumentFragment) {
	    return clone
	      ? template.cloneNode(true)
	      : template
	  }

	  if (typeof template === 'string') {
	    // id selector
	    if (template.charAt(0) === '#') {
	      // id selector can be cached too
	      frag = templateCache.get(template)
	      if (!frag) {
	        node = document.getElementById(template.slice(1))
	        if (node) {
	          frag = nodeToFragment(node)
	          // save selector to cache
	          templateCache.put(template, frag)
	        }
	      }
	    } else {
	      // normal string template
	      frag = stringToFragment(template)
	    }
	  } else if (template.nodeType) {
	    // a direct node
	    frag = nodeToFragment(template)
	  }

	  return frag && clone
	    ? exports.clone(frag)
	    : frag
	}

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * A doubly linked list-based Least Recently Used (LRU)
	 * cache. Will keep most recently used items while
	 * discarding least recently used items when its limit is
	 * reached. This is a bare-bone version of
	 * Rasmus Andersson's js-lru:
	 *
	 *   https://github.com/rsms/js-lru
	 *
	 * @param {Number} limit
	 * @constructor
	 */

	function Cache (limit) {
	  this.size = 0
	  this.limit = limit
	  this.head = this.tail = undefined
	  this._keymap = {}
	}

	var p = Cache.prototype

	/**
	 * Put <value> into the cache associated with <key>.
	 * Returns the entry which was removed to make room for
	 * the new entry. Otherwise undefined is returned.
	 * (i.e. if there was enough room already).
	 *
	 * @param {String} key
	 * @param {*} value
	 * @return {Entry|undefined}
	 */

	p.put = function (key, value) {
	  var entry = {
	    key:key,
	    value:value
	  }
	  this._keymap[key] = entry
	  if (this.tail) {
	    this.tail.newer = entry
	    entry.older = this.tail
	  } else {
	    this.head = entry
	  }
	  this.tail = entry
	  if (this.size === this.limit) {
	    return this.shift()
	  } else {
	    this.size++
	  }
	}

	/**
	 * Purge the least recently used (oldest) entry from the
	 * cache. Returns the removed entry or undefined if the
	 * cache was empty.
	 */

	p.shift = function () {
	  var entry = this.head
	  if (entry) {
	    this.head = this.head.newer
	    this.head.older = undefined
	    entry.newer = entry.older = undefined
	    this._keymap[entry.key] = undefined
	  }
	  return entry
	}

	/**
	 * Get and register recent use of <key>. Returns the value
	 * associated with <key> or undefined if not in cache.
	 *
	 * @param {String} key
	 * @param {Boolean} returnEntry
	 * @return {Entry|*}
	 */

	p.get = function (key, returnEntry) {
	  var entry = this._keymap[key]
	  if (entry === undefined) return
	  if (entry === this.tail) {
	    return returnEntry
	      ? entry
	      : entry.value
	  }
	  // HEAD--------------TAIL
	  //   <.older   .newer>
	  //  <--- add direction --
	  //   A  B  C  <D>  E
	  if (entry.newer) {
	    if (entry === this.head) {
	      this.head = entry.newer
	    }
	    entry.newer.older = entry.older // C <-- E.
	  }
	  if (entry.older) {
	    entry.older.newer = entry.newer // C. --> E
	  }
	  entry.newer = undefined // D --x
	  entry.older = this.tail // D. --> E
	  if (this.tail) {
	    this.tail.newer = entry // E. <-- D
	  }
	  this.tail = entry
	  return returnEntry
	    ? entry
	    : entry.value
	}

	module.exports = Cache

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var addClass = _.addClass
	var removeClass = _.removeClass
	var transDurationProp = _.transitionProp + 'Duration'
	var animDurationProp = _.animationProp + 'Duration'

	var queue = []
	var queued = false

	/**
	 * Push a job into the transition queue, which is to be
	 * executed on next frame.
	 *
	 * @param {Element} el    - target element
	 * @param {Number} dir    - 1: enter, -1: leave
	 * @param {Function} op   - the actual dom operation
	 * @param {String} cls    - the className to remove when the
	 *                          transition is done.
	 * @param {Function} [cb] - user supplied callback.
	 */

	function push (el, dir, op, cls, cb) {
	  queue.push({
	    el  : el,
	    dir : dir,
	    cb  : cb,
	    cls : cls,
	    op  : op
	  })
	  if (!queued) {
	    queued = true
	    _.nextTick(flush)
	  }
	}

	/**
	 * Flush the queue, and do one forced reflow before
	 * triggering transitions.
	 */

	function flush () {
	  /* jshint unused: false */
	  var f = document.documentElement.offsetHeight
	  queue.forEach(run)
	  queue = []
	  queued = false
	}

	/**
	 * Run a transition job.
	 *
	 * @param {Object} job
	 */

	function run (job) {

	  var el = job.el
	  var data = el.__v_trans
	  var cls = job.cls
	  var cb = job.cb
	  var op = job.op
	  var transitionType = getTransitionType(el, data, cls)

	  if (job.dir > 0) { // ENTER
	    if (transitionType === 1) {
	      // trigger transition by removing enter class
	      removeClass(el, cls)
	      // only need to listen for transitionend if there's
	      // a user callback
	      if (cb) setupTransitionCb(_.transitionEndEvent)
	    } else if (transitionType === 2) {
	      // animations are triggered when class is added
	      // so we just listen for animationend to remove it.
	      setupTransitionCb(_.animationEndEvent, function () {
	        removeClass(el, cls)
	      })
	    } else {
	      // no transition applicable
	      removeClass(el, cls)
	      if (cb) cb()
	    }
	  } else { // LEAVE
	    if (transitionType) {
	      // leave transitions/animations are both triggered
	      // by adding the class, just remove it on end event.
	      var event = transitionType === 1
	        ? _.transitionEndEvent
	        : _.animationEndEvent
	      setupTransitionCb(event, function () {
	        op()
	        removeClass(el, cls)
	      })
	    } else {
	      op()
	      removeClass(el, cls)
	      if (cb) cb()
	    }
	  }

	  /**
	   * Set up a transition end callback, store the callback
	   * on the element's __v_trans data object, so we can
	   * clean it up if another transition is triggered before
	   * the callback is fired.
	   *
	   * @param {String} event
	   * @param {Function} [cleanupFn]
	   */

	  function setupTransitionCb (event, cleanupFn) {
	    data.event = event
	    var onEnd = data.callback = function transitionCb (e) {
	      if (e.target === el) {
	        _.off(el, event, onEnd)
	        data.event = data.callback = null
	        if (cleanupFn) cleanupFn()
	        if (cb) cb()
	      }
	    }
	    _.on(el, event, onEnd)
	  }
	}

	/**
	 * Get an element's transition type based on the
	 * calculated styles
	 *
	 * @param {Element} el
	 * @param {Object} data
	 * @param {String} className
	 * @return {Number}
	 *         1 - transition
	 *         2 - animation
	 */

	function getTransitionType (el, data, className) {
	  var type = data.cache && data.cache[className]
	  if (type) return type
	  var inlineStyles = el.style
	  var computedStyles = window.getComputedStyle(el)
	  var transDuration =
	    inlineStyles[transDurationProp] ||
	    computedStyles[transDurationProp]
	  if (transDuration && transDuration !== '0s') {
	    type = 1
	  } else {
	    var animDuration =
	      inlineStyles[animDurationProp] ||
	      computedStyles[animDurationProp]
	    if (animDuration && animDuration !== '0s') {
	      type = 2
	    }
	  }
	  if (type) {
	    if (!data.cache) data.cache = {}
	    data.cache[className] = type
	  }
	  return type
	}

	/**
	 * Apply CSS transition to an element.
	 *
	 * @param {Element} el
	 * @param {Number} direction - 1: enter, -1: leave
	 * @param {Function} op - the actual DOM operation
	 * @param {Object} data - target element's transition data
	 */

	module.exports = function (el, direction, op, data, cb) {
	  var prefix = data.id || 'v'
	  var enterClass = prefix + '-enter'
	  var leaveClass = prefix + '-leave'
	  // clean up potential previous unfinished transition
	  if (data.callback) {
	    _.off(el, data.event, data.callback)
	    removeClass(el, enterClass)
	    removeClass(el, leaveClass)
	    data.event = data.callback = null
	  }
	  if (direction > 0) { // enter
	    addClass(el, enterClass)
	    op()
	    push(el, direction, null, enterClass, cb)
	  } else { // leave
	    addClass(el, leaveClass)
	    push(el, direction, op, leaveClass, cb)
	  }
	}

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Apply JavaScript enter/leave functions.
	 *
	 * @param {Element} el
	 * @param {Number} direction - 1: enter, -1: leave
	 * @param {Function} op - the actual DOM operation
	 * @param {Object} data - target element's transition data
	 * @param {Object} def - transition definition object
	 * @param {Vue} vm - the owner vm of the element
	 * @param {Function} [cb]
	 */

	module.exports = function (el, direction, op, data, def, vm, cb) {
	  if (data.cancel) {
	    data.cancel()
	    data.cancel = null
	  }
	  if (direction > 0) { // enter
	    if (def.beforeEnter) {
	      def.beforeEnter.call(vm, el)
	    }
	    op()
	    if (def.enter) {
	      data.cancel = def.enter.call(vm, el, function () {
	        data.cancel = null
	        if (cb) cb()
	      })
	    } else if (cb) {
	      cb()
	    }
	  } else { // leave
	    if (def.leave) {
	      data.cancel = def.leave.call(vm, el, function () {
	        data.cancel = null
	        op()
	        if (cb) cb()
	      })
	    } else {
	      op()
	      if (cb) cb()
	    }
	  }
	}

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el

	    // check params
	    // - lazy: update model on "change" instead of "input"
	    var lazy = el.hasAttribute('lazy')
	    if (lazy) {
	      el.removeAttribute('lazy')
	    }
	    // - number: cast value into number when updating model.
	    var number =
	      el.hasAttribute('number') ||
	      el.type === 'number'
	    if (number) {
	      el.removeAttribute('number')
	    }

	    // handle composition events.
	    // http://blog.evanyou.me/2014/01/03/composition-event/
	    var cpLocked = false
	    this.cpLock = function () {
	      cpLocked = true
	    }
	    this.cpUnlock = function () {
	      cpLocked = false
	      // in IE11 the "compositionend" event fires AFTER
	      // the "input" event, so the input handler is blocked
	      // at the end... have to call it here.
	      set()
	    }
	    _.on(el,'compositionstart', this.cpLock)
	    _.on(el,'compositionend', this.cpUnlock)

	    // shared setter
	    function set () {
	      self.set(
	        number ? _.toNumber(el.value) : el.value,
	        true
	      )
	    }

	    // if the directive has filters, we need to
	    // record cursor position and restore it after updating
	    // the input with the filtered value.
	    this.listener = function textInputListener () {
	      if (cpLocked) return
	      var charsOffset
	      // some HTML5 input types throw error here
	      try {
	        // record how many chars from the end of input
	        // the cursor was at
	        charsOffset = el.value.length - el.selectionStart
	      } catch (e) {}
	      set()
	      // force a value update, because in
	      // certain cases the write filters output the same
	      // result for different input values, and the Observer
	      // set events won't be triggered.
	      _.nextTick(function () {
	        var newVal = self._watcher.value
	        self.update(newVal)
	        if (charsOffset != null) {
	          var cursorPos =
	            _.toString(newVal).length - charsOffset
	          el.setSelectionRange(cursorPos, cursorPos)
	        }
	      })
	    }
	    this.event = lazy ? 'change' : 'input'
	    _.on(el, this.event, this.listener)

	    // IE9 doesn't fire input event on backspace/del/cut
	    if (!lazy && _.isIE9) {
	      this.onCut = function () {
	        _.nextTick(self.listener)
	      }
	      this.onDel = function (e) {
	        if (e.keyCode === 46 || e.keyCode === 8) {
	          self.listener()
	        }
	      }
	      _.on(el, 'cut', this.onCut)
	      _.on(el, 'keyup', this.onDel)
	    }

	    // set initial value if present
	    if (
	      el.hasAttribute('value') ||
	      (el.tagName === 'TEXTAREA' && el.value.trim())
	    ) {
	      this._initValue = number
	        ? _.toNumber(el.value)
	        : el.value
	    }
	  },

	  update: function (value) {
	    this.el.value = _.toString(value)
	  },

	  unbind: function () {
	    var el = this.el
	    _.off(el, this.event, this.listener)
	    _.off(el,'compositionstart', this.cpLock)
	    _.off(el,'compositionend', this.cpUnlock)
	    if (this.onCut) {
	      _.off(el,'cut', this.onCut)
	      _.off(el,'keyup', this.onDel)
	    }
	  }

	}

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    this.listener = function () {
	      self.set(el.value, true)
	    }
	    _.on(el, 'change', this.listener)
	    if (el.checked) {
	      this._initValue = el.value
	    }
	  },

	  update: function (value) {
	    /* jshint eqeqeq: false */
	    this.el.checked = value == this.el.value
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	  }

	}

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var Watcher = __webpack_require__(21)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    // check options param
	    var optionsParam = el.getAttribute('options')
	    if (optionsParam) {
	      el.removeAttribute('options')
	      initOptions.call(this, optionsParam)
	    }
	    this.multiple = el.hasAttribute('multiple')
	    this.listener = function () {
	      var value = self.multiple
	        ? getMultiValue(el)
	        : el.value
	      self.set(value, true)
	    }
	    _.on(el, 'change', this.listener)
	    checkInitialValue.call(this)
	  },

	  update: function (value) {
	    /* jshint eqeqeq: false */
	    var el = this.el
	    el.selectedIndex = -1
	    var multi = this.multiple && _.isArray(value)
	    var options = el.options
	    var i = options.length
	    var option
	    while (i--) {
	      option = options[i]
	      option.selected = multi
	        ? indexOf(value, option.value) > -1
	        : value == option.value
	    }
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	    if (this.optionWatcher) {
	      this.optionWatcher.teardown()
	    }
	  }

	}

	/**
	 * Initialize the option list from the param.
	 *
	 * @param {String} expression
	 */

	function initOptions (expression) {
	  var self = this
	  function optionUpdateWatcher (value) {
	    if (_.isArray(value)) {
	      self.el.innerHTML = ''
	      buildOptions(self.el, value)
	      if (self._watcher) {
	        self.update(self._watcher.value)
	      }
	    } else {
	      _.warn('Invalid options value for v-model: ' + value)
	    }
	  }
	  this.optionWatcher = new Watcher(
	    this.vm,
	    expression,
	    optionUpdateWatcher
	  )
	  // update with initial value
	  optionUpdateWatcher(this.optionWatcher.value)
	}

	/**
	 * Build up option elements. IE9 doesn't create options
	 * when setting innerHTML on <select> elements, so we have
	 * to use DOM API here.
	 *
	 * @param {Element} parent - a <select> or an <optgroup>
	 * @param {Array} options
	 */

	function buildOptions (parent, options) {
	  var op, el
	  for (var i = 0, l = options.length; i < l; i++) {
	    op = options[i]
	    if (!op.options) {
	      el = document.createElement('option')
	      if (typeof op === 'string') {
	        el.text = el.value = op
	      } else {
	        el.text = op.text
	        el.value = op.value
	      }
	    } else {
	      el = document.createElement('optgroup')
	      el.label = op.label
	      buildOptions(el, op.options)
	    }
	    parent.appendChild(el)
	  }
	}

	/**
	 * Check the initial value for selected options.
	 */

	function checkInitialValue () {
	  var initValue
	  var options = this.el.options
	  for (var i = 0, l = options.length; i < l; i++) {
	    if (options[i].hasAttribute('selected')) {
	      if (this.multiple) {
	        (initValue || (initValue = []))
	          .push(options[i].value)
	      } else {
	        initValue = options[i].value
	      }
	    }
	  }
	  if (initValue) {
	    this._initValue = initValue
	  }
	}

	/**
	 * Helper to extract a value array for select[multiple]
	 *
	 * @param {SelectElement} el
	 * @return {Array}
	 */

	function getMultiValue (el) {
	  return Array.prototype.filter
	    .call(el.options, filterSelected)
	    .map(getOptionValue)
	}

	function filterSelected (op) {
	  return op.selected
	}

	function getOptionValue (op) {
	  return op.value || op.text
	}

	/**
	 * Native Array.indexOf uses strict equal, but in this
	 * case we need to match string/numbers with soft equal.
	 *
	 * @param {Array} arr
	 * @param {*} val
	 */

	function indexOf (arr, val) {
	  /* jshint eqeqeq: false */
	  var i = arr.length
	  while (i--) {
	    if (arr[i] == val) return i
	  }
	  return -1
	}

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)

	module.exports = {

	  bind: function () {
	    var self = this
	    var el = this.el
	    this.listener = function () {
	      self.set(el.checked, true)
	    }
	    _.on(el, 'change', this.listener)
	    if (el.checked) {
	      this._initValue = el.checked
	    }
	  },

	  update: function (value) {
	    this.el.checked = !!value
	  },

	  unbind: function () {
	    _.off(this.el, 'change', this.listener)
	  }

	}

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var arrayProto = Array.prototype
	var arrayMethods = Object.create(arrayProto)

	/**
	 * Intercept mutating methods and emit events
	 */

	;[
	  'push',
	  'pop',
	  'shift',
	  'unshift',
	  'splice',
	  'sort',
	  'reverse'
	]
	.forEach(function (method) {
	  // cache original method
	  var original = arrayProto[method]
	  _.define(arrayMethods, method, function mutator () {
	    // avoid leaking arguments:
	    // http://jsperf.com/closure-with-arguments
	    var i = arguments.length
	    var args = new Array(i)
	    while (i--) {
	      args[i] = arguments[i]
	    }
	    var result = original.apply(this, args)
	    var ob = this.__ob__
	    var inserted
	    switch (method) {
	      case 'push':
	        inserted = args
	        break
	      case 'unshift':
	        inserted = args
	        break
	      case 'splice':
	        inserted = args.slice(2)
	        break
	    }
	    if (inserted) ob.observeArray(inserted)
	    // notify change
	    ob.notify()
	    return result
	  })
	})

	/**
	 * Swap the element at the given index with a new value
	 * and emits corresponding event.
	 *
	 * @param {Number} index
	 * @param {*} val
	 * @return {*} - replaced element
	 */

	_.define(
	  arrayProto,
	  '$set',
	  function $set (index, val) {
	    if (index >= this.length) {
	      this.length = index + 1
	    }
	    return this.splice(index, 1, val)[0]
	  }
	)

	/**
	 * Convenience method to remove the element at given index.
	 *
	 * @param {Number} index
	 * @param {*} val
	 */

	_.define(
	  arrayProto,
	  '$remove',
	  function $remove (index) {
	    if (typeof index !== 'number') {
	      index = this.indexOf(index)
	    }
	    if (index > -1) {
	      return this.splice(index, 1)[0]
	    }
	  }
	)

	module.exports = arrayMethods

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(1)
	var objProto = Object.prototype

	/**
	 * Add a new property to an observed object
	 * and emits corresponding event
	 *
	 * @param {String} key
	 * @param {*} val
	 * @public
	 */

	_.define(
	  objProto,
	  '$add',
	  function $add (key, val) {
	    var ob = this.__ob__
	    if (!ob) {
	      this[key] = val
	      return
	    }
	    if (_.isReserved(key)) {
	      _.warn('Refused to $add reserved key: ' + key)
	      return
	    }
	    if (this.hasOwnProperty(key)) return
	    ob.convert(key, val)
	    if (ob.vms) {
	      var i = ob.vms.length
	      while (i--) {
	        var vm = ob.vms[i]
	        vm._proxy(key)
	        vm._digest()
	      }
	    } else {
	      ob.notify()
	    }
	  }
	)

	/**
	 * Deletes a property from an observed object
	 * and emits corresponding event
	 *
	 * @param {String} key
	 * @public
	 */

	_.define(
	  objProto,
	  '$delete',
	  function $delete (key) {
	    var ob = this.__ob__
	    if (!ob) {
	      delete this[key]
	      return
	    }
	    if (_.isReserved(key)) {
	      _.warn('Refused to $add reserved key: ' + key)
	      return
	    }
	    if (!this.hasOwnProperty(key)) return
	    delete this[key]
	    if (ob.vms) {
	      var i = ob.vms.length
	      while (i--) {
	        var vm = ob.vms[i]
	        vm._unproxy(key)
	        vm._digest()
	      }
	    } else {
	      ob.notify()
	    }
	  }
	)

/***/ }
/******/ ])
});

},{}],3:[function(require,module,exports){
var Vue = require("./bower_components/vue/dist/vue.js");
var validator = require("./bower_components/vue-validator/dist/vue-validator.js");

Vue.use(validator)
},{"./bower_components/vue-validator/dist/vue-validator.js":1,"./bower_components/vue/dist/vue.js":2}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImJvd2VyX2NvbXBvbmVudHMvdnVlLXZhbGlkYXRvci9kaXN0L3Z1ZS12YWxpZGF0b3IuanMiLCJib3dlcl9jb21wb25lbnRzL3Z1ZS9kaXN0L3Z1ZS5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDLzdPQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7KGZ1bmN0aW9uKCl7XG5cbi8qKlxuICogUmVxdWlyZSB0aGUgZ2l2ZW4gcGF0aC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHJldHVybiB7T2JqZWN0fSBleHBvcnRzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlcXVpcmUocGF0aCwgcGFyZW50LCBvcmlnKSB7XG4gIHZhciByZXNvbHZlZCA9IHJlcXVpcmUucmVzb2x2ZShwYXRoKTtcblxuICAvLyBsb29rdXAgZmFpbGVkXG4gIGlmIChudWxsID09IHJlc29sdmVkKSB7XG4gICAgb3JpZyA9IG9yaWcgfHwgcGF0aDtcbiAgICBwYXJlbnQgPSBwYXJlbnQgfHwgJ3Jvb3QnO1xuICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ0ZhaWxlZCB0byByZXF1aXJlIFwiJyArIG9yaWcgKyAnXCIgZnJvbSBcIicgKyBwYXJlbnQgKyAnXCInKTtcbiAgICBlcnIucGF0aCA9IG9yaWc7XG4gICAgZXJyLnBhcmVudCA9IHBhcmVudDtcbiAgICBlcnIucmVxdWlyZSA9IHRydWU7XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgdmFyIG1vZHVsZSA9IHJlcXVpcmUubW9kdWxlc1tyZXNvbHZlZF07XG5cbiAgLy8gcGVyZm9ybSByZWFsIHJlcXVpcmUoKVxuICAvLyBieSBpbnZva2luZyB0aGUgbW9kdWxlJ3NcbiAgLy8gcmVnaXN0ZXJlZCBmdW5jdGlvblxuICBpZiAoIW1vZHVsZS5fcmVzb2x2aW5nICYmICFtb2R1bGUuZXhwb3J0cykge1xuICAgIHZhciBtb2QgPSB7fTtcbiAgICBtb2QuZXhwb3J0cyA9IHt9O1xuICAgIG1vZC5jbGllbnQgPSBtb2QuY29tcG9uZW50ID0gdHJ1ZTtcbiAgICBtb2R1bGUuX3Jlc29sdmluZyA9IHRydWU7XG4gICAgbW9kdWxlLmNhbGwodGhpcywgbW9kLmV4cG9ydHMsIHJlcXVpcmUucmVsYXRpdmUocmVzb2x2ZWQpLCBtb2QpO1xuICAgIGRlbGV0ZSBtb2R1bGUuX3Jlc29sdmluZztcbiAgICBtb2R1bGUuZXhwb3J0cyA9IG1vZC5leHBvcnRzO1xuICB9XG5cbiAgcmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVyZWQgbW9kdWxlcy5cbiAqL1xuXG5yZXF1aXJlLm1vZHVsZXMgPSB7fTtcblxuLyoqXG4gKiBSZWdpc3RlcmVkIGFsaWFzZXMuXG4gKi9cblxucmVxdWlyZS5hbGlhc2VzID0ge307XG5cbi8qKlxuICogUmVzb2x2ZSBgcGF0aGAuXG4gKlxuICogTG9va3VwOlxuICpcbiAqICAgLSBQQVRIL2luZGV4LmpzXG4gKiAgIC0gUEFUSC5qc1xuICogICAtIFBBVEhcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHJldHVybiB7U3RyaW5nfSBwYXRoIG9yIG51bGxcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnJlcXVpcmUucmVzb2x2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgaWYgKHBhdGguY2hhckF0KDApID09PSAnLycpIHBhdGggPSBwYXRoLnNsaWNlKDEpO1xuXG4gIHZhciBwYXRocyA9IFtcbiAgICBwYXRoLFxuICAgIHBhdGggKyAnLmpzJyxcbiAgICBwYXRoICsgJy5qc29uJyxcbiAgICBwYXRoICsgJy9pbmRleC5qcycsXG4gICAgcGF0aCArICcvaW5kZXguanNvbidcbiAgXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhdGggPSBwYXRoc1tpXTtcbiAgICBpZiAocmVxdWlyZS5tb2R1bGVzLmhhc093blByb3BlcnR5KHBhdGgpKSByZXR1cm4gcGF0aDtcbiAgICBpZiAocmVxdWlyZS5hbGlhc2VzLmhhc093blByb3BlcnR5KHBhdGgpKSByZXR1cm4gcmVxdWlyZS5hbGlhc2VzW3BhdGhdO1xuICB9XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBgcGF0aGAgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgcGF0aC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY3VyclxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnJlcXVpcmUubm9ybWFsaXplID0gZnVuY3Rpb24oY3VyciwgcGF0aCkge1xuICB2YXIgc2VncyA9IFtdO1xuXG4gIGlmICgnLicgIT0gcGF0aC5jaGFyQXQoMCkpIHJldHVybiBwYXRoO1xuXG4gIGN1cnIgPSBjdXJyLnNwbGl0KCcvJyk7XG4gIHBhdGggPSBwYXRoLnNwbGl0KCcvJyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCcuLicgPT0gcGF0aFtpXSkge1xuICAgICAgY3Vyci5wb3AoKTtcbiAgICB9IGVsc2UgaWYgKCcuJyAhPSBwYXRoW2ldICYmICcnICE9IHBhdGhbaV0pIHtcbiAgICAgIHNlZ3MucHVzaChwYXRoW2ldKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY3Vyci5jb25jYXQoc2Vncykuam9pbignLycpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBtb2R1bGUgYXQgYHBhdGhgIHdpdGggY2FsbGJhY2sgYGRlZmluaXRpb25gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkZWZpbml0aW9uXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5yZXF1aXJlLnJlZ2lzdGVyID0gZnVuY3Rpb24ocGF0aCwgZGVmaW5pdGlvbikge1xuICByZXF1aXJlLm1vZHVsZXNbcGF0aF0gPSBkZWZpbml0aW9uO1xufTtcblxuLyoqXG4gKiBBbGlhcyBhIG1vZHVsZSBkZWZpbml0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmcm9tXG4gKiBAcGFyYW0ge1N0cmluZ30gdG9cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnJlcXVpcmUuYWxpYXMgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBpZiAoIXJlcXVpcmUubW9kdWxlcy5oYXNPd25Qcm9wZXJ0eShmcm9tKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGFsaWFzIFwiJyArIGZyb20gKyAnXCIsIGl0IGRvZXMgbm90IGV4aXN0Jyk7XG4gIH1cbiAgcmVxdWlyZS5hbGlhc2VzW3RvXSA9IGZyb207XG59O1xuXG4vKipcbiAqIFJldHVybiBhIHJlcXVpcmUgZnVuY3Rpb24gcmVsYXRpdmUgdG8gdGhlIGBwYXJlbnRgIHBhdGguXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHBhcmVudFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5yZXF1aXJlLnJlbGF0aXZlID0gZnVuY3Rpb24ocGFyZW50KSB7XG4gIHZhciBwID0gcmVxdWlyZS5ub3JtYWxpemUocGFyZW50LCAnLi4nKTtcblxuICAvKipcbiAgICogbGFzdEluZGV4T2YgaGVscGVyLlxuICAgKi9cblxuICBmdW5jdGlvbiBsYXN0SW5kZXhPZihhcnIsIG9iaikge1xuICAgIHZhciBpID0gYXJyLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBpZiAoYXJyW2ldID09PSBvYmopIHJldHVybiBpO1xuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHJlbGF0aXZlIHJlcXVpcmUoKSBpdHNlbGYuXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGxvY2FsUmVxdWlyZShwYXRoKSB7XG4gICAgdmFyIHJlc29sdmVkID0gbG9jYWxSZXF1aXJlLnJlc29sdmUocGF0aCk7XG4gICAgcmV0dXJuIHJlcXVpcmUocmVzb2x2ZWQsIHBhcmVudCwgcGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzb2x2ZSByZWxhdGl2ZSB0byB0aGUgcGFyZW50LlxuICAgKi9cblxuICBsb2NhbFJlcXVpcmUucmVzb2x2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB2YXIgYyA9IHBhdGguY2hhckF0KDApO1xuICAgIGlmICgnLycgPT0gYykgcmV0dXJuIHBhdGguc2xpY2UoMSk7XG4gICAgaWYgKCcuJyA9PSBjKSByZXR1cm4gcmVxdWlyZS5ub3JtYWxpemUocCwgcGF0aCk7XG5cbiAgICAvLyByZXNvbHZlIGRlcHMgYnkgcmV0dXJuaW5nXG4gICAgLy8gdGhlIGRlcCBpbiB0aGUgbmVhcmVzdCBcImRlcHNcIlxuICAgIC8vIGRpcmVjdG9yeVxuICAgIHZhciBzZWdzID0gcGFyZW50LnNwbGl0KCcvJyk7XG4gICAgdmFyIGkgPSBsYXN0SW5kZXhPZihzZWdzLCAnZGVwcycpICsgMTtcbiAgICBpZiAoIWkpIGkgPSAwO1xuICAgIHBhdGggPSBzZWdzLnNsaWNlKDAsIGkgKyAxKS5qb2luKCcvJykgKyAnL2RlcHMvJyArIHBhdGg7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIG1vZHVsZSBpcyBkZWZpbmVkIGF0IGBwYXRoYC5cbiAgICovXG5cbiAgbG9jYWxSZXF1aXJlLmV4aXN0cyA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICByZXR1cm4gcmVxdWlyZS5tb2R1bGVzLmhhc093blByb3BlcnR5KGxvY2FsUmVxdWlyZS5yZXNvbHZlKHBhdGgpKTtcbiAgfTtcblxuICByZXR1cm4gbG9jYWxSZXF1aXJlO1xufTtcbnJlcXVpcmUucmVnaXN0ZXIoXCJ2dWUtdmFsaWRhdG9yL2luZGV4LmpzXCIsIGZ1bmN0aW9uKGV4cG9ydHMsIHJlcXVpcmUsIG1vZHVsZSl7XG52YXIgc2xpY2UgPSBbXS5zbGljZVxudmFyIGhhc093biA9ICh7fSkuaGFzT3duUHJvcGVydHlcblxuXG4vKipcbiAqIGV4cG9ydChzKVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKFZ1ZSkge1xuICB2YXIgdXRpbHMgPSBWdWUucmVxdWlyZSgndXRpbHMnKVxuICB2YXIgRGlyZWN0aXZlID0gVnVlLnJlcXVpcmUoJ2RpcmVjdGl2ZScpXG4gIHZhciBCaW5kaW5nID0gVnVlLnJlcXVpcmUoJ2JpbmRpbmcnKVxuICB2YXIgT2JzZXJ2ZXIgPSBWdWUucmVxdWlyZSgnb2JzZXJ2ZXInKVxuXG4gIHZhciB2YWxpZGF0aW9uS2V5ID0gJyR2YWxpZGF0aW9uJ1xuICB2YXIgdmFsaWRhdGlvblByb3BlcnR5TmFtZSA9IHZhbGlkYXRpb25LZXkuc3BsaXQoJyQnKVsxXVxuICB2YXIgdmFsaWRLZXkgPSAnJHZhbGlkJ1xuXG4gIFZ1ZS5maWx0ZXIoJ3JlcXVpcmVkJywgdmFsaWRhdGVSZXF1aXJlZClcbiAgVnVlLmZpbHRlcigncGF0dGVybicsIHZhbGlkYXRlUGF0dGVybilcbiAgVnVlLmZpbHRlcignbGVuZ3RoJywgdmFsaWRhdGVMZW5ndGgpXG4gIFZ1ZS5maWx0ZXIoJ251bWVyaWMnLCB2YWxpZGF0ZU51bWVyaWMpXG4gIFZ1ZS5maWx0ZXIoJ3ZhbGlkYXRvcicsIHZhbGlkYXRlQ3VzdG9tKVxuXG4gIFZ1ZS5kaXJlY3RpdmUoJ3ZhbGlkYXRlJywge1xuICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb21waWxlciA9IHRoaXMuY29tcGlsZXJcbiAgICAgIHZhciAkdmFsaWRhdGlvbiA9IGNvbXBpbGVyW3ZhbGlkYXRpb25Qcm9wZXJ0eU5hbWVdIHx8IHt9XG4gICAgICB2YXIgZWwgPSB0aGlzLmVsXG4gICAgICB2YXIgdm0gPSB0aGlzLnZtXG4gICAgICB2YXIgb2JzZXJ2ZXIgPSBjb21waWxlci5vYnNlcnZlclxuICAgICAgdmFyIHZhbGlkYXRpb25CaW5kaW5ncyA9IHRoaXMudmFsaWRhdGlvbkJpbmRpbmdzID0ge31cblxuICAgICAgLy8gZW5hYmxlICR2YWxpZGF0aW9uXG4gICAgICB2bVt2YWxpZGF0aW9uS2V5XSA9IGNvbXBpbGVyW3ZhbGlkYXRpb25Qcm9wZXJ0eU5hbWVdID0gJHZhbGlkYXRpb25cbiAgICAgIE9ic2VydmVyLm9ic2VydmUoJHZhbGlkYXRpb24sIHZhbGlkYXRpb25LZXksIGNvbXBpbGVyLm9ic2VydmVyKVxuICAgICAgY29tcGlsZXIuYmluZGluZ3NbdmFsaWRhdGlvbktleV0gPSBuZXcgQmluZGluZyhjb21waWxlciwgdmFsaWRhdGlvbktleSlcbiAgICAgIHZhbGlkYXRpb25CaW5kaW5nc1t2YWxpZGF0aW9uS2V5XSA9IGNvbXBpbGVyLmJpbmRpbmdzW3ZhbGlkYXRpb25LZXldXG5cbiAgICAgIC8vIHJlZ2lzdGVyIHZhbGlkYXRpb24gc3RhdGUgZnJvbSB2LW1vZGVsIGRpcmVjdGl2ZVxuICAgICAgZnVuY3Rpb24gcmVnaXN0ZXJWYWxpZGF0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmIChlbGVtZW50Lm5vZGVUeXBlID09PSAxIFxuICAgICAgICAgICYmIGVsZW1lbnQudGFnTmFtZSAhPT0gJ1NDUklQVCcgXG4gICAgICAgICAgJiYgZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgICBzbGljZS5jYWxsKGVsZW1lbnQuY2hpbGROb2RlcykuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgaWYgKG5vZGUuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgICAgICAgcmVnaXN0ZXJWYWxpZGF0aW9uKG5vZGUpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhZyA9IG5vZGUudGFnTmFtZVxuICAgICAgICAgICAgICAgIGlmICgodGFnID09PSAnSU5QVVQnIHx8IHRhZyA9PT0gJ1NFTEVDVCcgfHwgdGFnID09PSAnVEVYVEFSRUEnKSBcbiAgICAgICAgICAgICAgICAgICYmIG5vZGUuaGFzQXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgICAgdmFyIGF0dHJzID0gc2xpY2UuY2FsbChub2RlLmF0dHJpYnV0ZXMpXG4gICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhdHRyID0gYXR0cnNbaV1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIubmFtZSA9PT0gJ3YtbW9kZWwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIGFzdHMgPSBEaXJlY3RpdmUucGFyc2UoYXR0ci52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gYXN0c1swXS5rZXlcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgZmlsdGVycyA9IGFzdHNbMF0uZmlsdGVyc1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0VmFsaWRhdGlvblN0YXRlKCR2YWxpZGF0aW9uLCBrZXksIGZpbHRlcnMsIGNvbXBpbGVyLCB2YWxpZGF0aW9uQmluZGluZ3MpXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyLnZhbHVlID0gbWFrZUZpbHRlckV4cHJlc3Npb24oJHZhbGlkYXRpb24sIGtleSwgZmlsdGVycylcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZWdpc3RlclZhbGlkYXRpb24oZWwpXG5cbiAgICAgIC8vIGVuYWJsZSAkdmFsaWRcbiAgICAgIHZhciB2YWxpZEJpbmRpbmcgPSBjb21waWxlci5iaW5kaW5nc1t2YWxpZEtleV0gPSBuZXcgQmluZGluZyhjb21waWxlciwgdmFsaWRLZXkpXG4gICAgICB2YWxpZGF0aW9uQmluZGluZ3NbdmFsaWRLZXldID0gdmFsaWRCaW5kaW5nXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodm0sIHZhbGlkS2V5LCB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgb2JzZXJ2ZXIuZW1pdCgnZ2V0JywgdmFsaWRLZXkpXG4gICAgICAgICAgcmV0dXJuIHZhbGlkQmluZGluZy52YWx1ZVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBpbmplY3QgdmFsaWRhdGlvbiBjaGVja2luZyBoYW5kbGVcbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZVZhbGlkICgpIHtcbiAgICAgICAgdmFyIHZhbGlkID0gdHJ1ZVxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gJHZhbGlkYXRpb24pIHtcbiAgICAgICAgICBpZiAoJHZhbGlkYXRpb25ba2V5XSkge1xuICAgICAgICAgICAgdmFsaWQgPSBmYWxzZVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFsaWRCaW5kaW5nLnVwZGF0ZSh2YWxpZClcbiAgICAgIH1cbiAgICAgIHRoaXMuX2hhbmRsZVZhbGlkID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAodmFsaWRhdGlvbktleSA9PT0ga2V5IHx8IHZhbGlkS2V5ID09PSBrZXkpIHsgcmV0dXJuIH1cbiAgICAgICAgaWYgKGtleSBpbiB2YWxpZGF0aW9uQmluZGluZ3MpIHtcbiAgICAgICAgICB1cGRhdGVWYWxpZCgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9ic2VydmVyLm9uKCdzZXQnLCB0aGlzLl9oYW5kbGVWYWxpZClcbiAgICB9LFxuXG4gICAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29tcGlsZXIgPSB0aGlzLmNvbXBpbGVyXG4gICAgICB2YXIgdm0gPSB0aGlzLnZtXG4gICAgICB2YXIgb2JzZXJ2ZXIgPSBjb21waWxlci5vYnNlcnZlclxuICAgICAgdmFyICR2YWxpZGF0aW9uID0gY29tcGlsZXJbdmFsaWRhdGlvblByb3BlcnR5TmFtZV1cbiAgICAgIHZhciB2YWxpZGF0aW9uQmluZGluZ3MgPSB0aGlzLnZhbGlkYXRpb25CaW5kaW5nc1xuICAgICAgdmFyIGJpbmRpbmdzID0gY29tcGlsZXIuYmluZGluZ3NcblxuICAgICAgLy8gZGlzYWJsZSAkdmFsaWRcbiAgICAgIG9ic2VydmVyLm9mZih0aGlzLl9oYW5kbGVWYWxpZClcbiAgICAgIGRlbGV0ZSB0aGlzLl9oYW5kbGVWYWxpZFxuICAgICAgZGVsZXRlIHZtW3ZhbGlkS2V5XVxuXG4gICAgICAvLyByZWxlYXNlIGJpbmRpbmdzXG4gICAgICBmb3IgKHZhciBrZXkgaW4gdmFsaWRhdGlvbkJpbmRpbmdzKSB7XG4gICAgICAgIHZhciBiaW5kaW5nID0gYmluZGluZ3Nba2V5XVxuICAgICAgICBpZiAoYmluZGluZykge1xuICAgICAgICAgIGJpbmRpbmcudW5iaW5kKClcbiAgICAgICAgICBkZWxldGUgYmluZGluZ3Nba2V5XVxuICAgICAgICB9XG4gICAgICAgIHZhbGlkYXRpb25CaW5kaW5nc1trZXldID0gbnVsbFxuICAgICAgfVxuICAgICAgZGVsZXRlIHRoaXMudmFsaWRhdGlvbkJpbmRpbmdzXG5cbiAgICAgIC8vIGRpc2FibGUgJHZhbGlkYXRpb25cbiAgICAgIE9ic2VydmVyLnVub2JzZXJ2ZSgkdmFsaWRhdGlvbiwgdmFsaWRhdGlvbktleSwgY29tcGlsZXIub2JzZXJ2ZXIpXG4gICAgICBkZWxldGUgY29tcGlsZXJbdmFsaWRhdGlvblByb3BlcnR5TmFtZV1cbiAgICAgIGRlbGV0ZSB2bVt2YWxpZGF0aW9uS2V5XVxuICAgIH1cbiAgfSlcblxuXG4gIGZ1bmN0aW9uIGluaXRWYWxpZGF0aW9uU3RhdGUgKCR2YWxpZGF0aW9uLCBrZXksIGZpbHRlcnMsIGNvbXBpbGVyLCB2YWxpZGF0aW9uQmluZGluZ3MpIHtcbiAgICB2YXIgcGF0aCwgYmluZGluZ1BhdGgsIGFyZ3MgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsdGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGZpbHRlck5hbWUgPSBmaWx0ZXJzW2ldLm5hbWVcbiAgICAgIGlmIChmaWx0ZXJOYW1lID09PSAncmVxdWlyZWQnIHx8IGZpbHRlck5hbWUgPT09ICdwYXR0ZXJuJykge1xuICAgICAgICBwYXRoID0gW2tleSwgZmlsdGVyTmFtZV0uam9pbignLicpXG4gICAgICAgIGJpbmRpbmdQYXRoID0gW3ZhbGlkYXRpb25LZXksIGtleSwgZmlsdGVyTmFtZV0uam9pbignLicpXG4gICAgICAgIG1ha2VCaW5kaW5nKHBhdGgsIGJpbmRpbmdQYXRoKVxuICAgICAgfSBlbHNlIGlmIChmaWx0ZXJOYW1lID09PSAnbGVuZ3RoJyB8fCBmaWx0ZXJOYW1lID09PSAnbnVtZXJpYycpIHtcbiAgICAgICAgYXJncyA9IHBhcnNlRmlsdGVyQXJncyhmaWx0ZXJzW2ldLmFyZ3MpXG4gICAgICAgIGlmIChmaWx0ZXJOYW1lID09PSAnbnVtZXJpYycpIHsgYXJncy5wdXNoKCd2YWx1ZScpIH1cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhcmdzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgcGF0aCA9IFtrZXksIGZpbHRlck5hbWUsIGFyZ3Nbal1dLmpvaW4oJy4nKVxuICAgICAgICAgIGJpbmRpbmdQYXRoID0gW3ZhbGlkYXRpb25LZXksIGtleSwgZmlsdGVyTmFtZSwgYXJnc1tqXV0uam9pbignLicpXG4gICAgICAgICAgbWFrZUJpbmRpbmcocGF0aCwgYmluZGluZ1BhdGgpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZmlsdGVyTmFtZSA9PT0gJ3ZhbGlkYXRvcicpIHtcbiAgICAgICAgcGF0aCA9IFtrZXksIGZpbHRlck5hbWUsIGZpbHRlcnNbaV0uYXJnc1swXV0uam9pbignLicpXG4gICAgICAgIGJpbmRpbmdQYXRoID0gW3ZhbGlkYXRpb25LZXksIGtleSwgZmlsdGVyTmFtZSwgZmlsdGVyc1tpXS5hcmdzWzBdXS5qb2luKCcuJylcbiAgICAgICAgbWFrZUJpbmRpbmcocGF0aCwgYmluZGluZ1BhdGgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUJpbmRpbmcgKHBhdGgsIGJpbmRpbmdQYXRoKSB7XG4gICAgICB2YXIgYmluZGluZyA9IHZhbGlkYXRpb25CaW5kaW5nc1tiaW5kaW5nUGF0aF0gfHwgbmV3IEJpbmRpbmcoY29tcGlsZXIsIGJpbmRpbmdQYXRoKVxuICAgICAgY29tcGlsZXIuYmluZGluZ3NbYmluZGluZ1BhdGhdID0gdmFsaWRhdGlvbkJpbmRpbmdzW2JpbmRpbmdQYXRoXSA9IGJpbmRpbmdcbiAgICAgIGRlZmluZVByb3BlcnR5KCR2YWxpZGF0aW9uLCBwYXRoLCBiaW5kaW5nKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlRmlsdGVyQXJncyAoYXJncykge1xuICAgIHZhciByZXQgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYXJnID0gYXJnc1tpXSwgcGFyc2VkID0gYXJnLnNwbGl0KCc6JylcbiAgICAgIGlmIChwYXJzZWQubGVuZ3RoICE9PSAyKSB7IGNvbnRpbnVlIH1cbiAgICAgIHJldC5wdXNoKHBhcnNlZFswXSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlRmlsdGVyRXhwcmVzc2lvbiAoJHZhbGlkYXRpb24sIGtleSwgZmlsdGVycykge1xuICAgIHZhciBlbGVtZW50cyA9IFtrZXldXG4gICAgdmFyIHJldCA9ICcnXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbHRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBmaWx0ZXJOYW1lID0gZmlsdGVyc1tpXS5uYW1lXG4gICAgICBpZiAoZmlsdGVyc1tpXS5hcmdzKSB7XG4gICAgICAgIGVsZW1lbnRzLnB1c2goW2ZpbHRlck5hbWVdLmNvbmNhdChmaWx0ZXJzW2ldLmFyZ3MpLmNvbmNhdChba2V5XSkuam9pbignICcpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudHMucHVzaChmaWx0ZXJOYW1lICsgJyAnICsga2V5KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldCA9IGVsZW1lbnRzLmpvaW4oJ3wnKVxuICAgIHV0aWxzLmxvZygnbWFrZUZpbHRlckV4cHJlc3Npb246ICcgKyByZXQpXG5cbiAgICByZXR1cm4gcmV0XG4gIH1cblxuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eSAoJHZhbGlkYXRpb24sIGtleSwgYmluZGluZykge1xuICAgIHZhciBvYnNlcnZlciA9ICR2YWxpZGF0aW9uLl9fZW1pdHRlcl9fXG5cbiAgICAgIGlmICghKGhhc093bi5jYWxsKCR2YWxpZGF0aW9uLCBrZXkpKSkge1xuICAgICAgICAkdmFsaWRhdGlvbltrZXldID0gdW5kZWZpbmVkXG4gICAgICB9XG5cbiAgICBpZiAob2JzZXJ2ZXIgJiYgIShoYXNPd24uY2FsbChvYnNlcnZlci52YWx1ZXMsIGtleSkpKSB7XG4gICAgICBPYnNlcnZlci5jb252ZXJ0S2V5KCR2YWxpZGF0aW9uLCBrZXkpXG4gICAgfVxuXG4gICAgYmluZGluZy52YWx1ZSA9ICR2YWxpZGF0aW9uW2tleV1cbiAgfVxufVxuXG5cbi8qKlxuICogdmFsaWRhdGUgZmlsdGVyc1xuICovXG5cbmZ1bmN0aW9uIHZhbGlkYXRlUmVxdWlyZWQgKHZhbCwga2V5KSB7XG4gIHRyeSB7XG4gICAgdGhpcy4kdmFsaWRhdGlvbltba2V5LCAncmVxdWlyZWQnXS5qb2luKCcuJyldID0gKHZhbC5sZW5ndGggPT09IDApXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdyZXF1aXJlZCBmaWx0ZXIgZXJyb3I6JywgZSlcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVQYXR0ZXJuICh2YWwpIHtcbiAgdHJ5IHtcbiAgICB2YXIga2V5ID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXVxuICAgIHZhciBwYXR0ZXJuID0gYXJndW1lbnRzWzFdLnJlcGxhY2UoL14nLywgXCJcIikucmVwbGFjZSgvJyQvLCBcIlwiKVxuXG4gICAgdmFyIG1hdGNoID0gcGF0dGVybi5tYXRjaCgvXlxcLyguKilcXC8oW2dpbV0qKSQvKVxuICAgIGlmIChtYXRjaCkge1xuICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChtYXRjaFsxXSwgbWF0Y2hbMl0pXG4gICAgICB0aGlzLiR2YWxpZGF0aW9uW1trZXksICdwYXR0ZXJuJ10uam9pbignLicpXSA9ICFyZS50ZXN0KHZhbClcbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdwYXR0ZXJuIGZpbHRlciBlcnJvcjonLCBlKVxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUxlbmd0aCAodmFsKSB7XG4gIHRyeSB7XG4gICAgdmFyIGtleSA9IGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV1cbiAgICAgIHZhciBtaW5LZXkgPSBba2V5LCAnbGVuZ3RoJywgJ21pbiddLmpvaW4oJy4nKVxuICAgICAgdmFyIG1heEtleSA9IFtrZXksICdsZW5ndGgnLCAnbWF4J10uam9pbignLicpXG4gICAgICB2YXIgYXJncyA9IHt9XG5cbiAgICAvLyBwYXJzZSBsZW5ndGggY29uZGl0aW9uIGFyZ3VtZW50c1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgdmFyIHBhcnNlZCA9IGFyZ3VtZW50c1tpXS5zcGxpdCgnOicpXG4gICAgICBpZiAocGFyc2VkLmxlbmd0aCAhPT0gMikgeyBjb250aW51ZSB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VkWzFdKSkgeyBjb250aW51ZSB9XG4gICAgICBhcmdzW3BhcnNlZFswXV0gPSBwYXJzZUludChwYXJzZWRbMV0pXG4gICAgfVxuXG4gICAgLy8gdmFsaWRhdGUgbWluXG4gICAgaWYgKCdtaW4nIGluIGFyZ3MpIHtcbiAgICAgIHRoaXMuJHZhbGlkYXRpb25bbWluS2V5XSA9ICh2YWwubGVuZ3RoIDwgYXJnc1snbWluJ10pXG4gICAgfVxuXG4gICAgLy8gdmFsaWRhdGUgbWF4XG4gICAgaWYgKCdtYXgnIGluIGFyZ3MpIHtcbiAgICAgIHRoaXMuJHZhbGlkYXRpb25bbWF4S2V5XSA9ICh2YWwubGVuZ3RoID4gYXJnc1snbWF4J10pXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcignbGVuZ3RoIGZpbHRlciBlcnJvcjonLCBlKVxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZU51bWVyaWMgKHZhbCkge1xuICB0cnkge1xuICAgIHZhciBrZXkgPSBhcmd1bWVudHNbYXJndW1lbnRzLmxlbmd0aCAtIDFdXG4gICAgdmFyIG1pbktleSA9IFtrZXksICdudW1lcmljJywgJ21pbiddLmpvaW4oJy4nKVxuICAgIHZhciBtYXhLZXkgPSBba2V5LCAnbnVtZXJpYycsICdtYXgnXS5qb2luKCcuJylcbiAgICB2YXIgdmFsdWVLZXkgPSBba2V5LCAnbnVtZXJpYycsICd2YWx1ZSddLmpvaW4oJy4nKVxuICAgIHZhciBhcmdzID0ge31cblxuICAgIC8vIHBhcnNlIG51bWVyaWMgY29uZGl0aW9uIGFyZ3VtZW50c1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgdmFyIHBhcnNlZCA9IGFyZ3VtZW50c1tpXS5zcGxpdCgnOicpXG4gICAgICBpZiAocGFyc2VkLmxlbmd0aCAhPT0gMikgeyBjb250aW51ZSB9XG4gICAgICBpZiAoaXNOYU4ocGFyc2VkWzFdKSkgeyBjb250aW51ZSB9XG4gICAgICBhcmdzW3BhcnNlZFswXV0gPSBwYXJzZUludChwYXJzZWRbMV0pXG4gICAgfVxuXG4gICAgaWYgKGlzTmFOKHZhbCkpIHtcbiAgICAgIHRoaXMuJHZhbGlkYXRpb25bdmFsdWVLZXldID0gdHJ1ZVxuICAgICAgaWYgKCdtaW4nIGluIGFyZ3MpIHtcbiAgICAgICAgdGhpcy4kdmFsaWRhdGlvblttaW5LZXldID0gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmICgnbWF4JyBpbiBhcmdzKSB7XG4gICAgICAgIHRoaXMuJHZhbGlkYXRpb25bbWF4S2V5XSA9IGZhbHNlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJHZhbGlkYXRpb25bdmFsdWVLZXldID0gZmFsc2VcblxuICAgICAgdmFyIHZhbHVlID0gcGFyc2VJbnQodmFsKVxuXG4gICAgICAvLyB2YWxpZGF0ZSBtaW5cbiAgICAgIGlmICgnbWluJyBpbiBhcmdzKSB7XG4gICAgICAgIHRoaXMuJHZhbGlkYXRpb25bbWluS2V5XSA9ICh2YWx1ZSA8IGFyZ3NbJ21pbiddKVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZGF0ZSBtYXhcbiAgICAgIGlmICgnbWF4JyBpbiBhcmdzKSB7XG4gICAgICAgIHRoaXMuJHZhbGlkYXRpb25bbWF4S2V5XSA9ICh2YWx1ZSA+IGFyZ3NbJ21heCddKVxuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ251bWVyaWMgZmlsdGVyIGVycm9yOicsIGUpXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlQ3VzdG9tICh2YWwsIGN1c3RvbSkge1xuICB0cnkge1xuICAgIHZhciBmbiA9IHRoaXMuJG9wdGlvbnMubWV0aG9kc1tjdXN0b21dXG4gICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFsID0gZm4uY2FsbCh0aGlzLCB2YWwpXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5lcnJvcignY3VzdG9tIGZpbHRlciBlcnJvcjonLCBlKVxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG59KTtpZiAodHlwZW9mIGV4cG9ydHMgPT0gXCJvYmplY3RcIikge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL3Z1ZS12YWxpZGF0b3IuanNcIik7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKFtdLCBmdW5jdGlvbigpeyByZXR1cm4gcmVxdWlyZShcIi4vdnVlLXZhbGlkYXRvci5qc1wiKTsgfSk7XG59IGVsc2Uge1xuICB0aGlzW1widnVlLXZhbGlkYXRvclwiXSA9IHJlcXVpcmUoXCIuL3Z1ZS12YWxpZGF0b3IuanNcIik7XG59fSkoKTsiLCIvKipcbiAqIFZ1ZS5qcyB2MC4xMS4wXG4gKiAoYykgMjAxNCBFdmFuIFlvdVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG5cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiVnVlXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIlZ1ZVwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBleHRlbmQgPSBfLmV4dGVuZFxuXG5cdC8qKlxuXHQgKiBUaGUgZXhwb3NlZCBWdWUgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEFQSSBjb252ZW50aW9uczpcblx0ICogLSBwdWJsaWMgQVBJIG1ldGhvZHMvcHJvcGVydGllcyBhcmUgcHJlZmlleGVkIHdpdGggYCRgXG5cdCAqIC0gaW50ZXJuYWwgbWV0aG9kcy9wcm9wZXJ0aWVzIGFyZSBwcmVmaXhlZCB3aXRoIGBfYFxuXHQgKiAtIG5vbi1wcmVmaXhlZCBwcm9wZXJ0aWVzIGFyZSBhc3N1bWVkIHRvIGJlIHByb3hpZWQgdXNlclxuXHQgKiAgIGRhdGEuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cblx0ZnVuY3Rpb24gVnVlIChvcHRpb25zKSB7XG5cdCAgdGhpcy5faW5pdChvcHRpb25zKVxuXHR9XG5cblx0LyoqXG5cdCAqIE1peGluIGdsb2JhbCBBUElcblx0ICovXG5cblx0ZXh0ZW5kKFZ1ZSwgX193ZWJwYWNrX3JlcXVpcmVfXygyKSlcblxuXHQvKipcblx0ICogVnVlIGFuZCBldmVyeSBjb25zdHJ1Y3RvciB0aGF0IGV4dGVuZHMgVnVlIGhhcyBhblxuXHQgKiBhc3NvY2lhdGVkIG9wdGlvbnMgb2JqZWN0LCB3aGljaCBjYW4gYmUgYWNjZXNzZWQgZHVyaW5nXG5cdCAqIGNvbXBpbGF0aW9uIHN0ZXBzIGFzIGB0aGlzLmNvbnN0cnVjdG9yLm9wdGlvbnNgLlxuXHQgKlxuXHQgKiBUaGVzZSBjYW4gYmUgc2VlbiBhcyB0aGUgZGVmYXVsdCBvcHRpb25zIG9mIGV2ZXJ5XG5cdCAqIFZ1ZSBpbnN0YW5jZS5cblx0ICovXG5cblx0VnVlLm9wdGlvbnMgPSB7XG5cdCAgZGlyZWN0aXZlcyAgOiBfX3dlYnBhY2tfcmVxdWlyZV9fKDgpLFxuXHQgIGZpbHRlcnMgICAgIDogX193ZWJwYWNrX3JlcXVpcmVfXyg5KSxcblx0ICBwYXJ0aWFscyAgICA6IHt9LFxuXHQgIHRyYW5zaXRpb25zIDoge30sXG5cdCAgY29tcG9uZW50cyAgOiB7fVxuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkIHVwIHRoZSBwcm90b3R5cGVcblx0ICovXG5cblx0dmFyIHAgPSBWdWUucHJvdG90eXBlXG5cblx0LyoqXG5cdCAqICRkYXRhIGhhcyBhIHNldHRlciB3aGljaCBkb2VzIGEgYnVuY2ggb2Zcblx0ICogdGVhcmRvd24vc2V0dXAgd29ya1xuXHQgKi9cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkocCwgJyRkYXRhJywge1xuXHQgIGdldDogZnVuY3Rpb24gKCkge1xuXHQgICAgcmV0dXJuIHRoaXMuX2RhdGFcblx0ICB9LFxuXHQgIHNldDogZnVuY3Rpb24gKG5ld0RhdGEpIHtcblx0ICAgIHRoaXMuX3NldERhdGEobmV3RGF0YSlcblx0ICB9XG5cdH0pXG5cblx0LyoqXG5cdCAqIE1peGluIGludGVybmFsIGluc3RhbmNlIG1ldGhvZHNcblx0ICovXG5cblx0ZXh0ZW5kKHAsIF9fd2VicGFja19yZXF1aXJlX18oMTApKVxuXHRleHRlbmQocCwgX193ZWJwYWNrX3JlcXVpcmVfXygxMSkpXG5cdGV4dGVuZChwLCBfX3dlYnBhY2tfcmVxdWlyZV9fKDEyKSlcblx0ZXh0ZW5kKHAsIF9fd2VicGFja19yZXF1aXJlX18oMTMpKVxuXG5cdC8qKlxuXHQgKiBNaXhpbiBwdWJsaWMgQVBJIG1ldGhvZHNcblx0ICovXG5cblx0ZXh0ZW5kKHAsIF9fd2VicGFja19yZXF1aXJlX18oMykpXG5cdGV4dGVuZChwLCBfX3dlYnBhY2tfcmVxdWlyZV9fKDQpKVxuXHRleHRlbmQocCwgX193ZWJwYWNrX3JlcXVpcmVfXyg1KSlcblx0ZXh0ZW5kKHAsIF9fd2VicGFja19yZXF1aXJlX18oNikpXG5cdGV4dGVuZChwLCBfX3dlYnBhY2tfcmVxdWlyZV9fKDcpKVxuXG5cdG1vZHVsZS5leHBvcnRzID0gXy5WdWUgPSBWdWVcblxuLyoqKi8gfSxcbi8qIDEgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBsYW5nICAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE0KVxuXHR2YXIgZXh0ZW5kID0gbGFuZy5leHRlbmRcblxuXHRleHRlbmQoZXhwb3J0cywgbGFuZylcblx0ZXh0ZW5kKGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18oMTUpKVxuXHRleHRlbmQoZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXygxNikpXG5cdGV4dGVuZChleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKDE3KSlcblx0ZXh0ZW5kKGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18oMTgpKVxuXG4vKioqLyB9LFxuLyogMiAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBtZXJnZU9wdGlvbnMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE5KVxuXG5cdC8qKlxuXHQgKiBFeHBvc2UgdXNlZnVsIGludGVybmFsc1xuXHQgKi9cblxuXHRleHBvcnRzLnV0aWwgICAgICAgPSBfXG5cdGV4cG9ydHMubmV4dFRpY2sgICA9IF8ubmV4dFRpY2tcblx0ZXhwb3J0cy5jb25maWcgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMClcblxuXHQvKipcblx0ICogRWFjaCBpbnN0YW5jZSBjb25zdHJ1Y3RvciwgaW5jbHVkaW5nIFZ1ZSwgaGFzIGEgdW5pcXVlXG5cdCAqIGNpZC4gVGhpcyBlbmFibGVzIHVzIHRvIGNyZWF0ZSB3cmFwcGVkIFwiY2hpbGRcblx0ICogY29uc3RydWN0b3JzXCIgZm9yIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UgYW5kIGNhY2hlIHRoZW0uXG5cdCAqL1xuXG5cdGV4cG9ydHMuY2lkID0gMFxuXHR2YXIgY2lkID0gMVxuXG5cdC8qKlxuXHQgKiBDbGFzcyBpbmVocml0YW5jZVxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXh0ZW5kT3B0aW9uc1xuXHQgKi9cblxuXHRleHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uIChleHRlbmRPcHRpb25zKSB7XG5cdCAgZXh0ZW5kT3B0aW9ucyA9IGV4dGVuZE9wdGlvbnMgfHwge31cblx0ICB2YXIgU3VwZXIgPSB0aGlzXG5cdCAgdmFyIFN1YiA9IGNyZWF0ZUNsYXNzKGV4dGVuZE9wdGlvbnMubmFtZSB8fCAnVnVlQ29tcG9uZW50Jylcblx0ICBTdWIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdXBlci5wcm90b3R5cGUpXG5cdCAgU3ViLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN1YlxuXHQgIFN1Yi5jaWQgPSBjaWQrK1xuXHQgIFN1Yi5vcHRpb25zID0gbWVyZ2VPcHRpb25zKFxuXHQgICAgU3VwZXIub3B0aW9ucyxcblx0ICAgIGV4dGVuZE9wdGlvbnNcblx0ICApXG5cdCAgU3ViWydzdXBlciddID0gU3VwZXJcblx0ICAvLyBhbGxvdyBmdXJ0aGVyIGV4dGVuc2lvblxuXHQgIFN1Yi5leHRlbmQgPSBTdXBlci5leHRlbmRcblx0ICAvLyBjcmVhdGUgYXNzZXQgcmVnaXN0ZXJzLCBzbyBleHRlbmRlZCBjbGFzc2VzXG5cdCAgLy8gY2FuIGhhdmUgdGhlaXIgcHJpdmF0ZSBhc3NldHMgdG9vLlxuXHQgIGNyZWF0ZUFzc2V0UmVnaXN0ZXJzKFN1Yilcblx0ICByZXR1cm4gU3ViXG5cdH1cblxuXHQvKipcblx0ICogQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBzdWItY2xhc3MgY29uc3RydWN0b3Igd2l0aCB0aGVcblx0ICogZ2l2ZW4gbmFtZS4gVGhpcyBnaXZlcyB1cyBtdWNoIG5pY2VyIG91dHB1dCB3aGVuXG5cdCAqIGxvZ2dpbmcgaW5zdGFuY2VzIGluIHRoZSBjb25zb2xlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbn1cblx0ICovXG5cblx0ZnVuY3Rpb24gY3JlYXRlQ2xhc3MgKG5hbWUpIHtcblx0ICByZXR1cm4gbmV3IEZ1bmN0aW9uKFxuXHQgICAgJ3JldHVybiBmdW5jdGlvbiAnICsgXy5jYW1lbGl6ZShuYW1lLCB0cnVlKSArXG5cdCAgICAnIChvcHRpb25zKSB7IHRoaXMuX2luaXQob3B0aW9ucykgfSdcblx0ICApKClcblx0fVxuXG5cdC8qKlxuXHQgKiBQbHVnaW4gc3lzdGVtXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW5cblx0ICovXG5cblx0ZXhwb3J0cy51c2UgPSBmdW5jdGlvbiAocGx1Z2luKSB7XG5cdCAgLy8gYWRkaXRpb25hbCBwYXJhbWV0ZXJzXG5cdCAgdmFyIGFyZ3MgPSBfLnRvQXJyYXkoYXJndW1lbnRzLCAxKVxuXHQgIGFyZ3MudW5zaGlmdCh0aGlzKVxuXHQgIGlmICh0eXBlb2YgcGx1Z2luLmluc3RhbGwgPT09ICdmdW5jdGlvbicpIHtcblx0ICAgIHBsdWdpbi5pbnN0YWxsLmFwcGx5KHBsdWdpbiwgYXJncylcblx0ICB9IGVsc2Uge1xuXHQgICAgcGx1Z2luLmFwcGx5KG51bGwsIGFyZ3MpXG5cdCAgfVxuXHQgIHJldHVybiB0aGlzXG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lIGFzc2V0IHJlZ2lzdHJhdGlvbiBtZXRob2RzIG9uIGEgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IENvbnN0cnVjdG9yXG5cdCAqL1xuXG5cdHZhciBhc3NldFR5cGVzID0gW1xuXHQgICdkaXJlY3RpdmUnLFxuXHQgICdmaWx0ZXInLFxuXHQgICdwYXJ0aWFsJyxcblx0ICAndHJhbnNpdGlvbidcblx0XVxuXG5cdGZ1bmN0aW9uIGNyZWF0ZUFzc2V0UmVnaXN0ZXJzIChDb25zdHJ1Y3Rvcikge1xuXG5cdCAgLyogQXNzZXQgcmVnaXN0cmF0aW9uIG1ldGhvZHMgc2hhcmUgdGhlIHNhbWUgc2lnbmF0dXJlOlxuXHQgICAqXG5cdCAgICogQHBhcmFtIHtTdHJpbmd9IGlkXG5cdCAgICogQHBhcmFtIHsqfSBkZWZpbml0aW9uXG5cdCAgICovXG5cblx0ICBhc3NldFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcblx0ICAgIENvbnN0cnVjdG9yW3R5cGVdID0gZnVuY3Rpb24gKGlkLCBkZWZpbml0aW9uKSB7XG5cdCAgICAgIGlmICghZGVmaW5pdGlvbikge1xuXHQgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbdHlwZSArICdzJ11baWRdXG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgdGhpcy5vcHRpb25zW3R5cGUgKyAncyddW2lkXSA9IGRlZmluaXRpb25cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH0pXG5cblx0ICAvKipcblx0ICAgKiBDb21wb25lbnQgcmVnaXN0cmF0aW9uIG5lZWRzIHRvIGF1dG9tYXRpY2FsbHkgaW52b2tlXG5cdCAgICogVnVlLmV4dGVuZCBvbiBvYmplY3QgdmFsdWVzLlxuXHQgICAqXG5cdCAgICogQHBhcmFtIHtTdHJpbmd9IGlkXG5cdCAgICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IGRlZmluaXRpb25cblx0ICAgKi9cblxuXHQgIENvbnN0cnVjdG9yLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChpZCwgZGVmaW5pdGlvbikge1xuXHQgICAgaWYgKCFkZWZpbml0aW9uKSB7XG5cdCAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY29tcG9uZW50c1tpZF1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGlmIChfLmlzUGxhaW5PYmplY3QoZGVmaW5pdGlvbikpIHtcblx0ICAgICAgICBkZWZpbml0aW9uLm5hbWUgPSBpZFxuXHQgICAgICAgIGRlZmluaXRpb24gPSBfLlZ1ZS5leHRlbmQoZGVmaW5pdGlvbilcblx0ICAgICAgfVxuXHQgICAgICB0aGlzLm9wdGlvbnMuY29tcG9uZW50c1tpZF0gPSBkZWZpbml0aW9uXG5cdCAgICB9XG5cdCAgfVxuXHR9XG5cblx0Y3JlYXRlQXNzZXRSZWdpc3RlcnMoZXhwb3J0cylcblxuLyoqKi8gfSxcbi8qIDMgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgV2F0Y2hlciA9IF9fd2VicGFja19yZXF1aXJlX18oMjEpXG5cdHZhciBQYXRoID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0MSlcblx0dmFyIHRleHRQYXJzZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQyKVxuXHR2YXIgZGlyUGFyc2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0Mylcblx0dmFyIGV4cFBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNDQpXG5cdHZhciBmaWx0ZXJSRSA9IC9bXnxdXFx8W158XS9cblxuXHQvKipcblx0ICogR2V0IHRoZSB2YWx1ZSBmcm9tIGFuIGV4cHJlc3Npb24gb24gdGhpcyB2bS5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuXHQgKiBAcmV0dXJuIHsqfVxuXHQgKi9cblxuXHRleHBvcnRzLiRnZXQgPSBmdW5jdGlvbiAoZXhwKSB7XG5cdCAgdmFyIHJlcyA9IGV4cFBhcnNlci5wYXJzZShleHApXG5cdCAgaWYgKHJlcykge1xuXHQgICAgcmV0dXJuIHJlcy5nZXQuY2FsbCh0aGlzLCB0aGlzKVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIHZhbHVlIGZyb20gYW4gZXhwcmVzc2lvbiBvbiB0aGlzIHZtLlxuXHQgKiBUaGUgZXhwcmVzc2lvbiBtdXN0IGJlIGEgdmFsaWQgbGVmdC1oYW5kXG5cdCAqIGV4cHJlc3Npb24gaW4gYW4gYXNzaWdubWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuXHQgKiBAcGFyYW0geyp9IHZhbFxuXHQgKi9cblxuXHRleHBvcnRzLiRzZXQgPSBmdW5jdGlvbiAoZXhwLCB2YWwpIHtcblx0ICB2YXIgcmVzID0gZXhwUGFyc2VyLnBhcnNlKGV4cCwgdHJ1ZSlcblx0ICBpZiAocmVzICYmIHJlcy5zZXQpIHtcblx0ICAgIHJlcy5zZXQuY2FsbCh0aGlzLCB0aGlzLCB2YWwpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhIHByb3BlcnR5IG9uIHRoZSBWTVxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7Kn0gdmFsXG5cdCAqL1xuXG5cdGV4cG9ydHMuJGFkZCA9IGZ1bmN0aW9uIChrZXksIHZhbCkge1xuXHQgIHRoaXMuX2RhdGEuJGFkZChrZXksIHZhbClcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGUgYSBwcm9wZXJ0eSBvbiB0aGUgVk1cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleVxuXHQgKi9cblxuXHRleHBvcnRzLiRkZWxldGUgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdCAgdGhpcy5fZGF0YS4kZGVsZXRlKGtleSlcblx0fVxuXG5cdC8qKlxuXHQgKiBXYXRjaCBhbiBleHByZXNzaW9uLCB0cmlnZ2VyIGNhbGxiYWNrIHdoZW4gaXRzXG5cdCAqIHZhbHVlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBleHBcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2Jcblx0ICogQHBhcmFtIHtCb29sZWFufSBbZGVlcF1cblx0ICogQHBhcmFtIHtCb29sZWFufSBbaW1tZWRpYXRlXVxuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbn0gLSB1bndhdGNoRm5cblx0ICovXG5cblx0ZXhwb3J0cy4kd2F0Y2ggPSBmdW5jdGlvbiAoZXhwLCBjYiwgZGVlcCwgaW1tZWRpYXRlKSB7XG5cdCAgdmFyIHZtID0gdGhpc1xuXHQgIHZhciBrZXkgPSBkZWVwID8gZXhwICsgJyoqZGVlcCoqJyA6IGV4cFxuXHQgIHZhciB3YXRjaGVyID0gdm0uX3VzZXJXYXRjaGVyc1trZXldXG5cdCAgdmFyIHdyYXBwZWRDYiA9IGZ1bmN0aW9uICh2YWwsIG9sZFZhbCkge1xuXHQgICAgY2IuY2FsbCh2bSwgdmFsLCBvbGRWYWwpXG5cdCAgfVxuXHQgIGlmICghd2F0Y2hlcikge1xuXHQgICAgd2F0Y2hlciA9IHZtLl91c2VyV2F0Y2hlcnNba2V5XSA9XG5cdCAgICAgIG5ldyBXYXRjaGVyKHZtLCBleHAsIHdyYXBwZWRDYiwgbnVsbCwgZmFsc2UsIGRlZXApXG5cdCAgfSBlbHNlIHtcblx0ICAgIHdhdGNoZXIuYWRkQ2Iod3JhcHBlZENiKVxuXHQgIH1cblx0ICBpZiAoaW1tZWRpYXRlKSB7XG5cdCAgICB3cmFwcGVkQ2Iod2F0Y2hlci52YWx1ZSlcblx0ICB9XG5cdCAgcmV0dXJuIGZ1bmN0aW9uIHVud2F0Y2hGbiAoKSB7XG5cdCAgICB3YXRjaGVyLnJlbW92ZUNiKHdyYXBwZWRDYilcblx0ICAgIGlmICghd2F0Y2hlci5hY3RpdmUpIHtcblx0ICAgICAgdm0uX3VzZXJXYXRjaGVyc1trZXldID0gbnVsbFxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFdmFsdWF0ZSBhIHRleHQgZGlyZWN0aXZlLCBpbmNsdWRpbmcgZmlsdGVycy5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHRcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblxuXHRleHBvcnRzLiRldmFsID0gZnVuY3Rpb24gKHRleHQpIHtcblx0ICAvLyBjaGVjayBmb3IgZmlsdGVycy5cblx0ICBpZiAoZmlsdGVyUkUudGVzdCh0ZXh0KSkge1xuXHQgICAgdmFyIGRpciA9IGRpclBhcnNlci5wYXJzZSh0ZXh0KVswXVxuXHQgICAgLy8gdGhlIGZpbHRlciByZWdleCBjaGVjayBtaWdodCBnaXZlIGZhbHNlIHBvc2l0aXZlXG5cdCAgICAvLyBmb3IgcGlwZXMgaW5zaWRlIHN0cmluZ3MsIHNvIGl0J3MgcG9zc2libGUgdGhhdFxuXHQgICAgLy8gd2UgZG9uJ3QgZ2V0IGFueSBmaWx0ZXJzIGhlcmVcblx0ICAgIHJldHVybiBkaXIuZmlsdGVyc1xuXHQgICAgICA/IF8uYXBwbHlGaWx0ZXJzKFxuXHQgICAgICAgICAgdGhpcy4kZ2V0KGRpci5leHByZXNzaW9uKSxcblx0ICAgICAgICAgIF8ucmVzb2x2ZUZpbHRlcnModGhpcywgZGlyLmZpbHRlcnMpLnJlYWQsXG5cdCAgICAgICAgICB0aGlzXG5cdCAgICAgICAgKVxuXHQgICAgICA6IHRoaXMuJGdldChkaXIuZXhwcmVzc2lvbilcblx0ICB9IGVsc2Uge1xuXHQgICAgLy8gbm8gZmlsdGVyXG5cdCAgICByZXR1cm4gdGhpcy4kZ2V0KHRleHQpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIEludGVycG9sYXRlIGEgcGllY2Ugb2YgdGVtcGxhdGUgdGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHRcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblxuXHRleHBvcnRzLiRpbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uICh0ZXh0KSB7XG5cdCAgdmFyIHRva2VucyA9IHRleHRQYXJzZXIucGFyc2UodGV4dClcblx0ICB2YXIgdm0gPSB0aGlzXG5cdCAgaWYgKHRva2Vucykge1xuXHQgICAgcmV0dXJuIHRva2Vucy5sZW5ndGggPT09IDFcblx0ICAgICAgPyB2bS4kZXZhbCh0b2tlbnNbMF0udmFsdWUpXG5cdCAgICAgIDogdG9rZW5zLm1hcChmdW5jdGlvbiAodG9rZW4pIHtcblx0ICAgICAgICAgIHJldHVybiB0b2tlbi50YWdcblx0ICAgICAgICAgICAgPyB2bS4kZXZhbCh0b2tlbi52YWx1ZSlcblx0ICAgICAgICAgICAgOiB0b2tlbi52YWx1ZVxuXHQgICAgICAgIH0pLmpvaW4oJycpXG5cdCAgfSBlbHNlIHtcblx0ICAgIHJldHVybiB0ZXh0XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIExvZyBpbnN0YW5jZSBkYXRhIGFzIGEgcGxhaW4gSlMgb2JqZWN0XG5cdCAqIHNvIHRoYXQgaXQgaXMgZWFzaWVyIHRvIGluc3BlY3QgaW4gY29uc29sZS5cblx0ICogVGhpcyBtZXRob2QgYXNzdW1lcyBjb25zb2xlIGlzIGF2YWlsYWJsZS5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IFtwYXRoXVxuXHQgKi9cblxuXHRleHBvcnRzLiRsb2cgPSBmdW5jdGlvbiAocGF0aCkge1xuXHQgIHZhciBkYXRhID0gcGF0aFxuXHQgICAgPyBQYXRoLmdldCh0aGlzLCBwYXRoKVxuXHQgICAgOiB0aGlzLl9kYXRhXG5cdCAgY29uc29sZS5sb2coSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkYXRhKSkpXG5cdH1cblxuLyoqKi8gfSxcbi8qIDQgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgdHJhbnNpdGlvbiA9IF9fd2VicGFja19yZXF1aXJlX18oNDUpXG5cblx0LyoqXG5cdCAqIEFwcGVuZCBpbnN0YW5jZSB0byB0YXJnZXRcblx0ICpcblx0ICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG5cdCAqL1xuXG5cdGV4cG9ydHMuJGFwcGVuZFRvID0gZnVuY3Rpb24gKHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uKSB7XG5cdCAgdGFyZ2V0ID0gcXVlcnkodGFyZ2V0KVxuXHQgIHZhciB0YXJnZXRJc0RldGFjaGVkID0gIV8uaW5Eb2ModGFyZ2V0KVxuXHQgIHZhciBvcCA9IHdpdGhUcmFuc2l0aW9uID09PSBmYWxzZSB8fCB0YXJnZXRJc0RldGFjaGVkXG5cdCAgICA/IGFwcGVuZFxuXHQgICAgOiB0cmFuc2l0aW9uLmFwcGVuZFxuXHQgIGluc2VydCh0aGlzLCB0YXJnZXQsIG9wLCB0YXJnZXRJc0RldGFjaGVkLCBjYilcblx0ICByZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqIFByZXBlbmQgaW5zdGFuY2UgdG8gdGFyZ2V0XG5cdCAqXG5cdCAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cblx0ICogQHBhcmFtIHtCb29sZWFufSBbd2l0aFRyYW5zaXRpb25dIC0gZGVmYXVsdHMgdG8gdHJ1ZVxuXHQgKi9cblxuXHRleHBvcnRzLiRwcmVwZW5kVG8gPSBmdW5jdGlvbiAodGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24pIHtcblx0ICB0YXJnZXQgPSBxdWVyeSh0YXJnZXQpXG5cdCAgaWYgKHRhcmdldC5oYXNDaGlsZE5vZGVzKCkpIHtcblx0ICAgIHRoaXMuJGJlZm9yZSh0YXJnZXQuZmlyc3RDaGlsZCwgY2IsIHdpdGhUcmFuc2l0aW9uKVxuXHQgIH0gZWxzZSB7XG5cdCAgICB0aGlzLiRhcHBlbmRUbyh0YXJnZXQsIGNiLCB3aXRoVHJhbnNpdGlvbilcblx0ICB9XG5cdCAgcmV0dXJuIHRoaXNcblx0fVxuXG5cdC8qKlxuXHQgKiBJbnNlcnQgaW5zdGFuY2UgYmVmb3JlIHRhcmdldFxuXHQgKlxuXHQgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gW3dpdGhUcmFuc2l0aW9uXSAtIGRlZmF1bHRzIHRvIHRydWVcblx0ICovXG5cblx0ZXhwb3J0cy4kYmVmb3JlID0gZnVuY3Rpb24gKHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uKSB7XG5cdCAgdGFyZ2V0ID0gcXVlcnkodGFyZ2V0KVxuXHQgIHZhciB0YXJnZXRJc0RldGFjaGVkID0gIV8uaW5Eb2ModGFyZ2V0KVxuXHQgIHZhciBvcCA9IHdpdGhUcmFuc2l0aW9uID09PSBmYWxzZSB8fCB0YXJnZXRJc0RldGFjaGVkXG5cdCAgICA/IGJlZm9yZVxuXHQgICAgOiB0cmFuc2l0aW9uLmJlZm9yZVxuXHQgIGluc2VydCh0aGlzLCB0YXJnZXQsIG9wLCB0YXJnZXRJc0RldGFjaGVkLCBjYilcblx0ICByZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqIEluc2VydCBpbnN0YW5jZSBhZnRlciB0YXJnZXRcblx0ICpcblx0ICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG5cdCAqL1xuXG5cdGV4cG9ydHMuJGFmdGVyID0gZnVuY3Rpb24gKHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uKSB7XG5cdCAgdGFyZ2V0ID0gcXVlcnkodGFyZ2V0KVxuXHQgIGlmICh0YXJnZXQubmV4dFNpYmxpbmcpIHtcblx0ICAgIHRoaXMuJGJlZm9yZSh0YXJnZXQubmV4dFNpYmxpbmcsIGNiLCB3aXRoVHJhbnNpdGlvbilcblx0ICB9IGVsc2Uge1xuXHQgICAgdGhpcy4kYXBwZW5kVG8odGFyZ2V0LnBhcmVudE5vZGUsIGNiLCB3aXRoVHJhbnNpdGlvbilcblx0ICB9XG5cdCAgcmV0dXJuIHRoaXNcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgaW5zdGFuY2UgZnJvbSBET01cblx0ICpcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG5cdCAqL1xuXG5cdGV4cG9ydHMuJHJlbW92ZSA9IGZ1bmN0aW9uIChjYiwgd2l0aFRyYW5zaXRpb24pIHtcblx0ICB2YXIgaW5Eb2MgPSB0aGlzLl9pc0F0dGFjaGVkICYmIF8uaW5Eb2ModGhpcy4kZWwpXG5cdCAgLy8gaWYgd2UgYXJlIG5vdCBpbiBkb2N1bWVudCwgbm8gbmVlZCB0byBjaGVja1xuXHQgIC8vIGZvciB0cmFuc2l0aW9uc1xuXHQgIGlmICghaW5Eb2MpIHdpdGhUcmFuc2l0aW9uID0gZmFsc2Vcblx0ICB2YXIgb3Bcblx0ICB2YXIgc2VsZiA9IHRoaXNcblx0ICB2YXIgcmVhbENiID0gZnVuY3Rpb24gKCkge1xuXHQgICAgaWYgKGluRG9jKSBzZWxmLl9jYWxsSG9vaygnZGV0YWNoZWQnKVxuXHQgICAgaWYgKGNiKSBjYigpXG5cdCAgfVxuXHQgIGlmIChcblx0ICAgIHRoaXMuX2lzQmxvY2sgJiZcblx0ICAgICF0aGlzLl9ibG9ja0ZyYWdtZW50Lmhhc0NoaWxkTm9kZXMoKVxuXHQgICkge1xuXHQgICAgb3AgPSB3aXRoVHJhbnNpdGlvbiA9PT0gZmFsc2Vcblx0ICAgICAgPyBhcHBlbmRcblx0ICAgICAgOiB0cmFuc2l0aW9uLnJlbW92ZVRoZW5BcHBlbmQgXG5cdCAgICBibG9ja09wKHRoaXMsIHRoaXMuX2Jsb2NrRnJhZ21lbnQsIG9wLCByZWFsQ2IpXG5cdCAgfSBlbHNlIHtcblx0ICAgIG9wID0gd2l0aFRyYW5zaXRpb24gPT09IGZhbHNlXG5cdCAgICAgID8gcmVtb3ZlXG5cdCAgICAgIDogdHJhbnNpdGlvbi5yZW1vdmVcblx0ICAgIG9wKHRoaXMuJGVsLCB0aGlzLCByZWFsQ2IpXG5cdCAgfVxuXHQgIHJldHVybiB0aGlzXG5cdH1cblxuXHQvKipcblx0ICogU2hhcmVkIERPTSBpbnNlcnRpb24gZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcFxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHRhcmdldElzRGV0YWNoZWRcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuXHQgKi9cblxuXHRmdW5jdGlvbiBpbnNlcnQgKHZtLCB0YXJnZXQsIG9wLCB0YXJnZXRJc0RldGFjaGVkLCBjYikge1xuXHQgIHZhciBzaG91bGRDYWxsSG9vayA9XG5cdCAgICAhdGFyZ2V0SXNEZXRhY2hlZCAmJlxuXHQgICAgIXZtLl9pc0F0dGFjaGVkICYmXG5cdCAgICAhXy5pbkRvYyh2bS4kZWwpXG5cdCAgaWYgKHZtLl9pc0Jsb2NrKSB7XG5cdCAgICBibG9ja09wKHZtLCB0YXJnZXQsIG9wLCBjYilcblx0ICB9IGVsc2Uge1xuXHQgICAgb3Aodm0uJGVsLCB0YXJnZXQsIHZtLCBjYilcblx0ICB9XG5cdCAgaWYgKHNob3VsZENhbGxIb29rKSB7XG5cdCAgICB2bS5fY2FsbEhvb2soJ2F0dGFjaGVkJylcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogRXhlY3V0ZSBhIHRyYW5zaXRpb24gb3BlcmF0aW9uIG9uIGEgYmxvY2sgaW5zdGFuY2UsXG5cdCAqIGl0ZXJhdGluZyB0aHJvdWdoIGFsbCBpdHMgYmxvY2sgbm9kZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuXHQgKi9cblxuXHRmdW5jdGlvbiBibG9ja09wICh2bSwgdGFyZ2V0LCBvcCwgY2IpIHtcblx0ICB2YXIgY3VycmVudCA9IHZtLl9ibG9ja1N0YXJ0XG5cdCAgdmFyIGVuZCA9IHZtLl9ibG9ja0VuZFxuXHQgIHZhciBuZXh0XG5cdCAgd2hpbGUgKG5leHQgIT09IGVuZCkge1xuXHQgICAgbmV4dCA9IGN1cnJlbnQubmV4dFNpYmxpbmdcblx0ICAgIG9wKGN1cnJlbnQsIHRhcmdldCwgdm0pXG5cdCAgICBjdXJyZW50ID0gbmV4dFxuXHQgIH1cblx0ICBvcChlbmQsIHRhcmdldCwgdm0sIGNiKVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGZvciBzZWxlY3RvcnNcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gZWxcblx0ICovXG5cblx0ZnVuY3Rpb24gcXVlcnkgKGVsKSB7XG5cdCAgcmV0dXJuIHR5cGVvZiBlbCA9PT0gJ3N0cmluZydcblx0ICAgID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbClcblx0ICAgIDogZWxcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBlbmQgb3BlcmF0aW9uIHRoYXQgdGFrZXMgYSBjYWxsYmFjay5cblx0ICpcblx0ICogQHBhcmFtIHtOb2RlfSBlbFxuXHQgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuXHQgKiBAcGFyYW0ge1Z1ZX0gdm0gLSB1bnVzZWRcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuXHQgKi9cblxuXHRmdW5jdGlvbiBhcHBlbmQgKGVsLCB0YXJnZXQsIHZtLCBjYikge1xuXHQgIHRhcmdldC5hcHBlbmRDaGlsZChlbClcblx0ICBpZiAoY2IpIGNiKClcblx0fVxuXG5cdC8qKlxuXHQgKiBJbnNlcnRCZWZvcmUgb3BlcmF0aW9uIHRoYXQgdGFrZXMgYSBjYWxsYmFjay5cblx0ICpcblx0ICogQHBhcmFtIHtOb2RlfSBlbFxuXHQgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuXHQgKiBAcGFyYW0ge1Z1ZX0gdm0gLSB1bnVzZWRcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuXHQgKi9cblxuXHRmdW5jdGlvbiBiZWZvcmUgKGVsLCB0YXJnZXQsIHZtLCBjYikge1xuXHQgIF8uYmVmb3JlKGVsLCB0YXJnZXQpXG5cdCAgaWYgKGNiKSBjYigpXG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlIG9wZXJhdGlvbiB0aGF0IHRha2VzIGEgY2FsbGJhY2suXG5cdCAqXG5cdCAqIEBwYXJhbSB7Tm9kZX0gZWxcblx0ICogQHBhcmFtIHtWdWV9IHZtIC0gdW51c2VkXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cblx0ICovXG5cblx0ZnVuY3Rpb24gcmVtb3ZlIChlbCwgdm0sIGNiKSB7XG5cdCAgXy5yZW1vdmUoZWwpXG5cdCAgaWYgKGNiKSBjYigpXG5cdH1cblxuLyoqKi8gfSxcbi8qIDUgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXG5cdC8qKlxuXHQgKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cblx0ICovXG5cblx0ZXhwb3J0cy4kb24gPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG5cdCAgKHRoaXMuX2V2ZW50c1tldmVudF0gfHwgKHRoaXMuX2V2ZW50c1tldmVudF0gPSBbXSkpXG5cdCAgICAucHVzaChmbilcblx0ICBtb2RpZnlMaXN0ZW5lckNvdW50KHRoaXMsIGV2ZW50LCAxKVxuXHQgIHJldHVybiB0aGlzXG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG5cdCAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuXHQgKi9cblxuXHRleHBvcnRzLiRvbmNlID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuXHQgIHZhciBzZWxmID0gdGhpc1xuXHQgIGZ1bmN0aW9uIG9uICgpIHtcblx0ICAgIHNlbGYuJG9mZihldmVudCwgb24pXG5cdCAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG5cdCAgfVxuXHQgIG9uLmZuID0gZm5cblx0ICB0aGlzLiRvbihldmVudCwgb24pXG5cdCAgcmV0dXJuIHRoaXNcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuXHQgKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG5cdCAqL1xuXG5cdGV4cG9ydHMuJG9mZiA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcblx0ICB2YXIgY2JzXG5cdCAgLy8gYWxsXG5cdCAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG5cdCAgICBpZiAodGhpcy4kcGFyZW50KSB7XG5cdCAgICAgIGZvciAoZXZlbnQgaW4gdGhpcy5fZXZlbnRzKSB7XG5cdCAgICAgICAgY2JzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuXHQgICAgICAgIGlmIChjYnMpIHtcblx0ICAgICAgICAgIG1vZGlmeUxpc3RlbmVyQ291bnQodGhpcywgZXZlbnQsIC1jYnMubGVuZ3RoKVxuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgICAgdGhpcy5fZXZlbnRzID0ge31cblx0ICAgIHJldHVybiB0aGlzXG5cdCAgfVxuXHQgIC8vIHNwZWNpZmljIGV2ZW50XG5cdCAgY2JzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuXHQgIGlmICghY2JzKSB7XG5cdCAgICByZXR1cm4gdGhpc1xuXHQgIH1cblx0ICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHQgICAgbW9kaWZ5TGlzdGVuZXJDb3VudCh0aGlzLCBldmVudCwgLWNicy5sZW5ndGgpXG5cdCAgICB0aGlzLl9ldmVudHNbZXZlbnRdID0gbnVsbFxuXHQgICAgcmV0dXJuIHRoaXNcblx0ICB9XG5cdCAgLy8gc3BlY2lmaWMgaGFuZGxlclxuXHQgIHZhciBjYlxuXHQgIHZhciBpID0gY2JzLmxlbmd0aFxuXHQgIHdoaWxlIChpLS0pIHtcblx0ICAgIGNiID0gY2JzW2ldXG5cdCAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuXHQgICAgICBtb2RpZnlMaXN0ZW5lckNvdW50KHRoaXMsIGV2ZW50LCAtMSlcblx0ICAgICAgY2JzLnNwbGljZShpLCAxKVxuXHQgICAgICBicmVha1xuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXIgYW4gZXZlbnQgb24gc2VsZi5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG5cdCAqL1xuXG5cdGV4cG9ydHMuJGVtaXQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0ICB0aGlzLl9ldmVudENhbmNlbGxlZCA9IGZhbHNlXG5cdCAgdmFyIGNicyA9IHRoaXMuX2V2ZW50c1tldmVudF1cblx0ICBpZiAoY2JzKSB7XG5cdCAgICAvLyBhdm9pZCBsZWFraW5nIGFyZ3VtZW50czpcblx0ICAgIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2Nsb3N1cmUtd2l0aC1hcmd1bWVudHNcblx0ICAgIHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDFcblx0ICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGkpXG5cdCAgICB3aGlsZSAoaS0tKSB7XG5cdCAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDFdXG5cdCAgICB9XG5cdCAgICBpID0gMFxuXHQgICAgY2JzID0gY2JzLmxlbmd0aCA+IDFcblx0ICAgICAgPyBfLnRvQXJyYXkoY2JzKVxuXHQgICAgICA6IGNic1xuXHQgICAgZm9yICh2YXIgbCA9IGNicy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0ICAgICAgaWYgKGNic1tpXS5hcHBseSh0aGlzLCBhcmdzKSA9PT0gZmFsc2UpIHtcblx0ICAgICAgICB0aGlzLl9ldmVudENhbmNlbGxlZCA9IHRydWVcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlY3Vyc2l2ZWx5IGJyb2FkY2FzdCBhbiBldmVudCB0byBhbGwgY2hpbGRyZW4gaW5zdGFuY2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcblx0ICogQHBhcmFtIHsuLi4qfSBhZGRpdGlvbmFsIGFyZ3VtZW50c1xuXHQgKi9cblxuXHRleHBvcnRzLiRicm9hZGNhc3QgPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0ICAvLyBpZiBubyBjaGlsZCBoYXMgcmVnaXN0ZXJlZCBmb3IgdGhpcyBldmVudCxcblx0ICAvLyB0aGVuIHRoZXJlJ3Mgbm8gbmVlZCB0byBicm9hZGNhc3QuXG5cdCAgaWYgKCF0aGlzLl9ldmVudHNDb3VudFtldmVudF0pIHJldHVyblxuXHQgIHZhciBjaGlsZHJlbiA9IHRoaXMuX2NoaWxkcmVuXG5cdCAgaWYgKGNoaWxkcmVuKSB7XG5cdCAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHQgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHQgICAgICBjaGlsZC4kZW1pdC5hcHBseShjaGlsZCwgYXJndW1lbnRzKVxuXHQgICAgICBpZiAoIWNoaWxkLl9ldmVudENhbmNlbGxlZCkge1xuXHQgICAgICAgIGNoaWxkLiRicm9hZGNhc3QuYXBwbHkoY2hpbGQsIGFyZ3VtZW50cylcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlY3Vyc2l2ZWx5IHByb3BhZ2F0ZSBhbiBldmVudCB1cCB0aGUgcGFyZW50IGNoYWluLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcblx0ICogQHBhcmFtIHsuLi4qfSBhZGRpdGlvbmFsIGFyZ3VtZW50c1xuXHQgKi9cblxuXHRleHBvcnRzLiRkaXNwYXRjaCA9IGZ1bmN0aW9uICgpIHtcblx0ICB2YXIgcGFyZW50ID0gdGhpcy4kcGFyZW50XG5cdCAgd2hpbGUgKHBhcmVudCkge1xuXHQgICAgcGFyZW50LiRlbWl0LmFwcGx5KHBhcmVudCwgYXJndW1lbnRzKVxuXHQgICAgcGFyZW50ID0gcGFyZW50Ll9ldmVudENhbmNlbGxlZFxuXHQgICAgICA/IG51bGxcblx0ICAgICAgOiBwYXJlbnQuJHBhcmVudFxuXHQgIH1cblx0ICByZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vZGlmeSB0aGUgbGlzdGVuZXIgY291bnRzIG9uIGFsbCBwYXJlbnRzLlxuXHQgKiBUaGlzIGJvb2trZWVwaW5nIGFsbG93cyAkYnJvYWRjYXN0IHRvIHJldHVybiBlYXJseSB3aGVuXG5cdCAqIG5vIGNoaWxkIGhhcyBsaXN0ZW5lZCB0byBhIGNlcnRhaW4gZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50XG5cdCAqL1xuXG5cdHZhciBob29rUkUgPSAvXmhvb2s6L1xuXHRmdW5jdGlvbiBtb2RpZnlMaXN0ZW5lckNvdW50ICh2bSwgZXZlbnQsIGNvdW50KSB7XG5cdCAgdmFyIHBhcmVudCA9IHZtLiRwYXJlbnRcblx0ICAvLyBob29rcyBkbyBub3QgZ2V0IGJyb2FkY2FzdGVkIHNvIG5vIG5lZWRcblx0ICAvLyB0byBkbyBib29ra2VlcGluZyBmb3IgdGhlbVxuXHQgIGlmICghcGFyZW50IHx8ICFjb3VudCB8fCBob29rUkUudGVzdChldmVudCkpIHJldHVyblxuXHQgIHdoaWxlIChwYXJlbnQpIHtcblx0ICAgIHBhcmVudC5fZXZlbnRzQ291bnRbZXZlbnRdID1cblx0ICAgICAgKHBhcmVudC5fZXZlbnRzQ291bnRbZXZlbnRdIHx8IDApICsgY291bnRcblx0ICAgIHBhcmVudCA9IHBhcmVudC4kcGFyZW50XG5cdCAgfVxuXHR9XG5cbi8qKiovIH0sXG4vKiA2ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgY2hpbGQgaW5zdGFuY2UgdGhhdCBwcm90b3R5cGFsbHkgaW5laHJpdHNcblx0ICogZGF0YSBvbiBwYXJlbnQuIFRvIGFjaGlldmUgdGhhdCB3ZSBjcmVhdGUgYW4gaW50ZXJtZWRpYXRlXG5cdCAqIGNvbnN0cnVjdG9yIHdpdGggaXRzIHByb3RvdHlwZSBwb2ludGluZyB0byBwYXJlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtCYXNlQ3Rvcl1cblx0ICogQHJldHVybiB7VnVlfVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXG5cdGV4cG9ydHMuJGFkZENoaWxkID0gZnVuY3Rpb24gKG9wdHMsIEJhc2VDdG9yKSB7XG5cdCAgQmFzZUN0b3IgPSBCYXNlQ3RvciB8fCBfLlZ1ZVxuXHQgIG9wdHMgPSBvcHRzIHx8IHt9XG5cdCAgdmFyIHBhcmVudCA9IHRoaXNcblx0ICB2YXIgQ2hpbGRWdWVcblx0ICB2YXIgaW5oZXJpdCA9IG9wdHMuaW5oZXJpdCAhPT0gdW5kZWZpbmVkXG5cdCAgICA/IG9wdHMuaW5oZXJpdFxuXHQgICAgOiBCYXNlQ3Rvci5vcHRpb25zLmluaGVyaXRcblx0ICBpZiAoaW5oZXJpdCkge1xuXHQgICAgdmFyIGN0b3JzID0gcGFyZW50Ll9jaGlsZEN0b3JzXG5cdCAgICBpZiAoIWN0b3JzKSB7XG5cdCAgICAgIGN0b3JzID0gcGFyZW50Ll9jaGlsZEN0b3JzID0ge31cblx0ICAgIH1cblx0ICAgIENoaWxkVnVlID0gY3RvcnNbQmFzZUN0b3IuY2lkXVxuXHQgICAgaWYgKCFDaGlsZFZ1ZSkge1xuXHQgICAgICB2YXIgb3B0aW9uTmFtZSA9IEJhc2VDdG9yLm9wdGlvbnMubmFtZVxuXHQgICAgICB2YXIgY2xhc3NOYW1lID0gb3B0aW9uTmFtZVxuXHQgICAgICAgID8gXy5jYW1lbGl6ZShvcHRpb25OYW1lLCB0cnVlKVxuXHQgICAgICAgIDogJ1Z1ZUNvbXBvbmVudCdcblx0ICAgICAgQ2hpbGRWdWUgPSBuZXcgRnVuY3Rpb24oXG5cdCAgICAgICAgJ3JldHVybiBmdW5jdGlvbiAnICsgY2xhc3NOYW1lICsgJyAob3B0aW9ucykgeycgK1xuXHQgICAgICAgICd0aGlzLmNvbnN0cnVjdG9yID0gJyArIGNsYXNzTmFtZSArICc7JyArXG5cdCAgICAgICAgJ3RoaXMuX2luaXQob3B0aW9ucykgfSdcblx0ICAgICAgKSgpXG5cdCAgICAgIENoaWxkVnVlLm9wdGlvbnMgPSBCYXNlQ3Rvci5vcHRpb25zXG5cdCAgICAgIENoaWxkVnVlLnByb3RvdHlwZSA9IHRoaXNcblx0ICAgICAgY3RvcnNbQmFzZUN0b3IuY2lkXSA9IENoaWxkVnVlXG5cdCAgICB9XG5cdCAgfSBlbHNlIHtcblx0ICAgIENoaWxkVnVlID0gQmFzZUN0b3Jcblx0ICB9XG5cdCAgb3B0cy5fcGFyZW50ID0gcGFyZW50XG5cdCAgb3B0cy5fcm9vdCA9IHBhcmVudC4kcm9vdFxuXHQgIHZhciBjaGlsZCA9IG5ldyBDaGlsZFZ1ZShvcHRzKVxuXHQgIGlmICghdGhpcy5fY2hpbGRyZW4pIHtcblx0ICAgIHRoaXMuX2NoaWxkcmVuID0gW11cblx0ICB9XG5cdCAgdGhpcy5fY2hpbGRyZW4ucHVzaChjaGlsZClcblx0ICByZXR1cm4gY2hpbGRcblx0fVxuXG4vKioqLyB9LFxuLyogNyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBjb21waWxlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0NilcblxuXHQvKipcblx0ICogU2V0IGluc3RhbmNlIHRhcmdldCBlbGVtZW50IGFuZCBraWNrIG9mZiB0aGUgY29tcGlsYXRpb25cblx0ICogcHJvY2Vzcy4gVGhlIHBhc3NlZCBpbiBgZWxgIGNhbiBiZSBhIHNlbGVjdG9yIHN0cmluZywgYW5cblx0ICogZXhpc3RpbmcgRWxlbWVudCwgb3IgYSBEb2N1bWVudEZyYWdtZW50IChmb3IgYmxvY2tcblx0ICogaW5zdGFuY2VzKS5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR8c3RyaW5nfSBlbFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXG5cdGV4cG9ydHMuJG1vdW50ID0gZnVuY3Rpb24gKGVsKSB7XG5cdCAgaWYgKHRoaXMuX2lzQ29tcGlsZWQpIHtcblx0ICAgIF8ud2FybignJG1vdW50KCkgc2hvdWxkIGJlIGNhbGxlZCBvbmx5IG9uY2UuJylcblx0ICAgIHJldHVyblxuXHQgIH1cblx0ICBpZiAoIWVsKSB7XG5cdCAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdCAgfSBlbHNlIGlmICh0eXBlb2YgZWwgPT09ICdzdHJpbmcnKSB7XG5cdCAgICB2YXIgc2VsZWN0b3IgPSBlbFxuXHQgICAgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsKVxuXHQgICAgaWYgKCFlbCkge1xuXHQgICAgICBfLndhcm4oJ0Nhbm5vdCBmaW5kIGVsZW1lbnQ6ICcgKyBzZWxlY3Rvcilcblx0ICAgICAgcmV0dXJuXG5cdCAgICB9XG5cdCAgfVxuXHQgIHRoaXMuX2NvbXBpbGUoZWwpXG5cdCAgdGhpcy5faXNDb21waWxlZCA9IHRydWVcblx0ICB0aGlzLl9jYWxsSG9vaygnY29tcGlsZWQnKVxuXHQgIGlmIChfLmluRG9jKHRoaXMuJGVsKSkge1xuXHQgICAgdGhpcy5fY2FsbEhvb2soJ2F0dGFjaGVkJylcblx0ICAgIHRoaXMuX2luaXRET01Ib29rcygpXG5cdCAgICByZWFkeS5jYWxsKHRoaXMpXG5cdCAgfSBlbHNlIHtcblx0ICAgIHRoaXMuX2luaXRET01Ib29rcygpXG5cdCAgICB0aGlzLiRvbmNlKCdob29rOmF0dGFjaGVkJywgcmVhZHkpXG5cdCAgfVxuXHQgIHJldHVybiB0aGlzXG5cdH1cblxuXHQvKipcblx0ICogTWFyayBhbiBpbnN0YW5jZSBhcyByZWFkeS5cblx0ICovXG5cblx0ZnVuY3Rpb24gcmVhZHkgKCkge1xuXHQgIHRoaXMuX2lzQXR0YWNoZWQgPSB0cnVlXG5cdCAgdGhpcy5faXNSZWFkeSA9IHRydWVcblx0ICB0aGlzLl9jYWxsSG9vaygncmVhZHknKVxuXHR9XG5cblx0LyoqXG5cdCAqIFRlYXJkb3duIGFuIGluc3RhbmNlLCB1bm9ic2VydmVzIHRoZSBkYXRhLCB1bmJpbmQgYWxsIHRoZVxuXHQgKiBkaXJlY3RpdmVzLCB0dXJuIG9mZiBhbGwgdGhlIGV2ZW50IGxpc3RlbmVycywgZXRjLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHJlbW92ZSAtIHdoZXRoZXIgdG8gcmVtb3ZlIHRoZSBET00gbm9kZS5cblx0ICogQHB1YmxpY1xuXHQgKi9cblxuXHRleHBvcnRzLiRkZXN0cm95ID0gZnVuY3Rpb24gKHJlbW92ZSkge1xuXHQgIGlmICh0aGlzLl9pc0JlaW5nRGVzdHJveWVkKSB7XG5cdCAgICByZXR1cm5cblx0ICB9XG5cdCAgdGhpcy5fY2FsbEhvb2soJ2JlZm9yZURlc3Ryb3knKVxuXHQgIHRoaXMuX2lzQmVpbmdEZXN0cm95ZWQgPSB0cnVlXG5cdCAgdmFyIGlcblx0ICAvLyByZW1vdmUgc2VsZiBmcm9tIHBhcmVudC4gb25seSBuZWNlc3Nhcnlcblx0ICAvLyBpZiBwYXJlbnQgaXMgbm90IGJlaW5nIGRlc3Ryb3llZCBhcyB3ZWxsLlxuXHQgIHZhciBwYXJlbnQgPSB0aGlzLiRwYXJlbnRcblx0ICBpZiAocGFyZW50ICYmICFwYXJlbnQuX2lzQmVpbmdEZXN0cm95ZWQpIHtcblx0ICAgIGkgPSBwYXJlbnQuX2NoaWxkcmVuLmluZGV4T2YodGhpcylcblx0ICAgIHBhcmVudC5fY2hpbGRyZW4uc3BsaWNlKGksIDEpXG5cdCAgfVxuXHQgIC8vIGRlc3Ryb3kgYWxsIGNoaWxkcmVuLlxuXHQgIGlmICh0aGlzLl9jaGlsZHJlbikge1xuXHQgICAgaSA9IHRoaXMuX2NoaWxkcmVuLmxlbmd0aFxuXHQgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICB0aGlzLl9jaGlsZHJlbltpXS4kZGVzdHJveSgpXG5cdCAgICB9XG5cdCAgfVxuXHQgIC8vIHRlYXJkb3duIGFsbCBkaXJlY3RpdmVzLiB0aGlzIGFsc28gdGVhcnNkb3duIGFsbFxuXHQgIC8vIGRpcmVjdGl2ZS1vd25lZCB3YXRjaGVycy5cblx0ICBpID0gdGhpcy5fZGlyZWN0aXZlcy5sZW5ndGhcblx0ICB3aGlsZSAoaS0tKSB7XG5cdCAgICB0aGlzLl9kaXJlY3RpdmVzW2ldLl90ZWFyZG93bigpXG5cdCAgfVxuXHQgIC8vIHRlYXJkb3duIGFsbCB1c2VyIHdhdGNoZXJzLlxuXHQgIGZvciAoaSBpbiB0aGlzLl91c2VyV2F0Y2hlcnMpIHtcblx0ICAgIHRoaXMuX3VzZXJXYXRjaGVyc1tpXS50ZWFyZG93bigpXG5cdCAgfVxuXHQgIC8vIHJlbW92ZSByZWZlcmVuY2UgdG8gc2VsZiBvbiAkZWxcblx0ICBpZiAodGhpcy4kZWwpIHtcblx0ICAgIHRoaXMuJGVsLl9fdnVlX18gPSBudWxsXG5cdCAgfVxuXHQgIC8vIHJlbW92ZSBET00gZWxlbWVudFxuXHQgIHZhciBzZWxmID0gdGhpc1xuXHQgIGlmIChyZW1vdmUgJiYgdGhpcy4kZWwpIHtcblx0ICAgIHRoaXMuJHJlbW92ZShmdW5jdGlvbiAoKSB7XG5cdCAgICAgIGNsZWFudXAoc2VsZilcblx0ICAgIH0pXG5cdCAgfSBlbHNlIHtcblx0ICAgIGNsZWFudXAoc2VsZilcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYW4gdXAgdG8gZW5zdXJlIGdhcmJhZ2UgY29sbGVjdGlvbi5cblx0ICogVGhpcyBpcyBjYWxsZWQgYWZ0ZXIgdGhlIGxlYXZlIHRyYW5zaXRpb24gaWYgdGhlcmVcblx0ICogaXMgYW55LlxuXHQgKlxuXHQgKiBAcGFyYW0ge1Z1ZX0gdm1cblx0ICovXG5cblx0ZnVuY3Rpb24gY2xlYW51cCAodm0pIHtcblx0ICAvLyByZW1vdmUgcmVmZXJlbmNlIGZyb20gZGF0YSBvYlxuXHQgIHZtLl9kYXRhLl9fb2JfXy5yZW1vdmVWbSh2bSlcblx0ICB2bS5fZGF0YSA9XG5cdCAgdm0uX3dhdGNoZXJzID1cblx0ICB2bS5fdXNlcldhdGNoZXJzID1cblx0ICB2bS5fd2F0Y2hlckxpc3QgPVxuXHQgIHZtLiRlbCA9XG5cdCAgdm0uJHBhcmVudCA9XG5cdCAgdm0uJHJvb3QgPVxuXHQgIHZtLl9jaGlsZHJlbiA9XG5cdCAgdm0uX2JpbmRpbmdzID1cblx0ICB2bS5fZGlyZWN0aXZlcyA9IG51bGxcblx0ICAvLyBjYWxsIHRoZSBsYXN0IGhvb2suLi5cblx0ICB2bS5faXNEZXN0cm95ZWQgPSB0cnVlXG5cdCAgdm0uX2NhbGxIb29rKCdkZXN0cm95ZWQnKVxuXHQgIC8vIHR1cm4gb2ZmIGFsbCBpbnN0YW5jZSBsaXN0ZW5lcnMuXG5cdCAgdm0uJG9mZigpIFxuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnRpYWxseSBjb21waWxlIGEgcGllY2Ugb2YgRE9NIGFuZCByZXR1cm4gYVxuXHQgKiBkZWNvbXBpbGUgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fSBlbFxuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbn1cblx0ICovXG5cblx0ZXhwb3J0cy4kY29tcGlsZSA9IGZ1bmN0aW9uIChlbCkge1xuXHQgIHJldHVybiBjb21waWxlKGVsLCB0aGlzLiRvcHRpb25zLCB0cnVlKSh0aGlzLCBlbClcblx0fVxuXG4vKioqLyB9LFxuLyogOCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0Ly8gbWFuaXB1bGF0aW9uIGRpcmVjdGl2ZXNcblx0ZXhwb3J0cy50ZXh0ICAgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMilcblx0ZXhwb3J0cy5odG1sICAgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMylcblx0ZXhwb3J0cy5hdHRyICAgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNClcblx0ZXhwb3J0cy5zaG93ICAgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNSlcblx0ZXhwb3J0c1snY2xhc3MnXSAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNilcblx0ZXhwb3J0cy5lbCAgICAgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyNylcblx0ZXhwb3J0cy5yZWYgICAgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyOClcblx0ZXhwb3J0cy5jbG9hayAgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygyOSlcblx0ZXhwb3J0cy5zdHlsZSAgICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygzMClcblx0ZXhwb3J0cy5wYXJ0aWFsICAgID0gX193ZWJwYWNrX3JlcXVpcmVfXygzMSlcblx0ZXhwb3J0cy50cmFuc2l0aW9uID0gX193ZWJwYWNrX3JlcXVpcmVfXygzMilcblxuXHQvLyBldmVudCBsaXN0ZW5lciBkaXJlY3RpdmVzXG5cdGV4cG9ydHMub24gICAgICAgICA9IF9fd2VicGFja19yZXF1aXJlX18oMzMpXG5cdGV4cG9ydHMubW9kZWwgICAgICA9IF9fd2VicGFja19yZXF1aXJlX18oNDgpXG5cblx0Ly8gY2hpbGQgdm0gZGlyZWN0aXZlc1xuXHRleHBvcnRzLmNvbXBvbmVudCAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM0KVxuXHRleHBvcnRzLnJlcGVhdCAgICAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM1KVxuXHRleHBvcnRzWydpZiddICAgICAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM2KVxuXHRleHBvcnRzWyd3aXRoJ10gICAgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM3KVxuXG4vKioqLyB9LFxuLyogOSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cblx0LyoqXG5cdCAqIFN0cmluZ2lmeSB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGluZGVudFxuXHQgKi9cblxuXHRleHBvcnRzLmpzb24gPSBmdW5jdGlvbiAodmFsdWUsIGluZGVudCkge1xuXHQgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgTnVtYmVyKGluZGVudCkgfHwgMilcblx0fVxuXG5cdC8qKlxuXHQgKiAnYWJjJyA9PiAnQWJjJ1xuXHQgKi9cblxuXHRleHBvcnRzLmNhcGl0YWxpemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSByZXR1cm4gJydcblx0ICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKClcblx0ICByZXR1cm4gdmFsdWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB2YWx1ZS5zbGljZSgxKVxuXHR9XG5cblx0LyoqXG5cdCAqICdhYmMnID0+ICdBQkMnXG5cdCAqL1xuXG5cdGV4cG9ydHMudXBwZXJjYXNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdCAgcmV0dXJuICh2YWx1ZSB8fCB2YWx1ZSA9PT0gMClcblx0ICAgID8gdmFsdWUudG9TdHJpbmcoKS50b1VwcGVyQ2FzZSgpXG5cdCAgICA6ICcnXG5cdH1cblxuXHQvKipcblx0ICogJ0FiQycgPT4gJ2FiYydcblx0ICovXG5cblx0ZXhwb3J0cy5sb3dlcmNhc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICByZXR1cm4gKHZhbHVlIHx8IHZhbHVlID09PSAwKVxuXHQgICAgPyB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcblx0ICAgIDogJydcblx0fVxuXG5cdC8qKlxuXHQgKiAxMjM0NSA9PiAkMTIsMzQ1LjAwXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzaWduXG5cdCAqL1xuXG5cdHZhciBkaWdpdHNSRSA9IC8oXFxkezN9KSg/PVxcZCkvZ1xuXG5cdGV4cG9ydHMuY3VycmVuY3kgPSBmdW5jdGlvbiAodmFsdWUsIHNpZ24pIHtcblx0ICB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpXG5cdCAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkgcmV0dXJuICcnXG5cdCAgc2lnbiA9IHNpZ24gfHwgJyQnXG5cdCAgdmFyIHMgPSBNYXRoLmZsb29yKE1hdGguYWJzKHZhbHVlKSkudG9TdHJpbmcoKSxcblx0ICAgIGkgPSBzLmxlbmd0aCAlIDMsXG5cdCAgICBoID0gaSA+IDBcblx0ICAgICAgPyAocy5zbGljZSgwLCBpKSArIChzLmxlbmd0aCA+IDMgPyAnLCcgOiAnJykpXG5cdCAgICAgIDogJycsXG5cdCAgICBmID0gJy4nICsgdmFsdWUudG9GaXhlZCgyKS5zbGljZSgtMilcblx0ICByZXR1cm4gKHZhbHVlIDwgMCA/ICctJyA6ICcnKSArXG5cdCAgICBzaWduICsgaCArIHMuc2xpY2UoaSkucmVwbGFjZShkaWdpdHNSRSwgJyQxLCcpICsgZlxuXHR9XG5cblx0LyoqXG5cdCAqICdpdGVtJyA9PiAnaXRlbXMnXG5cdCAqXG5cdCAqIEBwYXJhbXNcblx0ICogIGFuIGFycmF5IG9mIHN0cmluZ3MgY29ycmVzcG9uZGluZyB0b1xuXHQgKiAgdGhlIHNpbmdsZSwgZG91YmxlLCB0cmlwbGUgLi4uIGZvcm1zIG9mIHRoZSB3b3JkIHRvXG5cdCAqICBiZSBwbHVyYWxpemVkLiBXaGVuIHRoZSBudW1iZXIgdG8gYmUgcGx1cmFsaXplZFxuXHQgKiAgZXhjZWVkcyB0aGUgbGVuZ3RoIG9mIHRoZSBhcmdzLCBpdCB3aWxsIHVzZSB0aGUgbGFzdFxuXHQgKiAgZW50cnkgaW4gdGhlIGFycmF5LlxuXHQgKlxuXHQgKiAgZS5nLiBbJ3NpbmdsZScsICdkb3VibGUnLCAndHJpcGxlJywgJ211bHRpcGxlJ11cblx0ICovXG5cblx0ZXhwb3J0cy5wbHVyYWxpemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICB2YXIgYXJncyA9IF8udG9BcnJheShhcmd1bWVudHMsIDEpXG5cdCAgcmV0dXJuIGFyZ3MubGVuZ3RoID4gMVxuXHQgICAgPyAoYXJnc1t2YWx1ZSAlIDEwIC0gMV0gfHwgYXJnc1thcmdzLmxlbmd0aCAtIDFdKVxuXHQgICAgOiAoYXJnc1swXSArICh2YWx1ZSA9PT0gMSA/ICcnIDogJ3MnKSlcblx0fVxuXG5cdC8qKlxuXHQgKiBBIHNwZWNpYWwgZmlsdGVyIHRoYXQgdGFrZXMgYSBoYW5kbGVyIGZ1bmN0aW9uLFxuXHQgKiB3cmFwcyBpdCBzbyBpdCBvbmx5IGdldHMgdHJpZ2dlcmVkIG9uIHNwZWNpZmljXG5cdCAqIGtleXByZXNzZXMuIHYtb24gb25seS5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleVxuXHQgKi9cblxuXHR2YXIga2V5Q29kZXMgPSB7XG5cdCAgZW50ZXIgICAgOiAxMyxcblx0ICB0YWIgICAgICA6IDksXG5cdCAgJ2RlbGV0ZScgOiA0Nixcblx0ICB1cCAgICAgICA6IDM4LFxuXHQgIGxlZnQgICAgIDogMzcsXG5cdCAgcmlnaHQgICAgOiAzOSxcblx0ICBkb3duICAgICA6IDQwLFxuXHQgIGVzYyAgICAgIDogMjdcblx0fVxuXG5cdGV4cG9ydHMua2V5ID0gZnVuY3Rpb24gKGhhbmRsZXIsIGtleSkge1xuXHQgIGlmICghaGFuZGxlcikgcmV0dXJuXG5cdCAgdmFyIGNvZGUgPSBrZXlDb2Rlc1trZXldXG5cdCAgaWYgKCFjb2RlKSB7XG5cdCAgICBjb2RlID0gcGFyc2VJbnQoa2V5LCAxMClcblx0ICB9XG5cdCAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG5cdCAgICBpZiAoZS5rZXlDb2RlID09PSBjb2RlKSB7XG5cdCAgICAgIHJldHVybiBoYW5kbGVyLmNhbGwodGhpcywgZSlcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogSW5zdGFsbCBzcGVjaWFsIGFycmF5IGZpbHRlcnNcblx0ICovXG5cblx0Xy5leHRlbmQoZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXygzOCkpXG5cbi8qKiovIH0sXG4vKiAxMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIG1lcmdlT3B0aW9ucyA9IF9fd2VicGFja19yZXF1aXJlX18oMTkpXG5cblx0LyoqXG5cdCAqIFRoZSBtYWluIGluaXQgc2VxdWVuY2UuIFRoaXMgaXMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBpbnN0YW5jZSwgaW5jbHVkaW5nIG9uZXMgdGhhdCBhcmUgY3JlYXRlZCBmcm9tIGV4dGVuZGVkXG5cdCAqIGNvbnN0cnVjdG9ycy5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSB0aGlzIG9wdGlvbnMgb2JqZWN0IHNob3VsZCBiZVxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSByZXN1bHQgb2YgbWVyZ2luZyBjbGFzc1xuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgYW5kIHRoZSBvcHRpb25zIHBhc3NlZFxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGluIHRvIHRoZSBjb25zdHJ1Y3Rvci5cblx0ICovXG5cblx0ZXhwb3J0cy5faW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cblx0ICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG5cdCAgdGhpcy4kZWwgICAgICAgICAgID0gbnVsbFxuXHQgIHRoaXMuJHBhcmVudCAgICAgICA9IG9wdGlvbnMuX3BhcmVudFxuXHQgIHRoaXMuJHJvb3QgICAgICAgICA9IG9wdGlvbnMuX3Jvb3QgfHwgdGhpc1xuXHQgIHRoaXMuJCAgICAgICAgICAgICA9IHt9IC8vIGNoaWxkIHZtIHJlZmVyZW5jZXNcblx0ICB0aGlzLiQkICAgICAgICAgICAgPSB7fSAvLyBlbGVtZW50IHJlZmVyZW5jZXNcblx0ICB0aGlzLl93YXRjaGVyTGlzdCAgPSBbXSAvLyBhbGwgd2F0Y2hlcnMgYXMgYW4gYXJyYXlcblx0ICB0aGlzLl93YXRjaGVycyAgICAgPSB7fSAvLyBpbnRlcm5hbCB3YXRjaGVycyBhcyBhIGhhc2hcblx0ICB0aGlzLl91c2VyV2F0Y2hlcnMgPSB7fSAvLyB1c2VyIHdhdGNoZXJzIGFzIGEgaGFzaFxuXHQgIHRoaXMuX2RpcmVjdGl2ZXMgICA9IFtdIC8vIGFsbCBkaXJlY3RpdmVzXG5cblx0ICAvLyBhIGZsYWcgdG8gYXZvaWQgdGhpcyBiZWluZyBvYnNlcnZlZFxuXHQgIHRoaXMuX2lzVnVlID0gdHJ1ZVxuXG5cdCAgLy8gZXZlbnRzIGJvb2trZWVwaW5nXG5cdCAgdGhpcy5fZXZlbnRzICAgICAgICAgPSB7fSAgICAvLyByZWdpc3RlcmVkIGNhbGxiYWNrc1xuXHQgIHRoaXMuX2V2ZW50c0NvdW50ICAgID0ge30gICAgLy8gZm9yICRicm9hZGNhc3Qgb3B0aW1pemF0aW9uXG5cdCAgdGhpcy5fZXZlbnRDYW5jZWxsZWQgPSBmYWxzZSAvLyBmb3IgZXZlbnQgY2FuY2VsbGF0aW9uXG5cblx0ICAvLyBibG9jayBpbnN0YW5jZSBwcm9wZXJ0aWVzXG5cdCAgdGhpcy5faXNCbG9jayAgICAgPSBmYWxzZVxuXHQgIHRoaXMuX2Jsb2NrU3RhcnQgID0gICAgICAgICAgLy8gQHR5cGUge0NvbW1lbnROb2RlfVxuXHQgIHRoaXMuX2Jsb2NrRW5kICAgID0gbnVsbCAgICAgLy8gQHR5cGUge0NvbW1lbnROb2RlfVxuXG5cdCAgLy8gbGlmZWN5Y2xlIHN0YXRlXG5cdCAgdGhpcy5faXNDb21waWxlZCAgPVxuXHQgIHRoaXMuX2lzRGVzdHJveWVkID1cblx0ICB0aGlzLl9pc1JlYWR5ICAgICA9XG5cdCAgdGhpcy5faXNBdHRhY2hlZCAgPVxuXHQgIHRoaXMuX2lzQmVpbmdEZXN0cm95ZWQgPSBmYWxzZVxuXG5cdCAgLy8gY2hpbGRyZW5cblx0ICB0aGlzLl9jaGlsZHJlbiA9ICAgICAgICAgLy8gQHR5cGUge0FycmF5fVxuXHQgIHRoaXMuX2NoaWxkQ3RvcnMgPSBudWxsICAvLyBAdHlwZSB7T2JqZWN0fSAtIGhhc2ggdG8gY2FjaGVcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hpbGQgY29uc3RydWN0b3JzXG5cblx0ICAvLyBtZXJnZSBvcHRpb25zLlxuXHQgIG9wdGlvbnMgPSB0aGlzLiRvcHRpb25zID0gbWVyZ2VPcHRpb25zKFxuXHQgICAgdGhpcy5jb25zdHJ1Y3Rvci5vcHRpb25zLFxuXHQgICAgb3B0aW9ucyxcblx0ICAgIHRoaXNcblx0ICApXG5cblx0ICAvLyBzZXQgZGF0YSBhZnRlciBtZXJnZS5cblx0ICB0aGlzLl9kYXRhID0gb3B0aW9ucy5kYXRhIHx8IHt9XG5cblx0ICAvLyBpbml0aWFsaXplIGRhdGEgb2JzZXJ2YXRpb24gYW5kIHNjb3BlIGluaGVyaXRhbmNlLlxuXHQgIHRoaXMuX2luaXRTY29wZSgpXG5cblx0ICAvLyBzZXR1cCBldmVudCBzeXN0ZW0gYW5kIG9wdGlvbiBldmVudHMuXG5cdCAgdGhpcy5faW5pdEV2ZW50cygpXG5cblx0ICAvLyBjYWxsIGNyZWF0ZWQgaG9va1xuXHQgIHRoaXMuX2NhbGxIb29rKCdjcmVhdGVkJylcblxuXHQgIC8vIGlmIGBlbGAgb3B0aW9uIGlzIHBhc3NlZCwgc3RhcnQgY29tcGlsYXRpb24uXG5cdCAgaWYgKG9wdGlvbnMuZWwpIHtcblx0ICAgIHRoaXMuJG1vdW50KG9wdGlvbnMuZWwpXG5cdCAgfVxuXHR9XG5cbi8qKiovIH0sXG4vKiAxMSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBpbkRvYyA9IF8uaW5Eb2NcblxuXHQvKipcblx0ICogU2V0dXAgdGhlIGluc3RhbmNlJ3Mgb3B0aW9uIGV2ZW50cyAmIHdhdGNoZXJzLlxuXHQgKiBJZiB0aGUgdmFsdWUgaXMgYSBzdHJpbmcsIHdlIHB1bGwgaXQgZnJvbSB0aGVcblx0ICogaW5zdGFuY2UncyBtZXRob2RzIGJ5IG5hbWUuXG5cdCAqL1xuXG5cdGV4cG9ydHMuX2luaXRFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG5cdCAgdmFyIG9wdGlvbnMgPSB0aGlzLiRvcHRpb25zXG5cdCAgcmVnaXN0ZXJDYWxsYmFja3ModGhpcywgJyRvbicsIG9wdGlvbnMuZXZlbnRzKVxuXHQgIHJlZ2lzdGVyQ2FsbGJhY2tzKHRoaXMsICckd2F0Y2gnLCBvcHRpb25zLndhdGNoKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ2lzdGVyIGNhbGxiYWNrcyBmb3Igb3B0aW9uIGV2ZW50cyBhbmQgd2F0Y2hlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIHJlZ2lzdGVyQ2FsbGJhY2tzICh2bSwgYWN0aW9uLCBoYXNoKSB7XG5cdCAgaWYgKCFoYXNoKSByZXR1cm5cblx0ICB2YXIgaGFuZGxlcnMsIGtleSwgaSwgalxuXHQgIGZvciAoa2V5IGluIGhhc2gpIHtcblx0ICAgIGhhbmRsZXJzID0gaGFzaFtrZXldXG5cdCAgICBpZiAoXy5pc0FycmF5KGhhbmRsZXJzKSkge1xuXHQgICAgICBmb3IgKGkgPSAwLCBqID0gaGFuZGxlcnMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XG5cdCAgICAgICAgcmVnaXN0ZXIodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVyc1tpXSlcblx0ICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgcmVnaXN0ZXIodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVycylcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIHRvIHJlZ2lzdGVyIGFuIGV2ZW50L3dhdGNoIGNhbGxiYWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1Z1ZX0gdm1cblx0ICogQHBhcmFtIHtTdHJpbmd9IGFjdGlvblxuXHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7Kn0gaGFuZGxlclxuXHQgKi9cblxuXHRmdW5jdGlvbiByZWdpc3RlciAodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVyKSB7XG5cdCAgdmFyIHR5cGUgPSB0eXBlb2YgaGFuZGxlclxuXHQgIGlmICh0eXBlID09PSAnZnVuY3Rpb24nKSB7XG5cdCAgICB2bVthY3Rpb25dKGtleSwgaGFuZGxlcilcblx0ICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG5cdCAgICB2YXIgbWV0aG9kcyA9IHZtLiRvcHRpb25zLm1ldGhvZHNcblx0ICAgIHZhciBtZXRob2QgPSBtZXRob2RzICYmIG1ldGhvZHNbaGFuZGxlcl1cblx0ICAgIGlmIChtZXRob2QpIHtcblx0ICAgICAgdm1bYWN0aW9uXShrZXksIG1ldGhvZClcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIF8ud2Fybihcblx0ICAgICAgICAnVW5rbm93biBtZXRob2Q6IFwiJyArIGhhbmRsZXIgKyAnXCIgd2hlbiAnICtcblx0ICAgICAgICAncmVnaXN0ZXJpbmcgY2FsbGJhY2sgZm9yICcgKyBhY3Rpb24gK1xuXHQgICAgICAgICc6IFwiJyArIGtleSArICdcIi4nXG5cdCAgICAgIClcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogU2V0dXAgcmVjdXJzaXZlIGF0dGFjaGVkL2RldGFjaGVkIGNhbGxzXG5cdCAqL1xuXG5cdGV4cG9ydHMuX2luaXRET01Ib29rcyA9IGZ1bmN0aW9uICgpIHtcblx0ICB0aGlzLiRvbignaG9vazphdHRhY2hlZCcsIG9uQXR0YWNoZWQpXG5cdCAgdGhpcy4kb24oJ2hvb2s6ZGV0YWNoZWQnLCBvbkRldGFjaGVkKVxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIHRvIHJlY3Vyc2l2ZWx5IGNhbGwgYXR0YWNoZWQgaG9vayBvbiBjaGlsZHJlblxuXHQgKi9cblxuXHRmdW5jdGlvbiBvbkF0dGFjaGVkICgpIHtcblx0ICB0aGlzLl9pc0F0dGFjaGVkID0gdHJ1ZVxuXHQgIHZhciBjaGlsZHJlbiA9IHRoaXMuX2NoaWxkcmVuXG5cdCAgaWYgKCFjaGlsZHJlbikgcmV0dXJuXG5cdCAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0ICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cdCAgICBpZiAoIWNoaWxkLl9pc0F0dGFjaGVkICYmIGluRG9jKGNoaWxkLiRlbCkpIHtcblx0ICAgICAgY2hpbGQuX2NhbGxIb29rKCdhdHRhY2hlZCcpXG5cdCAgICB9XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIHRvIHJlY3Vyc2l2ZWx5IGNhbGwgZGV0YWNoZWQgaG9vayBvbiBjaGlsZHJlblxuXHQgKi9cblxuXHRmdW5jdGlvbiBvbkRldGFjaGVkICgpIHtcblx0ICB0aGlzLl9pc0F0dGFjaGVkID0gZmFsc2Vcblx0ICB2YXIgY2hpbGRyZW4gPSB0aGlzLl9jaGlsZHJlblxuXHQgIGlmICghY2hpbGRyZW4pIHJldHVyblxuXHQgIGZvciAodmFyIGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdCAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXHQgICAgaWYgKGNoaWxkLl9pc0F0dGFjaGVkICYmICFpbkRvYyhjaGlsZC4kZWwpKSB7XG5cdCAgICAgIGNoaWxkLl9jYWxsSG9vaygnZGV0YWNoZWQnKVxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIGFsbCBoYW5kbGVycyBmb3IgYSBob29rXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBob29rXG5cdCAqL1xuXG5cdGV4cG9ydHMuX2NhbGxIb29rID0gZnVuY3Rpb24gKGhvb2spIHtcblx0ICB2YXIgaGFuZGxlcnMgPSB0aGlzLiRvcHRpb25zW2hvb2tdXG5cdCAgaWYgKGhhbmRsZXJzKSB7XG5cdCAgICBmb3IgKHZhciBpID0gMCwgaiA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuXHQgICAgICBoYW5kbGVyc1tpXS5jYWxsKHRoaXMpXG5cdCAgICB9XG5cdCAgfVxuXHQgIHRoaXMuJGVtaXQoJ2hvb2s6JyArIGhvb2spXG5cdH1cblxuLyoqKi8gfSxcbi8qIDEyICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblx0dmFyIE9ic2VydmVyID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0OSlcblx0dmFyIEJpbmRpbmcgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM5KVxuXG5cdC8qKlxuXHQgKiBTZXR1cCB0aGUgc2NvcGUgb2YgYW4gaW5zdGFuY2UsIHdoaWNoIGNvbnRhaW5zOlxuXHQgKiAtIG9ic2VydmVkIGRhdGFcblx0ICogLSBjb21wdXRlZCBwcm9wZXJ0aWVzXG5cdCAqIC0gdXNlciBtZXRob2RzXG5cdCAqIC0gbWV0YSBwcm9wZXJ0aWVzXG5cdCAqL1xuXG5cdGV4cG9ydHMuX2luaXRTY29wZSA9IGZ1bmN0aW9uICgpIHtcblx0ICB0aGlzLl9pbml0RGF0YSgpXG5cdCAgdGhpcy5faW5pdENvbXB1dGVkKClcblx0ICB0aGlzLl9pbml0TWV0aG9kcygpXG5cdCAgdGhpcy5faW5pdE1ldGEoKVxuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgdGhlIGRhdGEuIFxuXHQgKi9cblxuXHRleHBvcnRzLl9pbml0RGF0YSA9IGZ1bmN0aW9uICgpIHtcblx0ICAvLyBwcm94eSBkYXRhIG9uIGluc3RhbmNlXG5cdCAgdmFyIGRhdGEgPSB0aGlzLl9kYXRhXG5cdCAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKVxuXHQgIHZhciBpID0ga2V5cy5sZW5ndGhcblx0ICB2YXIga2V5XG5cdCAgd2hpbGUgKGktLSkge1xuXHQgICAga2V5ID0ga2V5c1tpXVxuXHQgICAgaWYgKCFfLmlzUmVzZXJ2ZWQoa2V5KSkge1xuXHQgICAgICB0aGlzLl9wcm94eShrZXkpXG5cdCAgICB9XG5cdCAgfVxuXHQgIC8vIG9ic2VydmUgZGF0YVxuXHQgIE9ic2VydmVyLmNyZWF0ZShkYXRhKS5hZGRWbSh0aGlzKVxuXHR9XG5cblx0LyoqXG5cdCAqIFN3YXAgdGhlIGlzbnRhbmNlJ3MgJGRhdGEuIENhbGxlZCBpbiAkZGF0YSdzIHNldHRlci5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IG5ld0RhdGFcblx0ICovXG5cblx0ZXhwb3J0cy5fc2V0RGF0YSA9IGZ1bmN0aW9uIChuZXdEYXRhKSB7XG5cdCAgbmV3RGF0YSA9IG5ld0RhdGEgfHwge31cblx0ICB2YXIgb2xkRGF0YSA9IHRoaXMuX2RhdGFcblx0ICB0aGlzLl9kYXRhID0gbmV3RGF0YVxuXHQgIHZhciBrZXlzLCBrZXksIGlcblx0ICAvLyB1bnByb3h5IGtleXMgbm90IHByZXNlbnQgaW4gbmV3IGRhdGFcblx0ICBrZXlzID0gT2JqZWN0LmtleXMob2xkRGF0YSlcblx0ICBpID0ga2V5cy5sZW5ndGhcblx0ICB3aGlsZSAoaS0tKSB7XG5cdCAgICBrZXkgPSBrZXlzW2ldXG5cdCAgICBpZiAoIV8uaXNSZXNlcnZlZChrZXkpICYmICEoa2V5IGluIG5ld0RhdGEpKSB7XG5cdCAgICAgIHRoaXMuX3VucHJveHkoa2V5KVxuXHQgICAgfVxuXHQgIH1cblx0ICAvLyBwcm94eSBrZXlzIG5vdCBhbHJlYWR5IHByb3hpZWQsXG5cdCAgLy8gYW5kIHRyaWdnZXIgY2hhbmdlIGZvciBjaGFuZ2VkIHZhbHVlc1xuXHQgIGtleXMgPSBPYmplY3Qua2V5cyhuZXdEYXRhKVxuXHQgIGkgPSBrZXlzLmxlbmd0aFxuXHQgIHdoaWxlIChpLS0pIHtcblx0ICAgIGtleSA9IGtleXNbaV1cblx0ICAgIGlmICghdGhpcy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmICFfLmlzUmVzZXJ2ZWQoa2V5KSkge1xuXHQgICAgICAvLyBuZXcgcHJvcGVydHlcblx0ICAgICAgdGhpcy5fcHJveHkoa2V5KVxuXHQgICAgfVxuXHQgIH1cblx0ICBvbGREYXRhLl9fb2JfXy5yZW1vdmVWbSh0aGlzKVxuXHQgIE9ic2VydmVyLmNyZWF0ZShuZXdEYXRhKS5hZGRWbSh0aGlzKVxuXHQgIHRoaXMuX2RpZ2VzdCgpXG5cdH1cblxuXHQvKipcblx0ICogUHJveHkgYSBwcm9wZXJ0eSwgc28gdGhhdFxuXHQgKiB2bS5wcm9wID09PSB2bS5fZGF0YS5wcm9wXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcblx0ICovXG5cblx0ZXhwb3J0cy5fcHJveHkgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdCAgLy8gbmVlZCB0byBzdG9yZSByZWYgdG8gc2VsZiBoZXJlXG5cdCAgLy8gYmVjYXVzZSB0aGVzZSBnZXR0ZXIvc2V0dGVycyBtaWdodFxuXHQgIC8vIGJlIGNhbGxlZCBieSBjaGlsZCBpbnN0YW5jZXMhXG5cdCAgdmFyIHNlbGYgPSB0aGlzXG5cdCAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbGYsIGtleSwge1xuXHQgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuXHQgICAgZW51bWVyYWJsZTogdHJ1ZSxcblx0ICAgIGdldDogZnVuY3Rpb24gcHJveHlHZXR0ZXIgKCkge1xuXHQgICAgICByZXR1cm4gc2VsZi5fZGF0YVtrZXldXG5cdCAgICB9LFxuXHQgICAgc2V0OiBmdW5jdGlvbiBwcm94eVNldHRlciAodmFsKSB7XG5cdCAgICAgIHNlbGYuX2RhdGFba2V5XSA9IHZhbFxuXHQgICAgfVxuXHQgIH0pXG5cdH1cblxuXHQvKipcblx0ICogVW5wcm94eSBhIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG5cdCAqL1xuXG5cdGV4cG9ydHMuX3VucHJveHkgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdCAgZGVsZXRlIHRoaXNba2V5XVxuXHR9XG5cblx0LyoqXG5cdCAqIEZvcmNlIHVwZGF0ZSBvbiBldmVyeSB3YXRjaGVyIGluIHNjb3BlLlxuXHQgKi9cblxuXHRleHBvcnRzLl9kaWdlc3QgPSBmdW5jdGlvbiAoKSB7XG5cdCAgdmFyIGkgPSB0aGlzLl93YXRjaGVyTGlzdC5sZW5ndGhcblx0ICB3aGlsZSAoaS0tKSB7XG5cdCAgICB0aGlzLl93YXRjaGVyTGlzdFtpXS51cGRhdGUoKVxuXHQgIH1cblx0ICB2YXIgY2hpbGRyZW4gPSB0aGlzLl9jaGlsZHJlblxuXHQgIHZhciBjaGlsZFxuXHQgIGlmIChjaGlsZHJlbikge1xuXHQgICAgaSA9IGNoaWxkcmVuLmxlbmd0aFxuXHQgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICBjaGlsZCA9IGNoaWxkcmVuW2ldXG5cdCAgICAgIGlmIChjaGlsZC4kb3B0aW9ucy5pbmhlcml0KSB7XG5cdCAgICAgICAgY2hpbGQuX2RpZ2VzdCgpXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogU2V0dXAgY29tcHV0ZWQgcHJvcGVydGllcy4gVGhleSBhcmUgZXNzZW50aWFsbHlcblx0ICogc3BlY2lhbCBnZXR0ZXIvc2V0dGVyc1xuXHQgKi9cblxuXHRmdW5jdGlvbiBub29wICgpIHt9XG5cdGV4cG9ydHMuX2luaXRDb21wdXRlZCA9IGZ1bmN0aW9uICgpIHtcblx0ICB2YXIgY29tcHV0ZWQgPSB0aGlzLiRvcHRpb25zLmNvbXB1dGVkXG5cdCAgaWYgKGNvbXB1dGVkKSB7XG5cdCAgICBmb3IgKHZhciBrZXkgaW4gY29tcHV0ZWQpIHtcblx0ICAgICAgdmFyIHVzZXJEZWYgPSBjb21wdXRlZFtrZXldXG5cdCAgICAgIHZhciBkZWYgPSB7XG5cdCAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcblx0ICAgICAgICBjb25maWd1cmFibGU6IHRydWVcblx0ICAgICAgfVxuXHQgICAgICBpZiAodHlwZW9mIHVzZXJEZWYgPT09ICdmdW5jdGlvbicpIHtcblx0ICAgICAgICBkZWYuZ2V0ID0gXy5iaW5kKHVzZXJEZWYsIHRoaXMpXG5cdCAgICAgICAgZGVmLnNldCA9IG5vb3Bcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBkZWYuZ2V0ID0gdXNlckRlZi5nZXRcblx0ICAgICAgICAgID8gXy5iaW5kKHVzZXJEZWYuZ2V0LCB0aGlzKVxuXHQgICAgICAgICAgOiBub29wXG5cdCAgICAgICAgZGVmLnNldCA9IHVzZXJEZWYuc2V0XG5cdCAgICAgICAgICA/IF8uYmluZCh1c2VyRGVmLnNldCwgdGhpcylcblx0ICAgICAgICAgIDogbm9vcFxuXHQgICAgICB9XG5cdCAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIGRlZilcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogU2V0dXAgaW5zdGFuY2UgbWV0aG9kcy4gTWV0aG9kcyBtdXN0IGJlIGJvdW5kIHRvIHRoZVxuXHQgKiBpbnN0YW5jZSBzaW5jZSB0aGV5IG1pZ2h0IGJlIGNhbGxlZCBieSBjaGlsZHJlblxuXHQgKiBpbmhlcml0aW5nIHRoZW0uXG5cdCAqL1xuXG5cdGV4cG9ydHMuX2luaXRNZXRob2RzID0gZnVuY3Rpb24gKCkge1xuXHQgIHZhciBtZXRob2RzID0gdGhpcy4kb3B0aW9ucy5tZXRob2RzXG5cdCAgaWYgKG1ldGhvZHMpIHtcblx0ICAgIGZvciAodmFyIGtleSBpbiBtZXRob2RzKSB7XG5cdCAgICAgIHRoaXNba2V5XSA9IF8uYmluZChtZXRob2RzW2tleV0sIHRoaXMpXG5cdCAgICB9XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgbWV0YSBpbmZvcm1hdGlvbiBsaWtlICRpbmRleCwgJGtleSAmICR2YWx1ZS5cblx0ICovXG5cblx0ZXhwb3J0cy5faW5pdE1ldGEgPSBmdW5jdGlvbiAoKSB7XG5cdCAgdmFyIG1ldGFzID0gdGhpcy4kb3B0aW9ucy5fbWV0YVxuXHQgIGlmIChtZXRhcykge1xuXHQgICAgZm9yICh2YXIga2V5IGluIG1ldGFzKSB7XG5cdCAgICAgIHRoaXMuX2RlZmluZU1ldGEoa2V5LCBtZXRhc1trZXldKVxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZWZpbmUgYSBtZXRhIHByb3BlcnR5LCBlLmcgJGluZGV4LCAka2V5LCAkdmFsdWVcblx0ICogd2hpY2ggb25seSBleGlzdHMgb24gdGhlIHZtIGluc3RhbmNlIGJ1dCBub3QgaW4gJGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxuXHQgKi9cblxuXHRleHBvcnRzLl9kZWZpbmVNZXRhID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblx0ICB2YXIgYmluZGluZyA9IG5ldyBCaW5kaW5nKClcblx0ICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XG5cdCAgICBlbnVtZXJhYmxlOiB0cnVlLFxuXHQgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuXHQgICAgZ2V0OiBmdW5jdGlvbiBtZXRhR2V0dGVyICgpIHtcblx0ICAgICAgaWYgKE9ic2VydmVyLnRhcmdldCkge1xuXHQgICAgICAgIE9ic2VydmVyLnRhcmdldC5hZGREZXAoYmluZGluZylcblx0ICAgICAgfVxuXHQgICAgICByZXR1cm4gdmFsdWVcblx0ICAgIH0sXG5cdCAgICBzZXQ6IGZ1bmN0aW9uIG1ldGFTZXR0ZXIgKHZhbCkge1xuXHQgICAgICBpZiAodmFsICE9PSB2YWx1ZSkge1xuXHQgICAgICAgIHZhbHVlID0gdmFsXG5cdCAgICAgICAgYmluZGluZy5ub3RpZnkoKVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfSlcblx0fVxuXG4vKioqLyB9LFxuLyogMTMgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgRGlyZWN0aXZlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0MClcblx0dmFyIGNvbXBpbGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQ2KVxuXHR2YXIgdHJhbnNjbHVkZSA9IF9fd2VicGFja19yZXF1aXJlX18oNDcpXG5cblx0LyoqXG5cdCAqIFRyYW5zY2x1ZGUsIGNvbXBpbGUgYW5kIGxpbmsgZWxlbWVudC5cblx0ICpcblx0ICogSWYgYSBwcmUtY29tcGlsZWQgbGlua2VyIGlzIGF2YWlsYWJsZSwgdGhhdCBtZWFucyB0aGVcblx0ICogcGFzc2VkIGluIGVsZW1lbnQgd2lsbCBiZSBwcmUtdHJhbnNjbHVkZWQgYW5kIGNvbXBpbGVkXG5cdCAqIGFzIHdlbGwgLSBhbGwgd2UgbmVlZCB0byBkbyBpcyB0byBjYWxsIHRoZSBsaW5rZXIuXG5cdCAqXG5cdCAqIE90aGVyd2lzZSB3ZSBuZWVkIHRvIGNhbGwgdHJhbnNjbHVkZS9jb21waWxlL2xpbmsgaGVyZS5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcmV0dXJuIHtFbGVtZW50fVxuXHQgKi9cblxuXHRleHBvcnRzLl9jb21waWxlID0gZnVuY3Rpb24gKGVsKSB7XG5cdCAgdmFyIG9wdGlvbnMgPSB0aGlzLiRvcHRpb25zXG5cdCAgaWYgKG9wdGlvbnMuX2xpbmtlcikge1xuXHQgICAgdGhpcy5faW5pdEVsZW1lbnQoZWwpXG5cdCAgICBvcHRpb25zLl9saW5rZXIodGhpcywgZWwpXG5cdCAgfSBlbHNlIHtcblx0ICAgIHZhciByYXcgPSBlbFxuXHQgICAgZWwgPSB0cmFuc2NsdWRlKGVsLCBvcHRpb25zKVxuXHQgICAgdGhpcy5faW5pdEVsZW1lbnQoZWwpXG5cdCAgICB2YXIgbGlua2VyID0gY29tcGlsZShlbCwgb3B0aW9ucylcblx0ICAgIGxpbmtlcih0aGlzLCBlbClcblx0ICAgIGlmIChvcHRpb25zLnJlcGxhY2UpIHtcblx0ICAgICAgXy5yZXBsYWNlKHJhdywgZWwpXG5cdCAgICB9XG5cdCAgfVxuXHQgIHJldHVybiBlbFxuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgaW5zdGFuY2UgZWxlbWVudC4gQ2FsbGVkIGluIHRoZSBwdWJsaWNcblx0ICogJG1vdW50KCkgbWV0aG9kLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqL1xuXG5cdGV4cG9ydHMuX2luaXRFbGVtZW50ID0gZnVuY3Rpb24gKGVsKSB7XG5cdCAgaWYgKGVsIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudCkge1xuXHQgICAgdGhpcy5faXNCbG9jayA9IHRydWVcblx0ICAgIHRoaXMuJGVsID0gdGhpcy5fYmxvY2tTdGFydCA9IGVsLmZpcnN0Q2hpbGRcblx0ICAgIHRoaXMuX2Jsb2NrRW5kID0gZWwubGFzdENoaWxkXG5cdCAgICB0aGlzLl9ibG9ja0ZyYWdtZW50ID0gZWxcblx0ICB9IGVsc2Uge1xuXHQgICAgdGhpcy4kZWwgPSBlbFxuXHQgIH1cblx0ICB0aGlzLiRlbC5fX3Z1ZV9fID0gdGhpc1xuXHQgIHRoaXMuX2NhbGxIb29rKCdiZWZvcmVDb21waWxlJylcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYW5kIGJpbmQgYSBkaXJlY3RpdmUgdG8gYW4gZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSBkaXJlY3RpdmUgbmFtZVxuXHQgKiBAcGFyYW0ge05vZGV9IG5vZGUgICAtIHRhcmdldCBub2RlXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjIC0gcGFyc2VkIGRpcmVjdGl2ZSBkZXNjcmlwdG9yXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkZWYgIC0gZGlyZWN0aXZlIGRlZmluaXRpb24gb2JqZWN0XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtsaW5rZXJdIC0gcHJlLWNvbXBpbGVkIGxpbmtlciBmblxuXHQgKi9cblxuXHRleHBvcnRzLl9iaW5kRGlyID0gZnVuY3Rpb24gKG5hbWUsIG5vZGUsIGRlc2MsIGRlZiwgbGlua2VyKSB7XG5cdCAgdGhpcy5fZGlyZWN0aXZlcy5wdXNoKFxuXHQgICAgbmV3IERpcmVjdGl2ZShuYW1lLCBub2RlLCB0aGlzLCBkZXNjLCBkZWYsIGxpbmtlcilcblx0ICApXG5cdH1cblxuLyoqKi8gfSxcbi8qIDE0ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHQvKipcblx0ICogQ2hlY2sgaXMgYSBzdHJpbmcgc3RhcnRzIHdpdGggJCBvciBfXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcblx0ICogQHJldHVybiB7Qm9vbGVhbn1cblx0ICovXG5cblx0ZXhwb3J0cy5pc1Jlc2VydmVkID0gZnVuY3Rpb24gKHN0cikge1xuXHQgIHZhciBjID0gc3RyLmNoYXJDb2RlQXQoMClcblx0ICByZXR1cm4gYyA9PT0gMHgyNCB8fCBjID09PSAweDVGXG5cdH1cblxuXHQvKipcblx0ICogR3VhcmQgdGV4dCBvdXRwdXQsIG1ha2Ugc3VyZSB1bmRlZmluZWQgb3V0cHV0c1xuXHQgKiBlbXB0eSBzdHJpbmdcblx0ICpcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XG5cdCAqL1xuXG5cdGV4cG9ydHMudG9TdHJpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICByZXR1cm4gdmFsdWUgPT0gbnVsbFxuXHQgICAgPyAnJ1xuXHQgICAgOiB2YWx1ZS50b1N0cmluZygpXG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgYW5kIGNvbnZlcnQgcG9zc2libGUgbnVtZXJpYyBudW1iZXJzIGJlZm9yZVxuXHQgKiBzZXR0aW5nIGJhY2sgdG8gZGF0YVxuXHQgKlxuXHQgKiBAcGFyYW0geyp9IHZhbHVlXG5cdCAqIEByZXR1cm4geyp8TnVtYmVyfVxuXHQgKi9cblxuXHRleHBvcnRzLnRvTnVtYmVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdCAgcmV0dXJuIChcblx0ICAgIGlzTmFOKHZhbHVlKSB8fFxuXHQgICAgdmFsdWUgPT09IG51bGwgfHxcblx0ICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nXG5cdCAgKSA/IHZhbHVlXG5cdCAgICA6IE51bWJlcih2YWx1ZSlcblx0fVxuXG5cdC8qKlxuXHQgKiBTdHJpcCBxdW90ZXMgZnJvbSBhIHN0cmluZ1xuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG5cdCAqIEByZXR1cm4ge1N0cmluZyB8IGZhbHNlfVxuXHQgKi9cblxuXHRleHBvcnRzLnN0cmlwUXVvdGVzID0gZnVuY3Rpb24gKHN0cikge1xuXHQgIHZhciBhID0gc3RyLmNoYXJDb2RlQXQoMClcblx0ICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KHN0ci5sZW5ndGggLSAxKVxuXHQgIHJldHVybiBhID09PSBiICYmIChhID09PSAweDIyIHx8IGEgPT09IDB4MjcpXG5cdCAgICA/IHN0ci5zbGljZSgxLCAtMSlcblx0ICAgIDogZmFsc2Vcblx0fVxuXG5cdC8qKlxuXHQgKiBDYW1lbGl6ZSBhIGh5cGhlbi1kZWxtaXRlZCBzdHJpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblxuXHR2YXIgY2FtZWxSRSA9IC9bLV9dKFxcdykvZ1xuXHR2YXIgY2FwaXRhbENhbWVsUkUgPSAvKD86XnxbLV9dKShcXHcpL2dcblxuXHRleHBvcnRzLmNhbWVsaXplID0gZnVuY3Rpb24gKHN0ciwgY2FwKSB7XG5cdCAgdmFyIFJFID0gY2FwID8gY2FwaXRhbENhbWVsUkUgOiBjYW1lbFJFXG5cdCAgcmV0dXJuIHN0ci5yZXBsYWNlKFJFLCBmdW5jdGlvbiAoXywgYykge1xuXHQgICAgcmV0dXJuIGMgPyBjLnRvVXBwZXJDYXNlICgpIDogJyc7XG5cdCAgfSlcblx0fVxuXG5cdC8qKlxuXHQgKiBTaW1wbGUgYmluZCwgZmFzdGVyIHRoYW4gbmF0aXZlXG5cdCAqXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBjdHhcblx0ICogQHJldHVybiB7RnVuY3Rpb259XG5cdCAqL1xuXG5cdGV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uIChmbiwgY3R4KSB7XG5cdCAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0ICAgIHJldHVybiBmbi5hcHBseShjdHgsIGFyZ3VtZW50cylcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydCBhbiBBcnJheS1saWtlIG9iamVjdCB0byBhIHJlYWwgQXJyYXkuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXktbGlrZX0gbGlzdFxuXHQgKiBAcGFyYW0ge051bWJlcn0gW3N0YXJ0XSAtIHN0YXJ0IGluZGV4XG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKi9cblxuXHRleHBvcnRzLnRvQXJyYXkgPSBmdW5jdGlvbiAobGlzdCwgc3RhcnQpIHtcblx0ICBzdGFydCA9IHN0YXJ0IHx8IDBcblx0ICB2YXIgaSA9IGxpc3QubGVuZ3RoIC0gc3RhcnRcblx0ICB2YXIgcmV0ID0gbmV3IEFycmF5KGkpXG5cdCAgd2hpbGUgKGktLSkge1xuXHQgICAgcmV0W2ldID0gbGlzdFtpICsgc3RhcnRdXG5cdCAgfVxuXHQgIHJldHVybiByZXRcblx0fVxuXG5cdC8qKlxuXHQgKiBNaXggcHJvcGVydGllcyBpbnRvIHRhcmdldCBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0b1xuXHQgKiBAcGFyYW0ge09iamVjdH0gZnJvbVxuXHQgKi9cblxuXHRleHBvcnRzLmV4dGVuZCA9IGZ1bmN0aW9uICh0bywgZnJvbSkge1xuXHQgIGZvciAodmFyIGtleSBpbiBmcm9tKSB7XG5cdCAgICB0b1trZXldID0gZnJvbVtrZXldXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIFF1aWNrIG9iamVjdCBjaGVjayAtIHRoaXMgaXMgcHJpbWFyaWx5IHVzZWQgdG8gdGVsbFxuXHQgKiBPYmplY3RzIGZyb20gcHJpbWl0aXZlIHZhbHVlcyB3aGVuIHdlIGtub3cgdGhlIHZhbHVlXG5cdCAqIGlzIGEgSlNPTi1jb21wbGlhbnQgdHlwZS5cblx0ICpcblx0ICogQHBhcmFtIHsqfSBvYmpcblx0ICogQHJldHVybiB7Qm9vbGVhbn1cblx0ICovXG5cblx0ZXhwb3J0cy5pc09iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcblx0ICByZXR1cm4gb2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnXG5cdH1cblxuXHQvKipcblx0ICogU3RyaWN0IG9iamVjdCB0eXBlIGNoZWNrLiBPbmx5IHJldHVybnMgdHJ1ZVxuXHQgKiBmb3IgcGxhaW4gSmF2YVNjcmlwdCBvYmplY3RzLlxuXHQgKlxuXHQgKiBAcGFyYW0geyp9IG9ialxuXHQgKiBAcmV0dXJuIHtCb29sZWFufVxuXHQgKi9cblxuXHR2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG5cdGV4cG9ydHMuaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcblx0ICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJ1xuXHR9XG5cblx0LyoqXG5cdCAqIEFycmF5IHR5cGUgY2hlY2suXG5cdCAqXG5cdCAqIEBwYXJhbSB7Kn0gb2JqXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59XG5cdCAqL1xuXG5cdGV4cG9ydHMuaXNBcnJheSA9IGZ1bmN0aW9uIChvYmopIHtcblx0ICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopXG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lIGEgbm9uLWVudW1lcmFibGUgcHJvcGVydHlcblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IG9ialxuXHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG5cdCAqIEBwYXJhbSB7Kn0gdmFsXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gW2VudW1lcmFibGVdXG5cdCAqL1xuXG5cdGV4cG9ydHMuZGVmaW5lID0gZnVuY3Rpb24gKG9iaiwga2V5LCB2YWwsIGVudW1lcmFibGUpIHtcblx0ICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcblx0ICAgIHZhbHVlICAgICAgICA6IHZhbCxcblx0ICAgIGVudW1lcmFibGUgICA6ICEhZW51bWVyYWJsZSxcblx0ICAgIHdyaXRhYmxlICAgICA6IHRydWUsXG5cdCAgICBjb25maWd1cmFibGUgOiB0cnVlXG5cdCAgfSlcblx0fVxuXG4vKioqLyB9LFxuLyogMTUgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdC8qKlxuXHQgKiBDYW4gd2UgdXNlIF9fcHJvdG9fXz9cblx0ICpcblx0ICogQHR5cGUge0Jvb2xlYW59XG5cdCAqL1xuXG5cdGV4cG9ydHMuaGFzUHJvdG8gPSAnX19wcm90b19fJyBpbiB7fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2UgaGF2ZSBhIHdpbmRvd1xuXHQgKlxuXHQgKiBAdHlwZSB7Qm9vbGVhbn1cblx0ICovXG5cblx0dmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuXHR2YXIgaW5Ccm93c2VyID0gZXhwb3J0cy5pbkJyb3dzZXIgPVxuXHQgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG5cdCAgdG9TdHJpbmcuY2FsbCh3aW5kb3cpICE9PSAnW29iamVjdCBPYmplY3RdJ1xuXG5cdC8qKlxuXHQgKiBEZWZlciBhIHRhc2sgdG8gdGhlIHN0YXJ0IG9mIHRoZSBuZXh0IGV2ZW50IGxvb3Bcblx0ICpcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2Jcblx0ICogQHBhcmFtIHtPYmplY3R9IGN0eFxuXHQgKi9cblxuXHR2YXIgZGVmZXIgPSBpbkJyb3dzZXJcblx0ICA/ICh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG5cdCAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG5cdCAgICBzZXRUaW1lb3V0KVxuXHQgIDogc2V0VGltZW91dFxuXG5cdGV4cG9ydHMubmV4dFRpY2sgPSBmdW5jdGlvbiAoY2IsIGN0eCkge1xuXHQgIGlmIChjdHgpIHtcblx0ICAgIGRlZmVyKGZ1bmN0aW9uICgpIHsgY2IuY2FsbChjdHgpIH0sIDApXG5cdCAgfSBlbHNlIHtcblx0ICAgIGRlZmVyKGNiLCAwKVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlY3QgaWYgd2UgYXJlIGluIElFOS4uLlxuXHQgKlxuXHQgKiBAdHlwZSB7Qm9vbGVhbn1cblx0ICovXG5cblx0ZXhwb3J0cy5pc0lFOSA9XG5cdCAgaW5Ccm93c2VyICYmXG5cdCAgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdNU0lFIDkuMCcpID4gMFxuXG5cdC8qKlxuXHQgKiBTbmlmZiB0cmFuc2l0aW9uL2FuaW1hdGlvbiBldmVudHNcblx0ICovXG5cblx0aWYgKGluQnJvd3NlciAmJiAhZXhwb3J0cy5pc0lFOSkge1xuXHQgIHZhciBpc1dlYmtpdFRyYW5zID1cblx0ICAgIHdpbmRvdy5vbnRyYW5zaXRpb25lbmQgPT09IHVuZGVmaW5lZCAmJlxuXHQgICAgd2luZG93Lm9ud2Via2l0dHJhbnNpdGlvbmVuZCAhPT0gdW5kZWZpbmVkXG5cdCAgdmFyIGlzV2Via2l0QW5pbSA9XG5cdCAgICB3aW5kb3cub25hbmltYXRpb25lbmQgPT09IHVuZGVmaW5lZCAmJlxuXHQgICAgd2luZG93Lm9ud2Via2l0YW5pbWF0aW9uZW5kICE9PSB1bmRlZmluZWRcblx0ICBleHBvcnRzLnRyYW5zaXRpb25Qcm9wID0gaXNXZWJraXRUcmFuc1xuXHQgICAgPyAnV2Via2l0VHJhbnNpdGlvbidcblx0ICAgIDogJ3RyYW5zaXRpb24nXG5cdCAgZXhwb3J0cy50cmFuc2l0aW9uRW5kRXZlbnQgPSBpc1dlYmtpdFRyYW5zXG5cdCAgICA/ICd3ZWJraXRUcmFuc2l0aW9uRW5kJ1xuXHQgICAgOiAndHJhbnNpdGlvbmVuZCdcblx0ICBleHBvcnRzLmFuaW1hdGlvblByb3AgPSBpc1dlYmtpdEFuaW1cblx0ICAgID8gJ1dlYmtpdEFuaW1hdGlvbidcblx0ICAgIDogJ2FuaW1hdGlvbidcblx0ICBleHBvcnRzLmFuaW1hdGlvbkVuZEV2ZW50ID0gaXNXZWJraXRBbmltXG5cdCAgICA/ICd3ZWJraXRBbmltYXRpb25FbmQnXG5cdCAgICA6ICdhbmltYXRpb25lbmQnXG5cdH1cblxuLyoqKi8gfSxcbi8qIDE2ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgY29uZmlnID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMClcblxuXHQvKipcblx0ICogQ2hlY2sgaWYgYSBub2RlIGlzIGluIHRoZSBkb2N1bWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtOb2RlfSBub2RlXG5cdCAqIEByZXR1cm4ge0Jvb2xlYW59XG5cdCAqL1xuXG5cdHZhciBkb2MgPVxuXHQgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiZcblx0ICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblxuXHRleHBvcnRzLmluRG9jID0gZnVuY3Rpb24gKG5vZGUpIHtcblx0ICByZXR1cm4gZG9jICYmIGRvYy5jb250YWlucyhub2RlKVxuXHR9XG5cblx0LyoqXG5cdCAqIEV4dHJhY3QgYW4gYXR0cmlidXRlIGZyb20gYSBub2RlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge05vZGV9IG5vZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGF0dHJcblx0ICovXG5cblx0ZXhwb3J0cy5hdHRyID0gZnVuY3Rpb24gKG5vZGUsIGF0dHIpIHtcblx0ICBhdHRyID0gY29uZmlnLnByZWZpeCArIGF0dHJcblx0ICB2YXIgdmFsID0gbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cilcblx0ICBpZiAodmFsICE9PSBudWxsKSB7XG5cdCAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyKVxuXHQgIH1cblx0ICByZXR1cm4gdmFsXG5cdH1cblxuXHQvKipcblx0ICogSW5zZXJ0IGVsIGJlZm9yZSB0YXJnZXRcblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCBcblx0ICovXG5cblx0ZXhwb3J0cy5iZWZvcmUgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuXHQgIHRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbCwgdGFyZ2V0KVxuXHR9XG5cblx0LyoqXG5cdCAqIEluc2VydCBlbCBhZnRlciB0YXJnZXRcblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldCBcblx0ICovXG5cblx0ZXhwb3J0cy5hZnRlciA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG5cdCAgaWYgKHRhcmdldC5uZXh0U2libGluZykge1xuXHQgICAgZXhwb3J0cy5iZWZvcmUoZWwsIHRhcmdldC5uZXh0U2libGluZylcblx0ICB9IGVsc2Uge1xuXHQgICAgdGFyZ2V0LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZWwpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBlbCBmcm9tIERPTVxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqL1xuXG5cdGV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKGVsKSB7XG5cdCAgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcblx0fVxuXG5cdC8qKlxuXHQgKiBQcmVwZW5kIGVsIHRvIHRhcmdldFxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0IFxuXHQgKi9cblxuXHRleHBvcnRzLnByZXBlbmQgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuXHQgIGlmICh0YXJnZXQuZmlyc3RDaGlsZCkge1xuXHQgICAgZXhwb3J0cy5iZWZvcmUoZWwsIHRhcmdldC5maXJzdENoaWxkKVxuXHQgIH0gZWxzZSB7XG5cdCAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoZWwpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2UgdGFyZ2V0IHdpdGggZWxcblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKi9cblxuXHRleHBvcnRzLnJlcGxhY2UgPSBmdW5jdGlvbiAodGFyZ2V0LCBlbCkge1xuXHQgIHZhciBwYXJlbnQgPSB0YXJnZXQucGFyZW50Tm9kZVxuXHQgIGlmIChwYXJlbnQpIHtcblx0ICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQoZWwsIHRhcmdldClcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ29weSBhdHRyaWJ1dGVzIGZyb20gb25lIGVsZW1lbnQgdG8gYW5vdGhlci5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBmcm9tXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gdG9cblx0ICovXG5cblx0ZXhwb3J0cy5jb3B5QXR0cmlidXRlcyA9IGZ1bmN0aW9uIChmcm9tLCB0bykge1xuXHQgIGlmIChmcm9tLmhhc0F0dHJpYnV0ZXMoKSkge1xuXHQgICAgdmFyIGF0dHJzID0gZnJvbS5hdHRyaWJ1dGVzXG5cdCAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF0dHJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHQgICAgICB2YXIgYXR0ciA9IGF0dHJzW2ldXG5cdCAgICAgIHRvLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpXG5cdCAgICB9XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBldmVudCBsaXN0ZW5lciBzaG9ydGhhbmQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gZWxcblx0ICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG5cdCAqL1xuXG5cdGV4cG9ydHMub24gPSBmdW5jdGlvbiAoZWwsIGV2ZW50LCBjYikge1xuXHQgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBldmVudCBsaXN0ZW5lciBzaG9ydGhhbmQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gZWxcblx0ICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG5cdCAqL1xuXG5cdGV4cG9ydHMub2ZmID0gZnVuY3Rpb24gKGVsLCBldmVudCwgY2IpIHtcblx0ICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBjYilcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgY2xhc3Mgd2l0aCBjb21wYXRpYmlsaXR5IGZvciBJRSAmIFNWR1xuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7U3Ryb25nfSBjbHNcblx0ICovXG5cblx0ZXhwb3J0cy5hZGRDbGFzcyA9IGZ1bmN0aW9uIChlbCwgY2xzKSB7XG5cdCAgaWYgKGVsLmNsYXNzTGlzdCkge1xuXHQgICAgZWwuY2xhc3NMaXN0LmFkZChjbHMpXG5cdCAgfSBlbHNlIHtcblx0ICAgIHZhciBjdXIgPSAnICcgKyAoZWwuZ2V0QXR0cmlidXRlKCdjbGFzcycpIHx8ICcnKSArICcgJ1xuXHQgICAgaWYgKGN1ci5pbmRleE9mKCcgJyArIGNscyArICcgJykgPCAwKSB7XG5cdCAgICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAoY3VyICsgY2xzKS50cmltKCkpXG5cdCAgICB9XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBjbGFzcyB3aXRoIGNvbXBhdGliaWxpdHkgZm9yIElFICYgU1ZHXG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gZWxcblx0ICogQHBhcmFtIHtTdHJvbmd9IGNsc1xuXHQgKi9cblxuXHRleHBvcnRzLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKGVsLCBjbHMpIHtcblx0ICBpZiAoZWwuY2xhc3NMaXN0KSB7XG5cdCAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGNscylcblx0ICB9IGVsc2Uge1xuXHQgICAgdmFyIGN1ciA9ICcgJyArIChlbC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykgfHwgJycpICsgJyAnXG5cdCAgICB2YXIgdGFyID0gJyAnICsgY2xzICsgJyAnXG5cdCAgICB3aGlsZSAoY3VyLmluZGV4T2YodGFyKSA+PSAwKSB7XG5cdCAgICAgIGN1ciA9IGN1ci5yZXBsYWNlKHRhciwgJyAnKVxuXHQgICAgfVxuXHQgICAgZWwuc2V0QXR0cmlidXRlKCdjbGFzcycsIGN1ci50cmltKCkpXG5cdCAgfVxuXHR9XG5cbi8qKiovIH0sXG4vKiAxNyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE4KVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlIHJlYWQgJiB3cml0ZSBmaWx0ZXJzIGZvciBhIHZtIGluc3RhbmNlLiBUaGVcblx0ICogZmlsdGVycyBkZXNjcmlwdG9yIEFycmF5IGNvbWVzIGZyb20gdGhlIGRpcmVjdGl2ZSBwYXJzZXIuXG5cdCAqXG5cdCAqIFRoaXMgaXMgZXh0cmFjdGVkIGludG8gaXRzIG93biB1dGlsaXR5IHNvIGl0IGNhblxuXHQgKiBiZSB1c2VkIGluIG11bHRpcGxlIHNjZW5hcmlvcy5cblx0ICpcblx0ICogQHBhcmFtIHtWdWV9IHZtXG5cdCAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gZmlsdGVyc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gW3RhcmdldF1cblx0ICogQHJldHVybiB7T2JqZWN0fVxuXHQgKi9cblxuXHRleHBvcnRzLnJlc29sdmVGaWx0ZXJzID0gZnVuY3Rpb24gKHZtLCBmaWx0ZXJzLCB0YXJnZXQpIHtcblx0ICBpZiAoIWZpbHRlcnMpIHtcblx0ICAgIHJldHVyblxuXHQgIH1cblx0ICB2YXIgcmVzID0gdGFyZ2V0IHx8IHt9XG5cdCAgLy8gdmFyIHJlZ2lzdHJ5ID0gdm0uJG9wdGlvbnMuZmlsdGVyc1xuXHQgIGZpbHRlcnMuZm9yRWFjaChmdW5jdGlvbiAoZikge1xuXHQgICAgdmFyIGRlZiA9IHZtLiRvcHRpb25zLmZpbHRlcnNbZi5uYW1lXVxuXHQgICAgXy5hc3NlcnRBc3NldChkZWYsICdmaWx0ZXInLCBmLm5hbWUpXG5cdCAgICBpZiAoIWRlZikgcmV0dXJuXG5cdCAgICB2YXIgYXJncyA9IGYuYXJnc1xuXHQgICAgdmFyIHJlYWRlciwgd3JpdGVyXG5cdCAgICBpZiAodHlwZW9mIGRlZiA9PT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgICByZWFkZXIgPSBkZWZcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIHJlYWRlciA9IGRlZi5yZWFkXG5cdCAgICAgIHdyaXRlciA9IGRlZi53cml0ZVxuXHQgICAgfVxuXHQgICAgaWYgKHJlYWRlcikge1xuXHQgICAgICBpZiAoIXJlcy5yZWFkKSByZXMucmVhZCA9IFtdXG5cdCAgICAgIHJlcy5yZWFkLnB1c2goZnVuY3Rpb24gKHZhbHVlKSB7XG5cdCAgICAgICAgcmV0dXJuIGFyZ3Ncblx0ICAgICAgICAgID8gcmVhZGVyLmFwcGx5KHZtLCBbdmFsdWVdLmNvbmNhdChhcmdzKSlcblx0ICAgICAgICAgIDogcmVhZGVyLmNhbGwodm0sIHZhbHVlKVxuXHQgICAgICB9KVxuXHQgICAgfVxuXHQgICAgaWYgKHdyaXRlcikge1xuXHQgICAgICBpZiAoIXJlcy53cml0ZSkgcmVzLndyaXRlID0gW11cblx0ICAgICAgcmVzLndyaXRlLnB1c2goZnVuY3Rpb24gKHZhbHVlLCBvbGRWYWwpIHtcblx0ICAgICAgICByZXR1cm4gYXJnc1xuXHQgICAgICAgICAgPyB3cml0ZXIuYXBwbHkodm0sIFt2YWx1ZSwgb2xkVmFsXS5jb25jYXQoYXJncykpXG5cdCAgICAgICAgICA6IHdyaXRlci5jYWxsKHZtLCB2YWx1ZSwgb2xkVmFsKVxuXHQgICAgICB9KVxuXHQgICAgfVxuXHQgIH0pXG5cdCAgcmV0dXJuIHJlc1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5IGZpbHRlcnMgdG8gYSB2YWx1ZVxuXHQgKlxuXHQgKiBAcGFyYW0geyp9IHZhbHVlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGZpbHRlcnNcblx0ICogQHBhcmFtIHtWdWV9IHZtXG5cdCAqIEBwYXJhbSB7Kn0gb2xkVmFsXG5cdCAqIEByZXR1cm4geyp9XG5cdCAqL1xuXG5cdGV4cG9ydHMuYXBwbHlGaWx0ZXJzID0gZnVuY3Rpb24gKHZhbHVlLCBmaWx0ZXJzLCB2bSwgb2xkVmFsKSB7XG5cdCAgaWYgKCFmaWx0ZXJzKSB7XG5cdCAgICByZXR1cm4gdmFsdWVcblx0ICB9XG5cdCAgZm9yICh2YXIgaSA9IDAsIGwgPSBmaWx0ZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHQgICAgdmFsdWUgPSBmaWx0ZXJzW2ldLmNhbGwodm0sIHZhbHVlLCBvbGRWYWwpXG5cdCAgfVxuXHQgIHJldHVybiB2YWx1ZVxuXHR9XG5cbi8qKiovIH0sXG4vKiAxOCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGNvbmZpZyA9IF9fd2VicGFja19yZXF1aXJlX18oMjApXG5cblx0LyoqXG5cdCAqIEVuYWJsZSBkZWJ1ZyB1dGlsaXRpZXMuIFRoZSBlbmFibGVEZWJ1ZygpIGZ1bmN0aW9uIGFuZFxuXHQgKiBhbGwgXy5sb2coKSAmIF8ud2FybigpIGNhbGxzIHdpbGwgYmUgZHJvcHBlZCBpbiB0aGVcblx0ICogbWluaWZpZWQgcHJvZHVjdGlvbiBidWlsZC5cblx0ICovXG5cblx0ZW5hYmxlRGVidWcoKVxuXG5cdGZ1bmN0aW9uIGVuYWJsZURlYnVnICgpIHtcblx0ICB2YXIgaGFzQ29uc29sZSA9IHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJ1xuXHQgIFxuXHQgIC8qKlxuXHQgICAqIExvZyBhIG1lc3NhZ2UuXG5cdCAgICpcblx0ICAgKiBAcGFyYW0ge1N0cmluZ30gbXNnXG5cdCAgICovXG5cblx0ICBleHBvcnRzLmxvZyA9IGZ1bmN0aW9uIChtc2cpIHtcblx0ICAgIGlmIChoYXNDb25zb2xlICYmIGNvbmZpZy5kZWJ1Zykge1xuXHQgICAgICBjb25zb2xlLmxvZygnW1Z1ZSBpbmZvXTogJyArIG1zZylcblx0ICAgIH1cblx0ICB9XG5cblx0ICAvKipcblx0ICAgKiBXZSd2ZSBnb3QgYSBwcm9ibGVtIGhlcmUuXG5cdCAgICpcblx0ICAgKiBAcGFyYW0ge1N0cmluZ30gbXNnXG5cdCAgICovXG5cblx0ICBleHBvcnRzLndhcm4gPSBmdW5jdGlvbiAobXNnKSB7XG5cdCAgICBpZiAoaGFzQ29uc29sZSAmJiAhY29uZmlnLnNpbGVudCkge1xuXHQgICAgICBjb25zb2xlLndhcm4oJ1tWdWUgd2Fybl06ICcgKyBtc2cpXG5cdCAgICAgIGlmIChjb25maWcuZGVidWcgJiYgY29uc29sZS50cmFjZSkge1xuXHQgICAgICAgIGNvbnNvbGUudHJhY2UoKVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfVxuXG5cdCAgLyoqXG5cdCAgICogQXNzZXJ0IGFzc2V0IGV4aXN0c1xuXHQgICAqL1xuXG5cdCAgZXhwb3J0cy5hc3NlcnRBc3NldCA9IGZ1bmN0aW9uICh2YWwsIHR5cGUsIGlkKSB7XG5cdCAgICBpZiAoIXZhbCkge1xuXHQgICAgICBleHBvcnRzLndhcm4oJ0ZhaWxlZCB0byByZXNvbHZlICcgKyB0eXBlICsgJzogJyArIGlkKVxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG4vKioqLyB9LFxuLyogMTkgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgZXh0ZW5kID0gXy5leHRlbmRcblxuXHQvKipcblx0ICogT3B0aW9uIG92ZXJ3cml0aW5nIHN0cmF0ZWdpZXMgYXJlIGZ1bmN0aW9ucyB0aGF0IGhhbmRsZVxuXHQgKiBob3cgdG8gbWVyZ2UgYSBwYXJlbnQgb3B0aW9uIHZhbHVlIGFuZCBhIGNoaWxkIG9wdGlvblxuXHQgKiB2YWx1ZSBpbnRvIHRoZSBmaW5hbCB2YWx1ZS5cblx0ICpcblx0ICogQWxsIHN0cmF0ZWd5IGZ1bmN0aW9ucyBmb2xsb3cgdGhlIHNhbWUgc2lnbmF0dXJlOlxuXHQgKlxuXHQgKiBAcGFyYW0geyp9IHBhcmVudFZhbFxuXHQgKiBAcGFyYW0geyp9IGNoaWxkVmFsXG5cdCAqIEBwYXJhbSB7VnVlfSBbdm1dXG5cdCAqL1xuXG5cdHZhciBzdHJhdHMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG5cblx0LyoqXG5cdCAqIERhdGFcblx0ICovXG5cblx0c3RyYXRzLmRhdGEgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCwgdm0pIHtcblx0ICAvLyBpbiBhIGNsYXNzIG1lcmdlLCBib3RoIHNob3VsZCBiZSBmdW5jdGlvbnNcblx0ICAvLyBzbyB3ZSBqdXN0IHJldHVybiBjaGlsZCBpZiBpdCBleGlzdHNcblx0ICBpZiAoIXZtKSB7XG5cdCAgICBpZiAoY2hpbGRWYWwgJiYgdHlwZW9mIGNoaWxkVmFsICE9PSAnZnVuY3Rpb24nKSB7XG5cdCAgICAgIF8ud2Fybihcblx0ICAgICAgICAnVGhlIFwiZGF0YVwiIG9wdGlvbiBzaG91bGQgYmUgYSBmdW5jdGlvbiAnICtcblx0ICAgICAgICAndGhhdCByZXR1cm5zIGEgcGVyLWluc3RhbmNlIHZhbHVlIGluIGNvbXBvbmVudCAnICtcblx0ICAgICAgICAnZGVmaW5pdGlvbnMuJ1xuXHQgICAgICApXG5cdCAgICAgIHJldHVyblxuXHQgICAgfVxuXHQgICAgcmV0dXJuIGNoaWxkVmFsIHx8IHBhcmVudFZhbFxuXHQgIH1cblx0ICB2YXIgaW5zdGFuY2VEYXRhID0gdHlwZW9mIGNoaWxkVmFsID09PSAnZnVuY3Rpb24nXG5cdCAgICA/IGNoaWxkVmFsLmNhbGwodm0pXG5cdCAgICA6IGNoaWxkVmFsXG5cdCAgdmFyIGRlZmF1bHREYXRhID0gdHlwZW9mIHBhcmVudFZhbCA9PT0gJ2Z1bmN0aW9uJ1xuXHQgICAgPyBwYXJlbnRWYWwuY2FsbCh2bSlcblx0ICAgIDogdW5kZWZpbmVkXG5cdCAgaWYgKGluc3RhbmNlRGF0YSkge1xuXHQgICAgLy8gbWl4IGRlZmF1bHQgZGF0YSBpbnRvIGluc3RhbmNlIGRhdGFcblx0ICAgIGZvciAodmFyIGtleSBpbiBkZWZhdWx0RGF0YSkge1xuXHQgICAgICBpZiAoIWluc3RhbmNlRGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdCAgICAgICAgaW5zdGFuY2VEYXRhLiRhZGQoa2V5LCBkZWZhdWx0RGF0YVtrZXldKVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgICByZXR1cm4gaW5zdGFuY2VEYXRhXG5cdCAgfSBlbHNlIHtcblx0ICAgIHJldHVybiBkZWZhdWx0RGF0YVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFbFxuXHQgKi9cblxuXHRzdHJhdHMuZWwgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCwgdm0pIHtcblx0ICBpZiAoIXZtICYmIGNoaWxkVmFsICYmIHR5cGVvZiBjaGlsZFZhbCAhPT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgXy53YXJuKFxuXHQgICAgICAnVGhlIFwiZWxcIiBvcHRpb24gc2hvdWxkIGJlIGEgZnVuY3Rpb24gJyArXG5cdCAgICAgICd0aGF0IHJldHVybnMgYSBwZXItaW5zdGFuY2UgdmFsdWUgaW4gY29tcG9uZW50ICcgK1xuXHQgICAgICAnZGVmaW5pdGlvbnMuJ1xuXHQgICAgKVxuXHQgICAgcmV0dXJuXG5cdCAgfVxuXHQgIHZhciByZXQgPSBjaGlsZFZhbCB8fCBwYXJlbnRWYWxcblx0ICAvLyBpbnZva2UgdGhlIGVsZW1lbnQgZmFjdG9yeSBpZiB0aGlzIGlzIGluc3RhbmNlIG1lcmdlXG5cdCAgcmV0dXJuIHZtICYmIHR5cGVvZiByZXQgPT09ICdmdW5jdGlvbidcblx0ICAgID8gcmV0LmNhbGwodm0pXG5cdCAgICA6IHJldFxuXHR9XG5cblx0LyoqXG5cdCAqIEhvb2tzIGFuZCBwYXJhbSBhdHRyaWJ1dGVzIGFyZSBtZXJnZWQgYXMgYXJyYXlzLlxuXHQgKi9cblxuXHRzdHJhdHMuY3JlYXRlZCA9XG5cdHN0cmF0cy5yZWFkeSA9XG5cdHN0cmF0cy5hdHRhY2hlZCA9XG5cdHN0cmF0cy5kZXRhY2hlZCA9XG5cdHN0cmF0cy5iZWZvcmVDb21waWxlID1cblx0c3RyYXRzLmNvbXBpbGVkID1cblx0c3RyYXRzLmJlZm9yZURlc3Ryb3kgPVxuXHRzdHJhdHMuZGVzdHJveWVkID1cblx0c3RyYXRzLnBhcmFtQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG5cdCAgcmV0dXJuIGNoaWxkVmFsXG5cdCAgICA/IHBhcmVudFZhbFxuXHQgICAgICA/IHBhcmVudFZhbC5jb25jYXQoY2hpbGRWYWwpXG5cdCAgICAgIDogXy5pc0FycmF5KGNoaWxkVmFsKVxuXHQgICAgICAgID8gY2hpbGRWYWxcblx0ICAgICAgICA6IFtjaGlsZFZhbF1cblx0ICAgIDogcGFyZW50VmFsXG5cdH1cblxuXHQvKipcblx0ICogQXNzZXRzXG5cdCAqXG5cdCAqIFdoZW4gYSB2bSBpcyBwcmVzZW50IChpbnN0YW5jZSBjcmVhdGlvbiksIHdlIG5lZWQgdG8gZG9cblx0ICogYSB0aHJlZS13YXkgbWVyZ2UgYmV0d2VlbiBjb25zdHJ1Y3RvciBvcHRpb25zLCBpbnN0YW5jZVxuXHQgKiBvcHRpb25zIGFuZCBwYXJlbnQgb3B0aW9ucy5cblx0ICovXG5cblx0c3RyYXRzLmRpcmVjdGl2ZXMgPVxuXHRzdHJhdHMuZmlsdGVycyA9XG5cdHN0cmF0cy5wYXJ0aWFscyA9XG5cdHN0cmF0cy50cmFuc2l0aW9ucyA9XG5cdHN0cmF0cy5jb21wb25lbnRzID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwsIHZtLCBrZXkpIHtcblx0ICB2YXIgcmV0ID0gT2JqZWN0LmNyZWF0ZShcblx0ICAgIHZtICYmIHZtLiRwYXJlbnRcblx0ICAgICAgPyB2bS4kcGFyZW50LiRvcHRpb25zW2tleV1cblx0ICAgICAgOiBfLlZ1ZS5vcHRpb25zW2tleV1cblx0ICApXG5cdCAgaWYgKHBhcmVudFZhbCkge1xuXHQgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhwYXJlbnRWYWwpXG5cdCAgICB2YXIgaSA9IGtleXMubGVuZ3RoXG5cdCAgICB2YXIgZmllbGRcblx0ICAgIHdoaWxlIChpLS0pIHtcblx0ICAgICAgZmllbGQgPSBrZXlzW2ldXG5cdCAgICAgIHJldFtmaWVsZF0gPSBwYXJlbnRWYWxbZmllbGRdXG5cdCAgICB9XG5cdCAgfVxuXHQgIGlmIChjaGlsZFZhbCkgZXh0ZW5kKHJldCwgY2hpbGRWYWwpXG5cdCAgcmV0dXJuIHJldFxuXHR9XG5cblx0LyoqXG5cdCAqIEV2ZW50cyAmIFdhdGNoZXJzLlxuXHQgKlxuXHQgKiBFdmVudHMgJiB3YXRjaGVycyBoYXNoZXMgc2hvdWxkIG5vdCBvdmVyd3JpdGUgb25lXG5cdCAqIGFub3RoZXIsIHNvIHdlIG1lcmdlIHRoZW0gYXMgYXJyYXlzLlxuXHQgKi9cblxuXHRzdHJhdHMud2F0Y2ggPVxuXHRzdHJhdHMuZXZlbnRzID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcblx0ICBpZiAoIWNoaWxkVmFsKSByZXR1cm4gcGFyZW50VmFsXG5cdCAgaWYgKCFwYXJlbnRWYWwpIHJldHVybiBjaGlsZFZhbFxuXHQgIHZhciByZXQgPSB7fVxuXHQgIGV4dGVuZChyZXQsIHBhcmVudFZhbClcblx0ICBmb3IgKHZhciBrZXkgaW4gY2hpbGRWYWwpIHtcblx0ICAgIHZhciBwYXJlbnQgPSByZXRba2V5XVxuXHQgICAgdmFyIGNoaWxkID0gY2hpbGRWYWxba2V5XVxuXHQgICAgcmV0W2tleV0gPSBwYXJlbnRcblx0ICAgICAgPyBwYXJlbnQuY29uY2F0KGNoaWxkKVxuXHQgICAgICA6IFtjaGlsZF1cblx0ICB9XG5cdCAgcmV0dXJuIHJldFxuXHR9XG5cblx0LyoqXG5cdCAqIE90aGVyIG9iamVjdCBoYXNoZXMuXG5cdCAqL1xuXG5cdHN0cmF0cy5tZXRob2RzID1cblx0c3RyYXRzLmNvbXB1dGVkID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcblx0ICBpZiAoIWNoaWxkVmFsKSByZXR1cm4gcGFyZW50VmFsXG5cdCAgaWYgKCFwYXJlbnRWYWwpIHJldHVybiBjaGlsZFZhbFxuXHQgIHZhciByZXQgPSBPYmplY3QuY3JlYXRlKHBhcmVudFZhbClcblx0ICBleHRlbmQocmV0LCBjaGlsZFZhbClcblx0ICByZXR1cm4gcmV0XG5cdH1cblxuXHQvKipcblx0ICogRGVmYXVsdCBzdHJhdGVneS5cblx0ICovXG5cblx0dmFyIGRlZmF1bHRTdHJhdCA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsKSB7XG5cdCAgcmV0dXJuIGNoaWxkVmFsID09PSB1bmRlZmluZWRcblx0ICAgID8gcGFyZW50VmFsXG5cdCAgICA6IGNoaWxkVmFsXG5cdH1cblxuXHQvKipcblx0ICogTWFrZSBzdXJlIGNvbXBvbmVudCBvcHRpb25zIGdldCBjb252ZXJ0ZWQgdG8gYWN0dWFsXG5cdCAqIGNvbnN0cnVjdG9ycy5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudHNcblx0ICovXG5cblx0ZnVuY3Rpb24gZ3VhcmRDb21wb25lbnRzIChjb21wb25lbnRzKSB7XG5cdCAgaWYgKGNvbXBvbmVudHMpIHtcblx0ICAgIHZhciBkZWZcblx0ICAgIGZvciAodmFyIGtleSBpbiBjb21wb25lbnRzKSB7XG5cdCAgICAgIGRlZiA9IGNvbXBvbmVudHNba2V5XVxuXHQgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KGRlZikpIHtcblx0ICAgICAgICBkZWYubmFtZSA9IGtleVxuXHQgICAgICAgIGNvbXBvbmVudHNba2V5XSA9IF8uVnVlLmV4dGVuZChkZWYpXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogTWVyZ2UgdHdvIG9wdGlvbiBvYmplY3RzIGludG8gYSBuZXcgb25lLlxuXHQgKiBDb3JlIHV0aWxpdHkgdXNlZCBpbiBib3RoIGluc3RhbnRpYXRpb24gYW5kIGluaGVyaXRhbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gcGFyZW50XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBjaGlsZFxuXHQgKiBAcGFyYW0ge1Z1ZX0gW3ZtXSAtIGlmIHZtIGlzIHByZXNlbnQsIGluZGljYXRlcyB0aGlzIGlzXG5cdCAqICAgICAgICAgICAgICAgICAgICAgYW4gaW5zdGFudGlhdGlvbiBtZXJnZS5cblx0ICovXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZU9wdGlvbnMgKHBhcmVudCwgY2hpbGQsIHZtKSB7XG5cdCAgZ3VhcmRDb21wb25lbnRzKGNoaWxkLmNvbXBvbmVudHMpXG5cdCAgdmFyIG9wdGlvbnMgPSB7fVxuXHQgIHZhciBrZXlcblx0ICBmb3IgKGtleSBpbiBwYXJlbnQpIHtcblx0ICAgIG1lcmdlKHBhcmVudFtrZXldLCBjaGlsZFtrZXldLCBrZXkpXG5cdCAgfVxuXHQgIGZvciAoa2V5IGluIGNoaWxkKSB7XG5cdCAgICBpZiAoIShwYXJlbnQuaGFzT3duUHJvcGVydHkoa2V5KSkpIHtcblx0ICAgICAgbWVyZ2UocGFyZW50W2tleV0sIGNoaWxkW2tleV0sIGtleSlcblx0ICAgIH1cblx0ICB9XG5cdCAgdmFyIG1peGlucyA9IGNoaWxkLm1peGluc1xuXHQgIGlmIChtaXhpbnMpIHtcblx0ICAgIGZvciAodmFyIGkgPSAwLCBsID0gbWl4aW5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHQgICAgICBmb3IgKGtleSBpbiBtaXhpbnNbaV0pIHtcblx0ICAgICAgICBtZXJnZShvcHRpb25zW2tleV0sIG1peGluc1tpXVtrZXldLCBrZXkpXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdCAgZnVuY3Rpb24gbWVyZ2UgKHBhcmVudFZhbCwgY2hpbGRWYWwsIGtleSkge1xuXHQgICAgdmFyIHN0cmF0ID0gc3RyYXRzW2tleV0gfHwgZGVmYXVsdFN0cmF0XG5cdCAgICBvcHRpb25zW2tleV0gPSBzdHJhdChwYXJlbnRWYWwsIGNoaWxkVmFsLCB2bSwga2V5KVxuXHQgIH1cblx0ICByZXR1cm4gb3B0aW9uc1xuXHR9XG5cbi8qKiovIH0sXG4vKiAyMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0ICAvKipcblx0ICAgKiBUaGUgcHJlZml4IHRvIGxvb2sgZm9yIHdoZW4gcGFyc2luZyBkaXJlY3RpdmVzLlxuXHQgICAqXG5cdCAgICogQHR5cGUge1N0cmluZ31cblx0ICAgKi9cblxuXHQgIHByZWZpeDogJ3YtJyxcblxuXHQgIC8qKlxuXHQgICAqIFdoZXRoZXIgdG8gcHJpbnQgZGVidWcgbWVzc2FnZXMuXG5cdCAgICogQWxzbyBlbmFibGVzIHN0YWNrIHRyYWNlIGZvciB3YXJuaW5ncy5cblx0ICAgKlxuXHQgICAqIEB0eXBlIHtCb29sZWFufVxuXHQgICAqL1xuXG5cdCAgZGVidWc6IGZhbHNlLFxuXG5cdCAgLyoqXG5cdCAgICogV2hldGhlciB0byBzdXBwcmVzcyB3YXJuaW5ncy5cblx0ICAgKlxuXHQgICAqIEB0eXBlIHtCb29sZWFufVxuXHQgICAqL1xuXG5cdCAgc2lsZW50OiBmYWxzZSxcblxuXHQgIC8qKlxuXHQgICAqIFdoZXRoZXIgYWxsb3cgb2JzZXJ2ZXIgdG8gYWx0ZXIgZGF0YSBvYmplY3RzJ1xuXHQgICAqIF9fcHJvdG9fXy5cblx0ICAgKlxuXHQgICAqIEB0eXBlIHtCb29sZWFufVxuXHQgICAqL1xuXG5cdCAgcHJvdG86IHRydWUsXG5cblx0ICAvKipcblx0ICAgKiBXaGV0aGVyIHRvIHBhcnNlIG11c3RhY2hlIHRhZ3MgaW4gdGVtcGxhdGVzLlxuXHQgICAqXG5cdCAgICogQHR5cGUge0Jvb2xlYW59XG5cdCAgICovXG5cblx0ICBpbnRlcnBvbGF0ZTogdHJ1ZSxcblxuXHQgIC8qKlxuXHQgICAqIFdoZXRoZXIgdG8gdXNlIGFzeW5jIHJlbmRlcmluZy5cblx0ICAgKi9cblxuXHQgIGFzeW5jOiB0cnVlLFxuXG5cdCAgLyoqXG5cdCAgICogSW50ZXJuYWwgZmxhZyB0byBpbmRpY2F0ZSB0aGUgZGVsaW1pdGVycyBoYXZlIGJlZW5cblx0ICAgKiBjaGFuZ2VkLlxuXHQgICAqXG5cdCAgICogQHR5cGUge0Jvb2xlYW59XG5cdCAgICovXG5cblx0ICBfZGVsaW1pdGVyc0NoYW5nZWQ6IHRydWVcblxuXHR9XG5cblx0LyoqXG5cdCAqIEludGVycG9sYXRpb24gZGVsaW1pdGVycy5cblx0ICogV2UgbmVlZCB0byBtYXJrIHRoZSBjaGFuZ2VkIGZsYWcgc28gdGhhdCB0aGUgdGV4dCBwYXJzZXJcblx0ICoga25vd3MgaXQgbmVlZHMgdG8gcmVjb21waWxlIHRoZSByZWdleC5cblx0ICpcblx0ICogQHR5cGUge0FycmF5PFN0cmluZz59XG5cdCAqL1xuXG5cdHZhciBkZWxpbWl0ZXJzID0gWyd7eycsICd9fSddXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ2RlbGltaXRlcnMnLCB7XG5cdCAgZ2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICByZXR1cm4gZGVsaW1pdGVyc1xuXHQgIH0sXG5cdCAgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG5cdCAgICBkZWxpbWl0ZXJzID0gdmFsXG5cdCAgICB0aGlzLl9kZWxpbWl0ZXJzQ2hhbmdlZCA9IHRydWVcblx0ICB9XG5cdH0pXG5cbi8qKiovIH0sXG4vKiAyMSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBjb25maWcgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIwKVxuXHR2YXIgT2JzZXJ2ZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQ5KVxuXHR2YXIgZXhwUGFyc2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0NClcblx0dmFyIEJhdGNoZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUwKVxuXG5cdHZhciBiYXRjaGVyID0gbmV3IEJhdGNoZXIoKVxuXHR2YXIgdWlkID0gMFxuXG5cdC8qKlxuXHQgKiBBIHdhdGNoZXIgcGFyc2VzIGFuIGV4cHJlc3Npb24sIGNvbGxlY3RzIGRlcGVuZGVuY2llcyxcblx0ICogYW5kIGZpcmVzIGNhbGxiYWNrIHdoZW4gdGhlIGV4cHJlc3Npb24gdmFsdWUgY2hhbmdlcy5cblx0ICogVGhpcyBpcyB1c2VkIGZvciBib3RoIHRoZSAkd2F0Y2goKSBhcGkgYW5kIGRpcmVjdGl2ZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZXhwcmVzc2lvblxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuXHQgKiBAcGFyYW0ge0FycmF5fSBbZmlsdGVyc11cblx0ICogQHBhcmFtIHtCb29sZWFufSBbbmVlZFNldF1cblx0ICogQHBhcmFtIHtCb29sZWFufSBbZGVlcF1cblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIFdhdGNoZXIgKHZtLCBleHByZXNzaW9uLCBjYiwgZmlsdGVycywgbmVlZFNldCwgZGVlcCkge1xuXHQgIHRoaXMudm0gPSB2bVxuXHQgIHZtLl93YXRjaGVyTGlzdC5wdXNoKHRoaXMpXG5cdCAgdGhpcy5leHByZXNzaW9uID0gZXhwcmVzc2lvblxuXHQgIHRoaXMuY2JzID0gW2NiXVxuXHQgIHRoaXMuaWQgPSArK3VpZCAvLyB1aWQgZm9yIGJhdGNoaW5nXG5cdCAgdGhpcy5hY3RpdmUgPSB0cnVlXG5cdCAgdGhpcy5kZWVwID0gZGVlcFxuXHQgIHRoaXMuZGVwcyA9IE9iamVjdC5jcmVhdGUobnVsbClcblx0ICAvLyBzZXR1cCBmaWx0ZXJzIGlmIGFueS5cblx0ICAvLyBXZSBkZWxlZ2F0ZSBkaXJlY3RpdmUgZmlsdGVycyBoZXJlIHRvIHRoZSB3YXRjaGVyXG5cdCAgLy8gYmVjYXVzZSB0aGV5IG5lZWQgdG8gYmUgaW5jbHVkZWQgaW4gdGhlIGRlcGVuZGVuY3lcblx0ICAvLyBjb2xsZWN0aW9uIHByb2Nlc3MuXG5cdCAgdGhpcy5yZWFkRmlsdGVycyA9IGZpbHRlcnMgJiYgZmlsdGVycy5yZWFkXG5cdCAgdGhpcy53cml0ZUZpbHRlcnMgPSBmaWx0ZXJzICYmIGZpbHRlcnMud3JpdGVcblx0ICAvLyBwYXJzZSBleHByZXNzaW9uIGZvciBnZXR0ZXIvc2V0dGVyXG5cdCAgdmFyIHJlcyA9IGV4cFBhcnNlci5wYXJzZShleHByZXNzaW9uLCBuZWVkU2V0KVxuXHQgIHRoaXMuZ2V0dGVyID0gcmVzLmdldFxuXHQgIHRoaXMuc2V0dGVyID0gcmVzLnNldFxuXHQgIHRoaXMudmFsdWUgPSB0aGlzLmdldCgpXG5cdH1cblxuXHR2YXIgcCA9IFdhdGNoZXIucHJvdG90eXBlXG5cblx0LyoqXG5cdCAqIEFkZCBhIGJpbmRpbmcgZGVwZW5kZW5jeSB0byB0aGlzIGRpcmVjdGl2ZS5cblx0ICpcblx0ICogQHBhcmFtIHtCaW5kaW5nfSBiaW5kaW5nXG5cdCAqL1xuXG5cdHAuYWRkRGVwID0gZnVuY3Rpb24gKGJpbmRpbmcpIHtcblx0ICB2YXIgaWQgPSBiaW5kaW5nLmlkXG5cdCAgaWYgKCF0aGlzLm5ld0RlcHNbaWRdKSB7XG5cdCAgICB0aGlzLm5ld0RlcHNbaWRdID0gYmluZGluZ1xuXHQgICAgaWYgKCF0aGlzLmRlcHNbaWRdKSB7XG5cdCAgICAgIHRoaXMuZGVwc1tpZF0gPSBiaW5kaW5nXG5cdCAgICAgIGJpbmRpbmcuYWRkU3ViKHRoaXMpXG5cdCAgICB9XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIEV2YWx1YXRlIHRoZSBnZXR0ZXIsIGFuZCByZS1jb2xsZWN0IGRlcGVuZGVuY2llcy5cblx0ICovXG5cblx0cC5nZXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgdGhpcy5iZWZvcmVHZXQoKVxuXHQgIHZhciB2bSA9IHRoaXMudm1cblx0ICB2YXIgdmFsdWVcblx0ICB0cnkge1xuXHQgICAgdmFsdWUgPSB0aGlzLmdldHRlci5jYWxsKHZtLCB2bSlcblx0ICB9IGNhdGNoIChlKSB7fVxuXHQgIC8vIHVzZSBKU09OLnN0cmluZ2lmeSB0byBcInRvdWNoXCIgZXZlcnkgcHJvcGVydHlcblx0ICAvLyBzbyB0aGV5IGFyZSBhbGwgdHJhY2tlZCBhcyBkZXBlbmRlbmNpZXMgZm9yXG5cdCAgLy8gZGVlcCB3YXRjaGluZ1xuXHQgIGlmICh0aGlzLmRlZXApIEpTT04uc3RyaW5naWZ5KHZhbHVlKVxuXHQgIHZhbHVlID0gXy5hcHBseUZpbHRlcnModmFsdWUsIHRoaXMucmVhZEZpbHRlcnMsIHZtKVxuXHQgIHRoaXMuYWZ0ZXJHZXQoKVxuXHQgIHJldHVybiB2YWx1ZVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZSB3aXRoIHRoZSBzZXR0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWVcblx0ICovXG5cblx0cC5zZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICB2YXIgdm0gPSB0aGlzLnZtXG5cdCAgdmFsdWUgPSBfLmFwcGx5RmlsdGVycyhcblx0ICAgIHZhbHVlLCB0aGlzLndyaXRlRmlsdGVycywgdm0sIHRoaXMudmFsdWVcblx0ICApXG5cdCAgdHJ5IHtcblx0ICAgIHRoaXMuc2V0dGVyLmNhbGwodm0sIHZtLCB2YWx1ZSlcblx0ICB9IGNhdGNoIChlKSB7fVxuXHR9XG5cblx0LyoqXG5cdCAqIFByZXBhcmUgZm9yIGRlcGVuZGVuY3kgY29sbGVjdGlvbi5cblx0ICovXG5cblx0cC5iZWZvcmVHZXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgT2JzZXJ2ZXIudGFyZ2V0ID0gdGhpc1xuXHQgIHRoaXMubmV3RGVwcyA9IHt9XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYW4gdXAgZm9yIGRlcGVuZGVuY3kgY29sbGVjdGlvbi5cblx0ICovXG5cblx0cC5hZnRlckdldCA9IGZ1bmN0aW9uICgpIHtcblx0ICBPYnNlcnZlci50YXJnZXQgPSBudWxsXG5cdCAgZm9yICh2YXIgaWQgaW4gdGhpcy5kZXBzKSB7XG5cdCAgICBpZiAoIXRoaXMubmV3RGVwc1tpZF0pIHtcblx0ICAgICAgdGhpcy5kZXBzW2lkXS5yZW1vdmVTdWIodGhpcylcblx0ICAgIH1cblx0ICB9XG5cdCAgdGhpcy5kZXBzID0gdGhpcy5uZXdEZXBzXG5cdH1cblxuXHQvKipcblx0ICogU3Vic2NyaWJlciBpbnRlcmZhY2UuXG5cdCAqIFdpbGwgYmUgY2FsbGVkIHdoZW4gYSBkZXBlbmRlbmN5IGNoYW5nZXMuXG5cdCAqL1xuXG5cdHAudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuXHQgIGlmIChjb25maWcuYXN5bmMpIHtcblx0ICAgIGJhdGNoZXIucHVzaCh0aGlzKVxuXHQgIH0gZWxzZSB7XG5cdCAgICB0aGlzLnJ1bigpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIEJhdGNoZXIgam9iIGludGVyZmFjZS5cblx0ICogV2lsbCBiZSBjYWxsZWQgYnkgdGhlIGJhdGNoZXIuXG5cdCAqL1xuXG5cdHAucnVuID0gZnVuY3Rpb24gKCkge1xuXHQgIGlmICh0aGlzLmFjdGl2ZSkge1xuXHQgICAgdmFyIHZhbHVlID0gdGhpcy5nZXQoKVxuXHQgICAgaWYgKFxuXHQgICAgICAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkgfHxcblx0ICAgICAgdmFsdWUgIT09IHRoaXMudmFsdWVcblx0ICAgICkge1xuXHQgICAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLnZhbHVlXG5cdCAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuXHQgICAgICB2YXIgY2JzID0gdGhpcy5jYnNcblx0ICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdCAgICAgICAgY2JzW2ldKHZhbHVlLCBvbGRWYWx1ZSlcblx0ICAgICAgICAvLyBpZiBhIGNhbGxiYWNrIGFsc28gcmVtb3ZlZCBvdGhlciBjYWxsYmFja3MsXG5cdCAgICAgICAgLy8gd2UgbmVlZCB0byBhZGp1c3QgdGhlIGxvb3AgYWNjb3JkaW5nbHkuXG5cdCAgICAgICAgdmFyIHJlbW92ZWQgPSBsIC0gY2JzLmxlbmd0aFxuXHQgICAgICAgIGlmIChyZW1vdmVkKSB7XG5cdCAgICAgICAgICBpIC09IHJlbW92ZWRcblx0ICAgICAgICAgIGwgLT0gcmVtb3ZlZFxuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYSBjYWxsYmFjay5cblx0ICpcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2Jcblx0ICovXG5cblx0cC5hZGRDYiA9IGZ1bmN0aW9uIChjYikge1xuXHQgIHRoaXMuY2JzLnB1c2goY2IpXG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlIGEgY2FsbGJhY2suXG5cdCAqXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG5cdCAqL1xuXG5cdHAucmVtb3ZlQ2IgPSBmdW5jdGlvbiAoY2IpIHtcblx0ICB2YXIgY2JzID0gdGhpcy5jYnNcblx0ICBpZiAoY2JzLmxlbmd0aCA+IDEpIHtcblx0ICAgIHZhciBpID0gY2JzLmluZGV4T2YoY2IpXG5cdCAgICBpZiAoaSA+IC0xKSB7XG5cdCAgICAgIGNicy5zcGxpY2UoaSwgMSlcblx0ICAgIH1cblx0ICB9IGVsc2UgaWYgKGNiID09PSBjYnNbMF0pIHtcblx0ICAgIHRoaXMudGVhcmRvd24oKVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgc2VsZiBmcm9tIGFsbCBkZXBlbmRlbmNpZXMnIHN1YmNyaWJlciBsaXN0LlxuXHQgKi9cblxuXHRwLnRlYXJkb3duID0gZnVuY3Rpb24gKCkge1xuXHQgIGlmICh0aGlzLmFjdGl2ZSkge1xuXHQgICAgLy8gcmVtb3ZlIHNlbGYgZnJvbSB2bSdzIHdhdGNoZXIgbGlzdFxuXHQgICAgLy8gd2UgY2FuIHNraXAgdGhpcyBpZiB0aGUgdm0gaWYgYmVpbmcgZGVzdHJveWVkXG5cdCAgICAvLyB3aGljaCBjYW4gaW1wcm92ZSB0ZWFyZG93biBwZXJmb3JtYW5jZS5cblx0ICAgIGlmICghdGhpcy52bS5faXNCZWluZ0Rlc3Ryb3llZCkge1xuXHQgICAgICB2YXIgbGlzdCA9IHRoaXMudm0uX3dhdGNoZXJMaXN0XG5cdCAgICAgIGxpc3Quc3BsaWNlKGxpc3QuaW5kZXhPZih0aGlzKSlcblx0ICAgIH1cblx0ICAgIGZvciAodmFyIGlkIGluIHRoaXMuZGVwcykge1xuXHQgICAgICB0aGlzLmRlcHNbaWRdLnJlbW92ZVN1Yih0aGlzKVxuXHQgICAgfVxuXHQgICAgdGhpcy5hY3RpdmUgPSBmYWxzZVxuXHQgICAgdGhpcy52bSA9IHRoaXMuY2JzID0gdGhpcy52YWx1ZSA9IG51bGxcblx0ICB9XG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cyA9IFdhdGNoZXJcblxuLyoqKi8gfSxcbi8qIDIyICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblxuXHRtb2R1bGUuZXhwb3J0cyA9IHtcblxuXHQgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHRoaXMuYXR0ciA9IHRoaXMuZWwubm9kZVR5cGUgPT09IDNcblx0ICAgICAgPyAnbm9kZVZhbHVlJ1xuXHQgICAgICA6ICd0ZXh0Q29udGVudCdcblx0ICB9LFxuXG5cdCAgdXBkYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICAgIHRoaXMuZWxbdGhpcy5hdHRyXSA9IF8udG9TdHJpbmcodmFsdWUpXG5cdCAgfVxuXHQgIFxuXHR9XG5cbi8qKiovIH0sXG4vKiAyMyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciB0ZW1wbGF0ZVBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNTEpXG5cblx0bW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0ICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAvLyBhIGNvbW1lbnQgbm9kZSBtZWFucyB0aGlzIGlzIGEgYmluZGluZyBmb3Jcblx0ICAgIC8vIHt7eyBpbmxpbmUgdW5lc2NhcGVkIGh0bWwgfX19XG5cdCAgICBpZiAodGhpcy5lbC5ub2RlVHlwZSA9PT0gOCkge1xuXHQgICAgICAvLyBob2xkIG5vZGVzXG5cdCAgICAgIHRoaXMubm9kZXMgPSBbXVxuXHQgICAgfVxuXHQgIH0sXG5cblx0ICB1cGRhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgICAgdmFsdWUgPSBfLnRvU3RyaW5nKHZhbHVlKVxuXHQgICAgaWYgKHRoaXMubm9kZXMpIHtcblx0ICAgICAgdGhpcy5zd2FwKHZhbHVlKVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSB2YWx1ZVxuXHQgICAgfVxuXHQgIH0sXG5cblx0ICBzd2FwOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICAgIC8vIHJlbW92ZSBvbGQgbm9kZXNcblx0ICAgIHZhciBpID0gdGhpcy5ub2Rlcy5sZW5ndGhcblx0ICAgIHdoaWxlIChpLS0pIHtcblx0ICAgICAgXy5yZW1vdmUodGhpcy5ub2Rlc1tpXSlcblx0ICAgIH1cblx0ICAgIC8vIGNvbnZlcnQgbmV3IHZhbHVlIHRvIGEgZnJhZ21lbnRcblx0ICAgIHZhciBmcmFnID0gdGVtcGxhdGVQYXJzZXIucGFyc2UodmFsdWUsIHRydWUpXG5cdCAgICAvLyBzYXZlIGEgcmVmZXJlbmNlIHRvIHRoZXNlIG5vZGVzIHNvIHdlIGNhbiByZW1vdmUgbGF0ZXJcblx0ICAgIHRoaXMubm9kZXMgPSBfLnRvQXJyYXkoZnJhZy5jaGlsZE5vZGVzKVxuXHQgICAgXy5iZWZvcmUoZnJhZywgdGhpcy5lbClcblx0ICB9XG5cblx0fVxuXG4vKioqLyB9LFxuLyogMjQgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdC8vIHhsaW5rXG5cdHZhciB4bGlua05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnXG5cdHZhciB4bGlua1JFID0gL154bGluazovXG5cblx0bW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0ICBwcmlvcml0eTogODUwLFxuXG5cdCAgYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgdmFyIG5hbWUgPSB0aGlzLmFyZ1xuXHQgICAgdGhpcy51cGRhdGUgPSB4bGlua1JFLnRlc3QobmFtZSlcblx0ICAgICAgPyB4bGlua0hhbmRsZXJcblx0ICAgICAgOiBkZWZhdWx0SGFuZGxlclxuXHQgIH1cblxuXHR9XG5cblx0ZnVuY3Rpb24gZGVmYXVsdEhhbmRsZXIgKHZhbHVlKSB7XG5cdCAgaWYgKHZhbHVlIHx8IHZhbHVlID09PSAwKSB7XG5cdCAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSh0aGlzLmFyZywgdmFsdWUpXG5cdCAgfSBlbHNlIHtcblx0ICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuYXJnKVxuXHQgIH1cblx0fVxuXG5cdGZ1bmN0aW9uIHhsaW5rSGFuZGxlciAodmFsdWUpIHtcblx0ICBpZiAodmFsdWUgIT0gbnVsbCkge1xuXHQgICAgdGhpcy5lbC5zZXRBdHRyaWJ1dGVOUyh4bGlua05TLCB0aGlzLmFyZywgdmFsdWUpXG5cdCAgfSBlbHNlIHtcblx0ICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlTlMoeGxpbmtOUywgJ2hyZWYnKVxuXHQgIH1cblx0fVxuXG4vKioqLyB9LFxuLyogMjUgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciB0cmFuc2l0aW9uID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0NSlcblxuXHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgIHZhciBlbCA9IHRoaXMuZWxcblx0ICB0cmFuc2l0aW9uLmFwcGx5KGVsLCB2YWx1ZSA/IDEgOiAtMSwgZnVuY3Rpb24gKCkge1xuXHQgICAgZWwuc3R5bGUuZGlzcGxheSA9IHZhbHVlID8gJycgOiAnbm9uZSdcblx0ICB9LCB0aGlzLnZtKVxuXHR9XG5cbi8qKiovIH0sXG4vKiAyNiAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBhZGRDbGFzcyA9IF8uYWRkQ2xhc3Ncblx0dmFyIHJlbW92ZUNsYXNzID0gXy5yZW1vdmVDbGFzc1xuXG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdCAgaWYgKHRoaXMuYXJnKSB7XG5cdCAgICB2YXIgbWV0aG9kID0gdmFsdWUgPyBhZGRDbGFzcyA6IHJlbW92ZUNsYXNzXG5cdCAgICBtZXRob2QodGhpcy5lbCwgdGhpcy5hcmcpXG5cdCAgfSBlbHNlIHtcblx0ICAgIGlmICh0aGlzLmxhc3RWYWwpIHtcblx0ICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5lbCwgdGhpcy5sYXN0VmFsKVxuXHQgICAgfVxuXHQgICAgaWYgKHZhbHVlKSB7XG5cdCAgICAgIGFkZENsYXNzKHRoaXMuZWwsIHZhbHVlKVxuXHQgICAgICB0aGlzLmxhc3RWYWwgPSB2YWx1ZVxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG4vKioqLyB9LFxuLyogMjcgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdG1vZHVsZS5leHBvcnRzID0ge1xuXG5cdCAgaXNMaXRlcmFsOiB0cnVlLFxuXG5cdCAgYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgdGhpcy52bS4kJFt0aGlzLmV4cHJlc3Npb25dID0gdGhpcy5lbFxuXHQgIH0sXG5cblx0ICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIGRlbGV0ZSB0aGlzLnZtLiQkW3RoaXMuZXhwcmVzc2lvbl1cblx0ICB9XG5cdCAgXG5cdH1cblxuLyoqKi8gfSxcbi8qIDI4ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblxuXHRtb2R1bGUuZXhwb3J0cyA9IHtcblxuXHQgIGlzTGl0ZXJhbDogdHJ1ZSxcblxuXHQgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIGlmICh0aGlzLmVsICE9PSB0aGlzLnZtLiRlbCkge1xuXHQgICAgICBfLndhcm4oXG5cdCAgICAgICAgJ3YtcmVmIHNob3VsZCBvbmx5IGJlIHVzZWQgb24gaW5zdGFuY2Ugcm9vdCBub2Rlcy4nXG5cdCAgICAgIClcblx0ICAgICAgcmV0dXJuXG5cdCAgICB9XG5cdCAgICB0aGlzLm93bmVyID0gdGhpcy52bS4kcGFyZW50XG5cdCAgICB0aGlzLm93bmVyLiRbdGhpcy5leHByZXNzaW9uXSA9IHRoaXMudm1cblx0ICB9LFxuXG5cdCAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBpZiAodGhpcy5vd25lci4kW3RoaXMuZXhwcmVzc2lvbl0gPT09IHRoaXMudm0pIHtcblx0ICAgICAgZGVsZXRlIHRoaXMub3duZXIuJFt0aGlzLmV4cHJlc3Npb25dXG5cdCAgICB9XG5cdCAgfVxuXHQgIFxuXHR9XG5cbi8qKiovIH0sXG4vKiAyOSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIGNvbmZpZyA9IF9fd2VicGFja19yZXF1aXJlX18oMjApXG5cblx0bW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0ICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICB2YXIgZWwgPSB0aGlzLmVsXG5cdCAgICB0aGlzLnZtLiRvbmNlKCdob29rOmNvbXBpbGVkJywgZnVuY3Rpb24gKCkge1xuXHQgICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoY29uZmlnLnByZWZpeCArICdjbG9haycpXG5cdCAgICB9KVxuXHQgIH1cblxuXHR9XG5cbi8qKiovIH0sXG4vKiAzMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIHByZWZpeGVzID0gWyctd2Via2l0LScsICctbW96LScsICctbXMtJ11cblx0dmFyIGltcG9ydGFudFJFID0gLyFpbXBvcnRhbnQ7PyQvXG5cblx0bW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0ICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICB2YXIgcHJvcCA9IHRoaXMuYXJnXG5cdCAgICBpZiAoIXByb3ApIHJldHVyblxuXHQgICAgaWYgKHByb3AuY2hhckF0KDApID09PSAnJCcpIHtcblx0ICAgICAgLy8gcHJvcGVydGllcyB0aGF0IHN0YXJ0IHdpdGggJCB3aWxsIGJlIGF1dG8tcHJlZml4ZWRcblx0ICAgICAgcHJvcCA9IHByb3Auc2xpY2UoMSlcblx0ICAgICAgdGhpcy5wcmVmaXhlZCA9IHRydWVcblx0ICAgIH1cblx0ICAgIHRoaXMucHJvcCA9IHByb3Bcblx0ICB9LFxuXG5cdCAgdXBkYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICAgIHZhciBwcm9wID0gdGhpcy5wcm9wXG5cdCAgICAvLyBjYXN0IHBvc3NpYmxlIG51bWJlcnMvYm9vbGVhbnMgaW50byBzdHJpbmdzXG5cdCAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuXHQgICAgICB2YWx1ZSArPSAnJ1xuXHQgICAgfVxuXHQgICAgaWYgKHByb3ApIHtcblx0ICAgICAgdmFyIGlzSW1wb3J0YW50ID0gaW1wb3J0YW50UkUudGVzdCh2YWx1ZSlcblx0ICAgICAgICA/ICdpbXBvcnRhbnQnXG5cdCAgICAgICAgOiAnJ1xuXHQgICAgICBpZiAoaXNJbXBvcnRhbnQpIHtcblx0ICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoaW1wb3J0YW50UkUsICcnKS50cmltKClcblx0ICAgICAgfVxuXHQgICAgICB0aGlzLmVsLnN0eWxlLnNldFByb3BlcnR5KHByb3AsIHZhbHVlLCBpc0ltcG9ydGFudClcblx0ICAgICAgaWYgKHRoaXMucHJlZml4ZWQpIHtcblx0ICAgICAgICB2YXIgaSA9IHByZWZpeGVzLmxlbmd0aFxuXHQgICAgICAgIHdoaWxlIChpLS0pIHtcblx0ICAgICAgICAgIHRoaXMuZWwuc3R5bGUuc2V0UHJvcGVydHkoXG5cdCAgICAgICAgICAgIHByZWZpeGVzW2ldICsgcHJvcCxcblx0ICAgICAgICAgICAgdmFsdWUsXG5cdCAgICAgICAgICAgIGlzSW1wb3J0YW50XG5cdCAgICAgICAgICApXG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICB0aGlzLmVsLnN0eWxlLmNzc1RleHQgPSB2YWx1ZVxuXHQgICAgfVxuXHQgIH1cblxuXHR9XG5cbi8qKiovIH0sXG4vKiAzMSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciB0ZW1wbGF0ZVBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNTEpXG5cdHZhciB0cmFuc2l0aW9uID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0NSlcblxuXHRtb2R1bGUuZXhwb3J0cyA9IHtcblxuXHQgIGlzTGl0ZXJhbDogdHJ1ZSxcblxuXHQgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHZhciBlbCA9IHRoaXMuZWxcblx0ICAgIHRoaXMuc3RhcnQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LXBhcnRpYWwtc3RhcnQnKVxuXHQgICAgdGhpcy5lbmQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LXBhcnRpYWwtZW5kJylcblx0ICAgIGlmIChlbC5ub2RlVHlwZSAhPT0gOCkge1xuXHQgICAgICBlbC5pbm5lckhUTUwgPSAnJ1xuXHQgICAgfVxuXHQgICAgaWYgKGVsLnRhZ05hbWUgPT09ICdURU1QTEFURScgfHwgZWwubm9kZVR5cGUgPT09IDgpIHtcblx0ICAgICAgXy5yZXBsYWNlKGVsLCB0aGlzLmVuZClcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGVsLmFwcGVuZENoaWxkKHRoaXMuZW5kKVxuXHQgICAgfVxuXHQgICAgXy5iZWZvcmUodGhpcy5zdGFydCwgdGhpcy5lbmQpXG5cdCAgICBpZiAoIXRoaXMuX2lzRHluYW1pY0xpdGVyYWwpIHtcblx0ICAgICAgdGhpcy5jb21waWxlKHRoaXMuZXhwcmVzc2lvbilcblx0ICAgIH1cblx0ICB9LFxuXG5cdCAgdXBkYXRlOiBmdW5jdGlvbiAoaWQpIHtcblx0ICAgIHRoaXMudGVhcmRvd24oKVxuXHQgICAgdGhpcy5jb21waWxlKGlkKVxuXHQgIH0sXG5cblx0ICBjb21waWxlOiBmdW5jdGlvbiAoaWQpIHtcblx0ICAgIHZhciBwYXJ0aWFsID0gdGhpcy52bS4kb3B0aW9ucy5wYXJ0aWFsc1tpZF1cblx0ICAgIF8uYXNzZXJ0QXNzZXQocGFydGlhbCwgJ3BhcnRpYWwnLCBpZClcblx0ICAgIGlmICghcGFydGlhbCkge1xuXHQgICAgICByZXR1cm5cblx0ICAgIH1cblx0ICAgIHZhciB2bSA9IHRoaXMudm1cblx0ICAgIHZhciBmcmFnID0gdGVtcGxhdGVQYXJzZXIucGFyc2UocGFydGlhbCwgdHJ1ZSlcblx0ICAgIHZhciBkZWNvbXBpbGUgPSB2bS4kY29tcGlsZShmcmFnKVxuXHQgICAgdGhpcy5kZWNvbXBpbGUgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIGRlY29tcGlsZSgpXG5cdCAgICAgIHRyYW5zaXRpb24uYmxvY2tSZW1vdmUodGhpcy5zdGFydCwgdGhpcy5lbmQsIHZtKVxuXHQgICAgfVxuXHQgICAgdHJhbnNpdGlvbi5ibG9ja0FwcGVuZChmcmFnLCB0aGlzLmVuZCwgdm0pXG5cdCAgfSxcblxuXHQgIHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBpZiAodGhpcy5kZWNvbXBpbGUpIHtcblx0ICAgICAgdGhpcy5kZWNvbXBpbGUoKVxuXHQgICAgICB0aGlzLmRlY29tcGlsZSA9IG51bGxcblx0ICAgIH1cblx0ICB9XG5cblx0fVxuXG4vKioqLyB9LFxuLyogMzIgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdG1vZHVsZS5leHBvcnRzID0ge1xuXG5cdCAgcHJpb3JpdHk6IDEwMDAsXG5cdCAgaXNMaXRlcmFsOiB0cnVlLFxuXG5cdCAgYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgdGhpcy5lbC5fX3ZfdHJhbnMgPSB7XG5cdCAgICAgIGlkOiB0aGlzLmV4cHJlc3Npb25cblx0ICAgIH1cblx0ICB9XG5cblx0fVxuXG4vKioqLyB9LFxuLyogMzMgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXG5cdG1vZHVsZS5leHBvcnRzID0ge1xuXG5cdCAgYWNjZXB0U3RhdGVtZW50OiB0cnVlLFxuXHQgIHByaW9yaXR5OiA3MDAsXG5cblx0ICBiaW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAvLyBkZWFsIHdpdGggaWZyYW1lc1xuXHQgICAgaWYgKFxuXHQgICAgICB0aGlzLmVsLnRhZ05hbWUgPT09ICdJRlJBTUUnICYmXG5cdCAgICAgIHRoaXMuYXJnICE9PSAnbG9hZCdcblx0ICAgICkge1xuXHQgICAgICB2YXIgc2VsZiA9IHRoaXNcblx0ICAgICAgdGhpcy5pZnJhbWVCaW5kID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIF8ub24oc2VsZi5lbC5jb250ZW50V2luZG93LCBzZWxmLmFyZywgc2VsZi5oYW5kbGVyKVxuXHQgICAgICB9XG5cdCAgICAgIF8ub24odGhpcy5lbCwgJ2xvYWQnLCB0aGlzLmlmcmFtZUJpbmQpXG5cdCAgICB9XG5cdCAgfSxcblxuXHQgIHVwZGF0ZTogZnVuY3Rpb24gKGhhbmRsZXIpIHtcblx0ICAgIGlmICh0eXBlb2YgaGFuZGxlciAhPT0gJ2Z1bmN0aW9uJykge1xuXHQgICAgICBfLndhcm4oXG5cdCAgICAgICAgJ0RpcmVjdGl2ZSBcInYtb246JyArIHRoaXMuZXhwcmVzc2lvbiArICdcIiAnICtcblx0ICAgICAgICAnZXhwZWN0cyBhIGZ1bmN0aW9uIHZhbHVlLidcblx0ICAgICAgKVxuXHQgICAgICByZXR1cm5cblx0ICAgIH1cblx0ICAgIHRoaXMucmVzZXQoKVxuXHQgICAgdmFyIHZtID0gdGhpcy52bVxuXHQgICAgdGhpcy5oYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcblx0ICAgICAgZS50YXJnZXRWTSA9IHZtXG5cdCAgICAgIHZtLiRldmVudCA9IGVcblx0ICAgICAgdmFyIHJlcyA9IGhhbmRsZXIoZSlcblx0ICAgICAgdm0uJGV2ZW50ID0gbnVsbFxuXHQgICAgICByZXR1cm4gcmVzXG5cdCAgICB9XG5cdCAgICBpZiAodGhpcy5pZnJhbWVCaW5kKSB7XG5cdCAgICAgIHRoaXMuaWZyYW1lQmluZCgpXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBfLm9uKHRoaXMuZWwsIHRoaXMuYXJnLCB0aGlzLmhhbmRsZXIpXG5cdCAgICB9XG5cdCAgfSxcblxuXHQgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICB2YXIgZWwgPSB0aGlzLmlmcmFtZUJpbmRcblx0ICAgICAgPyB0aGlzLmVsLmNvbnRlbnRXaW5kb3dcblx0ICAgICAgOiB0aGlzLmVsXG5cdCAgICBpZiAodGhpcy5oYW5kbGVyKSB7XG5cdCAgICAgIF8ub2ZmKGVsLCB0aGlzLmFyZywgdGhpcy5oYW5kbGVyKVxuXHQgICAgfVxuXHQgIH0sXG5cblx0ICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHRoaXMucmVzZXQoKVxuXHQgICAgXy5vZmYodGhpcy5lbCwgJ2xvYWQnLCB0aGlzLmlmcmFtZUJpbmQpXG5cdCAgfVxuXHR9XG5cbi8qKiovIH0sXG4vKiAzNCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciB0ZW1wbGF0ZVBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNTEpXG5cblx0bW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0ICBpc0xpdGVyYWw6IHRydWUsXG5cblx0ICAvKipcblx0ICAgKiBTZXR1cC4gVHdvIHBvc3NpYmxlIHVzYWdlczpcblx0ICAgKlxuXHQgICAqIC0gc3RhdGljOlxuXHQgICAqICAgdi1jb21wb25lbnQ9XCJjb21wXCJcblx0ICAgKlxuXHQgICAqIC0gZHluYW1pYzpcblx0ICAgKiAgIHYtY29tcG9uZW50PVwie3tjdXJyZW50Vmlld319XCJcblx0ICAgKi9cblxuXHQgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIGlmICghdGhpcy5lbC5fX3Z1ZV9fKSB7XG5cdCAgICAgIC8vIGNyZWF0ZSBhIHJlZiBhbmNob3Jcblx0ICAgICAgdGhpcy5yZWYgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LWNvbXBvbmVudCcpXG5cdCAgICAgIF8ucmVwbGFjZSh0aGlzLmVsLCB0aGlzLnJlZilcblx0ICAgICAgLy8gY2hlY2sga2VlcC1hbGl2ZSBvcHRpb25zXG5cdCAgICAgIHRoaXMuY2hlY2tLZWVwQWxpdmUoKVxuXHQgICAgICAvLyBjaGVjayBwYXJlbnQgZGlyZWN0aXZlc1xuXHQgICAgICB0aGlzLnBhcmVudExpbmtlciA9IHRoaXMuZWwuX3BhcmVudExpbmtlclxuXHQgICAgICAvLyBpZiBzdGF0aWMsIGJ1aWxkIHJpZ2h0IG5vdy5cblx0ICAgICAgaWYgKCF0aGlzLl9pc0R5bmFtaWNMaXRlcmFsKSB7XG5cdCAgICAgICAgdGhpcy5yZXNvbHZlQ3Rvcih0aGlzLmV4cHJlc3Npb24pXG5cdCAgICAgICAgdGhpcy5idWlsZCgpXG5cdCAgICAgIH1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIF8ud2Fybihcblx0ICAgICAgICAndi1jb21wb25lbnQ9XCInICsgdGhpcy5leHByZXNzaW9uICsgJ1wiIGNhbm5vdCBiZSAnICtcblx0ICAgICAgICAndXNlZCBvbiBhbiBhbHJlYWR5IG1vdW50ZWQgaW5zdGFuY2UuJ1xuXHQgICAgICApXG5cdCAgICB9XG5cdCAgfSxcblxuXHQgIC8qKlxuXHQgICAqIENoZWNrIGlmIHRoZSBcImtlZXAtYWxpdmVcIiBmbGFnIGlzIHByZXNlbnQuXG5cdCAgICogSWYgeWVzLCBpbnN0ZWFkIG9mIGRlc3Ryb3lpbmcgdGhlIGFjdGl2ZSB2bSB3aGVuXG5cdCAgICogaGlkaW5nICh2LWlmKSBvciBzd2l0Y2hpbmcgKGR5bmFtaWMgbGl0ZXJhbCkgaXQsXG5cdCAgICogd2Ugc2ltcGx5IHJlbW92ZSBpdCBmcm9tIHRoZSBET00gYW5kIHNhdmUgaXQgaW4gYVxuXHQgICAqIGNhY2hlIG9iamVjdCwgd2l0aCBpdHMgY29uc3RydWN0b3IgaWQgYXMgdGhlIGtleS5cblx0ICAgKi9cblxuXHQgIGNoZWNrS2VlcEFsaXZlOiBmdW5jdGlvbiAoKSB7XG5cdCAgICAvLyBjaGVjayBrZWVwLWFsaXZlIGZsYWdcblx0ICAgIHRoaXMua2VlcEFsaXZlID0gdGhpcy5lbC5oYXNBdHRyaWJ1dGUoJ2tlZXAtYWxpdmUnKVxuXHQgICAgaWYgKHRoaXMua2VlcEFsaXZlKSB7XG5cdCAgICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKCdrZWVwLWFsaXZlJylcblx0ICAgICAgdGhpcy5jYWNoZSA9IHt9XG5cdCAgICB9XG5cdCAgfSxcblxuXHQgIC8qKlxuXHQgICAqIFJlc29sdmUgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byB1c2Ugd2hlbiBjcmVhdGluZ1xuXHQgICAqIHRoZSBjaGlsZCB2bS5cblx0ICAgKi9cblxuXHQgIHJlc29sdmVDdG9yOiBmdW5jdGlvbiAoaWQpIHtcblx0ICAgIHRoaXMuY3RvcklkID0gaWRcblx0ICAgIHRoaXMuQ3RvciA9IHRoaXMudm0uJG9wdGlvbnMuY29tcG9uZW50c1tpZF1cblx0ICAgIF8uYXNzZXJ0QXNzZXQodGhpcy5DdG9yLCAnY29tcG9uZW50JywgaWQpXG5cdCAgfSxcblxuXHQgIC8qKlxuXHQgICAqIEluc3RhbnRpYXRlL2luc2VydCBhIG5ldyBjaGlsZCB2bS5cblx0ICAgKiBJZiBrZWVwIGFsaXZlIGFuZCBoYXMgY2FjaGVkIGluc3RhbmNlLCBpbnNlcnQgdGhhdFxuXHQgICAqIGluc3RhbmNlOyBvdGhlcndpc2UgYnVpbGQgYSBuZXcgb25lIGFuZCBjYWNoZSBpdC5cblx0ICAgKi9cblxuXHQgIGJ1aWxkOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBpZiAodGhpcy5rZWVwQWxpdmUpIHtcblx0ICAgICAgdmFyIGNhY2hlZCA9IHRoaXMuY2FjaGVbdGhpcy5jdG9ySWRdXG5cdCAgICAgIGlmIChjYWNoZWQpIHtcblx0ICAgICAgICB0aGlzLmNoaWxkVk0gPSBjYWNoZWRcblx0ICAgICAgICBjYWNoZWQuJGJlZm9yZSh0aGlzLnJlZilcblx0ICAgICAgICByZXR1cm5cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgICAgdmFyIHZtID0gdGhpcy52bVxuXHQgICAgaWYgKHRoaXMuQ3RvciAmJiAhdGhpcy5jaGlsZFZNKSB7XG5cdCAgICAgIHRoaXMuY2hpbGRWTSA9IHZtLiRhZGRDaGlsZCh7XG5cdCAgICAgICAgZWw6IHRlbXBsYXRlUGFyc2VyLmNsb25lKHRoaXMuZWwpXG5cdCAgICAgIH0sIHRoaXMuQ3Rvcilcblx0ICAgICAgaWYgKHRoaXMucGFyZW50TGlua2VyKSB7XG5cdCAgICAgICAgdmFyIGRpckNvdW50ID0gdm0uX2RpcmVjdGl2ZXMubGVuZ3RoXG5cdCAgICAgICAgdmFyIHRhcmdldFZNID0gdGhpcy5jaGlsZFZNLiRvcHRpb25zLmluaGVyaXRcblx0ICAgICAgICAgID8gdGhpcy5jaGlsZFZNXG5cdCAgICAgICAgICA6IHZtXG5cdCAgICAgICAgdGhpcy5wYXJlbnRMaW5rZXIodGFyZ2V0Vk0sIHRoaXMuY2hpbGRWTS4kZWwpXG5cdCAgICAgICAgdGhpcy5wYXJlbnREaXJzID0gdm0uX2RpcmVjdGl2ZXMuc2xpY2UoZGlyQ291bnQpXG5cdCAgICAgIH1cblx0ICAgICAgaWYgKHRoaXMua2VlcEFsaXZlKSB7XG5cdCAgICAgICAgdGhpcy5jYWNoZVt0aGlzLmN0b3JJZF0gPSB0aGlzLmNoaWxkVk1cblx0ICAgICAgfVxuXHQgICAgICB0aGlzLmNoaWxkVk0uJGJlZm9yZSh0aGlzLnJlZilcblx0ICAgIH1cblx0ICB9LFxuXG5cdCAgLyoqXG5cdCAgICogVGVhcmRvd24gdGhlIGFjdGl2ZSB2bS5cblx0ICAgKiBJZiBrZWVwIGFsaXZlLCBzaW1wbHkgcmVtb3ZlIGl0OyBvdGhlcndpc2UgZGVzdHJveSBpdC5cblx0ICAgKlxuXHQgICAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVtb3ZlXG5cdCAgICovXG5cblx0ICB1bmJ1aWxkOiBmdW5jdGlvbiAocmVtb3ZlKSB7XG5cdCAgICB2YXIgY2hpbGQgPSB0aGlzLmNoaWxkVk1cblx0ICAgIGlmICghY2hpbGQpIHtcblx0ICAgICAgcmV0dXJuXG5cdCAgICB9XG5cdCAgICBpZiAodGhpcy5rZWVwQWxpdmUpIHtcblx0ICAgICAgaWYgKHJlbW92ZSkge1xuXHQgICAgICAgIGNoaWxkLiRyZW1vdmUoKVxuXHQgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBjaGlsZC4kZGVzdHJveShyZW1vdmUpXG5cdCAgICAgIHZhciBwYXJlbnREaXJzID0gdGhpcy5wYXJlbnREaXJzXG5cdCAgICAgIGlmIChwYXJlbnREaXJzKSB7XG5cdCAgICAgICAgdmFyIGkgPSBwYXJlbnREaXJzLmxlbmd0aFxuXHQgICAgICAgIHdoaWxlIChpLS0pIHtcblx0ICAgICAgICAgIHBhcmVudERpcnNbaV0uX3RlYXJkb3duKClcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICAgIHRoaXMuY2hpbGRWTSA9IG51bGxcblx0ICB9LFxuXG5cdCAgLyoqXG5cdCAgICogVXBkYXRlIGNhbGxiYWNrIGZvciB0aGUgZHluYW1pYyBsaXRlcmFsIHNjZW5hcmlvLFxuXHQgICAqIGUuZy4gdi1jb21wb25lbnQ9XCJ7e3ZpZXd9fVwiXG5cdCAgICovXG5cblx0ICB1cGRhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgICAgdGhpcy51bmJ1aWxkKHRydWUpXG5cdCAgICBpZiAodmFsdWUpIHtcblx0ICAgICAgdGhpcy5yZXNvbHZlQ3Rvcih2YWx1ZSlcblx0ICAgICAgdGhpcy5idWlsZCgpXG5cdCAgICB9XG5cdCAgfSxcblxuXHQgIC8qKlxuXHQgICAqIFVuYmluZC5cblx0ICAgKiBNYWtlIHN1cmUga2VlcEFsaXZlIGlzIHNldCB0byBmYWxzZSBzbyB0aGF0IHRoZVxuXHQgICAqIGluc3RhbmNlIGlzIGFsd2F5cyBkZXN0cm95ZWQuXG5cdCAgICovXG5cblx0ICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHRoaXMua2VlcEFsaXZlID0gZmFsc2Vcblx0ICAgIHRoaXMudW5idWlsZCgpXG5cdCAgfVxuXG5cdH1cblxuLyoqKi8gfSxcbi8qIDM1ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblx0dmFyIGlzT2JqZWN0ID0gXy5pc09iamVjdFxuXHR2YXIgdGV4dFBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNDIpXG5cdHZhciBleHBQYXJzZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQ0KVxuXHR2YXIgdGVtcGxhdGVQYXJzZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUxKVxuXHR2YXIgY29tcGlsZSA9IF9fd2VicGFja19yZXF1aXJlX18oNDYpXG5cdHZhciB0cmFuc2NsdWRlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0Nylcblx0dmFyIG1lcmdlT3B0aW9ucyA9IF9fd2VicGFja19yZXF1aXJlX18oMTkpXG5cdHZhciB1aWQgPSAwXG5cblx0bW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0ICAvKipcblx0ICAgKiBTZXR1cC5cblx0ICAgKi9cblxuXHQgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIC8vIHVpZCBhcyBhIGNhY2hlIGlkZW50aWZpZXJcblx0ICAgIHRoaXMuaWQgPSAnX192X3JlcGVhdF8nICsgKCsrdWlkKVxuXHQgICAgLy8gd2UgbmVlZCB0byBpbnNlcnQgdGhlIG9ialRvQXJyYXkgY29udmVydGVyXG5cdCAgICAvLyBhcyB0aGUgZmlyc3QgcmVhZCBmaWx0ZXIuXG5cdCAgICBpZiAoIXRoaXMuZmlsdGVycykge1xuXHQgICAgICB0aGlzLmZpbHRlcnMgPSB7fVxuXHQgICAgfVxuXHQgICAgLy8gYWRkIHRoZSBvYmplY3QgLT4gYXJyYXkgY29udmVydCBmaWx0ZXJcblx0ICAgIHZhciBvYmplY3RDb252ZXJ0ZXIgPSBfLmJpbmQob2JqVG9BcnJheSwgdGhpcylcblx0ICAgIGlmICghdGhpcy5maWx0ZXJzLnJlYWQpIHtcblx0ICAgICAgdGhpcy5maWx0ZXJzLnJlYWQgPSBbb2JqZWN0Q29udmVydGVyXVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgdGhpcy5maWx0ZXJzLnJlYWQudW5zaGlmdChvYmplY3RDb252ZXJ0ZXIpXG5cdCAgICB9XG5cdCAgICAvLyBzZXR1cCByZWYgbm9kZVxuXHQgICAgdGhpcy5yZWYgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LXJlcGVhdCcpXG5cdCAgICBfLnJlcGxhY2UodGhpcy5lbCwgdGhpcy5yZWYpXG5cdCAgICAvLyBjaGVjayBpZiB0aGlzIGlzIGEgYmxvY2sgcmVwZWF0XG5cdCAgICB0aGlzLnRlbXBsYXRlID0gdGhpcy5lbC50YWdOYW1lID09PSAnVEVNUExBVEUnXG5cdCAgICAgID8gdGVtcGxhdGVQYXJzZXIucGFyc2UodGhpcy5lbCwgdHJ1ZSlcblx0ICAgICAgOiB0aGlzLmVsXG5cdCAgICAvLyBjaGVjayBvdGhlciBkaXJlY3RpdmVzIHRoYXQgbmVlZCB0byBiZSBoYW5kbGVkXG5cdCAgICAvLyBhdCB2LXJlcGVhdCBsZXZlbFxuXHQgICAgdGhpcy5jaGVja0lmKClcblx0ICAgIHRoaXMuY2hlY2tSZWYoKVxuXHQgICAgdGhpcy5jaGVja1RyYWNrQnlJZCgpXG5cdCAgICB0aGlzLmNoZWNrQ29tcG9uZW50KClcblx0ICAgIC8vIGNhY2hlIGZvciBwcmltaXRpdmUgdmFsdWUgaW5zdGFuY2VzXG5cdCAgICB0aGlzLmNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXHQgIH0sXG5cblx0ICAvKipcblx0ICAgKiBXYXJuIGFnYWluc3Qgdi1pZiB1c2FnZS5cblx0ICAgKi9cblxuXHQgIGNoZWNrSWY6IGZ1bmN0aW9uICgpIHtcblx0ICAgIGlmIChfLmF0dHIodGhpcy5lbCwgJ2lmJykgIT09IG51bGwpIHtcblx0ICAgICAgXy53YXJuKFxuXHQgICAgICAgICdEb25cXCd0IHVzZSB2LWlmIHdpdGggdi1yZXBlYXQuICcgK1xuXHQgICAgICAgICdVc2Ugdi1zaG93IG9yIHRoZSBcImZpbHRlckJ5XCIgZmlsdGVyIGluc3RlYWQuJ1xuXHQgICAgICApXG5cdCAgICB9XG5cdCAgfSxcblxuXHQgIC8qKlxuXHQgICAqIENoZWNrIGlmIHYtcmVmLyB2LWVsIGlzIGFsc28gcHJlc2VudC5cblx0ICAgKi9cblxuXHQgIGNoZWNrUmVmOiBmdW5jdGlvbiAoKSB7XG5cdCAgICB2YXIgY2hpbGRJZCA9IF8uYXR0cih0aGlzLmVsLCAncmVmJylcblx0ICAgIHRoaXMuY2hpbGRJZCA9IGNoaWxkSWRcblx0ICAgICAgPyB0aGlzLnZtLiRpbnRlcnBvbGF0ZShjaGlsZElkKVxuXHQgICAgICA6IG51bGxcblx0ICAgIHZhciBlbElkID0gXy5hdHRyKHRoaXMuZWwsICdlbCcpXG5cdCAgICB0aGlzLmVsSWQgPSBlbElkXG5cdCAgICAgID8gdGhpcy52bS4kaW50ZXJwb2xhdGUoZWxJZClcblx0ICAgICAgOiBudWxsXG5cdCAgfSxcblxuXHQgIC8qKlxuXHQgICAqIENoZWNrIGZvciBhIHRyYWNrLWJ5IElELCB3aGljaCBhbGxvd3MgdXMgdG8gaWRlbnRpZnlcblx0ICAgKiBhIHBpZWNlIG9mIGRhdGEgYW5kIGl0cyBhc3NvY2lhdGVkIGluc3RhbmNlIGJ5IGl0c1xuXHQgICAqIHVuaXF1ZSBpZC5cblx0ICAgKi9cblxuXHQgIGNoZWNrVHJhY2tCeUlkOiBmdW5jdGlvbiAoKSB7XG5cdCAgICB0aGlzLmlkS2V5ID0gdGhpcy5lbC5nZXRBdHRyaWJ1dGUoJ3RyYWNrYnknKVxuXHQgICAgaWYgKHRoaXMuaWRLZXkgIT09IG51bGwpIHtcblx0ICAgICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUoJ3RyYWNrYnknKVxuXHQgICAgfVxuXHQgIH0sXG5cblx0ICAvKipcblx0ICAgKiBDaGVjayB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIHVzZSBmb3IgcmVwZWF0ZWRcblx0ICAgKiBpbnN0YW5jZXMuIElmIHN0YXRpYyB3ZSByZXNvbHZlIGl0IG5vdywgb3RoZXJ3aXNlIGl0XG5cdCAgICogbmVlZHMgdG8gYmUgcmVzb2x2ZWQgYXQgYnVpbGQgdGltZSB3aXRoIGFjdHVhbCBkYXRhLlxuXHQgICAqL1xuXG5cdCAgY2hlY2tDb21wb25lbnQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHZhciBpZCA9IF8uYXR0cih0aGlzLmVsLCAnY29tcG9uZW50Jylcblx0ICAgIHZhciBvcHRpb25zID0gdGhpcy52bS4kb3B0aW9uc1xuXHQgICAgaWYgKCFpZCkge1xuXHQgICAgICB0aGlzLkN0b3IgPSBfLlZ1ZSAvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXG5cdCAgICAgIHRoaXMuaW5oZXJpdCA9IHRydWUgLy8gaW5saW5lIHJlcGVhdHMgc2hvdWxkIGluaGVyaXRcblx0ICAgICAgLy8gaW1wb3J0YW50OiB0cmFuc2NsdWRlIHdpdGggbm8gb3B0aW9ucywganVzdFxuXHQgICAgICAvLyB0byBlbnN1cmUgYmxvY2sgc3RhcnQgYW5kIGJsb2NrIGVuZFxuXHQgICAgICB0aGlzLnRlbXBsYXRlID0gdHJhbnNjbHVkZSh0aGlzLnRlbXBsYXRlKVxuXHQgICAgICB0aGlzLl9saW5rZXIgPSBjb21waWxlKHRoaXMudGVtcGxhdGUsIG9wdGlvbnMpXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICB2YXIgdG9rZW5zID0gdGV4dFBhcnNlci5wYXJzZShpZClcblx0ICAgICAgaWYgKCF0b2tlbnMpIHsgLy8gc3RhdGljIGNvbXBvbmVudFxuXHQgICAgICAgIHZhciBDdG9yID0gdGhpcy5DdG9yID0gb3B0aW9ucy5jb21wb25lbnRzW2lkXVxuXHQgICAgICAgIF8uYXNzZXJ0QXNzZXQoQ3RvciwgJ2NvbXBvbmVudCcsIGlkKVxuXHQgICAgICAgIGlmIChDdG9yKSB7XG5cdCAgICAgICAgICAvLyBtZXJnZSBhbiBlbXB0eSBvYmplY3Qgd2l0aCBvd25lciB2bSBhcyBwYXJlbnRcblx0ICAgICAgICAgIC8vIHNvIGNoaWxkIHZtcyBjYW4gYWNjZXNzIHBhcmVudCBhc3NldHMuXG5cdCAgICAgICAgICB2YXIgbWVyZ2VkID0gbWVyZ2VPcHRpb25zKFxuXHQgICAgICAgICAgICBDdG9yLm9wdGlvbnMsXG5cdCAgICAgICAgICAgIHt9LFxuXHQgICAgICAgICAgICB7ICRwYXJlbnQ6IHRoaXMudm0gfVxuXHQgICAgICAgICAgKVxuXHQgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRyYW5zY2x1ZGUodGhpcy50ZW1wbGF0ZSwgbWVyZ2VkKVxuXHQgICAgICAgICAgdGhpcy5fbGlua2VyID0gY29tcGlsZSh0aGlzLnRlbXBsYXRlLCBtZXJnZWQpXG5cdCAgICAgICAgfVxuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICAgIC8vIHRvIGJlIHJlc29sdmVkIGxhdGVyXG5cdCAgICAgICAgdmFyIGN0b3JFeHAgPSB0ZXh0UGFyc2VyLnRva2Vuc1RvRXhwKHRva2Vucylcblx0ICAgICAgICB0aGlzLmN0b3JHZXR0ZXIgPSBleHBQYXJzZXIucGFyc2UoY3RvckV4cCkuZ2V0XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9LFxuXG5cdCAgLyoqXG5cdCAgICogVXBkYXRlLlxuXHQgICAqIFRoaXMgaXMgY2FsbGVkIHdoZW5ldmVyIHRoZSBBcnJheSBtdXRhdGVzLlxuXHQgICAqXG5cdCAgICogQHBhcmFtIHtBcnJheX0gZGF0YVxuXHQgICAqL1xuXG5cdCAgdXBkYXRlOiBmdW5jdGlvbiAoZGF0YSkge1xuXHQgICAgaWYgKHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJykge1xuXHQgICAgICBkYXRhID0gcmFuZ2UoZGF0YSlcblx0ICAgIH1cblx0ICAgIHRoaXMudm1zID0gdGhpcy5kaWZmKGRhdGEgfHwgW10sIHRoaXMudm1zKVxuXHQgICAgLy8gdXBkYXRlIHYtcmVmXG5cdCAgICBpZiAodGhpcy5jaGlsZElkKSB7XG5cdCAgICAgIHRoaXMudm0uJFt0aGlzLmNoaWxkSWRdID0gdGhpcy52bXNcblx0ICAgIH1cblx0ICAgIGlmICh0aGlzLmVsSWQpIHtcblx0ICAgICAgdGhpcy52bS4kJFt0aGlzLmVsSWRdID0gdGhpcy52bXMubWFwKGZ1bmN0aW9uICh2bSkge1xuXHQgICAgICAgIHJldHVybiB2bS4kZWxcblx0ICAgICAgfSlcblx0ICAgIH1cblx0ICB9LFxuXG5cdCAgLyoqXG5cdCAgICogRGlmZiwgYmFzZWQgb24gbmV3IGRhdGEgYW5kIG9sZCBkYXRhLCBkZXRlcm1pbmUgdGhlXG5cdCAgICogbWluaW11bSBhbW91bnQgb2YgRE9NIG1hbmlwdWxhdGlvbnMgbmVlZGVkIHRvIG1ha2UgdGhlXG5cdCAgICogRE9NIHJlZmxlY3QgdGhlIG5ldyBkYXRhIEFycmF5LlxuXHQgICAqXG5cdCAgICogVGhlIGFsZ29yaXRobSBkaWZmcyB0aGUgbmV3IGRhdGEgQXJyYXkgYnkgc3RvcmluZyBhXG5cdCAgICogaGlkZGVuIHJlZmVyZW5jZSB0byBhbiBvd25lciB2bSBpbnN0YW5jZSBvbiBwcmV2aW91c2x5XG5cdCAgICogc2VlbiBkYXRhLiBUaGlzIGFsbG93cyB1cyB0byBhY2hpZXZlIE8obikgd2hpY2ggaXNcblx0ICAgKiBiZXR0ZXIgdGhhbiBhIGxldmVuc2h0ZWluIGRpc3RhbmNlIGJhc2VkIGFsZ29yaXRobSxcblx0ICAgKiB3aGljaCBpcyBPKG0gKiBuKS5cblx0ICAgKlxuXHQgICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFcblx0ICAgKiBAcGFyYW0ge0FycmF5fSBvbGRWbXNcblx0ICAgKiBAcmV0dXJuIHtBcnJheX1cblx0ICAgKi9cblxuXHQgIGRpZmY6IGZ1bmN0aW9uIChkYXRhLCBvbGRWbXMpIHtcblx0ICAgIHZhciBpZEtleSA9IHRoaXMuaWRLZXlcblx0ICAgIHZhciBjb252ZXJ0ZWQgPSB0aGlzLmNvbnZlcnRlZFxuXHQgICAgdmFyIHJlZiA9IHRoaXMucmVmXG5cdCAgICB2YXIgYWxpYXMgPSB0aGlzLmFyZ1xuXHQgICAgdmFyIGluaXQgPSAhb2xkVm1zXG5cdCAgICB2YXIgdm1zID0gbmV3IEFycmF5KGRhdGEubGVuZ3RoKVxuXHQgICAgdmFyIG9iaiwgcmF3LCB2bSwgaSwgbFxuXHQgICAgLy8gRmlyc3QgcGFzcywgZ28gdGhyb3VnaCB0aGUgbmV3IEFycmF5IGFuZCBmaWxsIHVwXG5cdCAgICAvLyB0aGUgbmV3IHZtcyBhcnJheS4gSWYgYSBwaWVjZSBvZiBkYXRhIGhhcyBhIGNhY2hlZFxuXHQgICAgLy8gaW5zdGFuY2UgZm9yIGl0LCB3ZSByZXVzZSBpdC4gT3RoZXJ3aXNlIGJ1aWxkIGEgbmV3XG5cdCAgICAvLyBpbnN0YW5jZS5cblx0ICAgIGZvciAoaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHQgICAgICBvYmogPSBkYXRhW2ldXG5cdCAgICAgIHJhdyA9IGNvbnZlcnRlZCA/IG9iai52YWx1ZSA6IG9ialxuXHQgICAgICB2bSA9ICFpbml0ICYmIHRoaXMuZ2V0Vm0ocmF3KVxuXHQgICAgICBpZiAodm0pIHsgLy8gcmV1c2FibGUgaW5zdGFuY2Vcblx0ICAgICAgICB2bS5fcmV1c2VkID0gdHJ1ZVxuXHQgICAgICAgIHZtLiRpbmRleCA9IGkgLy8gdXBkYXRlICRpbmRleFxuXHQgICAgICAgIGlmIChjb252ZXJ0ZWQpIHtcblx0ICAgICAgICAgIHZtLiRrZXkgPSBvYmoua2V5IC8vIHVwZGF0ZSAka2V5XG5cdCAgICAgICAgfVxuXHQgICAgICAgIGlmIChpZEtleSkgeyAvLyBzd2FwIHRyYWNrIGJ5IGlkIGRhdGFcblx0ICAgICAgICAgIGlmIChhbGlhcykge1xuXHQgICAgICAgICAgICB2bVthbGlhc10gPSByYXdcblx0ICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgIHZtLl9zZXREYXRhKHJhdylcblx0ICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cdCAgICAgIH0gZWxzZSB7IC8vIG5ldyBpbnN0YW5jZVxuXHQgICAgICAgIHZtID0gdGhpcy5idWlsZChvYmosIGkpXG5cdCAgICAgICAgdm0uX25ldyA9IHRydWVcblx0ICAgICAgfVxuXHQgICAgICB2bXNbaV0gPSB2bVxuXHQgICAgICAvLyBpbnNlcnQgaWYgdGhpcyBpcyBmaXJzdCBydW5cblx0ICAgICAgaWYgKGluaXQpIHtcblx0ICAgICAgICB2bS4kYmVmb3JlKHJlZilcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgICAgLy8gaWYgdGhpcyBpcyB0aGUgZmlyc3QgcnVuLCB3ZSdyZSBkb25lLlxuXHQgICAgaWYgKGluaXQpIHtcblx0ICAgICAgcmV0dXJuIHZtc1xuXHQgICAgfVxuXHQgICAgLy8gU2Vjb25kIHBhc3MsIGdvIHRocm91Z2ggdGhlIG9sZCB2bSBpbnN0YW5jZXMgYW5kXG5cdCAgICAvLyBkZXN0cm95IHRob3NlIHdobyBhcmUgbm90IHJldXNlZCAoYW5kIHJlbW92ZSB0aGVtXG5cdCAgICAvLyBmcm9tIGNhY2hlKVxuXHQgICAgZm9yIChpID0gMCwgbCA9IG9sZFZtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0ICAgICAgdm0gPSBvbGRWbXNbaV1cblx0ICAgICAgaWYgKCF2bS5fcmV1c2VkKSB7XG5cdCAgICAgICAgdGhpcy51bmNhY2hlVm0odm0pXG5cdCAgICAgICAgdm0uJGRlc3Ryb3kodHJ1ZSlcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgICAgLy8gZmluYWwgcGFzcywgbW92ZS9pbnNlcnQgbmV3IGluc3RhbmNlcyBpbnRvIHRoZVxuXHQgICAgLy8gcmlnaHQgcGxhY2UuIFdlJ3JlIGdvaW5nIGluIHJldmVyc2UgaGVyZSBiZWNhdXNlXG5cdCAgICAvLyBpbnNlcnRCZWZvcmUgcmVsaWVzIG9uIHRoZSBuZXh0IHNpYmxpbmcgdG8gYmVcblx0ICAgIC8vIHJlc29sdmVkLlxuXHQgICAgdmFyIHRhcmdldE5leHQsIGN1cnJlbnROZXh0XG5cdCAgICBpID0gdm1zLmxlbmd0aFxuXHQgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICB2bSA9IHZtc1tpXVxuXHQgICAgICAvLyB0aGlzIGlzIHRoZSB2bSB0aGF0IHdlIHNob3VsZCBiZSBpbiBmcm9udCBvZlxuXHQgICAgICB0YXJnZXROZXh0ID0gdm1zW2kgKyAxXVxuXHQgICAgICBpZiAoIXRhcmdldE5leHQpIHtcblx0ICAgICAgICAvLyBUaGlzIGlzIHRoZSBsYXN0IGl0ZW0uIElmIGl0J3MgcmV1c2VkIHRoZW5cblx0ICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2Ugd2lsbCBldmVudHVhbGx5IGJlIGluIHRoZSByaWdodFxuXHQgICAgICAgIC8vIHBsYWNlLCBzbyBubyBuZWVkIHRvIHRvdWNoIGl0LiBPdGhlcndpc2UsIGluc2VydFxuXHQgICAgICAgIC8vIGl0LlxuXHQgICAgICAgIGlmICghdm0uX3JldXNlZCkge1xuXHQgICAgICAgICAgdm0uJGJlZm9yZShyZWYpXG5cdCAgICAgICAgfVxuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICAgIGlmICh2bS5fcmV1c2VkKSB7XG5cdCAgICAgICAgICAvLyB0aGlzIGlzIHRoZSB2bSB3ZSBhcmUgYWN0dWFsbHkgaW4gZnJvbnQgb2Zcblx0ICAgICAgICAgIGN1cnJlbnROZXh0ID0gZmluZE5leHRWbSh2bSwgcmVmKVxuXHQgICAgICAgICAgLy8gd2Ugb25seSBuZWVkIHRvIG1vdmUgaWYgd2UgYXJlIG5vdCBpbiB0aGUgcmlnaHRcblx0ICAgICAgICAgIC8vIHBsYWNlIGFscmVhZHkuXG5cdCAgICAgICAgICBpZiAoY3VycmVudE5leHQgIT09IHRhcmdldE5leHQpIHtcblx0ICAgICAgICAgICAgdm0uJGJlZm9yZSh0YXJnZXROZXh0LiRlbCwgbnVsbCwgZmFsc2UpXG5cdCAgICAgICAgICB9XG5cdCAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgIC8vIG5ldyBpbnN0YW5jZSwgaW5zZXJ0IHRvIGV4aXN0aW5nIG5leHRcblx0ICAgICAgICAgIHZtLiRiZWZvcmUodGFyZ2V0TmV4dC4kZWwpXG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICAgIHZtLl9uZXcgPSBmYWxzZVxuXHQgICAgICB2bS5fcmV1c2VkID0gZmFsc2Vcblx0ICAgIH1cblx0ICAgIHJldHVybiB2bXNcblx0ICB9LFxuXG5cdCAgLyoqXG5cdCAgICogQnVpbGQgYSBuZXcgaW5zdGFuY2UgYW5kIGNhY2hlIGl0LlxuXHQgICAqXG5cdCAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcblx0ICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcblx0ICAgKi9cblxuXHQgIGJ1aWxkOiBmdW5jdGlvbiAoZGF0YSwgaW5kZXgpIHtcblx0ICAgIHZhciBvcmlnaW5hbCA9IGRhdGFcblx0ICAgIHZhciBtZXRhID0geyAkaW5kZXg6IGluZGV4IH1cblx0ICAgIGlmICh0aGlzLmNvbnZlcnRlZCkge1xuXHQgICAgICBtZXRhLiRrZXkgPSBvcmlnaW5hbC5rZXlcblx0ICAgIH1cblx0ICAgIHZhciByYXcgPSB0aGlzLmNvbnZlcnRlZCA/IGRhdGEudmFsdWUgOiBkYXRhXG5cdCAgICB2YXIgYWxpYXMgPSB0aGlzLmFyZ1xuXHQgICAgdmFyIGhhc0FsaWFzID0gIWlzT2JqZWN0KHJhdykgfHwgYWxpYXNcblx0ICAgIC8vIHdyYXAgdGhlIHJhdyBkYXRhIHdpdGggYWxpYXNcblx0ICAgIGRhdGEgPSBoYXNBbGlhcyA/IHt9IDogcmF3XG5cdCAgICBpZiAoYWxpYXMpIHtcblx0ICAgICAgZGF0YVthbGlhc10gPSByYXdcblx0ICAgIH0gZWxzZSBpZiAoaGFzQWxpYXMpIHtcblx0ICAgICAgbWV0YS4kdmFsdWUgPSByYXdcblx0ICAgIH1cblx0ICAgIC8vIHJlc29sdmUgY29uc3RydWN0b3Jcblx0ICAgIHZhciBDdG9yID0gdGhpcy5DdG9yIHx8IHRoaXMucmVzb2x2ZUN0b3IoZGF0YSwgbWV0YSlcblx0ICAgIHZhciB2bSA9IHRoaXMudm0uJGFkZENoaWxkKHtcblx0ICAgICAgZWw6IHRlbXBsYXRlUGFyc2VyLmNsb25lKHRoaXMudGVtcGxhdGUpLFxuXHQgICAgICBfbGlua2VyOiB0aGlzLl9saW5rZXIsXG5cdCAgICAgIF9tZXRhOiBtZXRhLFxuXHQgICAgICBkYXRhOiBkYXRhLFxuXHQgICAgICBpbmhlcml0OiB0aGlzLmluaGVyaXRcblx0ICAgIH0sIEN0b3IpXG5cdCAgICAvLyBjYWNoZSBpbnN0YW5jZVxuXHQgICAgdGhpcy5jYWNoZVZtKHJhdywgdm0pXG5cdCAgICByZXR1cm4gdm1cblx0ICB9LFxuXG5cdCAgLyoqXG5cdCAgICogUmVzb2x2ZSBhIGNvbnRydWN0b3IgdG8gdXNlIGZvciBhbiBpbnN0YW5jZS5cblx0ICAgKiBUaGUgdHJpY2t5IHBhcnQgaGVyZSBpcyB0aGF0IHRoZXJlIGNvdWxkIGJlIGR5bmFtaWNcblx0ICAgKiBjb21wb25lbnRzIGRlcGVuZGluZyBvbiBpbnN0YW5jZSBkYXRhLlxuXHQgICAqXG5cdCAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcblx0ICAgKiBAcGFyYW0ge09iamVjdH0gbWV0YVxuXHQgICAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuXHQgICAqL1xuXG5cdCAgcmVzb2x2ZUN0b3I6IGZ1bmN0aW9uIChkYXRhLCBtZXRhKSB7XG5cdCAgICAvLyBjcmVhdGUgYSB0ZW1wb3JhcnkgY29udGV4dCBvYmplY3QgYW5kIGNvcHkgZGF0YVxuXHQgICAgLy8gYW5kIG1ldGEgcHJvcGVydGllcyBvbnRvIGl0LlxuXHQgICAgLy8gdXNlIF8uZGVmaW5lIHRvIGF2b2lkIGFjY2lkZW50YWxseSBvdmVyd3JpdGluZyBzY29wZVxuXHQgICAgLy8gcHJvcGVydGllcy5cblx0ICAgIHZhciBjb250ZXh0ID0gT2JqZWN0LmNyZWF0ZSh0aGlzLnZtKVxuXHQgICAgdmFyIGtleVxuXHQgICAgZm9yIChrZXkgaW4gZGF0YSkge1xuXHQgICAgICBfLmRlZmluZShjb250ZXh0LCBrZXksIGRhdGFba2V5XSlcblx0ICAgIH1cblx0ICAgIGZvciAoa2V5IGluIG1ldGEpIHtcblx0ICAgICAgXy5kZWZpbmUoY29udGV4dCwga2V5LCBtZXRhW2tleV0pXG5cdCAgICB9XG5cdCAgICB2YXIgaWQgPSB0aGlzLmN0b3JHZXR0ZXIuY2FsbChjb250ZXh0LCBjb250ZXh0KVxuXHQgICAgdmFyIEN0b3IgPSB0aGlzLnZtLiRvcHRpb25zLmNvbXBvbmVudHNbaWRdXG5cdCAgICBfLmFzc2VydEFzc2V0KEN0b3IsICdjb21wb25lbnQnLCBpZClcblx0ICAgIHJldHVybiBDdG9yXG5cdCAgfSxcblxuXHQgIC8qKlxuXHQgICAqIFVuYmluZCwgdGVhcmRvd24gZXZlcnl0aGluZ1xuXHQgICAqL1xuXG5cdCAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBpZiAodGhpcy5jaGlsZElkKSB7XG5cdCAgICAgIGRlbGV0ZSB0aGlzLnZtLiRbdGhpcy5jaGlsZElkXVxuXHQgICAgfVxuXHQgICAgaWYgKHRoaXMudm1zKSB7XG5cdCAgICAgIHZhciBpID0gdGhpcy52bXMubGVuZ3RoXG5cdCAgICAgIHZhciB2bVxuXHQgICAgICB3aGlsZSAoaS0tKSB7XG5cdCAgICAgICAgdm0gPSB0aGlzLnZtc1tpXVxuXHQgICAgICAgIHRoaXMudW5jYWNoZVZtKHZtKVxuXHQgICAgICAgIHZtLiRkZXN0cm95KClcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH0sXG5cblx0ICAvKipcblx0ICAgKiBDYWNoZSBhIHZtIGluc3RhbmNlIGJhc2VkIG9uIGl0cyBkYXRhLlxuXHQgICAqXG5cdCAgICogSWYgdGhlIGRhdGEgaXMgYW4gb2JqZWN0LCB3ZSBzYXZlIHRoZSB2bSdzIHJlZmVyZW5jZSBvblxuXHQgICAqIHRoZSBkYXRhIG9iamVjdCBhcyBhIGhpZGRlbiBwcm9wZXJ0eS4gT3RoZXJ3aXNlIHdlXG5cdCAgICogY2FjaGUgdGhlbSBpbiBhbiBvYmplY3QgYW5kIGZvciBlYWNoIHByaW1pdGl2ZSB2YWx1ZVxuXHQgICAqIHRoZXJlIGlzIGFuIGFycmF5IGluIGNhc2UgdGhlcmUgYXJlIGR1cGxpY2F0ZXMuXG5cdCAgICpcblx0ICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuXHQgICAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgICAqL1xuXG5cdCAgY2FjaGVWbTogZnVuY3Rpb24gKGRhdGEsIHZtKSB7XG5cdCAgICB2YXIgaWRLZXkgPSB0aGlzLmlkS2V5XG5cdCAgICB2YXIgY2FjaGUgPSB0aGlzLmNhY2hlXG5cdCAgICB2YXIgaWRcblx0ICAgIGlmIChpZEtleSkge1xuXHQgICAgICBpZCA9IGRhdGFbaWRLZXldXG5cdCAgICAgIGlmICghY2FjaGVbaWRdKSB7XG5cdCAgICAgICAgY2FjaGVbaWRdID0gdm1cblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBfLndhcm4oJ0R1cGxpY2F0ZSBJRCBpbiB2LXJlcGVhdDogJyArIGlkKVxuXHQgICAgICB9XG5cdCAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGRhdGEpKSB7XG5cdCAgICAgIGlkID0gdGhpcy5pZFxuXHQgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcblx0ICAgICAgICBpZiAoZGF0YVtpZF0gPT09IG51bGwpIHtcblx0ICAgICAgICAgIGRhdGFbaWRdID0gdm1cblx0ICAgICAgICB9IGVsc2Uge1xuXHQgICAgICAgICAgXy53YXJuKFxuXHQgICAgICAgICAgICAnRHVwbGljYXRlIG9iamVjdHMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gdi1yZXBlYXQuJ1xuXHQgICAgICAgICAgKVxuXHQgICAgICAgIH1cblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBfLmRlZmluZShkYXRhLCB0aGlzLmlkLCB2bSlcblx0ICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgaWYgKCFjYWNoZVtkYXRhXSkge1xuXHQgICAgICAgIGNhY2hlW2RhdGFdID0gW3ZtXVxuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICAgIGNhY2hlW2RhdGFdLnB1c2godm0pXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICAgIHZtLl9yYXcgPSBkYXRhXG5cdCAgfSxcblxuXHQgIC8qKlxuXHQgICAqIFRyeSB0byBnZXQgYSBjYWNoZWQgaW5zdGFuY2UgZnJvbSBhIHBpZWNlIG9mIGRhdGEuXG5cdCAgICpcblx0ICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuXHQgICAqIEByZXR1cm4ge1Z1ZXx1bmRlZmluZWR9XG5cdCAgICovXG5cblx0ICBnZXRWbTogZnVuY3Rpb24gKGRhdGEpIHtcblx0ICAgIGlmICh0aGlzLmlkS2V5KSB7XG5cdCAgICAgIHJldHVybiB0aGlzLmNhY2hlW2RhdGFbdGhpcy5pZEtleV1dXG5cdCAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGRhdGEpKSB7XG5cdCAgICAgIHJldHVybiBkYXRhW3RoaXMuaWRdXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICB2YXIgY2FjaGVkID0gdGhpcy5jYWNoZVtkYXRhXVxuXHQgICAgICBpZiAoY2FjaGVkKSB7XG5cdCAgICAgICAgdmFyIGkgPSAwXG5cdCAgICAgICAgdmFyIHZtID0gY2FjaGVkW2ldXG5cdCAgICAgICAgLy8gc2luY2UgZHVwbGljYXRlZCB2bSBpbnN0YW5jZXMgbWlnaHQgYmUgYSByZXVzZWRcblx0ICAgICAgICAvLyBvbmUgT1IgYSBuZXdseSBjcmVhdGVkIG9uZSwgd2UgbmVlZCB0byByZXR1cm4gdGhlXG5cdCAgICAgICAgLy8gZmlyc3QgaW5zdGFuY2UgdGhhdCBpcyBuZWl0aGVyIG9mIHRoZXNlLlxuXHQgICAgICAgIHdoaWxlICh2bSAmJiAodm0uX3JldXNlZCB8fCB2bS5fbmV3KSkge1xuXHQgICAgICAgICAgdm0gPSBjYWNoZWRbKytpXVxuXHQgICAgICAgIH1cblx0ICAgICAgICByZXR1cm4gdm1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH0sXG5cblx0ICAvKipcblx0ICAgKiBEZWxldGUgYSBjYWNoZWQgdm0gaW5zdGFuY2UuXG5cdCAgICpcblx0ICAgKiBAcGFyYW0ge1Z1ZX0gdm1cblx0ICAgKi9cblxuXHQgIHVuY2FjaGVWbTogZnVuY3Rpb24gKHZtKSB7XG5cdCAgICB2YXIgZGF0YSA9IHZtLl9yYXdcblx0ICAgIGlmICh0aGlzLmlkS2V5KSB7XG5cdCAgICAgIHRoaXMuY2FjaGVbZGF0YVt0aGlzLmlkS2V5XV0gPSBudWxsXG5cdCAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGRhdGEpKSB7XG5cdCAgICAgIGRhdGFbdGhpcy5pZF0gPSBudWxsXG5cdCAgICAgIHZtLl9yYXcgPSBudWxsXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICB0aGlzLmNhY2hlW2RhdGFdLnBvcCgpXG5cdCAgICB9XG5cdCAgfVxuXG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIHRvIGZpbmQgdGhlIG5leHQgZWxlbWVudCB0aGF0IGlzIGFuIGluc3RhbmNlXG5cdCAqIHJvb3Qgbm9kZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBhIGRlc3Ryb3llZCB2bSdzXG5cdCAqIGVsZW1lbnQgY291bGQgc3RpbGwgYmUgbGluZ2VyaW5nIGluIHRoZSBET00gYmVmb3JlIGl0c1xuXHQgKiBsZWF2aW5nIHRyYW5zaXRpb24gZmluaXNoZXMsIGJ1dCBpdHMgX192dWVfXyByZWZlcmVuY2Vcblx0ICogc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkIHNvIHdlIGNhbiBza2lwIHRoZW0uXG5cdCAqXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge0NvbW1lbnROb2RlfSByZWZcblx0ICogQHJldHVybiB7VnVlfVxuXHQgKi9cblxuXHRmdW5jdGlvbiBmaW5kTmV4dFZtICh2bSwgcmVmKSB7XG5cdCAgdmFyIGVsID0gKHZtLl9ibG9ja0VuZCB8fCB2bS4kZWwpLm5leHRTaWJsaW5nXG5cdCAgd2hpbGUgKCFlbC5fX3Z1ZV9fICYmIGVsICE9PSByZWYpIHtcblx0ICAgIGVsID0gZWwubmV4dFNpYmxpbmdcblx0ICB9XG5cdCAgcmV0dXJuIGVsLl9fdnVlX19cblx0fVxuXG5cdC8qKlxuXHQgKiBBdHRlbXB0IHRvIGNvbnZlcnQgbm9uLUFycmF5IG9iamVjdHMgdG8gYXJyYXkuXG5cdCAqIFRoaXMgaXMgdGhlIGRlZmF1bHQgZmlsdGVyIGluc3RhbGxlZCB0byBldmVyeSB2LXJlcGVhdFxuXHQgKiBkaXJlY3RpdmUuXG5cdCAqXG5cdCAqIEl0IHdpbGwgYmUgY2FsbGVkIHdpdGggKip0aGUgZGlyZWN0aXZlKiogYXMgYHRoaXNgXG5cdCAqIGNvbnRleHQgc28gdGhhdCB3ZSBjYW4gbWFyayB0aGUgcmVwZWF0IGFycmF5IGFzIGNvbnZlcnRlZFxuXHQgKiBmcm9tIGFuIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHsqfSBvYmpcblx0ICogQHJldHVybiB7QXJyYXl9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIG9ialRvQXJyYXkgKG9iaikge1xuXHQgIGlmICghXy5pc1BsYWluT2JqZWN0KG9iaikpIHtcblx0ICAgIHJldHVybiBvYmpcblx0ICB9XG5cdCAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopXG5cdCAgdmFyIGkgPSBrZXlzLmxlbmd0aFxuXHQgIHZhciByZXMgPSBuZXcgQXJyYXkoaSlcblx0ICB2YXIga2V5XG5cdCAgd2hpbGUgKGktLSkge1xuXHQgICAga2V5ID0ga2V5c1tpXVxuXHQgICAgcmVzW2ldID0ge1xuXHQgICAgICBrZXk6IGtleSxcblx0ICAgICAgdmFsdWU6IG9ialtrZXldXG5cdCAgICB9XG5cdCAgfVxuXHQgIC8vIGB0aGlzYCBwb2ludHMgdG8gdGhlIHJlcGVhdCBkaXJlY3RpdmUgaW5zdGFuY2Vcblx0ICB0aGlzLmNvbnZlcnRlZCA9IHRydWVcblx0ICByZXR1cm4gcmVzXG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGEgcmFuZ2UgYXJyYXkgZnJvbSBnaXZlbiBudW1iZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBuXG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKi9cblxuXHRmdW5jdGlvbiByYW5nZSAobikge1xuXHQgIHZhciBpID0gLTFcblx0ICB2YXIgcmV0ID0gbmV3IEFycmF5KG4pXG5cdCAgd2hpbGUgKCsraSA8IG4pIHtcblx0ICAgIHJldFtpXSA9IGlcblx0ICB9XG5cdCAgcmV0dXJuIHJldFxuXHR9XG5cbi8qKiovIH0sXG4vKiAzNiAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBjb21waWxlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0Nilcblx0dmFyIHRlbXBsYXRlUGFyc2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1MSlcblx0dmFyIHRyYW5zaXRpb24gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQ1KVxuXG5cdG1vZHVsZS5leHBvcnRzID0ge1xuXG5cdCAgYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgdmFyIGVsID0gdGhpcy5lbFxuXHQgICAgaWYgKCFlbC5fX3Z1ZV9fKSB7XG5cdCAgICAgIHRoaXMuc3RhcnQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LWlmLXN0YXJ0Jylcblx0ICAgICAgdGhpcy5lbmQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LWlmLWVuZCcpXG5cdCAgICAgIF8ucmVwbGFjZShlbCwgdGhpcy5lbmQpXG5cdCAgICAgIF8uYmVmb3JlKHRoaXMuc3RhcnQsIHRoaXMuZW5kKVxuXHQgICAgICBpZiAoZWwudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuXHQgICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZVBhcnNlci5wYXJzZShlbCwgdHJ1ZSlcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICB0aGlzLnRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdCAgICAgICAgdGhpcy50ZW1wbGF0ZS5hcHBlbmRDaGlsZChlbClcblx0ICAgICAgfVxuXHQgICAgICAvLyBjb21waWxlIHRoZSBuZXN0ZWQgcGFydGlhbFxuXHQgICAgICB0aGlzLmxpbmtlciA9IGNvbXBpbGUoXG5cdCAgICAgICAgdGhpcy50ZW1wbGF0ZSxcblx0ICAgICAgICB0aGlzLnZtLiRvcHRpb25zLFxuXHQgICAgICAgIHRydWVcblx0ICAgICAgKVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgdGhpcy5pbnZhbGlkID0gdHJ1ZVxuXHQgICAgICBfLndhcm4oXG5cdCAgICAgICAgJ3YtaWY9XCInICsgdGhpcy5leHByZXNzaW9uICsgJ1wiIGNhbm5vdCBiZSAnICtcblx0ICAgICAgICAndXNlZCBvbiBhbiBhbHJlYWR5IG1vdW50ZWQgaW5zdGFuY2UuJ1xuXHQgICAgICApXG5cdCAgICB9XG5cdCAgfSxcblxuXHQgIHVwZGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG5cdCAgICBpZiAodGhpcy5pbnZhbGlkKSByZXR1cm5cblx0ICAgIGlmICh2YWx1ZSkge1xuXHQgICAgICB0aGlzLmluc2VydCgpXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICB0aGlzLnRlYXJkb3duKClcblx0ICAgIH1cblx0ICB9LFxuXG5cdCAgaW5zZXJ0OiBmdW5jdGlvbiAoKSB7XG5cdCAgICAvLyBhdm9pZCBkdXBsaWNhdGUgaW5zZXJ0cywgc2luY2UgdXBkYXRlKCkgY2FuIGJlXG5cdCAgICAvLyBjYWxsZWQgd2l0aCBkaWZmZXJlbnQgdHJ1dGh5IHZhbHVlc1xuXHQgICAgaWYgKHRoaXMuZGVjb21waWxlKSB7XG5cdCAgICAgIHJldHVyblxuXHQgICAgfVxuXHQgICAgdmFyIHZtID0gdGhpcy52bVxuXHQgICAgdmFyIGZyYWcgPSB0ZW1wbGF0ZVBhcnNlci5jbG9uZSh0aGlzLnRlbXBsYXRlKVxuXHQgICAgdmFyIGRlY29tcGlsZSA9IHRoaXMubGlua2VyKHZtLCBmcmFnKVxuXHQgICAgdGhpcy5kZWNvbXBpbGUgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIGRlY29tcGlsZSgpXG5cdCAgICAgIHRyYW5zaXRpb24uYmxvY2tSZW1vdmUodGhpcy5zdGFydCwgdGhpcy5lbmQsIHZtKVxuXHQgICAgfVxuXHQgICAgdHJhbnNpdGlvbi5ibG9ja0FwcGVuZChmcmFnLCB0aGlzLmVuZCwgdm0pXG5cdCAgfSxcblxuXHQgIHRlYXJkb3duOiBmdW5jdGlvbiAoKSB7XG5cdCAgICBpZiAodGhpcy5kZWNvbXBpbGUpIHtcblx0ICAgICAgdGhpcy5kZWNvbXBpbGUoKVxuXHQgICAgICB0aGlzLmRlY29tcGlsZSA9IG51bGxcblx0ICAgIH1cblx0ICB9XG5cblx0fVxuXG4vKioqLyB9LFxuLyogMzcgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgV2F0Y2hlciA9IF9fd2VicGFja19yZXF1aXJlX18oMjEpXG5cblx0bW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0ICBwcmlvcml0eTogOTAwLFxuXG5cdCAgYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgdmFyIHZtID0gdGhpcy52bVxuXHQgICAgaWYgKHRoaXMuZWwgIT09IHZtLiRlbCkge1xuXHQgICAgICBfLndhcm4oXG5cdCAgICAgICAgJ3Ytd2l0aCBjYW4gb25seSBiZSB1c2VkIG9uIGluc3RhbmNlIHJvb3QgZWxlbWVudHMuJ1xuXHQgICAgICApXG5cdCAgICB9IGVsc2UgaWYgKCF2bS4kcGFyZW50KSB7XG5cdCAgICAgIF8ud2Fybihcblx0ICAgICAgICAndi13aXRoIG11c3QgYmUgdXNlZCBvbiBhbiBpbnN0YW5jZSB3aXRoIGEgcGFyZW50Lidcblx0ICAgICAgKVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgdmFyIGtleSA9IHRoaXMuYXJnXG5cdCAgICAgIHRoaXMud2F0Y2hlciA9IG5ldyBXYXRjaGVyKFxuXHQgICAgICAgIHZtLiRwYXJlbnQsXG5cdCAgICAgICAgdGhpcy5leHByZXNzaW9uLFxuXHQgICAgICAgIGtleVxuXHQgICAgICAgICAgPyBmdW5jdGlvbiAodmFsKSB7XG5cdCAgICAgICAgICAgICAgdm0uJHNldChrZXksIHZhbClcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgOiBmdW5jdGlvbiAodmFsKSB7XG5cdCAgICAgICAgICAgICAgdm0uJGRhdGEgPSB2YWxcblx0ICAgICAgICAgICAgfVxuXHQgICAgICApXG5cdCAgICAgIC8vIGluaXRpYWwgc2V0XG5cdCAgICAgIHZhciBpbml0aWFsVmFsID0gdGhpcy53YXRjaGVyLnZhbHVlXG5cdCAgICAgIGlmIChrZXkpIHtcblx0ICAgICAgICB2bS4kc2V0KGtleSwgaW5pdGlhbFZhbClcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICB2bS4kZGF0YSA9IGluaXRpYWxWYWxcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH0sXG5cblx0ICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIGlmICh0aGlzLndhdGNoZXIpIHtcblx0ICAgICAgdGhpcy53YXRjaGVyLnRlYXJkb3duKClcblx0ICAgIH1cblx0ICB9XG5cblx0fVxuXG4vKioqLyB9LFxuLyogMzggKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgUGF0aCA9IF9fd2VicGFja19yZXF1aXJlX18oNDEpXG5cblx0LyoqXG5cdCAqIEZpbHRlciBmaWx0ZXIgZm9yIHYtcmVwZWF0XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzZWFyY2hLZXlcblx0ICogQHBhcmFtIHtTdHJpbmd9IFtkZWxpbWl0ZXJdXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhS2V5XG5cdCAqL1xuXG5cdGV4cG9ydHMuZmlsdGVyQnkgPSBmdW5jdGlvbiAoYXJyLCBzZWFyY2hLZXksIGRlbGltaXRlciwgZGF0YUtleSkge1xuXHQgIC8vIGFsbG93IG9wdGlvbmFsIGBpbmAgZGVsaW1pdGVyXG5cdCAgLy8gYmVjYXVzZSB3aHkgbm90XG5cdCAgaWYgKGRlbGltaXRlciAmJiBkZWxpbWl0ZXIgIT09ICdpbicpIHtcblx0ICAgIGRhdGFLZXkgPSBkZWxpbWl0ZXJcblx0ICB9XG5cdCAgLy8gZ2V0IHRoZSBzZWFyY2ggc3RyaW5nXG5cdCAgdmFyIHNlYXJjaCA9XG5cdCAgICBfLnN0cmlwUXVvdGVzKHNlYXJjaEtleSkgfHxcblx0ICAgIHRoaXMuJGdldChzZWFyY2hLZXkpXG5cdCAgaWYgKCFzZWFyY2gpIHtcblx0ICAgIHJldHVybiBhcnJcblx0ICB9XG5cdCAgc2VhcmNoID0gc2VhcmNoLnRvTG93ZXJDYXNlKClcblx0ICAvLyBnZXQgdGhlIG9wdGlvbmFsIGRhdGFLZXlcblx0ICBkYXRhS2V5ID1cblx0ICAgIGRhdGFLZXkgJiZcblx0ICAgIChfLnN0cmlwUXVvdGVzKGRhdGFLZXkpIHx8IHRoaXMuJGdldChkYXRhS2V5KSlcblx0ICByZXR1cm4gYXJyLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuXHQgICAgcmV0dXJuIGRhdGFLZXlcblx0ICAgICAgPyBjb250YWlucyhQYXRoLmdldChpdGVtLCBkYXRhS2V5KSwgc2VhcmNoKVxuXHQgICAgICA6IGNvbnRhaW5zKGl0ZW0sIHNlYXJjaClcblx0ICB9KVxuXHR9XG5cblx0LyoqXG5cdCAqIEZpbHRlciBmaWx0ZXIgZm9yIHYtcmVwZWF0XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzb3J0S2V5XG5cdCAqIEBwYXJhbSB7U3RyaW5nfSByZXZlcnNlS2V5XG5cdCAqL1xuXG5cdGV4cG9ydHMub3JkZXJCeSA9IGZ1bmN0aW9uIChhcnIsIHNvcnRLZXksIHJldmVyc2VLZXkpIHtcblx0ICB2YXIga2V5ID1cblx0ICAgIF8uc3RyaXBRdW90ZXMoc29ydEtleSkgfHxcblx0ICAgIHRoaXMuJGdldChzb3J0S2V5KVxuXHQgIGlmICgha2V5KSB7XG5cdCAgICByZXR1cm4gYXJyXG5cdCAgfVxuXHQgIHZhciBvcmRlciA9IDFcblx0ICBpZiAocmV2ZXJzZUtleSkge1xuXHQgICAgaWYgKHJldmVyc2VLZXkgPT09ICctMScpIHtcblx0ICAgICAgb3JkZXIgPSAtMVxuXHQgICAgfSBlbHNlIGlmIChyZXZlcnNlS2V5LmNoYXJDb2RlQXQoMCkgPT09IDB4MjEpIHsgLy8gIVxuXHQgICAgICByZXZlcnNlS2V5ID0gcmV2ZXJzZUtleS5zbGljZSgxKVxuXHQgICAgICBvcmRlciA9IHRoaXMuJGdldChyZXZlcnNlS2V5KSA/IDEgOiAtMVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgb3JkZXIgPSB0aGlzLiRnZXQocmV2ZXJzZUtleSkgPyAtMSA6IDFcblx0ICAgIH1cblx0ICB9XG5cdCAgLy8gc29ydCBvbiBhIGNvcHkgdG8gYXZvaWQgbXV0YXRpbmcgb3JpZ2luYWwgYXJyYXlcblx0ICByZXR1cm4gYXJyLnNsaWNlKCkuc29ydChmdW5jdGlvbiAoYSwgYikge1xuXHQgICAgYSA9IFBhdGguZ2V0KGEsIGtleSlcblx0ICAgIGIgPSBQYXRoLmdldChiLCBrZXkpXG5cdCAgICByZXR1cm4gYSA9PT0gYiA/IDAgOiBhID4gYiA/IG9yZGVyIDogLW9yZGVyXG5cdCAgfSlcblx0fVxuXG5cdC8qKlxuXHQgKiBTdHJpbmcgY29udGFpbiBoZWxwZXJcblx0ICpcblx0ICogQHBhcmFtIHsqfSB2YWxcblx0ICogQHBhcmFtIHtTdHJpbmd9IHNlYXJjaFxuXHQgKi9cblxuXHRmdW5jdGlvbiBjb250YWlucyAodmFsLCBzZWFyY2gpIHtcblx0ICBpZiAoXy5pc09iamVjdCh2YWwpKSB7XG5cdCAgICBmb3IgKHZhciBrZXkgaW4gdmFsKSB7XG5cdCAgICAgIGlmIChjb250YWlucyh2YWxba2V5XSwgc2VhcmNoKSkge1xuXHQgICAgICAgIHJldHVybiB0cnVlXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9IGVsc2UgaWYgKHZhbCAhPSBudWxsKSB7XG5cdCAgICByZXR1cm4gdmFsLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaCkgPiAtMVxuXHQgIH1cblx0fVxuXG4vKioqLyB9LFxuLyogMzkgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciB1aWQgPSAwXG5cblx0LyoqXG5cdCAqIEEgYmluZGluZyBpcyBhbiBvYnNlcnZhYmxlIHRoYXQgY2FuIGhhdmUgbXVsdGlwbGVcblx0ICogZGlyZWN0aXZlcyBzdWJzY3JpYmluZyB0byBpdC5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIEJpbmRpbmcgKCkge1xuXHQgIHRoaXMuaWQgPSArK3VpZFxuXHQgIHRoaXMuc3VicyA9IFtdXG5cdH1cblxuXHR2YXIgcCA9IEJpbmRpbmcucHJvdG90eXBlXG5cblx0LyoqXG5cdCAqIEFkZCBhIGRpcmVjdGl2ZSBzdWJzY3JpYmVyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0RpcmVjdGl2ZX0gc3ViXG5cdCAqL1xuXG5cdHAuYWRkU3ViID0gZnVuY3Rpb24gKHN1Yikge1xuXHQgIHRoaXMuc3Vicy5wdXNoKHN1Yilcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYSBkaXJlY3RpdmUgc3Vic2NyaWJlci5cblx0ICpcblx0ICogQHBhcmFtIHtEaXJlY3RpdmV9IHN1YlxuXHQgKi9cblxuXHRwLnJlbW92ZVN1YiA9IGZ1bmN0aW9uIChzdWIpIHtcblx0ICBpZiAodGhpcy5zdWJzLmxlbmd0aCkge1xuXHQgICAgdmFyIGkgPSB0aGlzLnN1YnMuaW5kZXhPZihzdWIpXG5cdCAgICBpZiAoaSA+IC0xKSB0aGlzLnN1YnMuc3BsaWNlKGksIDEpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIE5vdGlmeSBhbGwgc3Vic2NyaWJlcnMgb2YgYSBuZXcgdmFsdWUuXG5cdCAqL1xuXG5cdHAubm90aWZ5ID0gZnVuY3Rpb24gKCkge1xuXHQgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5zdWJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHQgICAgdGhpcy5zdWJzW2ldLnVwZGF0ZSgpXG5cdCAgfVxuXHR9XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBCaW5kaW5nXG5cbi8qKiovIH0sXG4vKiA0MCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBjb25maWcgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIwKVxuXHR2YXIgV2F0Y2hlciA9IF9fd2VicGFja19yZXF1aXJlX18oMjEpXG5cdHZhciB0ZXh0UGFyc2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0Milcblx0dmFyIGV4cFBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNDQpXG5cblx0LyoqXG5cdCAqIEEgZGlyZWN0aXZlIGxpbmtzIGEgRE9NIGVsZW1lbnQgd2l0aCBhIHBpZWNlIG9mIGRhdGEsXG5cdCAqIHdoaWNoIGlzIHRoZSByZXN1bHQgb2YgZXZhbHVhdGluZyBhbiBleHByZXNzaW9uLlxuXHQgKiBJdCByZWdpc3RlcnMgYSB3YXRjaGVyIHdpdGggdGhlIGV4cHJlc3Npb24gYW5kIGNhbGxzXG5cdCAqIHRoZSBET00gdXBkYXRlIGZ1bmN0aW9uIHdoZW4gYSBjaGFuZ2UgaXMgdHJpZ2dlcmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuXHQgKiBAcGFyYW0ge05vZGV9IGVsXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGVzY3JpcHRvclxuXHQgKiAgICAgICAgICAgICAgICAgLSB7U3RyaW5nfSBleHByZXNzaW9uXG5cdCAqICAgICAgICAgICAgICAgICAtIHtTdHJpbmd9IFthcmddXG5cdCAqICAgICAgICAgICAgICAgICAtIHtBcnJheTxPYmplY3Q+fSBbZmlsdGVyc11cblx0ICogQHBhcmFtIHtPYmplY3R9IGRlZiAtIGRpcmVjdGl2ZSBkZWZpbml0aW9uIG9iamVjdFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbbGlua2VyXSAtIHByZS1jb21waWxlZCBsaW5rZXIgZnVuY3Rpb25cblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIERpcmVjdGl2ZSAobmFtZSwgZWwsIHZtLCBkZXNjcmlwdG9yLCBkZWYsIGxpbmtlcikge1xuXHQgIC8vIHB1YmxpY1xuXHQgIHRoaXMubmFtZSA9IG5hbWVcblx0ICB0aGlzLmVsID0gZWxcblx0ICB0aGlzLnZtID0gdm1cblx0ICAvLyBjb3B5IGRlc2NyaXB0b3IgcHJvcHNcblx0ICB0aGlzLnJhdyA9IGRlc2NyaXB0b3IucmF3XG5cdCAgdGhpcy5leHByZXNzaW9uID0gZGVzY3JpcHRvci5leHByZXNzaW9uXG5cdCAgdGhpcy5hcmcgPSBkZXNjcmlwdG9yLmFyZ1xuXHQgIHRoaXMuZmlsdGVycyA9IF8ucmVzb2x2ZUZpbHRlcnModm0sIGRlc2NyaXB0b3IuZmlsdGVycylcblx0ICAvLyBwcml2YXRlXG5cdCAgdGhpcy5fbGlua2VyID0gbGlua2VyXG5cdCAgdGhpcy5fbG9ja2VkID0gZmFsc2Vcblx0ICB0aGlzLl9ib3VuZCA9IGZhbHNlXG5cdCAgLy8gaW5pdFxuXHQgIHRoaXMuX2JpbmQoZGVmKVxuXHR9XG5cblx0dmFyIHAgPSBEaXJlY3RpdmUucHJvdG90eXBlXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgdGhlIGRpcmVjdGl2ZSwgbWl4aW4gZGVmaW5pdGlvbiBwcm9wZXJ0aWVzLFxuXHQgKiBzZXR1cCB0aGUgd2F0Y2hlciwgY2FsbCBkZWZpbml0aW9uIGJpbmQoKSBhbmQgdXBkYXRlKClcblx0ICogaWYgcHJlc2VudC5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGRlZlxuXHQgKi9cblxuXHRwLl9iaW5kID0gZnVuY3Rpb24gKGRlZikge1xuXHQgIGlmICh0aGlzLm5hbWUgIT09ICdjbG9haycgJiYgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUpIHtcblx0ICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKGNvbmZpZy5wcmVmaXggKyB0aGlzLm5hbWUpXG5cdCAgfVxuXHQgIGlmICh0eXBlb2YgZGVmID09PSAnZnVuY3Rpb24nKSB7XG5cdCAgICB0aGlzLnVwZGF0ZSA9IGRlZlxuXHQgIH0gZWxzZSB7XG5cdCAgICBfLmV4dGVuZCh0aGlzLCBkZWYpXG5cdCAgfVxuXHQgIHRoaXMuX3dhdGNoZXJFeHAgPSB0aGlzLmV4cHJlc3Npb25cblx0ICB0aGlzLl9jaGVja0R5bmFtaWNMaXRlcmFsKClcblx0ICBpZiAodGhpcy5iaW5kKSB7XG5cdCAgICB0aGlzLmJpbmQoKVxuXHQgIH1cblx0ICBpZiAoXG5cdCAgICB0aGlzLnVwZGF0ZSAmJiB0aGlzLl93YXRjaGVyRXhwICYmXG5cdCAgICAoIXRoaXMuaXNMaXRlcmFsIHx8IHRoaXMuX2lzRHluYW1pY0xpdGVyYWwpICYmXG5cdCAgICAhdGhpcy5fY2hlY2tTdGF0ZW1lbnQoKVxuXHQgICkge1xuXHQgICAgLy8gdXNlIHJhdyBleHByZXNzaW9uIGFzIGlkZW50aWZpZXIgYmVjYXVzZSBmaWx0ZXJzXG5cdCAgICAvLyBtYWtlIHRoZW0gZGlmZmVyZW50IHdhdGNoZXJzXG5cdCAgICB2YXIgd2F0Y2hlciA9IHRoaXMudm0uX3dhdGNoZXJzW3RoaXMucmF3XVxuXHQgICAgLy8gd3JhcHBlZCB1cGRhdGVyIGZvciBjb250ZXh0XG5cdCAgICB2YXIgZGlyID0gdGhpc1xuXHQgICAgdmFyIHVwZGF0ZSA9IHRoaXMuX3VwZGF0ZSA9IGZ1bmN0aW9uICh2YWwsIG9sZFZhbCkge1xuXHQgICAgICBpZiAoIWRpci5fbG9ja2VkKSB7XG5cdCAgICAgICAgZGlyLnVwZGF0ZSh2YWwsIG9sZFZhbClcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgICAgaWYgKCF3YXRjaGVyKSB7XG5cdCAgICAgIHdhdGNoZXIgPSB0aGlzLnZtLl93YXRjaGVyc1t0aGlzLnJhd10gPSBuZXcgV2F0Y2hlcihcblx0ICAgICAgICB0aGlzLnZtLFxuXHQgICAgICAgIHRoaXMuX3dhdGNoZXJFeHAsXG5cdCAgICAgICAgdXBkYXRlLCAvLyBjYWxsYmFja1xuXHQgICAgICAgIHRoaXMuZmlsdGVycyxcblx0ICAgICAgICB0aGlzLnR3b1dheSAvLyBuZWVkIHNldHRlclxuXHQgICAgICApXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICB3YXRjaGVyLmFkZENiKHVwZGF0ZSlcblx0ICAgIH1cblx0ICAgIHRoaXMuX3dhdGNoZXIgPSB3YXRjaGVyXG5cdCAgICBpZiAodGhpcy5faW5pdFZhbHVlICE9IG51bGwpIHtcblx0ICAgICAgd2F0Y2hlci5zZXQodGhpcy5faW5pdFZhbHVlKVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgdGhpcy51cGRhdGUod2F0Y2hlci52YWx1ZSlcblx0ICAgIH1cblx0ICB9XG5cdCAgdGhpcy5fYm91bmQgPSB0cnVlXG5cdH1cblxuXHQvKipcblx0ICogY2hlY2sgaWYgdGhpcyBpcyBhIGR5bmFtaWMgbGl0ZXJhbCBiaW5kaW5nLlxuXHQgKlxuXHQgKiBlLmcuIHYtY29tcG9uZW50PVwie3tjdXJyZW50Vmlld319XCJcblx0ICovXG5cblx0cC5fY2hlY2tEeW5hbWljTGl0ZXJhbCA9IGZ1bmN0aW9uICgpIHtcblx0ICB2YXIgZXhwcmVzc2lvbiA9IHRoaXMuZXhwcmVzc2lvblxuXHQgIGlmIChleHByZXNzaW9uICYmIHRoaXMuaXNMaXRlcmFsKSB7XG5cdCAgICB2YXIgdG9rZW5zID0gdGV4dFBhcnNlci5wYXJzZShleHByZXNzaW9uKVxuXHQgICAgaWYgKHRva2Vucykge1xuXHQgICAgICB2YXIgZXhwID0gdGV4dFBhcnNlci50b2tlbnNUb0V4cCh0b2tlbnMpXG5cdCAgICAgIHRoaXMuZXhwcmVzc2lvbiA9IHRoaXMudm0uJGdldChleHApXG5cdCAgICAgIHRoaXMuX3dhdGNoZXJFeHAgPSBleHBcblx0ICAgICAgdGhpcy5faXNEeW5hbWljTGl0ZXJhbCA9IHRydWVcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIGRpcmVjdGl2ZSBpcyBhIGZ1bmN0aW9uIGNhbGxlclxuXHQgKiBhbmQgaWYgdGhlIGV4cHJlc3Npb24gaXMgYSBjYWxsYWJsZSBvbmUuIElmIGJvdGggdHJ1ZSxcblx0ICogd2Ugd3JhcCB1cCB0aGUgZXhwcmVzc2lvbiBhbmQgdXNlIGl0IGFzIHRoZSBldmVudFxuXHQgKiBoYW5kbGVyLlxuXHQgKlxuXHQgKiBlLmcuIHYtb249XCJjbGljazogYSsrXCJcblx0ICpcblx0ICogQHJldHVybiB7Qm9vbGVhbn1cblx0ICovXG5cblx0cC5fY2hlY2tTdGF0ZW1lbnQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb25cblx0ICBpZiAoXG5cdCAgICBleHByZXNzaW9uICYmIHRoaXMuYWNjZXB0U3RhdGVtZW50ICYmXG5cdCAgICAhZXhwUGFyc2VyLnBhdGhUZXN0UkUudGVzdChleHByZXNzaW9uKVxuXHQgICkge1xuXHQgICAgdmFyIGZuID0gZXhwUGFyc2VyLnBhcnNlKGV4cHJlc3Npb24pLmdldFxuXHQgICAgdmFyIHZtID0gdGhpcy52bVxuXHQgICAgdmFyIGhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIGZuLmNhbGwodm0sIHZtKVxuXHQgICAgfVxuXHQgICAgaWYgKHRoaXMuZmlsdGVycykge1xuXHQgICAgICBoYW5kbGVyID0gXy5hcHBseUZpbHRlcnMoXG5cdCAgICAgICAgaGFuZGxlcixcblx0ICAgICAgICB0aGlzLmZpbHRlcnMucmVhZCxcblx0ICAgICAgICB2bVxuXHQgICAgICApXG5cdCAgICB9XG5cdCAgICB0aGlzLnVwZGF0ZShoYW5kbGVyKVxuXHQgICAgcmV0dXJuIHRydWVcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogVGVhcmRvd24gdGhlIHdhdGNoZXIgYW5kIGNhbGwgdW5iaW5kLlxuXHQgKi9cblxuXHRwLl90ZWFyZG93biA9IGZ1bmN0aW9uICgpIHtcblx0ICBpZiAodGhpcy5fYm91bmQpIHtcblx0ICAgIGlmICh0aGlzLnVuYmluZCkge1xuXHQgICAgICB0aGlzLnVuYmluZCgpXG5cdCAgICB9XG5cdCAgICB2YXIgd2F0Y2hlciA9IHRoaXMuX3dhdGNoZXJcblx0ICAgIGlmICh3YXRjaGVyICYmIHdhdGNoZXIuYWN0aXZlKSB7XG5cdCAgICAgIHdhdGNoZXIucmVtb3ZlQ2IodGhpcy5fdXBkYXRlKVxuXHQgICAgICBpZiAoIXdhdGNoZXIuYWN0aXZlKSB7XG5cdCAgICAgICAgdGhpcy52bS5fd2F0Y2hlcnNbdGhpcy5yYXddID0gbnVsbFxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgICB0aGlzLl9ib3VuZCA9IGZhbHNlXG5cdCAgICB0aGlzLnZtID0gdGhpcy5lbCA9IHRoaXMuX3dhdGNoZXIgPSBudWxsXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZSB3aXRoIHRoZSBzZXR0ZXIuXG5cdCAqIFRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbiB0d28td2F5IGRpcmVjdGl2ZXNcblx0ICogZS5nLiB2LW1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0geyp9IHZhbHVlXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gbG9jayAtIHByZXZlbnQgd3J0aWUgdHJpZ2dlcmluZyB1cGRhdGUuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cblx0cC5zZXQgPSBmdW5jdGlvbiAodmFsdWUsIGxvY2spIHtcblx0ICBpZiAodGhpcy50d29XYXkpIHtcblx0ICAgIGlmIChsb2NrKSB7XG5cdCAgICAgIHRoaXMuX2xvY2tlZCA9IHRydWVcblx0ICAgIH1cblx0ICAgIHRoaXMuX3dhdGNoZXIuc2V0KHZhbHVlKVxuXHQgICAgaWYgKGxvY2spIHtcblx0ICAgICAgdmFyIHNlbGYgPSB0aGlzXG5cdCAgICAgIF8ubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHQgICAgICAgIHNlbGYuX2xvY2tlZCA9IGZhbHNlICAgICAgICBcblx0ICAgICAgfSlcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cyA9IERpcmVjdGl2ZVxuXG4vKioqLyB9LFxuLyogNDEgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgQ2FjaGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUyKVxuXHR2YXIgcGF0aENhY2hlID0gbmV3IENhY2hlKDEwMDApXG5cdHZhciBpZGVudFJFID0gL15bJF9hLXpBLVpdK1tcXHckXSokL1xuXG5cdC8qKlxuXHQgKiBQYXRoLXBhcnNpbmcgYWxnb3JpdGhtIHNjb29wZWQgZnJvbSBQb2x5bWVyL29ic2VydmUtanNcblx0ICovXG5cblx0dmFyIHBhdGhTdGF0ZU1hY2hpbmUgPSB7XG5cdCAgJ2JlZm9yZVBhdGgnOiB7XG5cdCAgICAnd3MnOiBbJ2JlZm9yZVBhdGgnXSxcblx0ICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcblx0ICAgICdbJzogWydiZWZvcmVFbGVtZW50J10sXG5cdCAgICAnZW9mJzogWydhZnRlclBhdGgnXVxuXHQgIH0sXG5cblx0ICAnaW5QYXRoJzoge1xuXHQgICAgJ3dzJzogWydpblBhdGgnXSxcblx0ICAgICcuJzogWydiZWZvcmVJZGVudCddLFxuXHQgICAgJ1snOiBbJ2JlZm9yZUVsZW1lbnQnXSxcblx0ICAgICdlb2YnOiBbJ2FmdGVyUGF0aCddXG5cdCAgfSxcblxuXHQgICdiZWZvcmVJZGVudCc6IHtcblx0ICAgICd3cyc6IFsnYmVmb3JlSWRlbnQnXSxcblx0ICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXVxuXHQgIH0sXG5cblx0ICAnaW5JZGVudCc6IHtcblx0ICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcblx0ICAgICcwJzogWydpbklkZW50JywgJ2FwcGVuZCddLFxuXHQgICAgJ251bWJlcic6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcblx0ICAgICd3cyc6IFsnaW5QYXRoJywgJ3B1c2gnXSxcblx0ICAgICcuJzogWydiZWZvcmVJZGVudCcsICdwdXNoJ10sXG5cdCAgICAnWyc6IFsnYmVmb3JlRWxlbWVudCcsICdwdXNoJ10sXG5cdCAgICAnZW9mJzogWydhZnRlclBhdGgnLCAncHVzaCddXG5cdCAgfSxcblxuXHQgICdiZWZvcmVFbGVtZW50Jzoge1xuXHQgICAgJ3dzJzogWydiZWZvcmVFbGVtZW50J10sXG5cdCAgICAnMCc6IFsnYWZ0ZXJaZXJvJywgJ2FwcGVuZCddLFxuXHQgICAgJ251bWJlcic6IFsnaW5JbmRleCcsICdhcHBlbmQnXSxcblx0ICAgIFwiJ1wiOiBbJ2luU2luZ2xlUXVvdGUnLCAnYXBwZW5kJywgJyddLFxuXHQgICAgJ1wiJzogWydpbkRvdWJsZVF1b3RlJywgJ2FwcGVuZCcsICcnXVxuXHQgIH0sXG5cblx0ICAnYWZ0ZXJaZXJvJzoge1xuXHQgICAgJ3dzJzogWydhZnRlckVsZW1lbnQnLCAncHVzaCddLFxuXHQgICAgJ10nOiBbJ2luUGF0aCcsICdwdXNoJ11cblx0ICB9LFxuXG5cdCAgJ2luSW5kZXgnOiB7XG5cdCAgICAnMCc6IFsnaW5JbmRleCcsICdhcHBlbmQnXSxcblx0ICAgICdudW1iZXInOiBbJ2luSW5kZXgnLCAnYXBwZW5kJ10sXG5cdCAgICAnd3MnOiBbJ2FmdGVyRWxlbWVudCddLFxuXHQgICAgJ10nOiBbJ2luUGF0aCcsICdwdXNoJ11cblx0ICB9LFxuXG5cdCAgJ2luU2luZ2xlUXVvdGUnOiB7XG5cdCAgICBcIidcIjogWydhZnRlckVsZW1lbnQnXSxcblx0ICAgICdlb2YnOiAnZXJyb3InLFxuXHQgICAgJ2Vsc2UnOiBbJ2luU2luZ2xlUXVvdGUnLCAnYXBwZW5kJ11cblx0ICB9LFxuXG5cdCAgJ2luRG91YmxlUXVvdGUnOiB7XG5cdCAgICAnXCInOiBbJ2FmdGVyRWxlbWVudCddLFxuXHQgICAgJ2VvZic6ICdlcnJvcicsXG5cdCAgICAnZWxzZSc6IFsnaW5Eb3VibGVRdW90ZScsICdhcHBlbmQnXVxuXHQgIH0sXG5cblx0ICAnYWZ0ZXJFbGVtZW50Jzoge1xuXHQgICAgJ3dzJzogWydhZnRlckVsZW1lbnQnXSxcblx0ICAgICddJzogWydpblBhdGgnLCAncHVzaCddXG5cdCAgfVxuXHR9XG5cblx0ZnVuY3Rpb24gbm9vcCAoKSB7fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgdGhlIHR5cGUgb2YgYSBjaGFyYWN0ZXIgaW4gYSBrZXlwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0NoYXJ9IGNoYXJcblx0ICogQHJldHVybiB7U3RyaW5nfSB0eXBlXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGdldFBhdGhDaGFyVHlwZSAoY2hhcikge1xuXHQgIGlmIChjaGFyID09PSB1bmRlZmluZWQpIHtcblx0ICAgIHJldHVybiAnZW9mJ1xuXHQgIH1cblxuXHQgIHZhciBjb2RlID0gY2hhci5jaGFyQ29kZUF0KDApXG5cblx0ICBzd2l0Y2goY29kZSkge1xuXHQgICAgY2FzZSAweDVCOiAvLyBbXG5cdCAgICBjYXNlIDB4NUQ6IC8vIF1cblx0ICAgIGNhc2UgMHgyRTogLy8gLlxuXHQgICAgY2FzZSAweDIyOiAvLyBcIlxuXHQgICAgY2FzZSAweDI3OiAvLyAnXG5cdCAgICBjYXNlIDB4MzA6IC8vIDBcblx0ICAgICAgcmV0dXJuIGNoYXJcblxuXHQgICAgY2FzZSAweDVGOiAvLyBfXG5cdCAgICBjYXNlIDB4MjQ6IC8vICRcblx0ICAgICAgcmV0dXJuICdpZGVudCdcblxuXHQgICAgY2FzZSAweDIwOiAvLyBTcGFjZVxuXHQgICAgY2FzZSAweDA5OiAvLyBUYWJcblx0ICAgIGNhc2UgMHgwQTogLy8gTmV3bGluZVxuXHQgICAgY2FzZSAweDBEOiAvLyBSZXR1cm5cblx0ICAgIGNhc2UgMHhBMDogIC8vIE5vLWJyZWFrIHNwYWNlXG5cdCAgICBjYXNlIDB4RkVGRjogIC8vIEJ5dGUgT3JkZXIgTWFya1xuXHQgICAgY2FzZSAweDIwMjg6ICAvLyBMaW5lIFNlcGFyYXRvclxuXHQgICAgY2FzZSAweDIwMjk6ICAvLyBQYXJhZ3JhcGggU2VwYXJhdG9yXG5cdCAgICAgIHJldHVybiAnd3MnXG5cdCAgfVxuXG5cdCAgLy8gYS16LCBBLVpcblx0ICBpZiAoKDB4NjEgPD0gY29kZSAmJiBjb2RlIDw9IDB4N0EpIHx8XG5cdCAgICAgICgweDQxIDw9IGNvZGUgJiYgY29kZSA8PSAweDVBKSkge1xuXHQgICAgcmV0dXJuICdpZGVudCdcblx0ICB9XG5cblx0ICAvLyAxLTlcblx0ICBpZiAoMHgzMSA8PSBjb2RlICYmIGNvZGUgPD0gMHgzOSkge1xuXHQgICAgcmV0dXJuICdudW1iZXInXG5cdCAgfVxuXG5cdCAgcmV0dXJuICdlbHNlJ1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGEgc3RyaW5nIHBhdGggaW50byBhbiBhcnJheSBvZiBzZWdtZW50c1xuXHQgKiBUb2RvIGltcGxlbWVudCBjYWNoZVxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuXHQgKiBAcmV0dXJuIHtBcnJheXx1bmRlZmluZWR9XG5cdCAqL1xuXG5cdGZ1bmN0aW9uIHBhcnNlUGF0aCAocGF0aCkge1xuXHQgIHZhciBrZXlzID0gW11cblx0ICB2YXIgaW5kZXggPSAtMVxuXHQgIHZhciBtb2RlID0gJ2JlZm9yZVBhdGgnXG5cdCAgdmFyIGMsIG5ld0NoYXIsIGtleSwgdHlwZSwgdHJhbnNpdGlvbiwgYWN0aW9uLCB0eXBlTWFwXG5cblx0ICB2YXIgYWN0aW9ucyA9IHtcblx0ICAgIHB1c2g6IGZ1bmN0aW9uKCkge1xuXHQgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpIHtcblx0ICAgICAgICByZXR1cm5cblx0ICAgICAgfVxuXHQgICAgICBrZXlzLnB1c2goa2V5KVxuXHQgICAgICBrZXkgPSB1bmRlZmluZWRcblx0ICAgIH0sXG5cdCAgICBhcHBlbmQ6IGZ1bmN0aW9uKCkge1xuXHQgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpIHtcblx0ICAgICAgICBrZXkgPSBuZXdDaGFyXG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAga2V5ICs9IG5ld0NoYXJcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblxuXHQgIGZ1bmN0aW9uIG1heWJlVW5lc2NhcGVRdW90ZSAoKSB7XG5cdCAgICB2YXIgbmV4dENoYXIgPSBwYXRoW2luZGV4ICsgMV1cblx0ICAgIGlmICgobW9kZSA9PT0gJ2luU2luZ2xlUXVvdGUnICYmIG5leHRDaGFyID09PSBcIidcIikgfHxcblx0ICAgICAgICAobW9kZSA9PT0gJ2luRG91YmxlUXVvdGUnICYmIG5leHRDaGFyID09PSAnXCInKSkge1xuXHQgICAgICBpbmRleCsrXG5cdCAgICAgIG5ld0NoYXIgPSBuZXh0Q2hhclxuXHQgICAgICBhY3Rpb25zLmFwcGVuZCgpXG5cdCAgICAgIHJldHVybiB0cnVlXG5cdCAgICB9XG5cdCAgfVxuXG5cdCAgd2hpbGUgKG1vZGUpIHtcblx0ICAgIGluZGV4Kytcblx0ICAgIGMgPSBwYXRoW2luZGV4XVxuXG5cdCAgICBpZiAoYyA9PT0gJ1xcXFwnICYmIG1heWJlVW5lc2NhcGVRdW90ZSgpKSB7XG5cdCAgICAgIGNvbnRpbnVlXG5cdCAgICB9XG5cblx0ICAgIHR5cGUgPSBnZXRQYXRoQ2hhclR5cGUoYylcblx0ICAgIHR5cGVNYXAgPSBwYXRoU3RhdGVNYWNoaW5lW21vZGVdXG5cdCAgICB0cmFuc2l0aW9uID0gdHlwZU1hcFt0eXBlXSB8fCB0eXBlTWFwWydlbHNlJ10gfHwgJ2Vycm9yJ1xuXG5cdCAgICBpZiAodHJhbnNpdGlvbiA9PT0gJ2Vycm9yJykge1xuXHQgICAgICByZXR1cm4gLy8gcGFyc2UgZXJyb3Jcblx0ICAgIH1cblxuXHQgICAgbW9kZSA9IHRyYW5zaXRpb25bMF1cblx0ICAgIGFjdGlvbiA9IGFjdGlvbnNbdHJhbnNpdGlvblsxXV0gfHwgbm9vcFxuXHQgICAgbmV3Q2hhciA9IHRyYW5zaXRpb25bMl0gPT09IHVuZGVmaW5lZFxuXHQgICAgICA/IGNcblx0ICAgICAgOiB0cmFuc2l0aW9uWzJdXG5cdCAgICBhY3Rpb24oKVxuXG5cdCAgICBpZiAobW9kZSA9PT0gJ2FmdGVyUGF0aCcpIHtcblx0ICAgICAgcmV0dXJuIGtleXNcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogRm9ybWF0IGEgYWNjZXNzb3Igc2VnbWVudCBiYXNlZCBvbiBpdHMgdHlwZS5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleVxuXHQgKiBAcmV0dXJuIHtCb29sZWFufVxuXHQgKi9cblxuXHRmdW5jdGlvbiBmb3JtYXRBY2Nlc3NvcihrZXkpIHtcblx0ICBpZiAoaWRlbnRSRS50ZXN0KGtleSkpIHsgLy8gaWRlbnRpZmllclxuXHQgICAgcmV0dXJuICcuJyArIGtleVxuXHQgIH0gZWxzZSBpZiAoK2tleSA9PT0ga2V5ID4+PiAwKSB7IC8vIGJyYWNrZXQgaW5kZXhcblx0ICAgIHJldHVybiAnWycgKyBrZXkgKyAnXSc7XG5cdCAgfSBlbHNlIHsgLy8gYnJhY2tldCBzdHJpbmdcblx0ICAgIHJldHVybiAnW1wiJyArIGtleS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykgKyAnXCJdJztcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ29tcGlsZXMgYSBnZXR0ZXIgZnVuY3Rpb24gd2l0aCBhIGZpeGVkIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcblx0ICogQHJldHVybiB7RnVuY3Rpb259XG5cdCAqL1xuXG5cdGV4cG9ydHMuY29tcGlsZUdldHRlciA9IGZ1bmN0aW9uIChwYXRoKSB7XG5cdCAgdmFyIGJvZHkgPVxuXHQgICAgJ3RyeXtyZXR1cm4gbycgK1xuXHQgICAgcGF0aC5tYXAoZm9ybWF0QWNjZXNzb3IpLmpvaW4oJycpICtcblx0ICAgICd9Y2F0Y2goZSl7fTsnXG5cdCAgcmV0dXJuIG5ldyBGdW5jdGlvbignbycsIGJvZHkpXG5cdH1cblxuXHQvKipcblx0ICogRXh0ZXJuYWwgcGFyc2UgdGhhdCBjaGVjayBmb3IgYSBjYWNoZSBoaXQgZmlyc3Rcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcblx0ICogQHJldHVybiB7QXJyYXl8dW5kZWZpbmVkfVxuXHQgKi9cblxuXHRleHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKHBhdGgpIHtcblx0ICB2YXIgaGl0ID0gcGF0aENhY2hlLmdldChwYXRoKVxuXHQgIGlmICghaGl0KSB7XG5cdCAgICBoaXQgPSBwYXJzZVBhdGgocGF0aClcblx0ICAgIGlmIChoaXQpIHtcblx0ICAgICAgaGl0LmdldCA9IGV4cG9ydHMuY29tcGlsZUdldHRlcihoaXQpXG5cdCAgICAgIHBhdGhDYWNoZS5wdXQocGF0aCwgaGl0KVxuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gaGl0XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGZyb20gYW4gb2JqZWN0IGZyb20gYSBwYXRoIHN0cmluZ1xuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gb2JqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG5cdCAqL1xuXG5cdGV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCkge1xuXHQgIHBhdGggPSBleHBvcnRzLnBhcnNlKHBhdGgpXG5cdCAgaWYgKHBhdGgpIHtcblx0ICAgIHJldHVybiBwYXRoLmdldChvYmopXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldCBvbiBhbiBvYmplY3QgZnJvbSBhIHBhdGhcblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IG9ialxuXHQgKiBAcGFyYW0ge1N0cmluZyB8IEFycmF5fSBwYXRoXG5cdCAqIEBwYXJhbSB7Kn0gdmFsXG5cdCAqL1xuXG5cdGV4cG9ydHMuc2V0ID0gZnVuY3Rpb24gKG9iaiwgcGF0aCwgdmFsKSB7XG5cdCAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuXHQgICAgcGF0aCA9IGV4cG9ydHMucGFyc2UocGF0aClcblx0ICB9XG5cdCAgaWYgKCFwYXRoIHx8ICFfLmlzT2JqZWN0KG9iaikpIHtcblx0ICAgIHJldHVybiBmYWxzZVxuXHQgIH1cblx0ICB2YXIgbGFzdCwga2V5XG5cdCAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPCBsOyBpKyspIHtcblx0ICAgIGxhc3QgPSBvYmpcblx0ICAgIGtleSA9IHBhdGhbaV1cblx0ICAgIG9iaiA9IG9ialtrZXldXG5cdCAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkge1xuXHQgICAgICBvYmogPSB7fVxuXHQgICAgICBsYXN0LiRhZGQoa2V5LCBvYmopXG5cdCAgICB9XG5cdCAgfVxuXHQgIGtleSA9IHBhdGhbaV1cblx0ICBpZiAoa2V5IGluIG9iaikge1xuXHQgICAgb2JqW2tleV0gPSB2YWxcblx0ICB9IGVsc2Uge1xuXHQgICAgb2JqLiRhZGQoa2V5LCB2YWwpXG5cdCAgfVxuXHQgIHJldHVybiB0cnVlXG5cdH1cblxuLyoqKi8gfSxcbi8qIDQyICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgQ2FjaGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUyKVxuXHR2YXIgY29uZmlnID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMClcblx0dmFyIGRpclBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNDMpXG5cdHZhciByZWdleEVzY2FwZVJFID0gL1stLiorP14ke30oKXxbXFxdXFwvXFxcXF0vZ1xuXHR2YXIgY2FjaGUsIHRhZ1JFLCBodG1sUkUsIGZpcnN0Q2hhciwgbGFzdENoYXJcblxuXHQvKipcblx0ICogRXNjYXBlIGEgc3RyaW5nIHNvIGl0IGNhbiBiZSB1c2VkIGluIGEgUmVnRXhwXG5cdCAqIGNvbnN0cnVjdG9yLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGVzY2FwZVJlZ2V4IChzdHIpIHtcblx0ICByZXR1cm4gc3RyLnJlcGxhY2UocmVnZXhFc2NhcGVSRSwgJ1xcXFwkJicpXG5cdH1cblxuXHQvKipcblx0ICogQ29tcGlsZSB0aGUgaW50ZXJwb2xhdGlvbiB0YWcgcmVnZXguXG5cdCAqXG5cdCAqIEByZXR1cm4ge1JlZ0V4cH1cblx0ICovXG5cblx0ZnVuY3Rpb24gY29tcGlsZVJlZ2V4ICgpIHtcblx0ICBjb25maWcuX2RlbGltaXRlcnNDaGFuZ2VkID0gZmFsc2Vcblx0ICB2YXIgb3BlbiA9IGNvbmZpZy5kZWxpbWl0ZXJzWzBdXG5cdCAgdmFyIGNsb3NlID0gY29uZmlnLmRlbGltaXRlcnNbMV1cblx0ICBmaXJzdENoYXIgPSBvcGVuLmNoYXJBdCgwKVxuXHQgIGxhc3RDaGFyID0gY2xvc2UuY2hhckF0KGNsb3NlLmxlbmd0aCAtIDEpXG5cdCAgdmFyIGZpcnN0Q2hhclJFID0gZXNjYXBlUmVnZXgoZmlyc3RDaGFyKVxuXHQgIHZhciBsYXN0Q2hhclJFID0gZXNjYXBlUmVnZXgobGFzdENoYXIpXG5cdCAgdmFyIG9wZW5SRSA9IGVzY2FwZVJlZ2V4KG9wZW4pXG5cdCAgdmFyIGNsb3NlUkUgPSBlc2NhcGVSZWdleChjbG9zZSlcblx0ICB0YWdSRSA9IG5ldyBSZWdFeHAoXG5cdCAgICBmaXJzdENoYXJSRSArICc/JyArIG9wZW5SRSArXG5cdCAgICAnKC4rPyknICtcblx0ICAgIGNsb3NlUkUgKyBsYXN0Q2hhclJFICsgJz8nLFxuXHQgICAgJ2cnXG5cdCAgKVxuXHQgIGh0bWxSRSA9IG5ldyBSZWdFeHAoXG5cdCAgICAnXicgKyBmaXJzdENoYXJSRSArIG9wZW5SRSArXG5cdCAgICAnLionICtcblx0ICAgIGNsb3NlUkUgKyBsYXN0Q2hhclJFICsgJyQnXG5cdCAgKVxuXHQgIC8vIHJlc2V0IGNhY2hlXG5cdCAgY2FjaGUgPSBuZXcgQ2FjaGUoMTAwMClcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBhIHRlbXBsYXRlIHRleHQgc3RyaW5nIGludG8gYW4gYXJyYXkgb2YgdG9rZW5zLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdGV4dFxuXHQgKiBAcmV0dXJuIHtBcnJheTxPYmplY3Q+IHwgbnVsbH1cblx0ICogICAgICAgICAgICAgICAtIHtTdHJpbmd9IHR5cGVcblx0ICogICAgICAgICAgICAgICAtIHtTdHJpbmd9IHZhbHVlXG5cdCAqICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gW2h0bWxdXG5cdCAqICAgICAgICAgICAgICAgLSB7Qm9vbGVhbn0gW29uZVRpbWVdXG5cdCAqL1xuXG5cdGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAodGV4dCkge1xuXHQgIGlmIChjb25maWcuX2RlbGltaXRlcnNDaGFuZ2VkKSB7XG5cdCAgICBjb21waWxlUmVnZXgoKVxuXHQgIH1cblx0ICB2YXIgaGl0ID0gY2FjaGUuZ2V0KHRleHQpXG5cdCAgaWYgKGhpdCkge1xuXHQgICAgcmV0dXJuIGhpdFxuXHQgIH1cblx0ICBpZiAoIXRhZ1JFLnRlc3QodGV4dCkpIHtcblx0ICAgIHJldHVybiBudWxsXG5cdCAgfVxuXHQgIHZhciB0b2tlbnMgPSBbXVxuXHQgIHZhciBsYXN0SW5kZXggPSB0YWdSRS5sYXN0SW5kZXggPSAwXG5cdCAgdmFyIG1hdGNoLCBpbmRleCwgdmFsdWUsIGZpcnN0LCBvbmVUaW1lLCBwYXJ0aWFsXG5cdCAgLyoganNoaW50IGJvc3M6dHJ1ZSAqL1xuXHQgIHdoaWxlIChtYXRjaCA9IHRhZ1JFLmV4ZWModGV4dCkpIHtcblx0ICAgIGluZGV4ID0gbWF0Y2guaW5kZXhcblx0ICAgIC8vIHB1c2ggdGV4dCB0b2tlblxuXHQgICAgaWYgKGluZGV4ID4gbGFzdEluZGV4KSB7XG5cdCAgICAgIHRva2Vucy5wdXNoKHtcblx0ICAgICAgICB2YWx1ZTogdGV4dC5zbGljZShsYXN0SW5kZXgsIGluZGV4KVxuXHQgICAgICB9KVxuXHQgICAgfVxuXHQgICAgLy8gdGFnIHRva2VuXG5cdCAgICBmaXJzdCA9IG1hdGNoWzFdLmNoYXJDb2RlQXQoMClcblx0ICAgIG9uZVRpbWUgPSBmaXJzdCA9PT0gMHgyQSAvLyAqXG5cdCAgICBwYXJ0aWFsID0gZmlyc3QgPT09IDB4M0UgLy8gPlxuXHQgICAgdmFsdWUgPSAob25lVGltZSB8fCBwYXJ0aWFsKVxuXHQgICAgICA/IG1hdGNoWzFdLnNsaWNlKDEpXG5cdCAgICAgIDogbWF0Y2hbMV1cblx0ICAgIHRva2Vucy5wdXNoKHtcblx0ICAgICAgdGFnOiB0cnVlLFxuXHQgICAgICB2YWx1ZTogdmFsdWUudHJpbSgpLFxuXHQgICAgICBodG1sOiBodG1sUkUudGVzdChtYXRjaFswXSksXG5cdCAgICAgIG9uZVRpbWU6IG9uZVRpbWUsXG5cdCAgICAgIHBhcnRpYWw6IHBhcnRpYWxcblx0ICAgIH0pXG5cdCAgICBsYXN0SW5kZXggPSBpbmRleCArIG1hdGNoWzBdLmxlbmd0aFxuXHQgIH1cblx0ICBpZiAobGFzdEluZGV4IDwgdGV4dC5sZW5ndGgpIHtcblx0ICAgIHRva2Vucy5wdXNoKHtcblx0ICAgICAgdmFsdWU6IHRleHQuc2xpY2UobGFzdEluZGV4KVxuXHQgICAgfSlcblx0ICB9XG5cdCAgY2FjaGUucHV0KHRleHQsIHRva2Vucylcblx0ICByZXR1cm4gdG9rZW5zXG5cdH1cblxuXHQvKipcblx0ICogRm9ybWF0IGEgbGlzdCBvZiB0b2tlbnMgaW50byBhbiBleHByZXNzaW9uLlxuXHQgKiBlLmcuIHRva2VucyBwYXJzZWQgZnJvbSAnYSB7e2J9fSBjJyBjYW4gYmUgc2VyaWFsaXplZFxuXHQgKiBpbnRvIG9uZSBzaW5nbGUgZXhwcmVzc2lvbiBhcyAnXCJhIFwiICsgYiArIFwiIGNcIicuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHRva2Vuc1xuXHQgKiBAcGFyYW0ge1Z1ZX0gW3ZtXVxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XG5cdCAqL1xuXG5cdGV4cG9ydHMudG9rZW5zVG9FeHAgPSBmdW5jdGlvbiAodG9rZW5zLCB2bSkge1xuXHQgIHJldHVybiB0b2tlbnMubGVuZ3RoID4gMVxuXHQgICAgPyB0b2tlbnMubWFwKGZ1bmN0aW9uICh0b2tlbikge1xuXHQgICAgICAgIHJldHVybiBmb3JtYXRUb2tlbih0b2tlbiwgdm0pXG5cdCAgICAgIH0pLmpvaW4oJysnKVxuXHQgICAgOiBmb3JtYXRUb2tlbih0b2tlbnNbMF0sIHZtLCB0cnVlKVxuXHR9XG5cblx0LyoqXG5cdCAqIEZvcm1hdCBhIHNpbmdsZSB0b2tlbi5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IHRva2VuXG5cdCAqIEBwYXJhbSB7VnVlfSBbdm1dXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gc2luZ2xlXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cblx0ICovXG5cblx0ZnVuY3Rpb24gZm9ybWF0VG9rZW4gKHRva2VuLCB2bSwgc2luZ2xlKSB7XG5cdCAgcmV0dXJuIHRva2VuLnRhZ1xuXHQgICAgPyB2bSAmJiB0b2tlbi5vbmVUaW1lXG5cdCAgICAgID8gJ1wiJyArIHZtLiRldmFsKHRva2VuLnZhbHVlKSArICdcIidcblx0ICAgICAgOiBzaW5nbGVcblx0ICAgICAgICA/IHRva2VuLnZhbHVlXG5cdCAgICAgICAgOiBpbmxpbmVGaWx0ZXJzKHRva2VuLnZhbHVlKVxuXHQgICAgOiAnXCInICsgdG9rZW4udmFsdWUgKyAnXCInXG5cdH1cblxuXHQvKipcblx0ICogRm9yIGFuIGF0dHJpYnV0ZSB3aXRoIG11bHRpcGxlIGludGVycG9sYXRpb24gdGFncyxcblx0ICogZS5nLiBhdHRyPVwic29tZS17e3RoaW5nIHwgZmlsdGVyfX1cIiwgaW4gb3JkZXIgdG8gY29tYmluZVxuXHQgKiB0aGUgd2hvbGUgdGhpbmcgaW50byBhIHNpbmdsZSB3YXRjaGFibGUgZXhwcmVzc2lvbiwgd2Vcblx0ICogaGF2ZSB0byBpbmxpbmUgdGhvc2UgZmlsdGVycy4gVGhpcyBmdW5jdGlvbiBkb2VzIGV4YWN0bHlcblx0ICogdGhhdC4gVGhpcyBpcyBhIGJpdCBoYWNreSBidXQgaXQgYXZvaWRzIGhlYXZ5IGNoYW5nZXNcblx0ICogdG8gZGlyZWN0aXZlIHBhcnNlciBhbmQgd2F0Y2hlciBtZWNoYW5pc20uXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBleHBcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblxuXHR2YXIgZmlsdGVyUkUgPSAvW158XVxcfFtefF0vXG5cdGZ1bmN0aW9uIGlubGluZUZpbHRlcnMgKGV4cCkge1xuXHQgIGlmICghZmlsdGVyUkUudGVzdChleHApKSB7XG5cdCAgICByZXR1cm4gJygnICsgZXhwICsgJyknXG5cdCAgfSBlbHNlIHtcblx0ICAgIHZhciBkaXIgPSBkaXJQYXJzZXIucGFyc2UoZXhwKVswXVxuXHQgICAgaWYgKCFkaXIuZmlsdGVycykge1xuXHQgICAgICByZXR1cm4gJygnICsgZXhwICsgJyknXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBleHAgPSBkaXIuZXhwcmVzc2lvblxuXHQgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRpci5maWx0ZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHQgICAgICAgIHZhciBmaWx0ZXIgPSBkaXIuZmlsdGVyc1tpXVxuXHQgICAgICAgIHZhciBhcmdzID0gZmlsdGVyLmFyZ3Ncblx0ICAgICAgICAgID8gJyxcIicgKyBmaWx0ZXIuYXJncy5qb2luKCdcIixcIicpICsgJ1wiJ1xuXHQgICAgICAgICAgOiAnJ1xuXHQgICAgICAgIGV4cCA9ICd0aGlzLiRvcHRpb25zLmZpbHRlcnNbXCInICsgZmlsdGVyLm5hbWUgKyAnXCJdJyArXG5cdCAgICAgICAgICAnLmFwcGx5KHRoaXMsWycgKyBleHAgKyBhcmdzICsgJ10pJ1xuXHQgICAgICB9XG5cdCAgICAgIHJldHVybiBleHBcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuLyoqKi8gfSxcbi8qIDQzICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblx0dmFyIENhY2hlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1Milcblx0dmFyIGNhY2hlID0gbmV3IENhY2hlKDEwMDApXG5cdHZhciBhcmdSRSA9IC9eW15cXHtcXD9dKyR8XidbXiddKickfF5cIlteXCJdKlwiJC9cblx0dmFyIGZpbHRlclRva2VuUkUgPSAvW15cXHMnXCJdK3wnW14nXSsnfFwiW15cIl0rXCIvZ1xuXG5cdC8qKlxuXHQgKiBQYXJzZXIgc3RhdGVcblx0ICovXG5cblx0dmFyIHN0clxuXHR2YXIgYywgaSwgbFxuXHR2YXIgaW5TaW5nbGVcblx0dmFyIGluRG91YmxlXG5cdHZhciBjdXJseVxuXHR2YXIgc3F1YXJlXG5cdHZhciBwYXJlblxuXHR2YXIgYmVnaW5cblx0dmFyIGFyZ0luZGV4XG5cdHZhciBkaXJzXG5cdHZhciBkaXJcblx0dmFyIGxhc3RGaWx0ZXJJbmRleFxuXHR2YXIgYXJnXG5cblx0LyoqXG5cdCAqIFB1c2ggYSBkaXJlY3RpdmUgb2JqZWN0IGludG8gdGhlIHJlc3VsdCBBcnJheVxuXHQgKi9cblxuXHRmdW5jdGlvbiBwdXNoRGlyICgpIHtcblx0ICBkaXIucmF3ID0gc3RyLnNsaWNlKGJlZ2luLCBpKS50cmltKClcblx0ICBpZiAoZGlyLmV4cHJlc3Npb24gPT09IHVuZGVmaW5lZCkge1xuXHQgICAgZGlyLmV4cHJlc3Npb24gPSBzdHIuc2xpY2UoYXJnSW5kZXgsIGkpLnRyaW0oKVxuXHQgIH0gZWxzZSBpZiAobGFzdEZpbHRlckluZGV4ICE9PSBiZWdpbikge1xuXHQgICAgcHVzaEZpbHRlcigpXG5cdCAgfVxuXHQgIGlmIChpID09PSAwIHx8IGRpci5leHByZXNzaW9uKSB7XG5cdCAgICBkaXJzLnB1c2goZGlyKVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQdXNoIGEgZmlsdGVyIHRvIHRoZSBjdXJyZW50IGRpcmVjdGl2ZSBvYmplY3Rcblx0ICovXG5cblx0ZnVuY3Rpb24gcHVzaEZpbHRlciAoKSB7XG5cdCAgdmFyIGV4cCA9IHN0ci5zbGljZShsYXN0RmlsdGVySW5kZXgsIGkpLnRyaW0oKVxuXHQgIHZhciBmaWx0ZXJcblx0ICBpZiAoZXhwKSB7XG5cdCAgICBmaWx0ZXIgPSB7fVxuXHQgICAgdmFyIHRva2VucyA9IGV4cC5tYXRjaChmaWx0ZXJUb2tlblJFKVxuXHQgICAgZmlsdGVyLm5hbWUgPSB0b2tlbnNbMF1cblx0ICAgIGZpbHRlci5hcmdzID0gdG9rZW5zLmxlbmd0aCA+IDEgPyB0b2tlbnMuc2xpY2UoMSkgOiBudWxsXG5cdCAgfVxuXHQgIGlmIChmaWx0ZXIpIHtcblx0ICAgIChkaXIuZmlsdGVycyA9IGRpci5maWx0ZXJzIHx8IFtdKS5wdXNoKGZpbHRlcilcblx0ICB9XG5cdCAgbGFzdEZpbHRlckluZGV4ID0gaSArIDFcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBhIGRpcmVjdGl2ZSBzdHJpbmcgaW50byBhbiBBcnJheSBvZiBBU1QtbGlrZVxuXHQgKiBvYmplY3RzIHJlcHJlc2VudGluZyBkaXJlY3RpdmVzLlxuXHQgKlxuXHQgKiBFeGFtcGxlOlxuXHQgKlxuXHQgKiBcImNsaWNrOiBhID0gYSArIDEgfCB1cHBlcmNhc2VcIiB3aWxsIHlpZWxkOlxuXHQgKiB7XG5cdCAqICAgYXJnOiAnY2xpY2snLFxuXHQgKiAgIGV4cHJlc3Npb246ICdhID0gYSArIDEnLFxuXHQgKiAgIGZpbHRlcnM6IFtcblx0ICogICAgIHsgbmFtZTogJ3VwcGVyY2FzZScsIGFyZ3M6IG51bGwgfVxuXHQgKiAgIF1cblx0ICogfVxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG5cdCAqIEByZXR1cm4ge0FycmF5PE9iamVjdD59XG5cdCAqL1xuXG5cdGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAocykge1xuXG5cdCAgdmFyIGhpdCA9IGNhY2hlLmdldChzKVxuXHQgIGlmIChoaXQpIHtcblx0ICAgIHJldHVybiBoaXRcblx0ICB9XG5cblx0ICAvLyByZXNldCBwYXJzZXIgc3RhdGVcblx0ICBzdHIgPSBzXG5cdCAgaW5TaW5nbGUgPSBpbkRvdWJsZSA9IGZhbHNlXG5cdCAgY3VybHkgPSBzcXVhcmUgPSBwYXJlbiA9IGJlZ2luID0gYXJnSW5kZXggPSAwXG5cdCAgbGFzdEZpbHRlckluZGV4ID0gMFxuXHQgIGRpcnMgPSBbXVxuXHQgIGRpciA9IHt9XG5cdCAgYXJnID0gbnVsbFxuXG5cdCAgZm9yIChpID0gMCwgbCA9IHN0ci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0ICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuXHQgICAgaWYgKGluU2luZ2xlKSB7XG5cdCAgICAgIC8vIGNoZWNrIHNpbmdsZSBxdW90ZVxuXHQgICAgICBpZiAoYyA9PT0gMHgyNykgaW5TaW5nbGUgPSAhaW5TaW5nbGVcblx0ICAgIH0gZWxzZSBpZiAoaW5Eb3VibGUpIHtcblx0ICAgICAgLy8gY2hlY2sgZG91YmxlIHF1b3RlXG5cdCAgICAgIGlmIChjID09PSAweDIyKSBpbkRvdWJsZSA9ICFpbkRvdWJsZVxuXHQgICAgfSBlbHNlIGlmIChcblx0ICAgICAgYyA9PT0gMHgyQyAmJiAvLyBjb21tYVxuXHQgICAgICAhcGFyZW4gJiYgIWN1cmx5ICYmICFzcXVhcmVcblx0ICAgICkge1xuXHQgICAgICAvLyByZWFjaGVkIHRoZSBlbmQgb2YgYSBkaXJlY3RpdmVcblx0ICAgICAgcHVzaERpcigpXG5cdCAgICAgIC8vIHJlc2V0ICYgc2tpcCB0aGUgY29tbWFcblx0ICAgICAgZGlyID0ge31cblx0ICAgICAgYmVnaW4gPSBhcmdJbmRleCA9IGxhc3RGaWx0ZXJJbmRleCA9IGkgKyAxXG5cdCAgICB9IGVsc2UgaWYgKFxuXHQgICAgICBjID09PSAweDNBICYmIC8vIGNvbG9uXG5cdCAgICAgICFkaXIuZXhwcmVzc2lvbiAmJlxuXHQgICAgICAhZGlyLmFyZ1xuXHQgICAgKSB7XG5cdCAgICAgIC8vIGFyZ3VtZW50XG5cdCAgICAgIGFyZyA9IHN0ci5zbGljZShiZWdpbiwgaSkudHJpbSgpXG5cdCAgICAgIC8vIHRlc3QgZm9yIHZhbGlkIGFyZ3VtZW50IGhlcmVcblx0ICAgICAgLy8gc2luY2Ugd2UgbWF5IGhhdmUgY2F1Z2h0IHN0dWZmIGxpa2UgZmlyc3QgaGFsZiBvZlxuXHQgICAgICAvLyBhbiBvYmplY3QgbGl0ZXJhbCBvciBhIHRlcm5hcnkgZXhwcmVzc2lvbi5cblx0ICAgICAgaWYgKGFyZ1JFLnRlc3QoYXJnKSkge1xuXHQgICAgICAgIGFyZ0luZGV4ID0gaSArIDFcblx0ICAgICAgICBkaXIuYXJnID0gXy5zdHJpcFF1b3RlcyhhcmcpIHx8IGFyZ1xuXHQgICAgICB9XG5cdCAgICB9IGVsc2UgaWYgKFxuXHQgICAgICBjID09PSAweDdDICYmIC8vIHBpcGVcblx0ICAgICAgc3RyLmNoYXJDb2RlQXQoaSArIDEpICE9PSAweDdDICYmXG5cdCAgICAgIHN0ci5jaGFyQ29kZUF0KGkgLSAxKSAhPT0gMHg3Q1xuXHQgICAgKSB7XG5cdCAgICAgIGlmIChkaXIuZXhwcmVzc2lvbiA9PT0gdW5kZWZpbmVkKSB7XG5cdCAgICAgICAgLy8gZmlyc3QgZmlsdGVyLCBlbmQgb2YgZXhwcmVzc2lvblxuXHQgICAgICAgIGxhc3RGaWx0ZXJJbmRleCA9IGkgKyAxXG5cdCAgICAgICAgZGlyLmV4cHJlc3Npb24gPSBzdHIuc2xpY2UoYXJnSW5kZXgsIGkpLnRyaW0oKVxuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICAgIC8vIGFscmVhZHkgaGFzIGZpbHRlclxuXHQgICAgICAgIHB1c2hGaWx0ZXIoKVxuXHQgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBzd2l0Y2ggKGMpIHtcblx0ICAgICAgICBjYXNlIDB4MjI6IGluRG91YmxlID0gdHJ1ZTsgYnJlYWsgLy8gXCJcblx0ICAgICAgICBjYXNlIDB4Mjc6IGluU2luZ2xlID0gdHJ1ZTsgYnJlYWsgLy8gJ1xuXHQgICAgICAgIGNhc2UgMHgyODogcGFyZW4rKzsgYnJlYWsgICAgICAgICAvLyAoXG5cdCAgICAgICAgY2FzZSAweDI5OiBwYXJlbi0tOyBicmVhayAgICAgICAgIC8vIClcblx0ICAgICAgICBjYXNlIDB4NUI6IHNxdWFyZSsrOyBicmVhayAgICAgICAgLy8gW1xuXHQgICAgICAgIGNhc2UgMHg1RDogc3F1YXJlLS07IGJyZWFrICAgICAgICAvLyBdXG5cdCAgICAgICAgY2FzZSAweDdCOiBjdXJseSsrOyBicmVhayAgICAgICAgIC8vIHtcblx0ICAgICAgICBjYXNlIDB4N0Q6IGN1cmx5LS07IGJyZWFrICAgICAgICAgLy8gfVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfVxuXG5cdCAgaWYgKGkgPT09IDAgfHwgYmVnaW4gIT09IGkpIHtcblx0ICAgIHB1c2hEaXIoKVxuXHQgIH1cblxuXHQgIGNhY2hlLnB1dChzLCBkaXJzKVxuXHQgIHJldHVybiBkaXJzXG5cdH1cblxuLyoqKi8gfSxcbi8qIDQ0ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblx0dmFyIFBhdGggPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQxKVxuXHR2YXIgQ2FjaGUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUyKVxuXHR2YXIgZXhwcmVzc2lvbkNhY2hlID0gbmV3IENhY2hlKDEwMDApXG5cblx0dmFyIGtleXdvcmRzID1cblx0ICAnTWF0aCxicmVhayxjYXNlLGNhdGNoLGNvbnRpbnVlLGRlYnVnZ2VyLGRlZmF1bHQsJyArXG5cdCAgJ2RlbGV0ZSxkbyxlbHNlLGZhbHNlLGZpbmFsbHksZm9yLGZ1bmN0aW9uLGlmLGluLCcgK1xuXHQgICdpbnN0YW5jZW9mLG5ldyxudWxsLHJldHVybixzd2l0Y2gsdGhpcyx0aHJvdyx0cnVlLHRyeSwnICtcblx0ICAndHlwZW9mLHZhcix2b2lkLHdoaWxlLHdpdGgsdW5kZWZpbmVkLGFic3RyYWN0LGJvb2xlYW4sJyArXG5cdCAgJ2J5dGUsY2hhcixjbGFzcyxjb25zdCxkb3VibGUsZW51bSxleHBvcnQsZXh0ZW5kcywnICtcblx0ICAnZmluYWwsZmxvYXQsZ290byxpbXBsZW1lbnRzLGltcG9ydCxpbnQsaW50ZXJmYWNlLGxvbmcsJyArXG5cdCAgJ25hdGl2ZSxwYWNrYWdlLHByaXZhdGUscHJvdGVjdGVkLHB1YmxpYyxzaG9ydCxzdGF0aWMsJyArXG5cdCAgJ3N1cGVyLHN5bmNocm9uaXplZCx0aHJvd3MsdHJhbnNpZW50LHZvbGF0aWxlLCcgK1xuXHQgICdhcmd1bWVudHMsbGV0LHlpZWxkJ1xuXG5cdHZhciB3c1JFID0gL1xccy9nXG5cdHZhciBuZXdsaW5lUkUgPSAvXFxuL2dcblx0dmFyIHNhdmVSRSA9IC9bXFx7LF1cXHMqW1xcd1xcJF9dK1xccyo6fCdbXiddKid8XCJbXlwiXSpcIi9nXG5cdHZhciByZXN0b3JlUkUgPSAvXCIoXFxkKylcIi9nXG5cdHZhciBwYXRoVGVzdFJFID0gL15bQS1aYS16XyRdW1xcdyRdKihcXC5bQS1aYS16XyRdW1xcdyRdKnxcXFsnLio/J1xcXXxcXFtcIi4qP1wiXFxdKSokL1xuXHR2YXIgcGF0aFJlcGxhY2VSRSA9IC9bXlxcdyRcXC5dKFtBLVphLXpfJF1bXFx3JF0qKFxcLltBLVphLXpfJF1bXFx3JF0qfFxcWycuKj8nXFxdfFxcW1wiLio/XCJcXF0pKikvZ1xuXHR2YXIga2V5d29yZHNSRSA9IG5ldyBSZWdFeHAoJ14oJyArIGtleXdvcmRzLnJlcGxhY2UoLywvZywgJ1xcXFxifCcpICsgJ1xcXFxiKScpXG5cblx0LyoqXG5cdCAqIFNhdmUgLyBSZXdyaXRlIC8gUmVzdG9yZVxuXHQgKlxuXHQgKiBXaGVuIHJld3JpdGluZyBwYXRocyBmb3VuZCBpbiBhbiBleHByZXNzaW9uLCBpdCBpc1xuXHQgKiBwb3NzaWJsZSBmb3IgdGhlIHNhbWUgbGV0dGVyIHNlcXVlbmNlcyB0byBiZSBmb3VuZCBpblxuXHQgKiBzdHJpbmdzIGFuZCBPYmplY3QgbGl0ZXJhbCBwcm9wZXJ0eSBrZXlzLiBUaGVyZWZvcmUgd2Vcblx0ICogcmVtb3ZlIGFuZCBzdG9yZSB0aGVzZSBwYXJ0cyBpbiBhIHRlbXBvcmFyeSBhcnJheSwgYW5kXG5cdCAqIHJlc3RvcmUgdGhlbSBhZnRlciB0aGUgcGF0aCByZXdyaXRlLlxuXHQgKi9cblxuXHR2YXIgc2F2ZWQgPSBbXVxuXG5cdC8qKlxuXHQgKiBTYXZlIHJlcGxhY2VyXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcblx0ICogQHJldHVybiB7U3RyaW5nfSAtIHBsYWNlaG9sZGVyIHdpdGggaW5kZXhcblx0ICovXG5cblx0ZnVuY3Rpb24gc2F2ZSAoc3RyKSB7XG5cdCAgdmFyIGkgPSBzYXZlZC5sZW5ndGhcblx0ICBzYXZlZFtpXSA9IHN0ci5yZXBsYWNlKG5ld2xpbmVSRSwgJ1xcXFxuJylcblx0ICByZXR1cm4gJ1wiJyArIGkgKyAnXCInXG5cdH1cblxuXHQvKipcblx0ICogUGF0aCByZXdyaXRlIHJlcGxhY2VyXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSByYXdcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblxuXHRmdW5jdGlvbiByZXdyaXRlIChyYXcpIHtcblx0ICB2YXIgYyA9IHJhdy5jaGFyQXQoMClcblx0ICB2YXIgcGF0aCA9IHJhdy5zbGljZSgxKVxuXHQgIGlmIChrZXl3b3Jkc1JFLnRlc3QocGF0aCkpIHtcblx0ICAgIHJldHVybiByYXdcblx0ICB9IGVsc2Uge1xuXHQgICAgcGF0aCA9IHBhdGguaW5kZXhPZignXCInKSA+IC0xXG5cdCAgICAgID8gcGF0aC5yZXBsYWNlKHJlc3RvcmVSRSwgcmVzdG9yZSlcblx0ICAgICAgOiBwYXRoXG5cdCAgICByZXR1cm4gYyArICdzY29wZS4nICsgcGF0aFxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXN0b3JlIHJlcGxhY2VyXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGkgLSBtYXRjaGVkIHNhdmUgaW5kZXhcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblxuXHRmdW5jdGlvbiByZXN0b3JlIChzdHIsIGkpIHtcblx0ICByZXR1cm4gc2F2ZWRbaV1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXdyaXRlIGFuIGV4cHJlc3Npb24sIHByZWZpeGluZyBhbGwgcGF0aCBhY2Nlc3NvcnMgd2l0aFxuXHQgKiBgc2NvcGUuYCBhbmQgZ2VuZXJhdGUgZ2V0dGVyL3NldHRlciBmdW5jdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBleHBcblx0ICogQHBhcmFtIHtCb29sZWFufSBuZWVkU2V0XG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuXHQgKi9cblxuXHRmdW5jdGlvbiBjb21waWxlRXhwRm5zIChleHAsIG5lZWRTZXQpIHtcblx0ICAvLyByZXNldCBzdGF0ZVxuXHQgIHNhdmVkLmxlbmd0aCA9IDBcblx0ICAvLyBzYXZlIHN0cmluZ3MgYW5kIG9iamVjdCBsaXRlcmFsIGtleXNcblx0ICB2YXIgYm9keSA9IGV4cFxuXHQgICAgLnJlcGxhY2Uoc2F2ZVJFLCBzYXZlKVxuXHQgICAgLnJlcGxhY2Uod3NSRSwgJycpXG5cdCAgLy8gcmV3cml0ZSBhbGwgcGF0aHNcblx0ICAvLyBwYWQgMSBzcGFjZSBoZXJlIGJlY2F1ZSB0aGUgcmVnZXggbWF0Y2hlcyAxIGV4dHJhIGNoYXJcblx0ICBib2R5ID0gKCcgJyArIGJvZHkpXG5cdCAgICAucmVwbGFjZShwYXRoUmVwbGFjZVJFLCByZXdyaXRlKVxuXHQgICAgLnJlcGxhY2UocmVzdG9yZVJFLCByZXN0b3JlKVxuXHQgIHZhciBnZXR0ZXIgPSBtYWtlR2V0dGVyKGJvZHkpXG5cdCAgaWYgKGdldHRlcikge1xuXHQgICAgcmV0dXJuIHtcblx0ICAgICAgZ2V0OiBnZXR0ZXIsXG5cdCAgICAgIGJvZHk6IGJvZHksXG5cdCAgICAgIHNldDogbmVlZFNldFxuXHQgICAgICAgID8gbWFrZVNldHRlcihib2R5KVxuXHQgICAgICAgIDogbnVsbFxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDb21waWxlIGdldHRlciBzZXR0ZXJzIGZvciBhIHNpbXBsZSBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZXhwXG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuXHQgKi9cblxuXHRmdW5jdGlvbiBjb21waWxlUGF0aEZucyAoZXhwKSB7XG5cdCAgdmFyIGdldHRlciwgcGF0aFxuXHQgIGlmIChleHAuaW5kZXhPZignWycpIDwgMCkge1xuXHQgICAgLy8gcmVhbGx5IHNpbXBsZSBwYXRoXG5cdCAgICBwYXRoID0gZXhwLnNwbGl0KCcuJylcblx0ICAgIGdldHRlciA9IFBhdGguY29tcGlsZUdldHRlcihwYXRoKVxuXHQgIH0gZWxzZSB7XG5cdCAgICAvLyBkbyB0aGUgcmVhbCBwYXJzaW5nXG5cdCAgICBwYXRoID0gUGF0aC5wYXJzZShleHApXG5cdCAgICBnZXR0ZXIgPSBwYXRoLmdldFxuXHQgIH1cblx0ICByZXR1cm4ge1xuXHQgICAgZ2V0OiBnZXR0ZXIsXG5cdCAgICAvLyBhbHdheXMgZ2VuZXJhdGUgc2V0dGVyIGZvciBzaW1wbGUgcGF0aHNcblx0ICAgIHNldDogZnVuY3Rpb24gKG9iaiwgdmFsKSB7XG5cdCAgICAgIFBhdGguc2V0KG9iaiwgcGF0aCwgdmFsKVxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCBhIGdldHRlciBmdW5jdGlvbi4gUmVxdWlyZXMgZXZhbC5cblx0ICpcblx0ICogV2UgaXNvbGF0ZSB0aGUgdHJ5L2NhdGNoIHNvIGl0IGRvZXNuJ3QgYWZmZWN0IHRoZVxuXHQgKiBvcHRpbWl6YXRpb24gb2YgdGhlIHBhcnNlIGZ1bmN0aW9uIHdoZW4gaXQgaXMgbm90IGNhbGxlZC5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGJvZHlcblx0ICogQHJldHVybiB7RnVuY3Rpb258dW5kZWZpbmVkfVxuXHQgKi9cblxuXHRmdW5jdGlvbiBtYWtlR2V0dGVyIChib2R5KSB7XG5cdCAgdHJ5IHtcblx0ICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ3Njb3BlJywgJ3JldHVybiAnICsgYm9keSArICc7Jylcblx0ICB9IGNhdGNoIChlKSB7XG5cdCAgICBfLndhcm4oXG5cdCAgICAgICdJbnZhbGlkIGV4cHJlc3Npb24uICcgKyBcblx0ICAgICAgJ0dlbmVyYXRlZCBmdW5jdGlvbiBib2R5OiAnICsgYm9keVxuXHQgICAgKVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCBhIHNldHRlciBmdW5jdGlvbi5cblx0ICpcblx0ICogVGhpcyBpcyBvbmx5IG5lZWRlZCBpbiByYXJlIHNpdHVhdGlvbnMgbGlrZSBcImFbYl1cIiB3aGVyZVxuXHQgKiBhIHNldHRhYmxlIHBhdGggcmVxdWlyZXMgZHluYW1pYyBldmFsdWF0aW9uLlxuXHQgKlxuXHQgKiBUaGlzIHNldHRlciBmdW5jdGlvbiBtYXkgdGhyb3cgZXJyb3Igd2hlbiBjYWxsZWQgaWYgdGhlXG5cdCAqIGV4cHJlc3Npb24gYm9keSBpcyBub3QgYSB2YWxpZCBsZWZ0LWhhbmQgZXhwcmVzc2lvbiBpblxuXHQgKiBhc3NpZ25tZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gYm9keVxuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG5cdCAqL1xuXG5cdGZ1bmN0aW9uIG1ha2VTZXR0ZXIgKGJvZHkpIHtcblx0ICB0cnkge1xuXHQgICAgcmV0dXJuIG5ldyBGdW5jdGlvbignc2NvcGUnLCAndmFsdWUnLCBib2R5ICsgJz12YWx1ZTsnKVxuXHQgIH0gY2F0Y2ggKGUpIHtcblx0ICAgIF8ud2FybignSW52YWxpZCBzZXR0ZXIgZnVuY3Rpb24gYm9keTogJyArIGJvZHkpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGZvciBzZXR0ZXIgZXhpc3RlbmNlIG9uIGEgY2FjaGUgaGl0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoaXRcblx0ICovXG5cblx0ZnVuY3Rpb24gY2hlY2tTZXR0ZXIgKGhpdCkge1xuXHQgIGlmICghaGl0LnNldCkge1xuXHQgICAgaGl0LnNldCA9IG1ha2VTZXR0ZXIoaGl0LmJvZHkpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIFBhcnNlIGFuIGV4cHJlc3Npb24gaW50byByZS13cml0dGVuIGdldHRlci9zZXR0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZXhwXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gbmVlZFNldFxuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbn1cblx0ICovXG5cblx0ZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIChleHAsIG5lZWRTZXQpIHtcblx0ICBleHAgPSBleHAudHJpbSgpXG5cdCAgLy8gdHJ5IGNhY2hlXG5cdCAgdmFyIGhpdCA9IGV4cHJlc3Npb25DYWNoZS5nZXQoZXhwKVxuXHQgIGlmIChoaXQpIHtcblx0ICAgIGlmIChuZWVkU2V0KSB7XG5cdCAgICAgIGNoZWNrU2V0dGVyKGhpdClcblx0ICAgIH1cblx0ICAgIHJldHVybiBoaXRcblx0ICB9XG5cdCAgLy8gd2UgZG8gYSBzaW1wbGUgcGF0aCBjaGVjayB0byBvcHRpbWl6ZSBmb3IgdGhlbS5cblx0ICAvLyB0aGUgY2hlY2sgZmFpbHMgdmFsaWQgcGF0aHMgd2l0aCB1bnVzYWwgd2hpdGVzcGFjZXMsXG5cdCAgLy8gYnV0IHRoYXQncyB0b28gcmFyZSBhbmQgd2UgZG9uJ3QgY2FyZS5cblx0ICB2YXIgcmVzID0gcGF0aFRlc3RSRS50ZXN0KGV4cClcblx0ICAgID8gY29tcGlsZVBhdGhGbnMoZXhwKVxuXHQgICAgOiBjb21waWxlRXhwRm5zKGV4cCwgbmVlZFNldClcblx0ICBleHByZXNzaW9uQ2FjaGUucHV0KGV4cCwgcmVzKVxuXHQgIHJldHVybiByZXNcblx0fVxuXG5cdC8vIEV4cG9ydCB0aGUgcGF0aFJlZ2V4IGZvciBleHRlcm5hbCB1c2Vcblx0ZXhwb3J0cy5wYXRoVGVzdFJFID0gcGF0aFRlc3RSRVxuXG4vKioqLyB9LFxuLyogNDUgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgYXBwbHlDU1NUcmFuc2l0aW9uID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1Mylcblx0dmFyIGFwcGx5SlNUcmFuc2l0aW9uID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1NClcblxuXHQvKipcblx0ICogQXBwZW5kIHdpdGggdHJhbnNpdGlvbi5cblx0ICpcblx0ICogQG9hcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuXHQgKiBAcGFyYW0ge1Z1ZX0gdm1cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuXHQgKi9cblxuXHRleHBvcnRzLmFwcGVuZCA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0LCB2bSwgY2IpIHtcblx0ICBhcHBseShlbCwgMSwgZnVuY3Rpb24gKCkge1xuXHQgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsKVxuXHQgIH0sIHZtLCBjYilcblx0fVxuXG5cdC8qKlxuXHQgKiBJbnNlcnRCZWZvcmUgd2l0aCB0cmFuc2l0aW9uLlxuXHQgKlxuXHQgKiBAb2FyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG5cdCAqL1xuXG5cdGV4cG9ydHMuYmVmb3JlID0gZnVuY3Rpb24gKGVsLCB0YXJnZXQsIHZtLCBjYikge1xuXHQgIGFwcGx5KGVsLCAxLCBmdW5jdGlvbiAoKSB7XG5cdCAgICBfLmJlZm9yZShlbCwgdGFyZ2V0KVxuXHQgIH0sIHZtLCBjYilcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgd2l0aCB0cmFuc2l0aW9uLlxuXHQgKlxuXHQgKiBAb2FyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG5cdCAqL1xuXG5cdGV4cG9ydHMucmVtb3ZlID0gZnVuY3Rpb24gKGVsLCB2bSwgY2IpIHtcblx0ICBhcHBseShlbCwgLTEsIGZ1bmN0aW9uICgpIHtcblx0ICAgIF8ucmVtb3ZlKGVsKVxuXHQgIH0sIHZtLCBjYilcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYnkgYXBwZW5kaW5nIHRvIGFub3RoZXIgcGFyZW50IHdpdGggdHJhbnNpdGlvbi5cblx0ICogVGhpcyBpcyBvbmx5IHVzZWQgaW4gYmxvY2sgb3BlcmF0aW9ucy5cblx0ICpcblx0ICogQG9hcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuXHQgKiBAcGFyYW0ge1Z1ZX0gdm1cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuXHQgKi9cblxuXHRleHBvcnRzLnJlbW92ZVRoZW5BcHBlbmQgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCwgdm0sIGNiKSB7XG5cdCAgYXBwbHkoZWwsIC0xLCBmdW5jdGlvbiAoKSB7XG5cdCAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoZWwpXG5cdCAgfSwgdm0sIGNiKVxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGVuZCB0aGUgY2hpbGROb2RlcyBvZiBhIGZyYWdtZW50IHRvIHRhcmdldC5cblx0ICpcblx0ICogQHBhcmFtIHtEb2N1bWVudEZyYWdtZW50fSBibG9ja1xuXHQgKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuXHQgKiBAcGFyYW0ge1Z1ZX0gdm1cblx0ICovXG5cblx0ZXhwb3J0cy5ibG9ja0FwcGVuZCA9IGZ1bmN0aW9uIChibG9jaywgdGFyZ2V0LCB2bSkge1xuXHQgIHZhciBub2RlcyA9IF8udG9BcnJheShibG9jay5jaGlsZE5vZGVzKVxuXHQgIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdCAgICBleHBvcnRzLmJlZm9yZShub2Rlc1tpXSwgdGFyZ2V0LCB2bSlcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlIGEgYmxvY2sgb2Ygbm9kZXMgYmV0d2VlbiB0d28gZWRnZSBub2Rlcy5cblx0ICpcblx0ICogQHBhcmFtIHtOb2RlfSBzdGFydFxuXHQgKiBAcGFyYW0ge05vZGV9IGVuZFxuXHQgKiBAcGFyYW0ge1Z1ZX0gdm1cblx0ICovXG5cblx0ZXhwb3J0cy5ibG9ja1JlbW92ZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kLCB2bSkge1xuXHQgIHZhciBub2RlID0gc3RhcnQubmV4dFNpYmxpbmdcblx0ICB2YXIgbmV4dFxuXHQgIHdoaWxlIChub2RlICE9PSBlbmQpIHtcblx0ICAgIG5leHQgPSBub2RlLm5leHRTaWJsaW5nXG5cdCAgICBleHBvcnRzLnJlbW92ZShub2RlLCB2bSlcblx0ICAgIG5vZGUgPSBuZXh0XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5IHRyYW5zaXRpb25zIHdpdGggYW4gb3BlcmF0aW9uIGNhbGxiYWNrLlxuXHQgKlxuXHQgKiBAb2FyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaXJlY3Rpb25cblx0ICogICAgICAgICAgICAgICAgICAxOiBlbnRlclxuXHQgKiAgICAgICAgICAgICAgICAgLTE6IGxlYXZlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9wIC0gdGhlIGFjdHVhbCBET00gb3BlcmF0aW9uXG5cdCAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG5cdCAqL1xuXG5cdHZhciBhcHBseSA9IGV4cG9ydHMuYXBwbHkgPSBmdW5jdGlvbiAoZWwsIGRpcmVjdGlvbiwgb3AsIHZtLCBjYikge1xuXHQgIHZhciB0cmFuc0RhdGEgPSBlbC5fX3ZfdHJhbnNcblx0ICBpZiAoXG5cdCAgICAhdHJhbnNEYXRhIHx8XG5cdCAgICAhdm0uX2lzQ29tcGlsZWQgfHxcblx0ICAgIC8vIGlmIHRoZSB2bSBpcyBiZWluZyBtYW5pcHVsYXRlZCBieSBhIHBhcmVudCBkaXJlY3RpdmVcblx0ICAgIC8vIGR1cmluZyB0aGUgcGFyZW50J3MgY29tcGlsYXRpb24gcGhhc2UsIHNraXAgdGhlXG5cdCAgICAvLyBhbmltYXRpb24uXG5cdCAgICAodm0uJHBhcmVudCAmJiAhdm0uJHBhcmVudC5faXNDb21waWxlZClcblx0ICApIHtcblx0ICAgIG9wKClcblx0ICAgIGlmIChjYikgY2IoKVxuXHQgICAgcmV0dXJuXG5cdCAgfVxuXHQgIC8vIGRldGVybWluZSB0aGUgdHJhbnNpdGlvbiB0eXBlIG9uIHRoZSBlbGVtZW50XG5cdCAgdmFyIGpzVHJhbnNpdGlvbiA9IHZtLiRvcHRpb25zLnRyYW5zaXRpb25zW3RyYW5zRGF0YS5pZF1cblx0ICBpZiAoanNUcmFuc2l0aW9uKSB7XG5cdCAgICAvLyBqc1xuXHQgICAgYXBwbHlKU1RyYW5zaXRpb24oXG5cdCAgICAgIGVsLFxuXHQgICAgICBkaXJlY3Rpb24sXG5cdCAgICAgIG9wLFxuXHQgICAgICB0cmFuc0RhdGEsXG5cdCAgICAgIGpzVHJhbnNpdGlvbixcblx0ICAgICAgdm0sXG5cdCAgICAgIGNiXG5cdCAgICApXG5cdCAgfSBlbHNlIGlmIChfLnRyYW5zaXRpb25FbmRFdmVudCkge1xuXHQgICAgLy8gY3NzXG5cdCAgICBhcHBseUNTU1RyYW5zaXRpb24oXG5cdCAgICAgIGVsLFxuXHQgICAgICBkaXJlY3Rpb24sXG5cdCAgICAgIG9wLFxuXHQgICAgICB0cmFuc0RhdGEsXG5cdCAgICAgIGNiXG5cdCAgICApXG5cdCAgfSBlbHNlIHtcblx0ICAgIC8vIG5vdCBhcHBsaWNhYmxlXG5cdCAgICBvcCgpXG5cdCAgICBpZiAoY2IpIGNiKClcblx0ICB9XG5cdH1cblxuLyoqKi8gfSxcbi8qIDQ2ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblx0dmFyIGNvbmZpZyA9IF9fd2VicGFja19yZXF1aXJlX18oMjApXG5cdHZhciB0ZXh0UGFyc2VyID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0Milcblx0dmFyIGRpclBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNDMpXG5cdHZhciB0ZW1wbGF0ZVBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNTEpXG5cblx0LyoqXG5cdCAqIENvbXBpbGUgYSB0ZW1wbGF0ZSBhbmQgcmV0dXJuIGEgcmV1c2FibGUgY29tcG9zaXRlIGxpbmtcblx0ICogZnVuY3Rpb24sIHdoaWNoIHJlY3Vyc2l2ZWx5IGNvbnRhaW5zIG1vcmUgbGluayBmdW5jdGlvbnNcblx0ICogaW5zaWRlLiBUaGlzIHRvcCBsZXZlbCBjb21waWxlIGZ1bmN0aW9uIHNob3VsZCBvbmx5IGJlXG5cdCAqIGNhbGxlZCBvbiBpbnN0YW5jZSByb290IG5vZGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gZWxcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICogQHBhcmFtIHtCb29sZWFufSBwYXJ0aWFsXG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuXHQgKi9cblxuXHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbXBpbGUgKGVsLCBvcHRpb25zLCBwYXJ0aWFsKSB7XG5cdCAgdmFyIHBhcmFtcyA9ICFwYXJ0aWFsICYmIG9wdGlvbnMucGFyYW1BdHRyaWJ1dGVzXG5cdCAgdmFyIHBhcmFtc0xpbmtGbiA9IHBhcmFtc1xuXHQgICAgPyBjb21waWxlUGFyYW1BdHRyaWJ1dGVzKGVsLCBwYXJhbXMsIG9wdGlvbnMpXG5cdCAgICA6IG51bGxcblx0ICB2YXIgbm9kZUxpbmtGbiA9IGVsIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudFxuXHQgICAgPyBudWxsXG5cdCAgICA6IGNvbXBpbGVOb2RlKGVsLCBvcHRpb25zKVxuXHQgIHZhciBjaGlsZExpbmtGbiA9XG5cdCAgICAoIW5vZGVMaW5rRm4gfHwgIW5vZGVMaW5rRm4udGVybWluYWwpICYmXG5cdCAgICBlbC5oYXNDaGlsZE5vZGVzKClcblx0ICAgICAgPyBjb21waWxlTm9kZUxpc3QoZWwuY2hpbGROb2Rlcywgb3B0aW9ucylcblx0ICAgICAgOiBudWxsXG5cblx0ICAvKipcblx0ICAgKiBBIGxpbmtlciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYSBhbHJlYWR5IGNvbXBpbGVkXG5cdCAgICogcGllY2Ugb2YgRE9NLCB3aGljaCBpbnN0YW50aWF0ZXMgYWxsIGRpcmVjdGl2ZVxuXHQgICAqIGluc3RhbmNlcy5cblx0ICAgKlxuXHQgICAqIEBwYXJhbSB7VnVlfSB2bVxuXHQgICAqIEBwYXJhbSB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fSBlbFxuXHQgICAqIEByZXR1cm4ge0Z1bmN0aW9ufHVuZGVmaW5lZH1cblx0ICAgKi9cblxuXHQgIHJldHVybiBmdW5jdGlvbiBsaW5rICh2bSwgZWwpIHtcblx0ICAgIHZhciBvcmlnaW5hbERpckNvdW50ID0gdm0uX2RpcmVjdGl2ZXMubGVuZ3RoXG5cdCAgICBpZiAocGFyYW1zTGlua0ZuKSBwYXJhbXNMaW5rRm4odm0sIGVsKVxuXHQgICAgaWYgKG5vZGVMaW5rRm4pIG5vZGVMaW5rRm4odm0sIGVsKVxuXHQgICAgaWYgKGNoaWxkTGlua0ZuKSBjaGlsZExpbmtGbih2bSwgZWwuY2hpbGROb2RlcylcblxuXHQgICAgLyoqXG5cdCAgICAgKiBJZiB0aGlzIGlzIGEgcGFydGlhbCBjb21waWxlLCB0aGUgbGlua2VyIGZ1bmN0aW9uXG5cdCAgICAgKiByZXR1cm5zIGFuIHVubGluayBmdW5jdGlvbiB0aGF0IHRlYXJzZG93biBhbGxcblx0ICAgICAqIGRpcmVjdGl2ZXMgaW5zdGFuY2VzIGdlbmVyYXRlZCBkdXJpbmcgdGhlIHBhcnRpYWxcblx0ICAgICAqIGxpbmtpbmcuXG5cdCAgICAgKi9cblxuXHQgICAgaWYgKHBhcnRpYWwpIHtcblx0ICAgICAgdmFyIGRpcnMgPSB2bS5fZGlyZWN0aXZlcy5zbGljZShvcmlnaW5hbERpckNvdW50KVxuXHQgICAgICByZXR1cm4gZnVuY3Rpb24gdW5saW5rICgpIHtcblx0ICAgICAgICB2YXIgaSA9IGRpcnMubGVuZ3RoXG5cdCAgICAgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICAgICAgZGlyc1tpXS5fdGVhcmRvd24oKVxuXHQgICAgICAgIH1cblx0ICAgICAgICBpID0gdm0uX2RpcmVjdGl2ZXMuaW5kZXhPZihkaXJzWzBdKVxuXHQgICAgICAgIHZtLl9kaXJlY3RpdmVzLnNwbGljZShpLCBkaXJzLmxlbmd0aClcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDb21waWxlIGEgbm9kZSBhbmQgcmV0dXJuIGEgbm9kZUxpbmtGbiBiYXNlZCBvbiB0aGVcblx0ICogbm9kZSB0eXBlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge05vZGV9IG5vZGVcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICogQHJldHVybiB7RnVuY3Rpb258dW5kZWZpbmVkfVxuXHQgKi9cblxuXHRmdW5jdGlvbiBjb21waWxlTm9kZSAobm9kZSwgb3B0aW9ucykge1xuXHQgIHZhciB0eXBlID0gbm9kZS5ub2RlVHlwZVxuXHQgIGlmICh0eXBlID09PSAxICYmIG5vZGUudGFnTmFtZSAhPT0gJ1NDUklQVCcpIHtcblx0ICAgIHJldHVybiBjb21waWxlRWxlbWVudChub2RlLCBvcHRpb25zKVxuXHQgIH0gZWxzZSBpZiAodHlwZSA9PT0gMyAmJiBjb25maWcuaW50ZXJwb2xhdGUpIHtcblx0ICAgIHJldHVybiBjb21waWxlVGV4dE5vZGUobm9kZSwgb3B0aW9ucylcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ29tcGlsZSBhbiBlbGVtZW50IGFuZCByZXR1cm4gYSBub2RlTGlua0ZuLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9XG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGNvbXBpbGVFbGVtZW50IChlbCwgb3B0aW9ucykge1xuXHQgIHZhciBsaW5rRm4sIHRhZywgY29tcG9uZW50XG5cdCAgLy8gY2hlY2sgY3VzdG9tIGVsZW1lbnQgY29tcG9uZW50LCBidXQgb25seSBvbiBub24tcm9vdFxuXHQgIGlmICghZWwuX192dWVfXykge1xuXHQgICAgdGFnID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpXG5cdCAgICBjb21wb25lbnQgPVxuXHQgICAgICB0YWcuaW5kZXhPZignLScpID4gMCAmJlxuXHQgICAgICBvcHRpb25zLmNvbXBvbmVudHNbdGFnXVxuXHQgICAgaWYgKGNvbXBvbmVudCkge1xuXHQgICAgICBlbC5zZXRBdHRyaWJ1dGUoY29uZmlnLnByZWZpeCArICdjb21wb25lbnQnLCB0YWcpXG5cdCAgICB9XG5cdCAgfVxuXHQgIGlmIChjb21wb25lbnQgfHwgZWwuaGFzQXR0cmlidXRlcygpKSB7XG5cdCAgICAvLyBjaGVjayB0ZXJtaW5hbCBkaXJlY2l0dmVzXG5cdCAgICBsaW5rRm4gPSBjaGVja1Rlcm1pbmFsRGlyZWN0aXZlcyhlbCwgb3B0aW9ucylcblx0ICAgIC8vIGlmIG5vdCB0ZXJtaW5hbCwgYnVpbGQgbm9ybWFsIGxpbmsgZnVuY3Rpb25cblx0ICAgIGlmICghbGlua0ZuKSB7XG5cdCAgICAgIHZhciBkaXJlY3RpdmVzID0gY29sbGVjdERpcmVjdGl2ZXMoZWwsIG9wdGlvbnMpXG5cdCAgICAgIGxpbmtGbiA9IGRpcmVjdGl2ZXMubGVuZ3RoXG5cdCAgICAgICAgPyBtYWtlRGlyZWN0aXZlc0xpbmtGbihkaXJlY3RpdmVzKVxuXHQgICAgICAgIDogbnVsbFxuXHQgICAgfVxuXHQgIH1cblx0ICAvLyBpZiB0aGUgZWxlbWVudCBpcyBhIHRleHRhcmVhLCB3ZSBuZWVkIHRvIGludGVycG9sYXRlXG5cdCAgLy8gaXRzIGNvbnRlbnQgb24gaW5pdGlhbCByZW5kZXIuXG5cdCAgaWYgKGVsLnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcblx0ICAgIHZhciByZWFsTGlua0ZuID0gbGlua0ZuXG5cdCAgICBsaW5rRm4gPSBmdW5jdGlvbiAodm0sIGVsKSB7XG5cdCAgICAgIGVsLnZhbHVlID0gdm0uJGludGVycG9sYXRlKGVsLnZhbHVlKVxuXHQgICAgICBpZiAocmVhbExpbmtGbikgcmVhbExpbmtGbih2bSwgZWwpICAgICAgXG5cdCAgICB9XG5cdCAgICBsaW5rRm4udGVybWluYWwgPSB0cnVlXG5cdCAgfVxuXHQgIHJldHVybiBsaW5rRm5cblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCBhIG11bHRpLWRpcmVjdGl2ZSBsaW5rIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSBkaXJlY3RpdmVzXG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufSBkaXJlY3RpdmVzTGlua0ZuXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIG1ha2VEaXJlY3RpdmVzTGlua0ZuIChkaXJlY3RpdmVzKSB7XG5cdCAgcmV0dXJuIGZ1bmN0aW9uIGRpcmVjdGl2ZXNMaW5rRm4gKHZtLCBlbCkge1xuXHQgICAgLy8gcmV2ZXJzZSBhcHBseSBiZWNhdXNlIGl0J3Mgc29ydGVkIGxvdyB0byBoaWdoXG5cdCAgICB2YXIgaSA9IGRpcmVjdGl2ZXMubGVuZ3RoXG5cdCAgICB2YXIgZGlyLCBqLCBrXG5cdCAgICB3aGlsZSAoaS0tKSB7XG5cdCAgICAgIGRpciA9IGRpcmVjdGl2ZXNbaV1cblx0ICAgICAgaWYgKGRpci5fbGluaykge1xuXHQgICAgICAgIC8vIGN1c3RvbSBsaW5rIGZuXG5cdCAgICAgICAgZGlyLl9saW5rKHZtLCBlbClcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBrID0gZGlyLmRlc2NyaXB0b3JzLmxlbmd0aFxuXHQgICAgICAgIGZvciAoaiA9IDA7IGogPCBrOyBqKyspIHtcblx0ICAgICAgICAgIHZtLl9iaW5kRGlyKGRpci5uYW1lLCBlbCxcblx0ICAgICAgICAgICAgICAgICAgICAgIGRpci5kZXNjcmlwdG9yc1tqXSwgZGlyLmRlZilcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ29tcGlsZSBhIHRleHROb2RlIGFuZCByZXR1cm4gYSBub2RlTGlua0ZuLlxuXHQgKlxuXHQgKiBAcGFyYW0ge1RleHROb2RlfSBub2RlXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9IHRleHROb2RlTGlua0ZuXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGNvbXBpbGVUZXh0Tm9kZSAobm9kZSwgb3B0aW9ucykge1xuXHQgIHZhciB0b2tlbnMgPSB0ZXh0UGFyc2VyLnBhcnNlKG5vZGUubm9kZVZhbHVlKVxuXHQgIGlmICghdG9rZW5zKSB7XG5cdCAgICByZXR1cm4gbnVsbFxuXHQgIH1cblx0ICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXHQgIHZhciBkaXJzID0gb3B0aW9ucy5kaXJlY3RpdmVzXG5cdCAgdmFyIGVsLCB0b2tlbiwgdmFsdWVcblx0ICBmb3IgKHZhciBpID0gMCwgbCA9IHRva2Vucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0ICAgIHRva2VuID0gdG9rZW5zW2ldXG5cdCAgICB2YWx1ZSA9IHRva2VuLnZhbHVlXG5cdCAgICBpZiAodG9rZW4udGFnKSB7XG5cdCAgICAgIGlmICh0b2tlbi5vbmVUaW1lKSB7XG5cdCAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2YWx1ZSlcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBpZiAodG9rZW4uaHRtbCkge1xuXHQgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LWh0bWwnKVxuXHQgICAgICAgICAgdG9rZW4udHlwZSA9ICdodG1sJ1xuXHQgICAgICAgICAgdG9rZW4uZGVmID0gZGlycy5odG1sXG5cdCAgICAgICAgICB0b2tlbi5kZXNjcmlwdG9yID0gZGlyUGFyc2VyLnBhcnNlKHZhbHVlKVswXVxuXHQgICAgICAgIH0gZWxzZSBpZiAodG9rZW4ucGFydGlhbCkge1xuXHQgICAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LXBhcnRpYWwnKVxuXHQgICAgICAgICAgdG9rZW4udHlwZSA9ICdwYXJ0aWFsJ1xuXHQgICAgICAgICAgdG9rZW4uZGVmID0gZGlycy5wYXJ0aWFsXG5cdCAgICAgICAgICB0b2tlbi5kZXNjcmlwdG9yID0gZGlyUGFyc2VyLnBhcnNlKHZhbHVlKVswXVxuXHQgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAvLyBJRSB3aWxsIGNsZWFuIHVwIGVtcHR5IHRleHROb2RlcyBkdXJpbmdcblx0ICAgICAgICAgIC8vIGZyYWcuY2xvbmVOb2RlKHRydWUpLCBzbyB3ZSBoYXZlIHRvIGdpdmUgaXRcblx0ICAgICAgICAgIC8vIHNvbWV0aGluZyBoZXJlLi4uXG5cdCAgICAgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJylcblx0ICAgICAgICAgIHRva2VuLnR5cGUgPSAndGV4dCdcblx0ICAgICAgICAgIHRva2VuLmRlZiA9IGRpcnMudGV4dFxuXHQgICAgICAgICAgdG9rZW4uZGVzY3JpcHRvciA9IGRpclBhcnNlci5wYXJzZSh2YWx1ZSlbMF1cblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmFsdWUpXG5cdCAgICB9XG5cdCAgICBmcmFnLmFwcGVuZENoaWxkKGVsKVxuXHQgIH1cblx0ICByZXR1cm4gbWFrZVRleHROb2RlTGlua0ZuKHRva2VucywgZnJhZywgb3B0aW9ucylcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCBhIGZ1bmN0aW9uIHRoYXQgcHJvY2Vzc2VzIGEgdGV4dE5vZGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gdG9rZW5zXG5cdCAqIEBwYXJhbSB7RG9jdW1lbnRGcmFnbWVudH0gZnJhZ1xuXHQgKi9cblxuXHRmdW5jdGlvbiBtYWtlVGV4dE5vZGVMaW5rRm4gKHRva2VucywgZnJhZykge1xuXHQgIHJldHVybiBmdW5jdGlvbiB0ZXh0Tm9kZUxpbmtGbiAodm0sIGVsKSB7XG5cdCAgICB2YXIgZnJhZ0Nsb25lID0gZnJhZy5jbG9uZU5vZGUodHJ1ZSlcblx0ICAgIHZhciBjaGlsZE5vZGVzID0gXy50b0FycmF5KGZyYWdDbG9uZS5jaGlsZE5vZGVzKVxuXHQgICAgdmFyIHRva2VuLCB2YWx1ZSwgbm9kZVxuXHQgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdCAgICAgIHRva2VuID0gdG9rZW5zW2ldXG5cdCAgICAgIHZhbHVlID0gdG9rZW4udmFsdWVcblx0ICAgICAgaWYgKHRva2VuLnRhZykge1xuXHQgICAgICAgIG5vZGUgPSBjaGlsZE5vZGVzW2ldXG5cdCAgICAgICAgaWYgKHRva2VuLm9uZVRpbWUpIHtcblx0ICAgICAgICAgIHZhbHVlID0gdm0uJGV2YWwodmFsdWUpXG5cdCAgICAgICAgICBpZiAodG9rZW4uaHRtbCkge1xuXHQgICAgICAgICAgICBfLnJlcGxhY2Uobm9kZSwgdGVtcGxhdGVQYXJzZXIucGFyc2UodmFsdWUsIHRydWUpKVxuXHQgICAgICAgICAgfSBlbHNlIHtcblx0ICAgICAgICAgICAgbm9kZS5ub2RlVmFsdWUgPSB2YWx1ZVxuXHQgICAgICAgICAgfVxuXHQgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICB2bS5fYmluZERpcih0b2tlbi50eXBlLCBub2RlLFxuXHQgICAgICAgICAgICAgICAgICAgICAgdG9rZW4uZGVzY3JpcHRvciwgdG9rZW4uZGVmKVxuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgICAgXy5yZXBsYWNlKGVsLCBmcmFnQ2xvbmUpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbXBpbGUgYSBub2RlIGxpc3QgYW5kIHJldHVybiBhIGNoaWxkTGlua0ZuLlxuXHQgKlxuXHQgKiBAcGFyYW0ge05vZGVMaXN0fSBub2RlTGlzdFxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGNvbXBpbGVOb2RlTGlzdCAobm9kZUxpc3QsIG9wdGlvbnMpIHtcblx0ICB2YXIgbGlua0ZucyA9IFtdXG5cdCAgdmFyIG5vZGVMaW5rRm4sIGNoaWxkTGlua0ZuLCBub2RlXG5cdCAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2RlTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0ICAgIG5vZGUgPSBub2RlTGlzdFtpXVxuXHQgICAgbm9kZUxpbmtGbiA9IGNvbXBpbGVOb2RlKG5vZGUsIG9wdGlvbnMpXG5cdCAgICBjaGlsZExpbmtGbiA9XG5cdCAgICAgICghbm9kZUxpbmtGbiB8fCAhbm9kZUxpbmtGbi50ZXJtaW5hbCkgJiZcblx0ICAgICAgbm9kZS5oYXNDaGlsZE5vZGVzKClcblx0ICAgICAgICA/IGNvbXBpbGVOb2RlTGlzdChub2RlLmNoaWxkTm9kZXMsIG9wdGlvbnMpXG5cdCAgICAgICAgOiBudWxsXG5cdCAgICBsaW5rRm5zLnB1c2gobm9kZUxpbmtGbiwgY2hpbGRMaW5rRm4pXG5cdCAgfVxuXHQgIHJldHVybiBsaW5rRm5zLmxlbmd0aFxuXHQgICAgPyBtYWtlQ2hpbGRMaW5rRm4obGlua0Zucylcblx0ICAgIDogbnVsbFxuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2UgYSBjaGlsZCBsaW5rIGZ1bmN0aW9uIGZvciBhIG5vZGUncyBjaGlsZE5vZGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5PEZ1bmN0aW9uPn0gbGlua0Zuc1xuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbn0gY2hpbGRMaW5rRm5cblx0ICovXG5cblx0ZnVuY3Rpb24gbWFrZUNoaWxkTGlua0ZuIChsaW5rRm5zKSB7XG5cdCAgcmV0dXJuIGZ1bmN0aW9uIGNoaWxkTGlua0ZuICh2bSwgbm9kZXMpIHtcblx0ICAgIC8vIHN0YWJsaXplIG5vZGVzXG5cdCAgICBub2RlcyA9IF8udG9BcnJheShub2Rlcylcblx0ICAgIHZhciBub2RlLCBub2RlTGlua0ZuLCBjaGlsZHJlbkxpbmtGblxuXHQgICAgZm9yICh2YXIgaSA9IDAsIG4gPSAwLCBsID0gbGlua0Zucy5sZW5ndGg7IGkgPCBsOyBuKyspIHtcblx0ICAgICAgbm9kZSA9IG5vZGVzW25dXG5cdCAgICAgIG5vZGVMaW5rRm4gPSBsaW5rRm5zW2krK11cblx0ICAgICAgY2hpbGRyZW5MaW5rRm4gPSBsaW5rRm5zW2krK11cblx0ICAgICAgaWYgKG5vZGVMaW5rRm4pIHtcblx0ICAgICAgICBub2RlTGlua0ZuKHZtLCBub2RlKVxuXHQgICAgICB9XG5cdCAgICAgIGlmIChjaGlsZHJlbkxpbmtGbikge1xuXHQgICAgICAgIGNoaWxkcmVuTGlua0ZuKHZtLCBub2RlLmNoaWxkTm9kZXMpXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ29tcGlsZSBwYXJhbSBhdHRyaWJ1dGVzIG9uIGEgcm9vdCBlbGVtZW50IGFuZCByZXR1cm5cblx0ICogYSBwYXJhbUF0dHJpYnV0ZXMgbGluayBmdW5jdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge0FycmF5fSBhdHRyc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbn0gcGFyYW1zTGlua0ZuXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGNvbXBpbGVQYXJhbUF0dHJpYnV0ZXMgKGVsLCBhdHRycywgb3B0aW9ucykge1xuXHQgIHZhciBwYXJhbXMgPSBbXVxuXHQgIHZhciBpID0gYXR0cnMubGVuZ3RoXG5cdCAgdmFyIG5hbWUsIHZhbHVlLCBwYXJhbVxuXHQgIHdoaWxlIChpLS0pIHtcblx0ICAgIG5hbWUgPSBhdHRyc1tpXVxuXHQgICAgdmFsdWUgPSBlbC5nZXRBdHRyaWJ1dGUobmFtZSlcblx0ICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuXHQgICAgICBwYXJhbSA9IHtcblx0ICAgICAgICBuYW1lOiBuYW1lLFxuXHQgICAgICAgIHZhbHVlOiB2YWx1ZVxuXHQgICAgICB9XG5cdCAgICAgIHZhciB0b2tlbnMgPSB0ZXh0UGFyc2VyLnBhcnNlKHZhbHVlKVxuXHQgICAgICBpZiAodG9rZW5zKSB7XG5cdCAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG5cdCAgICAgICAgaWYgKHRva2Vucy5sZW5ndGggPiAxKSB7XG5cdCAgICAgICAgICBfLndhcm4oXG5cdCAgICAgICAgICAgICdJbnZhbGlkIHBhcmFtIGF0dHJpYnV0ZSBiaW5kaW5nOiBcIicgK1xuXHQgICAgICAgICAgICBuYW1lICsgJz1cIicgKyB2YWx1ZSArICdcIicgK1xuXHQgICAgICAgICAgICAnXFxuRG9uXFwndCBtaXggYmluZGluZyB0YWdzIHdpdGggcGxhaW4gdGV4dCAnICtcblx0ICAgICAgICAgICAgJ2luIHBhcmFtIGF0dHJpYnV0ZSBiaW5kaW5ncy4nXG5cdCAgICAgICAgICApXG5cdCAgICAgICAgICBjb250aW51ZVxuXHQgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICBwYXJhbS5keW5hbWljID0gdHJ1ZVxuXHQgICAgICAgICAgcGFyYW0udmFsdWUgPSB0b2tlbnNbMF0udmFsdWVcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgICAgcGFyYW1zLnB1c2gocGFyYW0pXG5cdCAgICB9XG5cdCAgfVxuXHQgIHJldHVybiBtYWtlUGFyYW1zTGlua0ZuKHBhcmFtcywgb3B0aW9ucylcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCBhIGZ1bmN0aW9uIHRoYXQgYXBwbGllcyBwYXJhbSBhdHRyaWJ1dGVzIHRvIGEgdm0uXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHBhcmFtc1xuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbn0gcGFyYW1zTGlua0ZuXG5cdCAqL1xuXG5cdHZhciBkYXRhQXR0clJFID0gL15kYXRhLS9cblxuXHRmdW5jdGlvbiBtYWtlUGFyYW1zTGlua0ZuIChwYXJhbXMsIG9wdGlvbnMpIHtcblx0ICB2YXIgZGVmID0gb3B0aW9ucy5kaXJlY3RpdmVzWyd3aXRoJ11cblx0ICByZXR1cm4gZnVuY3Rpb24gcGFyYW1zTGlua0ZuICh2bSwgZWwpIHtcblx0ICAgIHZhciBpID0gcGFyYW1zLmxlbmd0aFxuXHQgICAgdmFyIHBhcmFtLCBwYXRoXG5cdCAgICB3aGlsZSAoaS0tKSB7XG5cdCAgICAgIHBhcmFtID0gcGFyYW1zW2ldXG5cdCAgICAgIC8vIHBhcmFtcyBjb3VsZCBjb250YWluIGRhc2hlcywgd2hpY2ggd2lsbCBiZVxuXHQgICAgICAvLyBpbnRlcnByZXRlZCBhcyBtaW51cyBjYWxjdWxhdGlvbnMgYnkgdGhlIHBhcnNlclxuXHQgICAgICAvLyBzbyB3ZSBuZWVkIHRvIHdyYXAgdGhlIHBhdGggaGVyZVxuXHQgICAgICBwYXRoID0gXy5jYW1lbGl6ZShwYXJhbS5uYW1lLnJlcGxhY2UoZGF0YUF0dHJSRSwgJycpKVxuXHQgICAgICBpZiAocGFyYW0uZHluYW1pYykge1xuXHQgICAgICAgIC8vIGR5bmFtaWMgcGFyYW0gYXR0cmlidHVlcyBhcmUgYm91bmQgYXMgdi13aXRoLlxuXHQgICAgICAgIC8vIHdlIGNhbiBkaXJlY3RseSBkdWNrIHRoZSBkZXNjcmlwdG9yIGhlcmUgYmVhY3VzZVxuXHQgICAgICAgIC8vIHBhcmFtIGF0dHJpYnV0ZXMgY2Fubm90IHVzZSBleHByZXNzaW9ucyBvclxuXHQgICAgICAgIC8vIGZpbHRlcnMuXG5cdCAgICAgICAgdm0uX2JpbmREaXIoJ3dpdGgnLCBlbCwge1xuXHQgICAgICAgICAgYXJnOiBwYXRoLFxuXHQgICAgICAgICAgZXhwcmVzc2lvbjogcGFyYW0udmFsdWVcblx0ICAgICAgICB9LCBkZWYpXG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgLy8ganVzdCBzZXQgb25jZVxuXHQgICAgICAgIHZtLiRzZXQocGF0aCwgcGFyYW0udmFsdWUpXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgYW4gZWxlbWVudCBmb3IgdGVybWluYWwgZGlyZWN0aXZlcyBpbiBmaXhlZCBvcmRlci5cblx0ICogSWYgaXQgZmluZHMgb25lLCByZXR1cm4gYSB0ZXJtaW5hbCBsaW5rIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufSB0ZXJtaW5hbExpbmtGblxuXHQgKi9cblxuXHR2YXIgdGVybWluYWxEaXJlY3RpdmVzID0gW1xuXHQgICdyZXBlYXQnLFxuXHQgICdpZicsXG5cdCAgJ2NvbXBvbmVudCdcblx0XVxuXG5cdGZ1bmN0aW9uIHNraXAgKCkge31cblx0c2tpcC50ZXJtaW5hbCA9IHRydWVcblxuXHRmdW5jdGlvbiBjaGVja1Rlcm1pbmFsRGlyZWN0aXZlcyAoZWwsIG9wdGlvbnMpIHtcblx0ICBpZiAoXy5hdHRyKGVsLCAncHJlJykgIT09IG51bGwpIHtcblx0ICAgIHJldHVybiBza2lwXG5cdCAgfVxuXHQgIHZhciB2YWx1ZSwgZGlyTmFtZVxuXHQgIC8qIGpzaGludCBib3NzOiB0cnVlICovXG5cdCAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0ICAgIGRpck5hbWUgPSB0ZXJtaW5hbERpcmVjdGl2ZXNbaV1cblx0ICAgIGlmICh2YWx1ZSA9IF8uYXR0cihlbCwgZGlyTmFtZSkpIHtcblx0ICAgICAgcmV0dXJuIG1ha2VUZXJpbWluYWxMaW5rRm4oZWwsIGRpck5hbWUsIHZhbHVlLCBvcHRpb25zKVxuXHQgICAgfVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCBhIGxpbmsgZnVuY3Rpb24gZm9yIGEgdGVybWluYWwgZGlyZWN0aXZlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkaXJOYW1lXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJuIHtGdW5jdGlvbn0gdGVybWluYWxMaW5rRm5cblx0ICovXG5cblx0ZnVuY3Rpb24gbWFrZVRlcmltaW5hbExpbmtGbiAoZWwsIGRpck5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG5cdCAgdmFyIGRlc2NyaXB0b3IgPSBkaXJQYXJzZXIucGFyc2UodmFsdWUpWzBdXG5cdCAgdmFyIGRlZiA9IG9wdGlvbnMuZGlyZWN0aXZlc1tkaXJOYW1lXVxuXHQgIC8vIHNwZWNpYWwgY2FzZTogd2UgbmVlZCB0byBjb2xsZWN0IGRpcmVjdGl2ZXMgZm91bmRcblx0ICAvLyBvbiBhIGNvbXBvbmVudCByb290IG5vZGUsIGJ1dCBkZWZpbmVkIGluIHRoZSBwYXJlbnRcblx0ICAvLyB0ZW1wbGF0ZS4gVGhlc2UgZGlyZWN0aXZlcyBuZWVkIHRvIGJlIGNvbXBpbGVkIGluXG5cdCAgLy8gdGhlIHBhcmVudCBzY29wZS5cblx0ICBpZiAoZGlyTmFtZSA9PT0gJ2NvbXBvbmVudCcpIHtcblx0ICAgIHZhciBkaXJzID0gY29sbGVjdERpcmVjdGl2ZXMoZWwsIG9wdGlvbnMsIHRydWUpXG5cdCAgICBlbC5fcGFyZW50TGlua2VyID0gZGlycy5sZW5ndGhcblx0ICAgICAgPyBtYWtlRGlyZWN0aXZlc0xpbmtGbihkaXJzKVxuXHQgICAgICA6IG51bGxcblx0ICB9XG5cdCAgdmFyIHRlcm1pbmFsTGlua0ZuID0gZnVuY3Rpb24gKHZtLCBlbCkge1xuXHQgICAgdm0uX2JpbmREaXIoZGlyTmFtZSwgZWwsIGRlc2NyaXB0b3IsIGRlZilcblx0ICB9XG5cdCAgdGVybWluYWxMaW5rRm4udGVybWluYWwgPSB0cnVlXG5cdCAgcmV0dXJuIHRlcm1pbmFsTGlua0ZuXG5cdH1cblxuXHQvKipcblx0ICogQ29sbGVjdCB0aGUgZGlyZWN0aXZlcyBvbiBhbiBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gYXNQYXJlbnRcblx0ICogQHJldHVybiB7QXJyYXl9XG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGNvbGxlY3REaXJlY3RpdmVzIChlbCwgb3B0aW9ucywgYXNQYXJlbnQpIHtcblx0ICB2YXIgYXR0cnMgPSBfLnRvQXJyYXkoZWwuYXR0cmlidXRlcylcblx0ICB2YXIgaSA9IGF0dHJzLmxlbmd0aFxuXHQgIHZhciBkaXJzID0gW11cblx0ICB2YXIgYXR0ciwgYXR0ck5hbWUsIGRpciwgZGlyTmFtZSwgZGlyRGVmXG5cdCAgd2hpbGUgKGktLSkge1xuXHQgICAgYXR0ciA9IGF0dHJzW2ldXG5cdCAgICBhdHRyTmFtZSA9IGF0dHIubmFtZVxuXHQgICAgaWYgKGF0dHJOYW1lLmluZGV4T2YoY29uZmlnLnByZWZpeCkgPT09IDApIHtcblx0ICAgICAgZGlyTmFtZSA9IGF0dHJOYW1lLnNsaWNlKGNvbmZpZy5wcmVmaXgubGVuZ3RoKVxuXHQgICAgICBpZiAoXG5cdCAgICAgICAgYXNQYXJlbnQgJiZcblx0ICAgICAgICAoZGlyTmFtZSA9PT0gJ3dpdGgnIHx8IGRpck5hbWUgPT09ICdyZWYnKVxuXHQgICAgICApIHtcblx0ICAgICAgICBjb250aW51ZVxuXHQgICAgICB9XG5cdCAgICAgIGRpckRlZiA9IG9wdGlvbnMuZGlyZWN0aXZlc1tkaXJOYW1lXVxuXHQgICAgICBfLmFzc2VydEFzc2V0KGRpckRlZiwgJ2RpcmVjdGl2ZScsIGRpck5hbWUpXG5cdCAgICAgIGlmIChkaXJEZWYpIHtcblx0ICAgICAgICBkaXJzLnB1c2goe1xuXHQgICAgICAgICAgbmFtZTogZGlyTmFtZSxcblx0ICAgICAgICAgIGRlc2NyaXB0b3JzOiBkaXJQYXJzZXIucGFyc2UoYXR0ci52YWx1ZSksXG5cdCAgICAgICAgICBkZWY6IGRpckRlZlxuXHQgICAgICAgIH0pXG5cdCAgICAgIH1cblx0ICAgIH0gZWxzZSBpZiAoY29uZmlnLmludGVycG9sYXRlKSB7XG5cdCAgICAgIGRpciA9IGNvbGxlY3RBdHRyRGlyZWN0aXZlKGVsLCBhdHRyTmFtZSwgYXR0ci52YWx1ZSxcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucylcblx0ICAgICAgaWYgKGRpcikge1xuXHQgICAgICAgIGRpcnMucHVzaChkaXIpXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdCAgLy8gc29ydCBieSBwcmlvcml0eSwgTE9XIHRvIEhJR0hcblx0ICBkaXJzLnNvcnQoZGlyZWN0aXZlQ29tcGFyYXRvcilcblx0ICByZXR1cm4gZGlyc1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrIGFuIGF0dHJpYnV0ZSBmb3IgcG90ZW50aWFsIGR5bmFtaWMgYmluZGluZ3MsXG5cdCAqIGFuZCByZXR1cm4gYSBkaXJlY3RpdmUgb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJuIHtPYmplY3R9XG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGNvbGxlY3RBdHRyRGlyZWN0aXZlIChlbCwgbmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcblx0ICB2YXIgdG9rZW5zID0gdGV4dFBhcnNlci5wYXJzZSh2YWx1ZSlcblx0ICBpZiAodG9rZW5zKSB7XG5cdCAgICB2YXIgZGVmID0gb3B0aW9ucy5kaXJlY3RpdmVzLmF0dHJcblx0ICAgIHZhciBpID0gdG9rZW5zLmxlbmd0aFxuXHQgICAgdmFyIGFsbE9uZVRpbWUgPSB0cnVlXG5cdCAgICB3aGlsZSAoaS0tKSB7XG5cdCAgICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXVxuXHQgICAgICBpZiAodG9rZW4udGFnICYmICF0b2tlbi5vbmVUaW1lKSB7XG5cdCAgICAgICAgYWxsT25lVGltZSA9IGZhbHNlXG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICAgIHJldHVybiB7XG5cdCAgICAgIGRlZjogZGVmLFxuXHQgICAgICBfbGluazogYWxsT25lVGltZVxuXHQgICAgICAgID8gZnVuY3Rpb24gKHZtLCBlbCkge1xuXHQgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGUobmFtZSwgdm0uJGludGVycG9sYXRlKHZhbHVlKSlcblx0ICAgICAgICAgIH1cblx0ICAgICAgICA6IGZ1bmN0aW9uICh2bSwgZWwpIHtcblx0ICAgICAgICAgICAgdmFyIHZhbHVlID0gdGV4dFBhcnNlci50b2tlbnNUb0V4cCh0b2tlbnMsIHZtKVxuXHQgICAgICAgICAgICB2YXIgZGVzYyA9IGRpclBhcnNlci5wYXJzZShuYW1lICsgJzonICsgdmFsdWUpWzBdXG5cdCAgICAgICAgICAgIHZtLl9iaW5kRGlyKCdhdHRyJywgZWwsIGRlc2MsIGRlZilcblx0ICAgICAgICAgIH1cblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogRGlyZWN0aXZlIHByaW9yaXR5IHNvcnQgY29tcGFyYXRvclxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gYVxuXHQgKiBAcGFyYW0ge09iamVjdH0gYlxuXHQgKi9cblxuXHRmdW5jdGlvbiBkaXJlY3RpdmVDb21wYXJhdG9yIChhLCBiKSB7XG5cdCAgYSA9IGEuZGVmLnByaW9yaXR5IHx8IDBcblx0ICBiID0gYi5kZWYucHJpb3JpdHkgfHwgMFxuXHQgIHJldHVybiBhID4gYiA/IDEgOiAtMVxuXHR9XG5cbi8qKiovIH0sXG4vKiA0NyAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciB0ZW1wbGF0ZVBhcnNlciA9IF9fd2VicGFja19yZXF1aXJlX18oNTEpXG5cblx0LyoqXG5cdCAqIFByb2Nlc3MgYW4gZWxlbWVudCBvciBhIERvY3VtZW50RnJhZ21lbnQgYmFzZWQgb24gYVxuXHQgKiBpbnN0YW5jZSBvcHRpb24gb2JqZWN0LiBUaGlzIGFsbG93cyB1cyB0byB0cmFuc2NsdWRlXG5cdCAqIGEgdGVtcGxhdGUgbm9kZS9mcmFnbWVudCBiZWZvcmUgdGhlIGluc3RhbmNlIGlzIGNyZWF0ZWQsXG5cdCAqIHNvIHRoZSBwcm9jZXNzZWQgZnJhZ21lbnQgY2FuIHRoZW4gYmUgY2xvbmVkIGFuZCByZXVzZWRcblx0ICogaW4gdi1yZXBlYXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gZWxcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICogQHJldHVybiB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fVxuXHQgKi9cblxuXHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zY2x1ZGUgKGVsLCBvcHRpb25zKSB7XG5cdCAgLy8gZm9yIHRlbXBsYXRlIHRhZ3MsIHdoYXQgd2Ugd2FudCBpcyBpdHMgY29udGVudCBhc1xuXHQgIC8vIGEgZG9jdW1lbnRGcmFnbWVudCAoZm9yIGJsb2NrIGluc3RhbmNlcylcblx0ICBpZiAoZWwudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJykge1xuXHQgICAgZWwgPSB0ZW1wbGF0ZVBhcnNlci5wYXJzZShlbClcblx0ICB9XG5cdCAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy50ZW1wbGF0ZSkge1xuXHQgICAgZWwgPSB0cmFuc2NsdWRlVGVtcGxhdGUoZWwsIG9wdGlvbnMpXG5cdCAgfVxuXHQgIGlmIChlbCBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnQpIHtcblx0ICAgIF8ucHJlcGVuZChkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LXN0YXJ0JyksIGVsKVxuXHQgICAgZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgndi1lbmQnKSlcblx0ICB9XG5cdCAgcmV0dXJuIGVsXG5cdH1cblxuXHQvKipcblx0ICogUHJvY2VzcyB0aGUgdGVtcGxhdGUgb3B0aW9uLlxuXHQgKiBJZiB0aGUgcmVwbGFjZSBvcHRpb24gaXMgdHJ1ZSB0aGlzIHdpbGwgc3dhcCB0aGUgJGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEByZXR1cm4ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH1cblx0ICovXG5cblx0ZnVuY3Rpb24gdHJhbnNjbHVkZVRlbXBsYXRlIChlbCwgb3B0aW9ucykge1xuXHQgIHZhciB0ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGVcblx0ICB2YXIgZnJhZyA9IHRlbXBsYXRlUGFyc2VyLnBhcnNlKHRlbXBsYXRlLCB0cnVlKVxuXHQgIGlmICghZnJhZykge1xuXHQgICAgXy53YXJuKCdJbnZhbGlkIHRlbXBsYXRlIG9wdGlvbjogJyArIHRlbXBsYXRlKVxuXHQgIH0gZWxzZSB7XG5cdCAgICBjb2xsZWN0UmF3Q29udGVudChlbClcblx0ICAgIGlmIChvcHRpb25zLnJlcGxhY2UpIHtcblx0ICAgICAgaWYgKGZyYWcuY2hpbGROb2Rlcy5sZW5ndGggPiAxKSB7XG5cdCAgICAgICAgdHJhbnNjbHVkZUNvbnRlbnQoZnJhZylcblx0ICAgICAgICByZXR1cm4gZnJhZ1xuXHQgICAgICB9IGVsc2Uge1xuXHQgICAgICAgIHZhciByZXBsYWNlciA9IGZyYWcuZmlyc3RDaGlsZFxuXHQgICAgICAgIF8uY29weUF0dHJpYnV0ZXMoZWwsIHJlcGxhY2VyKVxuXHQgICAgICAgIHRyYW5zY2x1ZGVDb250ZW50KHJlcGxhY2VyKVxuXHQgICAgICAgIHJldHVybiByZXBsYWNlclxuXHQgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBlbC5hcHBlbmRDaGlsZChmcmFnKVxuXHQgICAgICB0cmFuc2NsdWRlQ29udGVudChlbClcblx0ICAgICAgcmV0dXJuIGVsXG5cdCAgICB9XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbGxlY3QgcmF3IGNvbnRlbnQgaW5zaWRlICRlbCBiZWZvcmUgdGhleSBhcmVcblx0ICogcmVwbGFjZWQgYnkgdGVtcGxhdGUgY29udGVudC5cblx0ICovXG5cblx0dmFyIHJhd0NvbnRlbnRcblx0ZnVuY3Rpb24gY29sbGVjdFJhd0NvbnRlbnQgKGVsKSB7XG5cdCAgdmFyIGNoaWxkXG5cdCAgcmF3Q29udGVudCA9IG51bGxcblx0ICBpZiAoZWwuaGFzQ2hpbGROb2RlcygpKSB7XG5cdCAgICByYXdDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0ICAgIC8qIGpzaGludCBib3NzOnRydWUgKi9cblx0ICAgIHdoaWxlIChjaGlsZCA9IGVsLmZpcnN0Q2hpbGQpIHtcblx0ICAgICAgcmF3Q29udGVudC5hcHBlbmRDaGlsZChjaGlsZClcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZSA8Y29udGVudD4gaW5zZXJ0aW9uIHBvaW50cyBtaW1pY2tpbmcgdGhlIGJlaGF2aW9yXG5cdCAqIG9mIHRoZSBTaGFkb3cgRE9NIHNwZWM6XG5cdCAqXG5cdCAqICAgaHR0cDovL3czYy5naXRodWIuaW8vd2ViY29tcG9uZW50cy9zcGVjL3NoYWRvdy8jaW5zZXJ0aW9uLXBvaW50c1xuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gZWxcblx0ICovXG5cblx0ZnVuY3Rpb24gdHJhbnNjbHVkZUNvbnRlbnQgKGVsKSB7XG5cdCAgdmFyIG91dGxldHMgPSBnZXRPdXRsZXRzKGVsKVxuXHQgIHZhciBpID0gb3V0bGV0cy5sZW5ndGhcblx0ICBpZiAoIWkpIHJldHVyblxuXHQgIHZhciBvdXRsZXQsIHNlbGVjdCwgc2VsZWN0ZWQsIGosIG1haW5cblx0ICAvLyBmaXJzdCBwYXNzLCBjb2xsZWN0IGNvcnJlc3BvbmRpbmcgY29udGVudFxuXHQgIC8vIGZvciBlYWNoIG91dGxldC5cblx0ICB3aGlsZSAoaS0tKSB7XG5cdCAgICBvdXRsZXQgPSBvdXRsZXRzW2ldXG5cdCAgICBpZiAocmF3Q29udGVudCkge1xuXHQgICAgICBzZWxlY3QgPSBvdXRsZXQuZ2V0QXR0cmlidXRlKCdzZWxlY3QnKVxuXHQgICAgICBpZiAoc2VsZWN0KSB7ICAvLyBzZWxlY3QgY29udGVudFxuXHQgICAgICAgIHNlbGVjdGVkID0gcmF3Q29udGVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdClcblx0ICAgICAgICBvdXRsZXQuY29udGVudCA9IF8udG9BcnJheShcblx0ICAgICAgICAgIHNlbGVjdGVkLmxlbmd0aFxuXHQgICAgICAgICAgICA/IHNlbGVjdGVkXG5cdCAgICAgICAgICAgIDogb3V0bGV0LmNoaWxkTm9kZXNcblx0ICAgICAgICApXG5cdCAgICAgIH0gZWxzZSB7IC8vIGRlZmF1bHQgY29udGVudFxuXHQgICAgICAgIG1haW4gPSBvdXRsZXRcblx0ICAgICAgfVxuXHQgICAgfSBlbHNlIHsgLy8gZmFsbGJhY2sgY29udGVudFxuXHQgICAgICBvdXRsZXQuY29udGVudCA9IF8udG9BcnJheShvdXRsZXQuY2hpbGROb2Rlcylcblx0ICAgIH1cblx0ICB9XG5cdCAgLy8gc2Vjb25kIHBhc3MsIGFjdHVhbGx5IGluc2VydCB0aGUgY29udGVudHNcblx0ICBmb3IgKGkgPSAwLCBqID0gb3V0bGV0cy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcblx0ICAgIG91dGxldCA9IG91dGxldHNbaV1cblx0ICAgIGlmIChvdXRsZXQgIT09IG1haW4pIHtcblx0ICAgICAgaW5zZXJ0Q29udGVudEF0KG91dGxldCwgb3V0bGV0LmNvbnRlbnQpXG5cdCAgICB9XG5cdCAgfVxuXHQgIC8vIGZpbmFsbHkgaW5zZXJ0IHRoZSBtYWluIGNvbnRlbnRcblx0ICBpZiAobWFpbikge1xuXHQgICAgaW5zZXJ0Q29udGVudEF0KG1haW4sIF8udG9BcnJheShyYXdDb250ZW50LmNoaWxkTm9kZXMpKVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgPGNvbnRlbnQ+IG91dGxldHMgZnJvbSB0aGUgZWxlbWVudC9saXN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudHxBcnJheX0gZWxcblx0ICogQHJldHVybiB7QXJyYXl9XG5cdCAqL1xuXG5cdHZhciBjb25jYXQgPSBbXS5jb25jYXRcblx0ZnVuY3Rpb24gZ2V0T3V0bGV0cyAoZWwpIHtcblx0ICByZXR1cm4gXy5pc0FycmF5KGVsKVxuXHQgICAgPyBjb25jYXQuYXBwbHkoW10sIGVsLm1hcChnZXRPdXRsZXRzKSlcblx0ICAgIDogZWwucXVlcnlTZWxlY3RvckFsbFxuXHQgICAgICA/IF8udG9BcnJheShlbC5xdWVyeVNlbGVjdG9yQWxsKCdjb250ZW50JykpXG5cdCAgICAgIDogW11cblx0fVxuXG5cdC8qKlxuXHQgKiBJbnNlcnQgYW4gYXJyYXkgb2Ygbm9kZXMgYXQgb3V0bGV0LFxuXHQgKiB0aGVuIHJlbW92ZSB0aGUgb3V0bGV0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IG91dGxldFxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb250ZW50c1xuXHQgKi9cblxuXHRmdW5jdGlvbiBpbnNlcnRDb250ZW50QXQgKG91dGxldCwgY29udGVudHMpIHtcblx0ICAvLyBub3QgdXNpbmcgdXRpbCBET00gbWV0aG9kcyBoZXJlIGJlY2F1c2Vcblx0ICAvLyBwYXJlbnROb2RlIGNhbiBiZSBjYWNoZWRcblx0ICB2YXIgcGFyZW50ID0gb3V0bGV0LnBhcmVudE5vZGVcblx0ICBmb3IgKHZhciBpID0gMCwgaiA9IGNvbnRlbnRzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuXHQgICAgcGFyZW50Lmluc2VydEJlZm9yZShjb250ZW50c1tpXSwgb3V0bGV0KVxuXHQgIH1cblx0ICBwYXJlbnQucmVtb3ZlQ2hpbGQob3V0bGV0KVxuXHR9XG5cbi8qKiovIH0sXG4vKiA0OCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cblx0dmFyIGhhbmRsZXJzID0ge1xuXHQgIF9kZWZhdWx0OiBfX3dlYnBhY2tfcmVxdWlyZV9fKDU1KSxcblx0ICByYWRpbzogX193ZWJwYWNrX3JlcXVpcmVfXyg1NiksXG5cdCAgc2VsZWN0OiBfX3dlYnBhY2tfcmVxdWlyZV9fKDU3KSxcblx0ICBjaGVja2JveDogX193ZWJwYWNrX3JlcXVpcmVfXyg1OClcblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzID0ge1xuXG5cdCAgcHJpb3JpdHk6IDgwMCxcblx0ICB0d29XYXk6IHRydWUsXG5cdCAgaGFuZGxlcnM6IGhhbmRsZXJzLFxuXG5cdCAgLyoqXG5cdCAgICogUG9zc2libGUgZWxlbWVudHM6XG5cdCAgICogICA8c2VsZWN0PlxuXHQgICAqICAgPHRleHRhcmVhPlxuXHQgICAqICAgPGlucHV0IHR5cGU9XCIqXCI+XG5cdCAgICogICAgIC0gdGV4dFxuXHQgICAqICAgICAtIGNoZWNrYm94XG5cdCAgICogICAgIC0gcmFkaW9cblx0ICAgKiAgICAgLSBudW1iZXJcblx0ICAgKiAgICAgLSBUT0RPOiBtb3JlIHR5cGVzIG1heSBiZSBzdXBwbGllZCBhcyBhIHBsdWdpblxuXHQgICAqL1xuXG5cdCAgYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgLy8gZnJpZW5kbHkgd2FybmluZy4uLlxuXHQgICAgdmFyIGZpbHRlcnMgPSB0aGlzLmZpbHRlcnNcblx0ICAgIGlmIChmaWx0ZXJzICYmIGZpbHRlcnMucmVhZCAmJiAhZmlsdGVycy53cml0ZSkge1xuXHQgICAgICBfLndhcm4oXG5cdCAgICAgICAgJ0l0IHNlZW1zIHlvdSBhcmUgdXNpbmcgYSByZWFkLW9ubHkgZmlsdGVyIHdpdGggJyArXG5cdCAgICAgICAgJ3YtbW9kZWwuIFlvdSBtaWdodCB3YW50IHRvIHVzZSBhIHR3by13YXkgZmlsdGVyICcgK1xuXHQgICAgICAgICd0byBlbnN1cmUgY29ycmVjdCBiZWhhdmlvci4nXG5cdCAgICAgIClcblx0ICAgIH1cblx0ICAgIHZhciBlbCA9IHRoaXMuZWxcblx0ICAgIHZhciB0YWcgPSBlbC50YWdOYW1lXG5cdCAgICB2YXIgaGFuZGxlclxuXHQgICAgaWYgKHRhZyA9PT0gJ0lOUFVUJykge1xuXHQgICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZWwudHlwZV0gfHwgaGFuZGxlcnMuX2RlZmF1bHRcblx0ICAgIH0gZWxzZSBpZiAodGFnID09PSAnU0VMRUNUJykge1xuXHQgICAgICBoYW5kbGVyID0gaGFuZGxlcnMuc2VsZWN0XG5cdCAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ1RFWFRBUkVBJykge1xuXHQgICAgICBoYW5kbGVyID0gaGFuZGxlcnMuX2RlZmF1bHRcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIF8ud2FybihcInYtbW9kZWwgZG9lc24ndCBzdXBwb3J0IGVsZW1lbnQgdHlwZTogXCIgKyB0YWcpXG5cdCAgICAgIHJldHVyblxuXHQgICAgfVxuXHQgICAgaGFuZGxlci5iaW5kLmNhbGwodGhpcylcblx0ICAgIHRoaXMudXBkYXRlID0gaGFuZGxlci51cGRhdGVcblx0ICAgIHRoaXMudW5iaW5kID0gaGFuZGxlci51bmJpbmRcblx0ICB9XG5cblx0fVxuXG4vKioqLyB9LFxuLyogNDkgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgY29uZmlnID0gX193ZWJwYWNrX3JlcXVpcmVfXygyMClcblx0dmFyIEJpbmRpbmcgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM5KVxuXHR2YXIgYXJyYXlNZXRob2RzID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1OSlcblx0dmFyIGFycmF5S2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFycmF5TWV0aG9kcylcblx0X193ZWJwYWNrX3JlcXVpcmVfXyg2MClcblxuXHR2YXIgdWlkID0gMFxuXG5cdC8qKlxuXHQgKiBUeXBlIGVudW1zXG5cdCAqL1xuXG5cdHZhciBBUlJBWSAgPSAwXG5cdHZhciBPQkpFQ1QgPSAxXG5cblx0LyoqXG5cdCAqIEF1Z21lbnQgYW4gdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBpbnRlcmNlcHRpbmdcblx0ICogdGhlIHByb3RvdHlwZSBjaGFpbiB1c2luZyBfX3Byb3RvX19cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IHRhcmdldFxuXHQgKiBAcGFyYW0ge09iamVjdH0gcHJvdG9cblx0ICovXG5cblx0ZnVuY3Rpb24gcHJvdG9BdWdtZW50ICh0YXJnZXQsIHNyYykge1xuXHQgIHRhcmdldC5fX3Byb3RvX18gPSBzcmNcblx0fVxuXG5cdC8qKlxuXHQgKiBBdWdtZW50IGFuIHRhcmdldCBPYmplY3Qgb3IgQXJyYXkgYnkgZGVmaW5pbmdcblx0ICogaGlkZGVuIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSB0YXJnZXRcblx0ICogQHBhcmFtIHtPYmplY3R9IHByb3RvXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGNvcHlBdWdtZW50ICh0YXJnZXQsIHNyYywga2V5cykge1xuXHQgIHZhciBpID0ga2V5cy5sZW5ndGhcblx0ICB2YXIga2V5XG5cdCAgd2hpbGUgKGktLSkge1xuXHQgICAga2V5ID0ga2V5c1tpXVxuXHQgICAgXy5kZWZpbmUodGFyZ2V0LCBrZXksIHNyY1trZXldKVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBPYnNlcnZlciBjbGFzcyB0aGF0IGFyZSBhdHRhY2hlZCB0byBlYWNoIG9ic2VydmVkXG5cdCAqIG9iamVjdC4gT25jZSBhdHRhY2hlZCwgdGhlIG9ic2VydmVyIGNvbnZlcnRzIHRhcmdldFxuXHQgKiBvYmplY3QncyBwcm9wZXJ0eSBrZXlzIGludG8gZ2V0dGVyL3NldHRlcnMgdGhhdFxuXHQgKiBjb2xsZWN0IGRlcGVuZGVuY2llcyBhbmQgZGlzcGF0Y2hlcyB1cGRhdGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gdmFsdWVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IHR5cGVcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIE9ic2VydmVyICh2YWx1ZSwgdHlwZSkge1xuXHQgIHRoaXMuaWQgPSArK3VpZFxuXHQgIHRoaXMudmFsdWUgPSB2YWx1ZVxuXHQgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuXHQgIHRoaXMuYmluZGluZ3MgPSBbXVxuXHQgIF8uZGVmaW5lKHZhbHVlLCAnX19vYl9fJywgdGhpcylcblx0ICBpZiAodHlwZSA9PT0gQVJSQVkpIHtcblx0ICAgIHZhciBhdWdtZW50ID0gY29uZmlnLnByb3RvICYmIF8uaGFzUHJvdG9cblx0ICAgICAgPyBwcm90b0F1Z21lbnRcblx0ICAgICAgOiBjb3B5QXVnbWVudFxuXHQgICAgYXVnbWVudCh2YWx1ZSwgYXJyYXlNZXRob2RzLCBhcnJheUtleXMpXG5cdCAgICB0aGlzLm9ic2VydmVBcnJheSh2YWx1ZSlcblx0ICB9IGVsc2UgaWYgKHR5cGUgPT09IE9CSkVDVCkge1xuXHQgICAgdGhpcy53YWxrKHZhbHVlKVxuXHQgIH1cblx0fVxuXG5cdE9ic2VydmVyLnRhcmdldCA9IG51bGxcblxuXHR2YXIgcCA9IE9ic2VydmVyLnByb3RvdHlwZVxuXG5cdC8qKlxuXHQgKiBBdHRlbXB0IHRvIGNyZWF0ZSBhbiBvYnNlcnZlciBpbnN0YW5jZSBmb3IgYSB2YWx1ZSxcblx0ICogcmV0dXJucyB0aGUgbmV3IG9ic2VydmVyIGlmIHN1Y2Nlc3NmdWxseSBvYnNlcnZlZCxcblx0ICogb3IgdGhlIGV4aXN0aW5nIG9ic2VydmVyIGlmIHRoZSB2YWx1ZSBhbHJlYWR5IGhhcyBvbmUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Kn0gdmFsdWVcblx0ICogQHJldHVybiB7T2JzZXJ2ZXJ8dW5kZWZpbmVkfVxuXHQgKiBAc3RhdGljXG5cdCAqL1xuXG5cdE9ic2VydmVyLmNyZWF0ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgIGlmIChcblx0ICAgIHZhbHVlICYmXG5cdCAgICB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgnX19vYl9fJykgJiZcblx0ICAgIHZhbHVlLl9fb2JfXyBpbnN0YW5jZW9mIE9ic2VydmVyXG5cdCAgKSB7XG5cdCAgICByZXR1cm4gdmFsdWUuX19vYl9fXG5cdCAgfSBlbHNlIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG5cdCAgICByZXR1cm4gbmV3IE9ic2VydmVyKHZhbHVlLCBBUlJBWSlcblx0ICB9IGVsc2UgaWYgKFxuXHQgICAgXy5pc1BsYWluT2JqZWN0KHZhbHVlKSAmJlxuXHQgICAgIXZhbHVlLl9pc1Z1ZSAvLyBhdm9pZCBWdWUgaW5zdGFuY2Vcblx0ICApIHtcblx0ICAgIHJldHVybiBuZXcgT2JzZXJ2ZXIodmFsdWUsIE9CSkVDVClcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogV2FsayB0aHJvdWdoIGVhY2ggcHJvcGVydHkgYW5kIGNvbnZlcnQgdGhlbSBpbnRvXG5cdCAqIGdldHRlci9zZXR0ZXJzLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hlblxuXHQgKiB2YWx1ZSB0eXBlIGlzIE9iamVjdC4gUHJvcGVydGllcyBwcmVmaXhlZCB3aXRoIGAkYCBvciBgX2Bcblx0ICogYW5kIGFjY2Vzc29yIHByb3BlcnRpZXMgYXJlIGlnbm9yZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcblx0ICovXG5cblx0cC53YWxrID0gZnVuY3Rpb24gKG9iaikge1xuXHQgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKVxuXHQgIHZhciBpID0ga2V5cy5sZW5ndGhcblx0ICB2YXIga2V5LCBwcmVmaXhcblx0ICB3aGlsZSAoaS0tKSB7XG5cdCAgICBrZXkgPSBrZXlzW2ldXG5cdCAgICBwcmVmaXggPSBrZXkuY2hhckNvZGVBdCgwKVxuXHQgICAgaWYgKHByZWZpeCAhPT0gMHgyNCAmJiBwcmVmaXggIT09IDB4NUYpIHsgLy8gc2tpcCAkIG9yIF9cblx0ICAgICAgdGhpcy5jb252ZXJ0KGtleSwgb2JqW2tleV0pXG5cdCAgICB9XG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIFRyeSB0byBjYXJldGUgYW4gb2JzZXJ2ZXIgZm9yIGEgY2hpbGQgdmFsdWUsXG5cdCAqIGFuZCBpZiB2YWx1ZSBpcyBhcnJheSwgbGluayBiaW5kaW5nIHRvIHRoZSBhcnJheS5cblx0ICpcblx0ICogQHBhcmFtIHsqfSB2YWxcblx0ICogQHJldHVybiB7QmluZGluZ3x1bmRlZmluZWR9XG5cdCAqL1xuXG5cdHAub2JzZXJ2ZSA9IGZ1bmN0aW9uICh2YWwpIHtcblx0ICByZXR1cm4gT2JzZXJ2ZXIuY3JlYXRlKHZhbClcblx0fVxuXG5cdC8qKlxuXHQgKiBPYnNlcnZlIGEgbGlzdCBvZiBBcnJheSBpdGVtcy5cblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gaXRlbXNcblx0ICovXG5cblx0cC5vYnNlcnZlQXJyYXkgPSBmdW5jdGlvbiAoaXRlbXMpIHtcblx0ICB2YXIgaSA9IGl0ZW1zLmxlbmd0aFxuXHQgIHdoaWxlIChpLS0pIHtcblx0ICAgIHRoaXMub2JzZXJ2ZShpdGVtc1tpXSlcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydCBhIHByb3BlcnR5IGludG8gZ2V0dGVyL3NldHRlciBzbyB3ZSBjYW4gZW1pdFxuXHQgKiB0aGUgZXZlbnRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIGFjY2Vzc2VkL2NoYW5nZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcblx0ICogQHBhcmFtIHsqfSB2YWxcblx0ICovXG5cblx0cC5jb252ZXJ0ID0gZnVuY3Rpb24gKGtleSwgdmFsKSB7XG5cdCAgdmFyIG9iID0gdGhpc1xuXHQgIHZhciBjaGlsZE9iID0gb2Iub2JzZXJ2ZSh2YWwpXG5cdCAgdmFyIGJpbmRpbmcgPSBuZXcgQmluZGluZygpXG5cdCAgaWYgKGNoaWxkT2IpIHtcblx0ICAgIGNoaWxkT2IuYmluZGluZ3MucHVzaChiaW5kaW5nKVxuXHQgIH1cblx0ICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2IudmFsdWUsIGtleSwge1xuXHQgICAgZW51bWVyYWJsZTogdHJ1ZSxcblx0ICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0ICAgIGdldDogZnVuY3Rpb24gKCkge1xuXHQgICAgICAvLyBPYnNlcnZlci50YXJnZXQgaXMgYSB3YXRjaGVyIHdob3NlIGdldHRlciBpc1xuXHQgICAgICAvLyBjdXJyZW50bHkgYmVpbmcgZXZhbHVhdGVkLlxuXHQgICAgICBpZiAob2IuYWN0aXZlICYmIE9ic2VydmVyLnRhcmdldCkge1xuXHQgICAgICAgIE9ic2VydmVyLnRhcmdldC5hZGREZXAoYmluZGluZylcblx0ICAgICAgfVxuXHQgICAgICByZXR1cm4gdmFsXG5cdCAgICB9LFxuXHQgICAgc2V0OiBmdW5jdGlvbiAobmV3VmFsKSB7XG5cdCAgICAgIGlmIChuZXdWYWwgPT09IHZhbCkgcmV0dXJuXG5cdCAgICAgIC8vIHJlbW92ZSBiaW5kaW5nIGZyb20gb2xkIHZhbHVlXG5cdCAgICAgIHZhciBvbGRDaGlsZE9iID0gdmFsICYmIHZhbC5fX29iX19cblx0ICAgICAgaWYgKG9sZENoaWxkT2IpIHtcblx0ICAgICAgICB2YXIgb2xkQmluZGluZ3MgPSBvbGRDaGlsZE9iLmJpbmRpbmdzXG5cdCAgICAgICAgb2xkQmluZGluZ3Muc3BsaWNlKG9sZEJpbmRpbmdzLmluZGV4T2YoYmluZGluZyksIDEpXG5cdCAgICAgIH1cblx0ICAgICAgdmFsID0gbmV3VmFsXG5cdCAgICAgIC8vIGFkZCBiaW5kaW5nIHRvIG5ldyB2YWx1ZVxuXHQgICAgICB2YXIgbmV3Q2hpbGRPYiA9IG9iLm9ic2VydmUobmV3VmFsKVxuXHQgICAgICBpZiAobmV3Q2hpbGRPYikge1xuXHQgICAgICAgIG5ld0NoaWxkT2IuYmluZGluZ3MucHVzaChiaW5kaW5nKVxuXHQgICAgICB9XG5cdCAgICAgIGJpbmRpbmcubm90aWZ5KClcblx0ICAgIH1cblx0ICB9KVxuXHR9XG5cblx0LyoqXG5cdCAqIE5vdGlmeSBjaGFuZ2Ugb24gYWxsIHNlbGYgYmluZGluZ3Mgb24gYW4gb2JzZXJ2ZXIuXG5cdCAqIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBtdXRhYmxlIHZhbHVlIG11dGF0ZXMuIGUuZy5cblx0ICogd2hlbiBhbiBBcnJheSdzIG11dGF0aW5nIG1ldGhvZHMgYXJlIGNhbGxlZCwgb3IgYW5cblx0ICogT2JqZWN0J3MgJGFkZC8kZGVsZXRlIGFyZSBjYWxsZWQuXG5cdCAqL1xuXG5cdHAubm90aWZ5ID0gZnVuY3Rpb24gKCkge1xuXHQgIHZhciBiaW5kaW5ncyA9IHRoaXMuYmluZGluZ3Ncblx0ICBmb3IgKHZhciBpID0gMCwgbCA9IGJpbmRpbmdzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHQgICAgYmluZGluZ3NbaV0ubm90aWZ5KClcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogQWRkIGFuIG93bmVyIHZtLCBzbyB0aGF0IHdoZW4gJGFkZC8kZGVsZXRlIG11dGF0aW9uc1xuXHQgKiBoYXBwZW4gd2UgY2FuIG5vdGlmeSBvd25lciB2bXMgdG8gcHJveHkgdGhlIGtleXMgYW5kXG5cdCAqIGRpZ2VzdCB0aGUgd2F0Y2hlcnMuIFRoaXMgaXMgb25seSBjYWxsZWQgd2hlbiB0aGUgb2JqZWN0XG5cdCAqIGlzIG9ic2VydmVkIGFzIGFuIGluc3RhbmNlJ3Mgcm9vdCAkZGF0YS5cblx0ICpcblx0ICogQHBhcmFtIHtWdWV9IHZtXG5cdCAqL1xuXG5cdHAuYWRkVm0gPSBmdW5jdGlvbiAodm0pIHtcblx0ICAodGhpcy52bXMgPSB0aGlzLnZtcyB8fCBbXSkucHVzaCh2bSlcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYW4gb3duZXIgdm0uIFRoaXMgaXMgY2FsbGVkIHdoZW4gdGhlIG9iamVjdCBpc1xuXHQgKiBzd2FwcGVkIG91dCBhcyBhbiBpbnN0YW5jZSdzICRkYXRhIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIHtWdWV9IHZtXG5cdCAqL1xuXG5cdHAucmVtb3ZlVm0gPSBmdW5jdGlvbiAodm0pIHtcblx0ICB0aGlzLnZtcy5zcGxpY2UodGhpcy52bXMuaW5kZXhPZih2bSksIDEpXG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cyA9IE9ic2VydmVyXG5cblxuLyoqKi8gfSxcbi8qIDUwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblxuXHQvKipcblx0ICogVGhlIEJhdGNoZXIgbWFpbnRhaW5zIGEgam9iIHF1ZXVlIHRvIGJlIHJ1blxuXHQgKiBhc3luYyBvbiB0aGUgbmV4dCBldmVudCBsb29wLlxuXHQgKi9cblxuXHRmdW5jdGlvbiBCYXRjaGVyICgpIHtcblx0ICB0aGlzLnJlc2V0KClcblx0fVxuXG5cdHZhciBwID0gQmF0Y2hlci5wcm90b3R5cGVcblxuXHQvKipcblx0ICogUHVzaCBhIGpvYiBpbnRvIHRoZSBqb2IgcXVldWUuXG5cdCAqIEpvYnMgd2l0aCBkdXBsaWNhdGUgSURzIHdpbGwgYmUgc2tpcHBlZCB1bmxlc3MgaXQnc1xuXHQgKiBwdXNoZWQgd2hlbiB0aGUgcXVldWUgaXMgYmVpbmcgZmx1c2hlZC5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGpvYlxuXHQgKiAgIHByb3BlcnRpZXM6XG5cdCAqICAgLSB7U3RyaW5nfE51bWJlcn0gaWRcblx0ICogICAtIHtGdW5jdGlvbn0gICAgICBydW5cblx0ICovXG5cblx0cC5wdXNoID0gZnVuY3Rpb24gKGpvYikge1xuXHQgIGlmICgham9iLmlkIHx8ICF0aGlzLmhhc1tqb2IuaWRdIHx8IHRoaXMuZmx1c2hpbmcpIHtcblx0ICAgIHRoaXMucXVldWUucHVzaChqb2IpXG5cdCAgICB0aGlzLmhhc1tqb2IuaWRdID0gam9iXG5cdCAgICBpZiAoIXRoaXMud2FpdGluZykge1xuXHQgICAgICB0aGlzLndhaXRpbmcgPSB0cnVlXG5cdCAgICAgIF8ubmV4dFRpY2sodGhpcy5mbHVzaCwgdGhpcylcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogRmx1c2ggdGhlIHF1ZXVlIGFuZCBydW4gdGhlIGpvYnMuXG5cdCAqIFdpbGwgY2FsbCBhIHByZUZsdXNoIGhvb2sgaWYgaGFzIG9uZS5cblx0ICovXG5cblx0cC5mbHVzaCA9IGZ1bmN0aW9uICgpIHtcblx0ICB0aGlzLmZsdXNoaW5nID0gdHJ1ZVxuXHQgIC8vIGRvIG5vdCBjYWNoZSBsZW5ndGggYmVjYXVzZSBtb3JlIGpvYnMgbWlnaHQgYmUgcHVzaGVkXG5cdCAgLy8gYXMgd2UgcnVuIGV4aXN0aW5nIGpvYnNcblx0ICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVldWUubGVuZ3RoOyBpKyspIHtcblx0ICAgIHZhciBqb2IgPSB0aGlzLnF1ZXVlW2ldXG5cdCAgICBpZiAoIWpvYi5jYW5jZWxsZWQpIHtcblx0ICAgICAgam9iLnJ1bigpXG5cdCAgICB9XG5cdCAgfVxuXHQgIHRoaXMucmVzZXQoKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlc2V0IHRoZSBiYXRjaGVyJ3Mgc3RhdGUuXG5cdCAqL1xuXG5cdHAucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgdGhpcy5oYXMgPSB7fVxuXHQgIHRoaXMucXVldWUgPSBbXVxuXHQgIHRoaXMud2FpdGluZyA9IGZhbHNlXG5cdCAgdGhpcy5mbHVzaGluZyA9IGZhbHNlXG5cdH1cblxuXHRtb2R1bGUuZXhwb3J0cyA9IEJhdGNoZXJcblxuLyoqKi8gfSxcbi8qIDUxICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblx0dmFyIENhY2hlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1Milcblx0dmFyIHRlbXBsYXRlQ2FjaGUgPSBuZXcgQ2FjaGUoMTAwKVxuXG5cdC8qKlxuXHQgKiBUZXN0IGZvciB0aGUgcHJlc2VuY2Ugb2YgdGhlIFNhZmFyaSB0ZW1wbGF0ZSBjbG9uaW5nIGJ1Z1xuXHQgKiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTM3NzU1XG5cdCAqL1xuXG5cdHZhciBoYXNCcm9rZW5UZW1wbGF0ZSA9IF8uaW5Ccm93c2VyXG5cdCAgPyAoZnVuY3Rpb24gKCkge1xuXHQgICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdCAgICAgIGEuaW5uZXJIVE1MID0gJzx0ZW1wbGF0ZT4xPC90ZW1wbGF0ZT4nXG5cdCAgICAgIHJldHVybiAhYS5jbG9uZU5vZGUodHJ1ZSkuZmlyc3RDaGlsZC5pbm5lckhUTUxcblx0ICAgIH0pKClcblx0ICA6IGZhbHNlXG5cblx0dmFyIG1hcCA9IHtcblx0ICBfZGVmYXVsdCA6IFswLCAnJywgJyddLFxuXHQgIGxlZ2VuZCAgIDogWzEsICc8ZmllbGRzZXQ+JywgJzwvZmllbGRzZXQ+J10sXG5cdCAgdHIgICAgICAgOiBbMiwgJzx0YWJsZT48dGJvZHk+JywgJzwvdGJvZHk+PC90YWJsZT4nXSxcblx0ICBjb2wgICAgICA6IFtcblx0ICAgIDIsXG5cdCAgICAnPHRhYmxlPjx0Ym9keT48L3Rib2R5Pjxjb2xncm91cD4nLFxuXHQgICAgJzwvY29sZ3JvdXA+PC90YWJsZT4nXG5cdCAgXVxuXHR9XG5cblx0bWFwLnRkID1cblx0bWFwLnRoID0gW1xuXHQgIDMsXG5cdCAgJzx0YWJsZT48dGJvZHk+PHRyPicsXG5cdCAgJzwvdHI+PC90Ym9keT48L3RhYmxlPidcblx0XVxuXG5cdG1hcC5vcHRpb24gPVxuXHRtYXAub3B0Z3JvdXAgPSBbXG5cdCAgMSxcblx0ICAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+Jyxcblx0ICAnPC9zZWxlY3Q+J1xuXHRdXG5cblx0bWFwLnRoZWFkID1cblx0bWFwLnRib2R5ID1cblx0bWFwLmNvbGdyb3VwID1cblx0bWFwLmNhcHRpb24gPVxuXHRtYXAudGZvb3QgPSBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXVxuXG5cdG1hcC5nID1cblx0bWFwLmRlZnMgPVxuXHRtYXAuc3ltYm9sID1cblx0bWFwLnVzZSA9XG5cdG1hcC5pbWFnZSA9XG5cdG1hcC50ZXh0ID1cblx0bWFwLmNpcmNsZSA9XG5cdG1hcC5lbGxpcHNlID1cblx0bWFwLmxpbmUgPVxuXHRtYXAucGF0aCA9XG5cdG1hcC5wb2x5Z29uID1cblx0bWFwLnBvbHlsaW5lID1cblx0bWFwLnJlY3QgPSBbXG5cdCAgMSxcblx0ICAnPHN2ZyAnICtcblx0ICAgICd4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgJyArXG5cdCAgICAneG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgJyArXG5cdCAgICAneG1sbnM6ZXY9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAxL3htbC1ldmVudHNcIicgK1xuXHQgICAgJ3ZlcnNpb249XCIxLjFcIj4nLFxuXHQgICc8L3N2Zz4nXG5cdF1cblxuXHR2YXIgVEFHX1JFID0gLzwoW1xcdzpdKykvXG5cblx0LyoqXG5cdCAqIENvbnZlcnQgYSBzdHJpbmcgdGVtcGxhdGUgdG8gYSBEb2N1bWVudEZyYWdtZW50LlxuXHQgKiBEZXRlcm1pbmVzIGNvcnJlY3Qgd3JhcHBpbmcgYnkgdGFnIHR5cGVzLiBXcmFwcGluZ1xuXHQgKiBzdHJhdGVneSBmb3VuZCBpbiBqUXVlcnkgJiBjb21wb25lbnQvZG9taWZ5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdGVtcGxhdGVTdHJpbmdcblx0ICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudH1cblx0ICovXG5cblx0ZnVuY3Rpb24gc3RyaW5nVG9GcmFnbWVudCAodGVtcGxhdGVTdHJpbmcpIHtcblx0ICAvLyB0cnkgYSBjYWNoZSBoaXQgZmlyc3Rcblx0ICB2YXIgaGl0ID0gdGVtcGxhdGVDYWNoZS5nZXQodGVtcGxhdGVTdHJpbmcpXG5cdCAgaWYgKGhpdCkge1xuXHQgICAgcmV0dXJuIGhpdFxuXHQgIH1cblxuXHQgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cdCAgdmFyIHRhZ01hdGNoID0gVEFHX1JFLmV4ZWModGVtcGxhdGVTdHJpbmcpXG5cblx0ICBpZiAoIXRhZ01hdGNoKSB7XG5cdCAgICAvLyB0ZXh0IG9ubHksIHJldHVybiBhIHNpbmdsZSB0ZXh0IG5vZGUuXG5cdCAgICBmcmFnLmFwcGVuZENoaWxkKFxuXHQgICAgICBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZW1wbGF0ZVN0cmluZylcblx0ICAgIClcblx0ICB9IGVsc2Uge1xuXG5cdCAgICB2YXIgdGFnICAgID0gdGFnTWF0Y2hbMV1cblx0ICAgIHZhciB3cmFwICAgPSBtYXBbdGFnXSB8fCBtYXAuX2RlZmF1bHRcblx0ICAgIHZhciBkZXB0aCAgPSB3cmFwWzBdXG5cdCAgICB2YXIgcHJlZml4ID0gd3JhcFsxXVxuXHQgICAgdmFyIHN1ZmZpeCA9IHdyYXBbMl1cblx0ICAgIHZhciBub2RlICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG5cdCAgICBub2RlLmlubmVySFRNTCA9IHByZWZpeCArIHRlbXBsYXRlU3RyaW5nLnRyaW0oKSArIHN1ZmZpeFxuXHQgICAgd2hpbGUgKGRlcHRoLS0pIHtcblx0ICAgICAgbm9kZSA9IG5vZGUubGFzdENoaWxkXG5cdCAgICB9XG5cblx0ICAgIHZhciBjaGlsZFxuXHQgICAgLyoganNoaW50IGJvc3M6dHJ1ZSAqL1xuXHQgICAgd2hpbGUgKGNoaWxkID0gbm9kZS5maXJzdENoaWxkKSB7XG5cdCAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoY2hpbGQpXG5cdCAgICB9XG5cdCAgfVxuXG5cdCAgdGVtcGxhdGVDYWNoZS5wdXQodGVtcGxhdGVTdHJpbmcsIGZyYWcpXG5cdCAgcmV0dXJuIGZyYWdcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0IGEgdGVtcGxhdGUgbm9kZSB0byBhIERvY3VtZW50RnJhZ21lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuXHQgKiBAcmV0dXJuIHtEb2N1bWVudEZyYWdtZW50fVxuXHQgKi9cblxuXHRmdW5jdGlvbiBub2RlVG9GcmFnbWVudCAobm9kZSkge1xuXHQgIHZhciB0YWcgPSBub2RlLnRhZ05hbWVcblx0ICAvLyBpZiBpdHMgYSB0ZW1wbGF0ZSB0YWcgYW5kIHRoZSBicm93c2VyIHN1cHBvcnRzIGl0LFxuXHQgIC8vIGl0cyBjb250ZW50IGlzIGFscmVhZHkgYSBkb2N1bWVudCBmcmFnbWVudC5cblx0ICBpZiAoXG5cdCAgICB0YWcgPT09ICdURU1QTEFURScgJiZcblx0ICAgIG5vZGUuY29udGVudCBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnRcblx0ICApIHtcblx0ICAgIHJldHVybiBub2RlLmNvbnRlbnRcblx0ICB9XG5cdCAgcmV0dXJuIHRhZyA9PT0gJ1NDUklQVCdcblx0ICAgID8gc3RyaW5nVG9GcmFnbWVudChub2RlLnRleHRDb250ZW50KVxuXHQgICAgOiBzdHJpbmdUb0ZyYWdtZW50KG5vZGUuaW5uZXJIVE1MKVxuXHR9XG5cblx0LyoqXG5cdCAqIERlYWwgd2l0aCBTYWZhcmkgY2xvbmluZyBuZXN0ZWQgPHRlbXBsYXRlPiBidWcgYnlcblx0ICogbWFudWFsbHkgY2xvbmluZyBhbGwgdGVtcGxhdGUgaW5zdGFuY2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH0gbm9kZVxuXHQgKiBAcmV0dXJuIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9XG5cdCAqL1xuXG5cdGV4cG9ydHMuY2xvbmUgPSBmdW5jdGlvbiAobm9kZSkge1xuXHQgIHZhciByZXMgPSBub2RlLmNsb25lTm9kZSh0cnVlKVxuXHQgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuXHQgIGlmIChoYXNCcm9rZW5UZW1wbGF0ZSkge1xuXHQgICAgdmFyIHRlbXBsYXRlcyA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgndGVtcGxhdGUnKVxuXHQgICAgaWYgKHRlbXBsYXRlcy5sZW5ndGgpIHtcblx0ICAgICAgdmFyIGNsb25lZCA9IHJlcy5xdWVyeVNlbGVjdG9yQWxsKCd0ZW1wbGF0ZScpXG5cdCAgICAgIHZhciBpID0gY2xvbmVkLmxlbmd0aFxuXHQgICAgICB3aGlsZSAoaS0tKSB7XG5cdCAgICAgICAgY2xvbmVkW2ldLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKFxuXHQgICAgICAgICAgdGVtcGxhdGVzW2ldLmNsb25lTm9kZSh0cnVlKSxcblx0ICAgICAgICAgIGNsb25lZFtpXVxuXHQgICAgICAgIClcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH1cblx0ICByZXR1cm4gcmVzXG5cdH1cblxuXHQvKipcblx0ICogUHJvY2VzcyB0aGUgdGVtcGxhdGUgb3B0aW9uIGFuZCBub3JtYWxpemVzIGl0IGludG8gYVxuXHQgKiBhIERvY3VtZW50RnJhZ21lbnQgdGhhdCBjYW4gYmUgdXNlZCBhcyBhIHBhcnRpYWwgb3IgYVxuXHQgKiBpbnN0YW5jZSB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQHBhcmFtIHsqfSB0ZW1wbGF0ZVxuXHQgKiAgICBQb3NzaWJsZSB2YWx1ZXMgaW5jbHVkZTpcblx0ICogICAgLSBEb2N1bWVudEZyYWdtZW50IG9iamVjdFxuXHQgKiAgICAtIE5vZGUgb2JqZWN0IG9mIHR5cGUgVGVtcGxhdGVcblx0ICogICAgLSBpZCBzZWxlY3RvcjogJyNzb21lLXRlbXBsYXRlLWlkJ1xuXHQgKiAgICAtIHRlbXBsYXRlIHN0cmluZzogJzxkaXY+PHNwYW4+e3ttc2d9fTwvc3Bhbj48L2Rpdj4nXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gY2xvbmVcblx0ICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudHx1bmRlZmluZWR9XG5cdCAqL1xuXG5cdGV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAodGVtcGxhdGUsIGNsb25lKSB7XG5cdCAgdmFyIG5vZGUsIGZyYWdcblxuXHQgIC8vIGlmIHRoZSB0ZW1wbGF0ZSBpcyBhbHJlYWR5IGEgZG9jdW1lbnQgZnJhZ21lbnQsXG5cdCAgLy8gZG8gbm90aGluZ1xuXHQgIGlmICh0ZW1wbGF0ZSBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnQpIHtcblx0ICAgIHJldHVybiBjbG9uZVxuXHQgICAgICA/IHRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKVxuXHQgICAgICA6IHRlbXBsYXRlXG5cdCAgfVxuXG5cdCAgaWYgKHR5cGVvZiB0ZW1wbGF0ZSA9PT0gJ3N0cmluZycpIHtcblx0ICAgIC8vIGlkIHNlbGVjdG9yXG5cdCAgICBpZiAodGVtcGxhdGUuY2hhckF0KDApID09PSAnIycpIHtcblx0ICAgICAgLy8gaWQgc2VsZWN0b3IgY2FuIGJlIGNhY2hlZCB0b29cblx0ICAgICAgZnJhZyA9IHRlbXBsYXRlQ2FjaGUuZ2V0KHRlbXBsYXRlKVxuXHQgICAgICBpZiAoIWZyYWcpIHtcblx0ICAgICAgICBub2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGUuc2xpY2UoMSkpXG5cdCAgICAgICAgaWYgKG5vZGUpIHtcblx0ICAgICAgICAgIGZyYWcgPSBub2RlVG9GcmFnbWVudChub2RlKVxuXHQgICAgICAgICAgLy8gc2F2ZSBzZWxlY3RvciB0byBjYWNoZVxuXHQgICAgICAgICAgdGVtcGxhdGVDYWNoZS5wdXQodGVtcGxhdGUsIGZyYWcpXG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAvLyBub3JtYWwgc3RyaW5nIHRlbXBsYXRlXG5cdCAgICAgIGZyYWcgPSBzdHJpbmdUb0ZyYWdtZW50KHRlbXBsYXRlKVxuXHQgICAgfVxuXHQgIH0gZWxzZSBpZiAodGVtcGxhdGUubm9kZVR5cGUpIHtcblx0ICAgIC8vIGEgZGlyZWN0IG5vZGVcblx0ICAgIGZyYWcgPSBub2RlVG9GcmFnbWVudCh0ZW1wbGF0ZSlcblx0ICB9XG5cblx0ICByZXR1cm4gZnJhZyAmJiBjbG9uZVxuXHQgICAgPyBleHBvcnRzLmNsb25lKGZyYWcpXG5cdCAgICA6IGZyYWdcblx0fVxuXG4vKioqLyB9LFxuLyogNTIgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdC8qKlxuXHQgKiBBIGRvdWJseSBsaW5rZWQgbGlzdC1iYXNlZCBMZWFzdCBSZWNlbnRseSBVc2VkIChMUlUpXG5cdCAqIGNhY2hlLiBXaWxsIGtlZXAgbW9zdCByZWNlbnRseSB1c2VkIGl0ZW1zIHdoaWxlXG5cdCAqIGRpc2NhcmRpbmcgbGVhc3QgcmVjZW50bHkgdXNlZCBpdGVtcyB3aGVuIGl0cyBsaW1pdCBpc1xuXHQgKiByZWFjaGVkLiBUaGlzIGlzIGEgYmFyZS1ib25lIHZlcnNpb24gb2Zcblx0ICogUmFzbXVzIEFuZGVyc3NvbidzIGpzLWxydTpcblx0ICpcblx0ICogICBodHRwczovL2dpdGh1Yi5jb20vcnNtcy9qcy1scnVcblx0ICpcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGxpbWl0XG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKi9cblxuXHRmdW5jdGlvbiBDYWNoZSAobGltaXQpIHtcblx0ICB0aGlzLnNpemUgPSAwXG5cdCAgdGhpcy5saW1pdCA9IGxpbWl0XG5cdCAgdGhpcy5oZWFkID0gdGhpcy50YWlsID0gdW5kZWZpbmVkXG5cdCAgdGhpcy5fa2V5bWFwID0ge31cblx0fVxuXG5cdHZhciBwID0gQ2FjaGUucHJvdG90eXBlXG5cblx0LyoqXG5cdCAqIFB1dCA8dmFsdWU+IGludG8gdGhlIGNhY2hlIGFzc29jaWF0ZWQgd2l0aCA8a2V5Pi5cblx0ICogUmV0dXJucyB0aGUgZW50cnkgd2hpY2ggd2FzIHJlbW92ZWQgdG8gbWFrZSByb29tIGZvclxuXHQgKiB0aGUgbmV3IGVudHJ5LiBPdGhlcndpc2UgdW5kZWZpbmVkIGlzIHJldHVybmVkLlxuXHQgKiAoaS5lLiBpZiB0aGVyZSB3YXMgZW5vdWdoIHJvb20gYWxyZWFkeSkuXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcblx0ICogQHBhcmFtIHsqfSB2YWx1ZVxuXHQgKiBAcmV0dXJuIHtFbnRyeXx1bmRlZmluZWR9XG5cdCAqL1xuXG5cdHAucHV0ID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblx0ICB2YXIgZW50cnkgPSB7XG5cdCAgICBrZXk6a2V5LFxuXHQgICAgdmFsdWU6dmFsdWVcblx0ICB9XG5cdCAgdGhpcy5fa2V5bWFwW2tleV0gPSBlbnRyeVxuXHQgIGlmICh0aGlzLnRhaWwpIHtcblx0ICAgIHRoaXMudGFpbC5uZXdlciA9IGVudHJ5XG5cdCAgICBlbnRyeS5vbGRlciA9IHRoaXMudGFpbFxuXHQgIH0gZWxzZSB7XG5cdCAgICB0aGlzLmhlYWQgPSBlbnRyeVxuXHQgIH1cblx0ICB0aGlzLnRhaWwgPSBlbnRyeVxuXHQgIGlmICh0aGlzLnNpemUgPT09IHRoaXMubGltaXQpIHtcblx0ICAgIHJldHVybiB0aGlzLnNoaWZ0KClcblx0ICB9IGVsc2Uge1xuXHQgICAgdGhpcy5zaXplKytcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogUHVyZ2UgdGhlIGxlYXN0IHJlY2VudGx5IHVzZWQgKG9sZGVzdCkgZW50cnkgZnJvbSB0aGVcblx0ICogY2FjaGUuIFJldHVybnMgdGhlIHJlbW92ZWQgZW50cnkgb3IgdW5kZWZpbmVkIGlmIHRoZVxuXHQgKiBjYWNoZSB3YXMgZW1wdHkuXG5cdCAqL1xuXG5cdHAuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgdmFyIGVudHJ5ID0gdGhpcy5oZWFkXG5cdCAgaWYgKGVudHJ5KSB7XG5cdCAgICB0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV3ZXJcblx0ICAgIHRoaXMuaGVhZC5vbGRlciA9IHVuZGVmaW5lZFxuXHQgICAgZW50cnkubmV3ZXIgPSBlbnRyeS5vbGRlciA9IHVuZGVmaW5lZFxuXHQgICAgdGhpcy5fa2V5bWFwW2VudHJ5LmtleV0gPSB1bmRlZmluZWRcblx0ICB9XG5cdCAgcmV0dXJuIGVudHJ5XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGFuZCByZWdpc3RlciByZWNlbnQgdXNlIG9mIDxrZXk+LiBSZXR1cm5zIHRoZSB2YWx1ZVxuXHQgKiBhc3NvY2lhdGVkIHdpdGggPGtleT4gb3IgdW5kZWZpbmVkIGlmIG5vdCBpbiBjYWNoZS5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleVxuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IHJldHVybkVudHJ5XG5cdCAqIEByZXR1cm4ge0VudHJ5fCp9XG5cdCAqL1xuXG5cdHAuZ2V0ID0gZnVuY3Rpb24gKGtleSwgcmV0dXJuRW50cnkpIHtcblx0ICB2YXIgZW50cnkgPSB0aGlzLl9rZXltYXBba2V5XVxuXHQgIGlmIChlbnRyeSA9PT0gdW5kZWZpbmVkKSByZXR1cm5cblx0ICBpZiAoZW50cnkgPT09IHRoaXMudGFpbCkge1xuXHQgICAgcmV0dXJuIHJldHVybkVudHJ5XG5cdCAgICAgID8gZW50cnlcblx0ICAgICAgOiBlbnRyeS52YWx1ZVxuXHQgIH1cblx0ICAvLyBIRUFELS0tLS0tLS0tLS0tLS1UQUlMXG5cdCAgLy8gICA8Lm9sZGVyICAgLm5ld2VyPlxuXHQgIC8vICA8LS0tIGFkZCBkaXJlY3Rpb24gLS1cblx0ICAvLyAgIEEgIEIgIEMgIDxEPiAgRVxuXHQgIGlmIChlbnRyeS5uZXdlcikge1xuXHQgICAgaWYgKGVudHJ5ID09PSB0aGlzLmhlYWQpIHtcblx0ICAgICAgdGhpcy5oZWFkID0gZW50cnkubmV3ZXJcblx0ICAgIH1cblx0ICAgIGVudHJ5Lm5ld2VyLm9sZGVyID0gZW50cnkub2xkZXIgLy8gQyA8LS0gRS5cblx0ICB9XG5cdCAgaWYgKGVudHJ5Lm9sZGVyKSB7XG5cdCAgICBlbnRyeS5vbGRlci5uZXdlciA9IGVudHJ5Lm5ld2VyIC8vIEMuIC0tPiBFXG5cdCAgfVxuXHQgIGVudHJ5Lm5ld2VyID0gdW5kZWZpbmVkIC8vIEQgLS14XG5cdCAgZW50cnkub2xkZXIgPSB0aGlzLnRhaWwgLy8gRC4gLS0+IEVcblx0ICBpZiAodGhpcy50YWlsKSB7XG5cdCAgICB0aGlzLnRhaWwubmV3ZXIgPSBlbnRyeSAvLyBFLiA8LS0gRFxuXHQgIH1cblx0ICB0aGlzLnRhaWwgPSBlbnRyeVxuXHQgIHJldHVybiByZXR1cm5FbnRyeVxuXHQgICAgPyBlbnRyeVxuXHQgICAgOiBlbnRyeS52YWx1ZVxuXHR9XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBDYWNoZVxuXG4vKioqLyB9LFxuLyogNTMgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXHR2YXIgYWRkQ2xhc3MgPSBfLmFkZENsYXNzXG5cdHZhciByZW1vdmVDbGFzcyA9IF8ucmVtb3ZlQ2xhc3Ncblx0dmFyIHRyYW5zRHVyYXRpb25Qcm9wID0gXy50cmFuc2l0aW9uUHJvcCArICdEdXJhdGlvbidcblx0dmFyIGFuaW1EdXJhdGlvblByb3AgPSBfLmFuaW1hdGlvblByb3AgKyAnRHVyYXRpb24nXG5cblx0dmFyIHF1ZXVlID0gW11cblx0dmFyIHF1ZXVlZCA9IGZhbHNlXG5cblx0LyoqXG5cdCAqIFB1c2ggYSBqb2IgaW50byB0aGUgdHJhbnNpdGlvbiBxdWV1ZSwgd2hpY2ggaXMgdG8gYmVcblx0ICogZXhlY3V0ZWQgb24gbmV4dCBmcmFtZS5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbCAgICAtIHRhcmdldCBlbGVtZW50XG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaXIgICAgLSAxOiBlbnRlciwgLTE6IGxlYXZlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9wICAgLSB0aGUgYWN0dWFsIGRvbSBvcGVyYXRpb25cblx0ICogQHBhcmFtIHtTdHJpbmd9IGNscyAgICAtIHRoZSBjbGFzc05hbWUgdG8gcmVtb3ZlIHdoZW4gdGhlXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uIGlzIGRvbmUuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl0gLSB1c2VyIHN1cHBsaWVkIGNhbGxiYWNrLlxuXHQgKi9cblxuXHRmdW5jdGlvbiBwdXNoIChlbCwgZGlyLCBvcCwgY2xzLCBjYikge1xuXHQgIHF1ZXVlLnB1c2goe1xuXHQgICAgZWwgIDogZWwsXG5cdCAgICBkaXIgOiBkaXIsXG5cdCAgICBjYiAgOiBjYixcblx0ICAgIGNscyA6IGNscyxcblx0ICAgIG9wICA6IG9wXG5cdCAgfSlcblx0ICBpZiAoIXF1ZXVlZCkge1xuXHQgICAgcXVldWVkID0gdHJ1ZVxuXHQgICAgXy5uZXh0VGljayhmbHVzaClcblx0ICB9XG5cdH1cblxuXHQvKipcblx0ICogRmx1c2ggdGhlIHF1ZXVlLCBhbmQgZG8gb25lIGZvcmNlZCByZWZsb3cgYmVmb3JlXG5cdCAqIHRyaWdnZXJpbmcgdHJhbnNpdGlvbnMuXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGZsdXNoICgpIHtcblx0ICAvKiBqc2hpbnQgdW51c2VkOiBmYWxzZSAqL1xuXHQgIHZhciBmID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm9mZnNldEhlaWdodFxuXHQgIHF1ZXVlLmZvckVhY2gocnVuKVxuXHQgIHF1ZXVlID0gW11cblx0ICBxdWV1ZWQgPSBmYWxzZVxuXHR9XG5cblx0LyoqXG5cdCAqIFJ1biBhIHRyYW5zaXRpb24gam9iLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gam9iXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIHJ1biAoam9iKSB7XG5cblx0ICB2YXIgZWwgPSBqb2IuZWxcblx0ICB2YXIgZGF0YSA9IGVsLl9fdl90cmFuc1xuXHQgIHZhciBjbHMgPSBqb2IuY2xzXG5cdCAgdmFyIGNiID0gam9iLmNiXG5cdCAgdmFyIG9wID0gam9iLm9wXG5cdCAgdmFyIHRyYW5zaXRpb25UeXBlID0gZ2V0VHJhbnNpdGlvblR5cGUoZWwsIGRhdGEsIGNscylcblxuXHQgIGlmIChqb2IuZGlyID4gMCkgeyAvLyBFTlRFUlxuXHQgICAgaWYgKHRyYW5zaXRpb25UeXBlID09PSAxKSB7XG5cdCAgICAgIC8vIHRyaWdnZXIgdHJhbnNpdGlvbiBieSByZW1vdmluZyBlbnRlciBjbGFzc1xuXHQgICAgICByZW1vdmVDbGFzcyhlbCwgY2xzKVxuXHQgICAgICAvLyBvbmx5IG5lZWQgdG8gbGlzdGVuIGZvciB0cmFuc2l0aW9uZW5kIGlmIHRoZXJlJ3Ncblx0ICAgICAgLy8gYSB1c2VyIGNhbGxiYWNrXG5cdCAgICAgIGlmIChjYikgc2V0dXBUcmFuc2l0aW9uQ2IoXy50cmFuc2l0aW9uRW5kRXZlbnQpXG5cdCAgICB9IGVsc2UgaWYgKHRyYW5zaXRpb25UeXBlID09PSAyKSB7XG5cdCAgICAgIC8vIGFuaW1hdGlvbnMgYXJlIHRyaWdnZXJlZCB3aGVuIGNsYXNzIGlzIGFkZGVkXG5cdCAgICAgIC8vIHNvIHdlIGp1c3QgbGlzdGVuIGZvciBhbmltYXRpb25lbmQgdG8gcmVtb3ZlIGl0LlxuXHQgICAgICBzZXR1cFRyYW5zaXRpb25DYihfLmFuaW1hdGlvbkVuZEV2ZW50LCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsIGNscylcblx0ICAgICAgfSlcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIG5vIHRyYW5zaXRpb24gYXBwbGljYWJsZVxuXHQgICAgICByZW1vdmVDbGFzcyhlbCwgY2xzKVxuXHQgICAgICBpZiAoY2IpIGNiKClcblx0ICAgIH1cblx0ICB9IGVsc2UgeyAvLyBMRUFWRVxuXHQgICAgaWYgKHRyYW5zaXRpb25UeXBlKSB7XG5cdCAgICAgIC8vIGxlYXZlIHRyYW5zaXRpb25zL2FuaW1hdGlvbnMgYXJlIGJvdGggdHJpZ2dlcmVkXG5cdCAgICAgIC8vIGJ5IGFkZGluZyB0aGUgY2xhc3MsIGp1c3QgcmVtb3ZlIGl0IG9uIGVuZCBldmVudC5cblx0ICAgICAgdmFyIGV2ZW50ID0gdHJhbnNpdGlvblR5cGUgPT09IDFcblx0ICAgICAgICA/IF8udHJhbnNpdGlvbkVuZEV2ZW50XG5cdCAgICAgICAgOiBfLmFuaW1hdGlvbkVuZEV2ZW50XG5cdCAgICAgIHNldHVwVHJhbnNpdGlvbkNiKGV2ZW50LCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgb3AoKVxuXHQgICAgICAgIHJlbW92ZUNsYXNzKGVsLCBjbHMpXG5cdCAgICAgIH0pXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICBvcCgpXG5cdCAgICAgIHJlbW92ZUNsYXNzKGVsLCBjbHMpXG5cdCAgICAgIGlmIChjYikgY2IoKVxuXHQgICAgfVxuXHQgIH1cblxuXHQgIC8qKlxuXHQgICAqIFNldCB1cCBhIHRyYW5zaXRpb24gZW5kIGNhbGxiYWNrLCBzdG9yZSB0aGUgY2FsbGJhY2tcblx0ICAgKiBvbiB0aGUgZWxlbWVudCdzIF9fdl90cmFucyBkYXRhIG9iamVjdCwgc28gd2UgY2FuXG5cdCAgICogY2xlYW4gaXQgdXAgaWYgYW5vdGhlciB0cmFuc2l0aW9uIGlzIHRyaWdnZXJlZCBiZWZvcmVcblx0ICAgKiB0aGUgY2FsbGJhY2sgaXMgZmlyZWQuXG5cdCAgICpcblx0ICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcblx0ICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2xlYW51cEZuXVxuXHQgICAqL1xuXG5cdCAgZnVuY3Rpb24gc2V0dXBUcmFuc2l0aW9uQ2IgKGV2ZW50LCBjbGVhbnVwRm4pIHtcblx0ICAgIGRhdGEuZXZlbnQgPSBldmVudFxuXHQgICAgdmFyIG9uRW5kID0gZGF0YS5jYWxsYmFjayA9IGZ1bmN0aW9uIHRyYW5zaXRpb25DYiAoZSkge1xuXHQgICAgICBpZiAoZS50YXJnZXQgPT09IGVsKSB7XG5cdCAgICAgICAgXy5vZmYoZWwsIGV2ZW50LCBvbkVuZClcblx0ICAgICAgICBkYXRhLmV2ZW50ID0gZGF0YS5jYWxsYmFjayA9IG51bGxcblx0ICAgICAgICBpZiAoY2xlYW51cEZuKSBjbGVhbnVwRm4oKVxuXHQgICAgICAgIGlmIChjYikgY2IoKVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgICBfLm9uKGVsLCBldmVudCwgb25FbmQpXG5cdCAgfVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBhbiBlbGVtZW50J3MgdHJhbnNpdGlvbiB0eXBlIGJhc2VkIG9uIHRoZVxuXHQgKiBjYWxjdWxhdGVkIHN0eWxlc1xuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWVcblx0ICogQHJldHVybiB7TnVtYmVyfVxuXHQgKiAgICAgICAgIDEgLSB0cmFuc2l0aW9uXG5cdCAqICAgICAgICAgMiAtIGFuaW1hdGlvblxuXHQgKi9cblxuXHRmdW5jdGlvbiBnZXRUcmFuc2l0aW9uVHlwZSAoZWwsIGRhdGEsIGNsYXNzTmFtZSkge1xuXHQgIHZhciB0eXBlID0gZGF0YS5jYWNoZSAmJiBkYXRhLmNhY2hlW2NsYXNzTmFtZV1cblx0ICBpZiAodHlwZSkgcmV0dXJuIHR5cGVcblx0ICB2YXIgaW5saW5lU3R5bGVzID0gZWwuc3R5bGVcblx0ICB2YXIgY29tcHV0ZWRTdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcblx0ICB2YXIgdHJhbnNEdXJhdGlvbiA9XG5cdCAgICBpbmxpbmVTdHlsZXNbdHJhbnNEdXJhdGlvblByb3BdIHx8XG5cdCAgICBjb21wdXRlZFN0eWxlc1t0cmFuc0R1cmF0aW9uUHJvcF1cblx0ICBpZiAodHJhbnNEdXJhdGlvbiAmJiB0cmFuc0R1cmF0aW9uICE9PSAnMHMnKSB7XG5cdCAgICB0eXBlID0gMVxuXHQgIH0gZWxzZSB7XG5cdCAgICB2YXIgYW5pbUR1cmF0aW9uID1cblx0ICAgICAgaW5saW5lU3R5bGVzW2FuaW1EdXJhdGlvblByb3BdIHx8XG5cdCAgICAgIGNvbXB1dGVkU3R5bGVzW2FuaW1EdXJhdGlvblByb3BdXG5cdCAgICBpZiAoYW5pbUR1cmF0aW9uICYmIGFuaW1EdXJhdGlvbiAhPT0gJzBzJykge1xuXHQgICAgICB0eXBlID0gMlxuXHQgICAgfVxuXHQgIH1cblx0ICBpZiAodHlwZSkge1xuXHQgICAgaWYgKCFkYXRhLmNhY2hlKSBkYXRhLmNhY2hlID0ge31cblx0ICAgIGRhdGEuY2FjaGVbY2xhc3NOYW1lXSA9IHR5cGVcblx0ICB9XG5cdCAgcmV0dXJuIHR5cGVcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBseSBDU1MgdHJhbnNpdGlvbiB0byBhbiBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaXJlY3Rpb24gLSAxOiBlbnRlciwgLTE6IGxlYXZlXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IG9wIC0gdGhlIGFjdHVhbCBET00gb3BlcmF0aW9uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIC0gdGFyZ2V0IGVsZW1lbnQncyB0cmFuc2l0aW9uIGRhdGFcblx0ICovXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZWwsIGRpcmVjdGlvbiwgb3AsIGRhdGEsIGNiKSB7XG5cdCAgdmFyIHByZWZpeCA9IGRhdGEuaWQgfHwgJ3YnXG5cdCAgdmFyIGVudGVyQ2xhc3MgPSBwcmVmaXggKyAnLWVudGVyJ1xuXHQgIHZhciBsZWF2ZUNsYXNzID0gcHJlZml4ICsgJy1sZWF2ZSdcblx0ICAvLyBjbGVhbiB1cCBwb3RlbnRpYWwgcHJldmlvdXMgdW5maW5pc2hlZCB0cmFuc2l0aW9uXG5cdCAgaWYgKGRhdGEuY2FsbGJhY2spIHtcblx0ICAgIF8ub2ZmKGVsLCBkYXRhLmV2ZW50LCBkYXRhLmNhbGxiYWNrKVxuXHQgICAgcmVtb3ZlQ2xhc3MoZWwsIGVudGVyQ2xhc3MpXG5cdCAgICByZW1vdmVDbGFzcyhlbCwgbGVhdmVDbGFzcylcblx0ICAgIGRhdGEuZXZlbnQgPSBkYXRhLmNhbGxiYWNrID0gbnVsbFxuXHQgIH1cblx0ICBpZiAoZGlyZWN0aW9uID4gMCkgeyAvLyBlbnRlclxuXHQgICAgYWRkQ2xhc3MoZWwsIGVudGVyQ2xhc3MpXG5cdCAgICBvcCgpXG5cdCAgICBwdXNoKGVsLCBkaXJlY3Rpb24sIG51bGwsIGVudGVyQ2xhc3MsIGNiKVxuXHQgIH0gZWxzZSB7IC8vIGxlYXZlXG5cdCAgICBhZGRDbGFzcyhlbCwgbGVhdmVDbGFzcylcblx0ICAgIHB1c2goZWwsIGRpcmVjdGlvbiwgb3AsIGxlYXZlQ2xhc3MsIGNiKVxuXHQgIH1cblx0fVxuXG4vKioqLyB9LFxuLyogNTQgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdC8qKlxuXHQgKiBBcHBseSBKYXZhU2NyaXB0IGVudGVyL2xlYXZlIGZ1bmN0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBlbFxuXHQgKiBAcGFyYW0ge051bWJlcn0gZGlyZWN0aW9uIC0gMTogZW50ZXIsIC0xOiBsZWF2ZVxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcCAtIHRoZSBhY3R1YWwgRE9NIG9wZXJhdGlvblxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAtIHRhcmdldCBlbGVtZW50J3MgdHJhbnNpdGlvbiBkYXRhXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBkZWYgLSB0cmFuc2l0aW9uIGRlZmluaXRpb24gb2JqZWN0XG5cdCAqIEBwYXJhbSB7VnVlfSB2bSAtIHRoZSBvd25lciB2bSBvZiB0aGUgZWxlbWVudFxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG5cdCAqL1xuXG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsLCBkaXJlY3Rpb24sIG9wLCBkYXRhLCBkZWYsIHZtLCBjYikge1xuXHQgIGlmIChkYXRhLmNhbmNlbCkge1xuXHQgICAgZGF0YS5jYW5jZWwoKVxuXHQgICAgZGF0YS5jYW5jZWwgPSBudWxsXG5cdCAgfVxuXHQgIGlmIChkaXJlY3Rpb24gPiAwKSB7IC8vIGVudGVyXG5cdCAgICBpZiAoZGVmLmJlZm9yZUVudGVyKSB7XG5cdCAgICAgIGRlZi5iZWZvcmVFbnRlci5jYWxsKHZtLCBlbClcblx0ICAgIH1cblx0ICAgIG9wKClcblx0ICAgIGlmIChkZWYuZW50ZXIpIHtcblx0ICAgICAgZGF0YS5jYW5jZWwgPSBkZWYuZW50ZXIuY2FsbCh2bSwgZWwsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICBkYXRhLmNhbmNlbCA9IG51bGxcblx0ICAgICAgICBpZiAoY2IpIGNiKClcblx0ICAgICAgfSlcblx0ICAgIH0gZWxzZSBpZiAoY2IpIHtcblx0ICAgICAgY2IoKVxuXHQgICAgfVxuXHQgIH0gZWxzZSB7IC8vIGxlYXZlXG5cdCAgICBpZiAoZGVmLmxlYXZlKSB7XG5cdCAgICAgIGRhdGEuY2FuY2VsID0gZGVmLmxlYXZlLmNhbGwodm0sIGVsLCBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgZGF0YS5jYW5jZWwgPSBudWxsXG5cdCAgICAgICAgb3AoKVxuXHQgICAgICAgIGlmIChjYikgY2IoKVxuXHQgICAgICB9KVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgb3AoKVxuXHQgICAgICBpZiAoY2IpIGNiKClcblx0ICAgIH1cblx0ICB9XG5cdH1cblxuLyoqKi8gfSxcbi8qIDU1ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblxuXHRtb2R1bGUuZXhwb3J0cyA9IHtcblxuXHQgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHZhciBzZWxmID0gdGhpc1xuXHQgICAgdmFyIGVsID0gdGhpcy5lbFxuXG5cdCAgICAvLyBjaGVjayBwYXJhbXNcblx0ICAgIC8vIC0gbGF6eTogdXBkYXRlIG1vZGVsIG9uIFwiY2hhbmdlXCIgaW5zdGVhZCBvZiBcImlucHV0XCJcblx0ICAgIHZhciBsYXp5ID0gZWwuaGFzQXR0cmlidXRlKCdsYXp5Jylcblx0ICAgIGlmIChsYXp5KSB7XG5cdCAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSgnbGF6eScpXG5cdCAgICB9XG5cdCAgICAvLyAtIG51bWJlcjogY2FzdCB2YWx1ZSBpbnRvIG51bWJlciB3aGVuIHVwZGF0aW5nIG1vZGVsLlxuXHQgICAgdmFyIG51bWJlciA9XG5cdCAgICAgIGVsLmhhc0F0dHJpYnV0ZSgnbnVtYmVyJykgfHxcblx0ICAgICAgZWwudHlwZSA9PT0gJ251bWJlcidcblx0ICAgIGlmIChudW1iZXIpIHtcblx0ICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdudW1iZXInKVxuXHQgICAgfVxuXG5cdCAgICAvLyBoYW5kbGUgY29tcG9zaXRpb24gZXZlbnRzLlxuXHQgICAgLy8gaHR0cDovL2Jsb2cuZXZhbnlvdS5tZS8yMDE0LzAxLzAzL2NvbXBvc2l0aW9uLWV2ZW50L1xuXHQgICAgdmFyIGNwTG9ja2VkID0gZmFsc2Vcblx0ICAgIHRoaXMuY3BMb2NrID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICBjcExvY2tlZCA9IHRydWVcblx0ICAgIH1cblx0ICAgIHRoaXMuY3BVbmxvY2sgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIGNwTG9ja2VkID0gZmFsc2Vcblx0ICAgICAgLy8gaW4gSUUxMSB0aGUgXCJjb21wb3NpdGlvbmVuZFwiIGV2ZW50IGZpcmVzIEFGVEVSXG5cdCAgICAgIC8vIHRoZSBcImlucHV0XCIgZXZlbnQsIHNvIHRoZSBpbnB1dCBoYW5kbGVyIGlzIGJsb2NrZWRcblx0ICAgICAgLy8gYXQgdGhlIGVuZC4uLiBoYXZlIHRvIGNhbGwgaXQgaGVyZS5cblx0ICAgICAgc2V0KClcblx0ICAgIH1cblx0ICAgIF8ub24oZWwsJ2NvbXBvc2l0aW9uc3RhcnQnLCB0aGlzLmNwTG9jaylcblx0ICAgIF8ub24oZWwsJ2NvbXBvc2l0aW9uZW5kJywgdGhpcy5jcFVubG9jaylcblxuXHQgICAgLy8gc2hhcmVkIHNldHRlclxuXHQgICAgZnVuY3Rpb24gc2V0ICgpIHtcblx0ICAgICAgc2VsZi5zZXQoXG5cdCAgICAgICAgbnVtYmVyID8gXy50b051bWJlcihlbC52YWx1ZSkgOiBlbC52YWx1ZSxcblx0ICAgICAgICB0cnVlXG5cdCAgICAgIClcblx0ICAgIH1cblxuXHQgICAgLy8gaWYgdGhlIGRpcmVjdGl2ZSBoYXMgZmlsdGVycywgd2UgbmVlZCB0b1xuXHQgICAgLy8gcmVjb3JkIGN1cnNvciBwb3NpdGlvbiBhbmQgcmVzdG9yZSBpdCBhZnRlciB1cGRhdGluZ1xuXHQgICAgLy8gdGhlIGlucHV0IHdpdGggdGhlIGZpbHRlcmVkIHZhbHVlLlxuXHQgICAgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uIHRleHRJbnB1dExpc3RlbmVyICgpIHtcblx0ICAgICAgaWYgKGNwTG9ja2VkKSByZXR1cm5cblx0ICAgICAgdmFyIGNoYXJzT2Zmc2V0XG5cdCAgICAgIC8vIHNvbWUgSFRNTDUgaW5wdXQgdHlwZXMgdGhyb3cgZXJyb3IgaGVyZVxuXHQgICAgICB0cnkge1xuXHQgICAgICAgIC8vIHJlY29yZCBob3cgbWFueSBjaGFycyBmcm9tIHRoZSBlbmQgb2YgaW5wdXRcblx0ICAgICAgICAvLyB0aGUgY3Vyc29yIHdhcyBhdFxuXHQgICAgICAgIGNoYXJzT2Zmc2V0ID0gZWwudmFsdWUubGVuZ3RoIC0gZWwuc2VsZWN0aW9uU3RhcnRcblx0ICAgICAgfSBjYXRjaCAoZSkge31cblx0ICAgICAgc2V0KClcblx0ICAgICAgLy8gZm9yY2UgYSB2YWx1ZSB1cGRhdGUsIGJlY2F1c2UgaW5cblx0ICAgICAgLy8gY2VydGFpbiBjYXNlcyB0aGUgd3JpdGUgZmlsdGVycyBvdXRwdXQgdGhlIHNhbWVcblx0ICAgICAgLy8gcmVzdWx0IGZvciBkaWZmZXJlbnQgaW5wdXQgdmFsdWVzLCBhbmQgdGhlIE9ic2VydmVyXG5cdCAgICAgIC8vIHNldCBldmVudHMgd29uJ3QgYmUgdHJpZ2dlcmVkLlxuXHQgICAgICBfLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICB2YXIgbmV3VmFsID0gc2VsZi5fd2F0Y2hlci52YWx1ZVxuXHQgICAgICAgIHNlbGYudXBkYXRlKG5ld1ZhbClcblx0ICAgICAgICBpZiAoY2hhcnNPZmZzZXQgIT0gbnVsbCkge1xuXHQgICAgICAgICAgdmFyIGN1cnNvclBvcyA9XG5cdCAgICAgICAgICAgIF8udG9TdHJpbmcobmV3VmFsKS5sZW5ndGggLSBjaGFyc09mZnNldFxuXHQgICAgICAgICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UoY3Vyc29yUG9zLCBjdXJzb3JQb3MpXG5cdCAgICAgICAgfVxuXHQgICAgICB9KVxuXHQgICAgfVxuXHQgICAgdGhpcy5ldmVudCA9IGxhenkgPyAnY2hhbmdlJyA6ICdpbnB1dCdcblx0ICAgIF8ub24oZWwsIHRoaXMuZXZlbnQsIHRoaXMubGlzdGVuZXIpXG5cblx0ICAgIC8vIElFOSBkb2Vzbid0IGZpcmUgaW5wdXQgZXZlbnQgb24gYmFja3NwYWNlL2RlbC9jdXRcblx0ICAgIGlmICghbGF6eSAmJiBfLmlzSUU5KSB7XG5cdCAgICAgIHRoaXMub25DdXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgXy5uZXh0VGljayhzZWxmLmxpc3RlbmVyKVxuXHQgICAgICB9XG5cdCAgICAgIHRoaXMub25EZWwgPSBmdW5jdGlvbiAoZSkge1xuXHQgICAgICAgIGlmIChlLmtleUNvZGUgPT09IDQ2IHx8IGUua2V5Q29kZSA9PT0gOCkge1xuXHQgICAgICAgICAgc2VsZi5saXN0ZW5lcigpXG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICAgIF8ub24oZWwsICdjdXQnLCB0aGlzLm9uQ3V0KVxuXHQgICAgICBfLm9uKGVsLCAna2V5dXAnLCB0aGlzLm9uRGVsKVxuXHQgICAgfVxuXG5cdCAgICAvLyBzZXQgaW5pdGlhbCB2YWx1ZSBpZiBwcmVzZW50XG5cdCAgICBpZiAoXG5cdCAgICAgIGVsLmhhc0F0dHJpYnV0ZSgndmFsdWUnKSB8fFxuXHQgICAgICAoZWwudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJyAmJiBlbC52YWx1ZS50cmltKCkpXG5cdCAgICApIHtcblx0ICAgICAgdGhpcy5faW5pdFZhbHVlID0gbnVtYmVyXG5cdCAgICAgICAgPyBfLnRvTnVtYmVyKGVsLnZhbHVlKVxuXHQgICAgICAgIDogZWwudmFsdWVcblx0ICAgIH1cblx0ICB9LFxuXG5cdCAgdXBkYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICAgIHRoaXMuZWwudmFsdWUgPSBfLnRvU3RyaW5nKHZhbHVlKVxuXHQgIH0sXG5cblx0ICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHZhciBlbCA9IHRoaXMuZWxcblx0ICAgIF8ub2ZmKGVsLCB0aGlzLmV2ZW50LCB0aGlzLmxpc3RlbmVyKVxuXHQgICAgXy5vZmYoZWwsJ2NvbXBvc2l0aW9uc3RhcnQnLCB0aGlzLmNwTG9jaylcblx0ICAgIF8ub2ZmKGVsLCdjb21wb3NpdGlvbmVuZCcsIHRoaXMuY3BVbmxvY2spXG5cdCAgICBpZiAodGhpcy5vbkN1dCkge1xuXHQgICAgICBfLm9mZihlbCwnY3V0JywgdGhpcy5vbkN1dClcblx0ICAgICAgXy5vZmYoZWwsJ2tleXVwJywgdGhpcy5vbkRlbClcblx0ICAgIH1cblx0ICB9XG5cblx0fVxuXG4vKioqLyB9LFxuLyogNTYgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdHZhciBfID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKVxuXG5cdG1vZHVsZS5leHBvcnRzID0ge1xuXG5cdCAgYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgdmFyIHNlbGYgPSB0aGlzXG5cdCAgICB2YXIgZWwgPSB0aGlzLmVsXG5cdCAgICB0aGlzLmxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICBzZWxmLnNldChlbC52YWx1ZSwgdHJ1ZSlcblx0ICAgIH1cblx0ICAgIF8ub24oZWwsICdjaGFuZ2UnLCB0aGlzLmxpc3RlbmVyKVxuXHQgICAgaWYgKGVsLmNoZWNrZWQpIHtcblx0ICAgICAgdGhpcy5faW5pdFZhbHVlID0gZWwudmFsdWVcblx0ICAgIH1cblx0ICB9LFxuXG5cdCAgdXBkYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICAgIC8qIGpzaGludCBlcWVxZXE6IGZhbHNlICovXG5cdCAgICB0aGlzLmVsLmNoZWNrZWQgPSB2YWx1ZSA9PSB0aGlzLmVsLnZhbHVlXG5cdCAgfSxcblxuXHQgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgXy5vZmYodGhpcy5lbCwgJ2NoYW5nZScsIHRoaXMubGlzdGVuZXIpXG5cdCAgfVxuXG5cdH1cblxuLyoqKi8gfSxcbi8qIDU3ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblx0dmFyIFdhdGNoZXIgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIxKVxuXG5cdG1vZHVsZS5leHBvcnRzID0ge1xuXG5cdCAgYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgdmFyIHNlbGYgPSB0aGlzXG5cdCAgICB2YXIgZWwgPSB0aGlzLmVsXG5cdCAgICAvLyBjaGVjayBvcHRpb25zIHBhcmFtXG5cdCAgICB2YXIgb3B0aW9uc1BhcmFtID0gZWwuZ2V0QXR0cmlidXRlKCdvcHRpb25zJylcblx0ICAgIGlmIChvcHRpb25zUGFyYW0pIHtcblx0ICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdvcHRpb25zJylcblx0ICAgICAgaW5pdE9wdGlvbnMuY2FsbCh0aGlzLCBvcHRpb25zUGFyYW0pXG5cdCAgICB9XG5cdCAgICB0aGlzLm11bHRpcGxlID0gZWwuaGFzQXR0cmlidXRlKCdtdWx0aXBsZScpXG5cdCAgICB0aGlzLmxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuXHQgICAgICB2YXIgdmFsdWUgPSBzZWxmLm11bHRpcGxlXG5cdCAgICAgICAgPyBnZXRNdWx0aVZhbHVlKGVsKVxuXHQgICAgICAgIDogZWwudmFsdWVcblx0ICAgICAgc2VsZi5zZXQodmFsdWUsIHRydWUpXG5cdCAgICB9XG5cdCAgICBfLm9uKGVsLCAnY2hhbmdlJywgdGhpcy5saXN0ZW5lcilcblx0ICAgIGNoZWNrSW5pdGlhbFZhbHVlLmNhbGwodGhpcylcblx0ICB9LFxuXG5cdCAgdXBkYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcblx0ICAgIC8qIGpzaGludCBlcWVxZXE6IGZhbHNlICovXG5cdCAgICB2YXIgZWwgPSB0aGlzLmVsXG5cdCAgICBlbC5zZWxlY3RlZEluZGV4ID0gLTFcblx0ICAgIHZhciBtdWx0aSA9IHRoaXMubXVsdGlwbGUgJiYgXy5pc0FycmF5KHZhbHVlKVxuXHQgICAgdmFyIG9wdGlvbnMgPSBlbC5vcHRpb25zXG5cdCAgICB2YXIgaSA9IG9wdGlvbnMubGVuZ3RoXG5cdCAgICB2YXIgb3B0aW9uXG5cdCAgICB3aGlsZSAoaS0tKSB7XG5cdCAgICAgIG9wdGlvbiA9IG9wdGlvbnNbaV1cblx0ICAgICAgb3B0aW9uLnNlbGVjdGVkID0gbXVsdGlcblx0ICAgICAgICA/IGluZGV4T2YodmFsdWUsIG9wdGlvbi52YWx1ZSkgPiAtMVxuXHQgICAgICAgIDogdmFsdWUgPT0gb3B0aW9uLnZhbHVlXG5cdCAgICB9XG5cdCAgfSxcblxuXHQgIHVuYmluZDogZnVuY3Rpb24gKCkge1xuXHQgICAgXy5vZmYodGhpcy5lbCwgJ2NoYW5nZScsIHRoaXMubGlzdGVuZXIpXG5cdCAgICBpZiAodGhpcy5vcHRpb25XYXRjaGVyKSB7XG5cdCAgICAgIHRoaXMub3B0aW9uV2F0Y2hlci50ZWFyZG93bigpXG5cdCAgICB9XG5cdCAgfVxuXG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSB0aGUgb3B0aW9uIGxpc3QgZnJvbSB0aGUgcGFyYW0uXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBleHByZXNzaW9uXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGluaXRPcHRpb25zIChleHByZXNzaW9uKSB7XG5cdCAgdmFyIHNlbGYgPSB0aGlzXG5cdCAgZnVuY3Rpb24gb3B0aW9uVXBkYXRlV2F0Y2hlciAodmFsdWUpIHtcblx0ICAgIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG5cdCAgICAgIHNlbGYuZWwuaW5uZXJIVE1MID0gJydcblx0ICAgICAgYnVpbGRPcHRpb25zKHNlbGYuZWwsIHZhbHVlKVxuXHQgICAgICBpZiAoc2VsZi5fd2F0Y2hlcikge1xuXHQgICAgICAgIHNlbGYudXBkYXRlKHNlbGYuX3dhdGNoZXIudmFsdWUpXG5cdCAgICAgIH1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIF8ud2FybignSW52YWxpZCBvcHRpb25zIHZhbHVlIGZvciB2LW1vZGVsOiAnICsgdmFsdWUpXG5cdCAgICB9XG5cdCAgfVxuXHQgIHRoaXMub3B0aW9uV2F0Y2hlciA9IG5ldyBXYXRjaGVyKFxuXHQgICAgdGhpcy52bSxcblx0ICAgIGV4cHJlc3Npb24sXG5cdCAgICBvcHRpb25VcGRhdGVXYXRjaGVyXG5cdCAgKVxuXHQgIC8vIHVwZGF0ZSB3aXRoIGluaXRpYWwgdmFsdWVcblx0ICBvcHRpb25VcGRhdGVXYXRjaGVyKHRoaXMub3B0aW9uV2F0Y2hlci52YWx1ZSlcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCB1cCBvcHRpb24gZWxlbWVudHMuIElFOSBkb2Vzbid0IGNyZWF0ZSBvcHRpb25zXG5cdCAqIHdoZW4gc2V0dGluZyBpbm5lckhUTUwgb24gPHNlbGVjdD4gZWxlbWVudHMsIHNvIHdlIGhhdmVcblx0ICogdG8gdXNlIERPTSBBUEkgaGVyZS5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBwYXJlbnQgLSBhIDxzZWxlY3Q+IG9yIGFuIDxvcHRncm91cD5cblx0ICogQHBhcmFtIHtBcnJheX0gb3B0aW9uc1xuXHQgKi9cblxuXHRmdW5jdGlvbiBidWlsZE9wdGlvbnMgKHBhcmVudCwgb3B0aW9ucykge1xuXHQgIHZhciBvcCwgZWxcblx0ICBmb3IgKHZhciBpID0gMCwgbCA9IG9wdGlvbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdCAgICBvcCA9IG9wdGlvbnNbaV1cblx0ICAgIGlmICghb3Aub3B0aW9ucykge1xuXHQgICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpXG5cdCAgICAgIGlmICh0eXBlb2Ygb3AgPT09ICdzdHJpbmcnKSB7XG5cdCAgICAgICAgZWwudGV4dCA9IGVsLnZhbHVlID0gb3Bcblx0ICAgICAgfSBlbHNlIHtcblx0ICAgICAgICBlbC50ZXh0ID0gb3AudGV4dFxuXHQgICAgICAgIGVsLnZhbHVlID0gb3AudmFsdWVcblx0ICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRncm91cCcpXG5cdCAgICAgIGVsLmxhYmVsID0gb3AubGFiZWxcblx0ICAgICAgYnVpbGRPcHRpb25zKGVsLCBvcC5vcHRpb25zKVxuXHQgICAgfVxuXHQgICAgcGFyZW50LmFwcGVuZENoaWxkKGVsKVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayB0aGUgaW5pdGlhbCB2YWx1ZSBmb3Igc2VsZWN0ZWQgb3B0aW9ucy5cblx0ICovXG5cblx0ZnVuY3Rpb24gY2hlY2tJbml0aWFsVmFsdWUgKCkge1xuXHQgIHZhciBpbml0VmFsdWVcblx0ICB2YXIgb3B0aW9ucyA9IHRoaXMuZWwub3B0aW9uc1xuXHQgIGZvciAodmFyIGkgPSAwLCBsID0gb3B0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0ICAgIGlmIChvcHRpb25zW2ldLmhhc0F0dHJpYnV0ZSgnc2VsZWN0ZWQnKSkge1xuXHQgICAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuXHQgICAgICAgIChpbml0VmFsdWUgfHwgKGluaXRWYWx1ZSA9IFtdKSlcblx0ICAgICAgICAgIC5wdXNoKG9wdGlvbnNbaV0udmFsdWUpXG5cdCAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgaW5pdFZhbHVlID0gb3B0aW9uc1tpXS52YWx1ZVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfVxuXHQgIGlmIChpbml0VmFsdWUpIHtcblx0ICAgIHRoaXMuX2luaXRWYWx1ZSA9IGluaXRWYWx1ZVxuXHQgIH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgdG8gZXh0cmFjdCBhIHZhbHVlIGFycmF5IGZvciBzZWxlY3RbbXVsdGlwbGVdXG5cdCAqXG5cdCAqIEBwYXJhbSB7U2VsZWN0RWxlbWVudH0gZWxcblx0ICogQHJldHVybiB7QXJyYXl9XG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGdldE11bHRpVmFsdWUgKGVsKSB7XG5cdCAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXJcblx0ICAgIC5jYWxsKGVsLm9wdGlvbnMsIGZpbHRlclNlbGVjdGVkKVxuXHQgICAgLm1hcChnZXRPcHRpb25WYWx1ZSlcblx0fVxuXG5cdGZ1bmN0aW9uIGZpbHRlclNlbGVjdGVkIChvcCkge1xuXHQgIHJldHVybiBvcC5zZWxlY3RlZFxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0T3B0aW9uVmFsdWUgKG9wKSB7XG5cdCAgcmV0dXJuIG9wLnZhbHVlIHx8IG9wLnRleHRcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXRpdmUgQXJyYXkuaW5kZXhPZiB1c2VzIHN0cmljdCBlcXVhbCwgYnV0IGluIHRoaXNcblx0ICogY2FzZSB3ZSBuZWVkIHRvIG1hdGNoIHN0cmluZy9udW1iZXJzIHdpdGggc29mdCBlcXVhbC5cblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyXG5cdCAqIEBwYXJhbSB7Kn0gdmFsXG5cdCAqL1xuXG5cdGZ1bmN0aW9uIGluZGV4T2YgKGFyciwgdmFsKSB7XG5cdCAgLyoganNoaW50IGVxZXFlcTogZmFsc2UgKi9cblx0ICB2YXIgaSA9IGFyci5sZW5ndGhcblx0ICB3aGlsZSAoaS0tKSB7XG5cdCAgICBpZiAoYXJyW2ldID09IHZhbCkgcmV0dXJuIGlcblx0ICB9XG5cdCAgcmV0dXJuIC0xXG5cdH1cblxuLyoqKi8gfSxcbi8qIDU4ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblxuXHRtb2R1bGUuZXhwb3J0cyA9IHtcblxuXHQgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIHZhciBzZWxmID0gdGhpc1xuXHQgICAgdmFyIGVsID0gdGhpcy5lbFxuXHQgICAgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgc2VsZi5zZXQoZWwuY2hlY2tlZCwgdHJ1ZSlcblx0ICAgIH1cblx0ICAgIF8ub24oZWwsICdjaGFuZ2UnLCB0aGlzLmxpc3RlbmVyKVxuXHQgICAgaWYgKGVsLmNoZWNrZWQpIHtcblx0ICAgICAgdGhpcy5faW5pdFZhbHVlID0gZWwuY2hlY2tlZFxuXHQgICAgfVxuXHQgIH0sXG5cblx0ICB1cGRhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHQgICAgdGhpcy5lbC5jaGVja2VkID0gISF2YWx1ZVxuXHQgIH0sXG5cblx0ICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcblx0ICAgIF8ub2ZmKHRoaXMuZWwsICdjaGFuZ2UnLCB0aGlzLmxpc3RlbmVyKVxuXHQgIH1cblxuXHR9XG5cbi8qKiovIH0sXG4vKiA1OSAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblx0dmFyIF8gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpXG5cdHZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlXG5cdHZhciBhcnJheU1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKGFycmF5UHJvdG8pXG5cblx0LyoqXG5cdCAqIEludGVyY2VwdCBtdXRhdGluZyBtZXRob2RzIGFuZCBlbWl0IGV2ZW50c1xuXHQgKi9cblxuXHQ7W1xuXHQgICdwdXNoJyxcblx0ICAncG9wJyxcblx0ICAnc2hpZnQnLFxuXHQgICd1bnNoaWZ0Jyxcblx0ICAnc3BsaWNlJyxcblx0ICAnc29ydCcsXG5cdCAgJ3JldmVyc2UnXG5cdF1cblx0LmZvckVhY2goZnVuY3Rpb24gKG1ldGhvZCkge1xuXHQgIC8vIGNhY2hlIG9yaWdpbmFsIG1ldGhvZFxuXHQgIHZhciBvcmlnaW5hbCA9IGFycmF5UHJvdG9bbWV0aG9kXVxuXHQgIF8uZGVmaW5lKGFycmF5TWV0aG9kcywgbWV0aG9kLCBmdW5jdGlvbiBtdXRhdG9yICgpIHtcblx0ICAgIC8vIGF2b2lkIGxlYWtpbmcgYXJndW1lbnRzOlxuXHQgICAgLy8gaHR0cDovL2pzcGVyZi5jb20vY2xvc3VyZS13aXRoLWFyZ3VtZW50c1xuXHQgICAgdmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoXG5cdCAgICB2YXIgYXJncyA9IG5ldyBBcnJheShpKVxuXHQgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldXG5cdCAgICB9XG5cdCAgICB2YXIgcmVzdWx0ID0gb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncylcblx0ICAgIHZhciBvYiA9IHRoaXMuX19vYl9fXG5cdCAgICB2YXIgaW5zZXJ0ZWRcblx0ICAgIHN3aXRjaCAobWV0aG9kKSB7XG5cdCAgICAgIGNhc2UgJ3B1c2gnOlxuXHQgICAgICAgIGluc2VydGVkID0gYXJnc1xuXHQgICAgICAgIGJyZWFrXG5cdCAgICAgIGNhc2UgJ3Vuc2hpZnQnOlxuXHQgICAgICAgIGluc2VydGVkID0gYXJnc1xuXHQgICAgICAgIGJyZWFrXG5cdCAgICAgIGNhc2UgJ3NwbGljZSc6XG5cdCAgICAgICAgaW5zZXJ0ZWQgPSBhcmdzLnNsaWNlKDIpXG5cdCAgICAgICAgYnJlYWtcblx0ICAgIH1cblx0ICAgIGlmIChpbnNlcnRlZCkgb2Iub2JzZXJ2ZUFycmF5KGluc2VydGVkKVxuXHQgICAgLy8gbm90aWZ5IGNoYW5nZVxuXHQgICAgb2Iubm90aWZ5KClcblx0ICAgIHJldHVybiByZXN1bHRcblx0ICB9KVxuXHR9KVxuXG5cdC8qKlxuXHQgKiBTd2FwIHRoZSBlbGVtZW50IGF0IHRoZSBnaXZlbiBpbmRleCB3aXRoIGEgbmV3IHZhbHVlXG5cdCAqIGFuZCBlbWl0cyBjb3JyZXNwb25kaW5nIGV2ZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcblx0ICogQHBhcmFtIHsqfSB2YWxcblx0ICogQHJldHVybiB7Kn0gLSByZXBsYWNlZCBlbGVtZW50XG5cdCAqL1xuXG5cdF8uZGVmaW5lKFxuXHQgIGFycmF5UHJvdG8sXG5cdCAgJyRzZXQnLFxuXHQgIGZ1bmN0aW9uICRzZXQgKGluZGV4LCB2YWwpIHtcblx0ICAgIGlmIChpbmRleCA+PSB0aGlzLmxlbmd0aCkge1xuXHQgICAgICB0aGlzLmxlbmd0aCA9IGluZGV4ICsgMVxuXHQgICAgfVxuXHQgICAgcmV0dXJuIHRoaXMuc3BsaWNlKGluZGV4LCAxLCB2YWwpWzBdXG5cdCAgfVxuXHQpXG5cblx0LyoqXG5cdCAqIENvbnZlbmllbmNlIG1ldGhvZCB0byByZW1vdmUgdGhlIGVsZW1lbnQgYXQgZ2l2ZW4gaW5kZXguXG5cdCAqXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuXHQgKiBAcGFyYW0geyp9IHZhbFxuXHQgKi9cblxuXHRfLmRlZmluZShcblx0ICBhcnJheVByb3RvLFxuXHQgICckcmVtb3ZlJyxcblx0ICBmdW5jdGlvbiAkcmVtb3ZlIChpbmRleCkge1xuXHQgICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHtcblx0ICAgICAgaW5kZXggPSB0aGlzLmluZGV4T2YoaW5kZXgpXG5cdCAgICB9XG5cdCAgICBpZiAoaW5kZXggPiAtMSkge1xuXHQgICAgICByZXR1cm4gdGhpcy5zcGxpY2UoaW5kZXgsIDEpWzBdXG5cdCAgICB9XG5cdCAgfVxuXHQpXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBhcnJheU1ldGhvZHNcblxuLyoqKi8gfSxcbi8qIDYwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHR2YXIgXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSlcblx0dmFyIG9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZVxuXG5cdC8qKlxuXHQgKiBBZGQgYSBuZXcgcHJvcGVydHkgdG8gYW4gb2JzZXJ2ZWQgb2JqZWN0XG5cdCAqIGFuZCBlbWl0cyBjb3JyZXNwb25kaW5nIGV2ZW50XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcblx0ICogQHBhcmFtIHsqfSB2YWxcblx0ICogQHB1YmxpY1xuXHQgKi9cblxuXHRfLmRlZmluZShcblx0ICBvYmpQcm90byxcblx0ICAnJGFkZCcsXG5cdCAgZnVuY3Rpb24gJGFkZCAoa2V5LCB2YWwpIHtcblx0ICAgIHZhciBvYiA9IHRoaXMuX19vYl9fXG5cdCAgICBpZiAoIW9iKSB7XG5cdCAgICAgIHRoaXNba2V5XSA9IHZhbFxuXHQgICAgICByZXR1cm5cblx0ICAgIH1cblx0ICAgIGlmIChfLmlzUmVzZXJ2ZWQoa2V5KSkge1xuXHQgICAgICBfLndhcm4oJ1JlZnVzZWQgdG8gJGFkZCByZXNlcnZlZCBrZXk6ICcgKyBrZXkpXG5cdCAgICAgIHJldHVyblxuXHQgICAgfVxuXHQgICAgaWYgKHRoaXMuaGFzT3duUHJvcGVydHkoa2V5KSkgcmV0dXJuXG5cdCAgICBvYi5jb252ZXJ0KGtleSwgdmFsKVxuXHQgICAgaWYgKG9iLnZtcykge1xuXHQgICAgICB2YXIgaSA9IG9iLnZtcy5sZW5ndGhcblx0ICAgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICAgIHZhciB2bSA9IG9iLnZtc1tpXVxuXHQgICAgICAgIHZtLl9wcm94eShrZXkpXG5cdCAgICAgICAgdm0uX2RpZ2VzdCgpXG5cdCAgICAgIH1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIG9iLm5vdGlmeSgpXG5cdCAgICB9XG5cdCAgfVxuXHQpXG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgYSBwcm9wZXJ0eSBmcm9tIGFuIG9ic2VydmVkIG9iamVjdFxuXHQgKiBhbmQgZW1pdHMgY29ycmVzcG9uZGluZyBldmVudFxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cblx0Xy5kZWZpbmUoXG5cdCAgb2JqUHJvdG8sXG5cdCAgJyRkZWxldGUnLFxuXHQgIGZ1bmN0aW9uICRkZWxldGUgKGtleSkge1xuXHQgICAgdmFyIG9iID0gdGhpcy5fX29iX19cblx0ICAgIGlmICghb2IpIHtcblx0ICAgICAgZGVsZXRlIHRoaXNba2V5XVxuXHQgICAgICByZXR1cm5cblx0ICAgIH1cblx0ICAgIGlmIChfLmlzUmVzZXJ2ZWQoa2V5KSkge1xuXHQgICAgICBfLndhcm4oJ1JlZnVzZWQgdG8gJGFkZCByZXNlcnZlZCBrZXk6ICcgKyBrZXkpXG5cdCAgICAgIHJldHVyblxuXHQgICAgfVxuXHQgICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KGtleSkpIHJldHVyblxuXHQgICAgZGVsZXRlIHRoaXNba2V5XVxuXHQgICAgaWYgKG9iLnZtcykge1xuXHQgICAgICB2YXIgaSA9IG9iLnZtcy5sZW5ndGhcblx0ICAgICAgd2hpbGUgKGktLSkge1xuXHQgICAgICAgIHZhciB2bSA9IG9iLnZtc1tpXVxuXHQgICAgICAgIHZtLl91bnByb3h5KGtleSlcblx0ICAgICAgICB2bS5fZGlnZXN0KClcblx0ICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgb2Iubm90aWZ5KClcblx0ICAgIH1cblx0ICB9XG5cdClcblxuLyoqKi8gfVxuLyoqKioqKi8gXSlcbn0pO1xuIiwidmFyIFZ1ZSA9IHJlcXVpcmUoXCIuL2Jvd2VyX2NvbXBvbmVudHMvdnVlL2Rpc3QvdnVlLmpzXCIpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoXCIuL2Jvd2VyX2NvbXBvbmVudHMvdnVlLXZhbGlkYXRvci9kaXN0L3Z1ZS12YWxpZGF0b3IuanNcIik7XG5cblZ1ZS51c2UodmFsaWRhdG9yKSJdfQ==
