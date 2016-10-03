
var app = new Vue({
  el: '#vue-root',
  data: {
    watchers: {}
  },
  methods: {
    less: function(data, length) {
      length = length || 30
      var str = data.toString().trim()
      if (str.length <= length)
        return str
      else
        return str.slice(0, length) + ' ...'
    }
  }
})

function get_watchers() {
  chrome.storage.sync.get('watchers', function(data) {
    app.watchers = data.watchers
  })
}

get_watchers()
