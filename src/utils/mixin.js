var mixin = {
  methods: {
    less: function(data, length) {
      length = length || 100
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
            code: 'WATCHER_CHECK("'+watcher.xpath+'");',
            runAt: 'document_idle'
        })
      })
    },
    refresh: function(watcher) {
      chrome.tabs.create({url: watcher.url, pinned:true, active:false}, function(tab) {
        console.log(tab);
        chrome.tabs.executeScript(tab.id, {
            code: 'WATCHER_CHECK("'+watcher.xpath+'", true);',
            runAt: 'document_idle'
        })
      })
    },
    refresh_all: function() {
      var i = this.watchers.length
      while(i--)
        this.refresh(this.watchers[i])
    },
    remove: function(watcher) {
      if (confirm("Are your sure to remove this watcher?"))
        storage.watchers.remove(watcher.id)
    },
    remove_all: function() {
      if (confirm("Are your sure to remove all watchers?"))
      storage.watchers.clear()
    },
    humandate: function(datastr) {
      return moment(datastr || '').fromNow()
    }
  }
}
