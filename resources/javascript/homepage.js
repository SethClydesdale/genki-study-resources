// # MODIFICATIONS FOR THE HOMEPAGE ONLY #
(function (window, document) {
  'use strict';
  
  // # EDITION PREFERENCE #
  // stores the currently selected edition so the student can be correctly redirected when clicking home links
  if (storageOK) {
    localStorage.GenkiEdition = /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd';
  }
  
  
  // # QUICK SEARCH #
  if (document.getElementById('quick-search')) {
    window.QuickSearcher = {
      grammarIndex : /grammar-index/.test(window.location.pathname),
      search : document.getElementById('quick-search'),
      results : document.getElementById('quick-search-results'),
      hitsCounter : document.getElementById('quick-search-hits'),
      
      // set after definition
      li : null,
      exLen : null,
      
      // search for the specified value
      query : function (value) {
        // clear existing timeout
        if (QuickSearcher.timeout) {
          clearTimeout(QuickSearcher.timeout);
        }

        // wait 300ms before submitting search, just in case the user is still typing
        QuickSearcher.timeout = setTimeout(function() {
          var frag = document.createDocumentFragment(),
              hits = 0,
              i = 0,
              clone;

          // clear prior searches
          QuickSearcher.results.innerHTML = '';

          // loop over the exercises if a value is present
          if (value) {
            for (; i < QuickSearcher.exLen; i++) {
              if ((QuickSearcher.li[i].innerHTML.replace(/||<.*?>/g, '').toLowerCase().indexOf(value.toLowerCase()) != -1 || (QuickSearcher.li[i].dataset && QuickSearcher.li[i].dataset.keywords && QuickSearcher.li[i].dataset.keywords.toLowerCase().indexOf(value.toLowerCase()) != -1)) && QuickSearcher.li[i].getElementsByTagName('A')[0] && !/note/.test(QuickSearcher.li[i].id)) {
                // clone the link (if on homepage) or create a new link (if on the grammar index)
                if (QuickSearcher.grammarIndex) {
                  clone = document.createElement('LI');
                  clone.innerHTML = '<a href="#' + QuickSearcher.li[i].id + '">' + QuickSearcher.li[i].innerHTML.replace(/||<a.*?>.*?<\/a>/g, '') + '</a>';
                } else {
                  clone = QuickSearcher.li[i].cloneNode(true); // clone the match for displaying in the results node
                }

                // add lesson number to exercise or grammar point
                clone.dataset.lesson = QuickSearcher.grammarIndex ? 'L' + QuickSearcher.li[i].id.replace(/l(\d+)-.*/, '$1') : clone.getElementsByTagName('A')[0].href.replace(/.*?\/(lesson-\d+).*|.*?\/(study-tools).*|.*?\/(appendix).*/, function (Match, $1, $2, $3) {
                  if ($1) {
                    return $1.charAt(0).toUpperCase() + $1.split('-').pop();

                  } else if ($2) {
                    return 'tool'

                  } else if ($3) {
                    return 'appendix'
                  }
                });

                // add tooltip in case the text gets cut off
                clone.title = clone.innerText;

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
            QuickSearcher.results.appendChild(frag);

          } else {
            QuickSearcher.results.innerHTML = value ? '<li><span class="en">No results found for "' + value + '".</span><span class="ja">「' + value + '」が見つかりませんでした。</span></li>' : '';
          }

          // update the hits counter and add a button to copy the search link
          QuickSearcher.hitsCounter.innerHTML = hits ? '(' + hits + ') '+
            '<a '+
              'class="fa" '+
              'style="color:#F93;" '+
              'href="#copy-search-link" '+
              'title="' + (GenkiLang == 'ja' ? 'サーチリンクをコピーする' : 'Copy the search link') + '" '+
              'onclick="QuickSearcher.copyLink(\'' + value + '\'); return false;"'+
            '>&#xf0ea;</a>' : '';

          delete QuickSearcher.timeout;
        }, 300);
      },
      
      // opens a popup for copying the search link
      copyLink : function (value) {
        GenkiModal.open({
          title : '<span class="en">Copy Search Link</span><span class="ja">サーチリンクをコピーする</span>',
          content : 
          '<div class="center">'+
            '<p><span class="en">You can copy the direct search link from the box below.</span><span class="ja">下の箱からサーチリンクがコピーできます。</span></p>'+
            '<textarea id="copied-search-link" onfocus="this.select();" style="width:80%;height:100px;">' + (window.location.protocol + '//' + window.location.host + window.location.pathname) + '?search=' + encodeURIComponent(value) + '#quick-search-exercises</textarea><br>'+
            '<button class="button" onclick="CopyText(document.getElementById(\'copied-search-link\').value, this);"><i class="fa">&#xf0c5;</i><span class="en">Copy</span><span class="ja">コピーする</span></button>'+
          '</div>',
          focus : '#copied-search-link'
        });
      }
    };
    
    // set remaining data for search functionality
    QuickSearcher.li = document.querySelectorAll(QuickSearcher.grammarIndex ? '.workbook-title' : '.lesson-exercises li');
    QuickSearcher.exLen = QuickSearcher.li.length;


    // set the value of the search field via the url (e.g. ?search=kanji)
    if (window.location.search) {
      var query = window.location.search.slice(1).split('&'),
          i = 0,
          j = query.length,
          keyVal;

      for (; i < j; i++) {
        keyVal = query[i].split('=');

        if (/^search$/i.test(keyVal[0])) {
          QuickSearcher.search.value = decodeURIComponent(keyVal[1]);
          break;
        }
      }
    }

    // search for exercises when the user inputs text
    QuickSearcher.search.oninput = function () {
      QuickSearcher.query(this.value);
    };

    // resume previous searches (in the event the user goes back in history) or those initiated by ?search=query
    if (QuickSearcher.search.value) {
      QuickSearcher.query(QuickSearcher.search.value);
    }
  }
  
  
  // # QUICK NAV SUB-SECTIONS #
  // Adds buttons for showing sub-sections in each lesson.
  for (var a = document.querySelectorAll('#quick-nav-list a'), i = 0, j = a.length, lesson_regex = /grammar-index/.test(window.location.pathname) ? /.*?lesson-grammar-(\d+).*/ : /.*?lesson-(\d+).*/, l; i < j; i++) {
    if (/lesson-\d+|lesson-grammar-\d+/.test(a[i])) {
      l = a[i].href.replace(lesson_regex, '$1'); // get lesson number
      
      // create button and list
      a[i].insertAdjacentHTML('beforebegin', '<a class="sub-section-button fa" href="#toggle-sub-section" onclick="ToggleSubSection(this, '+ l +'); return false;" title="' + (GenkiLang == 'ja' ? 'サブセクションをトグルする' : 'Toggle sub-sections') + '" data-open="false"></a>');
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
        str += '<li><a href="#' + sec[i].id + '">' + sec[i].innerHTML.replace(/\s\(.*\)$/, '').replace(/<a.*?>.*?<\/a>/g, '') + '</a></li>';
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
  AddJumpArrowsTo('.lesson-title', 'quick-nav', GenkiLang == 'ja' ? 'クイックナビゲーションに戻る' : 'Jump to Quick Navigation');  
  
  // # EXERCISE RESULTS #
  // Displays exercise results next to each exercise
  if (storageOK && localStorage.Results) {
    var exResults = JSON.parse(localStorage.Results)[/lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd'], k;

    for (k in exResults) {
      for (var a = document.querySelectorAll('a[href*="' + k + '/"]'), i = 0, j = a.length; i < j; i++) {
        if (a[i]) {
          a[i].parentNode.insertAdjacentHTML('beforeend', '&nbsp;<span class="exercise-results result--' + (exResults[k] == 100 ? 'perfect' : exResults[k] >= 70 ? 'good' : exResults[k] >= 50 ? 'average' : 'low') + '" title="' + (GenkiLang == 'ja' ? 'テストの得点' : 'Exercise score') + '"><i class="fa">' + (exResults[k] == 100 ? '&#xf005;' : exResults[k] >= 70 ? '&#xf00c;' : exResults[k] >= 50 ? '&#xf10c;' : '&#xf00d;') + '</i> ' + exResults[k] + '%</span>');
        }
      }
    }
  }  
  
}(window, document));