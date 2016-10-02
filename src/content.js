var SHIFT_KEYCODE = 16
var right_clicked_el = null
var dialog = new Dialog()

document.addEventListener("mousedown", function (event) {
  //right click
  if (event.button == 2) {
    right_clicked_el = event.target
  }
}, true)

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.to !== 'content')
    return
  if (request.type === 'watch_right_clicked') {
    if (right_clicked_el) {
      chrome.runtime.sendMessage( {to: 'dialog', type: 'show'} )
      dialog.watch(right_clicked_el);
    }
  }
});
