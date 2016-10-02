var right_clicked_el = null
var dialog = new Dialog()

document.addEventListener("mousedown", function (event) {
  //right click
  if (event.button == 2) {
    right_clicked_el = event.target
  }
}, true)

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request === "content_wacth_this") {
    xh.clearHighlights()
    if (right_clicked_el) {
      var xpath = xh.makeQueryForElement(right_clicked_el)
      var querys = xh.evaluateQuery(xpath)
      chrome.runtime.sendMessage({
        type: 'dialog_show'
      })
      chrome.runtime.sendMessage({
        type: 'element_update',
        data: {
          url: location.href,
          xpath: xpath,
          text: querys.text,
          els: querys.els,
          count: querys.count
        }
      })
    }
  }
});
