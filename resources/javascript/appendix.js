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
            checked = window.localStorage && localStorage.selectedDefinitions ? localStorage.selectedDefinitions.split(',') : [],
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
                '<span class="genki_pseudo_checkbox" onclick="this.previousSibling.click(); return false;"></span>'+
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
        AddJumpArrowsTo('.dictionary-group .section-title', 'dictionary-top', 'Return to the top of the dictionary');
        
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
        if (!init && window.localStorage) {
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
        if (!selectAll && window.localStorage) {
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
        if (window.localStorage) {
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
              toggles[i].innerHTML = toggles[i].innerHTML.replace('Show', 'Hide');
            }
            
            caller.innerHTML = caller.innerHTML.replace('Show', 'Hide');
          } 
          
          // hide definitions
          else {
            for (; i < j; i++) {
              if (!/hidden/.test(list[i].className)) list[i].className += ' hidden';
              if (!/hidden/.test(buttons[i].className)) buttons[i].className += ' hidden';
              toggles[i].innerHTML = toggles[i].innerHTML.replace('Hide', 'Show');
            }
            
            caller.innerHTML = caller.innerHTML.replace('Hide', 'Show');
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
            caller.innerHTML = caller.innerHTML.replace('Show', 'Hide')
          }

          // hide definitions
          else {
            list.className += ' hidden';
            buttons.className += ' hidden';
            caller.innerHTML = caller.innerHTML.replace('Hide', 'Show')
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
              results.innerHTML = value ? '<li>No results found for "' + value + '".</li>' : '';
            }

            hitsCounter.innerHTML = hits ? '(' + hits + ') ' : '';
          }
          
          delete Genki.appendix.jisho.searchTimeout;
        }, 300);
      },
      
      
      // launches an exercise based on a selected list of words
      launchExercise : function () {
        var j = Genki.appendix.jisho.selected.length;
        
        // verify selected before launching the exercise
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
          if (window.localStorage) {
            localStorage.selectedDefinitions = Genki.appendix.jisho.selected;
          }
          
          // update with new length
          j = Genki.appendix.jisho.selected.length;
        }
        
        // initiate an exercise once 5 or more words have been selected
        if (j < 5) {
          GenkiModal.open({
            title : 'Please select more words.',
            content : 'Please select <b>' + (5 - j) + '</b> more word' + (5 - j == 1 ? '' : 's') + ' to begin a practice exercise.'
          });
          
        } else {
          GenkiModal.open({
            title : 'Begin Practice?',
            content : 'Are you ready to practice your selected words? Please select the type of exercise you would like to practice with below.<br><br>'+
            '<div class="center">'+
              '<select id="dict-exercise-type">'+
                '<option value="multi"' + ( window.localStorage && localStorage.genkiJishoExercise == 'multi' ? ' selected' : '') + '>Multiple Choice</option>'+
                '<option value="drag"' + ( window.localStorage && localStorage.genkiJishoExercise == 'drag' ? ' selected' : '') + '>Drag and Drop</option>'+
                '<option value="writing"' + ( window.localStorage && localStorage.genkiJishoExercise == 'writing' ? ' selected' : '') + '>Spelling Practice</option>'+
                '<option value="fill"' + ( window.localStorage && localStorage.genkiJishoExercise == 'fill' ? ' selected' : '') + '>Write the Definition</option>'+
              '</select>'+
            '</div>',

            callback : function () {
              var type = document.getElementById('dict-exercise-type').value,
                  sel = Genki.appendix.jisho.selected,
                  i = 0,
                  n,
                  k,
                  answers,
                  answer,
                  currentAnswer,
                  def,
                  furi,
                  quizlet;
              
              // store selection
              if (window.localStorage) {
                localStorage.genkiJishoExercise = type;
              }
              
              // show exercise
              Genki.appendix.showExercise();

              // drag and drop
              if (type == 'drag') {
                for (quizlet = {}; i < j; i++) {
                  def = document.querySelector('#japanese-english [data-def="' + sel[i] + '"]');
                  furi = def.querySelector('.def-furi i');

                  quizlet[def.querySelector('.def-ja').innerHTML.replace(/<i>.*?<\/i>/, '') + (furi ? '|' + furi.innerHTML : '')] = def.querySelector('.def-en').innerHTML;
                }

                Genki.generateQuiz({
                  type : type,
                  info : Genki.lang.std_drag,

                  quizlet : quizlet
                });
              }

              // multiple choice
              else if (type == 'multi') {
                for (quizlet = []; i < j; i++) {
                  def = document.querySelector('#japanese-english [data-def="' + sel[i] + '"]');
                  furi = def.querySelector('.def-furi i');
                  currentAnswer = def.querySelector('.def-en').innerHTML;
                  
                  quizlet[i] = {
                    question : def.querySelector('.def-ja').innerHTML.replace(/<i>.*?<\/i>/, '') + (furi ? '<div class="furigana">' + furi.innerHTML + '</div>' : ''),
                    answers : ['A' + currentAnswer]
                  }
                  
                  // randomly assign answers
                  answers = sel.slice();
                  answers.splice(i, 1);
                  k = 3;
                  
                  while (k --> 0) {
                    if (answers.length) {
                      n = Math.floor(Math.random() * answers.length);
                      answer = document.querySelector('#japanese-english [data-def="' + answers[n] + '"] .def-en').innerHTML;
                      
                      // prevent identical answers from showing
                      if (answer == currentAnswer) {
                        k++; // increment to try another
                      }
                      // otherwise add a new answer if it's not identical
                      else {
                        quizlet[i].answers.push(answer.charAt(0) == 'A' ? '!' + answer : answer);
                      }
                      
                      answers.splice(n, 1);
                    } else {
                      break; // break out if there's no more answers to prevent errors
                    }
                  }
                }
                
                Genki.generateQuiz({
                  type : type,
                  info : 'Choose the correct definition for each word.',

                  quizlet : quizlet
                });
              }

              // spelling practice
              else if (type == 'writing') {
                for (quizlet = {}; i < j; i++) {
                  def = document.querySelector('#japanese-english [data-def="' + sel[i] + '"]');
                  furi = def.querySelector('.def-furi i');

                  quizlet[def.querySelector('.def-ja').innerHTML.replace(/\((.*?)\/.*?\)/, '$1').replace(/<i>.*?<\/i>|\(.*?\)|（.*?）|～|~/g, '')] = (furi ? furi.innerHTML : '');
                }
                
                Genki.generateQuiz({
                  type : type,
                  info : 'Practice spelling the following words.',

                  columns : 6,
                  quizlet : quizlet
                });
              }

              // write the definition
              else if (type == 'fill') {
                for (quizlet = '<div class="count-problems columns-2 clear"><div>', n = Math.ceil(j/2); i < j; i++) {
                  def = document.querySelector('#japanese-english [data-def="' + sel[i] + '"]');
                  furi = def.querySelector('.def-furi i');
                  
                  quizlet += 
                  (i == n ? '</div><div>' : '')+ // changes columns
                  '<div class="problem">'+
                    def.querySelector('.def-en').innerHTML + '<br>'+
                    ('{' + def.querySelector('.def-ja').innerHTML.replace(/<i>.*?<\/i>/, '') + (furi ? '|' + furi.innerHTML + '|answer' : '') + '}').replace(/\((.*?)\)/g, function (Match, $1) {
                      return '%(' + $1 + (/\//.test($1) ? '' : '/') + ')';
                    }).replace(/（(.*?)）/g, '%($1/)').replace(/(～|~)/g, '%($1/)')+
                  '</div>'; 
                }
                
                Genki.generateQuiz({
                  type : type,
                  info : 'Write the Japanese definition for the following words.',

                  quizlet : quizlet + '</div></div>'
                });
              }

            }
          });
        }
      },
      
      
      // resets exercise state and returns to the dictionary
      reset : function () {
        // reset stats
        Genki.exerciseComplete = false;
        Genki.stats = {
          problems : 0,
            solved : 0,
          mistakes : 0,
             score : 0,
           exclude : 0
        };
        
        
        // hide exercise and reset contents
        var exercise = document.getElementById('exercise');
        exercise.style.display = 'none';
        exercise.className = 'content-block';
        exercise.innerHTML = document.getElementById('exercise-title').outerHTML + '<div id="quiz-result"></div><div id="quiz-zone" class="clear"></div><div id="quiz-timer" class="center"></div>' + document.querySelector('.more-exercises').outerHTML;
        
        // show dictionary
        document.getElementById('appendix-tool').style.display = '';
        Genki.scrollTo('#pratice-words');
        Genki.appendix.jisho.launchExercise();
      },
      
      
      // restores preferences for the dictionary
      restoreSettings : function () {
        if (window.localStorage) {
          
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
            '<option value="1"' + ( window.localStorage && localStorage.genkiSelectedMap == '1' ? ' selected' : '') + '>Hokkaido and Tohoku Region (1-8)</option>'+
            '<option value="2"' + ( window.localStorage && localStorage.genkiSelectedMap == '2' ? ' selected' : '') + '>Kanto Region (9-15)</option>'+
            '<option value="3"' + ( window.localStorage && localStorage.genkiSelectedMap == '3' ? ' selected' : '') + '>Chubu Region (16-23)</option>'+
            '<option value="4"' + ( window.localStorage && localStorage.genkiSelectedMap == '4' ? ' selected' : '') + '>Kinki Region (24-30)</option>'+
            '<option value="5"' + ( window.localStorage && localStorage.genkiSelectedMap == '5' ? ' selected' : '') + '>Chugoku and Shikoku Region (31-39)</option>'+
            '<option value="6"' + ( window.localStorage && localStorage.genkiSelectedMap == '6' ? ' selected' : '') + '>Kyushu Region (40-47)</option>'+
            '<option value="7"' + ( window.localStorage && localStorage.genkiSelectedMap == '7' ? ' selected' : '') + '>Cities and Landmarks 1 (48-58)</option>'+
            '<option value="8"' + ( window.localStorage && localStorage.genkiSelectedMap == '8' ? ' selected' : '') + '>Cities and Landmarks 2 (59-69)</option>'+
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
          if (window.localStorage) {
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
              quizlet = 
              '<h3 class="sub-title">Part 1</h3>'+
              '<table class="table large-width center">'+
                '<tr>'+
                  '<td style="width:25px"></td>'+
                  '<td style="width:75px">regular</td>'+
                  '<td style="width:75px"></td>'+
                  '<td style="width:75px"></td>'+
                  '<td style="width:75px"></td>'+
                  '<td style="width:75px">h <i class="fa">&#xf061;</i> p</td>'+
                  '<td style="width:75px">h <i class="fa">&#xf061;</i> p/b</td>'+
                  '<td style="width:75px">p</td>'+
                  '<td style="width:75px">k</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>1</td>'+
                  '<td>{いち}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{いっｐ|いっp|answer}</td>'+
                  '<td>{いっｐ|いっp|answer}</td>'+
                  '<td>{（いっ）|(いっ)|answer}</td>'+
                  '<td>{いっ}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>2</td>'+
                  '<td>{に}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>3</td>'+
                  '<td>{さん}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{ｐ|p|answer}</td>'+
                  '<td>{ｂ|b|answer}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>4</td>'+
                  '<td>{よん}</td>'+
                  '<td>{し}</td>'+
                  '<td>{よ}</td>'+
                  '<td>{よ}</td>'+
                  '<td>{ｐ|p|answer}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>5</td>'+
                  '<td>{ご}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>6</td>'+
                  '<td>{ろく}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{ろっｐ|ろっp|answer}</td>'+
                  '<td>{ろっｐ|ろっp|answer}</td>'+
                  '<td>{（ろっ）|(ろっ)|answer}</td>'+
                  '<td>{ろっ}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>7</td>'+
                  '<td>{なな}</td>'+
                  '<td>{しち}</td>'+
                  '<td>{しち}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>8</td>'+
                  '<td>{はち}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{（はっ%(ｐ/p)）|(はっ%(ｐ/p))|answer}</td>'+
                  '<td>{はっｐ|はっp|answer}</td>'+
                  '<td>{（はっ）|(はっ)|answer}</td>'+
                  '<td>{はっ}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>9</td>'+
                  '<td>{きゅう}</td>'+
                  '<td>{く}</td>'+
                  '<td>{く}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>10</td>'+
                  '<td>{じゅう}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{じゅっ%(ｐ/p)|じっ%(ｐ/p)|answer}</td>'+
                  '<td>{じゅっ%(ｐ/p)|じっ%(ｐ/p)|answer}</td>'+
                  '<td>{じゅっ|じっ|answer}</td>'+
                  '<td>{じゅっ|じっ|answer}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>how many</td>'+
                  '<td>{なん}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{ｐ|p|answer}</td>'+
                  '<td>{ｂ|b|answer}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr class="example-row">'+
                  '<td></td>'+
                  '<td>'+
                    '<div>～ドル<br><i>dollars</i></div>'+
                    '<div><span class="inline-furi">～円<i>～えん</i></span><br><i>yen</i></div>'+
                    '<div><span class="inline-furi">～枚<i>～まい</i></span><br><i>sheets</i></div>'+
                    '<div><span class="inline-furi">～度<i>～ど</i></span><br><i>degrees</i></div>'+
                    '<div><span class="inline-furi">～十<i>～じゅう</i></span><br><i>ten</i></div>'+
                    '<div><span class="inline-furi">～万<i>～まん</i></span><br><i>ten thousand</i></div>'+
                  '</td>'+

                  '<td>'+
                    '<div><span class="inline-furi">～月<i>～がつ</i></span><br><i>month</i></div>'+
                  '</td>'+

                  '<td>'+
                    '<div><span class="inline-furi">～時<i>～じ</i></span><br><i>o\'clock</i></div>'+
                    '<div><span class="inline-furi">～時間<i>～じかん</i></span><br><i>hours</i></div>'+
                  '</td>'+

                  '<td>'+
                    '<div><span class="inline-furi">～年<i>～ねん</i></span><br><i>year</i></div>'+
                    '<div><span class="inline-furi">～年間<i>～ねんかん</i></span><br><i>years</i></div>'+
                    '<div><span class="inline-furi">～人<i>～にん</i></span><br><i>people</i></div>'+
                  '</td>'+

                  '<td>'+
                    '<div><span class="inline-furi">～分<i>～ふん</i></span><br><i>minute</i></div>'+
                    '<div><span class="inline-furi">～分間<i>～ふんかん</i></span><br><i>minutes</i></div>'+
                  '</td>'+

                  '<td>'+
                    '<div><span class="inline-furi">～本<i>～ほん</i></span><br><i>sticks</i></div>'+
                    '<div><span class="inline-furi">～杯<i>～はい</i></span><br><i>cups</i></div>'+
                    '<div><span class="inline-furi">～匹<i>～ひき</i></span><br><i>animals</i></div>'+
                    '<div><span class="inline-furi">～百<i>～ひゃく</i></span><br><i>hundred</i></div>'+
                  '</td>'+

                  '<td>'+
                    '<div>～ページ<br><i>page</i></div>'+
                    '<div>～ポンド<br><i>pounds</i></div>'+
                  '</td>'+

                  '<td>'+
                    '<div><span class="inline-furi">～か月<i>～かげつ</i></span><br><i>months</i></div>'+
                    '<div><span class="inline-furi">～課<i>～か</i></span><br><i>lesson</i></div>'+
                    '<div><span class="inline-furi">～回<i>～かい</i></span><br><i>times</i></div>'+
                    '<div><span class="inline-furi">～個<i>～こ</i></span><br><i>small items</i></div>'+
                  '</td>'+
                '</tr>'+
              '</table><br>'+

              '<h3 class="sub-title">Part 2</h3>'+
              '<table class="table large-width center">'+
                '<tr>'+
                  '<td style="width:51px"></td>'+
                  '<td style="width:100px">k <i class="fa">&#xf061;</i> g</td>'+
                  '<td style="width:100px">s</td>'+
                  '<td style="width:100px">s <i class="fa">&#xf061;</i> z</td>'+
                  '<td style="width:100px">t</td>'+
                  '<td colspan="3">special vocabulary for numbers</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>1</td>'+
                  '<td>{いっ}</td>'+
                  '<td>{いっ}</td>'+
                  '<td>{いっ}</td>'+
                  '<td>{いっ}</td>'+
                  '<td style="width:100px">{ひとつ}</td>'+
                  '<td style="width:100px">{ついたち}</td>'+
                  '<td style="width:100px">{ひとり}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>2</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{ふたつ}</td>'+
                  '<td>{ふつか}</td>'+
                  '<td>{ふたり}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>3</td>'+
                  '<td>{ｇ|g|answer}</td>'+
                  '<td></td>'+
                  '<td>{ｚ|z|answer}</td>'+
                  '<td></td>'+
                  '<td>{みっつ}</td>'+
                  '<td>{みっか}</td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>4</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{よっつ}</td>'+
                  '<td>{よっか}</td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>5</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{いつつ}</td>'+
                  '<td>{いつか}</td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>6</td>'+
                  '<td>{ろっ}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{むっつ}</td>'+
                  '<td>{むいか}</td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>7</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{ななつ}</td>'+
                  '<td>{なのか}</td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>8</td>'+
                  '<td>{はっ}</td>'+
                  '<td>{はっ}</td>'+
                  '<td>{はっ}</td>'+
                  '<td>{はっ}</td>'+
                  '<td>{やっつ}</td>'+
                  '<td>{ようか}</td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>9</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{ここのつ}</td>'+
                  '<td>{ここのか}</td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>10</td>'+
                  '<td>{じゅっ|じっ|answer}</td>'+
                  '<td>{じゅっ|じっ|answer}</td>'+
                  '<td>{じゅっ|じっ|answer}</td>'+
                  '<td>{じゅっ|じっ|answer}</td>'+
                  '<td>{とお}</td>'+
                  '<td>{とおか}</td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>how many</td>'+
                  '<td>{ｇ|g|answer}</td>'+
                  '<td></td>'+
                  '<td>{ｚ|z|answer}</td>'+
                  '<td></td>'+
                  '<td>{いくつ}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr class="example-row">'+
                  '<td></td>'+
                  '<td>'+
                   '<div><span class="inline-furi">～階<i>～かい</i></span><br><i>floor</i></div>'+
                   '<div><span class="inline-furi">～軒<i>～けん</i></span><br><i>houses</i></div>'+
                  '</td>'+

                  '<td>'+
                   '<div>～セント<br><i>cents</i></div>'+
                   '<div><span class="inline-furi">～週間<i>～しゅうかん</i></span><br><i>weeks</i></div>'+
                   '<div><span class="inline-furi">～冊<i>～さつ</i></span><br><i>books</i></div>'+
                   '<div><span class="inline-furi">～歳<i>～さい</i></span><br><i>years of age</i></div>'+
                  '</td>'+

                  '<td>'+
                   '<div><span class="inline-furi">～足<i>～そく</i></span><br><i>shoes</i></div>'+
                   '<div><span class="inline-furi">～千<i>～せん</i></span><br><i>thousand</i></div>'+
                  '</td>'+

                  '<td>'+
                   '<div><span class="inline-furi">～通<i>～つう</i></span><br><i>letters</i></div>'+
                   '<div><span class="inline-furi">～丁目<i>～ちょうめ</i></span><br><i>street address</i></div>'+
                  '</td>'+

                  '<td>'+
                   '<div><i>small items</i><br><i>years of age</i></div>'+
                   '<div>cf. はたち<br>(20 years old)</div>'+
                  '</td>'+

                  '<td>'+
                   '<div><i>date</i></div>'+
                   '<div>cf. じゅうよっか<br>(14)<br>はつか<br>(20)<br>にじゅうよっか<br>(24)<br>なんにち<br>(how many)</div>'+
                  '</td>'+

                  '<td>'+
                   '<div><i>people</i></div>'+
                   '<div>cf. <span class="inline-furi">～人<i>～にん</i></span><br>(three or more people)</div>'+
                  '</td>'+
                '</tr>'+
              '</table>';
              break;

            // conjugation chart
            case 'conjugation' :
              info = 'Conjugate all the verbs into the correct forms. If you haven\'t learned a specific form yet, only focus on the ones that you have learned and then check your answers.';
              quizlet = 
              '<h3 class="sub-title">Genki I</h3>'+
              '<table class="table large-width center">'+
                '<tr>'+
                  '<td style="width:25px">verb types</td>'+
                  '<td style="width:25px">dictionary forms</td>'+
                  '<td style="width:134px">long forms</td>'+
                  '<td style="width:134px">te-forms</td>'+
                  '<td style="width:134px">short past</td>'+
                  '<td style="width:134px">short present neg.</td>'+
                  '<td style="width:134px">short past neg.</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>irr</td>'+
                  '<td><u>する</u></td>'+
                  '<td>{します}</td>'+
                  '<td>{して}</td>'+
                  '<td>{した}</td>'+
                  '<td>{しない}</td>'+
                  '<td>{しなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>irr</td>'+
                  '<td><u>くる</u></td>'+
                  '<td>{きます}</td>'+
                  '<td>{きて}</td>'+
                  '<td>{きた}</td>'+
                  '<td>{こない}</td>'+
                  '<td>{こなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>ru</td>'+
                  '<td>たべ<u>る</u></td>'+
                  '<td>{たべます}</td>'+
                  '<td>{たべて}</td>'+
                  '<td>{たべた}</td>'+
                  '<td>{たべない}</td>'+
                  '<td>{たべなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>か<u>う</u></td>'+
                  '<td>{かいます}</td>'+
                  '<td>{かって}</td>'+
                  '<td>{かった}</td>'+
                  '<td>{かわない}</td>'+
                  '<td>{かわなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>ま<u>つ</u></td>'+
                  '<td>{まちます}</td>'+
                  '<td>{まって}</td>'+
                  '<td>{まった}</td>'+
                  '<td>{またない}</td>'+
                  '<td>{またなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>と<u>る</u></td>'+
                  '<td>{とります}</td>'+
                  '<td>{とって}</td>'+
                  '<td>{とった}</td>'+
                  '<td>{とらない}</td>'+
                  '<td>{とらなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>あ<u>る</u></td>'+
                  '<td>{あります}</td>'+
                  '<td>{あって}</td>'+
                  '<td>{あった}</td>'+
                  '<td>{ない}</td>'+
                  '<td>{なかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>よ<u>む</u></td>'+
                  '<td>{よみます}</td>'+
                  '<td>{よんで}</td>'+
                  '<td>{よんだ}</td>'+
                  '<td>{よまない}</td>'+
                  '<td>{よまなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>あそ<u>ぶ</u></td>'+
                  '<td>{あそびます}</td>'+
                  '<td>{あそんで}</td>'+
                  '<td>{あそんだ}</td>'+
                  '<td>{あそばない}</td>'+
                  '<td>{あそばなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>し<u>ぬ</u></td>'+
                  '<td>{しにます}</td>'+
                  '<td>{しんで}</td>'+
                  '<td>{しんだ}</td>'+
                  '<td>{しなない}</td>'+
                  '<td>{しななかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>か<u>く</u></td>'+
                  '<td>{かきます}</td>'+
                  '<td>{かいて}</td>'+
                  '<td>{かいた}</td>'+
                  '<td>{かかない}</td>'+
                  '<td>{かかなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>い<u>く</u></td>'+
                  '<td>{いきます}</td>'+
                  '<td>{いって}</td>'+
                  '<td>{いった}</td>'+
                  '<td>{いかない}</td>'+
                  '<td>{いかなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>いそ<u>ぐ</u></td>'+
                  '<td>{いそぎます}</td>'+
                  '<td>{いそいで}</td>'+
                  '<td>{いそいだ}</td>'+
                  '<td>{いそがない}</td>'+
                  '<td>{いそがなかった}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>はな<u>す</u></td>'+
                  '<td>{はなします}</td>'+
                  '<td>{はなして}</td>'+
                  '<td>{はなした}</td>'+
                  '<td>{はなさない}</td>'+
                  '<td>{はなさなかった}</td>'+
                '</tr>'+
              '</table><br>'+

              '<h3 class="sub-title">Genki II</h3>'+
              '<table class="table large-width center">'+
                '<tr>'+
                  '<td style="width:25px">verb types</td>'+
                  '<td style="width:25px">dictionary forms</td>'+
                  '<td style="width:110px">potential</td>'+
                  '<td style="width:110px">volitional</td>'+
                  '<td style="width:110px">ば-forms</td>'+
                  '<td style="width:110px">passive</td>'+
                  '<td style="width:110px">causative</td>'+
                  '<td style="width:110px">causative-passive</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>irr</td>'+
                  '<td><u>する</u></td>'+
                  '<td>{できる}</td>'+
                  '<td>{しよう}</td>'+
                  '<td>{すれば}</td>'+
                  '<td>{される}</td>'+
                  '<td>{させる}</td>'+
                  '<td>{させられる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>irr</td>'+
                  '<td><u>くる</u></td>'+
                  '<td>{こられる}</td>'+
                  '<td>{こよう}</td>'+
                  '<td>{くれば}</td>'+
                  '<td>{こられる}</td>'+
                  '<td>{こさせる}</td>'+
                  '<td>{こさせられる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>ru</td>'+
                  '<td>たべ<u>る</u></td>'+
                  '<td>{たべられる}</td>'+
                  '<td>{たべよう}</td>'+
                  '<td>{たべれば}</td>'+
                  '<td>{たべられる}</td>'+
                  '<td>{たべさせる}</td>'+
                  '<td>{たべさせられる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>か<u>う</u></td>'+
                  '<td>{かえる}</td>'+
                  '<td>{かおう}</td>'+
                  '<td>{かえば}</td>'+
                  '<td>{かわれる}</td>'+
                  '<td>{かわせる}</td>'+
                  '<td>{かわされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>ま<u>つ</u></td>'+
                  '<td>{まてる}</td>'+
                  '<td>{まとう}</td>'+
                  '<td>{まてば}</td>'+
                  '<td>{またれる}</td>'+
                  '<td>{またせる}</td>'+
                  '<td>{またされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>と<u>る</u></td>'+
                  '<td>{とれる}</td>'+
                  '<td>{とろう}</td>'+
                  '<td>{とれば}</td>'+
                  '<td>{とられる}</td>'+
                  '<td>{とらせる}</td>'+
                  '<td>{とらされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>あ<u>る</u></td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td>{あれば}</td>'+
                  '<td></td>'+
                  '<td></td>'+
                  '<td></td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>よ<u>む</u></td>'+
                  '<td>{よめる}</td>'+
                  '<td>{よもう}</td>'+
                  '<td>{よめば}</td>'+
                  '<td>{よまれる}</td>'+
                  '<td>{よませる}</td>'+
                  '<td>{よまされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>あそ<u>ぶ</u></td>'+
                  '<td>{あそべる}</td>'+
                  '<td>{あそぼう}</td>'+
                  '<td>{あそべば}</td>'+
                  '<td>{あそばれる}</td>'+
                  '<td>{あそばせる}</td>'+
                  '<td>{あそばされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>し<u>ぬ</u></td>'+
                  '<td>{しねる}</td>'+
                  '<td>{しのう}</td>'+
                  '<td>{しねば}</td>'+
                  '<td>{しなれる}</td>'+
                  '<td>{しなせる}</td>'+
                  '<td>{しなされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>か<u>く</u></td>'+
                  '<td>{かける}</td>'+
                  '<td>{かこう}</td>'+
                  '<td>{かけば}</td>'+
                  '<td>{かかれる}</td>'+
                  '<td>{かかせる}</td>'+
                  '<td>{かかされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>い<u>く</u></td>'+
                  '<td>{いける}</td>'+
                  '<td>{いこう}</td>'+
                  '<td>{いけば}</td>'+
                  '<td>{いかれる}</td>'+
                  '<td>{いかせる}</td>'+
                  '<td>{いかされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>いそ<u>ぐ</u></td>'+
                  '<td>{いそげる}</td>'+
                  '<td>{いそごう}</td>'+
                  '<td>{いそげば}</td>'+
                  '<td>{いそがれる}</td>'+
                  '<td>{いそがせる}</td>'+
                  '<td>{いそがされる}</td>'+
                '</tr>'+

                '<tr>'+
                  '<td>u</td>'+
                  '<td>はな<u>す</u></td>'+
                  '<td>{はなせる}</td>'+
                  '<td>{はなそう}</td>'+
                  '<td>{はなせば}</td>'+
                  '<td>{はなされる}</td>'+
                  '<td>{はなさせる}</td>'+
                  '<td>{はなさせられる}</td>'+
                '</tr>'+
              '</table>';
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
