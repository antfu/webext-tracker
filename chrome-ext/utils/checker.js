var checker = checker || {}

checker.auto = function (watcher) {

}

checker.lite = function (watcher, callback) {
  http_request_async('get', watcher.url, function (content) {
    var $ = cheerio.load(content)
    var el = cheerio_xpath_evlutate($, watcher.xpath)
    callback(el.text().trim(), watcher)
  })
}

checker.tab = function (watcher, callback) {
  chrome.tabs.create({
    url: watcher.url,
    pinned: true,
    active: false
  }, function (tab) {
    chrome.tabs.executeScript(tab.id, {
      code: 'WATCHER_CHECK("' + watcher.xpath + '", true);',
      runAt: 'document_idle'
    })
  })
}


/* ====== Functions for Lite ====== */
function cheerio_xpath_evlutate($, xpath) {
  if (xpath.startsWith('/'))
    xpath = xpath.slice(1)
  if (xpath.toLowerCase().startsWith('html'))
    xpath = xpath.slice(4)
  if (xpath.startsWith('/'))
    xpath = xpath.slice(1)

  xpath = xpath.split('/');
  var el = $('html');
  for (var i = 0; i < xpath.length; i++) {
    if (!xpath[i].length)
      continue
    if (xpath[i].indexOf('[') === -1) {
      el = el.children(xpath[i])
    } else {
      var x = xpath[i]
      var selector = x.split('[')[0];
      var index = 0
      var el_id = x.match(/\[@id=['|"](.*?)['|"]\]/)
      if (el_id) {
        selector += '#' + el_id[1]
        x = x.replace(el_id[0], '')
      }
      var el_classes = x.match(/\[@class=['|"](.*?)['|"]\]/)
      if (el_classes) {
        selector += '[class="' + el_classes[1] + '"]'
        x = x.replace(el_classes[0], '')
      }
      var el_index = x.match(/\[(.*?)\]/)
      if (el_index) {
        index = el_index[1] - 1;
        x = x.replace(el_index[0], '')
      }

      el = el.children(selector).eq(index)
      console.log(xpath[i], '->', selector, index, '['+el.length+']')
      console.log(el.text().trim())
      console.log('------------')
    }
  }
  return el
}

function http_request_async(method, url, callback) {
  method = (method || 'GET').toUpperCase()
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open(method, url, true); // true for asynchronous
  xmlHttp.send(null);
}
/* =============== End =============== */
