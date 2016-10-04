
storage.watchers.listen(function(watchers){
  chrome.browserAction.setBadgeText({text: watchers.length + ''})
  chrome.browserAction.setBadgeBackgroundColor({color:'#299d50'})
})

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

function less(data, length) {
  length = length || 20
  var str = (data || '').toString().trim()
  if (str.length <= length)
    return str
  else
    return str.slice(0, length) + ' ...'
}

function notify() {
  var watcher = storage.watchers.cache[0]
  chrome.notifications.create({
    iconUrl: chrome.runtime.getURL('icons/icon_notify.png'),
    title: watcher.desc,
    type: 'list',
    message: 'Element change detected.',
    items: [
      {title: 'Original', message: less(watcher.text)},
      {title: 'Current', message: less(watcher.current)}
    ],
    buttons: [{ title: 'Have a look' },{ title: 'All watchers' }],
    priority: 2,
    requireInteraction: true,
  })
}

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
    else if (request.type === 'watchers')
      cb(storage.watchers.cache)
    else if (request.type === 'update')
      storage.watchers.edit(request.id, request.data)
    else if (request.type === 'update_text')
    {
      console.log('Update', request)
      storage.watchers.update_text(request.id, request.text)
      cb({id: request.id, success: true})
    }
    else if (request.type === 'close_me')
      chrome.tabs.remove(sender.tab.id)
    else if (request.type === 'options')
      chrome.tabs.create({'url': chrome.extension.getURL('options/options.html')})
  }
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'toggle-panel')
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {to: 'dialog', type: 'toggle'})
    })
})

chrome.runtime.onMessage.addListener(handleRequest)

//chrome.browserAction.setPopup({popup: 'popup/popup.html'})
//chrome.browserAction.onClicked.addListener(function (tab) {
//  chrome.tabs.sendMessage(tab.id, {to: 'dialog', type: 'toggle'});
//})
