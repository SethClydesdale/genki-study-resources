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
        
        // update exercise title name
        document.getElementById('exercise-title').insertAdjacentHTML('beforeend', ' Word Practice');
        
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
            Genki.appendix.jisho.switchMode(localStorage.genkiJishoMode);
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
          document.getElementById('appendix-tool').style.display = 'none';
          document.getElementById('exercise').style.display = '';

          Genki.generateQuiz({
            type : 'multi',
            info : 'Look at the map and answer the questions about each location.</div>',

            quizlet : randomQuizlet
          });
        }
      });
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
