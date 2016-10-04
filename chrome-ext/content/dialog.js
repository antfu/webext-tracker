Dialog = function () {
  this._handle_request = this.handle_request.bind(this);
  this._watch = this.watch.bind(this);
  this._mousemove = this.mousemove.bind(this);
  this._keydown = this.keydown.bind(this);
  /*
  this.boundHandleRequest_ = this.handleRequest_.bind(this)
  this.boundMouseMove_ = this.mouseMove_.bind(this)
  this.boundKeyDown_ = this.keyDown_.bind(this)

  this.inDOM_ = false
  this.currEl_ = null
  */
  this.in_dom = false
  this.current_el = null
  this.short_cut = false
  this.url = location.href
  this.watchers = []

  this.iframe = document.createElement('iframe')
  this.iframe.src = chrome.runtime.getURL('../panel/panel.html')
  this.iframe.id = 'wew-dialog'
    // Init to hidden so first showBar_() triggers fade-in.
  this.iframe.classList.add('hidden')

  //document.addEventListener('keydown', this.boundKeyDown_)
  chrome.runtime.onMessage.addListener(this._handle_request)
  //this.append()
  //this.hide()
}

Dialog.prototype.hidden = function () {
  return this.iframe.classList.contains('hidden')
}

Dialog.prototype.append = function () {
  if (!this.in_dom) {
    this.in_dom = true
    document.body.appendChild(this.iframe)
  }
}

Dialog.prototype.show = function () {
  this.append()
  document.addEventListener('mousemove', this._mousemove)
  document.addEventListener('keydown', this._keydown)
  this.iframe.classList.remove('hidden')
}

Dialog.prototype.hide = function () {
  document.removeEventListener('mousemove', this._mousemove)
  document.removeEventListener('keydown', this._keydown)
  this.iframe.classList.add('hidden')
  xh.clearHighlights()
}

Dialog.prototype.watch = function(el) {
  el = el || this.current_el
  xh.clearHighlights()
  var xpath = xh.makeQueryForElement(el)
  var querys = xh.evaluateQuery(xpath)

  console.log('Watch', xpath)

  this._data = {
    url: this.url,
    xpath: xpath,
    text: querys.text,
    count: querys.count
  }

  chrome.runtime.sendMessage({
    to: 'panel',
    type: 'update',
    data: this._data
  })
}

Dialog.prototype.evaluate = function(xpath) {
  xh.clearHighlights()
  var querys = xh.evaluateQuery(xpath)

  var data = {
    url: this.url,
    xpath: xpath,
    text: querys.text,
    count: querys.count
  }

  return data
}

Dialog.prototype.toggle = function () {
  if (this.hidden())
    this.show()
  else
    this.hide()
}

Dialog.prototype.mousemove = function (e) {
  if (this.current_el === e.toElement || !e.toElement)
    return
  this.current_el = e.toElement
  if (e.shiftKey)
    this.watch()
}

Dialog.prototype.keydown = function (e) {
  var ctrl = e.ctrlKey || e.metaKey;
  var shift = e.shiftKey;
  if (!this.hidden() && !ctrl && e.keyCode === SHIFT_KEYCODE)
    this.watch();
}

Dialog.prototype.check_watchers = function(close){
  var that = this
  chrome.runtime.sendMessage({to: 'background', type: 'watchers'}, function(watchers) {
    that.watchers = []
    var i = watchers.length
    while(i--)
      if (watchers[i].url.trim() == that.url.trim())
        that.watchers.push(watchers[i])

    var i = that.watchers.length
    var count = that.watchers.length
    while(i--)
    {
      var watcher = that.watchers[i]
      var data = that.evaluate(watcher.xpath)
      chrome.runtime.sendMessage({to: 'background', type: 'update_text', id:watcher.id, text:data.text}, function() {
        count--
        if (count <= 0 && close)
          chrome.runtime.sendMessage({to: 'background', type: 'close_me'})
      })
    }
  })
}

Dialog.prototype.handle_request = function (request, sender, sendResponse) {
  if (request.to !== 'dialog')
    return
  if (request.type === 'show') {
    this.show()
  } else if (request.type === 'hide') {
    this.hide()
  } else if (request.type === 'toggle') {
    this.toggle()
  } else if (request.type === 'check') {
    this.check_watchers(request.close)
  } else if (request.type === 'evaluate') {
    this.show()
    this._data = this.evaluate(request.data.xpath)
    chrome.runtime.sendMessage({
      to: 'panel',
      type: 'update',
      data: this._data
    })
  } else if (request.type === 'get') {
    chrome.runtime.sendMessage({
      to: 'panel',
      type: 'update',
      data: this._data
    })
  }
}
