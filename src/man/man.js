
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
