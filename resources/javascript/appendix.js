// appendix tools
(function (window, document) {
  'use strict';
  
  Genki.appendix = {

    // dictionary functions
    jisho : {
      mode : 'ja', // dictionary mode
      selected : [], // selected definitions
      
      // node cache for improving performance
      cache : {
        box : {}, // checkbox cache used for mirrors
        group : {}, // group checkbox cache used for selecting groups
        
        // cache used for searches
        search : {
          ja : [],
          en : []
        }
      },
      
      
      // Initial setup of the dictionary by adding checkboxes, filling out the English-Japanese dictionary, and more..
      init : function () {
        var def, i, j, k, ja, en, cleaned, list,
            checked = storageOK && localStorage.selectedDefinitions ? localStorage.selectedDefinitions.split(',') : [],
            sorted = [],
            defList = {},
            frag, group, first,
            n = 0;
        
        for (k in Genki.jisho) {
          list = document.getElementById('list-' + k);
          frag = document.createDocumentFragment();
          
          for (i = 0, j = Genki.jisho[k].length; i < j; i++) {
            if (Genki.jisho[k][i].en) { // ignore empty definitions
              def = document.createElement('LI');
              def.className = 'definition clear';
              def.dataset.def = k + i; // use key and index as unique identifier
              
              // parse definition
              ja = Genki.jisho[k][i].ja.split('|');
              def.innerHTML = 
                '<input class="def-selector genki_input_hidden" type="checkbox" onchange="Genki.appendix.jisho.updateCheckboxes(this, \'' + def.dataset.def + '\');"' + (checked.indexOf(def.dataset.def) != -1 ? 'checked' : '') + '>'+
                '<span tabindex="0" class="genki_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
                '<span class="def-ja' + (ja[1] ? ' def-furi' : '') + '">'+
                  ja[0]+
                  (ja[1] ? '<i>' + ja[1] + '</i>' : '')+
                '</span>'+
                '<span class="def-en">' + Genki.jisho[k][i].en + '</span>'+
                (Genki.jisho[k][i].v ? ' <span class="def-vtype">[<i>' + Genki.jisho[k][i].v + '</i>]</span>' : '')+
                '<span class="def-label">' + Genki.jisho[k][i].l + '</span>';

              // add definition to dictionary
              frag.appendChild(def);

              // compile english definitions
              // cleans the english string and converts it to lowercase so words can be sorted more accurately
              cleaned = Genki.jisho[k][i].en.replace(/^\(.*?\) |^to be |^to |^the |^it |^\.\.\.(?:,|)|^\d+-|^\d+|^"|^-/i, '').toLowerCase();

              if (defList[cleaned]) { // if a key already exists, add the key with a random id
                cleaned = cleaned + '-' + ++n;
              }

              defList[cleaned] = def.cloneNode(true);
              sorted.push(cleaned);

              // cache japanese definition
              Genki.appendix.jisho.cache.box[def.dataset.def] = {
                ja : def.firstChild
              };

              // cache japanese definition group
              if (!Genki.appendix.jisho.cache.group[k]) {
                Genki.appendix.jisho.cache.group[k] = [];
              }
              Genki.appendix.jisho.cache.group[k].push(def.firstChild);

              // cache japanese definition for searches
              Genki.appendix.jisho.cache.search.ja.push(def);
            }
          }
          
          list.appendChild(frag);
        }
        
        // sort english definitions
        sorted = sorted.sort();
        group = 'A';
        frag = document.createDocumentFragment();
        
        // add english definitions to the English-Japanese dictionary
        for (i = 0, j = sorted.length; i < j; i++) {
          first = sorted[i].charAt(0);
          
          // append current group and start a new one
          if (first != group) {
            // checks if the definition key is valid
            if (/[a-z]/.test(first)) {
              document.getElementById('list-' + group).appendChild(frag);

              group = first.toUpperCase();
              frag = document.createDocumentFragment();
            } 
            // throws a soft error in the console if a definition is not valid so that we can fix it
            else {
              console.error('STRING CLEAN ERROR: "' + first + '" is an invalid definition key. The key must be alphabetical. (A-Z)\nDefinition Source: { ja : "' + defList[sorted[i]].querySelector('.def-ja').innerHTML.replace(/<span class="def-en">.*?<\/span>/, '') + '", en : "' + defList[sorted[i]].querySelector('.def-en').innerHTML + '" }');
            }

          }
          
          // move the english definition to the front
          en = defList[sorted[i]].innerHTML.match(/<span class="def-en">.*?<\/span>/);
          
          if (en[0]) { // only move definition if there's a match
            // build the english definition
            defList[sorted[i]].innerHTML = defList[sorted[i]].innerHTML.replace(/<span class="def-en">.*?<\/span>/, '').replace(/(<input.*?<\/span>)/, '$1' + en[0] + ' ');
            frag.appendChild(defList[sorted[i]]);
            
            // cache english definition
            Genki.appendix.jisho.cache.box[defList[sorted[i]].dataset.def].en = defList[sorted[i]].firstChild;
            
            // cache english definition group
            if (!Genki.appendix.jisho.cache.group[group]) {
              Genki.appendix.jisho.cache.group[group] = [];
            }
            Genki.appendix.jisho.cache.group[group].push(defList[sorted[i]].firstChild);
            
            // cache english definition for searches
            Genki.appendix.jisho.cache.search.en.push(defList[sorted[i]]);
          }
        }
        
        // append final group
        document.getElementById('list-' + group).appendChild(frag);
        
        // add definition count to each group's title
        for (var title = document.querySelectorAll('.dictionary-group .section-title'), i = 0, j = title.length; i < j; i++) {
          title[i].insertAdjacentHTML('beforeend', '<span class="definition-count">(' + Genki.appendix.jisho.cache.group[title[i].id.replace('section-', '')].length + ')</span>');
        }
        
        // add total definition count to the introduction
        document.getElementById('total-definitions').innerHTML = '<strong>' + Genki.appendix.jisho.cache.search.ja.length + '</strong>';
        
        // restore preferences
        Genki.appendix.jisho.restoreSettings();
        
        // add jump arrows
        AddJumpArrowsTo('.dictionary-group .section-title', 'dictionary-top', GenkiLang == 'ja' ? '辞書索引に戻る' : 'Return to the top of the dictionary');
        
        // update exercise title name
        document.getElementById('exercise-title').insertAdjacentHTML('beforeend', ' Word Practice');
        
        // cache nodes for searching
        Genki.appendix.jisho.cache.search.res_ja = document.getElementById('dict-search-results-ja');
        Genki.appendix.jisho.cache.search.res_en = document.getElementById('dict-search-results-en');
        Genki.appendix.jisho.cache.search.hit_ja = document.getElementById('dict-search-hits-ja');
        Genki.appendix.jisho.cache.search.hit_en = document.getElementById('dict-search-hits-en');
        
        // finally show the dictionary
        Genki.appendix.finishedLoading();
      },
      
      
      // switches dictionary mode
      // ja = japanese-english
      // en = english-japanese
      switchMode : function (mode, init) {
        var ja = {
          button : document.getElementById('ja-mode'),
            dict : document.getElementById('japanese-english')
        },

        en = {
          button : document.getElementById('en-mode'),
            dict : document.getElementById('english-japanese')
        };

        // japanese-english mode
        if (mode == 'ja' && Genki.appendix.jisho.mode != 'ja') {
          // update active button
          ja.button.className += ' active-mode';
          en.button.className = en.button.className.replace(' active-mode', '');

          // show the active dictionary
          en.dict.className += ' dict-hidden';
          ja.dict.className = ja.dict.className.replace(' dict-hidden', '');
        } 

        // english-japanese mode
        else if (mode == 'en' && Genki.appendix.jisho.mode != 'en') {
          // update active button
          en.button.className += ' active-mode';
          ja.button.className = ja.button.className.replace(' active-mode', '');

          // show the active dictionary
          ja.dict.className += ' dict-hidden';
          en.dict.className = en.dict.className.replace(' dict-hidden', '');
        }
        
        Genki.appendix.jisho.mode = mode;

        // save preferences
        if (!init && storageOK) {
          localStorage.genkiJishoMode = mode;
        }
      },
      
      
      // updates localStorage and checkbox mirrors
      updateCheckboxes : function (caller, id, selectAll) {
        var box = Genki.appendix.jisho.cache.box[id],
            index = Genki.appendix.jisho.selected.indexOf(id),
            k;

        if (caller.checked) {
          for (k in box) {
            if (caller != box[k]) {
              box[k].checked = true;
            }
          }

          // add definition to array
          if (index == -1) {
            Genki.appendix.jisho.selected.push(id);
          }

        } else if (!caller.checked) {
          for (k in box) {
            if (caller != box[k]) {
              box[k].checked = false;
            }
          }

          // remove definition from array
          if (index != -1) {
            Genki.appendix.jisho.selected.splice(index, 1);
          }
        }

        // save selected
        if (!selectAll && storageOK) {
          localStorage.selectedDefinitions = Genki.appendix.jisho.selected;
        }
      },
      
      
      // select/deselect helper
      // state: true||false (checkbox state)
      // target: '#list-{A|B|C|あ|い|う}' (selects the target group; ex: '#list-A')
      // custom: true||false (allows custom target selector if true)
      selectAll : function (state, target) {
        var a = target ? Genki.appendix.jisho.cache.group[target] : Genki.appendix.jisho.cache.box, i, j, k;
        
        if (!a) {
          return;
        }
        
        // update all checkboxes
        if (target) { // target selection
          for (i = 0, j = a.length; i < j; i++) {
            if (a[i].checked != state) {
              a[i].checked = state;
              Genki.appendix.jisho.updateCheckboxes(a[i], a[i].parentNode.dataset.def, true);
            }
          }
          
        } else { // select all using the node cache
          for (k in a) {
            if (a[k].ja.checked != state) {
              a[k].ja.checked = state;
              Genki.appendix.jisho.updateCheckboxes(a[k].ja, a[k].ja.parentNode.dataset.def, true);
            }
          }
        }
        
        // save selected
        if (storageOK) {
          localStorage.selectedDefinitions = Genki.appendix.jisho.selected;
        }
      },
      
      
      // toggles word lists
      toggleList : function (caller, all) {
        // toggle all word lists
        if (all) {
          var parent = caller.parentNode.parentNode.parentNode.parentNode,
              buttons = parent.querySelectorAll('.dictionary-group .group-selectors'),
              list = parent.querySelectorAll('.dictionary-group .word-list'),
              toggles = parent.querySelectorAll('.dictionary-group .toggle-word-list'),
              i = 0, j = list.length;
          
          // show definitions
          if (/Show/.test(caller.innerHTML)) {
            for (; i < j; i++) {
              list[i].className = list[i].className.replace(' hidden', '');
              buttons[i].className = buttons[i].className.replace(' hidden', '');
              toggles[i].innerHTML = toggles[i].innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
            }

            caller.innerHTML = caller.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
          } 
          
          // hide definitions
          else {
            for (; i < j; i++) {
              if (!/hidden/.test(list[i].className)) list[i].className += ' hidden';
              if (!/hidden/.test(buttons[i].className)) buttons[i].className += ' hidden';
              toggles[i].innerHTML = toggles[i].innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
            }

            caller.innerHTML = caller.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
          }
        }
        
        // toggle single word lists
        else {
          var parent = caller.parentNode.parentNode,
              buttons = parent.querySelector('.group-selectors'),
              list = parent.querySelector('.word-list');
          
          // show definitions
          if (/hidden/.test(list.className)) {
            list.className = list.className.replace(' hidden', '');
            buttons.className = buttons.className.replace(' hidden', '');
            caller.innerHTML = caller.innerHTML.replace('Show', 'Hide').replace('表示', '非表示')
          }

          // hide definitions
          else {
            list.className += ' hidden';
            buttons.className += ' hidden';
            caller.innerHTML = caller.innerHTML.replace('Hide', 'Show').replace('非表示', '表示')
          }
        }
      },
      
      
      // quick search
      search : function (value, mode, retry) {
        // clear existing timeout
        if (Genki.appendix.jisho.searchTimeout) {
          window.clearTimeout(Genki.appendix.jisho.searchTimeout);
        }
        
        // wait 300ms before submitting search, just in case the user is still typing
        Genki.appendix.jisho.searchTimeout = window.setTimeout(function() {
          var frag = document.createDocumentFragment(),
              results = Genki.appendix.jisho.cache.search['res_' + mode],
              hitsCounter = Genki.appendix.jisho.cache.search['hit_' + mode],
              def = Genki.appendix.jisho.cache.search[mode],
              defLen = def.length,
              hits = 0,
              i = 0,
              k,
              clone;

          // uncache clones
          for (k in Genki.appendix.jisho.cache.box) {
            if (Genki.appendix.jisho.cache.box[k]['search_' + mode]) {
              delete Genki.appendix.jisho.cache.box[k]['search_' + mode]
            }
          }
          Genki.appendix.jisho.cache.group['search_' + mode] = [];

          // clear prior searches
          results.innerHTML = '';

          // loop over the dictionary if a value is present
          if (value) {
            for (; i < defLen; i++) {
              if (def[i].innerText.toLowerCase().indexOf(value.toLowerCase()) != -1) {
                clone = def[i].cloneNode(true);
                frag.appendChild(clone); // clone the match for displaying in the results node

                // cache search clone
                Genki.appendix.jisho.cache.box[def[i].dataset.def]['search_' + mode] = clone.firstChild;
                Genki.appendix.jisho.cache.group['search_' + mode].push(clone.firstChild);

                hits++; // increment hits
              }
            }
          }
          
          // perform a kanji only search if the previous one yeilded no results
          if (!retry && !frag.childNodes.length && value && /[\u3400-\u9faf]/.test(value)) {
            var kanji = value.match(/[\u3400-\u9faf]+/);
            
            if (kanji && kanji[0]) {
              Genki.appendix.jisho.search(kanji[0], mode, true);
            }
          } 
          
          // show results
          else {
            // append the matched exercises or display an error message/hide the search results
            if (frag.childNodes.length) {
              results.parentNode.querySelector('.group-selectors').style.visibility = '';
              results.appendChild(frag);

            } else {
              results.parentNode.querySelector('.group-selectors').style.visibility = 'hidden';
              results.innerHTML = value ? '<li><span class="en">No results found for "' + value + '".</span><span class="ja">「' + value + '」が見つかりませんでした。</span></li>' : '';
            }

            hitsCounter.innerHTML = hits ? '(' + hits + ') ' : '';
          }
          
          delete Genki.appendix.jisho.searchTimeout;
        }, 300);
      },
      
      
      // purges bad definition ids (don't exist anymore or on the current site; e.g. going from tobira --> genki version which have different selectors)
      purgeBadSelectors : function () {
        var j = Genki.appendix.jisho.selected.length;
        
        // verify selected definitions
        for (var i = 0, badId = []; i < j; i++) {
          if (!document.querySelector('#japanese-english [data-def="' + Genki.appendix.jisho.selected[i] + '"]')) {
            badId.push(Genki.appendix.jisho.selected[i]);
          }
        }
        
        // purge bad selectors
        if (badId.length) {
          while (badId.length) {
            Genki.appendix.jisho.selected.splice(Genki.appendix.jisho.selected.indexOf(badId[0]), 1);
            badId.splice(0, 1);
          }
          
          // update storage with correction
          if (storageOK) {
            localStorage.selectedDefinitions = Genki.appendix.jisho.selected;
          }
          
          // update with new length
          j = Genki.appendix.jisho.selected.length;
        }
      },
      
      
      // launches an exercise based on a selected list of words
      launchExercise : function () {
        var j = Genki.appendix.jisho.selected.length;
        
        // remove bad selectors before starting
        Genki.appendix.jisho.purgeBadSelectors();
        
        // initiate an exercise once 5 or more words have been selected
        if (j < 5) {
          GenkiModal.open({
            title : '<span class="en">Please select more words.</span><span class="ja">言葉をもっと選択してください。</span>',
            content : '<span class="en">Please select <b>' + (5 - j) + '</b> more word' + (5 - j == 1 ? '' : 's') + ' to begin a practice exercise.</span><span class="ja">言葉を<b>' + (5 - j) + '</b>つ選択してください。</span>'
          });
          
        } else {
          GenkiModal.open({
            title : '<span class="en">Begin Practice?</span><span class="ja">練習を始めますか？</span>',
            content : '<span class="en">Are you ready to practice your selected words?</span><span class="ja">選択した言葉を練習してもよろしいですか？</span>',
            buttonText : 'Yes',
            keepOpen : true,
            
            callback : function () {
              var sel = Genki.appendix.jisho.selected,
                  quizlet = {}, i = 0, def, furi;

              for (; i < j; i++) {
                def = document.querySelector('#japanese-english [data-def="' + sel[i] + '"]');
                furi = def.querySelector('.def-furi i');

                quizlet[def.querySelector('.def-ja').innerHTML.replace(/<i>.*?<\/i>/, '') + (furi ? '|' + furi.innerHTML : '')] = def.querySelector('.def-en').innerHTML;
              }
              
              Genki.generateQuiz({
                format : 'vocab',
                type : ['multi', 'drag', 'writing', 'fill'],
                info : [Genki.lang.vocab_multi, Genki.lang.std_drag, Genki.lang.vocab_writing, Genki.lang.vocab_fill],

                quizlet : quizlet
              });
              
              Genki.appendix.showExercise();
            }
          });
        }
      },
      
      
      // opens a modal for managing/viewing the words selected in the dictionary
      manageWords : function () {
        GenkiModal.open({
          title : '<span class="en">Manage Selected Words</span><span class="ja">選択した言葉</span>',
          content : '<ol id="selected_words_list" class="dict-search-results"></ol>',

          buttonText : 'Close',
          noFocus : true,

          customSize : {
            top : '5%',
            left : '10%',
            bottom : '5%',
            right : '10%'
          }
        });
        
        // remove bad selectors before showing current selection
        Genki.appendix.jisho.purgeBadSelectors();

        // disply currently selected words
        var list = document.getElementById('selected_words_list'),
            checked = storageOK && localStorage.selectedDefinitions ? localStorage.selectedDefinitions.split(',') : [],
            i = 0,
            j = Genki.appendix.jisho.selected.length,
            frag, def, ja, ja_def;

        if (j) {
          frag = document.createDocumentFragment();

          // parse selected definitions
          for (; i < j; i++) {
            def = document.createElement('LI');
            def.className = 'definition clear';
            def.dataset.def = Genki.appendix.jisho.selected[i];

            // selected definition data
            ja = Genki.jisho[Genki.appendix.jisho.selected[i].slice(0, 1)][Genki.appendix.jisho.selected[i].slice(1)];
            ja_def = ja.ja.split('|');

            def.innerHTML = 
              '<input class="def-selector genki_input_hidden" type="checkbox" onchange="Genki.appendix.jisho.updateCheckboxes(this, \'' + def.dataset.def + '\');"' + (checked.indexOf(def.dataset.def) != -1 ? 'checked' : '') + '>'+
              '<span tabindex="0" class="genki_pseudo_checkbox" onclick="this.previousSibling.click(); Genki.appendix.jisho.removeSelectedWord(this);" onkeypress="if (event.key == \'Enter\') { this.previousSibling.click(); Genki.appendix.jisho.removeSelectedWord(this); }"></span>'+
              '<span class="def-ja' + (ja_def[1] ? ' def-furi' : '') + '">'+
                ja_def[0]+
                (ja_def[1] ? '<i>' + ja_def[1] + '</i>' : '')+
              '</span>&nbsp;'+
              '<span class="def-en">' + ja.en + '</span>'+
              (ja.v ? ' <span class="def-vtype">[<i>' + ja.v + '</i>]</span>' : '')+
              '<span class="def-label">' + ja.l + '</span>';

            frag.appendChild(def);
          }

          list.appendChild(frag);
          list.querySelector('.genki_pseudo_checkbox').focus();

        } else {
          list.innerHTML = '<span class="en">No words selected.</span><span class="ja">言葉は選択していません。</span>';
        }
      },


      // removes selected dictionary word
      removeSelectedWord : function (caller) {
        var list = document.getElementById('selected_words_list');
        list.removeChild(caller.parentNode);

        if (!list.childNodes.length) {
          list.innerHTML = '<span class="en">No words selected.</span><span class="ja">言葉は選択していません。</span>';
        }
      },
      
      
      // restores preferences for the dictionary
      restoreSettings : function () {
        if (storageOK) {
          
          // dictionary mode pref.
          if (localStorage.genkiJishoMode && localStorage.genkiJishoMode != 'ja') {
            Genki.appendix.jisho.switchMode(localStorage.genkiJishoMode, true);
          }
          
          // restore selected definitions
          if (localStorage.selectedDefinitions) {
            Genki.appendix.jisho.selected = localStorage.selectedDefinitions.split(',');
          }
          
        }
      }
      
    },
    
    
    // study the map of Japan
    studyMap : function () {
      GenkiModal.open({
        title : 'Study Map of Japan?',
        content : 'Are you ready to study the map of Japan? Please select the quiz you would like to take below.<br><br>'+
        '<div class="center">'+
          '<select id="selected-map">'+
            '<option value="1"' + ( storageOK && localStorage.genkiSelectedMap == '1' ? ' selected' : '') + '>Hokkaido and Tohoku Region (1-8)</option>'+
            '<option value="2"' + ( storageOK && localStorage.genkiSelectedMap == '2' ? ' selected' : '') + '>Kanto Region (9-15)</option>'+
            '<option value="3"' + ( storageOK && localStorage.genkiSelectedMap == '3' ? ' selected' : '') + '>Chubu Region (16-23)</option>'+
            '<option value="4"' + ( storageOK && localStorage.genkiSelectedMap == '4' ? ' selected' : '') + '>Kinki Region (24-30)</option>'+
            '<option value="5"' + ( storageOK && localStorage.genkiSelectedMap == '5' ? ' selected' : '') + '>Chugoku and Shikoku Region (31-39)</option>'+
            '<option value="6"' + ( storageOK && localStorage.genkiSelectedMap == '6' ? ' selected' : '') + '>Kyushu Region (40-47)</option>'+
            '<option value="7"' + ( storageOK && localStorage.genkiSelectedMap == '7' ? ' selected' : '') + '>Cities and Landmarks 1 (48-58)</option>'+
            '<option value="8"' + ( storageOK && localStorage.genkiSelectedMap == '8' ? ' selected' : '') + '>Cities and Landmarks 2 (59-69)</option>'+
          '</select>'+
        '</div>',

        callback : function () {
          var selected = document.getElementById('selected-map'),
              title = document.getElementById('exercise-title'),
              name = selected.options[selected.selectedIndex].innerHTML.replace(/\(.*?\)$/, 'Quiz'),
              id = +selected.value,
              range,
              rangeList = [],
              answers,
              quizlet,
              randomQuizlet = [],
              i, j, n;

          // store selection
          if (storageOK) {
            localStorage.genkiSelectedMap = id;
          }

          // setup quizlet
          switch (id) {
            case 1 : // Hokkaido & Tohoku Region
              range = '1-8';
              quizlet = [
                {
                  question : '<span class="inline-furi">北海道<i class="furigana">ほっかいどう</i></span>',
                  answers : [ 'A1' ]
                },

                {
                  question : '<span class="inline-furi">青森県<i class="furigana">あおもりけん</i></span>',
                  answers : [ 'A2' ]
                },

                {
                  question : '<span class="inline-furi">秋田県<i class="furigana">あきたけん</i></span>',
                  answers : [ 'A3' ]
                },

                {
                  question : '<span class="inline-furi">岩手県<i class="furigana">いわてけん</i></span>',
                  answers : [ 'A4' ]
                },

                {
                  question : '<span class="inline-furi">山形県<i class="furigana">やまがたけん</i></span>',
                  answers : [ 'A5' ]
                },

                {
                  question : '<span class="inline-furi">宮城県<i class="furigana">みやぎけん</i></span>',
                  answers : [ 'A6' ]
                },

                {
                  question : '<span class="inline-furi">新潟県<i class="furigana">にいがたけん</i></span>',
                  answers : [ 'A7' ]
                },

                {
                  question : '<span class="inline-furi">福島県<i class="furigana">ふくしまけん</i></span>',
                  answers : [ 'A8' ]
                }
              ];
              break;

            case 2 : // Kanto Region
              range = '9-15';
              quizlet = [
                {
                  question : '<span class="inline-furi">群馬県<i class="furigana">ぐんまけん</i></span>',
                  answers : [ 'A9' ]
                },
                
                {
                  question : '<span class="inline-furi">栃木県<i class="furigana">とちぎけん</i></span>',
                  answers : [ 'A10' ]
                },
                
                {
                  question : '<span class="inline-furi">茨城県<i class="furigana">いばらきけん</i></span>',
                  answers : [ 'A11' ]
                },
                
                {
                  question : '<span class="inline-furi">埼玉県<i class="furigana">さいたまけん</i></span>',
                  answers : [ 'A12' ]
                },
                
                {
                  question : '<span class="inline-furi">東京都<i class="furigana">とうきょうと</i></span>',
                  answers : [ 'A13' ]
                },
                
                {
                  question : '<span class="inline-furi">千葉県<i class="furigana">ちばけん</i></span>',
                  answers : [ 'A14' ]
                },
                
                {
                  question : '<span class="inline-furi">神奈川県<i class="furigana">かながわけん</i></span>',
                  answers : [ 'A15' ]
                }
              ];
              break;

            case 3 : // Chubu Region
              range = '16-23';
              quizlet = [
                {
                  question : '<span class="inline-furi">山梨県<i class="furigana">やまなしけん</i></span>',
                  answers : [ 'A16' ]
                },
                
                {
                  question : '<span class="inline-furi">長野県<i class="furigana">ながのけん</i></span>',
                  answers : [ 'A17' ]
                },
                
                {
                  question : '<span class="inline-furi">静岡県<i class="furigana">しずおかけん</i></span>',
                  answers : [ 'A18' ]
                },
                
                {
                  question : '<span class="inline-furi">富山県<i class="furigana">とやまけん</i></span>',
                  answers : [ 'A19' ]
                },
                
                {
                  question : '<span class="inline-furi">石川県<i class="furigana">いしかわけん</i></span>',
                  answers : [ 'A20' ]
                },
                
                {
                  question : '<span class="inline-furi">福井県<i class="furigana">ふくいけん</i></span>',
                  answers : [ 'A21' ]
                },
                
                {
                  question : '<span class="inline-furi">岐阜県<i class="furigana">ぎふけん</i></span>',
                  answers : [ 'A22' ]
                },
                
                {
                  question : '<span class="inline-furi">愛知県<i class="furigana">あいちけん</i></span>',
                  answers : [ 'A23' ]
                }
              ];
              break;

            case 4 : // Kinki Region
              range = '24-30';
              quizlet = [
                {
                  question : '<span class="inline-furi">滋賀県<i class="furigana">しがけん</i></span>',
                  answers : [ 'A24' ]
                },
                
                {
                  question : '<span class="inline-furi">三重県<i class="furigana">みえけん</i></span>',
                  answers : [ 'A25' ]
                },
                
                {
                  question : '<span class="inline-furi">京都府<i class="furigana">きょうとけん</i></span>',
                  answers : [ 'A26' ]
                },
                
                {
                  question : '<span class="inline-furi">大阪府<i class="furigana">おおさかふ</i></span>',
                  answers : [ 'A27' ]
                },
                
                {
                  question : '<span class="inline-furi">奈良県<i class="furigana">ならけん</i></span>',
                  answers : [ 'A28' ]
                },
                
                {
                  question : '<span class="inline-furi">和歌山県<i class="furigana">わかやまけん</i></span>',
                  answers : [ 'A29' ]
                },
                
                {
                  question : '<span class="inline-furi">兵庫県<i class="furigana">ひょうごけん</i></span>',
                  answers : [ 'A30' ]
                }
              ];
              break;

            case 5 : // Chugoku and Shikoku Region
              range = '31-39';
              quizlet = [
                {
                  question : '<span class="inline-furi">鳥取県<i class="furigana">とっとりけん</i></span>',
                  answers : [ 'A31' ]
                },
                
                {
                  question : '<span class="inline-furi">島根県<i class="furigana">しまねけん</i></span>',
                  answers : [ 'A32' ]
                },
                
                {
                  question : '<span class="inline-furi">岡山県<i class="furigana">おかやまけん</i></span>',
                  answers : [ 'A33' ]
                },
                
                {
                  question : '<span class="inline-furi">広島県<i class="furigana">ひろしまけん</i></span>',
                  answers : [ 'A34' ]
                },
                
                {
                  question : '<span class="inline-furi">山口県<i class="furigana">やまぐちけん</i></span>',
                  answers : [ 'A35' ]
                },
                
                {
                  question : '<span class="inline-furi">香川県<i class="furigana">かがわけん</i></span>',
                  answers : [ 'A36' ]
                },
                
                {
                  question : '<span class="inline-furi">徳島県<i class="furigana">とくしまけん</i></span>',
                  answers : [ 'A37' ]
                },
                
                {
                  question : '<span class="inline-furi">愛媛県<i class="furigana">えひめけん</i></span>',
                  answers : [ 'A38' ]
                },
                
                {
                  question : '<span class="inline-furi">高知県<i class="furigana">こうちけん</i></span>',
                  answers : [ 'A39' ]
                }
              ];
              break;

            case 6 : // Kyushu Region
              range = '40-47';
              quizlet = [
                {
                  question : '<span class="inline-furi">福岡県<i class="furigana">ふくおかけん</i></span>',
                  answers : [ 'A40' ]
                },
                
                {
                  question : '<span class="inline-furi">佐賀県<i class="furigana">さがけん</i></span>',
                  answers : [ 'A41' ]
                },
                
                {
                  question : '<span class="inline-furi">長崎県<i class="furigana">ながさきけん</i></span>',
                  answers : [ 'A42' ]
                },
                
                {
                  question : '<span class="inline-furi">大分県<i class="furigana">おおいたけん</i></span>',
                  answers : [ 'A43' ]
                },
                
                {
                  question : '<span class="inline-furi">熊本県<i class="furigana">くまもとけん</i></span>',
                  answers : [ 'A44' ]
                },
                
                {
                  question : '<span class="inline-furi">宮崎県<i class="furigana">みやざきけん</i></span>',
                  answers : [ 'A45' ]
                },
                
                {
                  question : '<span class="inline-furi">鹿児島県<i class="furigana">かごしまけん</i></span>',
                  answers : [ 'A46' ]
                },
                
                {
                  question : '<span class="inline-furi">沖縄県<i class="furigana">おきなわけん</i></span>',
                  answers : [ 'A47' ]
                }
              ];
              break;

            case 7 : // Cities & Landmarks 1
              range = '48-58';
              quizlet = [
                {
                  question : '<span class="inline-furi">沖縄（琉球舞踊）<i class="furigana">おきなわ（りゅうきゅうぶよう）</i></span>',
                  answers : [ 'A48' ]
                },
                
                {
                  question : '<span class="inline-furi">桜島<i class="furigana">さくらじま</i></span>',
                  answers : [ 'A49' ]
                },
                
                {
                  question : '<span class="inline-furi">長崎（平和の像）<i class="furigana">ながさき（へいわのぞう）</i></span>',
                  answers : [ 'A50' ]
                },
                
                {
                  question : '<span class="inline-furi">伊万里（伊万里焼）<i class="furigana">いまり（いまりやき）</i></span>',
                  answers : [ 'A51' ]
                },
                
                {
                  question : '<span class="inline-furi">広島（原爆ドーム）<i class="furigana">ひろしま（げんばくドーム）</i></span>',
                  answers : [ 'A52' ]
                },
                
                {
                  question : '<span class="inline-furi">京都（東寺）<i class="furigana">きょうと（とうじ）</i></span>',
                  answers : [ 'A53' ]
                },
                
                {
                  question : '<span class="inline-furi">姫路（姫路城）<i class="furigana">ひめじ（ひめじじょう）</i></span>',
                  answers : [ 'A54' ]
                },
                
                {
                  question : '<span class="inline-furi">日本アルプス<i class="furigana">にほんアルプス</i></span>',
                  answers : [ 'A55' ]
                },
                
                {
                  question : '<span class="inline-furi">札幌（雪祭り）<i class="furigana">さっぽろ（ゆくまつり）</i></span>',
                  answers : [ 'A56' ]
                },
                
                {
                  question : '<span class="inline-furi">松島<i class="furigana">まつしま</i></span>',
                  answers : [ 'A57' ]
                },
                
                {
                  question : '<span class="inline-furi">日光（東照宮）<i class="furigana">にっこう（とうしょうぐう）</i></span>',
                  answers : [ 'A58' ]
                },
              ];
              break;

            case 8 : // Cities & Landmarks 2
              range = '59-69';
              quizlet = [
                {
                  question : '<span class="inline-furi">富士山<i class="furigana">ふじさん</i></span>',
                  answers : [ 'A59' ]
                },
                
                {
                  question : '<span class="inline-furi">白川郷<i class="furigana">しらかわごう</i></span>',
                  answers : [ 'A60' ]
                },
                
                {
                  question : '<span class="inline-furi">奈良（大仏）<i class="furigana">なら（だいぶつ）</i></span>',
                  answers : [ 'A61' ]
                },
                
                {
                  question : '<span class="inline-furi">大阪<i class="furigana">おおさか</i></span>',
                  answers : [ 'A62' ]
                },
                
                {
                  question : '<span class="inline-furi">名古屋<i class="furigana">なごや</i></span>',
                  answers : [ 'A63' ]
                },
                
                {
                  question : '<span class="inline-furi">鎌倉<i class="furigana">かまくら</i></span>',
                  answers : [ 'A64' ]
                },
                
                {
                  question : '<span class="inline-furi">横浜<i class="furigana">よこはま</i></span>',
                  answers : [ 'A65' ]
                },
                
                {
                  question : '<span class="inline-furi">東京<i class="furigana">とうきょう</i></span>',
                  answers : [ 'A66' ]
                },
                
                {
                  question : '<span class="inline-furi">金沢<i class="furigana">かなざわ</i></span>',
                  answers : [ 'A67' ]
                },
                
                {
                  question : '<span class="inline-furi">琵琶湖<i class="furigana">びわこ</i></span>',
                  answers : [ 'A68' ]
                },
                
                {
                  question : '<span class="inline-furi">神戸<i class="furigana">こうべ</i></span>',
                  answers : [ 'A69' ]
                },
              ];
              break;
              
            default :
              break;
          }


          // generate answer keys from the specified range
          range = range.split('-');
          range[0] = +range[0];
          range[1] = +range[1];
          rangeList = [];

          for (; range[0] <= range[1]; range[0]++) {
            rangeList.push(range[0]);
          }

          // randomize quiz questions and answers so they cannot be easily guessed
          while (quizlet.length) {
            i = Math.floor(Math.random() * quizlet.length);
            quizlet[i].question = 'Where is ' + quizlet[i].question + ' located on the map?';

            // add random wrong answers to the question
            j = 3;
            answers = rangeList.slice();
            answers.splice(answers.indexOf(+quizlet[i].answers[0].replace('A', '')), 1);

            while (j --> 0) {
              n = Math.floor(Math.random() * answers.length);
              quizlet[i].answers.push(answers[n]);
              answers.splice(n, 1);
            }

            // add randomized answer to the randomQuizlet
            randomQuizlet.push(quizlet[i]);
            quizlet.splice(i, 1);
          }
          
          // update quiz title
          title.innerHTML = title.innerHTML.replace(/- .*/, '- ' + name);

          // hide map and launch exercise
          Genki.appendix.showExercise();
          Genki.generateQuiz({
            type : 'multi',
            info : 'Look at the map and answer the questions about each location.',

            quizlet : randomQuizlet
          });
        }
      });
    },
    
    
    // study the numbers or conjugation charts
    studyChart : function (chart) {
      var chartName = Genki.active.exercise[1];
      
      GenkiModal.open({
        title : 'Study ' + chartName + '?',
        content : 'Are you ready to study the ' + chartName + '?',

        callback : function () {
          var quizlet, info;

          switch (chart) {
            // numbers chart
            case 'numbers' :
              info = 'Fill in the following chart with the correct numbers and sound changes.';
              quizlet = Genki.appendix.numbers_chart;
              break;

            // conjugation chart
            case 'conjugation' :
              info = 'Conjugate all the verbs into the correct forms. If you haven\'t learned a specific form yet, only focus on the ones that you have learned and then check your answers.';
              quizlet = Genki.appendix.conjugation_chart;
              break;
              
            default :
              break;
          }
          
          // update title and launch exercise
          document.getElementById('exercise-title').insertAdjacentHTML('beforeend', ' Quiz');
          Genki.appendix.showExercise();
          Genki.generateQuiz({
            type : 'fill',
            info : info,

            quizlet : quizlet
          });
        }
      });
    },
    
    
    // hides the appendix page and shows the exercise
    showExercise : function () {
      document.getElementById('appendix-tool').style.display = 'none';
      document.getElementById('exercise').style.display = '';
    },
    
    
    // shows page after setup
    finishedLoading : function () {
      var loading = document.querySelector('.loading');
      loading.className = loading.className.replace('loading', '');
    }
  };
  
  // clone more exercises and add it to the appendix pages
  document.getElementById('appendix-tool').appendChild(document.querySelector('.more-exercises').cloneNode(true));
}(window, document));
