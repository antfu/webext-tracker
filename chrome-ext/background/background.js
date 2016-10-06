
var background_refresh_timeout = 1000 * 60 * 30 // 30 min
var background_refresh_enabled = false

storage.watchers.listen(function(watchers){
  var i = watchers.length
  changed = 0
  while (i--)
    changed += watchers[i].text == watchers[i].current ? 0 : 1
  if (changed == 0)
    chrome.browserAction.setBadgeText({text: ''})
  else {
    chrome.browserAction.setBadgeText({text: changed + ''})
    chrome.browserAction.setBadgeBackgroundColor({color:'#eb4d00'})
  }
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

function get_watcher_by_id(id)
{
  var watchers = storage.watchers.cache
  var i = watchers.length
  while(i--)
    if (watchers[i].id == id)
      return watchers[i]
  return null
}

function refresh_watcher(id, callback) {
  storage.watchers.set_checking(id)
  checker.lite(get_watcher_by_id(id), function(text){
    storage.watchers.update_text(id, text, function () {
      if(callback) callback(id)
    })
  })
}

function background_refresh() {
  chrome.browserAction.setIcon({path:'../icons/icon_refresh_128.png'})
  refresh_all_watchers(function() {
    chrome.browserAction.setIcon({path:'../icons/icon_128.png'})
  })
}

function background_refresh_loop(){
  background_refresh()
  if (background_refresh_enabled)
    setTimeout(background_refresh_loop, background_refresh_timeout)
}

function refresh_all_watchers(callback) {
  var watchers = storage.watchers.cache
  var count = watchers.length
  var urls = []
  var i = watchers.length
  while(i--)
  {
    var url = watchers[i].url
    // Temporary disable duplicate url checking
    if (true || urls.indexOf(url) === -1)
    {
      urls.push(url)
      refresh_watcher(watchers[i].id, function() {
        count--
        if (count<=0 && callback)
          callback()
      })
    }
  }
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
    else if (request.type === 'refresh')
      refresh_watcher(request.id)
    else if (request.type === 'refresh_all')
      refresh_all_watchers()
  }
}

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'toggle-panel')
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {to: 'dialog', type: 'toggle'})
    })
})

chrome.runtime.onMessage.addListener(handleRequest)

setTimeout(background_refresh_loop, 3000)
