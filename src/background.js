// A generic onclick callback function.
function genericOnClick(info, tab) {
  console.log('item ' + info.menuItemId + ' was clicked');
  console.log('info: ' + JSON.stringify(info));
  console.log('tab: ' + JSON.stringify(tab));
  chrome.tabs.sendMessage(tab.id, {
    to: 'content',
    type: 'watch_right_clicked'
  });
}

// Create one test item for each context type.
var watch_menu_id = chrome.contextMenus.create({
  'title': 'Watch this element',
  'contexts': ['all'],
  'onclick': genericOnClick
});

function handleRequest(request, sender, cb) {
  if (request.to !== 'background')
    chrome.tabs.sendMessage(sender.tab.id, request, cb)
  else {
    if (request.type === 'watch')
    {
      chrome.storage.local.get({watchers:[]}, function(result) {
        var watcheres = result.watchers
        var data = request.data
        data.create_time = (new Date()).toISOString()
        watcheres.push(data)
        chrome.storage.local.set({watchers:watcheres}, function() {
          chrome.tabs.sendMessage(tab.id, {to: 'dialog', type: 'hide'})
          console.log('Add watch success', data)
        })
      })
    }
  }
}

chrome.runtime.onMessage.addListener(handleRequest)

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, {to: 'dialog', type: 'toggle'});
})
