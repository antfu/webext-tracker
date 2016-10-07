var app = new Vue({
  el: '#vue-root',
  data: {
    watchers: {},
    configs: {
      background_timeout: 1800000,
      check_on_start: true,
    },
  },
  mixins: [mixin]
})

function get_watchers() {
  storage.watchers(function (data) {
    app.watchers = data || []
  })
}

app.$watch('configs', function (newVal, oldVal) {
  storage.configs.update(app.configs)
}, {
  deep: true,
  immediate: true
})

storage.configs.listen(function (new_configs) {
  app.configs = new_configs
  if (!app.configs.background_timeout)
    app.configs.background_timeout = 1800000
})

storage.watchers.listen(function (watchers) {
  app.watchers = watchers
})

document.getElementById('upload_input').addEventListener('change', function (e) {
  var files = e.target.files
  var file = files[0]
  var reader = new FileReader()
  reader.onload = function () {
    console.log(this.result)
    storage.watchers.import(this.result)
  }
  reader.readAsText(file)
})
