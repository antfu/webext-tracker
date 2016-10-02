
// A generic onclick callback function.
function genericOnClick(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
  chrome.tabs.sendMessage(tab.id, "content_wacth_this");
}

// Create one test item for each context type.
var watch_menu_id = chrome.contextMenus.create({
  "title": "Watch this element",
  "contexts":['all'],
  "onclick": genericOnClick
});

function handleRequest(request, sender, cb) {
  // Simply relay the request. This lets content.js talk to dialog.js.
  chrome.tabs.sendMessage(sender.tab.id, request, cb)
}

chrome.runtime.onMessage.addListener(handleRequest)

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {type: 'dialog_toggle'});
})
