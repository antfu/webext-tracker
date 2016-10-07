var funcs = mixin.methods
var watchers = []
var tbody = document.getElementById('tbody')
var nowatchers = document.getElementById('nowatchers')
var background_enabled = document.getElementById('background_enabled')
var configs = {}

function removeElementsByClass(className) {
  var elements = document.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function update_watchers(watchers) {
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
      time.innerHTML = w.checking ? 'Checking...' : funcs.humandate(w.update_time)
      if (w.checking) time.className = 'checking-label'
      row.appendChild(desc)
      row.appendChild(current)
      row.appendChild(time)
      tbody.appendChild(row)
    }
  }
}

storage.watchers.listen(function (watchers) {
  update_watchers(watchers)
})

storage.configs(function (new_configs) {
  configs = new_configs
  background_enabled.checked = configs.background_refresh || false
})

document.getElementById('add').addEventListener('click', function () {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { to: 'dialog', type: 'toggle' })
  })
})

document.getElementById('options').addEventListener('click', function () {
  funcs.options()
})

document.getElementById('refresh').addEventListener('click', function () {
  funcs.refresh_all()
})

background_enabled.addEventListener('click', function() {
  console.log(background_enabled.checked)
  configs.background_refresh = background_enabled.checked
  storage.configs.update({background_refresh: background_enabled.checked})
})
