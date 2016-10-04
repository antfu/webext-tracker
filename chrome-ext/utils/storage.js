
var storage = storage || {}

var noop = function () {}

storage.namespace = 'sync'
storage.space = chrome.storage[storage.namespace]

storage.watchers = function (callback) {
  callback = callback || noop
  storage.space.get({watchers:[]}, function (result) {
    storage.watchers.cache = result.watchers
    callback(result.watchers)
  })
}

storage.watchers.urls = function (callback) {
  callback = callback || noop
  storage.space.get({watchers:[]}, function (result) {
    var urls = []
    var i = result.watchers.length
    while(i--)
      urls.push([result.watchers[i].url, result.watchers[i].id])
    callback(urls)
  })
}

storage.watchers.add = function (data, callback) {
  callback = callback || noop
  storage.space.get({watcher_id:0}, function(id_obj){
    var new_id = id_obj.watcher_id + 1;
    storage.space.get({watchers:[]}, function(result) {
      var watchers = result.watchers
      data.create_time = data.create_time || (new Date()).toISOString()
      data.update_time = data.update_time || (new Date()).toISOString()
      data.current = data.current || data.text
      data.id = new_id
      watchers.push(data)
      storage.space.set({watchers:watchers}, function() {
        storage.space.set({watcher_id:new_id}, function() {})
        callback()
      })
    })
  })
}

storage.watchers.remove = function (id, callback) {
  callback = callback || noop
  storage.space.get({watchers:[]}, function(result) {
    var watchers = result.watchers
    var i = watchers.length
    while(i--)
      if (watchers[i].id == id)
      {
        watchers.splice(i,1)
        storage.space.set({watchers:watchers}, callback)
        break;
      }
  })
}

storage.watchers.edit = function (id, diff_dict, callback) {
  callback = callback || noop
  diff_dict = diff_dict || {}
  storage.space.get({watchers:[]}, function(result) {
    var watchers = result.watchers
    var i = watchers.length
    while(i--)
      if (watchers[i].id == id)
      {
        for (var key in diff_dict)
          watchers[i][key] = diff_dict[key]
        storage.space.set({watchers:watchers}, callback)
        break
      }
  })
}

storage.watchers.update_text = function(id, text, callback) {
  storage.watchers.edit(id, {current: text, update_time: (new Date()).toISOString()}, callback)
}

storage.watchers.clear = function () {
  storage.space.remove('watchers')
}

storage.watchers.listen = function () {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === storage.namespace)
      storage.watchers()
  })
  storage.watchers()
}
