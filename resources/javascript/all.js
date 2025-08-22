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
          date : '6/6/25',
          content : "Quartet Study Resources is now available! <a href=\"https://ko-fi.com/post/Quartet-Study-Resources-is-Now-Available-Y8Y61G3093\" target=\"_blank\">Click here</a> to learn more about this new Japanese practice website."
        },
        
        {
          date : '5/22/25',
          content : "From today on, I will be streaming the development progress of Quartet Study Resources on Twitch each day to share the process of building these websites. <a href=\"https://ko-fi.com/post/About-Development-Streams-Z8Z61FDRV3\" target=\"_blank\">Click here</a> for more information, such as my schedule."
        },
        
        {
          date : '5/13/25',
          content : "You can now choose what exercises you want to practice for the Random Exercise Button via the settings manager! <a href=\"https://ko-fi.com/post/New-Custom-Random-Exercise-Range-for-GenkiTobira-U6U41EXQ3G\" target=\"_blank\">Click here</a> to learn more about this new setting."
        },
        
        {
          date : '5/9/25',
          content : "You can now change the interface language of the website to 日本語 via the settings manager! <a href=\"https://ko-fi.com/post/New-Language-Option-for-GenkiTobira-A0A41EQV3C\" target=\"_blank\">Click here</a> to learn more about this new setting."
        },
        
        {
          date : '4/8/25',
          content : 'The Genki <a href="https://ko-fi.com/post/The-Genki-Grammar-Index-is-now-Complete-U7U01D73DJ" target="_blank">Grammar Index</a> is now complete! If you notice any typos or have any suggestions, please don\'t hesitate to let us know on GitHub. Happy Studying!'
        },
        
        {
          date : '2/10/25',
          content : "You can now change the main theme color to the Genki II color scheme via the settings manager! <a href=\"https://ko-fi.com/post/New-Theme-Option-for-Genki-Study-Resources-L3L21ADWSN\" target=\"_blank\">Click here</a> to learn more about this new setting."
        },
        
        {
          date : '1/15/25',
          content : "Happy New Year! With the new year, comes new projects! <a href=\"https://ko-fi.com/post/Plans-for-2025-C0C2192FBX\" target=\"_blank\">Click here</a> to learn about what I have planned for 2025."
        },
        
        {
          date : '12/14/24',
          content : "I've been slowly rolling out ads on my website recently. They're optional for this project, however, so please <a href=\"https://ko-fi.com/post/Statement-Regarding-Ads-V7V717GGS6\" target=\"_blank\">click here</a> to learn more about this update."
        },
        
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
        
        // Live Stream announcement (only shows when stream is active)
        // only execute on the online version, since checking twitch state offline doesn't work due to CORS policy
        if (window.location.protocol != 'file:') {
          // caches streaming state for 30 minutes to reduce amount of requests
          var cacheState = function (state) {
            if (storageOK) {
              localStorage.twitchLiveState = state;
              localStorage.twitchLiveState_exp = +new Date;
            }
          },

          // displays an announcement that the developer is streaming live on Twitch
          displayLiveAnnouncement = function () {
            document.querySelector('.announcement:not(.announce-hidden)').className += ' announce-hidden';
            GenkiAnn.list.insertAdjacentHTML('afterBegin',
              '<div class="announcement">'+
                '<span class="date"><span class="t-red" style="margin-right:1px;">●</span>LIVE</span>'+
                'Come hang out and watch the development progress of Quartet Study Resources on <a href="https://www.twitch.tv/sethc95" target="_blank">Twitch</a>.'+
              '</div>'
            );
            GenkiAnn.msg = document.querySelectorAll('.announcement');
          };
          
          // display live announcement without checking if online and 10 minutes hasn't passed
          if (storageOK && localStorage.twitchLiveState && localStorage.twitchLiveState_exp > +new Date - 30*60*1000) {
            if (localStorage.twitchLiveState == 'online') {
              displayLiveAnnouncement();
            }
          }
          
          // check twitch to see if developer is streaming live
          else {
            window.addEventListener('load', function () {
              var script = document.createElement('SCRIPT'),
                  stream = document.createElement('DIV');

              stream.id = 'stream';
              stream.style.display = 'none';

              script.src = 'https://player.twitch.tv/js/embed/v1.js';
              script.async = true;
              script.onload = function () {
                var options = {
                  width: 300,
                  height: 300,
                  channel: 'sethc95',
                  parent: ['sethclydesdale.github.io'],
                  muted: true,
                  autoplay: false
                };

                var player = new Twitch.Embed('stream', options);

                // offline; do nothing except kill the iframe
                player.addEventListener(Twitch.Player.OFFLINE, function () {
                  stream.querySelector('iframe').src = 'about:blank';
                  document.body.removeChild(stream);
                  cacheState('offline');
                });

                // online; show live stream announcement and kill the iframe
                player.addEventListener(Twitch.Player.ONLINE, function () {
                  stream.querySelector('iframe').src = 'about:blank';
                  document.body.removeChild(stream);

                  displayLiveAnnouncement();
                  cacheState('online');
                });
              };

              document.head.appendChild(script);
              document.body.appendChild(stream);
            });
          }
        }
      }
    };
    
    // holiday easter eggs/messages
    var date = new Date(),
        month = date.getMonth() + 1,
        day = date.getDate();
    
    // christmas
    if (month == 12 && day == 25) {
      GenkiAnn.msg.splice(0, 0, {
        content : "<ruby>今日<rt>きょう</rt></ruby>はクリスマスだよ。メリークリスマス！"
      });
      
      // decoration
      var ann = document.getElementById('announcement');
      ann.style.position = 'relative';
      ann.style.paddingBottom = '25px';
      ann.style.marginBottom = '75px';
      ann.insertAdjacentHTML('beforeend', '<div id="holiday-deco" style="height:100px;width:100%;position:absolute;left:0;bottom:-70px;background-image:url(\'' + getPaths() + ('resources/images/holiday/xmas.png') + '\');background-size:auto 100%;pointer-events:none;"></div>');
    }
    
    // halloween
    else if (month == 10 && day == 31) {
      GenkiAnn.msg.splice(0, 0, {
        content : "ハッピーハロウィン！お<ruby>菓子<rt>かし</rt></ruby>をくれないとイタズラしちゃうぞ！"
      });
      
      // decoration
      window._scrollSpider = {

        config : {
          side : 'right',
          offset : '0px',

          tooltip : 'Squash..?',
          image : getPaths() + '/resources/images/holiday/halloween.png',
          web : 'background-color:#000;width:2px;height:999em;position:absolute;right:42%;bottom:95%;'
        },

        // move the spider based on the percentage the document has been scrolled
        move : function() {
          _scrollSpider.spider.style.top = ((document.body.scrollTop + document.documentElement.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100) + '%';
        },

        // scroll the page to the top
        goingUp : false,
        toTop : function() {
          if (!_scrollSpider.goingUp && (document.body.scrollTop || document.documentElement.scrollTop)) {
            var body = document.body.scrollTop ? document.body : document.documentElement;

            _scrollSpider.goingUp = true;
            _scrollSpider.scroll = {
              top : body.scrollTop, // cached scroll position
              body : body,
              by : (document.documentElement.scrollHeight - document.documentElement.clientHeight) / 100, // scroll by 1% of the total document height

              // interval for scrolling the document ( and spider ) back to the top
              window : window.setInterval(function() {
                if (_scrollSpider.scroll.top > 0) {
                  _scrollSpider.scroll.body.scrollTop = _scrollSpider.scroll.top -= _scrollSpider.scroll.by;
                  _scrollSpider.move();
                } else {
                  window.clearInterval(_scrollSpider.scroll.window); 
                  _scrollSpider.goingUp = false;
                }
              }, 10)
            };

          }
        },

        // offset the spider based on the height of the image
        // this is so it's visible when the document is scrolled to 100%
        applyOffset : function() {
          var img = _scrollSpider.spider.getElementsByTagName('IMG')[0];

          if (img && img.complete) {
            _scrollSpider.spider.style.marginTop = '-' + img.height + 'px';
            _scrollSpider.spider.style.display = ''; // show spider after offset has been applied (should be properly hidden now)
          } else {
            window.addEventListener('load', _scrollSpider.applyOffset);
          }
        },

        // initial setup of the scrolling spider element
        init : function() {
          var spider = document.createElement('DIV');

          spider.id = 'scrollSpider';
          spider.innerHTML = '<div style="' + _scrollSpider.config.web + '"></div><img src="' + _scrollSpider.config.image + '" onclick="_scrollSpider.toTop();" style="cursor:pointer;" title="' + _scrollSpider.config.tooltip + '">';
          spider.style.position = 'fixed';
          spider.style[/left|right/i.test(_scrollSpider.config.side) ? _scrollSpider.config.side : 'right'] = _scrollSpider.config.offset;
          spider.style.top = '0%';
          spider.style.display = 'none'; // keeps spider hidden until image has been loaded (otherwise it'll be briefly visible until the offset is applied)

          document.body.appendChild(spider);

          _scrollSpider.spider = spider;
          _scrollSpider.move();
          _scrollSpider.applyOffset();

          window.addEventListener('scroll', _scrollSpider.move);
        }

      };

      document.addEventListener('DOMContentLoaded', _scrollSpider.init); // perform initialization when the DOM is loaded
    }
    
    // new year's
    else if (month == 1 && day == 1) {
      GenkiAnn.msg.splice(0, 0, {
        content : "<ruby>皆<rt>みな</rt></ruby>さん、あけましておめでとうございます！<ruby>今年<rt>ことし</rt></ruby>も<ruby>頑張<rt>がんば</rt></ruby>りましょう！"
      });
    }
    
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
    container.innerHTML = '<label id="light-switch-label" for="light-switch-checkbox"><span class="en">Dark Mode</span><span class="ja">ダークモード</span> </label>';
    
    // settings button
    settings.id = 'genki-site-settings';
    settings.innerHTML = '<i class="fa">&#xf013;</i>';
    settings.title = GenkiLang == 'ja' ? 'ウェブサイトの設定' : 'Site Settings';
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
    container.innerHTML = '<a href="' + getPaths() + 'help/stuck-loading/' + (window.location.protocol == 'file:' ? 'index.html' : '') + '"><strong><span class="en">Where is Dark Mode?</span><span class="ja">ダークモードはどこ？</span></strong></a>';
    
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
          
        // toggle language (ctrl+alt+l)
        case 'l':
          GenkiSettings.updateLang(null, GenkiLang == 'ja' ? 'en' : 'ja');
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
    // ALT + A/B/C/D/...
    if (Genki.active.type == 'multi' && e.altKey) {
      // Use the physical keyboard press to ignore the special character produced from the modifier
      var answer = e.code.replace('Key', '').toUpperCase()
      var opt = document.querySelector('#quiz-q' + Genki.stats.solved + ' div[data-option="' + answer + '"]');
      
      if (opt) {
        opt.click();
        e.preventDefault();
      }
    }
  });
}(window, document));