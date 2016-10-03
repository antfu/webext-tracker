
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

var menu_man_id = chrome.contextMenus.create({
  'title': 'Manage watchers',
  'contexts': ['browser_action', 'page_action'],
  'onclick': function(info, tab){
    chrome.tabs.create({'url': chrome.extension.getURL('man/man.html')});
  }
})


function handleRequest(request, sender, cb) {
  if (request.to !== 'background')
    // Forwarding
    chrome.tabs.sendMessage(sender.tab.id, request, cb)
  else {
    if (request.type === 'watch')
    {
      chrome.storage.sync.get({watcher_id:0}, function(id_obj){
        var new_id = id_obj.watcher_id + 1;
        chrome.storage.sync.get({watchers:[]}, function(result) {
          var watcheres = result.watchers
          var data = request.data
          data.create_time = (new Date()).toISOString()
          data.id = new_id
          watcheres.push(data)
          chrome.storage.sync.set({watchers:watcheres}, function() {
            chrome.storage.sync.set({watcher_id:new_id}, function() {})
            chrome.tabs.sendMessage(sender.tab.id, {to: 'dialog', type: 'hide'})
            console.log('Add watch success', data)
          })
        })
      });
    }
  }
}

chrome.runtime.onMessage.addListener(handleRequest)

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, {to: 'dialog', type: 'toggle'});
})
