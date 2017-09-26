var app = new Vue({
  el: '#vue-root',
  data: {
    adding: {
      desc: '',
      url: '',
      xpath: '',
      text: '',
    },
    trackers: []
  },
  computed: {
    auto_adding_desc() {
      let text = this.trim_string(this.adding.text)
      let title = this.trim_string(window.document.title)
      return `${title} - ${text}`
    }
  },
  methods: {
    trim_string(string, length = 30) {
      return string.length > length ?
        string.substring(0, length - 3) + '...' :
        string
    },
    cancel: function () {
      chrome.runtime.sendMessage({ to: 'dialog', type: 'hide' })
    },
    add: function () {
      let adding = Object.assign({}, this.adding)
      if (!adding.desc)
        adding.desc = this.auto_adding_desc
      chrome.runtime.sendMessage({
        to: 'background',
        type: 'add',
        data: adding
      })
    },
    options: function () {
      chrome.runtime.sendMessage({ to: 'background', type: 'options' })
    },
    remove: function (t) {
      if (confirm('Are your sure to remove this watcher?')) {
        chrome.runtime.sendMessage({ to: 'background', type: 'remove_tracker', id: t.id })
        var index = app.trackers.indexOf(t);
        if (index > -1)
          app.trackers.splice(index, 1);
      }
    }
  }
})

var handleRequest = function (request, sender, cb) {
  if (request.to !== 'panel') return

  if (request.type === 'update') {
    for (var key in request.data)
      Vue.set(app.adding, key, request.data[key])
  } else if (request.type === 'trackers') {
    Vue.set(app, 'trackers', request.data)
  }
}

chrome.runtime.onMessage.addListener(handleRequest)

document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({
    to: 'dialog',
    type: 'get'
  })
  chrome.runtime.sendMessage({
    to: 'dialog',
    type: 'check'
  })
})
