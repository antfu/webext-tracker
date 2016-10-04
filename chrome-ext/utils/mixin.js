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
      var urls = []
      var i = this.watchers.length
      while(i--)
      {
        var url = this.watchers[i].url
        if (urls.indexOf(url) === -1)
        {
          this.refresh(this.watchers[i])
          urls.push(url)
        }
      }
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
    },
    export_data: function() {
      function download(text, name, type) {
        var a = document.createElement("a");
        var file = new Blob([text], {type: type});
        a.href = URL.createObjectURL(file);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        delete a;
      }

      download(storage.watchers.json(), 'elwatcher_export_'+moment().format('YYMMDD_hhmmss')+'.json', 'application/json')
    }
  }
}
