
var app = new Vue({
  el: '#vue-root',
  data: {
    watchers: {}
  },
  methods: {
    less: function(data, length) {
      length = length || 30
      var str = (data || '').toString().trim()
      if (str.length <= length)
        return str
      else
        return str.slice(0, length) + ' ...'
    },
    navigate: function(watcher) {
      chrome.tabs.create({'url': watcher.url}, function(tab) {
        console.log(tab);
        chrome.tabs.executeScript(tab.id, {
            code: 'chrome.runtime.sendMessage({to: "dialog", type: "evaluate", data: {xpath: "'+watcher.xpath+'"}})',
            runAt: 'document_idle'
        })
      })
    },
    remove: function(watcher) {
      if (confirm("Are your sure to remove this watcher?"))
      {
        chrome.storage.sync.get({watchers:[]}, function(result) {
          var watchers = result.watchers
          var i = watchers.length
          while(i--)
          {
            if (watchers[i].id == watcher.id)
            {
              watchers.splice(i,1)
              chrome.storage.sync.set({watchers:watchers}, function() {})
              break;
            }
          }
        })
      }
    },
    remove_all: function() {
      if (confirm("Are your sure to remove all watchers?"))
      {
        chrome.storage.sync.clear();
      }
    }
  }
})

function get_watchers() {
  chrome.storage.sync.get('watchers', function(data) {
    app.watchers = data.watchers
  })
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync')
    get_watchers()
})

get_watchers()
