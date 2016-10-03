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

  this.iframe = document.createElement('iframe')
  this.iframe.src = chrome.runtime.getURL('add/add.html')
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
    url: location.href,
    xpath: xpath,
    text: querys.text,
    count: querys.count
  }

  chrome.runtime.sendMessage({
    to: 'adding',
    type: 'update',
    data: this._data
  })
}

Dialog.prototype.evaluate = function(xpath) {
  xh.clearHighlights()
  var querys = xh.evaluateQuery(xpath)

  this._data = {
    url: location.href,
    xpath: xpath,
    text: querys.text,
    count: querys.count
  }

  chrome.runtime.sendMessage({
    to: 'adding',
    type: 'update',
    data: this._data
  })
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

Dialog.prototype.handle_request = function (request, sender, sendResponse) {
  if (request.to !== 'dialog')
    return
  if (request.type === 'show') {
    this.show()
  } else if (request.type === 'hide') {
    this.hide()
  } else if (request.type === 'toggle') {
    this.toggle()
  } else if (request.type === 'evaluate') {
    this.show()
    this.evaluate(request.data.xpath)
  } else if (request.type === 'get') {
    chrome.runtime.sendMessage({
      to: 'adding',
      type: 'update',
      data: this._data
    })
  }
}
