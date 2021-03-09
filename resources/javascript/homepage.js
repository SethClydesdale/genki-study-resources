// # MODIFICATIONS FOR THE HOMEPAGE ONLY #
(function (window, document) {
  'use strict';
  
  // # EDITION PREFERENCE #
  // stores the currently selected edition so the student can be correctly redirected when clicking home links
  if (storageOK) {
    localStorage.GenkiEdition = /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd';
  }
  
  
  // # ANNOUNCEMENTS #
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
        content : 'The 3rd Edition version of Genki Study Resources is currently under construction and will be expanded over time. You can follow updates to these resources via <a href="https://github.com/SethClydesdale/genki-study-resources/commits/master">GitHub</a>, <a href="https://twitter.com/search?q=(%23GenkiStudyResources)%20(from%3Asethc1995)&src=typed_query&f=live">Twitter</a>, or <a href="https://ko-fi.com/sethc95/posts">Ko-fi</a>. Furthermore, if you have any feedback regarding the 3rd edition resources, feel free to let me know <a href="https://github.com/SethClydesdale/genki-study-resources/discussions/83">here</a>. Thank you!',
        edition : '3rd'
      },
      
      {
        content : 'Want to stay up to date on the latest changes made to Genki Study Resources? You can follow updates via <a href="https://github.com/SethClydesdale/genki-study-resources/commits/master">GitHub</a>, <a href="https://twitter.com/search?q=(%23GenkiStudyResources)%20(from%3Asethc1995)&src=typed_query&f=live">Twitter</a>, or <a href="https://ko-fi.com/sethc95/posts">Ko-fi</a>. Feel free to also contact us on <a href="https://github.com/SethClydesdale/genki-study-resources/discussions">the forum</a> if you have any questions or feedback.',
        edition : '2nd'
      },
      
      {
        content : 'Looking for more self-study resources? Visit the official <a href="http://genki.japantimes.co.jp/self_en">self-study room</a> for Genki or check out some of the resources in the <a href="https://github.com/SethClydesdale/genki-study-resources#resources-for-studying-japanese">readme</a> on GitHub. If you use Anki to study vocab, you can find decks for the vocab on Genki Study Resources <a href="' + getPaths() + 'help/anki-decks/">here</a>! You can also find xlsx lists for the vocab <a href="https://github.com/SethClydesdale/genki-study-resources/tree/master/resources/tools/wordlist_E-J">here</a>.'
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
  
  
  // # QUICK SEARCH #
  var search = document.getElementById('quick-search'),
      results = document.getElementById('quick-search-results'),
      hitsCounter = document.getElementById('quick-search-hits'),
      li = document.querySelectorAll('.lesson-exercises li'),
      exLen = li.length;
  
  // search function
  function quickSearch (value) {
    // clear existing timeout
    if (window.GenkiSearchTimeout) {
      window.clearTimeout(GenkiSearchTimeout);
    }
    
    // wait 300ms before submitting search, just in case the user is still typing
    window.GenkiSearchTimeout = window.setTimeout(function() {
      var frag = document.createDocumentFragment(),
          hits = 0,
          i = 0,
          clone;

      // clear prior searches
      results.innerHTML = '';

      // loop over the exercises if a value is present
      if (value) {
        for (; i < exLen; i++) {
          if (li[i].innerText.toLowerCase().indexOf(value.toLowerCase()) != -1 && li[i].getElementsByTagName('A')[0]) {
            clone = li[i].cloneNode(true); // clone the match for displaying in the results node

            // add lesson number to exercise
            clone.dataset.lesson = clone.getElementsByTagName('A')[0].href.replace(/.*?\/(lesson-\d+).*|.*?\/(study-tools).*|.*?\/(appendix).*/, function (Match, $1, $2, $3) {
              if ($1) {
                return $1.charAt(0).toUpperCase() + $1.split('-').pop();

              } else if ($2) {
                return 'tool'

              } else if ($3) {
                return 'appendix'
              }
            });

            // add tooltip in case the text gets cut off
            clone.title = li[i].innerText;

            // add the clone to the fragment if it's valid
            if (!/^file|^http/.test(clone.dataset.lesson)) {
              frag.appendChild(clone);
              hits++; // increment hits
            }
          }
        }
      }

      // append the matched exercises or display an error message/hide the search results
      if (frag.childNodes.length) {
        results.appendChild(frag);

      } else {
        results.innerHTML = value ? '<li>No exercises found for "' + value + '".</li>' : '';
      }

      // update the hits counter and add a button to copy the search link
      hitsCounter.innerHTML = hits ? '(' + hits + ') '+
        '<a '+
          'class="fa" '+
          'style="color:#F60;" '+
          'href="#copy-search-link" '+
          'title="Copy the search link" '+
          'onclick="GenkiModal.open({'+
            'title : \'Copy Search Link\','+
            'content : \'<div class=&quot;center&quot;><p>You can copy the direct search link from the box below.</p>'+
            '<textarea id=&quot;copied-search-link&quot; onfocus=&quot;this.select();&quot; style=&quot;width:80%;height:100px;&quot;>' + (window.location.protocol + '//' + window.location.host + window.location.pathname) + '?search=' + encodeURIComponent(value) + '#quick-search-exercises</textarea></div>\','+
            'focus : \'#copied-search-link\''+
          '}); return false;"'+
        '>&#xf0ea;</a>' : '';
      
      delete window.GenkiSearchTimeout;
    }, 300);
  };
  
  
  // set the value of the search field via the url (e.g. ?search=kanji)
  if (window.location.search) {
    var query = window.location.search.slice(1).split('&'),
        i = 0,
        j = query.length,
        keyVal;
    
    for (; i < j; i++) {
      keyVal = query[i].split('=');
      
      if (/^search$/i.test(keyVal[0])) {
        search.value = decodeURIComponent(keyVal[1]);
        break;
      }
    }
  }
  
  // search for exercises when the user inputs text
  search.oninput = function () {
    quickSearch(this.value);
  };
  
  // resume previous searches (in the event the user goes back in history) or those initiated by ?search=query
  if (search.value) {
    quickSearch(search.value);
  }
  
  
  // # QUICK NAV SUB-SECTIONS #
  // Adds buttons for showing sub-sections in each lesson.
  for (var a = document.querySelectorAll('#quick-nav-list a'), i = 0, j = a.length, l; i < j; i++) {
    if (/lesson-\d+/.test(a[i])) {
      l = a[i].href.replace(/.*?lesson-(\d+).*/, '$1'); // get lesson number
      
      // create button and list
      a[i].insertAdjacentHTML('beforebegin', '<a class="sub-section-button fa" href="#toggle-sub-section" onclick="ToggleSubSection(this, '+ l +'); return false;" title="Toggle sub-sections" data-open="false"></a>');
      a[i].insertAdjacentHTML('afterend', '<ul style="display:none;"></ul>');
      
      // hide bullet style
      a[i].parentNode.className += ' noBullet';
    }
  }
  
  // toggles the display of each sub-section
  window.ToggleSubSection = function (caller, lesson) {
    var list = caller.parentNode.lastChild;
    
    // gets the sub-section title for the lesson
    if (!list.innerHTML) {
      // gets all sub section titles and parses them into a list
      for (var sec = document.querySelectorAll('#exercises-' + lesson + ' h3'), i = 0, j = sec.length, str = ''; i < j; i++) {
        str += '<li><a href="#' + sec[i].id + '">' + sec[i].innerText.replace(/\s\(.*\)$/, '') + '</a></li>';
      }
      
      // add the html to the list
      list.innerHTML = str;
    }
    
    // toggle list display and button icon
    if (/none/.test(list.style.display)) {
      list.style.display = 'block';
      caller.dataset.open = true;
      
    } else {
      list.style.display = 'none';
      caller.dataset.open = false;
    }
  };
  
  
  // # JUMP ARROWS #
  // Add arrows to each lesson title that will take the student back to the quick navigation
  AddJumpArrowsTo('.lesson-title', 'quick-nav', 'Jump to Quick Navigation');
  
}(window, document));