var funcs = mixin.methods
var watchers = []
var tbody = document.getElementById('tbody')
var nowatchers = document.getElementById('nowatchers')

function refresh_all() {
  var urls = []
  var i = watchers.length
  while(i--)
  {
    var url = watchers[i].url
    if (urls.indexOf(url) === -1)
    {
      funcs.refresh(watchers[i])
      urls.push(url)
    }
  }
}

function removeElementsByClass(className){
    var elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function get_watchers() {
  storage.watchers(function (data) {
    watchers = data || []
    removeElementsByClass('watcher')
    if (!watchers.length)
      nowatchers.className = ''
    else {
      nowatchers.className = 'hidden'
      for (var i = 0, j = watchers.length; i < j; i++) {
        var w = watchers[i]
        var row = document.createElement("tr")
        var desc = document.createElement("td")
        var current = document.createElement("td")
        var navi_a = document.createElement("a")
        var opt_a = document.createElement("a")
        var time = document.createElement("td")
        var changed = w.text != w.current
        row.className = changed ? 'changed watcher' : 'watcher'
        navi_a.innerHTML = w.desc
        navi_a.addEventListener('click', function () {
          funcs.navigate(w)
        })
        desc.className = 'desc'
        desc.appendChild(navi_a)
        opt_a.innerHTML = changed ? 'Changed' : 'No changes'
        opt_a.addEventListener('click', function () {
          funcs.options()
        })
        current.className = 'current'
        current.appendChild(opt_a)
        time.innerHTML = funcs.humandate(w.update_time)
        row.appendChild(desc)
        row.appendChild(current)
        row.appendChild(time)
        tbody.insertBefore(row, nowatchers)
      }
    }
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
  funcs.options()
})

document.getElementById('refresh').addEventListener('click', function() {
  refresh_all()
})
