// # MODIFICATIONS FOR ALL PAGES #
(function (window, document) {
  'use strict';
  
  // # OFFLINE LINK MODIFICATIONS #
  // appends index.html to links if this project is hosted on the local file system
  if (window.location.protocol == 'file:') {
    for (var a = document.getElementsByTagName('A'), i = 0, j = a.length; i < j; i++) {
      if (!/http/.test(a[i].href)) {
        if (/\/$/.test(a[i].href)) {
          a[i].href += 'index.html';
        } else if (/\/#.*?$/.test(a[i].href)) {
          a[i].href = a[i].href.replace(/(#.*?)$/, 'index.html$1');
        } else if (/\/\?.*?$/.test(a[i].href)) {
          a[i].href = a[i].href.replace(/(\?.*?)$/, 'index.html$1');
        }
      }
    }
  }

  
  // # SECTION ANCHORS #
  // adds an anchor link to headings, so students can get the direct link for a section
  for (var h = document.getElementById('content').querySelectorAll('h1, h2, h3, h4, h5, h6'), i = 0, j = h.length; i < j; i++) {
    if (h[i].id) {
      h[i].insertAdjacentHTML('afterbegin', '<a href="#' + h[i].id + '" class="anchor fa"><span class="anchor-icon">&#xf0c1;</span></a>');
    }
  }
  
  
  // # DARK MODE #
  // Allows the student to switch to a dark version of Genki Study Resources. (Great for late night studying!)
  if (navigator.cookieEnabled && window.localStorage) {
    var footer = document.querySelector('footer'),
        button = document.createElement('LABEL'),
        container = document.createElement('DIV');
    
    // set button params
    button.id = 'light-switch';
    button.tabIndex = 0;
    button.innerHTML = '<input id="light-switch-checkbox" type="checkbox" ' + (window.localStorage.darkMode == 'on' ? 'checked="true"' : '') + '/><div></div>';
    
    // toggle dark mode when the enter key is press while focused
    button.onkeyup = function (e) {
      if (e.key == 'Enter') this.firstChild.click();
    };
    
    // toggles dark mode when the checkbox state changes
    button.firstChild.onchange = function () {
      var root = document.documentElement, css;
      
      if (this.checked) { // turn dark mode on
        window.localStorage.darkMode = 'on';
        
        // add dark mode css to the head
        css = document.createElement('LINK');
        css.id = 'dark-mode';
        css.rel = 'stylesheet';
        css.href = getPaths() + 'resources/css/stylesheet-dark.min.css';
        
        document.head.appendChild(css);
        root.className += ' dark-mode';
        
      } else { // turn dark mode off
        window.localStorage.darkMode = 'off';
        
        // remove dark mode css
        css = document.getElementById('dark-mode');
        css && document.head.removeChild(css);
        root.className = root.className.replace(' dark-mode', '');
      }
    };
    
    // set container params
    container.id = 'light-switch-container';
    container.innerHTML = '<label id="light-switch-label" for="light-switch-checkbox">Dark Mode </label>';
    
    // add the elements to the document
    container.appendChild(button);
    footer.appendChild(container);
  }
}(window, document));