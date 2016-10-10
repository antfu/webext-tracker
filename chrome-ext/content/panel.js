var app = new Vue({
  el: '#vue-root',
  data: {
    adding: {},
    trackers: []
  },
  methods: {
    cancel: function() {
      chrome.runtime.sendMessage({to: 'dialog', type: 'hide'})
    },
    add: function() {
      chrome.runtime.sendMessage({
        to: 'background',
        type: 'add',
        data: this.adding
      })
    },
    options: function() {
      chrome.runtime.sendMessage({to: 'background', type: 'options'})
    }
  }
})

var handleRequest = function (request, sender, cb) {
  if (request.to !== 'panel') return

  if (request.type === 'update') {
    for (var key in request.data)
      Vue.set(app.adding, key, request.data[key])
  }
  else if (request.type === 'trackers') {
    Vue.set(app, 'trackers', request.data)
  }
}

chrome.runtime.onMessage.addListener(handleRequest)

document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({
    to: 'dialog',
    type: 'get'
  })
  chrome.runtime.sendMessage({
    to: 'dialog',
    type: 'check'
  })
})
