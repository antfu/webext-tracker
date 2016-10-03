/**
 * Copyright 2011 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @author opensource@google.com
 * @license Apache License, Version 2.0.
 */

'use strict';

// Extension namespace.
var xh = xh || {};

////////////////////////////////////////////////////////////
// Generic helper functions and constants

xh.SHIFT_KEYCODE = 16;
xh.X_KEYCODE = 88;

xh.elementsShareFamily = function(primaryEl, siblingEl) {
  var p = primaryEl, s = siblingEl;
  return (p.tagName === s.tagName &&
          (!p.className || p.className === s.className) &&
          (!p.id || p.id === s.id));
};

xh.getElementIndex = function(el) {
  var index = 1;  // XPath is one-indexed
  var sib;
  for (sib = el.previousSibling; sib; sib = sib.previousSibling) {
    if (sib.nodeType === Node.ELEMENT_NODE && xh.elementsShareFamily(el, sib)) {
      index++;
    }
  }
  if (index > 1) {
    return index;
  }
  for (sib = el.nextSibling; sib; sib = sib.nextSibling) {
    if (sib.nodeType === Node.ELEMENT_NODE && xh.elementsShareFamily(el, sib)) {
      return 1;
    }
  }
  return 0;
};

xh.toArray = function(obj) {
    var l = obj.length, i, j=0, out = [];
    for(i=0; i<l; i++)
    {
      if (obj[i] && obj[i].nodeType === Node.ELEMENT_NODE)
      {
        out[j] = obj[i];
        j++;
      }
    }
    return out;
};

xh.brothers = function(el) {
  var brothers = xh.toArray(el.parentNode.childNodes);
  var el_index = brothers.indexOf(el);
  if (el_index > -1)
    brothers.splice(el_index, 1);
  return brothers;
};

xh.hasBrothersWithSameTag = function(el) {
  var brothers = xh.brothers(el);
  var tag = el.tagName.toLowerCase();
  var i = brothers.length;
  while (i--)
    if (brothers[i].tagName.toLowerCase() == tag)
      return true;
  return false;
};

xh.getUniqueClass = function(el) {
  var brothers = xh.brothers(el);
  var el_classes = el.className.split(' ');
  var bro_classes = [];
  var i = brothers.length;
  while(i--)
  {
    var b = brothers[i];
    var classes = (b.className + '').split(' ');
    var j = classes.length;
    while (j--)
      if (bro_classes.indexOf(classes[j]) === -1)
        bro_classes.push(classes[j]);
  }

  var eli = el_classes.length;
  while (eli--)
  {
    if (bro_classes.indexOf(el_classes[eli]) == -1)
      return [el_classes[eli]]
  }
  return el_classes;
}

xh.makeQueryForElement = function(el) {
  var query = '';
  for (; el && el.nodeType === Node.ELEMENT_NODE; el = el.parentNode) {
    var component = el.tagName.toLowerCase();
    var index = xh.getElementIndex(el);
    if (xh.hasBrothersWithSameTag(el))
    {
      if (el.id) {
        component += '[@id=\'' + el.id + '\']';
      } else if (el.className) {
        component += '[@class=\'' + el.className + '\']';
      }
    }
    if (index >= 1) {
      component += '[' + index + ']';
    }
    // If the last tag is an img, the user probably wants img/@src.
    if (query === '' && el.tagName.toLowerCase() === 'img') {
      component += '/@src';
    }
    query = '/' + component + query;
  }
  return query;
};

xh.highlight = function(els) {
  for (var i = 0, l = els.length; i < l; i++) {
    els[i].classList.add('wew-highlight');
  }
};

xh.clearHighlights = function() {
  var els = document.querySelectorAll('.wew-highlight');
  for (var i = 0, l = els.length; i < l; i++) {
    els[i].classList.remove('wew-highlight');
  }
};

// Returns [values, nodeCount]. Highlights result nodes, if applicable. Assumes
// no nodes are currently highlighted.
xh.evaluateQuery = function(query) {
  var xpathResult = null;
  var str = '';
  var nodeCount = 0;
  var elements = [];

  try {
    xpathResult = document.evaluate(query, document, null,
                                    XPathResult.ANY_TYPE, null);
  } catch (e) {
    str = '[INVALID XPATH EXPRESSION]';
    nodeCount = 0;
  }

  if (!xpathResult) {
    return [str, nodeCount];
  }

  if (xpathResult.resultType === XPathResult.BOOLEAN_TYPE) {
    str = xpathResult.booleanValue ? '1' : '0';
    nodeCount = 1;
  } else if (xpathResult.resultType === XPathResult.NUMBER_TYPE) {
    str = xpathResult.numberValue.toString();
    nodeCount = 1;
  } else if (xpathResult.resultType === XPathResult.STRING_TYPE) {
    str = xpathResult.stringValue;
    nodeCount = 1;
  } else if (xpathResult.resultType ===
             XPathResult.UNORDERED_NODE_ITERATOR_TYPE) {
    for (var node = xpathResult.iterateNext(); node;
         node = xpathResult.iterateNext()) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        elements.push(node);
      }
      if (str) {
        str += '\n';
      }
      str += node.textContent;
      nodeCount++;
    }
    if (nodeCount === 0) {
      str = '[NULL]';
    }
  } else {
    // Since we pass XPathResult.ANY_TYPE to document.evaluate(), we should
    // never get back a result type not handled above.
    str = '[INTERNAL ERROR]';
    nodeCount = 0;
  }

  xh.highlight(elements);
  return {text:str, els: elements, count: nodeCount};
};
