
storage.cache.listen()

// Create one test item for each context type.
var menu_watch_id = chrome.contextMenus.create({
  'title': 'Watch this element',
  'contexts': ['page','frame','link','selection','editable'],
  'onclick': function(info, tab){
    chrome.tabs.sendMessage(tab.id, {
      to: 'content',
      type: 'watch_right_clicked'
    });
  }
})

function handleRequest(request, sender, cb) {
  if (request.to !== 'background')
  {
    console.log('Message to '+sender.tab.id, request)
    // Forwarding
    chrome.tabs.sendMessage(sender.tab.id, request, cb)
  }
  else {
    if (request.type === 'add')
      storage.watchers.add(request.data, function() {
        chrome.tabs.sendMessage(sender.tab.id, {to: 'dialog', type: 'hide'})
        console.log('Add watch success', request.data)
      })
    else if (request.type === 'urls')
      cb(storage.cache.urls)
    else if (request.type === 'update')
      storage.watchers.edit(request.id, request.data)
  }
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'toggle-panel')
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {to: 'dialog', type: 'toggle'})
    })
})

chrome.runtime.onMessage.addListener(handleRequest)

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, {to: 'dialog', type: 'toggle'});
})
