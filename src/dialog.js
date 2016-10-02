Dialog = function () {
  this._handle_request = this.handle_request.bind(this);
  /*
  this.boundHandleRequest_ = this.handleRequest_.bind(this)
  this.boundMouseMove_ = this.mouseMove_.bind(this)
  this.boundKeyDown_ = this.keyDown_.bind(this)

  this.inDOM_ = false
  this.currEl_ = null
  */
  this.in_dom = false

  this.iframe = document.createElement('iframe')
  this.iframe.src = chrome.runtime.getURL('dialog/dialog.html')
  this.iframe.id = 'wew-dialog'
    // Init to hidden so first showBar_() triggers fade-in.
  this.iframe.classList.add('hidden')

  //document.addEventListener('keydown', this.boundKeyDown_)
  chrome.runtime.onMessage.addListener(this._handle_request)
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
  this.iframe.classList.remove('hidden')
}

Dialog.prototype.hide = function () {
  this.iframe.classList.add('hidden')
}

Dialog.prototype.toggle = function () {
  if (this.hidden())
    this.show()
  else
    this.hide()
}

Dialog.prototype.handle_request = function (request, sender, sendResponse) {
  if (request.type === "dialog_show") {
    this.show()
  } else if (request.type === "dialog_hide") {
    this.hide()
  } else if (request.type === "dialog_toggle") {
    this.toggle()
  }
}
