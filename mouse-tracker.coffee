################################################################################
#
# cobbled together from old athena-lib-js and acorn-player files. no promises of
# neatness.
#
# find the original source code at:
# - https://github.com/athenalabs/athena-lib-js
# - https://github.com/athenalabs/acorn-player
#
# try it online at:
# - http://tenedor.github.io/mouse-tracker/
#
################################################################################


# ------------------------------------------------------
# scaffold the necessary context that's no longer around
# ------------------------------------------------------


goog =
  provide: () ->
  require: () ->

athena =
  lib:
    util: {}

acorn =
  config: {}
  util: {}
  player: {}



# --------------------------
# athena-lib-js: util.coffee
# --------------------------


goog.provide 'athena.lib.util'

util = athena.lib.util

# Helper to check the inheritance chain.
util.derives = derives = (child, parent) ->

  if !child || !child.__super__
    return false

  if parent.prototype is child.__super__
    return true

  derives child.__super__.constructor, parent

util.isOrDerives = (child, parent) ->
  child == parent or derives child, parent

util.isStrictObject = (obj) ->
  obj?.toString() == '[object Object]'


# Check if an element or set of elements is in the DOM
util.elementInDom = (element) ->
  if element instanceof $
    return _.all element, util.elementInDom

  while element = element?.parentNode
    if element == document
      return true

  return false


util.socialPlugins =

  initialize: (options = {}) ->
    # facebook async setup - requires appId param
    if options.facebook?.appId
      window.fbAsyncInit = ->
        FB.init
          appId: options.facebook.appId
          channelUrl: options.facebook.channelUrl # optional url; smooths x-domain
          status: options.facebook.status ? true # check login status
          cookie: options.facebook.cookie ? true # enable cookies
          xfbml: options.facebook.xfbml ? true # parse XFBML

        options.facebook.onInit?()

    # include relevant plugin scripts

    scriptParams = []

    if options.facebook?.appId
      scriptParams.push
        id: 'facebook-jssdk'
        src: '//connect.facebook.net/en_US/all.js'
        async: true

    if options.googlePlus
      scriptParams.push
        id: 'g-plus1'
        src: 'https://apis.google.com/js/plusone.js'
        async: true

    if options.twitter
      scriptParams.push
        id: 'twitter-wjs'
        src: 'https://platform.twitter.com/widgets.js'

    # build and insert script tags
    for params in scriptParams
      unless document.getElementById params.id
        ref = document.getElementsByTagName('script')[0]
        script = document.createElement 'script'
        script.type = 'text/javascript'
        script.id = params.id
        script.src = params.src
        if params.async
          script.async = true
        ref.parentNode.insertBefore script, ref


  facebookLogin: (options = {}) ->
    login = () ->
      FB.login (response) ->
        if response.authResponse
          # connected
          options.success?()
        else
          # cancelled
          options.failure?()

    FB.getLoginStatus (response) ->
      if response.status == 'connected'
        # connected
        options.success?()
      else if response.status == 'not_authorized'
        # not authorized
        login()
      else
        # not logged in
        login()


  facebookPicture: (id, type = 'large') ->
    "//graph.facebook.com/#{id}/picture?type=#{type}"



# ---------------------------
# athena-lib-js: model.coffee
# ---------------------------


goog.provide 'athena.lib.Model'

# top level model for athena.lib
class athena.lib.Model extends Backbone.Model

  # static method for adding property manager methods
  @property: (property, options={}) ->
    unless _.isString property
      throw new Error 'property method: first argument must be a string'
    unless athena.lib.util.isStrictObject options
      options = {}

    (value) ->
      if options.setter isnt false and value?
        @set property, value
      @get(property) ? options.default

  # ensure clone is deeply-copied, as acorn data is a multilevel object
  # this approach to deep-copy is ok because all our data should be
  # JSON serializable.
  #
  # See https://github.com/documentcloud/underscore/issues/162 as to why
  # underscore does not implement deep copy.
  clone: => return new @constructor @toJSON()

  toJSON: => return JSON.parse JSON.stringify @attributes

  toJSONString: => return JSON.stringify @toJSON()

  # CORS settings for Backbone.sync
  sync: (method, model, options) =>
    options.xhrFields ?= {}
    options.xhrFields.withCredentials = true
    options.crossDomain = true
    Backbone.sync method, model, options



# --------------------------
# athena-lib-js: view.coffee
# --------------------------


goog.provide 'athena.lib.View'

# top level view for athena.lib
class athena.lib.View extends Backbone.View

  className: ''

  # extend className with `className: @classNameExtend 'additional-class'`
  @classNameExtend: (className) ->
    superClass = @::className
    if superClass then superClass + ' ' + className else className

  # Defaults for view options.
  defaults: =>

    # additional classes for the element
    extraClasses: []

    # Event aggregator (like NSNotificationCenter)
    eventhub: undefined

  # Events for view options.
  events: => {}

  # Attributes to set onto the element on render
  elAttributes: => {}

  initialize: =>
    super

    # Extend options with defaults.
    @options = @options or {}
    _.defaults @options, @defaults()

    # If no eventhub is provided, this object is used as the eventhub.
    @eventhub = @options.eventhub || @

    # optionally add custom class names
    if @options.extraClasses
      classes = @options.extraClasses
      classes = [classes] if _.isString classes
      _.each classes, (name) =>
        @$el.addClass name

  # Utility function for the complete removal of a View.
  destroy: =>
    @rendering = false
    @remove()
    @unbind()
    @uninitialize()

  # Whether this view should continue to rerender with updated information
  rendering: false

  # Render by default calls delegateEvents
  render: =>
    super

    @rendering = true
    @delegateEvents()

    # set all elAttributes directly on the element
    _.each @elAttributes(), (val, key) =>
      unless @$el.attr(key) == val
        @$el.attr key, val

    @

  # Renders only if the view is in the ``rendering`` state.
  softRender: =>
    if @rendering
      @render()
    @

  # Overridable function meant to mirror Backbone.View's initialize()
  uninitialize: ->



# ---------------------------
# acorn-player: config.coffee
# ---------------------------


if typeof acorn is 'undefined'
  acorn = {}

goog.provide 'acorn.config'

_.extend acorn.config,
  version: '0.0.0'
  url:
    base: 'https://acorn.athena.ai'
  api:
    version: '0.0.2'


acorn.config.setUrlBase = (base) ->
  acorn.config.url.base = base
  acorn.config.url.img = "#{base}/img"
  acorn.config.url.api = "#{base}/api/v#{acorn.config.api.version}"

acorn.config.setUrlBase acorn.config.url.base


acorn.config.img = {}
acorn.config.img.acorn = "#{acorn.config.url.img}/acorn.png"


acorn.config.css = [
  '/build/css/acorn.player.css',
  '/lib/fontawesome/css/font-awesome.css',
]


# TODO: move these config properties to a test specific config file once
# the build system adequately processes imports
acorn.config.test = {}
acorn.config.test.timeout = 10000  # time in miliseconds



# -------------------------
# acorn-player: util.coffee
# -------------------------


goog.provide 'acorn.util'

goog.require 'acorn.config'



util = acorn.util


util.assert = (condition, description) ->
  throw new Error description if not condition


util.urlRegEx = (url) ->
    # temporary. should move away from using urlRegEx this way:
    if url
      return ///(https?:\/\/)?#{url ? '.*'}///

    # john gruber's URL regex
    # http://daringfireball.net/2010/07/improved_regex_for_matching_urls

    ///
    ^
    (                       # Capture 1: entire matched URL
      (?:
        https?://               # http or https protocol
        |                       #   or
        www\d{0,3}[.]           # "www.", "www1.", "www2." … "www999."
        |                           #   or
        [a-z0-9.\-]+[.][a-z]{2,4}/  # looks like domain name followed by a slash
      )
      (?:                       # One or more:
        [^\s()<>]+                  # Run of non-space, non-()<>
        |                           #   or
        \(([^\s()<>]+|(\([^\s()<>]+\)))*\)  # balanced parens, up to 2 levels
      )+
      (?:                       # End with:
        \(([^\s()<>]+|(\([^\s()<>]+\)))*\)  # balanced parens, up to 2 levels
        |                               #   or
        [^\s`!()\[\]{};:'".,<>?«»“”‘’]        # not a space or punct char
      )
    )
    $
    ///


util.isUrl = (url) ->
  url = String(url)
  @urlRegEx().test url


util.isPath = (path) ->
  /^[A-Za-z\/.-_]+$/.test path


# helpers to construct acorn urls TODO: delete these?
util.url = ->
  path = _.toArray(arguments).join '/'
  "//#{acorn.config.domain}/#{path}"


util.apiUrl = ->
  apiPath = "api/v#{acorn.config.api.version}".split '/'
  @url.apply(@, apiPath.concat _.toArray arguments)


util.imgUrl = ->
  @url.apply(@, ['img'].concat _.toArray arguments)


# fixes given url (or fragment) to be more correct
util.urlFix = (url) ->
  # return blank/falsy urls
  unless url
    return url

  unless /^([a-z0-9]+:)?\/\//i.test url
    url = "http://#{url}"

  url


# construct an <iframe> element, with `src` and `id`
util.iframeOptions =
  frameborder: 0
  border: 0
  width: '100%'
  height: '100%'
  allowFullScreen: 'true'
  webkitAllowFullScreen: 'true'
  mozallowfullscreen: 'true'
  # needed for iris, but breaks youtube flash. put in an IrisShell:
  # sandbox: 'allow-forms allow-same-origin allow-scripts allow-top-navigation'


# construct an <iframe> element, with `src` and `id`
util.iframe = (src, id) ->
  f = $ '<iframe>'
  _.map @iframeOptions, (val, key) ->
    f.attr key, val
  f.attr 'src', src
  f.attr 'id', id if id?
  f


# get the acorn variable in given <iframe> element
util.acornInIframe = (iframe) ->
  iframe = iframe.get 0 if iframe.jquery?
  win = iframe.contentWindow ? iframe.contentDocument.defaultView
  win.acorn


# creates and returns a get/setter with a closured variable
util.property = (defaultValue, validate) ->
  storedValue = defaultValue
  validate ?= (x) -> x

  (value) ->
    storedValue = validate value if value?
    storedValue


# requests full screen with given elem
util.fullscreen = (elem) ->
  $(elem).fullScreen()


# add acorn css
util.appendCss = (srcs) ->
  srcs ?= acorn.config.css
  srcs = [srcs] unless _.isArray(srcs)
  _.each srcs, (src) ->
    unless $("link[rel='stylesheet'][href='#{src}']").length
      css = $('<link>')
      css.attr 'rel', 'stylesheet'
      css.attr 'href', src
      $('body').append css


# check if element is in the DOM
# inspired by StackOverflow: http://stackoverflow.com/questions/5629684/
util.elementInDom = (element) ->
  if element instanceof $
    return _.all element, util.elementInDom

  while element = element?.parentNode
    if element == document
      return true

  return false


# helper for util.toPercent and util.fromPercent
util._scrubPercentParams = (params) ->
  # params can be an object or the high value
  unless _.isObject params
    params = high: params

  # extract params, assign defaults
  params.low ?= 0
  params.high ?= MissingParameterError 'percent conversion utility', 'high'
  params.bound ?= false

  params


# convert a value to a percentage with reference to high and low values
util.toPercent = (value, params) ->
  # scrub params
  params = util._scrubPercentParams params

  # calculate percent
  percent = (value - params.low) / (params.high - params.low) * 100

  # bind if desired
  if params.bound
    percent = util.bound percent

  # limit digits after decimal if desired
  if params.decimalDigits?
    percent = Number percent.toFixed params.decimalDigits

  percent


# convert a percentage to a value with reference to high and low values
util.fromPercent = (percent, params) ->
  # scrub params
  params = util._scrubPercentParams params

  # bind if desired
  if params.bound
    percent = util.bound percent

  # calculate value
  value = percent / 100 * (params.high - params.low) + params.low

  # limit digits after decimal if desired
  if params.decimalDigits?
    value = Number value.toFixed params.decimalDigits

  value


# bound n between high and low values; by default, bounds percentages (0 to 100)
util.bound = (n, opts = {}) ->
  low = opts.low ? 0
  high = opts.high ? 100

  unless opts.enforceNumber == false
    n = Number n

  if n < low then low
  else if n > high then high
  else n


# Originally from StackOverflow
# http://stackoverflow.com/questions/736513
util.parseUrl = (url) ->
  # simple `url` validation
  # should extend to perform more comprehensive tests
  ValueError 'url', 'should not be the empty string.' if url == ''

  result = {}

  # trim out any whitespace
  url = $.trim url

  # if no protocol is found, prepend http
  url = "http://#{url}" unless /^([a-z0-9]+:)?\/\//i.test url

  anchor = document.createElement 'a'
  anchor.href = url

  keys = 'protocol hostname host pathname port search hash href'
  (result[key] = anchor[key]) for key in keys.split ' '

  # port-fix for phantomjs
  result.port = '' if result.port == '0'

  result.toString = -> result.href
  result.resource = result.pathname + result.search
  result.extension = result.pathname.split('.').pop()

  result.head = -> throw new Error('head not supported. Yet.')

  _.each result, (val, key) ->
    if (not /_$/.test key) and (typeof(val) is 'string')
      result[key + '_'] = val.toLowerCase()

  result



# track mouse location at all times
util.mouseLocationTracker = (->
  id = 0
  subscribed = []
  tracker =
    x: undefined
    y: undefined
    active: false

  onMousemove = (e) ->
    tracker.x = e.pageX
    tracker.y = e.pageY

  startTracking = ->
    tracker.active = true
    $(document).on 'mousemove.mouseLocationTracker', onMousemove

  stopTracking = ->
    tracker.active = false
    tracker.x = undefined
    tracker.y = undefined
    $(document).off 'mousemove.mouseLocationTracker', onMousemove

  # subscribe to tracker to ensure it activates
  tracker.subscribe = () ->
    unless tracker.active
      startTracking()
    subscribed.push id
    id++

  # unsubscribe id when done for efficiency
  tracker.unsubscribe = (id) ->
    subscribed = _.without subscribed, id
    if subscribed.length == 0
      stopTracking()

  tracker
)()



# converts human-readable timestring to seconds and back
# human-readable format is: [[hh:]mm:]ss[.SSS]
class util.Time


  constructor: (time, @options = {}) ->
    @time = @constructor.timestringToSeconds time


  seconds: => @time
  timestring: => @constructor.secondsToTimestring @time, @options


  @timestringToSeconds: (timestring) =>
    timestring = String(timestring ? 0)

    # handle subsec [.SSS]
    [rest, subsec] = timestring.split '.'
    subsec = parseFloat "0.#{subsec ? '0'}"

    # handle [[hh:]mm:]ss
    rest = rest.split(':').reverse()
    [sec, min, hrs] = _.map [0, 1, 2], (n) -> parseInt(rest[n], 10) or 0

    # convert to seconds
    (hrs * 60 * 60) + (min * 60) + sec + subsec


  @secondsToTimestring: (seconds, options = {}) =>
    sec = parseInt seconds, 10

    hrs = parseInt sec / (60 * 60), 10
    sec -= hrs * 60 * 60

    min = parseInt sec / 60, 10
    sec -= min * 60

    subsec = seconds % 1
    if subsec
      subsec = Math.round(subsec * 1000) / 1000
      subsec = String(subsec).substr 1, 4 # remove first 0
      subsec = subsec.replace /0+$/, ''

    hrs = if hrs == 0 then '' else "#{hrs}:"
    pad = (n) -> if n < 10 then "0#{n}" else "#{n}"

    if hrs == '' and options.padTime == false
      if min == 0 then min = '' else min = "#{min}:"
    else
      min = "#{pad min}:"

    unless min == ''
      sec = pad sec

    "#{hrs}#{min}#{sec}#{subsec or ''}"



class util.Timer


  constructor: (@interval, @callback, @args) ->
    @callback ?= ->
    @args ?= []
    @args = [@args] unless _.isArray @args


  startTick: =>
    @stopTick()
    @intervalObject = setInterval @onTick, @interval


  stopTick: =>
    if @intervalObject
      clearInterval @intervalObject
      @intervalObject = undefined


  onTick: =>
    @callback @args...



# -- regular expressions

util.LINK_REGEX = /// ^
    https?://[-A-Za-z0-9+&@#/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#/%=~_()|]
  ///



# -- jQuery utils

# Preserve image aspect ratio but contain it wholly
# See https://github.com/schmidsi/jquery-object-fit
# setTimeout bypasses https://github.com/schmidsi/jquery-object-fit/issues/3
util.fixObjectFit = ->
  objectFit_ = $.fn.objectFit
  $.fn.objectFit = ->
    console.log 'Object Fit currently disabled.'
    # setTimeout (=> objectFit_.apply @, arguments), 200
    @

util.fixObjectFit()


# inserts element at specific index
$.fn.insertAt = (index, element) ->
  lastIndex = @children().size()

  # negative indices wrap
  if index < 0
    index = Math.max(0, lastIndex + 1 + index) if index < 0

  @append element

  # move into position
  if index < lastIndex
    @children().eq(index).before(@children().last())

  @



# --------------------------------------
# acorn-player: mouseTrackingView.coffee
# --------------------------------------


goog.provide 'acorn.player.MouseTrackingView'


# Adapted from jQueryUI's $.ui.mouse widget - thanks jQuery!



class acorn.player.MouseTrackingView extends athena.lib.View


  className: @classNameExtend 'mouse-tracking-view'


  _targetClassName: => 'mouse-target'


  defaults: => _.extend super,
    mouseMinimumDistance: 1
    mouseMinimumDelay: 0

    # The namespace appended to global event bindings for disambiguation
    # purposes. Not related to events fired by MouseTrackingView.
    mouseEventsNamespace: 'mousetracking'


  events: => _.extend super,
    # ignore all clicks inside a mouse-ignore element and mouse-target clicks
    # inside a mouse-ignore-targets element
    'mousedown .mouse-ignore': @_onMousedownIgnore
    'mousedown .mouse-ignore .mouse-target': @_onMousedownIgnore
    'mousedown .mouse-ignore-targets .mouse-target': @_onMousedownIgnore

    'mousedown .mouse-target': @_onMousedownMouseTarget
    'click .mouse-target': @_onClickMouseTarget
    'mouseenter .mouse-target': @_onMouseenterMouseTarget
    'mouseleave .mouse-target': @_onMouseleaveMouseTarget


  template: _.template '''
    <div class="<%= targetClassName %>"></div>
    '''

  initialize: =>
    super

    # ensure mouse location is tracked
    @_mouseLocationTrackerId = util.mouseLocationTracker.subscribe()

    @listenTo @, 'MouseTrackingView:MouseDidMousedown', @_onMouseDidMousedown
    @listenTo @, 'MouseTrackingView:MouseDidStart', @_onMouseDidStart
    @listenTo @, 'MouseTrackingView:MouseDidDrag', @_onMouseDidDrag
    @listenTo @, 'MouseTrackingView:MouseDidStop', @_onMouseDidStop
    @listenTo @, 'MouseTrackingView:MouseDidMouseup', @_onMouseDidMouseup
    @listenTo @, 'MouseTrackingView:MouseDidClick', @_onMouseDidClick
    @listenTo @, 'MouseTrackingView:MouseDidMouseenter', @_onMouseDidMouseenter
    @listenTo @, 'MouseTrackingView:MouseDidMouseleave', @_onMouseDidMouseleave


  destroy: =>
    super

    # unsubscribe from mouse location tracker
    util.mouseLocationTracker.unsubscribe @_mouseLocationTrackerId

    # remove global event bindings in case mousedown is active
    $(document).off "mousemove.#{@mouseEventsNamespace}", @_onMouseMove
    $(document).off "mouseup.#{@mouseEventsNamespace}", @_onMouseUp


  render: =>
    super
    @$el.empty()
    @$el.append @template targetClassName: @_targetClassName()
    @


  # Mouse tracking logic - overriding in child classes is not recommended
  # ---------------------------------------------------------------------

  _onMousedownIgnore: (event) =>
    @_mousedownIgnoreEvent = event


  _onMousedownMouseTarget: (event) =>
    # Click event may never have fired (Gecko & Opera)
    @_preventClickEvent = false

    # we may have missed mouseup (out of window)
    @_mouseStarted && @_onMouseUp event

    # only respond to left-clicks
    unless event.which == 1
      return

    if event == @_mousedownIgnoreEvent
      return

    @_mousedownEvent = event
    @_mousedownTarget().addClass 'mouse-is-down'
    @trigger 'MouseTrackingView:MouseDidMousedown', event

    # reset mouse delay flag
    @_mouseDelayAchieved = false

    if @_mouseMinimumDistanceMet(event) and @_mouseMinimumDelayMet event
      # abort if disabled
      if @_preventMouseStart event
        return
      else
        @_mouseStarted = true
        @trigger 'MouseTrackingView:MouseDidStart', event, @_mousedownEvent

    # don't select text and other page elements when dragging
    event.preventDefault()

    $(document).on "mousemove.#{@mouseEventsNamespace}", @_onMouseMove
    $(document).on "mouseup.#{@mouseEventsNamespace}", @_onMouseUp


  _onMouseMove: (event) =>
    # IE mouseup check - mouseup may have happened when mouse was out of window
    ie = !!/msie [\w.]+/.exec navigator.userAgent.toLowerCase()
    if (ie and (!document.documentMode or document.documentMode < 9) and
        !event.button) then return @_onMouseUp event

    if @_mouseStarted
      @trigger 'MouseTrackingView:MouseDidDrag', event, @_mousedownEvent
      return

    if @_mouseMinimumDistanceMet(event) and @_mouseMinimumDelayMet event
      # abort if disabled
      if @_preventMouseStart @_mousedownEvent, event
        @_onMouseUp event
        return

      @_mouseStarted = true
      @trigger 'MouseTrackingView:MouseDidStart', event, @_mousedownEvent
      @trigger 'MouseTrackingView:MouseDidDrag', event, @_mousedownEvent


  _onMouseUp: (event) =>
    # clean up global listeners and lingering timeouts
    $(document).off "mousemove.#{@mouseEventsNamespace}", @_onMouseMove
    $(document).off "mouseup.#{@mouseEventsNamespace}", @_onMouseUp
    clearTimeout @_mouseDelayCountdown

    if @_mouseStarted
      @_mouseStarted = false

      if @_mousedownTarget()[0] == @_mousedownEvent.target
        @_preventClickEvent = true

      @trigger 'MouseTrackingView:MouseDidStop', event, @_mousedownEvent

    @trigger 'MouseTrackingView:MouseDidMouseup', event, @_mousedownEvent
    @_mousedownTarget().removeClass 'mouse-is-down'
    @_mousedownEvent = undefined


  _onClickMouseTarget: (event) =>
    if @_preventClickEvent
      @_preventClickEvent = false
      event.stopImmediatePropagation()
      return false
    else
      @trigger 'MouseTrackingView:MouseDidClick', event


  _onMouseenterMouseTarget: (event) =>
    @trigger 'MouseTrackingView:MouseDidMouseenter', event


  _onMouseleaveMouseTarget: (event) =>
    @trigger 'MouseTrackingView:MouseDidMouseleave', event


  # Mouse start governors
  # ---------------------

  # return a truthy value to block a mousestart (override as desired)
  _preventMouseStart: (mousedownEvent, event) =>


  _mouseMinimumDistanceMet: (event) =>
    {x, y} = @_mouseDisplacement()
    distance = Math.sqrt(x * x + y * y)
    distance >= @options.mouseMinimumDistance


  _mouseMinimumDelayMet: (event) =>
    delay = @options.mouseMinimumDelay
    if delay > 0 and not @_mouseDelayAchieved
      @_mouseDelayCountdown = setTimeout (=> @_mouseDelayAchieved = true), delay
      false
    else
      true


  # Mouse event handlers - override in child classes as desired
  # -----------------------------------------------------------

  _onMouseDidMousedown: (event) =>

  _onMouseDidStart: (event, mousedownEvent) =>

  _onMouseDidDrag: (event, mousedownEvent) =>

  _onMouseDidStop: (event, mousedownEvent) =>

  _onMouseDidMouseup: (event, mousedownEvent) =>

  _onMouseDidClick: (event) =>

  _onMouseDidMouseenter: (event) =>

  _onMouseDidMouseleave: (event) =>


  # Mouse target utilities
  # ----------------------

  _mousedownTarget: () =>
    el = @_mousedownEvent?.target
    if el? then $ el else undefined


  _mouseElement: ($el) =>
    $ $el ? @_mousedownTarget() ? @$('.mouse-target').first()


  _mouseElementContainer: ($el) =>
    @_mouseElement($el).offsetParent()


  _mouseElementDimensions: ($el) =>
    $el = @_mouseElement $el
    width: $el.width(), height: $el.height()


  _mouseElementContainerDimensions: ($el) =>
    container = @_mouseElementContainer $el
    width: container.width(), height: container.height()


  _mouseElementPercentOfContainer: ($el, $containerEl) =>
    # get element and container dimensions
    el = @_mouseElementDimensions $el
    if $containerEl?
      container = @_mouseElementDimensions $containerEl
    else
      container = @_mouseElementContainerDimensions $el

    # calculate percents
    x: el.width * 100 / container.width, y: el.height * 100 / container.height


  # Mouse position utilities
  # ------------------------

  # uses element width and height - considers basic box model and is ignorant
  # of border-radius
  _mouseInElementBox: ($el, dimension) =>
    $el = $ $el
    offset = @_mouseOffsetFromElement $el
    inWidth = 0 <= offset.x <= $el.outerWidth()
    inHeight = 0 <= offset.y <= $el.outerHeight()
    if dimension == 'x' or dimension == 'width' then inWidth
    else if dimension == 'y' or dimension == 'height' then inHeight
    else inWidth and inHeight


  _mouseOffsetFromElement: ($el) =>
    unless $el
      MissingParameterError 'MouseTrackingView._mouseOffsetFromElement', '$el'

    $el = $ $el
    x = util.mouseLocationTracker.x - $el.offset().left
    y = util.mouseLocationTracker.y - $el.offset().top
    x: x, y: y


  # current mouse position x and y displacement from coordinates; uses mousedown
  # event by default
  _mouseDisplacement: (initial = @_mousedownEvent) =>
    dx = util.mouseLocationTracker.x - (initial?.pageX ? initial?.x)
    dy = util.mouseLocationTracker.y - (initial?.pageY ? initial?.y)
    x: dx, y: dy


  _percentMouseDisplacement: (options = {}) =>
    startEvent = options.startEvent ? @_mousedownEvent
    dimensionsFn = options.dimensionsFn ? @_mouseElementContainerDimensions

    # get $el conditionally since startEvent can be undefined if getting offset
    el = options.$el ? options.el ? startEvent?.target
    $el = $ el if el?

    # calculate dimensions from $el, but use options dimensions when available
    calculatedDimensions = dimensionsFn $el
    width = options.width ? calculatedDimensions.width
    height = options.height ? calculatedDimensions.height

    # get coordinate difference from mouse location
    {x, y} =
      if _$el = options.offsetFromElement
        _$el = if util.elementInDom(_$el) then _$el else $el
        @_mouseOffsetFromElement _$el
      else
        @_mouseDisplacement startEvent

    # calculate and return percent changes against width and height
    x: (x * 100 / width), y: (y * 100 / height)


  _percentElementMouseDisplacement: (options = {}) =>
    options = _.clone options
    options.dimensionsFn = @_mouseElementDimensions
    @_percentMouseDisplacement options


  _percentContainerMouseDisplacement: (options = {}) =>
    options = _.clone options
    options.dimensionsFn = @_mouseElementContainerDimensions

    # by default, percentOffset should get offset from container, not element
    if (_$el = options.offsetFromElement)? and not util.elementInDom _$el
      $el = options.$el ? options.el ? options.startEvent?.target
      options.offsetFromElement = @_mouseElementContainer $el

    @_percentMouseDisplacement options



# -------------------------------------------
# acorn-player: mouseTrackingView.spec.coffee
# -------------------------------------------

# Note: this code is a reduced version of the original file. Since it was used
# as test code, it was original wrapped in some test harness code.


goog.provide 'acorn.specs.views.MouseTrackingView'

goog.require 'acorn.player.MouseTrackingView'


$('document').ready ->
  MouseTrackingView = acorn.player.MouseTrackingView

  defaultOpts = ->
    eventhub: _.extend {}, Backbone.Events

  # construct a new mouse tracking view and receive pointers to the view and its
  # mouse-target element
  setupMTV = (opts) =>
    opts = _.defaults (opts ? {}), defaultOpts()
    mtv = new MouseTrackingView opts
    mtv.render()
    target = mtv.$ '.mouse-target'
    [mtv, target]


  # setup DOM
  $player = $('<div>').addClass('acorn-player').width(500).height(400)
    .appendTo('.mouse-tracker')

  # container css
  container = $('<div>')
    .height(240)
    .width('100%')
    .css('background-color', '#DDD')
    .css('overflow', 'hidden')

  # add to the DOM to see how it looks
  [mtv, target] = setupMTV location: 20

  mtv.$el.height('100%').width '100%'

  # make some extra targets
  targets = [target]
  makeTarget = -> mtv.template targetClassName: mtv._targetClassName()
  for i in [0...5]
    target = $ makeTarget()
    targets.push target
    mtv.$el.append target

  # target css
  for target, i in targets
    target
      .height(15 + 5 * i)
      .width(40 - 5 * i)
      .css('background-color', '#555')

  # helper function
  bound = (n, max) ->
    if n < 0 then 0
    else if n > max then max
    else n

  actions = []

  # target[0] - change colors depending on state
  actions.push
    down: (event) ->
      @started = false
      clearTimeout @_delayedReset
      targets[0].css 'background-color', '#E44'

    start: (event, mdEvent) ->
      @started = true

    drag: (event, mdEvent) ->
      targets[0].css 'background-color', '#393'

    stop: (event, mdEvent) ->
      targets[0].css 'background-color', '#939'
      unless mtv._mouseInElementBox targets[0]
        targets[0].height(@initialDims.height).width @initialDims.width

    up: (event, mdEvent) ->
      reset = () =>
        targets[0].css 'background-color', '#555'
        unless mtv._mouseInElementBox targets[0]
          targets[0].height(@initialDims.height).width @initialDims.width

      if @started then @delayedReset = setTimeout reset, 600 else reset()
      @started = false

    click: (event) ->
    enter: (event) ->
      @initialDims ?= height: targets[0].height(), width: targets[0].width()
      targets[0].height(@initialDims.width * 2).width @initialDims.width * 2

    leave: (event) ->
      unless @started
        targets[0].height(@initialDims.height).width @initialDims.width

  # target[1] - slide horizontally
  actions.push
    down: (event) ->
      # prepare for movement
      @initialLeft = parseFloat targets[1].css 'left'
      @initialTop = parseFloat targets[1].css 'top'
      unless @range
        targetDims = mtv._mouseElementDimensions targets[1]
        containerDims = mtv._mouseElementContainerDimensions targets[1]
        @range =
          width: containerDims.width - targetDims.width
          height: containerDims.height - targetDims.height

    start: (event, mdEvent) ->
    drag: (event, mdEvent) ->
      # move in 1D
      displacement = mtv._mouseDisplacement()
      newLeft = bound @initialLeft + displacement.x, @range.width
      targets[1].css 'left', newLeft

    stop: (event, mdEvent) ->
    up: (event, mdEvent) ->
    click: (event) ->
    enter: (event) ->
    leave: (event) ->

  # target[2] - move around, change color intensity with speed
  actions.push
    down: (event) ->
      # set up color
      @hexValue ?= 0x55

      # prepare for movement
      @initialLeft = parseFloat targets[2].css 'left'
      @initialTop = parseFloat targets[2].css 'top'
      unless @range
        targetDims = mtv._mouseElementDimensions targets[2]
        containerDims = mtv._mouseElementContainerDimensions targets[2]
        @range =
          width: containerDims.width - targetDims.width
          height: containerDims.height - targetDims.height

    start: (event, mdEvent) ->
      targets[2].css 'border', '1px solid #555'

    drag: (event, mdEvent) ->
      # increase color
      @hexValue += 8
      color = =>
        hex = @hexValue.toString 16
        targets[2].css 'background-color', "##{hex}#{hex}#{hex}"
      color()

      # reduce color in 600ms
      setTimeout (=> (@hexValue -= 8) and color()), 600

      # move in 2D
      displacement = mtv._mouseDisplacement()
      newLeft = bound @initialLeft + displacement.x, @range.width
      newTop = bound @initialTop + displacement.y, @range.height
      targets[2].css 'left', newLeft
      targets[2].css 'top', newTop

    stop: (event, mdEvent) ->
      targets[2].css 'border', 0

    up: (event, mdEvent) ->
    click: (event) ->
    enter: (event) ->
    leave: (event) ->

  # target[3] - crosshairs on mousedown
  actions.push
    setup: ->
      targets[3].css 'z-index', 1

      @lines = [
        @mainVertical = @makeLine 1, '100%', mtv.$el
        @mainHorizontal = @makeLine '100%', 1, mtv.$el
        @innerVertical = @makeLine 1, '100%', targets[3]
        @innerHorizontal = @makeLine '100%', 1, targets[3]
      ]

    makeLine: (w, h, container) ->
      $('<div>')
        .css('position', 'absolute')
        .width(w)
        .height(h)
        .appendTo(container)

    positionLines: (event) ->
      mainOffset = mtv._mouseOffsetFromElement container
      innerOffset = mtv._mouseOffsetFromElement targets[3]

      @mainVertical.css 'left', mainOffset.x
      @mainHorizontal.css 'top', mainOffset.y
      @innerVertical.css 'left', innerOffset.x
      @innerHorizontal.css 'top', innerOffset.y

      # hide inner lines except when crosshairs pass through target
      if mtv._mouseInElementBox targets[3], 'x'
        @innerVertical.removeClass 'hidden'
      else
        @innerVertical.addClass 'hidden'

      if mtv._mouseInElementBox targets[3], 'y'
        @innerHorizontal.removeClass 'hidden'
      else
        @innerHorizontal.addClass 'hidden'

      # reset target highlights
      for highlight in @inTargetHighlights ? []
        highlight.remove()
      @inTargetHighlights = []

      for target in targets
        if mtv._mouseInElementBox target
          offset = mtv._mouseOffsetFromElement target
          vertical = @makeLine(3, '100%', target)
            .css('left', offset.x - 1)
            .css('background-color', 'rgba(98, 255, 249, 0.5)')
          horizontal = @makeLine('100%', 3, target)
            .css('top', offset.y - 1)
            .css('background-color', 'rgba(98, 255, 249, 0.5)')
          @inTargetHighlights.push vertical, horizontal

      m = ->
        @innerVertical.css 'border-left', '1px solid rgb(64, 136, 133)'
        @innerVertical.css 'border-right', '1px solid rgb(64, 136, 133)'
        @innerHorizontal.css 'border-top', '1px solid rgb(64, 136, 133)'
        @innerHorizontal.css 'border-bottom', '1px solid rgb(64, 136, 133)'

      color = if @inTargetHighlights.length > 0
        'rgb(98, 255, 249)'
      else
        'rgba(255, 103, 103, 0.5)'

      line.css 'background-color', color for line in @lines

    down: (event) ->
      # setup if first time
      unless @lines
        @setup()

      # un-hide lines and position
      line.removeClass 'hidden' for line in @lines
      @positionLines event

    start: (event, mdEvent) ->
    drag: (event, mdEvent) ->
      @positionLines event

    stop: (event, mdEvent) ->
    up: (event, mdEvent) ->
      line.addClass 'hidden' for line in @lines ? []
      for highlight in @inTargetHighlights ? []
        highlight.remove()

    click: (event) ->
    enter: (event) ->
    leave: (event) ->

  # target[4] - slide vertically
  actions.push
    down: (event) ->
      # prepare for movement
      @initialTop = parseFloat targets[4].css 'top'
      unless @range
        targetDims = mtv._mouseElementDimensions targets[4]
        containerDims = mtv._mouseElementContainerDimensions targets[4]
        @range = height: containerDims.height - targetDims.height

    start: (event, mdEvent) ->
    drag: (event, mdEvent) ->
      # move in 1D
      displacement = mtv._mouseDisplacement()
      newTop = bound @initialTop + displacement.y, @range.height
      targets[4].css 'top', newTop

    stop: (event, mdEvent) ->
    up: (event, mdEvent) ->
    click: (event) ->
    enter: (event) ->
    leave: (event) ->

  # target[5] - slide horizontally, shoot on click
  actions.push
    fire: (projectile, distance) ->
      _distance = 0
      up = (projectile) ->
        projectile.css 'bottom', _distance++
        if _distance < distance
          setTimeout (-> up projectile), 3
        else
          projectile.remove()
      up projectile

    down: (event) ->
      # prepare for movement
      @initialLeft = parseFloat targets[5].css 'left'
      @initialTop = parseFloat targets[5].css 'top'
      unless @range
        targetDims = mtv._mouseElementDimensions targets[5]
        containerDims = mtv._mouseElementContainerDimensions targets[5]
        @range =
          width: containerDims.width - targetDims.width
          height: containerDims.height - targetDims.height

    start: (event, mdEvent) ->
    drag: (event, mdEvent) ->
      # move in 1D
      displacement = mtv._mouseDisplacement()
      newLeft = bound @initialLeft + displacement.x, @range.width
      targets[5].css 'left', newLeft

    stop: (event, mdEvent) ->
    up: (event, mdEvent) ->
    click: (event) ->
      rand = -> (Math.floor Math.random() * 257).toString(16)
      targetLeft = parseFloat targets[5].css 'left'
      targetDims = mtv._mouseElementDimensions targets[5]
      containerDims = mtv._mouseElementContainerDimensions targets[5]

      projectile = $('<div>')
        .height(10)
        .width(10)
        .css('position', 'absolute')
        .css('left', targetLeft + targetDims.width / 2 - 5)
        .css('border-radius', 5)
        .css('background-color', "##{rand()}#{rand()}#{rand()}")
        .appendTo(mtv.$el)

      @fire projectile, containerDims.height

    enter: (event) ->
    leave: (event) ->

  # forward to correct handler based on target and event type
  forward = (eventType, args) ->
    console.log eventType
    mouseTarget = switch eventType
      when 'click', 'enter', 'leave' then args[0].target
      else mtv._mousedownTarget()[0]
    for target, i in targets
      idx = i if target[0] == mouseTarget or target[0] == $(mouseTarget).parent()[0]
    actions[idx][eventType] args...

  # bind events
  pref = 'MouseTrackingView:MouseDid'
  mtv.on "#{pref}Mousedown", (event) -> forward 'down', arguments
  mtv.on "#{pref}Start", (event, mdEvent) -> forward 'start', arguments
  mtv.on "#{pref}Drag", (event, mdEvent) -> forward 'drag', arguments
  mtv.on "#{pref}Stop", (event, mdEvent) -> forward 'stop', arguments
  mtv.on "#{pref}Mouseup", (event, mdEvent) -> forward 'up', arguments
  mtv.on "#{pref}Click", (event) -> forward 'click', arguments
  mtv.on "#{pref}Mouseenter", (event) -> forward 'enter', arguments
  mtv.on "#{pref}Mouseleave", (event) -> forward 'leave', arguments

  # add to DOM
  $player.append container.append mtv.el

  # set initial target positions based on container dimensions
  for target, i in targets
    target
      .css('top', container.height() / 6 * i)
      .css('left', container.width() / 6 * i)
