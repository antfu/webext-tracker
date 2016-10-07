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

storage.watchers.listen(function(watchers) {
  app.watchers = watchers
})

document.getElementById('upload_input').addEventListener('change',function(e) {
  var files = e.target.files
  var file = files[0]
  var reader = new FileReader()
  reader.onload = function() {
    console.log(this.result)
    storage.watchers.import(this.result)
  }
  reader.readAsText(file)
})
