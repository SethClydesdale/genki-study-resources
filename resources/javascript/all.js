// # MODIFICATIONS FOR ALL PAGES #
(function (window, document) {
  'use strict';
  
  // # EDITION REDIRECTOR #
  // properly redirects the student to their preferred edition when clicking the home links
  if (storageOK && localStorage.GenkiEdition == '3rd' && /\/privacy\/|\/report\/|\/help\/|\/donate\/|\/download\//.test(window.location.pathname)) {
    document.getElementById('home-link').href += 'lessons-3rd/';
    document.getElementById('footer-home').href += 'lessons-3rd/';
  }
  
  
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
  
  
  // # DARK MODE AND SETTINGS #
  // Allows the student to switch to a dark version of Genki Study Resources. (Great for late night studying!)
  // Also adds a button to manage global site settings.
  if (storageOK) {
    var footer = document.querySelector('footer'),
        button = document.createElement('LABEL'),
        container = document.createElement('DIV'),
        settings = document.createElement('A');
    
    // set button params
    button.id = 'light-switch';
    button.tabIndex = 0;
    button.innerHTML = '<input id="light-switch-checkbox" type="checkbox" ' + (localStorage.darkMode == 'on' ? 'checked="true"' : '') + '/><div></div>';
    
    // toggle dark mode when the enter key is pressed while focused
    button.onkeyup = function (e) {
      if (e.key == 'Enter') this.firstChild.click();
    };
    
    // toggles dark mode when the checkbox state changes
    button.firstChild.onchange = function () {
      var root = document.documentElement, css;
      
      if (this.checked) { // turn dark mode on
        localStorage.darkMode = 'on';
        
        // add dark mode css to the head
        css = document.createElement('LINK');
        css.id = 'dark-mode';
        css.rel = 'stylesheet';
        css.href = getPaths() + 'resources/css/stylesheet-dark.min.css';
        
        document.head.appendChild(css);
        root.className += ' dark-mode';
        
      } else { // turn dark mode off
        localStorage.darkMode = 'off';
        
        // remove dark mode css
        css = document.getElementById('dark-mode');
        css && document.head.removeChild(css);
        root.className = root.className.replace(' dark-mode', '');
      }
      
      // change canvas colors
      if (window.KanjiCanvas) {
        KanjiCanvas.darkMode = document.querySelector('.dark-mode') ? true : false;
        KanjiCanvas.quizOver = document.querySelector('.quiz-over') ? true : false;
        
        for (var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length; i < j; i++) {
          if (KanjiCanvas['canvas_' + a[i].id]) KanjiCanvas.redraw(a[i].id, true, window.Genki ? Genki.strokeNumberDisplay : false);
        }
      }
    };
    
    // set container params
    container.id = 'light-switch-container';
    container.innerHTML = '<label id="light-switch-label" for="light-switch-checkbox">Dark Mode </label>';
    
    // settings button
    settings.id = 'genki-site-settings';
    settings.innerHTML = '<i class="fa">&#xf013;</i>';
    settings.title = 'Site Settings';
    settings.href = '#';
    settings.onclick = function () {
      // prevent opening popup when one is already opened
      // mainly for the exercise selector. If using the shortcut you'll be stuck loading if you haven't selected an exercise yet.
      if (document.getElementById('genki-modal')) return false;
      
      // open settings manager
      GenkiSettings.manager();
      
      // prevent normal link behavior
      return false;
    };
    
    // add the elements to the document
    container.appendChild(button);
    container.appendChild(settings);
    footer.appendChild(container);
  } 
  
  // show help link instead of dark mode when running in limited mode
  else {
    var footer = document.querySelector('footer'),
        container = document.createElement('DIV');
    
    container.id = 'light-switch-container';
    container.innerHTML = '<a href="' + getPaths() + 'help/stuck-loading/' + (window.location.protocol == 'file:' ? 'index.html' : '') + '"><strong>Where is Dark Mode?</strong></a>';
    
    footer.appendChild(container);
  }
  
  
  // # KEYBOARD SHORTCUTS #
  // various keyboard shortcuts used around the website
  document.addEventListener('keyup', function (e) {
    if (e.ctrlKey && e.altKey) {
      var button;

      // check what key was pressed
      switch (e.key.toLowerCase()) {
        // previous exercise (ctrl+alt+left)
        case 'left':
        case 'arrowleft':
          button = document.querySelector('.prev-ex');
          break;

        // next exercise (ctrl+alt+right)
        case 'right':
        case 'arrowright':
          button = document.querySelector('.next-ex');
          break;

        // toggle exercise list (ctrl+alt+e)
        case 'e':
          button = document.getElementById('toggle-exercises');
          break;

        // toggle quick jisho (ctrl+alt+q)
        case 'q':
          button = document.getElementById('quick-jisho-toggle');
          break;

        // toggle dark mode (ctrl+alt+d)
        case 'd':
          button = document.getElementById('light-switch');
          break;

        // toggle furigana (ctrl+alt+f)
        case 'f':
          button = document.getElementById('toggle-furigana');
          break;

        // random exercise (ctrl+alt+r)
        case 'r':
          button = document.getElementById('random-exercise');
          break;

        // open site settings (ctrl+alt+m)
        case 'm':
          button = document.getElementById('genki-site-settings');
          break;

        default:
          break;
      }

      // prevent default behavior and click the button
      if (button) {
        e.preventDefault();
        button.click();
      }
    }
  });
}(window, document));