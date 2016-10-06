
var storage = storage || {}

var noop = function () {}

storage.namespace = 'local'
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
  if (storage.watchers.updating)
  {
    setTimeout(function(){storage.watchers.add(data, callback)}, 1)
    return
  }
  storage.watchers.updating = true
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
        storage.space.set({watcher_id:new_id}, function() {
          callback()
          storage.watchers.updating = false
        })
      })
    })
  })
}

storage.watchers.remove = function (id, callback) {
  if (storage.watchers.updating)
  {
    setTimeout(function(){storage.watchers.add(data, callback)}, 1)
    return
  }
  storage.watchers.updating = true
  callback = callback || noop
  storage.space.get({watchers:[]}, function(result) {
    var watchers = result.watchers
    var i = watchers.length
    while(i--)
      if (watchers[i].id == id)
      {
        watchers.splice(i,1)
        storage.space.set({watchers:watchers}, function(){
            storage.watchers.updating = false
            callback()
        })
        break
      }
  })
}

storage.watchers.edit = function (id, diff_dict, callback) {
  if (storage.watchers.updating)
  {
    setTimeout(function(){storage.watchers.edit(id, diff_dict, callback)}, 1)
    return
  }
  storage.watchers.updating = true
  callback = callback || noop
  diff_dict = diff_dict || {}
  storage.space.get({watchers:[]}, function(result) {
    var watchers = result.watchers
    var i = watchers.length
    while(i--)
    {
      if (watchers[i].id == id)
      {
        for (var key in diff_dict)
          watchers[i][key] = diff_dict[key]
        storage.space.set({watchers:watchers}, function(){
            storage.watchers.updating = false
            callback()
        })
        break
      }
    }
  })
}

storage.watchers.set_checking = function(id, callback) {
  storage.watchers.edit(id, {
    checking: true
  }, callback)
}

storage.watchers.update_text = function (id, text, callback) {
  storage.watchers.edit(id, {
    current: text,
    checking: false,
    update_time: (new Date()).toISOString()
  }, callback)
}

storage.watchers.reset = function(watcher, callback) {
  storage.watchers.edit(watcher.id, {text: watcher.current}, callback)
}

storage.watchers.clear = function () {
  storage.space.remove('watchers')
}

storage.watchers.listen = function (callback) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === storage.namespace)
      storage.watchers(callback)
  })
  storage.watchers(callback)
}

storage.watchers.json = function(pretty) {
  if (pretty)
    return JSON.stringify(storage.watchers.cache, null, ' ')
  else
    return JSON.stringify(storage.watchers.cache)
}

storage.watchers.import = function(json_str) {
  var obj = JSON.parse(json_str)
  console.log(obj)
  var i = obj.length
  while (i--)
  {
    var watch = obj[i]
    storage.watchers.add(watch)
  }
}
