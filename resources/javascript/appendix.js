// appendix tools
(function (window, document) {
  'use strict';
  
  Genki.appendix = {

    // dictionary functions
    jisho : {
      mode : 'ja',
      selected : [],
      
      
      // Initial setup of the dictionary by adding checkboxes, filling out the English-Japanese dictionary, and more..
      init : function () {
        var def = document.querySelectorAll('.definition'),
            i = 0,
            j = def.length,
            checked = window.localStorage && localStorage.selectedDefinitions ? localStorage.selectedDefinitions.split(',') : [],
            sorted = [],
            defList = {},
            n = 0,
            cleaned, en;
        
        // setup checkboxes and sort english definitions
        for (; i < j; i++) {
          en = def[i].querySelector('.def-en'); // english definition used as a key
          
          if (/.*?-\d+/.test(def[i].dataset.def) && en.innerHTML) {
            // add checkbox to definition
            def[i].insertAdjacentHTML('afterbegin', '<input class="def-selector genki_input_hidden" type="checkbox" onchange="Genki.appendix.jisho.updateCheckboxes(this, \'' + def[i].dataset.def + '\');"' + (checked.indexOf(def[i].dataset.def) != -1 ? 'checked' : '') + '><span class="genki_pseudo_checkbox" onclick="this.previousSibling.click(); return false;"/>');
            
            // compile english definitions
            // cleans the english string and converts it to lowercase so words can be sorted more accurately
            cleaned = en.innerHTML.replace(/^\(.*?\) |^to |^the |^it |^\.\.\.(?:,|)/gi, '').toLowerCase();
            
            if (defList[cleaned]) { // if a key already exist, add the key with a random id
              cleaned = cleaned + '-' + ++n;
            }
            
            defList[cleaned] = def[i].cloneNode(true);
            sorted.push(cleaned);
          } 
          
          // otherwise the definition is placeholder
          else {
            def[i].innerHTML = '<em>Coming soon...</em>';
          }
        }
        
        // sort english definitions
        sorted = sorted.sort();
        
        // add english definitions to the English-Japanese dictionary
        for (i = 0, j = sorted.length; i < j; i++) {
          // move the english definition to the front
          en = defList[sorted[i]].innerHTML.match(/<span class="def-en">(.*?)<\/span>/);
          
          if (en[0]) { // only move definition if there's a match
            
            /* Debating on keeping this
            // special string formatting for the english dictionary
            if (/^the /.test(en[1])) {
              // add "the" to the end; "the day after tomorrow" --> "day after tomorrow, the"
              en[0] = en[0].replace(en[1], function (Match) {
                return Match.replace('the ', '') + ', the';
              });
            }*/
            
            // build the english definition
            defList[sorted[i]].innerHTML = defList[sorted[i]].innerHTML.replace(/<span class="def-en">.*?<\/span>/, '').replace(/(<input.*?<\/span>)/, '$1' + en[0] + ' ');
            document.getElementById('list-' + sorted[i].charAt(0).toUpperCase()).appendChild(defList[sorted[i]]);
          }
        }
        
        // restore preferences
        Genki.appendix.jisho.restoreSettings();
        
        // add jump arrows
        AddJumpArrowsTo('.dictionary-group .section-title', 'dictionary-top', 'Return to the top of the dictionary');
        
        // finally show the dictionary
        Genki.appendix.finishedLoading();
      },
      
      
      // switches dictionary mode
      // ja = japanese-english
      // en = english-japanese
      switchMode : function (mode) {
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
          ja.dict.style.display = '';
          en.dict.style.display = 'none';
        } 

        // english-japanese mode
        else if (mode == 'en' && Genki.appendix.jisho.mode != 'en') {
          // update active button
          en.button.className += ' active-mode';
          ja.button.className = ja.button.className.replace(' active-mode', '');

          // show the active dictionary
          en.dict.style.display = '';
          ja.dict.style.display = 'none';
        }

        // save preferences
        if (window.localStorage) {
          Genki.appendix.jisho.mode = mode;
          localStorage.genkiJishoMode = mode;
        }
      },
      
      
      // updates localStorage and checkbox mirrors
      updateCheckboxes : function (caller, id, selectAll) {
        var box = document.querySelectorAll('[data-def="' + id + '"] .def-selector'),
            index = Genki.appendix.jisho.selected.indexOf(id),
            i = 0, j = box.length;

        if (caller.checked) {
          for (; i < j; i++) {
            if (caller != box[i]) {
              box[i].checked = true;
            }
          }

          // add definition to array
          if (index == -1) {
            Genki.appendix.jisho.selected.push(id);
          }

        } else if (!caller.checked) {
          for (; i < j; i++) {
            if (caller != box[i]) {
              box[i].checked = false;
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
      selectAll : function (state, target, custom) {
        var a = document.querySelectorAll(custom ? target :
          (Genki.appendix.jisho.mode == 'ja' ? '#japanese-english' : '#english-japanese') +
          (target ? ' #' + target : '') +
          ' .def-selector'
        ), i = 0, j = a.length;
        
        // update all checkboxes
        for (; i < j; i++) {
          a[i].checked = state;
          Genki.appendix.jisho.updateCheckboxes(a[i], a[i].parentNode.dataset.def, true);
        }
        
        // save selected
        if (window.localStorage) {
          localStorage.selectedDefinitions = Genki.appendix.jisho.selected;
        }
      },
      
      
      // quick search
      search : function (value, mode) {
        var frag = document.createDocumentFragment(),
            results = document.getElementById('dict-search-results-' + mode),
            hitsCounter = document.getElementById('dict-search-hits-' + mode),
            def = document.querySelectorAll((mode == 'ja' ? '#japanese-english' : '#english-japanese') + ' .dictionary-group .definition'),
            defLen = def.length,
            hits = 0,
            i = 0;
        
        // clear prior searches
        results.innerHTML = '';
        
        // loop over the dictionary  if a value is present
        if (value) {
          for (; i < defLen; i++) {
            if (/.*?-\d+/.test(def[i].dataset.def) && def[i].innerText.toLowerCase().indexOf(value.toLowerCase()) != -1) {
              frag.appendChild(def[i].cloneNode(true)); // clone the match for displaying in the results node
              hits++; // increment hits
            }
          }
        }
        
        // append the matched exercises or display an error message/hide the search results
        if (frag.childNodes.length) {
          results.parentNode.querySelector('.group-selectors').style.visibility = '';
          results.appendChild(frag);

        } else {
          results.parentNode.querySelector('.group-selectors').style.visibility = 'hidden';
          results.innerHTML = value ? '<li>No results found for "' + value + '".</li>' : '';
        }

        hitsCounter.innerHTML = hits ? '(' + hits + ') ' : '';
      },
      
      
      // launches an exercise based on a selected list of words
      launchExercise : function () {
        var j = Genki.appendix.jisho.selected.length;
        
        // initiate an exercise once 5 or more words have been selected
        if (j < 5) {
          GenkiModal.open({
            title : 'Please select more words.',
            content : 'Please select <b>' + (5 - j) + '</b> more word' + (5 - j == 1 ? '' : 's') + ' to begin a practice exercise.'
          });
          
        } else {
          GenkiModal.open({
            title : 'Begin Practice?',
            content : 'Are you ready to practice your selected words? Please select the type of exercise you would like to practice with below.'+
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
              
              // hide dictionary and show exercise
              document.getElementById('appendix-tool').style.display = 'none';
              document.getElementById('exercise').style.display = '';

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

                  quizlet[def.querySelector('.def-ja').innerHTML.replace(/<i>.*?<\/i>/, '')] = (furi ? furi.innerHTML : '');
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
                    ('{' + def.querySelector('.def-ja').innerHTML.replace(/<i>.*?<\/i>/, '') + (furi ? '|' + furi.innerHTML + '|answer' : '') + '}').replace(/（(.*?)）/g, '%($1/)')+
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
      
      
      // restores preferences for the dictionary
      restoreSettings : function () {
        if (window.localStorage) {
          
          // dictionary mode pref.
          if (localStorage.genkiJishoMode && localStorage.genkiJishoMode != 'ja') {
            Genki.appendix.jisho.switchMode(localStorage.genkiJishoMode);
          }
          
          // restore selected definitions
          if (localStorage.selectedDefinitions) {
            Genki.appendix.jisho.selected = localStorage.selectedDefinitions.split(',');
          }
          
        }
      }
      
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
