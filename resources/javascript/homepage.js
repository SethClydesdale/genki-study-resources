// # MODIFICATIONS FOR THE HOMEPAGE ONLY #
(function (window, document) {
  'use strict';
  
  // # QUICK SEARCH #
  var search = document.getElementById('quick-search'),
      results = document.getElementById('quick-search-results'),
      hitsCounter = document.getElementById('quick-search-hits'),
      li = document.querySelectorAll('.lesson-exercises li'),
      exLen = li.length;
  
  // search function
  function quickSearch (value) {
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
  
  
  // # JUMP ARROWS #
  // Add arrows to each lesson title that will take the student back to the quick navigation
  AddJumpArrowsTo('.lesson-title', 'quick-nav', 'Jump to Quick Navigation');
}(window, document));