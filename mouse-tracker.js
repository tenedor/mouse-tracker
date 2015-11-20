/*******************************************************************************
 *
 * cobbled together from old athena-lib-js and acorn-player files, then compiled
 * from coffeescript to javascript. no promises of neatness.
 *
 * find the original source code at:
 * - https://github.com/athenalabs/athena-lib-js
 * - https://github.com/athenalabs/acorn-player
 *
 * try it online at:
 # - http://tenedor.github.io/mouse-tracker/
 *
 ******************************************************************************/

var acorn, athena, derives, goog, util,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

goog = {
  provide: function() {},
  require: function() {}
};

athena = {
  lib: {
    util: {}
  }
};

acorn = {
  config: {},
  util: {},
  player: {}
};

goog.provide('athena.lib.util');

util = athena.lib.util;

util.derives = derives = function(child, parent) {
  if (!child || !child.__super__) {
    return false;
  }
  if (parent.prototype === child.__super__) {
    return true;
  }
  return derives(child.__super__.constructor, parent);
};

util.isOrDerives = function(child, parent) {
  return child === parent || derives(child, parent);
};

util.isStrictObject = function(obj) {
  return (obj != null ? obj.toString() : void 0) === '[object Object]';
};

util.elementInDom = function(element) {
  if (element instanceof $) {
    return _.all(element, util.elementInDom);
  }
  while (element = element != null ? element.parentNode : void 0) {
    if (element === document) {
      return true;
    }
  }
  return false;
};

util.socialPlugins = {
  initialize: function(options) {
    var j, len, params, ref, ref1, ref2, results, script, scriptParams;
    if (options == null) {
      options = {};
    }
    if ((ref1 = options.facebook) != null ? ref1.appId : void 0) {
      window.fbAsyncInit = function() {
        var base1, ref2, ref3, ref4;
        FB.init({
          appId: options.facebook.appId,
          channelUrl: options.facebook.channelUrl,
          status: (ref2 = options.facebook.status) != null ? ref2 : true,
          cookie: (ref3 = options.facebook.cookie) != null ? ref3 : true,
          xfbml: (ref4 = options.facebook.xfbml) != null ? ref4 : true
        });
        return typeof (base1 = options.facebook).onInit === "function" ? base1.onInit() : void 0;
      };
    }
    scriptParams = [];
    if ((ref2 = options.facebook) != null ? ref2.appId : void 0) {
      scriptParams.push({
        id: 'facebook-jssdk',
        src: '//connect.facebook.net/en_US/all.js',
        async: true
      });
    }
    if (options.googlePlus) {
      scriptParams.push({
        id: 'g-plus1',
        src: 'https://apis.google.com/js/plusone.js',
        async: true
      });
    }
    if (options.twitter) {
      scriptParams.push({
        id: 'twitter-wjs',
        src: 'https://platform.twitter.com/widgets.js'
      });
    }
    results = [];
    for (j = 0, len = scriptParams.length; j < len; j++) {
      params = scriptParams[j];
      if (!document.getElementById(params.id)) {
        ref = document.getElementsByTagName('script')[0];
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = params.id;
        script.src = params.src;
        if (params.async) {
          script.async = true;
        }
        results.push(ref.parentNode.insertBefore(script, ref));
      } else {
        results.push(void 0);
      }
    }
    return results;
  },
  facebookLogin: function(options) {
    var login;
    if (options == null) {
      options = {};
    }
    login = function() {
      return FB.login(function(response) {
        if (response.authResponse) {
          return typeof options.success === "function" ? options.success() : void 0;
        } else {
          return typeof options.failure === "function" ? options.failure() : void 0;
        }
      });
    };
    return FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        return typeof options.success === "function" ? options.success() : void 0;
      } else if (response.status === 'not_authorized') {
        return login();
      } else {
        return login();
      }
    });
  },
  facebookPicture: function(id, type) {
    if (type == null) {
      type = 'large';
    }
    return "//graph.facebook.com/" + id + "/picture?type=" + type;
  }
};

goog.provide('athena.lib.Model');

athena.lib.Model = (function(superClass1) {
  extend(Model, superClass1);

  function Model() {
    this.sync = bind(this.sync, this);
    this.toJSONString = bind(this.toJSONString, this);
    this.toJSON = bind(this.toJSON, this);
    this.clone = bind(this.clone, this);
    return Model.__super__.constructor.apply(this, arguments);
  }

  Model.property = function(property, options) {
    if (options == null) {
      options = {};
    }
    if (!_.isString(property)) {
      throw new Error('property method: first argument must be a string');
    }
    if (!athena.lib.util.isStrictObject(options)) {
      options = {};
    }
    return function(value) {
      var ref1;
      if (options.setter !== false && (value != null)) {
        this.set(property, value);
      }
      return (ref1 = this.get(property)) != null ? ref1 : options["default"];
    };
  };

  Model.prototype.clone = function() {
    return new this.constructor(this.toJSON());
  };

  Model.prototype.toJSON = function() {
    return JSON.parse(JSON.stringify(this.attributes));
  };

  Model.prototype.toJSONString = function() {
    return JSON.stringify(this.toJSON());
  };

  Model.prototype.sync = function(method, model, options) {
    if (options.xhrFields == null) {
      options.xhrFields = {};
    }
    options.xhrFields.withCredentials = true;
    options.crossDomain = true;
    return Backbone.sync(method, model, options);
  };

  return Model;

})(Backbone.Model);

goog.provide('athena.lib.View');

athena.lib.View = (function(superClass1) {
  extend(View, superClass1);

  function View() {
    this.softRender = bind(this.softRender, this);
    this.render = bind(this.render, this);
    this.destroy = bind(this.destroy, this);
    this.initialize = bind(this.initialize, this);
    this.elAttributes = bind(this.elAttributes, this);
    this.events = bind(this.events, this);
    this.defaults = bind(this.defaults, this);
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.className = '';

  View.classNameExtend = function(className) {
    var superClass;
    superClass = this.prototype.className;
    if (superClass) {
      return superClass + ' ' + className;
    } else {
      return className;
    }
  };

  View.prototype.defaults = function() {
    return {
      extraClasses: [],
      eventhub: void 0
    };
  };

  View.prototype.events = function() {
    return {};
  };

  View.prototype.elAttributes = function() {
    return {};
  };

  View.prototype.initialize = function() {
    var classes;
    View.__super__.initialize.apply(this, arguments);
    this.options = this.options || {};
    _.defaults(this.options, this.defaults());
    this.eventhub = this.options.eventhub || this;
    if (this.options.extraClasses) {
      classes = this.options.extraClasses;
      if (_.isString(classes)) {
        classes = [classes];
      }
      return _.each(classes, (function(_this) {
        return function(name) {
          return _this.$el.addClass(name);
        };
      })(this));
    }
  };

  View.prototype.destroy = function() {
    this.rendering = false;
    this.remove();
    this.unbind();
    return this.uninitialize();
  };

  View.prototype.rendering = false;

  View.prototype.render = function() {
    View.__super__.render.apply(this, arguments);
    this.rendering = true;
    this.delegateEvents();
    _.each(this.elAttributes(), (function(_this) {
      return function(val, key) {
        if (_this.$el.attr(key) !== val) {
          return _this.$el.attr(key, val);
        }
      };
    })(this));
    return this;
  };

  View.prototype.softRender = function() {
    if (this.rendering) {
      this.render();
    }
    return this;
  };

  View.prototype.uninitialize = function() {};

  return View;

})(Backbone.View);

if (typeof acorn === 'undefined') {
  acorn = {};
}

goog.provide('acorn.config');

_.extend(acorn.config, {
  version: '0.0.0',
  url: {
    base: 'https://acorn.athena.ai'
  },
  api: {
    version: '0.0.2'
  }
});

acorn.config.setUrlBase = function(base) {
  acorn.config.url.base = base;
  acorn.config.url.img = base + "/img";
  return acorn.config.url.api = base + "/api/v" + acorn.config.api.version;
};

acorn.config.setUrlBase(acorn.config.url.base);

acorn.config.img = {};

acorn.config.img.acorn = acorn.config.url.img + "/acorn.png";

acorn.config.css = ['/build/css/acorn.player.css', '/lib/fontawesome/css/font-awesome.css'];

acorn.config.test = {};

acorn.config.test.timeout = 10000;

goog.provide('acorn.util');

goog.require('acorn.config');

util = acorn.util;

util.assert = function(condition, description) {
  if (!condition) {
    throw new Error(description);
  }
};

util.urlRegEx = function(url) {
  if (url) {
    return RegExp("(https?:\\/\\/)?" + (url != null ? url : '.*'));
  }
  return /^((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))$/;
};

util.isUrl = function(url) {
  url = String(url);
  return this.urlRegEx().test(url);
};

util.isPath = function(path) {
  return /^[A-Za-z\/.-_]+$/.test(path);
};

util.url = function() {
  var path;
  path = _.toArray(arguments).join('/');
  return "//" + acorn.config.domain + "/" + path;
};

util.apiUrl = function() {
  var apiPath;
  apiPath = ("api/v" + acorn.config.api.version).split('/');
  return this.url.apply(this, apiPath.concat(_.toArray(arguments)));
};

util.imgUrl = function() {
  return this.url.apply(this, ['img'].concat(_.toArray(arguments)));
};

util.urlFix = function(url) {
  if (!url) {
    return url;
  }
  if (!/^([a-z0-9]+:)?\/\//i.test(url)) {
    url = "http://" + url;
  }
  return url;
};

util.iframeOptions = {
  frameborder: 0,
  border: 0,
  width: '100%',
  height: '100%',
  allowFullScreen: 'true',
  webkitAllowFullScreen: 'true',
  mozallowfullscreen: 'true'
};

util.iframe = function(src, id) {
  var f;
  f = $('<iframe>');
  _.map(this.iframeOptions, function(val, key) {
    return f.attr(key, val);
  });
  f.attr('src', src);
  if (id != null) {
    f.attr('id', id);
  }
  return f;
};

util.acornInIframe = function(iframe) {
  var ref1, win;
  if (iframe.jquery != null) {
    iframe = iframe.get(0);
  }
  win = (ref1 = iframe.contentWindow) != null ? ref1 : iframe.contentDocument.defaultView;
  return win.acorn;
};

util.property = function(defaultValue, validate) {
  var storedValue;
  storedValue = defaultValue;
  if (validate == null) {
    validate = function(x) {
      return x;
    };
  }
  return function(value) {
    if (value != null) {
      storedValue = validate(value);
    }
    return storedValue;
  };
};

util.fullscreen = function(elem) {
  return $(elem).fullScreen();
};

util.appendCss = function(srcs) {
  if (srcs == null) {
    srcs = acorn.config.css;
  }
  if (!_.isArray(srcs)) {
    srcs = [srcs];
  }
  return _.each(srcs, function(src) {
    var css;
    if (!$("link[rel='stylesheet'][href='" + src + "']").length) {
      css = $('<link>');
      css.attr('rel', 'stylesheet');
      css.attr('href', src);
      return $('body').append(css);
    }
  });
};

util.elementInDom = function(element) {
  if (element instanceof $) {
    return _.all(element, util.elementInDom);
  }
  while (element = element != null ? element.parentNode : void 0) {
    if (element === document) {
      return true;
    }
  }
  return false;
};

util._scrubPercentParams = function(params) {
  if (!_.isObject(params)) {
    params = {
      high: params
    };
  }
  if (params.low == null) {
    params.low = 0;
  }
  if (params.high == null) {
    params.high = MissingParameterError('percent conversion utility', 'high');
  }
  if (params.bound == null) {
    params.bound = false;
  }
  return params;
};

util.toPercent = function(value, params) {
  var percent;
  params = util._scrubPercentParams(params);
  percent = (value - params.low) / (params.high - params.low) * 100;
  if (params.bound) {
    percent = util.bound(percent);
  }
  if (params.decimalDigits != null) {
    percent = Number(percent.toFixed(params.decimalDigits));
  }
  return percent;
};

util.fromPercent = function(percent, params) {
  var value;
  params = util._scrubPercentParams(params);
  if (params.bound) {
    percent = util.bound(percent);
  }
  value = percent / 100 * (params.high - params.low) + params.low;
  if (params.decimalDigits != null) {
    value = Number(value.toFixed(params.decimalDigits));
  }
  return value;
};

util.bound = function(n, opts) {
  var high, low, ref1, ref2;
  if (opts == null) {
    opts = {};
  }
  low = (ref1 = opts.low) != null ? ref1 : 0;
  high = (ref2 = opts.high) != null ? ref2 : 100;
  if (opts.enforceNumber !== false) {
    n = Number(n);
  }
  if (n < low) {
    return low;
  } else if (n > high) {
    return high;
  } else {
    return n;
  }
};

util.parseUrl = function(url) {
  var anchor, j, key, keys, len, ref1, result;
  if (url === '') {
    ValueError('url', 'should not be the empty string.');
  }
  result = {};
  url = $.trim(url);
  if (!/^([a-z0-9]+:)?\/\//i.test(url)) {
    url = "http://" + url;
  }
  anchor = document.createElement('a');
  anchor.href = url;
  keys = 'protocol hostname host pathname port search hash href';
  ref1 = keys.split(' ');
  for (j = 0, len = ref1.length; j < len; j++) {
    key = ref1[j];
    result[key] = anchor[key];
  }
  if (result.port === '0') {
    result.port = '';
  }
  result.toString = function() {
    return result.href;
  };
  result.resource = result.pathname + result.search;
  result.extension = result.pathname.split('.').pop();
  result.head = function() {
    throw new Error('head not supported. Yet.');
  };
  _.each(result, function(val, key) {
    if ((!/_$/.test(key)) && (typeof val === 'string')) {
      return result[key + '_'] = val.toLowerCase();
    }
  });
  return result;
};

util.mouseLocationTracker = (function() {
  var id, onMousemove, startTracking, stopTracking, subscribed, tracker;
  id = 0;
  subscribed = [];
  tracker = {
    x: void 0,
    y: void 0,
    active: false
  };
  onMousemove = function(e) {
    tracker.x = e.pageX;
    return tracker.y = e.pageY;
  };
  startTracking = function() {
    tracker.active = true;
    return $(document).on('mousemove.mouseLocationTracker', onMousemove);
  };
  stopTracking = function() {
    tracker.active = false;
    tracker.x = void 0;
    tracker.y = void 0;
    return $(document).off('mousemove.mouseLocationTracker', onMousemove);
  };
  tracker.subscribe = function() {
    if (!tracker.active) {
      startTracking();
    }
    subscribed.push(id);
    return id++;
  };
  tracker.unsubscribe = function(id) {
    subscribed = _.without(subscribed, id);
    if (subscribed.length === 0) {
      return stopTracking();
    }
  };
  return tracker;
})();

util.Time = (function() {
  function Time(time, options1) {
    this.options = options1 != null ? options1 : {};
    this.timestring = bind(this.timestring, this);
    this.seconds = bind(this.seconds, this);
    this.time = this.constructor.timestringToSeconds(time);
  }

  Time.prototype.seconds = function() {
    return this.time;
  };

  Time.prototype.timestring = function() {
    return this.constructor.secondsToTimestring(this.time, this.options);
  };

  Time.timestringToSeconds = function(timestring) {
    var hrs, min, ref1, ref2, rest, sec, subsec;
    timestring = String(timestring != null ? timestring : 0);
    ref1 = timestring.split('.'), rest = ref1[0], subsec = ref1[1];
    subsec = parseFloat("0." + (subsec != null ? subsec : '0'));
    rest = rest.split(':').reverse();
    ref2 = _.map([0, 1, 2], function(n) {
      return parseInt(rest[n], 10) || 0;
    }), sec = ref2[0], min = ref2[1], hrs = ref2[2];
    return (hrs * 60 * 60) + (min * 60) + sec + subsec;
  };

  Time.secondsToTimestring = function(seconds, options) {
    var hrs, min, pad, sec, subsec;
    if (options == null) {
      options = {};
    }
    sec = parseInt(seconds, 10);
    hrs = parseInt(sec / (60 * 60), 10);
    sec -= hrs * 60 * 60;
    min = parseInt(sec / 60, 10);
    sec -= min * 60;
    subsec = seconds % 1;
    if (subsec) {
      subsec = Math.round(subsec * 1000) / 1000;
      subsec = String(subsec).substr(1, 4);
      subsec = subsec.replace(/0+$/, '');
    }
    hrs = hrs === 0 ? '' : hrs + ":";
    pad = function(n) {
      if (n < 10) {
        return "0" + n;
      } else {
        return "" + n;
      }
    };
    if (hrs === '' && options.padTime === false) {
      if (min === 0) {
        min = '';
      } else {
        min = min + ":";
      }
    } else {
      min = (pad(min)) + ":";
    }
    if (min !== '') {
      sec = pad(sec);
    }
    return "" + hrs + min + sec + (subsec || '');
  };

  return Time;

})();

util.Timer = (function() {
  function Timer(interval, callback, args1) {
    this.interval = interval;
    this.callback = callback;
    this.args = args1;
    this.onTick = bind(this.onTick, this);
    this.stopTick = bind(this.stopTick, this);
    this.startTick = bind(this.startTick, this);
    if (this.callback == null) {
      this.callback = function() {};
    }
    if (this.args == null) {
      this.args = [];
    }
    if (!_.isArray(this.args)) {
      this.args = [this.args];
    }
  }

  Timer.prototype.startTick = function() {
    this.stopTick();
    return this.intervalObject = setInterval(this.onTick, this.interval);
  };

  Timer.prototype.stopTick = function() {
    if (this.intervalObject) {
      clearInterval(this.intervalObject);
      return this.intervalObject = void 0;
    }
  };

  Timer.prototype.onTick = function() {
    return this.callback.apply(this, this.args);
  };

  return Timer;

})();

util.LINK_REGEX = /^https?:\/\/[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|]/;

util.fixObjectFit = function() {
  var objectFit_;
  objectFit_ = $.fn.objectFit;
  return $.fn.objectFit = function() {
    console.log('Object Fit currently disabled.');
    return this;
  };
};

util.fixObjectFit();

$.fn.insertAt = function(index, element) {
  var lastIndex;
  lastIndex = this.children().size();
  if (index < 0) {
    if (index < 0) {
      index = Math.max(0, lastIndex + 1 + index);
    }
  }
  this.append(element);
  if (index < lastIndex) {
    this.children().eq(index).before(this.children().last());
  }
  return this;
};

goog.provide('acorn.player.MouseTrackingView');

acorn.player.MouseTrackingView = (function(superClass1) {
  extend(MouseTrackingView, superClass1);

  function MouseTrackingView() {
    this._percentContainerMouseDisplacement = bind(this._percentContainerMouseDisplacement, this);
    this._percentElementMouseDisplacement = bind(this._percentElementMouseDisplacement, this);
    this._percentMouseDisplacement = bind(this._percentMouseDisplacement, this);
    this._mouseDisplacement = bind(this._mouseDisplacement, this);
    this._mouseOffsetFromElement = bind(this._mouseOffsetFromElement, this);
    this._mouseInElementBox = bind(this._mouseInElementBox, this);
    this._mouseElementPercentOfContainer = bind(this._mouseElementPercentOfContainer, this);
    this._mouseElementContainerDimensions = bind(this._mouseElementContainerDimensions, this);
    this._mouseElementDimensions = bind(this._mouseElementDimensions, this);
    this._mouseElementContainer = bind(this._mouseElementContainer, this);
    this._mouseElement = bind(this._mouseElement, this);
    this._mousedownTarget = bind(this._mousedownTarget, this);
    this._onMouseDidMouseleave = bind(this._onMouseDidMouseleave, this);
    this._onMouseDidMouseenter = bind(this._onMouseDidMouseenter, this);
    this._onMouseDidClick = bind(this._onMouseDidClick, this);
    this._onMouseDidMouseup = bind(this._onMouseDidMouseup, this);
    this._onMouseDidStop = bind(this._onMouseDidStop, this);
    this._onMouseDidDrag = bind(this._onMouseDidDrag, this);
    this._onMouseDidStart = bind(this._onMouseDidStart, this);
    this._onMouseDidMousedown = bind(this._onMouseDidMousedown, this);
    this._mouseMinimumDelayMet = bind(this._mouseMinimumDelayMet, this);
    this._mouseMinimumDistanceMet = bind(this._mouseMinimumDistanceMet, this);
    this._preventMouseStart = bind(this._preventMouseStart, this);
    this._onMouseleaveMouseTarget = bind(this._onMouseleaveMouseTarget, this);
    this._onMouseenterMouseTarget = bind(this._onMouseenterMouseTarget, this);
    this._onClickMouseTarget = bind(this._onClickMouseTarget, this);
    this._onMouseUp = bind(this._onMouseUp, this);
    this._onMouseMove = bind(this._onMouseMove, this);
    this._onMousedownMouseTarget = bind(this._onMousedownMouseTarget, this);
    this._onMousedownIgnore = bind(this._onMousedownIgnore, this);
    this.render = bind(this.render, this);
    this.destroy = bind(this.destroy, this);
    this.initialize = bind(this.initialize, this);
    this.events = bind(this.events, this);
    this.defaults = bind(this.defaults, this);
    this._targetClassName = bind(this._targetClassName, this);
    return MouseTrackingView.__super__.constructor.apply(this, arguments);
  }

  MouseTrackingView.prototype.className = MouseTrackingView.classNameExtend('mouse-tracking-view');

  MouseTrackingView.prototype._targetClassName = function() {
    return 'mouse-target';
  };

  MouseTrackingView.prototype.defaults = function() {
    return _.extend(MouseTrackingView.__super__.defaults.apply(this, arguments), {
      mouseMinimumDistance: 1,
      mouseMinimumDelay: 0,
      mouseEventsNamespace: 'mousetracking'
    });
  };

  MouseTrackingView.prototype.events = function() {
    return _.extend(MouseTrackingView.__super__.events.apply(this, arguments), {
      'mousedown .mouse-ignore': this._onMousedownIgnore,
      'mousedown .mouse-ignore .mouse-target': this._onMousedownIgnore,
      'mousedown .mouse-ignore-targets .mouse-target': this._onMousedownIgnore,
      'mousedown .mouse-target': this._onMousedownMouseTarget,
      'click .mouse-target': this._onClickMouseTarget,
      'mouseenter .mouse-target': this._onMouseenterMouseTarget,
      'mouseleave .mouse-target': this._onMouseleaveMouseTarget
    });
  };

  MouseTrackingView.prototype.template = _.template('<div class="<%= targetClassName %>"></div>');

  MouseTrackingView.prototype.initialize = function() {
    MouseTrackingView.__super__.initialize.apply(this, arguments);
    this._mouseLocationTrackerId = util.mouseLocationTracker.subscribe();
    this.listenTo(this, 'MouseTrackingView:MouseDidMousedown', this._onMouseDidMousedown);
    this.listenTo(this, 'MouseTrackingView:MouseDidStart', this._onMouseDidStart);
    this.listenTo(this, 'MouseTrackingView:MouseDidDrag', this._onMouseDidDrag);
    this.listenTo(this, 'MouseTrackingView:MouseDidStop', this._onMouseDidStop);
    this.listenTo(this, 'MouseTrackingView:MouseDidMouseup', this._onMouseDidMouseup);
    this.listenTo(this, 'MouseTrackingView:MouseDidClick', this._onMouseDidClick);
    this.listenTo(this, 'MouseTrackingView:MouseDidMouseenter', this._onMouseDidMouseenter);
    return this.listenTo(this, 'MouseTrackingView:MouseDidMouseleave', this._onMouseDidMouseleave);
  };

  MouseTrackingView.prototype.destroy = function() {
    MouseTrackingView.__super__.destroy.apply(this, arguments);
    util.mouseLocationTracker.unsubscribe(this._mouseLocationTrackerId);
    $(document).off("mousemove." + this.mouseEventsNamespace, this._onMouseMove);
    return $(document).off("mouseup." + this.mouseEventsNamespace, this._onMouseUp);
  };

  MouseTrackingView.prototype.render = function() {
    MouseTrackingView.__super__.render.apply(this, arguments);
    this.$el.empty();
    this.$el.append(this.template({
      targetClassName: this._targetClassName()
    }));
    return this;
  };

  MouseTrackingView.prototype._onMousedownIgnore = function(event) {
    return this._mousedownIgnoreEvent = event;
  };

  MouseTrackingView.prototype._onMousedownMouseTarget = function(event) {
    this._preventClickEvent = false;
    this._mouseStarted && this._onMouseUp(event);
    if (event.which !== 1) {
      return;
    }
    if (event === this._mousedownIgnoreEvent) {
      return;
    }
    this._mousedownEvent = event;
    this._mousedownTarget().addClass('mouse-is-down');
    this.trigger('MouseTrackingView:MouseDidMousedown', event);
    this._mouseDelayAchieved = false;
    if (this._mouseMinimumDistanceMet(event) && this._mouseMinimumDelayMet(event)) {
      if (this._preventMouseStart(event)) {
        return;
      } else {
        this._mouseStarted = true;
        this.trigger('MouseTrackingView:MouseDidStart', event, this._mousedownEvent);
      }
    }
    event.preventDefault();
    $(document).on("mousemove." + this.mouseEventsNamespace, this._onMouseMove);
    return $(document).on("mouseup." + this.mouseEventsNamespace, this._onMouseUp);
  };

  MouseTrackingView.prototype._onMouseMove = function(event) {
    var ie;
    ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());
    if (ie && (!document.documentMode || document.documentMode < 9) && !event.button) {
      return this._onMouseUp(event);
    }
    if (this._mouseStarted) {
      this.trigger('MouseTrackingView:MouseDidDrag', event, this._mousedownEvent);
      return;
    }
    if (this._mouseMinimumDistanceMet(event) && this._mouseMinimumDelayMet(event)) {
      if (this._preventMouseStart(this._mousedownEvent, event)) {
        this._onMouseUp(event);
        return;
      }
      this._mouseStarted = true;
      this.trigger('MouseTrackingView:MouseDidStart', event, this._mousedownEvent);
      return this.trigger('MouseTrackingView:MouseDidDrag', event, this._mousedownEvent);
    }
  };

  MouseTrackingView.prototype._onMouseUp = function(event) {
    $(document).off("mousemove." + this.mouseEventsNamespace, this._onMouseMove);
    $(document).off("mouseup." + this.mouseEventsNamespace, this._onMouseUp);
    clearTimeout(this._mouseDelayCountdown);
    if (this._mouseStarted) {
      this._mouseStarted = false;
      if (this._mousedownTarget()[0] === this._mousedownEvent.target) {
        this._preventClickEvent = true;
      }
      this.trigger('MouseTrackingView:MouseDidStop', event, this._mousedownEvent);
    }
    this.trigger('MouseTrackingView:MouseDidMouseup', event, this._mousedownEvent);
    this._mousedownTarget().removeClass('mouse-is-down');
    return this._mousedownEvent = void 0;
  };

  MouseTrackingView.prototype._onClickMouseTarget = function(event) {
    if (this._preventClickEvent) {
      this._preventClickEvent = false;
      event.stopImmediatePropagation();
      return false;
    } else {
      return this.trigger('MouseTrackingView:MouseDidClick', event);
    }
  };

  MouseTrackingView.prototype._onMouseenterMouseTarget = function(event) {
    return this.trigger('MouseTrackingView:MouseDidMouseenter', event);
  };

  MouseTrackingView.prototype._onMouseleaveMouseTarget = function(event) {
    return this.trigger('MouseTrackingView:MouseDidMouseleave', event);
  };

  MouseTrackingView.prototype._preventMouseStart = function(mousedownEvent, event) {};

  MouseTrackingView.prototype._mouseMinimumDistanceMet = function(event) {
    var distance, ref1, x, y;
    ref1 = this._mouseDisplacement(), x = ref1.x, y = ref1.y;
    distance = Math.sqrt(x * x + y * y);
    return distance >= this.options.mouseMinimumDistance;
  };

  MouseTrackingView.prototype._mouseMinimumDelayMet = function(event) {
    var delay;
    delay = this.options.mouseMinimumDelay;
    if (delay > 0 && !this._mouseDelayAchieved) {
      this._mouseDelayCountdown = setTimeout(((function(_this) {
        return function() {
          return _this._mouseDelayAchieved = true;
        };
      })(this)), delay);
      return false;
    } else {
      return true;
    }
  };

  MouseTrackingView.prototype._onMouseDidMousedown = function(event) {};

  MouseTrackingView.prototype._onMouseDidStart = function(event, mousedownEvent) {};

  MouseTrackingView.prototype._onMouseDidDrag = function(event, mousedownEvent) {};

  MouseTrackingView.prototype._onMouseDidStop = function(event, mousedownEvent) {};

  MouseTrackingView.prototype._onMouseDidMouseup = function(event, mousedownEvent) {};

  MouseTrackingView.prototype._onMouseDidClick = function(event) {};

  MouseTrackingView.prototype._onMouseDidMouseenter = function(event) {};

  MouseTrackingView.prototype._onMouseDidMouseleave = function(event) {};

  MouseTrackingView.prototype._mousedownTarget = function() {
    var el, ref1;
    el = (ref1 = this._mousedownEvent) != null ? ref1.target : void 0;
    if (el != null) {
      return $(el);
    } else {
      return void 0;
    }
  };

  MouseTrackingView.prototype._mouseElement = function($el) {
    var ref1;
    return $((ref1 = $el != null ? $el : this._mousedownTarget()) != null ? ref1 : this.$('.mouse-target').first());
  };

  MouseTrackingView.prototype._mouseElementContainer = function($el) {
    return this._mouseElement($el).offsetParent();
  };

  MouseTrackingView.prototype._mouseElementDimensions = function($el) {
    $el = this._mouseElement($el);
    return {
      width: $el.width(),
      height: $el.height()
    };
  };

  MouseTrackingView.prototype._mouseElementContainerDimensions = function($el) {
    var container;
    container = this._mouseElementContainer($el);
    return {
      width: container.width(),
      height: container.height()
    };
  };

  MouseTrackingView.prototype._mouseElementPercentOfContainer = function($el, $containerEl) {
    var container, el;
    el = this._mouseElementDimensions($el);
    if ($containerEl != null) {
      container = this._mouseElementDimensions($containerEl);
    } else {
      container = this._mouseElementContainerDimensions($el);
    }
    return {
      x: el.width * 100 / container.width,
      y: el.height * 100 / container.height
    };
  };

  MouseTrackingView.prototype._mouseInElementBox = function($el, dimension) {
    var inHeight, inWidth, offset, ref1, ref2;
    $el = $($el);
    offset = this._mouseOffsetFromElement($el);
    inWidth = (0 <= (ref1 = offset.x) && ref1 <= $el.outerWidth());
    inHeight = (0 <= (ref2 = offset.y) && ref2 <= $el.outerHeight());
    if (dimension === 'x' || dimension === 'width') {
      return inWidth;
    } else if (dimension === 'y' || dimension === 'height') {
      return inHeight;
    } else {
      return inWidth && inHeight;
    }
  };

  MouseTrackingView.prototype._mouseOffsetFromElement = function($el) {
    var x, y;
    if (!$el) {
      MissingParameterError('MouseTrackingView._mouseOffsetFromElement', '$el');
    }
    $el = $($el);
    x = util.mouseLocationTracker.x - $el.offset().left;
    y = util.mouseLocationTracker.y - $el.offset().top;
    return {
      x: x,
      y: y
    };
  };

  MouseTrackingView.prototype._mouseDisplacement = function(initial) {
    var dx, dy, ref1, ref2;
    if (initial == null) {
      initial = this._mousedownEvent;
    }
    dx = util.mouseLocationTracker.x - ((ref1 = initial != null ? initial.pageX : void 0) != null ? ref1 : initial != null ? initial.x : void 0);
    dy = util.mouseLocationTracker.y - ((ref2 = initial != null ? initial.pageY : void 0) != null ? ref2 : initial != null ? initial.y : void 0);
    return {
      x: dx,
      y: dy
    };
  };

  MouseTrackingView.prototype._percentMouseDisplacement = function(options) {
    var $el, _$el, calculatedDimensions, dimensionsFn, el, height, ref1, ref2, ref3, ref4, ref5, ref6, ref7, startEvent, width, x, y;
    if (options == null) {
      options = {};
    }
    startEvent = (ref1 = options.startEvent) != null ? ref1 : this._mousedownEvent;
    dimensionsFn = (ref2 = options.dimensionsFn) != null ? ref2 : this._mouseElementContainerDimensions;
    el = (ref3 = (ref4 = options.$el) != null ? ref4 : options.el) != null ? ref3 : startEvent != null ? startEvent.target : void 0;
    if (el != null) {
      $el = $(el);
    }
    calculatedDimensions = dimensionsFn($el);
    width = (ref5 = options.width) != null ? ref5 : calculatedDimensions.width;
    height = (ref6 = options.height) != null ? ref6 : calculatedDimensions.height;
    ref7 = (_$el = options.offsetFromElement) ? (_$el = util.elementInDom(_$el) ? _$el : $el, this._mouseOffsetFromElement(_$el)) : this._mouseDisplacement(startEvent), x = ref7.x, y = ref7.y;
    return {
      x: x * 100 / width,
      y: y * 100 / height
    };
  };

  MouseTrackingView.prototype._percentElementMouseDisplacement = function(options) {
    if (options == null) {
      options = {};
    }
    options = _.clone(options);
    options.dimensionsFn = this._mouseElementDimensions;
    return this._percentMouseDisplacement(options);
  };

  MouseTrackingView.prototype._percentContainerMouseDisplacement = function(options) {
    var $el, _$el, ref1, ref2, ref3;
    if (options == null) {
      options = {};
    }
    options = _.clone(options);
    options.dimensionsFn = this._mouseElementContainerDimensions;
    if (((_$el = options.offsetFromElement) != null) && !util.elementInDom(_$el)) {
      $el = (ref1 = (ref2 = options.$el) != null ? ref2 : options.el) != null ? ref1 : (ref3 = options.startEvent) != null ? ref3.target : void 0;
      options.offsetFromElement = this._mouseElementContainer($el);
    }
    return this._percentMouseDisplacement(options);
  };

  return MouseTrackingView;

})(athena.lib.View);

goog.provide('acorn.specs.views.MouseTrackingView');

goog.require('acorn.player.MouseTrackingView');

$('document').ready(function() {
  var $player, MouseTrackingView, actions, bound, container, defaultOpts, forward, i, j, k, l, len, len1, makeTarget, mtv, pref, ref1, results, setupMTV, target, targets;
  MouseTrackingView = acorn.player.MouseTrackingView;
  defaultOpts = function() {
    return {
      eventhub: _.extend({}, Backbone.Events)
    };
  };
  setupMTV = (function(_this) {
    return function(opts) {
      var mtv, target;
      opts = _.defaults(opts != null ? opts : {}, defaultOpts());
      mtv = new MouseTrackingView(opts);
      mtv.render();
      target = mtv.$('.mouse-target');
      return [mtv, target];
    };
  })(this);
  $player = $('<div>').addClass('acorn-player').width(500).height(400).appendTo('.mouse-tracker');
  container = $('<div>').height(240).width('100%').css('background-color', '#DDD').css('overflow', 'hidden');
  ref1 = setupMTV({
    location: 20
  }), mtv = ref1[0], target = ref1[1];
  mtv.$el.height('100%').width('100%');
  targets = [target];
  makeTarget = function() {
    return mtv.template({
      targetClassName: mtv._targetClassName()
    });
  };
  for (i = j = 0; j < 5; i = ++j) {
    target = $(makeTarget());
    targets.push(target);
    mtv.$el.append(target);
  }
  for (i = k = 0, len = targets.length; k < len; i = ++k) {
    target = targets[i];
    target.height(15 + 5 * i).width(40 - 5 * i).css('background-color', '#555');
  }
  bound = function(n, max) {
    if (n < 0) {
      return 0;
    } else if (n > max) {
      return max;
    } else {
      return n;
    }
  };
  actions = [];
  actions.push({
    down: function(event) {
      this.started = false;
      clearTimeout(this._delayedReset);
      return targets[0].css('background-color', '#E44');
    },
    start: function(event, mdEvent) {
      return this.started = true;
    },
    drag: function(event, mdEvent) {
      return targets[0].css('background-color', '#393');
    },
    stop: function(event, mdEvent) {
      targets[0].css('background-color', '#939');
      if (!mtv._mouseInElementBox(targets[0])) {
        return targets[0].height(this.initialDims.height).width(this.initialDims.width);
      }
    },
    up: function(event, mdEvent) {
      var reset;
      reset = (function(_this) {
        return function() {
          targets[0].css('background-color', '#555');
          if (!mtv._mouseInElementBox(targets[0])) {
            return targets[0].height(_this.initialDims.height).width(_this.initialDims.width);
          }
        };
      })(this);
      if (this.started) {
        this.delayedReset = setTimeout(reset, 600);
      } else {
        reset();
      }
      return this.started = false;
    },
    click: function(event) {},
    enter: function(event) {
      if (this.initialDims == null) {
        this.initialDims = {
          height: targets[0].height(),
          width: targets[0].width()
        };
      }
      return targets[0].height(this.initialDims.width * 2).width(this.initialDims.width * 2);
    },
    leave: function(event) {
      if (!this.started) {
        return targets[0].height(this.initialDims.height).width(this.initialDims.width);
      }
    }
  });
  actions.push({
    down: function(event) {
      var containerDims, targetDims;
      this.initialLeft = parseFloat(targets[1].css('left'));
      this.initialTop = parseFloat(targets[1].css('top'));
      if (!this.range) {
        targetDims = mtv._mouseElementDimensions(targets[1]);
        containerDims = mtv._mouseElementContainerDimensions(targets[1]);
        return this.range = {
          width: containerDims.width - targetDims.width,
          height: containerDims.height - targetDims.height
        };
      }
    },
    start: function(event, mdEvent) {},
    drag: function(event, mdEvent) {
      var displacement, newLeft;
      displacement = mtv._mouseDisplacement();
      newLeft = bound(this.initialLeft + displacement.x, this.range.width);
      return targets[1].css('left', newLeft);
    },
    stop: function(event, mdEvent) {},
    up: function(event, mdEvent) {},
    click: function(event) {},
    enter: function(event) {},
    leave: function(event) {}
  });
  actions.push({
    down: function(event) {
      var containerDims, targetDims;
      if (this.hexValue == null) {
        this.hexValue = 0x55;
      }
      this.initialLeft = parseFloat(targets[2].css('left'));
      this.initialTop = parseFloat(targets[2].css('top'));
      if (!this.range) {
        targetDims = mtv._mouseElementDimensions(targets[2]);
        containerDims = mtv._mouseElementContainerDimensions(targets[2]);
        return this.range = {
          width: containerDims.width - targetDims.width,
          height: containerDims.height - targetDims.height
        };
      }
    },
    start: function(event, mdEvent) {
      return targets[2].css('border', '1px solid #555');
    },
    drag: function(event, mdEvent) {
      var color, displacement, newLeft, newTop;
      this.hexValue += 8;
      color = (function(_this) {
        return function() {
          var hex;
          hex = _this.hexValue.toString(16);
          return targets[2].css('background-color', "#" + hex + hex + hex);
        };
      })(this);
      color();
      setTimeout(((function(_this) {
        return function() {
          return (_this.hexValue -= 8) && color();
        };
      })(this)), 600);
      displacement = mtv._mouseDisplacement();
      newLeft = bound(this.initialLeft + displacement.x, this.range.width);
      newTop = bound(this.initialTop + displacement.y, this.range.height);
      targets[2].css('left', newLeft);
      return targets[2].css('top', newTop);
    },
    stop: function(event, mdEvent) {
      return targets[2].css('border', 0);
    },
    up: function(event, mdEvent) {},
    click: function(event) {},
    enter: function(event) {},
    leave: function(event) {}
  });
  actions.push({
    setup: function() {
      targets[3].css('z-index', 1);
      return this.lines = [this.mainVertical = this.makeLine(1, '100%', mtv.$el), this.mainHorizontal = this.makeLine('100%', 1, mtv.$el), this.innerVertical = this.makeLine(1, '100%', targets[3]), this.innerHorizontal = this.makeLine('100%', 1, targets[3])];
    },
    makeLine: function(w, h, container) {
      return $('<div>').css('position', 'absolute').width(w).height(h).appendTo(container);
    },
    positionLines: function(event) {
      var color, highlight, horizontal, innerOffset, l, len1, len2, len3, line, m, mainOffset, o, offset, p, ref2, ref3, ref4, results, vertical;
      mainOffset = mtv._mouseOffsetFromElement(container);
      innerOffset = mtv._mouseOffsetFromElement(targets[3]);
      this.mainVertical.css('left', mainOffset.x);
      this.mainHorizontal.css('top', mainOffset.y);
      this.innerVertical.css('left', innerOffset.x);
      this.innerHorizontal.css('top', innerOffset.y);
      if (mtv._mouseInElementBox(targets[3], 'x')) {
        this.innerVertical.removeClass('hidden');
      } else {
        this.innerVertical.addClass('hidden');
      }
      if (mtv._mouseInElementBox(targets[3], 'y')) {
        this.innerHorizontal.removeClass('hidden');
      } else {
        this.innerHorizontal.addClass('hidden');
      }
      ref3 = (ref2 = this.inTargetHighlights) != null ? ref2 : [];
      for (l = 0, len1 = ref3.length; l < len1; l++) {
        highlight = ref3[l];
        highlight.remove();
      }
      this.inTargetHighlights = [];
      for (o = 0, len2 = targets.length; o < len2; o++) {
        target = targets[o];
        if (mtv._mouseInElementBox(target)) {
          offset = mtv._mouseOffsetFromElement(target);
          vertical = this.makeLine(3, '100%', target).css('left', offset.x - 1).css('background-color', 'rgba(98, 255, 249, 0.5)');
          horizontal = this.makeLine('100%', 3, target).css('top', offset.y - 1).css('background-color', 'rgba(98, 255, 249, 0.5)');
          this.inTargetHighlights.push(vertical, horizontal);
        }
      }
      m = function() {
        this.innerVertical.css('border-left', '1px solid rgb(64, 136, 133)');
        this.innerVertical.css('border-right', '1px solid rgb(64, 136, 133)');
        this.innerHorizontal.css('border-top', '1px solid rgb(64, 136, 133)');
        return this.innerHorizontal.css('border-bottom', '1px solid rgb(64, 136, 133)');
      };
      color = this.inTargetHighlights.length > 0 ? 'rgb(98, 255, 249)' : 'rgba(255, 103, 103, 0.5)';
      ref4 = this.lines;
      results = [];
      for (p = 0, len3 = ref4.length; p < len3; p++) {
        line = ref4[p];
        results.push(line.css('background-color', color));
      }
      return results;
    },
    down: function(event) {
      var l, len1, line, ref2;
      if (!this.lines) {
        this.setup();
      }
      ref2 = this.lines;
      for (l = 0, len1 = ref2.length; l < len1; l++) {
        line = ref2[l];
        line.removeClass('hidden');
      }
      return this.positionLines(event);
    },
    start: function(event, mdEvent) {},
    drag: function(event, mdEvent) {
      return this.positionLines(event);
    },
    stop: function(event, mdEvent) {},
    up: function(event, mdEvent) {
      var highlight, l, len1, len2, line, o, ref2, ref3, ref4, ref5, results;
      ref3 = (ref2 = this.lines) != null ? ref2 : [];
      for (l = 0, len1 = ref3.length; l < len1; l++) {
        line = ref3[l];
        line.addClass('hidden');
      }
      ref5 = (ref4 = this.inTargetHighlights) != null ? ref4 : [];
      results = [];
      for (o = 0, len2 = ref5.length; o < len2; o++) {
        highlight = ref5[o];
        results.push(highlight.remove());
      }
      return results;
    },
    click: function(event) {},
    enter: function(event) {},
    leave: function(event) {}
  });
  actions.push({
    down: function(event) {
      var containerDims, targetDims;
      this.initialTop = parseFloat(targets[4].css('top'));
      if (!this.range) {
        targetDims = mtv._mouseElementDimensions(targets[4]);
        containerDims = mtv._mouseElementContainerDimensions(targets[4]);
        return this.range = {
          height: containerDims.height - targetDims.height
        };
      }
    },
    start: function(event, mdEvent) {},
    drag: function(event, mdEvent) {
      var displacement, newTop;
      displacement = mtv._mouseDisplacement();
      newTop = bound(this.initialTop + displacement.y, this.range.height);
      return targets[4].css('top', newTop);
    },
    stop: function(event, mdEvent) {},
    up: function(event, mdEvent) {},
    click: function(event) {},
    enter: function(event) {},
    leave: function(event) {}
  });
  actions.push({
    fire: function(projectile, distance) {
      var _distance, up;
      _distance = 0;
      up = function(projectile) {
        projectile.css('bottom', _distance++);
        if (_distance < distance) {
          return setTimeout((function() {
            return up(projectile);
          }), 3);
        } else {
          return projectile.remove();
        }
      };
      return up(projectile);
    },
    down: function(event) {
      var containerDims, targetDims;
      this.initialLeft = parseFloat(targets[5].css('left'));
      this.initialTop = parseFloat(targets[5].css('top'));
      if (!this.range) {
        targetDims = mtv._mouseElementDimensions(targets[5]);
        containerDims = mtv._mouseElementContainerDimensions(targets[5]);
        return this.range = {
          width: containerDims.width - targetDims.width,
          height: containerDims.height - targetDims.height
        };
      }
    },
    start: function(event, mdEvent) {},
    drag: function(event, mdEvent) {
      var displacement, newLeft;
      displacement = mtv._mouseDisplacement();
      newLeft = bound(this.initialLeft + displacement.x, this.range.width);
      return targets[5].css('left', newLeft);
    },
    stop: function(event, mdEvent) {},
    up: function(event, mdEvent) {},
    click: function(event) {
      var containerDims, projectile, rand, targetDims, targetLeft;
      rand = function() {
        return (Math.floor(Math.random() * 257)).toString(16);
      };
      targetLeft = parseFloat(targets[5].css('left'));
      targetDims = mtv._mouseElementDimensions(targets[5]);
      containerDims = mtv._mouseElementContainerDimensions(targets[5]);
      projectile = $('<div>').height(10).width(10).css('position', 'absolute').css('left', targetLeft + targetDims.width / 2 - 5).css('border-radius', 5).css('background-color', "#" + (rand()) + (rand()) + (rand())).appendTo(mtv.$el);
      return this.fire(projectile, containerDims.height);
    },
    enter: function(event) {},
    leave: function(event) {}
  });
  forward = function(eventType, args) {
    var idx, l, len1, mouseTarget, ref2;
    console.log(eventType);
    mouseTarget = (function() {
      switch (eventType) {
        case 'click':
        case 'enter':
        case 'leave':
          return args[0].target;
        default:
          return mtv._mousedownTarget()[0];
      }
    })();
    for (i = l = 0, len1 = targets.length; l < len1; i = ++l) {
      target = targets[i];
      if (target[0] === mouseTarget || target[0] === $(mouseTarget).parent()[0]) {
        idx = i;
      }
    }
    return (ref2 = actions[idx])[eventType].apply(ref2, args);
  };
  pref = 'MouseTrackingView:MouseDid';
  mtv.on(pref + "Mousedown", function(event) {
    return forward('down', arguments);
  });
  mtv.on(pref + "Start", function(event, mdEvent) {
    return forward('start', arguments);
  });
  mtv.on(pref + "Drag", function(event, mdEvent) {
    return forward('drag', arguments);
  });
  mtv.on(pref + "Stop", function(event, mdEvent) {
    return forward('stop', arguments);
  });
  mtv.on(pref + "Mouseup", function(event, mdEvent) {
    return forward('up', arguments);
  });
  mtv.on(pref + "Click", function(event) {
    return forward('click', arguments);
  });
  mtv.on(pref + "Mouseenter", function(event) {
    return forward('enter', arguments);
  });
  mtv.on(pref + "Mouseleave", function(event) {
    return forward('leave', arguments);
  });
  $player.append(container.append(mtv.el));
  results = [];
  for (i = l = 0, len1 = targets.length; l < len1; i = ++l) {
    target = targets[i];
    results.push(target.css('top', container.height() / 6 * i).css('left', container.width() / 6 * i));
  }
  return results;
});
