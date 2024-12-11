// # MODIFICATIONS FOR THE HOMEPAGE ONLY #
(function (window, document) {
  'use strict';
  
  // # EDITION PREFERENCE #
  // stores the currently selected edition so the student can be correctly redirected when clicking home links
  if (storageOK) {
    localStorage.GenkiEdition = /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd';
  }
  
  
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
          'style="color:#F93;" '+
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
  
  
  // # EXERCISE RESULTS #
  // Displays exercise results next to each exercise
  if (storageOK && localStorage.Results) {
    var exResults = JSON.parse(localStorage.Results)[/lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd'], k, a;

    for (k in exResults) {
      a = document.querySelector('a[href*="' + k + '"]');

      if (a) {
        a.parentNode.insertAdjacentHTML('beforeend', '&nbsp;<span class="exercise-results result--' + (exResults[k] == 100 ? 'perfect' : exResults[k] >= 70 ? 'good' : exResults[k] >= 50 ? 'average' : 'low') + '" title="Exercise score"><i class="fa">' + (exResults[k] == 100 ? '&#xf005;' : exResults[k] >= 70 ? '&#xf00c;' : exResults[k] >= 50 ? '&#xf10c;' : '&#xf00d;') + '</i> ' + exResults[k] + '%</span>');
      }
    }
  }  
  
}(window, document));