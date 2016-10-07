var configs = {}
var checking = false
var default_action_path = '../icons/icon_128.png'
var onstart = true

storage.configs.listen(function (new_configs) {
  configs = new_configs
  if (onstart) {
    // Run Once on chrome start
    if (configs.check_on_start)
      setTimeout(background_refresh, 2000)
    setTimeout(background_refresh_loop, configs.background_timeout || 1800000)
    onstart = false
  } else {
    // Updates
    if (background_refresh_loop.timer) {
      clearTimeout(background_refresh_loop.timer)
      background_refresh_loop.timer = setTimeout(background_refresh_loop, configs.background_timeout || 1800000)
    }

    if (configs.background_refresh)
      default_action_path = '../icons/icon_128.png'
    else
      default_action_path = '../icons/icon_off_128.png'
    if (!checking)
      chrome.browserAction.setIcon({ path: default_action_path })
  }

})

storage.watchers.listen(function (watchers) {
  var i = watchers.length
  changed = 0
  while (i--)
    changed += watchers[i].text == watchers[i].current ? 0 : 1
  if (changed == 0)
    chrome.browserAction.setBadgeText({ text: '' })
  else {
    chrome.browserAction.setBadgeText({ text: changed + '' })
    chrome.browserAction.setBadgeBackgroundColor({ color: '#eb8d00' })
  }
})

// Create one test item for each context type.
var menu_watch_id = chrome.contextMenus.create({
  'title': 'Watch this element',
  'contexts': ['page', 'frame', 'link', 'selection', 'editable'],
  'onclick': function (info, tab) {
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

function notify(watcher) {
  console.log('Notify', watcher.desc)
  chrome.notifications.create('tracker_' + watcher.id, {
    iconUrl: chrome.runtime.getURL('icons/icon_notify.png'),
    title: watcher.desc + '  -  Tracker',
    type: 'list',
    message: 'Element change detected.',
    items: [
      { title: 'Original', message: less(watcher.text) },
      { title: 'Current', message: less(watcher.current) }
    ],
    buttons: [{ title: 'Have a look' }, { title: 'Reset use new value' }],
    priority: 2,
    requireInteraction: true,
  }, function (notificationId) {
    console.log(notificationId)
  })
}

function get_watcher_by_id(id) {
  var watchers = storage.watchers.cache
  var i = watchers.length
  while (i--)
    if (watchers[i].id == id)
      return watchers[i]
  return null
}

function refresh_watcher(id, type, callback) {
  storage.watchers.set_checking(id)
  var watcher = get_watcher_by_id(id)
  type = type || watcher.checker || 'lite'
  checker[type](watcher, function (text) {
    storage.watchers.update_text(id, text, function (changed_keys) {
      console.log(changed_keys)
      watcher.current = text
      if (changed_keys.indexOf('current') !== -1)
        notify(watcher)
      if (callback) callback(id)
    })
  })
}

function refresh_all_watchers(type, callback, background) {
  var watchers = storage.watchers.cache
  var count = watchers.length
  var urls = []
  var i = watchers.length
  while (i--) {
    if (background && watchers[i].no_background) {
      // If item disabled the background checking
      count--
      continue
    } else {
      var url = watchers[i].url
        // Temporary disable duplicate url checking
      if (true || urls.indexOf(url) === -1) {
        urls.push(url)
        refresh_watcher(watchers[i].id, type, function () {
          count--
          if (count <= 0 && callback)
            callback()
        })
      }
    }
  }
}

function background_refresh() {
  console.log('Background Checking Started...')
  checking = true
  chrome.browserAction.setIcon({ path: '../icons/icon_refresh_128.png' })
  refresh_all_watchers('lite', function () {
    chrome.browserAction.setIcon({ path: default_action_path })
    checking = false
    console.log('Background Checking End...')
  }, true)
}

function background_refresh_loop() {
  if (configs.background_refresh)
    background_refresh()
    // Loop, default timeout is 30min
  background_refresh_loop.timer = setTimeout(background_refresh_loop, configs.background_timeout || 1800000)
}

function handleRequest(request, sender, cb) {
  if (request.to !== 'background') {
    // Forwarding
    console.log('Message to ' + sender.tab.id, request)
    chrome.tabs.sendMessage(sender.tab.id, request, cb)
  } else {
    // Handle the Message sent to background
    if (request.type === 'add')
      storage.watchers.add(request.data, function () {
        chrome.tabs.sendMessagewwwwwwwwww(sender.tab.id, { to: 'dialog', type: 'hide' })
        console.log('Add watch success', request.data)
      })
    else if (request.type === 'watchers')
      cb(storage.watchers.cache)
    else if (request.type === 'update')
      storage.watchers.edit(request.id, request.data)
    else if (request.type === 'update_text') {
      storage.watchers.update_text(request.id, request.text, function (changed_keys) {
        if (changed_keys.indexOf('current') !== -1)
          notify(get_watcher_by_id(request.id))
      })
      cb({ id: request.id, success: true })
    } else if (request.type === 'close_me')
      chrome.tabs.remove(sender.tab.id)
    else if (request.type === 'options')
      chrome.tabs.create({ 'url': chrome.extension.getURL('options/options.html') })
    else if (request.type === 'refresh')
      refresh_watcher(request.id, request.method)
    else if (request.type === 'refresh_all')
      refresh_all_watchers(request.method)
  }
}

chrome.commands.onCommand.addListener(function (command) {
  if (command === 'toggle-panel')
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { to: 'dialog', type: 'toggle' })
    })
})

chrome.runtime.onMessage.addListener(handleRequest)

chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
  chrome.notifications.clear(notificationId)
  var id = +notificationId.replace('tracker_', '')
  var watcher = get_watcher_by_id(id)
  if (watcher) {
    if (buttonIndex === 0)
      chrome.tabs.create({ 'url': watcher.url }, function (tab) {
        chrome.tabs.executeScript(tab.id, {
          code: 'WATCHER_CHECK("' + watcher.xpath + '");',
          runAt: 'document_idle'
        })
      })
    else if (buttonIndex == 1)
      storage.watchers.reset(watcher)
  }

})
