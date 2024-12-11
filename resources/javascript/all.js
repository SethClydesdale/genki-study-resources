// # MODIFICATIONS FOR ALL PAGES #
(function (window, document) {
  'use strict';
  
  // # EDITION REDIRECTOR #
  // properly redirects the student to their preferred edition when clicking the home links
  if (storageOK && localStorage.GenkiEdition == '3rd' && /\/privacy\/|\/report\/|\/help\/|\/donate\/|\/download\//.test(window.location.pathname)) {
    document.getElementById('home-link').href += 'lessons-3rd/';
    document.getElementById('footer-home').href += 'lessons-3rd/';
  }
  
  
  // # ANNOUNCEMENTS #
  if (document.getElementById('announcement')) {
    window.GenkiAnn = {
      rotation : false, // determines if the announcements rotate
      edition : /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd', // determines current edition

      // announcement messages
      // params:
      // date: [OPTIONAL] adds a date to the announcement, useful for highlighting updates and what not.
      // content: message body for the announcement; write your announcements here!
      // edition: [OPTIONAL] restricts the announcement to a specific edition, possible values are: 3rd || 2nd, announcements are global by default
      msg : [
        {
          date : '10/26/24',
          content : '<a href="https://ko-fi.com/post/GenkiTobira-Recent-Updates-Future-Plans-Z8Z6158OWB" target="_blank">Click here</a> to learn about the recent updates made to the website as well as my future plans.'
        },

        {
          content : 'Interested in learning Japanese? Check out <a href="' + getPaths() + 'help/japanese-guide/">our guide</a> for more information on how to learn the language, as well as useful tools that you can utilize in your studies!'
        },

        {
          edition : '2nd',
          content : 'Looking for more self-study resources? Visit the official <a href="http://genki.japantimes.co.jp/self_en">self-study room</a> for Genki or check out some of the resources in the <a href="https://github.com/SethClydesdale/genki-study-resources#resources-for-studying-japanese">readme</a> on GitHub.'
        },

        {
          edition : '3rd',
          content : 'Looking for more self-study resources? Visit the official <a href="https://genki3.japantimes.co.jp/en/student/">self-study room</a> for Genki or check out some of the resources in the <a href="https://github.com/SethClydesdale/genki-study-resources#resources-for-studying-japanese">readme</a> on GitHub.'
        },

        {
          content : 'Want to stay up to date on the latest changes made to Genki Study Resources? You can follow updates via <a href="https://github.com/SethClydesdale/genki-study-resources/commits/master">GitHub</a>, <a href="https://twitter.com/search?q=(%23GenkiStudyResources)%20(from%3Asethc1995)&src=typed_query&f=live">Twitter</a>, or <a href="https://ko-fi.com/sethc95/posts">Ko-fi</a>. Feel free to also contact us on <a href="https://github.com/SethClydesdale/genki-study-resources/discussions">the forum</a> if you have any questions or feedback.'
        },

        {
          content : 'Have a question about the site? Check out the <a href="' + getPaths() + 'help/">FAQ</a>! If you can\'t find an answer to your question, feel free to contact us via <a href="https://github.com/SethClydesdale/genki-study-resources/issues">GitHub\'s issues</a> and we\'ll try to answer your question in a timely manner.'
        },

        {
          content : 'Find a bug or mistake on the site? Want to submit a suggestion or give us feedback? Check out the <a href="' + getPaths() + 'report/">report page</a> for more information. We\'d love to hear from you!'
        },

        {
          content : 'Don\'t have a network connection all the time? Genki Study Resources can be used offline as well! Head on over to the <a href="' + getPaths() + 'download/">download page</a> to get the latest release.'
        },

        {
          content : 'If you found this tool helpful for studying with Genki, please consider making <a href="' + getPaths() + 'donate/">a donation</a> to help support my work. Thank you!'
        }
      ],

      index : 0,
      list : document.getElementById('announce-list'),


      // shows the next announcement
      next : function (n, manual) {
        // hide old message
        GenkiAnn.msg[GenkiAnn.index].className += ' announce-hidden';

        // add +1 or -1 depending on the button press
        if (typeof n == 'number') {
          GenkiAnn.index += n;

          if (GenkiAnn.index == -1) {
            GenkiAnn.index = GenkiAnn.msg.length - 1;
          }
        } 

        // for automatic rotation increase index by 1
        else {
          GenkiAnn.index++;
        }

        // reset index if it exceeds the current announcements
        if (!GenkiAnn.msg[GenkiAnn.index]) {
          GenkiAnn.index = 0;
        }

        // show new message
        GenkiAnn.msg[GenkiAnn.index].className = GenkiAnn.msg[GenkiAnn.index].className.replace(' announce-hidden', '');

        // reset rotation if messages were moved manually
        if (GenkiAnn.rotation && manual) {
          window.clearInterval(GenkiAnn.rotator);
          GenkiAnn.rotate();
        }
      },


      // start announcement rotation
      rotate : function () {
        GenkiAnn.rotator = window.setInterval(GenkiAnn.next, 15000);
      },


      // sets up the announcements
      init : function () {
        // set up if more than 1 announcement
        if (GenkiAnn.msg.length > 1) {
          document.getElementById('announcement-controls').style.display = '';

          // parse announcements
          for (var i = 0, j = GenkiAnn.msg.length, ann = '', first = true; i < j; i++) {
            if (!GenkiAnn.msg[i].edition || GenkiAnn.msg[i].edition.toLowerCase() == GenkiAnn.edition) {
              ann += '<div class="announcement' + (first ? '' : ' announce-hidden') + '">'+
                (GenkiAnn.msg[i].date ? '<span class="date">' + GenkiAnn.msg[i].date + '</span>' : '')+
                GenkiAnn.msg[i].content+
              '</div>';

              // first announcement is shown, so hide the rest
              first && (first = false);
            }
          }

          // add announcements to the document
          GenkiAnn.list.insertAdjacentHTML('beforeend', ann);
          GenkiAnn.msg = document.querySelectorAll('.announcement');

          // commence rotation if enabled
          if (GenkiAnn.rotation) {
            GenkiAnn.rotate();
          }
        }
      }
    };

    // initialize the announcement module
    GenkiAnn.init();
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
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.altKey || e.metaKey && e.shiftKey) {
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

        // check answers (ctrl+alt+c)
        case 'c':
          button = document.getElementById('check-answers-button');
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
    

    // shortcuts for multi-choice options
    // ALT + A/B/C/D
    if (Genki.active.type == 'multi' && e.altKey && /a|b|c|d/i.test(e.key)) {
      var opt = document.querySelector('#quiz-q' + Genki.stats.solved + ' div[data-option="' + e.key.toUpperCase() + '"]');
      
      if (opt) {
        opt.click();
        e.preventDefault();
      }
    }
  });
}(window, document));