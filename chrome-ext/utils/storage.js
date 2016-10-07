
var storage = storage || {}
var noop = function () {}

// The storage namespace that the model using ( can be 'sync' as well )
storage.namespace = 'local'
storage.space = chrome.storage[storage.namespace]
// Is the storage listening the chrome storage
storage.listening = false

storage.listen = function (callback) {
  // Add the new listener to callback list
  storage.listen.callback.list.push(callback)
  // If the storage is not listening changes. add it
  if (!storage.listening) {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      // Only the target storage will be listened
      if (namespace === storage.namespace)
        storage.listen.callback()
    })
    storage.listening = true
  }
  // Callback to the new listener
  callback()
}

storage.listen.callback = function () {
  // Callback to all the listenings
  for (var i = 0, j = storage.listen.callback.list.length; i < j; i++)
    storage.listen.callback.list[i]()
}

storage.listen.callback.list = []

storage.watchers = function (callback) {
  callback = callback || noop
  storage.space.get({ watchers: [] }, function (result) {
    storage.watchers.cache = result.watchers
    callback(result.watchers)
  })
}

storage.watchers.urls = function (callback) {
  callback = callback || noop
  storage.space.get({ watchers: [] }, function (result) {
    var urls = []
    var i = result.watchers.length
    while (i--)
      urls.push([result.watchers[i].url, result.watchers[i].id])
    callback(urls)
  })
}

storage.watchers.add = function (data, callback) {
  // Waiting until the previous operate finished
  if (storage.watchers.updating) {
    setTimeout(function () { storage.watchers.add(data, callback) }, 1)
    return
  }
  storage.watchers.updating = true
  // The function
  callback = callback || noop
  storage.space.get({ watcher_id: 0 }, function (id_obj) {
    var new_id = id_obj.watcher_id + 1;
    storage.space.get({ watchers: [] }, function (result) {
      var watchers = result.watchers
      data.create_time = data.create_time || (new Date()).toISOString()
      data.update_time = data.update_time || (new Date()).toISOString()
      data.current = data.current || data.text
      data.id = new_id
      watchers.push(data)
      storage.space.set({ watchers: watchers }, function () {
        storage.space.set({ watcher_id: new_id }, function () {
          callback()
          storage.watchers.updating = false
        })
      })
    })
  })
}

storage.watchers.remove = function (id, callback) {
  // Waiting until the previous operate finished
  if (storage.watchers.updating) {
    setTimeout(function () { storage.watchers.add(data, callback) }, 1)
    return
  }
  storage.watchers.updating = true
  // The function
  callback = callback || noop
  storage.space.get({ watchers: [] }, function (result) {
    var watchers = result.watchers
    var i = watchers.length
    while (i--)
      // Find by id
      if (watchers[i].id == id) {
        // Remove the watcher form list
        watchers.splice(i, 1)
        // Save changes
        storage.space.set({ watchers: watchers }, function () {
          storage.watchers.updating = false
          callback()
        })
        break
      }
  })
}

storage.watchers.edit = function (id, diff_dict, callback) {
  // Waiting until the previous operate finished
  if (storage.watchers.updating) {
    setTimeout(function () { storage.watchers.edit(id, diff_dict, callback) }, 1)
    return
  }
  storage.watchers.updating = true
  // The function
  callback = callback || noop
  diff_dict = diff_dict || {}
  var changed_keys = []
  storage.space.get({ watchers: [] }, function (result) {
    var watchers = result.watchers
    var i = watchers.length
    while (i--) {
      // Find by id
      if (watchers[i].id == id) {
        // Copy values from diff_dict to the storage
        for (var key in diff_dict) {
          // Update only if the value changed
          if (watchers[i][key] != diff_dict[key]) {
            watchers[i][key] = diff_dict[key]
            changed_keys.push(key)
          }
        }
        // Save the changes
        storage.space.set({ watchers: watchers }, function () {
          storage.watchers.updating = false
          callback(changed_keys)
        })
        break
      }
    }
  })
}

storage.watchers.set_checking = function (id, callback) {
  storage.watchers.edit(id, { checking: true }, callback)
}

storage.watchers.update_text = function (id, text, callback) {
  storage.watchers.edit(id, {
    current: text,
    checking: false,
    update_time: (new Date()).toISOString()
  }, callback)
}

storage.watchers.reset = function (watcher, callback) {
  storage.watchers.edit(watcher.id, { text: watcher.current }, callback)
}

storage.watchers.clear = function () {
  storage.space.remove('watchers')
}

storage.watchers.listen = function (callback) {
  storage.listen(function () {
    storage.watchers(callback)
  })
}

storage.watchers.json = function (pretty) {
  if (pretty)
    return JSON.stringify(storage.watchers.cache, null, ' ')
  else
    return JSON.stringify(storage.watchers.cache)
}

storage.watchers.import = function (json_str) {
  var obj = JSON.parse(json_str)
  console.log(obj)
  var i = obj.length
  while (i--) {
    var watch = obj[i]
    storage.watchers.add(watch)
  }
}
