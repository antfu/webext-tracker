# How Tracker works
Tracker use a subset of [XPath](https://www.w3.org/TR/xpath/)
to locate the specific elements of the html page.
When you create a tracker for an element, it recorded the XPath and the value of
the element. Then it will checking if there is any changes to the element in background.

## Querying Modes
- [Lite](#lite_mode)
- [Tab](#tab_mode)

### Lite Mode
Lite mode use [XMLHttpRequest](http://www.w3schools.com/xml/ajax_xmlhttprequest_create.asp)
to request the page. Then use [cheerio](https://github.com/cheeriojs/cheerio)
evaluating XPath to find the specific elements.

Lite mode works in background quietly. But it can only query static contents.
For dynamic or authentication-needed content, you may need to use [Tab Mode](#tab_mode).


### Tab Mode
Tab mode use Chrome's native tab to request and evaluate XPath.
It's more powerful since the JavaScript and Cookies is available.
Tab mode is able to query most of elements on webpages.

But on the other side, it cost more time and more data transporting
than [Lite Mode](#lite_mode). You will also see a pinned tab created and then closed in serval seconds
while querying (which is kinda annoying).

![Gif screenshot]()

### Mode Switching
You can change the querying mode in [Tracker Dashboard](chrome-extension://nijeghmbfkeegaiihloeeknoidnajnlk/pages/options.html).

## List of dependencies
(included in project)

- [XMLHttpRequest](http://www.w3schools.com/xml/ajax_xmlhttprequest_create.asp) for requesting the pages.
- [cheerio](https://github.com/cheeriojs/cheerio) for evaluating the XPath.
- A modified [XPath Helper](https://chrome.google.com/webstore/detail/xpath-helper/hgimnogjllphhhkhlmebbmlgjoejdpjl?hl=en) for querying the XPath string.
- [Vue.js](https://github.com/vuejs/vue) for DOM rendering.
- [Milligram](https://milligram.github.io/) for styling.
