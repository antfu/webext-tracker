var SHIFT_KEYCODE = 16
var dialog = new Dialog()

document.addEventListener("mousedown", function (event) {
  //right click
  if (event.button == 2) {
    dialog.current_el = event.target
  }
}, true)

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.to !== 'content')
    return
  if (request.type === 'watch_right_clicked') {
    chrome.runtime.sendMessage({to: 'dialog', type: 'show'})
    dialog.watch();
  }
});
