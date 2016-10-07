var mixin = {
  el: '#vue-root',
  data: {
    watchers: {},
    configs: storage.default_configs,
    listening: false
  },
  watch: {
    configs: {
      deep: true,
      immediate: true,
      handler: function functionName(val) {
        if (this.listening)
          storage.configs.update(val)
      }
    }
  },
  methods: {
    listen: function () {
      if (this.listening)
        return
      var vm = this
      storage.watchers.listen(function (watchers) {
        vm.watchers = watchers
      })
      storage.configs.listen(function (new_configs) {
        vm.configs = new_configs
      })
      this.listening = true
    },
    less: function (data, length) {
      length = length || 100
      var str = (data || '').toString().trim()
      if (str.length <= length)
        return str
      else
        return str.slice(0, length) + ' ...'
    },
    navigate: function (watcher) {
      chrome.tabs.create({ 'url': watcher.url }, function (tab) {
        chrome.tabs.executeScript(tab.id, {
          code: 'WATCHER_CHECK("' + watcher.xpath + '");',
          runAt: 'document_idle'
        })
      })
    },
    options: function () {
      chrome.tabs.create({ 'url': chrome.extension.getURL('pages/options.html') })
    },
    refresh: function (watcher, method) {
      chrome.runtime.sendMessage({ to: 'background', type: 'refresh', method: method, id: watcher.id })
    },
    reset: function (watcher) {
      storage.watchers.reset(watcher)
    },
    refresh_all: function (method) {
      chrome.runtime.sendMessage({ to: 'background', type: 'refresh_all', method: method })
    },
    remove: function (watcher) {
      if (confirm('Are your sure to remove this watcher?'))
        storage.watchers.remove(watcher.id)
    },
    remove_all: function () {
      if (confirm('Are your sure to remove all watchers?'))
        storage.watchers.clear()
    },
    humandate: function (datastr) {
      return moment(datastr || '').fromNow()
    },
    download: function (text, name, type) {
      var a = document.createElement('a');
      var file = new Blob([text], { type: type });
      a.href = URL.createObjectURL(file);
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      delete a;
    },
    export_data: function () {
      this.download(storage.watchers.json(), 'tracker_export_' + moment().format('YYMMDD_hhmmss') + '.json', 'application/json')
    },
    open_panel: function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { to: 'dialog', type: 'toggle' })
      })
    },
    upload_and_import: function (e) {
      var files = e.target.files
      var file = files[0]
      var reader = new FileReader()
      reader.onload = function () {
        console.log(this.result)
        storage.watchers.import(this.result)
      }
      reader.readAsText(file)
    }
  }
}
