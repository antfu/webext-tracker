var app = new Vue({
  el: '#vue-root',
  data: {
    watchers: {}
  },
  mixins: [mixin]
})

function get_watchers() {
  storage.watchers(function(data) {
    app.watchers = data || []
  })
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync')
    get_watchers()
})

get_watchers()

document.getElementById('add').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {to: 'dialog', type: 'toggle'})
  })
})

document.getElementById('options').addEventListener('click', function() {
  chrome.tabs.create({'url': chrome.extension.getURL('options/options.html')})
})

document.getElementById('refresh').addEventListener('click', function() {
  app.refresh_all()
})
