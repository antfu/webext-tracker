# Tracker

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/nijeghmbfkeegaiihloeeknoidnajnlk.svg?style=flat-square)](https://chrome.google.com/webstore/detail/web-element-watcher/nijeghmbfkeegaiihloeeknoidnajnlk)
![State](https://img.shields.io/badge/state-alpha-red.svg?style=flat-square)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/antfu/tracker/blob/master/LICENSE)

**Tracker** is a tool helps you fetch the changes of webpages effortlessly.

Now you don't have to refresh a page again and again checking whether there is something updated anymore.
Simply right click the element you interested and add it to tracker list. Then just sit back and relax,
**Tracker** will notify you if any changes detected.

Install Tracker from [Chrome Web Store](https://chrome.google.com/webstore/detail/web-element-watcher/nijeghmbfkeegaiihloeeknoidnajnlk)

## Screenshots
![](screenshots/04.png)

## How does it works

Tracker use a subset of [XPath](https://www.w3.org/TR/xpath/) to locate the specific elements of the html page.

- [XMLHttpRequest](http://www.w3schools.com/xml/ajax_xmlhttprequest_create.asp) for requesting the pages.
- [cheerio](https://github.com/cheeriojs/cheerio) for evaluating the XPath.
- A modified [XPath Helper](https://chrome.google.com/webstore/detail/xpath-helper/hgimnogjllphhhkhlmebbmlgjoejdpjl?hl=en) for querying the XPath string.
- [Vue.js](https://github.com/vuejs/vue) for DOM rendering.
- [Milligram](https://milligram.github.io/) for styling.

## It can NOT do (for now):
- Fetching pages with authentication/login needed (but works fine will Cookies with tab Mode)
- Asynchronous loading content
- Contents with uncertain position  

## Todo

- [x] Request checking ( with out tabs )
- [x] Background checking ( also an option for it )
- [x] Notifications
- [x] Badges for changed items
- [x] Tracker list on tracked pages
- [ ] More options on "New Tracker" page
- [x] Add "Checking" status to dashboard
- [x] Import
- [x] Configures storages
- [ ] Detect on network failed
- [x] Do-not-auto-check-this option for tracker
- [ ] XPath editing

## License

MIT
