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
