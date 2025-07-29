// # FUNCTIONALITY FOR EXERCISES #
(function (window, document) {
  'use strict';
  
  // primary object for functionality of Genki exercises
  var Genki = {
    
    // exercise statistics
    stats : {
      problems : 0, // number of problems to solve in the lesson
        solved : 0, // number of problems solved
      mistakes : 0, // number of mistakes made in the lesson
         score : 0, // the student's score
       exclude : 0  // answers to exclude, mostly for text-only segments in multi-choice quizzes
    },
    
    canNotify : 'Notification' in window,
    
    // checks if touchscreen controls
    isTouch : 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
    isTouching : false,

    // tells us if timer is paused by popup
    isTimerPausedByPopup: false,
    
    // tells us the student's preferred feedback mode for multi-choice quizzes (instant || classic)
    feedbackMode : storageOK && localStorage.feedbackMode ? localStorage.feedbackMode : 'classic',
    
    // counter for displaying the data backup reminder
    dataBackupReminderCount : storageOK && localStorage.dataBackupReminderCount ? +localStorage.dataBackupReminderCount : 0,
    
    // tells us if text selection mode is enabled (for multi-choice quizzes)
    textSelectMode : false,
    
    // tells us if stroke numbers are visible (for stroke order exercises)
    strokeNumberDisplay : false,

    // tells us if a quiz item is marked in a drag and drop quiz
    markedItem : null,
    
    // tells us what edition of Genki the student is using so we can change the URLs accordingly
    ed : 'lessons' + (/lessons-3rd/.test(window.location.pathname) ? '-3rd' : ''),
    
    // tells us if Genki is being used on a local file system so we can append index.html to URLs
    local : window.location.protocol == 'file:' ? 'index.html' : '',
    
    // tells us if debug mode is active so we can append ?debug to exercise URLs
    debug : /debug/.test(window.location.search) ? '?debug' : '',

    // frequently used/generic strings
    lang : {
      std_drag : '<span class="en">Drag the English expression to the Japanese expression that has the same meaning.<br>TIP: Click an expression to mark it, then click an empty field to drop the answer there.</span><span class="ja">英語の言葉を同じ意味を持つ日本語の言葉にドラッグしなさい。<br>ヒント：言葉をクリックすると選択になります。空のフィールドをクリックすると選択した言葉をドロップします。</span>',
      std_kana : '<span class="en">Drag the Kana to the matching Romaji.<br>TIP: Click the kana to mark it, then click an empty field to drop the answer there.</span><span class="ja">仮名をローマ字にドラッグしなさい。<br>ヒント：言葉をクリックすると選択になります。空のフィールドをクリックすると選択した言葉をドロップします。</span>',
      std_num : '<span class="en">Drag the Numbers to the matching Kana.<br>TIP: Click a number to mark it, then click an empty field to drop the answer there.</span><span class="ja">数を仮名にドラッグしなさい。<br>ヒント：言葉をクリックすると選択になります。空のフィールドをクリックすると選択した言葉をドロップします。</span>',
      std_multi : '<span class="en">Solve the problems by choosing the correct answers.</span><span class="ja">正解の答えを選択しなさい。</span>',
      std_questions : '<span class="en">Answer the questions as best as you can.</span><span class="ja">質問に答えなさい。</span>',
      std_written : '<span class="en">Complete the following problems.</span><span class="ja">次の質問に答えなさい。</span>',
      std_culture : '<span class="en">Answer the questions about Japanese culture as best as you can.</span><span class="ja">日本の文化について質問に答えなさい。</span>',
      std_stroke_order : '<span class="en">Practice drawing each kanji by following the stroke order.</span><span class="ja">それぞれの漢字の書き順を練習しなさい。</span>',
      std_drawing : '<span class="en">Practice drawing the following kanji multiple times.</span><span class="ja">それぞれの漢字を何度も書きなさい。</span>',
      
      // additional vocab info
      vocab_multi : '<span class="en">Choose the correct definition for each Japanese expression.</span><span class="ja">それぞれの言葉の正解の定義を選択しなさい。</span>',
      vocab_writing : '<span class="en">Practice spelling the following words/expressions.</span><span class="ja">それぞれの言葉を何度も書きなさい。</span>',
      vocab_fill : '<span class="en">Write the Japanese definition for the following words/expressions.</span><span class="ja">日本語でそれぞれの言葉の定義を書きなさい。</span>',

      // additional kana info
      kana_multi : '<span class="en">Choose the correct Romaji for the %{KANA}.</span><span class="ja">%{KANA}のローマ字を選択しなさい。</span>',
      kana_writing : '<span class="en">Practice writing the following %{KANA}.</span><span class="ja">%{KANA}を書きなさい。</span>',
      kana_fill : '<span class="en">Complete the chart by filling in the Romaji.</span><span class="ja">チャートでローマ字を書き込みなさい。</span>',

      // addition number info
      num_multi : '<span class="en">Read the Japanese and choose the correct numbers.</span><span class="ja">日本語を読んで正解の数を選択しなさい。</span>',
      num_writing : '<span class="en">Practice spelling the following numbers.</span><span class="ja">それぞれの数を書きなさい。</span>',
      num_fill : '<span class="en">Write the following numbers in Japanese (hiragana).</span><span class="ja">平仮名でそれぞれの数を書きなさい。</span>',
      
      kanji_readings_multi : '<span class="en">Choose the correct readings for each kanji.</span><span class="ja">それぞれの漢字の正解の読み方を選択しなさい。</span>',
      kanji_readings_drag : '<span class="en">Match each kanji with their readings.</span><span class="ja">それぞれの漢字を正解の読み方に合わせなさい。</span>',
      kanji_yomikata : '</div><p class="text-block en" style="margin:10px 0;">▶ indicates the <em>on-yomi</em> (pronunciation originally borrowed from Chinese).<br>▷ indicates the <em>kun-yomi</em> (native Japanese reading).</p><p class="text-block ja" style="margin:10px 0;">「▶」は音読み（中国の読み方）<br>「▷」は訓読み（日本の読み方）</p>',

      kanji_meanings_multi : '<span class="en">Choose the correct meanings for each kanji.</span><span class="ja">それぞれの漢字の正解の意味を選択しなさい。</span>',
      kanji_meanings_drag : '<span class="en">Match each kanji with their meanings.</span><span class="ja">それぞれの漢字を正解の意味に合わせなさい。</span>',
      
      // options for exercise variations
      opts : {
        kana : {
          kana : 'Drag and Drop',
          multi : 'Multiple Choice',
          writing : 'Writing Practice',
          fill : 'Fill in the Chart'
        },
        
        numbers : {
          drag : 'Drag and Drop',
          multi : 'Multiple Choice',
          writing : 'Spelling Practice',
          fill : 'Write the Numbers'
        },
        
        kanji : {
          multi : 'Multiple Choice',
          drag : 'Drag and Drop'
        },
        
        vocab : {
          drag : 'Drag and Drop',
          multi : 'Multiple Choice',
          writing : 'Spelling Practice',
          fill : 'Write the Definition'
        },
        
        practice : {
          multi : 'Multiple Choice',
          fill : 'Written',
          drag : 'Drag and Drop'
        },
        
        hirakata : {
          fill : 'Written',
          stroke : 'Stroke Order Practice',
          drawing : 'Drawing Practice'
        }
      },
      
      mistakes : '<span class="en">The items outlined in <span class="t-red t-bold">red</span> were answered wrong before finding the correct answer. Review these problems before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>問題は不正確です。この問題を復習してやり直してください。</span>',
      writing_mistakes : '<span class="en">The items outlined in <span class="t-red t-bold">red</span> were answered wrong. Review these problems before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>問題は不正確です。この問題を復習してやり直してください。</span>',
      multi_mistakes : '<span class="en">The answers you selected that were wrong are outlined in <span class="t-red t-bold">red</span>. The correct answers are outlined in <span class="t-blue t-bold">blue</span>. Review these problems before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>問題は不正確で、正解の答えは<span class="t-blue t-bold">青い</span>です。この問題を復習してやり直してください。</span>',
      stroke_mistakes : '<span class="en">The characters you drew that were wrong are outlined in <span class="t-red t-bold">red</span>. Please review the stroke order and number of strokes for these characters before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>漢字は不正解です。書き順を復習してやり直してください。</span><br><br><b>Note:</b> Sometimes answers may be marked wrong by mistake, due to a mismatch in the recognition algorithm.<br>Please use your own discretion if this occurs.',
      fill_mistakes : '<span class="en">The items underlined in <span class="t-red t-bold">red</span> were answered wrong, the correct answers are listed underneath in <span class="t-green t-bold">green</span>. Review these problems before trying again.</span><span class="ja"><span class="t-red t-bold">赤い</span>下線の問題は不正解で、正解の答えは<span class="t-green t-bold">緑色</span>で赤い下線の問題の下です。この問題を復習してやり直してください。</span>',
      sub_answers : '<b>Note:</b> Answers inside <span class="t-blue t-bold">blue</span> parentheses separated by "<span class="alt-phrase-sep">/</span>" are a list of possible sub-answers; only one can be used.<br>For example.. <span class="t-green"><span class="alt-phrase">(</span>あの<span class="alt-phrase-sep">/</span>その<span class="alt-phrase">)</span>ねこ</span>: そのねこ or あのねこ <span class="t-green">(good)</span> vs あの/そのねこ <span class="t-red">(bad)</span><br><span class="t-green"><span class="alt-phrase">(</span>この<span class="alt-phrase-sep">/</span><span class="alt-phrase">)</span>ねこ</span> means the sub-answer is optional; it can be left out.',
      
      // buttons
      // review button for drag/drop exercises
      review : '<div id="review-exercise" class="center clearfix"><button id="review-button" class="button" onclick="Genki.review();"><i class="fa">&#xf02d;</i><span class="en">Review</span><span class="ja">復習する</span></button></div>',
      // furigana toggle for vocab exercises
      toggle_furigana : '<button id="toggle-furigana" class="button" onclick="Genki.toggle.furigana(this);"><i class="fa">&#xf2a8;</i><span class="en">' + ((storageOK && localStorage.furiganaVisible == 'false') ? 'Show' : 'Hide') + ' Furigana</span><span class="ja">振り仮名を' + ((storageOK && localStorage.furiganaVisible == 'false') ? '' : '非') + '表示する</span></button>',
      // check answers button for written exercises
      check_answers : '<div id="check-answers" class="center"><button id="check-answers-button" class="button" onclick="Genki.check.answers();"><i class="fa">&#xf00c;</i><span class="en">Check Answers</span><span class="ja">答え合わせをする</span></button></div>',
      back_to_dict : '<button class="button" onclick="Genki.reset();"><i class="fa">&#xf021;</i><span class="en">Back to Dictionary</span><span class="ja">辞書に戻る</span></button>'
    },

    // info about the currently active exercise
    active : {
      type : null, // current exercise type
      exercise : null, // placeholder for the active exercise's data
      index : 0, // index where active.exercise is located
      path : window.location.pathname.replace(/.*?\/lessons.*?\/(.*?\/.*?)\/.*/g, '$1'), // current exercise path
    },
    
    // exercise list
    exercises : window.GenkiExercises || null,

    // scroll to the specified element: Genki.scrollTo('#lesson-3')
    // scrolling can be delayed by passing a value that evaluates to true (true; 1; '.') to the second param; delay
    // the second param is mostly for script generated content, i.e. the exercises, since there's a small delay before the content is visible
    scrollTo : function (el, delay) {
      // check if el is a selector
      if (typeof el == 'string') {
        el = document.querySelector(el);
      }

      var scroll = function () {
        document.body.scrollTop = el.offsetTop;
        document.documentElement.scrollTop = el.offsetTop;
      };

      // scroll immediately or wait 100ms
      // the latter is for exercises, where there's a slight delay before content is available
      if (delay) {
        setTimeout(scroll, 100);
      } else {
        scroll();
      }
    },

    
    // quiz types
    // feel free to use as a reference for selecting types or within code as Genki.QuizType.TYPE
    QuizType : {
      DRAG: 'drag',
      KANA: 'kana',
      WRITING: 'writing',
      MULTI: 'multi',
      FILL: 'fill',
      STROKE: 'stroke',
      DRAWING: 'drawing'
    },
    
    // To generate a quiz simply pass an object with the necessary data (see vocab-1/index.html and other quiz files for examples)
    generateQuiz : function (o) {
      // cache exercise data for resetting exercises
      if (!Genki.exerciseData && window.JSON) {
        Genki.exerciseData = JSON.stringify(o);
      }
      
      /********************************
      ========# EXERCISE TYPES #=======
      *********************************
      ** 0. EXERCISE TYPE SELECTION  **
      ** 1. DRAG AND DROP            **
      ** 2. KANA DRAG AND DROP       **
      ** 3. WRITING PRACTICE         **
      ** 4. MULTIPLE CHOICE          **
      ** 5. FILL IN THE BLANKS       **
      ** 6. STROKE ORDER             **
      ** 7. DRAWING PRACTICE         **
      *********************************/
      var zone = document.getElementById('quiz-zone'); // area where quizzes are inserted
      
      // # 0. EXERCISE TYPE SELECTION #
      // mainly for exercises that provide multiple exercise variations
      // handles switching and conversion of exercises
      if (typeof o.type === 'object') {
        // the `begin` query in the URL determines the exercise to immediately start (without popup confirmation)
        // example: https://sethclydesdale.github.io/genki-study-resources/lessons-3rd/lesson-4/vocab-1/?begin=1 (this starts multiple choice, 0 would start drag and drop)
        // `begin` or `start` may be used equally, whichever is preferred.
        var begin = /(?:begin|start)=\d/.test(window.location.search) ? window.location.search.replace(/.*?(?:begin|start)=(\d).*/, '$1') : false,
            i = 0, j = o.type.length, opts = '', modal;
        
        // parse options
        for (; i < j; i++) {
          opts += '<option value="' + i + '"' + (begin !== false ? (i == begin ? ' selected' : '') : storageOK && localStorage['genki_pref_' + o.format] == o.type[i] ? ' selected' : '') + '>' + Genki.lang.opts[o.format][o.type[i]] + '</option>';
        }
        
        // japanese language for exercise types
        if (GenkiLang == 'ja') {
          opts = opts.replace('Drag and Drop', 'ドラッグ＆ドロップ')
                     .replace('Multiple Choice', '選択式')
                     .replace('Writing Practice', '書き練習')
                     .replace('Spelling Practice', 'スペルの練習') 
                     .replace('Write the Definition', '言葉を書く') 
                     .replace('Written', '筆記テスト')
                     .replace('Stroke Order Practice', '書き順の練習')
                     .replace('Extended Drawing Practice', '連続の書き順の練習')
                     .replace('Drawing Practice', '連続の書き順の練習')
                     .replace('Fill in the Chart', 'チャートを書き込む')
                     .replace('Write the Numbers', '数を書く');
        }
        
        // open selection window
        modal = GenkiModal.open({
          title : '<span class="en">Please Select an Exercise Type</span><span class="ja">練習型を選択してください</span>',
          content : '<span class="en">Please select the type of exercise you would like to do, then click "Begin" to start studying.</span><span class="ja">練習型を選択してから練習を始めるために「始める」をクリックしてください。</span><br><br>'+
          '<div class="center">'+
            (/\/vocabulary-index\/|\/custom-vocab\//.test(window.location) ? '' : '<div>'+
              '<b><span class="en">Current Exercise</span><span class="ja">今の練習</span></b><br>'+
              document.title.replace(/ \| Genki Study Resources.*$/, '')+
            '</div><br>')+

            '<div>'+
              '<b><span class="en">Exercise Type</span><span class="ja">練習型</span></b><br>'+
              '<select id="exercise-type">' + opts + '</select>'+
            '</div><br>'+

            '<div title="' + (GenkiLang == 'ja' ? '練習型を変更したいなら練習ページの下の「練習型を変更する」をクリックしてください。' : 'The exercise type can still be changed via the Change Exercise Type button at the bottom of an exercise.') + '">'+
              '<input id="modal-skip-ex-type" class="genki_input_hidden" type="checkbox"' + (storageOK && localStorage.genkiSkipExType == 'true' ? ' checked' : '') + ' onchange="localStorage.genkiSkipExType = this.checked">'+
              '<span tabindex="0" class="genki_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
              '<label class="checkbox-label" for="modal-skip-ex-type"><span class="en">Skip Exercise Type Selection</span><span class="ja">練習型の選択をスキップする</span></label>'+
            '</div>'+
          '</div>',

          buttonHTML : '<span class="en">Begin</span><span class="ja">始める</span>',
          noClose : 1,
          zIndex : 'low',
          
          // generate quiz with selected type
          callback : function () {
            var type = document.getElementById('exercise-type').value;
            
            o.type = o.type[type];
            o.info = typeof o.info == 'object' && o.info[type] ? o.info[type] : o.info;
            
            // store exercise preference
            if (storageOK) {
              localStorage['genki_pref_' + o.format] = o.type;
            }
            
            // convert the quizlet to the selected type
            // vocab, kana, and number conversions
            if (/vocab|kana|numbers|kanji/.test(o.format)) {
              
              // reformats the quizlet for kana exercises, so that they can be converted to other exercise types
              if (o.format == 'kana' && o.type != 'kana') {
                var kana = {}, i, k;
                
                for (i in o.quizlet) {
                  for (k in o.quizlet[i]) {
                    kana[k] = o.quizlet[i][k];
                  }
                }
                
                o.quizlet = kana;
                
                // also change the info description
                o.info = o.info.replace(/%\{KANA\}/g, Genki.active.exercise[1].replace(/.*?(Hiragana|Katakana).*/, function ($1) {
                  return GenkiLang == 'ja' ? (/Hiragana/i.test($1) ? 'ひらがな' : 'カタカナ') : $1;
                }));
              }
              
              // formats kanji for readings quizzes
              if (o.format == 'kanji') {
                
                // kanji readings modifications
                if (o.readings) {
                  var i;

                  // add on and kun arrows to the readings
                  for (i in o.quizlet) {
                    var yomikata = o.quizlet[i].split('|');
                    o.quizlet[i] = 
                      (yomikata[0] ? '<span class="yomikata" title="' + ( GenkiLang == 'ja' ? '音読み' : 'on-yomi' ) + '">▶</span>' + yomikata[0] + '<br>' : '')+
                      (yomikata[1] ? '<span class="yomikata" title="' + ( GenkiLang == 'ja' ? '訓読み' : 'kun-yomi' ) + '">▷</span>' + yomikata[1] : '');
                  }

                  // add on/kun after the info box
                  o.info += Genki.lang.kanji_yomikata;
                }
                
                // special classes for kanji readings and meanings
                if (o.type == 'drag') {
                  document.getElementById('exercise').className += o.readings ? ' kanji-readings' : o.meanings ? ' kanji-meanings' : '';
                }
              }
              
              // BEGIN conversion conditions for vocab or kana
              // multi-choice conversion
              if (o.type == 'multi') {
                var quizlet = [], keys = [], keys2 = [], currentAnswer, sentence, answer, answers, def, i, j, k, n, n2;
                
                // get keys for randomization of the vocabulary
                for (i in o.quizlet) {
                  keys.push(i);
                  keys2.push(i);
                }
                
                // randomly sort the vocab
                for (i = 0, j = keys.length; i < j; i++) {
                  n = Math.floor(Math.random() * keys.length);
                  def = keys[n].split('|');
                  currentAnswer = o.quizlet[keys[n]].replace(/\|.*?$/, '');
                  sentence = /\|/.test(o.quizlet[keys[n]]) ? o.quizlet[keys[n]].replace(/.*?\|(.*?$)/, '$1') : '';
                  
                  // push the question data
                  quizlet.push({
                    question : '<div class="multi-vocab">'+
                    (def[1] ? '<ruby>' : o.format == 'kanji' ? '<div class="big-kanji">' : '') + def[0] + (def[1] ? '<rt>' + def[1] + '</rt></ruby>' : o.format == 'kanji' ? '</div>' : '')+
                    (sentence ? '<hr><div class="multi-vocab-sentence">' + sentence + '</div>' : '')+
                    '</div>',
                    answers : ['A' + currentAnswer]
                  });
                  
                  // randomly assign answers
                  answers = keys2.slice();
                  answers.splice(n, 1);
                  k = 3;
                  
                  while (k --> 0) {
                    if (answers.length) {
                      n2 = Math.floor(Math.random() * answers.length);
                      answer = o.quizlet[answers[n2]].replace(/\|.*?$/, '');
                      
                      // prevent identical answers from showing
                      if (answer == currentAnswer) {
                        k++; // increment to try another
                      }
                      // otherwise add a new answer if it's not identical
                      else {
                        quizlet[i].answers.push(answer.charAt(0) == 'A' ? '!' + answer : answer);
                      }
                      
                      answers.splice(n2, 1);
                    } else {
                      break; // break out if there's no more answers, to prevent errors
                    }
                  }
                  
                  // remove the key
                  keys.splice(n, 1);
                }
                
                o.quizlet = quizlet;
              }
              
              // spelling practice conversion
              else if (o.type == 'writing') {
                var quizlet = {}, split, i;
                
                for (i in o.quizlet) {
                  split = i.split('|');
                  
                  // words which contain '／' have multiple variations, as such we should loop through and add these separately
                  for (var a = split[0].split('／'), b = 0, c = a.length, furi; b < c; b++) {
                    furi = split[1] ? split[1] : o.format == 'kana' ? o.quizlet[i] : '';
                    quizlet[a[b].replace(/\(.*?\)|（.*?）|～/g, '')] = furi;

                    // add additional variations if the word/expression contains optional parts
                    if (/\(.*?\)|（.*?）/.test(a[b])) {
                      quizlet[a[b].replace(/～|\(|\)|（|）/g, '')] = furi;
                    }
                  }
                }
                
                o.quizlet = quizlet;
                o.columns = 6;
              }
              
              // write the definition conversion
              else if (o.type == 'fill') {
                // written format for vocab
                if (/vocab|numbers/.test(o.format)) {
                  var quizlet = '<div class="count-problems columns-2 clear"><div>',
                      keys = [], def, problem, i, j, n;

                  // get keys
                  for (i in o.quizlet) {
                    keys.push(i);
                  }

                  // parse written quiz
                  for (i = 0, j = keys.length, n = Math.ceil(j/2); i < j; i++) {
                    def = keys[i].split('|');
                    
                    problem = ('{'+
                      // filter: /。|～/g (4 below)
                      // cannot be cached to a variable due to this bug: http://blog.stevenlevithan.com/archives/es3-regexes-broken
                      def[0].replace(/。|～/g, '')+ // answer 1
                      (def[1] ? '|' + def[1].replace(/。|～/g, '') : '')+ // answer 2
                      (/。|～/g.test(def[0]) ? '|' + def[0] : '')+ // unfiltered answer 1
                      (def[1] && /。|～/g.test(def[1]) ? '|' + def[1] : '')+ // unfiltered answer 2
                      // additional parsing
                    '}').replace(/\((.*?)\)/g, '%($1/)').replace(/（(.*?)）/g, '%($1/)') // adds optional sub-answers
                        .replace(/／/g, '|'); // adds additional answers
                    
                    quizlet += 
                    (i == n ? '</div><div>' : '')+ // changes columns
                    '<div class="problem">'+
                      o.quizlet[keys[i]].replace(/\|.*?$/, '') + '<br>'+
                      // add '|answer' flag to problem if it contains a horizontal bar
                      // the horizontal bar indicates multiple answers in this instance
                      (/\|/.test(problem) ? problem.replace('}', '|answer}') : problem)+ 
                    '</div>'; 
                    
                  }
                  
                  o.quizlet = quizlet + '</div></div>';
                }
                
                // written format for kana
                else if (o.format == 'kana') {
                  o.quizlet = o.chart;
                }
              }
            }
            
            // practice exercise variations, typically multiple choice
            // switches to either multi or fill (written test)
            else if (o.format == 'practice') {
              o.quizlet = o.quizlet[type]; // variations are handled file-side for better control
              
              var img = document.querySelector('.multi-quiz-image');
              
              // hide multi-choice images if written test is chosen
              if (o.type == 'fill' && img) {
                img.style.display = 'none';
              }
              
              // show multi-choice images if multiple choice is chosen
              else if (o.type == 'multi' && img) {
                img.style.display = '';
              }
            }
            
            // for hiragana/katakana writing/stroke order workbooks
            // switches between the workbook format and stroke order format
            else if (o.format == 'hirakata') {
              o.quizlet = o.quizlet[type] ? o.quizlet[type] : o.quizlet[o.quizlet.length - 1];
            }
            
            // finally, launch the quiz
            Genki.generateQuiz(o);
            
            // set exercise type changing to false so exercises will automatically start on retry if genkiSkipExType is enabled
            Genki.changingExType = false;
          }
        });
        
        // auto start the exercise if "begin=NUMBER" is specified in the URL. OR Exercise Type Selection Skipping is Enabled
        // NUMBER should be the index of the drop down exercise types, starting at 0 for the first, 1 for the second, and so on..
        if (!Genki.changingExType && (begin !== false || (storageOK && localStorage.genkiSkipExType == 'true'))) {
          modal.callback();
          GenkiModal.close();
        }
        
        // create button to change exercise type (eliminates the need to press refresh or F5)
        Genki.create.exerciseTypeButton();
        
        return false;
      }
      
      // log current type
      Genki.active.type = o.type;
      
      // format grammar index links in the quiz info
      if (/\!GRI/.test(o.info)) {
        o.info = o.info.replace(/\{.*?\}/g, function (match) {
          var data = match.slice(1, match.length - 1).split('|'), hint, flag, sub, width, placeholder;
          return '<a href="' + getPaths() + 'lessons-3rd/appendix/grammar-index/' + Genki.local + '#' + data[2] + '" target="_blank"' + ((Genki.local && !Genki.debug) ? '' : ' onclick="Genki.getGrammarPoint(this, \'' + data[2] + '\'); return false;"') + '>' + data[1] + '</a>';
        });
      }

      // # 1. DRAG AND DROP #
      if (o.type == 'drag') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
            dropList = '<div id="drop-list">',
            keysQ = [],
            keysA,
            helper,
            helperPresent,
            i;

        // generate a key list for the quizlet so we can randomly sort questions and answers
        for (i in o.quizlet) {
          keysQ.push(i);
        }
        keysA = keysQ.slice(0);

        // generate the questions
        while (keysQ.length) {
          i = Math.floor(Math.random() * keysQ.length);
          
          // | is used to separate a word from a helper
          helper = /\|/.test(keysQ[i]) ? 'data-helper="' + keysQ[i].split('|').pop() + '"' : null;
          
          // add the quiz items and drop zones
          quiz += '<div class="quiz-item-group">'+
            '<div class="quiz-item" ' + (helper || '') + '>' + (helper ? keysQ[i].replace(/(.*?)\|(.*)/, '$1<span class="hidden-text">$2</span>') : keysQ[i]) + '</div>'+
          '</div>';
          
          dropList += '<div tabindex="0" class="quiz-answer-zone' + (/\|/.test(keysQ[i]) ? ' helper-answer' : '') + '" data-text="' + keysQ[i].replace(/\|.*?$/, '') + '" data-mistakes="0"></div>';
          keysQ.splice(i, 1);
          
          ++Genki.stats.problems;
          
          // indicate that a helper, such as furigana, is present
          if (!helperPresent && helper) {
            helperPresent = true;
          }
        }
        quiz += '</div>' + dropList + '</div>'; // close the question list and add the drop list

        // add a class for the helper styles
        if (helperPresent) {
          zone.className += ' helper-' + ((storageOK && localStorage.furiganaVisible == 'false') ? 'hidden' : 'present');
        }
        
        // generate the answers
        quiz += '<div id="answer-list">';
        while (keysA.length) {
          i = Math.floor(Math.random() * keysA.length);
          quiz += '<div tabindex="0" class="quiz-item" data-answer="' + keysA[i].replace(/\|.*?$/, '') + '"><div class="quiz-item-text">' + o.quizlet[keysA[i]].replace(/\|.*?$/, '') + '</div></div>';
          keysA.splice(i, 1);
        }
        quiz += '</div>'; // close the answer list
        
        // add the quiz to the document
        zone.innerHTML = quiz + Genki.lang.review.replace('</div>', Genki.lang.toggle_furigana + '<button id="toggle-orientation" class="button" onclick="Genki.toggle.vocabOrientation(this);"><i class="fa" style="position:relative;transform:rotate(90deg);">&#xf0db;</i><span class="en">Horizontal Mode</span><span class="ja">水平モード</span></button>' + '</div>');
        
        // if selected, change the vocab orientation so that it's horizontal
        if (storageOK && localStorage.vocabHorizontal == 'true') {
          Genki.toggle.vocabOrientation(document.getElementById('toggle-orientation'), 'false');
        }
      }


      // # 2. KANA DRAG AND DROP #
      else if (o.type == 'kana') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list" class="clear">',
            answers = '<div id="answer-list">',
            kanaList = [],
            kana = o.quizlet,
            i = kana.length - 1,
            k;

        // create the columns for the student to drop the kana into
        for (; i > -1; i--) {
          quiz += '<div class="quiz-column">';

          // insert the romaji and empty container for dropping the kana
          for (k in kana[i]) {
            quiz += 
            '<div class="quiz-item-row">'+
              '<div tabindex="0" class="quiz-answer-zone" data-text="' + kana[i][k] + '" data-mistakes="0"></div>'+
              '<div class="quiz-item">' + kana[i][k] + '</div>'+
            '</div>';

            // put the kana into an array for later..
            kanaList.push('<div tabindex="0" class="quiz-item" data-answer="' + kana[i][k] + '">' + k + '</div>');
            ++Genki.stats.problems;
          }

          quiz += '</div>'; // close the column
        }

        // randomize the kana order, so the student cannot memorize the locations
        while (kanaList.length) {
          i = Math.floor(Math.random() * kanaList.length);
          answers += kanaList[i];
          kanaList.splice(i, 1);
        }

        // add the kana list to the document
        zone.innerHTML = quiz + '</div>' + answers + '</div>' + Genki.lang.review;
      }


      // # 3. WRITING PRACTICE #
      else if (o.type == 'writing') {
        var quiz = '<div id="quiz-info">' + o.info + '<br><span class="en">If you don\'t know how to type in Japanese on your computer, please visit our help page by <a href="../../../help/writing/' + Genki.local + '" target="_blank">clicking here</a>.</span><span class="ja">パソコンで日本語を入力する方法がわからない場合は、<a href="../../../help/writing/' + Genki.local + '" target="_blank">ヘルプページ</a>をご覧ください。</span></div><div id="question-list">',
            columns = o.columns,
            width = 'style="width:' + (100 / (columns + 1)) + '%;"',
            index = 0,
            helper = false,
            i, j;

        for (i in o.quizlet) {
          // create a new row
          quiz += '<div class="quiz-answer-row' + (o.quizlet[i] ? ' furi-row' : '') + '"><div class="quiz-item" data-helper="' + o.quizlet[i] + '" ' + width + '><div class="quiz-item-text">' + i + '</div></div>';
          j = 0;

          // insert the writing zones
          while (columns --> 0) {
            quiz += '<div class="writing-zone" ' + width + '><input class="writing-zone-input" type="text" ' + ((!o.quiz && j++ < 3) ? 'placeholder="' + i + '"' : '') + ' data-answer="' + (o.quiz ? o.quizlet[i] : i) + '" data-mistakes="0" tabindex="0" ' + (o.quiz ? '' : 'oninput="Genki.check.value(this);"') + ' onfocus="Genki.input.index = ' + index++ + '"></div>';
            ++Genki.stats.problems;
          }

          quiz += '</div>'; // close the row
          columns = o.columns; // reset column value for next iteration
        }
        
        // check if furigana is present and add a toggle button
        if (/data-helper/.test(quiz)) {
          helper = true;
          zone.className += ' helper-' + ((storageOK && localStorage.furiganaVisible == 'false') ? 'hidden' : 'present');
        }

        // add the quiz to the document
        zone.innerHTML = quiz + '</div>' + Genki.lang.check_answers.replace('</div>', helper ? Genki.lang.toggle_furigana + '</div>' : '</div>');
        
        // add a class for non-practice writing exercises
        // this will remove helpers, forcing the student to recall what they learned
        if (o.quiz) {
          zone.className += ' no-helper';
        }
        
        // input field data
        Genki.input = {
          map : document.querySelectorAll('.writing-zone-input'),
          index : 0
        };
        
        // auto-focus the first input field
        Genki.input.map[0].autofocus = true;
      }


      // # 4. MULTIPLE CHOICE #
      else if (o.type == 'multi') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
            answers = '<div id="answer-list">',
            option = 65, // used for tagging answers as A(65), B(66), C(67)..
            isAnswer = false,
            helper = false,
            vocab = /"format":"vocab"/.test(Genki.exerciseData),
            q = o.quizlet,
            i = 0,
            j = q.length,
            n;

        // create individual blocks for each question and hide them until later
        for (; i < j; i++) {
          quiz += '<div id="quiz-q' + i + '" class="question-block" data-qid="' + (i + 1) + '" style="display:none;"><div class="quiz-multi-question">' + (o.questionsAlignLeft ? '<div class="quiz-question-inner-text">' : '') + (typeof q[i].question != 'undefined' ? q[i].question.replace(/\{.*?\}/g, function (match) {
            var data = match.slice(1, match.length - 1).split('|');
          
            if (data[0] == '!IMG') {
              return Genki.parse.image(data);
            }
          }) : '<div class="text-passage' + (q[i].vertical ? ' vertical-text' : '') + '" ' + (q[i].text.replace(/<br>/g, '').length < 50 ? 'style="text-align:center;"' : '') + '>' + q[i].text + '</div>' + (q[i].helper || '')) + (o.questionsAlignLeft ? '</div>' : '') + '</div>' + (vocab ? '<button class="button vocab-spoiler-toggle" onclick="Genki.toggle.vocabSpoiler(this);"><i class="fa"></i><span class="en">Show Choices</span><span class="ja">選択肢を表示する</span></button><div class="vocab-spoiler">' : '');

          // ready-only questions contain text only, no answers
          if (q[i].text) {
            quiz += '<div class="quiz-multi-row"><div tabindex="0" class="quiz-multi-answer next-question" onclick="Genki.progressQuiz(this, true);" onkeypress="event.key == \'Enter\' && Genki.progressQuiz(this, true);">NEXT</div></div>';
            ++Genki.stats.exclude; // exclude this block from the overall score

          } else { // standard question block construction

            // add answers to the question block
            while (q[i].answers.length) {
              n = Math.floor(Math.random() * q[i].answers.length);

              // answers that begin with "A" are the correct answer. 'ATrue';
              // "!" is for answers that begin with "A", but aren't correct. '!Aomori Nebuta Festival'; lit. ! == NOT(correct)
              if (/^A|^\!/.test(q[i].answers[n])) {

                // marks the option as the correct answer if it begins with "A"
                if (q[i].answers[n].charAt(0) == 'A') {
                  isAnswer = true;
                }

                q[i].answers[n] = q[i].answers[n].slice(1);
              }

              quiz += '<div class="quiz-multi-row"><div tabindex="0" class="quiz-multi-answer" data-answer="' + isAnswer + '" data-option="' + String.fromCharCode(option++) + '" onclick="Genki.progressQuiz(this);" onkeypress="event.key == \'Enter\' && Genki.progressQuiz(this);"><div class="quiz-answer-inner-text">' + q[i].answers[n] + '</div></div></div>';
              isAnswer = false;

              q[i].answers.splice(n, 1);
            }

          }

          quiz += (vocab ? '</div>' : '') + '</div>'; // ends the question block
          option = 65; // resets the option id so the next answers begin with A, B, C..
          ++Genki.stats.problems; // increment problems number
        }
        
        // check if furigana is present and add a toggle button
        if (/class="furigana"|class="inline-furi"|<ruby>/.test(quiz)) {
          helper = true;
          zone.className += ' helper-' + ((storageOK && localStorage.furiganaVisible == 'false') ? 'hidden' : 'present');
        }
        
        // enables the vocab spoiler for multi-choice if preferred
        if (vocab && storageOK && localStorage.spoilerMode == 'true') {
          zone.className += ' spoiler-mode';
        }

        // add the multi-choice quiz to the quiz zone
        zone.innerHTML = quiz + '</div>'+
          '<div id="next-button" class="quiz-multi-row" style="margin-top:-20px; visibility:hidden;' + (Genki.feedbackMode == 'classic' ? 'display:none;' : '') + '"><div tabindex="0" class="quiz-multi-answer next-question" onclick="Genki.showNextQuestion(this);" onkeypress="event.key == \'Enter\' && Genki.showNextQuestion(this);">NEXT</div></div>'+
          '<div id="quiz-progress"><div id="quiz-progress-bar"></div></div>'+
          '<div id="review-exercise" class="center clearfix">'+ 
            (Genki.appendix ? '' : '<button class="button text-selection-mode-button" onclick="Genki.toggle.textSelection(this);"><i class="fa">&#xf246;</i> <span class="en">Enable Text Selection</span><span class="ja">テキスト選択モードを有効にする</span></button>')+
            (helper ? Genki.lang.toggle_furigana : '')+
          '</div>';
        
        // begin the quiz
        Genki.progressQuiz('init');
      }
      
      
      // # 5. FILL IN THE BLANKS #
      else if (o.type == 'fill') {
        var helper = false;
        
        // check if furigana is present and add a toggle button
        if (/class="furigana"|class="inline-furi"|<ruby>/.test(o.quizlet)) {
          helper = true;
          zone.className += ' helper-' + ((storageOK && localStorage.furiganaVisible == 'false') ? 'hidden' : 'present');
        }
        
        // add the quiz to the document
        zone.innerHTML = '<div id="quiz-info">' + o.info + '<br><span class="en">If you don\'t know how to type in Japanese on your computer, please visit our help page by <a href="../../../help/writing/' + Genki.local + '" target="_blank">clicking here</a>.</span><span class="ja">パソコンで日本語を入力する方法がわからない場合は、<a href="../../../help/writing/' + Genki.local + '" target="_blank">ヘルプページ</a>をご覧ください。</span></div><div class="text-block">' + o.quizlet.replace(/\{.*?\}/g, function (match) {
          var data = match.slice(1, match.length - 1).split('|'), hint, flag, sub, width, placeholder;
          
          if (data[0] == '!IMG') {
            return Genki.parse.image(data);
            
          } else if (data[0] == '!GRI') { // Grammar Index links
            return '<a href="' + getPaths() + 'lessons-3rd/appendix/grammar-index/' + Genki.local + '#' + data[2] + '" target="_blank"' + ((Genki.local && !Genki.debug) ? '' : ' onclick="Genki.getGrammarPoint(this, \'' + data[2] + '\'); return false;"') + '>' + data[1] + '</a>';
            
          } else if (data[0] == '!AUDIO') { // audio tracks
            return '<div class="audio-block center">'+
              '<audio id="' + data[1] + '" controls><source src="' + getPaths() + 'resources/audio/' + (Genki.ed == 'lessons-3rd' ? '3rd-edition/' : '2nd-edition/') + data[1] + '.mp3" type="audio/mpeg"></audio>'+
            '</div>';
            
          } else if (data[0] == '!PLAY') { // buttons for playing specific points of audio
            return '<button class="button play-button" onclick="Genki.playAudio(\'' + data[1] + '\', ' + data[2] + ');"><i class="fa">&#xf04b;</i></button>';
            
          } else {
            // Split the answer from the hint.
            // Syntax is {ANSWER|HINT|HIDE_HINT} HINT and HIDE_HINT is optional.
            // passing "answer" to HIDE_HINT will hide HINT and make it a secondary answer.
            // passing "furigana" to HIDE_HINT will hide HINT and make it furigana only to aid with reading.
            // passing "width:N" to HIDE_HINT will set the width of the field to N, manually. The hint will remain visible.
            // to show a hint along with a secondary answer, use this syntax: {ANSWER1|ANSWER2|answer;hint:HINT_TEXT}
            hint = data[1] ? data[1] : '',
            flag = ((data[10] || data[9] || data[8] || data[7] || data[6] || data[5] || data[4] || data[3] || data[2]) ? (data[10] || data[9] || data[8] || data[7] || data[6] || data[5] || data[4] || data[3] || data[2]) : '').split(';');
            
            // sub answer matches for answer 1 & 2 (used for calculating answer area width)
            if (/\%\((.*?)\)/.test(hint) || /\%\((.*?)\)/.test(data[0])) {
              sub = [
                data[0].match(/%\((.*?)\)/),
                hint.match(/%\((.*?)\)/)
              ];
            }

            ++Genki.stats.problems; // increment problems number
            
            // get problem width
            width =
              // manual width definition
              /width:/.test(flag[0]) ? flag[0].split(':')[1] :
              flag[1] && /width:/.test(flag[1]) ? flag[1].split(':')[1] :
              flag[2] && /width:/.test(flag[2]) ? flag[2].split(':')[1] :

              // automatic width calculation between alternate answer params; %(../../../..)
              sub ? (((
                hint ? ((sub[0] && sub[0][1]) || '/').split('/').concat(((sub[1] && sub[1][1]) || '/').split('/')) :
                ((sub[0] && sub[0][1]) || '/').split('/')
              ).sort(function (a, b) {
                  return b.length - a.length;

              })[0].length * (14 / (/[a-z]/i.test(hint || data[0]) && !/[\u3000-\u30FF]/.test(hint || data[0]) ? 2 : 1))) + 14) + (
                ([hint.replace(/\%\((.*?)\)/g, ''), data[0].replace(/\%\((.*?)\)/g, '')].sort(function (a, b) {
                  return b.length - a.length;
                })[0].length * (14 / (/[a-z]/i.test(hint || data[0]) && !/[\u3000-\u30FF]/.test(hint || data[0]) ? 2 : 1)))
              ) : 

              // automatic width calculation between answer1 and answer2/hint
              (([hint, data[0]].sort(function (a, b) {
                return b.length - a.length;
              })[0].length * (14 / (/[a-z]/i.test(hint || data[0]) && !/[\u3000-\u30FF]/.test(hint || data[0]) ? 2 : 1))) + 14);
            
            placeholder =
              /placeholder:/.test(flag[0]) ? flag[0].split(':')[1] :
              flag[1] && /placeholder:/.test(flag[1]) ? flag[1].split(':')[1] :
              flag[2] && /placeholder:/.test(flag[2]) ? flag[2].split(':')[1] : null;

            // parse and return the input field
            return '<span class="writing-zone">'+
              '<input '+
                'class="writing-zone-input" '+
                'type="text" '+
                'data-answer="' + data[0] + '" '+
                (flag[0] == 'answer' ? 'data-answer2="' + hint + '" ' : '')+
                (flag[0] == 'answer' && data[3] ? 'data-answer3="' + data[2] + '" ' : '')+
                (flag[0] == 'answer' && data[4] ? 'data-answer4="' + data[3] + '" ' : '')+
                (flag[0] == 'answer' && data[5] ? 'data-answer5="' + data[4] + '" ' : '')+
                (flag[0] == 'answer' && data[6] ? 'data-answer6="' + data[5] + '" ' : '')+
                (flag[0] == 'answer' && data[7] ? 'data-answer7="' + data[6] + '" ' : '')+
                (flag[0] == 'answer' && data[8] ? 'data-answer8="' + data[7] + '" ' : '')+
                (flag[0] == 'answer' && data[9] ? 'data-answer9="' + data[8] + '" ' : '')+
                (flag[0] == 'answer' && data[10] ? 'data-answer10="' + data[9] + '" ' : '')+
                (flag[0] == 'furigana' ? 'data-furigana="' + hint + '" ' : '')+
                ((flag[0] == 'placeholder' || placeholder) ? 'placeholder="' + (placeholder || hint) + '" ' : '')+
                'data-mistakes="0" '+
                'tabindex="0" '+
                'data-default-width="' + width + '" '+
                'style="width:' + (width * (storageOK && localStorage.genkiFontSize ? (+localStorage.genkiFontSize / 100) : 1)) + 'px;"'+
              '>'+
              ((hint && !/answer|furigana|placeholder/.test(flag[0]) || flag[1] && /hint:/.test(flag[1]) || flag[2] && /hint:/.test(flag[2])) ? '<span class="problem-hint">' + (
                flag[1] && /hint:/.test(flag[1]) ? flag[1].split(':')[1] : 
                flag[2] && /hint:/.test(flag[2]) ? flag[2].split(':')[1] : hint
              ) + '</span>' : '')+
            '</span>';
          }
          
        }) + '</div>' + Genki.lang.check_answers.replace('()', '(false, \'fill\')').replace('</div>', helper ? Genki.lang.toggle_furigana + '</div>' : '</div>');
        
        // auto-focus the first input field
        document.querySelector('.writing-zone-input').autofocus = true;
      }
      
      
      // # 6. STROKE ORDER #
      else if (o.type == 'stroke') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
            answers = '<div id="answer-list">',
            strokeOrderHidden = storageOK && localStorage.strokeOrderVisible == 'false',
            guideHidden = storageOK && localStorage.tracingGuideVisible == 'false',
            q = o.quizlet,
            i = 0,
            j = q.length, img;

        // create individual blocks for each question and hide them until later
        for (; i < j; i++) {
          if (q[i].kana) q[i].kanji = q[i].kana; // applies kana character to kanji property
          if (o.kanaType) o.kanaType = o.kanaType.charAt(0).toUpperCase() + o.kanaType.slice(1).toLowerCase();
          
          img = getPaths() + 'resources/images/stroke-order/' + q[i].order + '.png';
          
          // start question block
          quiz += '<div id="quiz-q' + i + '" class="question-block" data-qid="' + (i + 1) + '" style="display:none;">'+
            // kanji
            '<div class="quiz-multi-question">'+
              '<div class="kanji-container big-kanji' + ( q[i].kana ? ' kana-font' : '' ) + '"' + (q[i].font ? ' style="font-family:' + q[i].font + '"' : '') + '>' + q[i].kanji + '</div>'+
              '<div class="kanji-stroke-order">'+
                '<a class="button-link" href="' + (q[i].kana ? getPaths() + 'resources/images/stroke-order/sasagami-' + o.kanaType.toLowerCase() + '.jpg' : 'https://jisho.org/search/' + q[i].kanji + '%20%23kanji') + '" target="_blank" title="' + (GenkiLang == 'ja' ? 'jisho.orgで書き順を見る' : 'View stroke order on jisho.org') + '"><button class="button"><i class="fa">&#xf002;</i></button></a>'+
                '<a href="' + img + '" target="_blank" title="' + (GenkiLang == 'ja' ? 'クリックして画像を見る' : 'Click to view image') + '"><img src="' + img + '" alt="' + ( GenkiLang == 'ja' ? '書き順' : 'stroke order' ) + '"/></a>'+
              '</div>'+
            '</div>'+
            
            // drawing area + buttons
            '<div class="quiz-multi-row">'+
              '<canvas class="kanji-canvas" data-kanji="' + q[i].kanji + '" data-strokes="' + q[i].strokes + '" data-guide="' + (guideHidden ? false : true) + '"' + (q[i].kana && !q[i].font ? ' data-font="NotoSansJP, SawarabiGothic, MS Gothic, Yu Gothic, Meiryo"' : q[i].font ? ' data-font="' + q[i].font + '"' : '') + ' id="canvas-' + i + '" width="200" height="200"' + (q[i].kana ? 'data-kana="true"' : '') + '></canvas>'+
            '</div>'+
            '<div class="kanji-canvas-actions quiz-multi-row center">'+
              '<button class="button" onclick="KanjiCanvas.erase(this.dataset.canvas)" data-canvas="canvas-' + i + '" title="(CTRL+X)"><i class="fa">&#xf12d;</i><span class="en">Erase</span><span class="ja">消す</span></button>'+
              '<button class="button" onclick="KanjiCanvas.deleteLast(this.dataset.canvas)" data-canvas="canvas-' + i + '" title="(CTRL+Z)"><i class="fa">&#xf0e2;</i><span class="en">Undo</span><span class="ja">取り消す</span></button>'+
              (Genki.debug ? '<button class="button" onclick="console.log(KanjiCanvas.recognize(this.dataset.canvas));" data-canvas="canvas-' + i + '" title="Open console (F12) to see recognition candidates (CTRL+F)"><i class="fa">&#xf188;</i><span class="en">Test Recognition</span><span class="ja">テストする</span></button>' : '')+
            '</div>'+
            '<div class="quiz-multi-row">'+
              '<div tabindex="0" class="quiz-multi-answer next-question" onclick="Genki.progressQuiz(this, false, \'stroke\');" onkeypress="event.key == \'Enter\' && Genki.progressQuiz(this, false, \'stroke\');" data-canvas="canvas-' + i + '"><span class="en">Next '+ (q[i].kana ? o.kanaType : 'Kanji') + '</span><span class="ja">次の' + (q[i].kana ? (GenkiLang == 'ja' ? (/hiragana/i.test(o.kanaType) ? 'ひらがな' : 'カタカナ') : o.kanaType) : '漢字') + '</span></div>'+

            '</div>'+
          // end question block
          '</div>';
          
          ++Genki.stats.problems; // increment problems number
        }

        // add the multi-choice quiz to the quiz zone
        zone.innerHTML = quiz + '</div><div id="quiz-progress"><div id="quiz-progress-bar"></div></div>'+
          '<div id="review-exercise" class="center clearfix">'+ 
            '<button id="toggle-stroke-order" class="button" onclick="Genki.toggle.strokeOrder(this);"><i class="fa">&#xf1fc;</i><span class="en">' + (strokeOrderHidden ? 'Show' : 'Hide') + ' Stroke Order</span><span class="ja">書き順を' + (strokeOrderHidden ? '表示' : '非表示') + 'する</span></button>'+
            '<button id="toggle-tracing-guide" class="button" onclick="Genki.toggle.tracingGuide(this);"><i class="fa">&#xf031;</i><span class="en">' + (guideHidden ? 'Show' : 'Hide') + ' Tracing Guide</span><span class="ja">トレースのガイドを' + (guideHidden ? '表示' : '非表示') + 'する</span></button>'+
            '<button id="toggle-stroke-numbers" class="button" onclick="Genki.toggle.strokeNumbers(this);" style="display:none;"><i class="fa">&#xf162;</i><span class="en">Show Stroke Numbers</span><span class="ja">画数を表示する</span></button>'+
          '</div>';
        
        // hide stroke order based on preferences
        if (strokeOrderHidden) {
          zone.className += ' stroke-order-hidden';
        }
        
        // begin the quiz
        Genki.progressQuiz('init', false, 'stroke');
      }
      
      
      // # 7. DRAWING PRACTICE #
      else if (o.type == 'drawing') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
            guideHidden = storageOK && localStorage.tracingGuideVisible == 'false',
            columns = o.columns,
            width = 'style="width:' + (100 / (columns + 1)) + '%;"',
            q = o.quizlet, n = 0, i = 0, j = o.quizlet.length;

        for (; i < j; i++) {
          if (q[i].kana) q[i].kanji = q[i].kana; // applies kana character to kanji property
          
          // create a new row
          quiz += '<div class="quiz-answer-row">'+
          '<div class="drawing-zone" ' + width + '>'+
            '<div class="quiz-item">'+
              '<div class="quiz-item-text' + (q[i].kana ? ' kana-font' : '') + '"' + (q[i].font ? ' style="font-family:' + q[i].font + '"' : '') + '>' + q[i].kanji + '</div>'+
            '</div>'+
            '<button class="button stroke-order-button" onclick="Genki.viewStrokeOrder(\'' + q[i].kanji + '\', \'' + q[i].order + '\'' + (q[i].kana ? ",'" + o.kanaType + "'" : '') + ');"><span class="en">Stroke Order</span><span class="ja">書き順を見る</span></button>'+
          '</div>';

          // insert the drawing zones
          while (columns --> 0) {
            quiz += '<div class="drawing-zone" ' + width + '>'+
              '<canvas class="kanji-canvas" data-kanji="' + q[i].kanji + '" data-guide="' + (o.columns - columns > 3 ? false : guideHidden ? false : true) + '"' + (q[i].kana && !q[i].font ? ' data-font="NotoSansJP, SawarabiGothic, MS Gothic, Yu Gothic, Meiryo"' : q[i].font ? ' data-font="' + q[i].font + '"' : '') + ' data-strokes="' + q[i].strokes + '" data-size="100" id="canvas-' + n + '" width="110" height="110"' + (q[i].kana ? 'data-kana="true"' : '') + '></canvas>'+
              '<div class="kanji-canvas-actions">'+
                '<button class="button icon-only" onclick="KanjiCanvas.erase(this.dataset.canvas)" data-canvas="canvas-' + n + '" title="' + (GenkiLang == 'ja' ? '消す' : 'Erase') + ' (CTRL+X)"><i class="fa">&#xf12d;</i></button>'+
                '<button class="button icon-only" onclick="KanjiCanvas.deleteLast(this.dataset.canvas)" data-canvas="canvas-' + n + '" title="' + (GenkiLang == 'ja' ? '取り消す' : 'Undo') + ' (CTRL+Z)"><i class="fa">&#xf0e2;</i></button>'+
                (Genki.debug ? '<button class="button icon-only" onclick="console.log(KanjiCanvas.recognize(this.dataset.canvas));" data-canvas="canvas-' + n + '" title="' + (GenkiLang == 'ja' ? 'テストする' : 'Test Recognition') + ' (CTRL+F)"><i class="fa">&#xf188;</i></button>' : '')+
              '</div>'+
            '</div>';
            ++Genki.stats.problems;
            ++n; // increment unique canvas id
          }

          quiz += '</div>'; // close the row
          columns = o.columns; // reset column value for next iteration
        }

        // add the quiz to the document
        zone.innerHTML = quiz + '</div>' + Genki.lang.check_answers.replace('()', '(false, \'drawing\')').replace('</div>', 
          '<button id="toggle-tracing-guide" class="button" onclick="Genki.toggle.tracingGuide(this);"><i class="fa">&#xf031;</i><span class="en">' + (guideHidden ? 'Show' : 'Hide') + ' Tracing Guide</span><span class="ja">トレースのガイドを' + (guideHidden ? '表示' : '非表示') + 'する</span></button>'+
          '<button id="toggle-stroke-numbers" class="button" onclick="Genki.toggle.strokeNumbers(this);" style="display:none;"><i class="fa">&#xf162;</i><span class="en">Show Stroke Numbers</span><span class="ja">画数を表示する</span></button>' + '</div>'
        );
        
        // initialize all canvases
        for (var c = document.querySelectorAll('.kanji-canvas'), i = 0, j = c.length; i < j; i++) {
          KanjiCanvas.init(c[i].id);
        }
      }
      
      
      // restore prior answers for written quizzes, if selected
      if (Genki.currentAnswers) {
        if (o.type == Genki.currentAnswers.type) { // only apply answers for same type!
          for (var a = document.querySelectorAll('.writing-zone-input'), i = 0, j = a.length; i < j; i++) {
            a[i].value = Genki.currentAnswers.list[i];
          }
        }
        
        // delete the freshly applied answers to prevent reapplication, if not selected or all answers were correct
        delete Genki.currentAnswers;
      }


      // # DRAG AND DROP FUNCTIONALITY #
      if (o.type == 'drag' || o.type == 'kana') {
        // setup drag and drop
        var drake = dragula([document.querySelector('#answer-list')], {
          isContainer : function (el) {
            return el.classList.contains('quiz-answer-zone');
          }
        });
        
        // events during drag
        drake.on('drag', function (el) {
          // hide overflow during drag for touch screens
          if (Genki.isTouch && Genki.isTouching && document.body.style.overflow != 'hidden') {
            document.body.style.overflow = 'hidden';
          }

          // unmark marked items
          if (Genki.markedItem) {
            Genki.markedItem.className = Genki.markedItem.className.replace(' markedItem', '');
            Genki.markedItem = null;
          }
          
          // mark the draggable element
          Genki.markedItem = el;
          el.className += ' markedItem';
        });
        
        if (Genki.isTouch) {
          // restore overflow on drag cancel (touchscreens only)
          drake.on('cancel', function () {
            document.body.style.overflow = '';
          });
        }

        // check if the answer is correct before dropping the element
        drake.on('drop', function (el, target, source) {
          if (Genki.isTouch) document.body.style.overflow = ''; // restore overflow
          if (target.dataset.text) { // makes sure the element is a drop zone (data-text == data-answer)

            // if the answer is wrong we'll send the item back to the answer list
            if (el.dataset.answer != target.dataset.text) {
              document.getElementById('answer-list').appendChild(el);
              
              // global mistakes are incremented along with mistakes specific to problems
              target.dataset.mistakes = ++target.dataset.mistakes;
              
              // allows to see how many times target was gotten wrong while overall answers wrong number isn't bloated
              target.dataset.mistakes > 1 ? Genki.stats.mistakes : ++Genki.stats.mistakes;

            } else {
              target.className += ' answer-correct';
              
              // unmark the marked item that was dropped
              if (Genki.markedItem) {
                Genki.markedItem.className = 'quiz-item';
                Genki.markedItem = null;
              }
              // when all problems have been solved..
              // stop the timer, show the score, and congratulate the student
              if (++Genki.stats.solved == Genki.stats.problems) {
                Genki.endQuiz();
              }
            }
          }
        });

        Genki.drake = drake;
        
        // event listeners for marking and dropping answers with either a click or the 'Enter' key being pressed
        if (!Genki.globalEventListenersSet) { 
          Genki.globalEventListenersSet = true; // prevents duplication of event listeners on Genki.reset();
          
          ['click', 'keypress'].forEach(function (eventName) {
            document.addEventListener(eventName, function (e) {
              // if the event was a keypress and the key was not enter, bail out (same if the quiz is over)
              if (e.type == 'keypress' && e.key != 'Enter' || Genki.quizOver) {
                return;
              }

              // check parentNode if no match (up to 3 times; e.g. 4-1: the initial element is not counted)
              // necessary as some quiz-items contain child nodes that go as deep as 3 nodes
              var target = e.target, n = 4, m = n - 1;
              while (n --> 0) {
                if (n < m) target = target.parentNode ? target.parentNode : target;
                
                // break out if match found
                if (/quiz-item$|quiz-answer-zone/.test(target.className)) break;
              }

              // mark the currently active quiz item
              if (/quiz-item/.test(target.className) && target.parentNode.id == 'answer-list') {
                // unmark the last active quiz item
                if (Genki.markedItem) {
                  Genki.markedItem.className = Genki.markedItem.className.replace(' markedItem', '');
                }

                // mark the new active one
                Genki.markedItem = target;
                Genki.markedItem.className += ' markedItem';
              }

              // attempt dropping the marked quiz item to an answer zone
              else if (Genki.markedItem && /quiz-answer-zone/.test(target.className)) {
                // wrong answer
                if (Genki.markedItem.dataset.answer != target.dataset.text) {
                  // remove the old notification
                  if (Genki.wrongTimeout) {
                    document.getElementById('wrongAnswer').id = '';
                    clearTimeout(Genki.wrongTimeout);
                    delete Genki.wrongTimeout;
                  }

                  // if the answer is wrong we'll display a small notification using CSS (see #wrongAnswer in stylesheet.css)
                  target.id = 'wrongAnswer';

                  // remove the notification after 1 second
                  Genki.wrongTimeout = setTimeout(function () {
                    document.getElementById('wrongAnswer').id = '';
                    delete Genki.wrongTimeout;
                  }, 1000);

                  // global mistakes are incremented along with mistakes specific to problems
                  target.dataset.mistakes = ++target.dataset.mistakes;
                  ++Genki.stats.mistakes;

                } 

                // correct answer
                else {
                  target.className += ' answer-correct';
                  target.appendChild(Genki.markedItem);

                  // prevent the correct answer from being tabbed to
                  // this also includes the element we just added
                  target.tabIndex = -1;
                  target.firstChild.tabIndex = -1;

                  Genki.markedItem.className = Genki.markedItem.className.replace(' markedItem', '');
                  Genki.markedItem = null;

                  // when all problems have been solved..
                  // stop the timer, show the score, and congratulate the student
                  if (++Genki.stats.solved == Genki.stats.problems) {
                    Genki.endQuiz();
                  }
                }
              }

              // no conditions met, unmark the currently marked item
              else if (Genki.markedItem) {
                Genki.markedItem.className = Genki.markedItem.className.replace(' markedItem', '');
                Genki.markedItem = null;
              }

              // blur drop zone if clicking (clears confusion that one can mark a drop zone, then click a quiz item to drop it there)
              if (e.type == 'click' && /quiz-answer-zone/.test(e.target.className)) {
                e.target.blur();
              }
            });
          });
        }
      }


      // exercise timer
      var timer = new Timer(),
          clock = document.getElementById('quiz-timer');

      clock.innerHTML = '00:00:00'; // placeholder
      timer.start();
      timer.addEventListener('secondsUpdated', function (e) {
        clock.innerHTML = timer.getTimeValues().toString()
      });

      Genki.timer = timer;

      if (storageOK && localStorage.timerAutoPause != 'false') {
        document.addEventListener("visibilitychange", Genki.startOrPauseTimerByVisibility);
      }

      // indicate the exercise has been loaded in
      document.getElementById('exercise').className += ' content-loaded ' + (o.type == 'stroke' ? 'stroke-quiz multi' : o.type) + '-quiz';

      // jump to the exercise title
      Genki.scrollTo('#exercise-title', true);
      
      // add dictionary for looking up words, but not for vocab exercises, since that would be cheating!
      // also disabled in the appendix 
      if (Genki.debug || (!/drag|kana|drawing|stroke/.test(o.type) && !Genki.appendix)) {
        if (Genki.debug || (o.format && !/vocab|kana|numbers/.test(o.format)) || !o.format) {
          Genki.quickJisho.create();
        }
      }
      
      // autofocus fallback (temp until Chromium fixes the autofocus bug)
      if (o.type == 'fill' || o.type == 'writing') {
        var autofocus = document.querySelector('[autofocus]');
        
        if (autofocus && autofocus != document.activeElement) {
          autofocus.focus();
          
          // lets us know if the fallback is still being used
          Genki.debug && console.warn('autofocus failed: HTMLElement.focus() will be used as a fallback.');
        }
      }
      
      // autofocus answer options
      if (o.type == 'multi') {
        var q = document.querySelector(document.querySelector('.spoiler-mode') ? '.vocab-spoiler-toggle' : '.quiz-multi-answer');
        if (q) q.focus();
      }
      
      // audio events
      for (var a = document.querySelectorAll('AUDIO'), i = 0, j = a.length; i < j; i++) {
        // pause all audio elements that are current playing and only plays the one that was just clicked
        a[i].onplay = function () {
          for (var a = document.querySelectorAll('AUDIO'), i = 0, j = a.length; i < j; i++) {
            if (a[i] != this && !a[i].paused) {
              a[i].pause();
            }
          }
        };
        
        // logs time to console for debugging; mainly used for adding time stamps to the play buttons in listening exercises
        if (Genki.debug) { // debug mode only
          a[i].ontimeupdate = function () {
            console.log(this.id, this.currentTime);
          };
        }
      }
    },


    // increment the progress bar (for multi-choice quizzes)
    incrementProgressBar : function () {
      var bar = document.getElementById('quiz-progress-bar'),
          progress = Math.floor((Genki.stats.solved+1) / Genki.stats.problems * 100);

      bar.style.width = progress + '%';
      bar.innerHTML = '<span id="quiz-progress-text">' + (Genki.stats.solved+1) + '/' + Genki.stats.problems + '</span>';
    },


    // show the next question in a multi-choice quiz
    progressQuiz : function (answer, exclude, flag) {
      // prevent quiz progression while text selection mode is enabled or the quiz is over
      if (Genki.textSelectMode || Genki.quizOver) {
        return false;
      }
      
      // standard quiz progression
      if (answer == 'init') {
        document.getElementById('quiz-q' + Genki.stats.solved).style.display = '';
        Genki.incrementProgressBar();

      } else {
        // set the canvas as the answer if doing a stroke order exercise
        if (answer && flag == 'stroke') {
          var kanji = KanjiCanvas.recognize(answer.dataset.canvas), index; // find kanji with the given strokes
          
          // set the answer item as the canvas
          answer = answer.parentNode.parentNode.querySelector('.kanji-canvas');
          
          // debugging (logs info about matched kanji, match index, and whether the answer was correct or not)
          Genki.debug && console.log('toDraw: ' + answer.dataset.kanji);
          Genki.debug && console.log('Results: ' + kanji);
          Genki.debug && console.log('Correct: ' + (new RegExp(answer.dataset.kanji).test(kanji) && answer.dataset.strokesAnswer == answer.dataset.strokes).toString());
          
          // mark the answer as correct or incorrect depending on: 1. the kanji presence and 2. the number of strokes.
          answer.dataset.answer = new RegExp(answer.dataset.kanji).test(kanji) && answer.dataset.strokesAnswer == answer.dataset.strokes;
        }
        
        // mark the selected answer for reviews
        answer.className += ' selected-answer';

        // hide NEXT button for read-only questions
        if (exclude) {
          answer.parentNode.className += ' hidden-answer';
        }

        // increment mistakes if the chosen answer was wrong and add a class to the parent
        if (answer.dataset.answer == 'false') {
          answer.parentNode.parentNode.className += ' wrong-answer';
          ++Genki.stats.mistakes;
        }

        // if there's another question, show it and hide the last one
        var last = document.getElementById('quiz-q' + Genki.stats.solved++),
            next = document.getElementById('quiz-q' + Genki.stats.solved);
        
        if (next) {
          // instantly show if the answer was wrong or correct
          if (Genki.feedbackMode == 'instant' && Genki.active.type == 'multi') {
            // cache for nodes used in instant feedback mode
            if (!Genki.multiNodes) {
              Genki.multiNodes = {
                list : document.getElementById('question-list'),
                button : document.getElementById('next-button'),
                next : null,
                last : null
              };
            }
            
            // prevent reanswering questions (by initiating "quiz ended" state) + show the next button
            Genki.quizOver = true;
            Genki.multiNodes.list.className += ' multi-quiz quiz-over';
            Genki.multiNodes.button.style.visibility = 'visible';
            Genki.multiNodes.button.firstChild.focus(); // focus next button
            
            // cache these for use with showNextQuestion()
            Genki.multiNodes.next = next;
            Genki.multiNodes.last = last;
          }
          
          // classic progression (answers shown only at end)
          else {
            next.style.display = ''; // show the next question
            last.style.display = 'none'; // hide the prior question
            
            // focus answer for next question
            var q = next.querySelector(document.querySelector('.spoiler-mode') ? '.vocab-spoiler-toggle' : '.quiz-multi-answer');
            if (q) q.focus();
            
            Genki.incrementProgressBar();
          }

        } else { // end the quiz if there's no new question
          Genki.endQuiz(flag == Genki.QuizType.STROKE ? flag : Genki.QuizType.MULTI);

          // show all questions and answers
          for (var q = document.querySelectorAll('[id^="quiz-q"]'), i = 0, j = q.length; i < j; i++) {
            q[i].style.display = '';
          }

          // hide the progress bar
          document.getElementById('quiz-progress').style.display = 'none';
        }
      }
      
      // initialize canvas for stroke order quizzes
      if (flag == 'stroke' && document.getElementById('canvas-' + Genki.stats.solved)) {
        KanjiCanvas.init('canvas-' + Genki.stats.solved);
      }
    },
    
    // proceeds to next question without interacting with answer values (mainly used for instant feedback mode)
    showNextQuestion : function (caller) {
      // hide prev question + show next one
      Genki.multiNodes.next.style.display = '';
      Genki.multiNodes.last.style.display = 'none';
      
      // restore active quiz state (not ended) + hide next button
      Genki.quizOver = false;
      Genki.multiNodes.list.className = Genki.multiNodes.list.className.replace(' multi-quiz quiz-over', '');
      Genki.multiNodes.button.style.visibility = 'hidden';
      
      // focus answer for next question
      var q = Genki.multiNodes.next.querySelector(document.querySelector('.spoiler-mode') ? '.vocab-spoiler-toggle' : '.quiz-multi-answer');
      if (q) q.focus();
      
      // increment progress
      Genki.incrementProgressBar();
    },


    // ends the quiz
    endQuiz : function (type) {
      Genki.quizOver = true; // marks quiz as over
      
      // type value adjustments
      type = type == 'drawing' ? 'stroke' : type; // changes type to "stroke" for drawing practice, since they share many traits.
      
      // calculate the total score based on problems solved and mistakes made
      var solved = Genki.stats.solved - Genki.stats.exclude,
          problems = Genki.stats.problems - Genki.stats.exclude;

      Genki.stats.score = Math.floor((solved - Genki.stats.mistakes) * 100 / problems);
      Genki.timer.stop();

      // hide the timer and store it so we can show the completion time in the results
      var timer = document.getElementById('quiz-timer');
      timer.style.display = 'none';

      // show the student their results
      document.getElementById('quiz-result').innerHTML = 
      '<div id="complete-banner" class="center"><span class="en">Quiz Complete!</span><span class="ja">テスト終了！</span></div>'+
      '<div id="result-list">'+
        '<div class="result-row"><span class="result-label"><span class="en">Problems Solved:</span><span class="ja">問題を解いた：</span></span>' + problems + '</div>'+
        '<div class="result-row"><span class="result-label"><span class="en">Answers Wrong:</span><span class="ja">不正解の問題：</span></span>' + Genki.stats.mistakes + '</div>'+
        '<div class="result-row"><span class="result-label"><span class="en">Score:</span><span class="ja">得点：</span></span>' + Genki.stats.score + '%</div>'+
        '<div class="result-row"><span class="result-label"><span class="en">Completion Time:</span><span class="ja">かかった時間：</span></span>' + timer.innerHTML + '</div>'+
        '<div class="result-row center">'+
          ( // depending on the score, a specific message will show
            Genki.stats.score == 100 ? '<span class="en">PERFECT! Great Job, you have mastered this quiz! Feel free to move on or challenge yourself by trying to beat your completion time.</span><span class="ja">満点！たいへんよくできました！</span>' :
            Genki.stats.score > 70 ? '<span class="en">Nice work!</span><span class="ja">よくできました！</span> ' + Genki.lang[type ? type + '_mistakes' : 'mistakes'] :
            '<span class="en">Keep studying!</span><span class="ja">頑張りましょう！</span> ' + Genki.lang[type ? type + '_mistakes' : 'mistakes']
          )+
          (document.querySelector('.alt-phrase') ? '<br><br>' + Genki.lang.sub_answers : '')+
          '<div class="center">'+
            (
              /\/dictionary\//.test(window.location) ? Genki.lang.back_to_dict :
              '<button class="button" onclick="Genki.reset();"><i class="fa">&#xf021;</i><span class="en">Try Again</span><span class="ja">やり直す</span></button>'
            )+
            '<button class="button" onclick="Genki.breakTime();"><i class="fa">&#xf0f4;</i><span class="en">Take a Break</span><span class="ja">休憩する</span></button>'+
            '<a href="' + document.getElementById('home-link').href + '" class="button"><i class="fa">&#xf015;</i><span class="en">Back to Index</span><span class="ja">トップページに戻る</span></a>'+
          '</div>'+
        '</div>'+
      '</div>';

      // save results in local storage
      if (storageOK && Genki.active.exercise.length > 0 && !/appendix|study-tools/.test(Genki.active.exercise[0])) {
        var lesson = Genki.active.exercise[0],
            genkiEdition = localStorage.GenkiEdition,
            lessonsResults = JSON.parse(localStorage.Results);
        
        if(!lessonsResults[genkiEdition]) lessonsResults[genkiEdition] = {};
        
        var editionLessonsResults = lessonsResults[genkiEdition];
        editionLessonsResults[lesson] = (typeof editionLessonsResults[lesson] == 'undefined' || Genki.stats.score > editionLessonsResults[lesson]) ? Genki.stats.score : editionLessonsResults[lesson];

        localStorage.Results = JSON.stringify(lessonsResults);

        // refresh the exercise list with the new results
        Genki.create.removeExerciseList();
        Genki.create.exerciseList();
        
        // shows data backup reminder if 10 or more exercises were completed
        if (localStorage.dataBackupReminder == 'true' || localStorage.dataBackupReminder == undefined) {
          if (++Genki.dataBackupReminderCount >= 10) {
            Genki.dataBackupReminderCount = 0;
            setTimeout(function() {
              GenkiModal.open({
                title : '<span class="en">Backup Exercise Score Data?</span><span class="ja">練習の得点データを保存しますか？</span>',
                content : '<span class="en">You\'ve recently completed 10 exercises. Would you like to backup your exercise score data?</span><span class="ja">練習が10回終わりました。練習の得点データを保存しますか？</span><br><br>'+
                '<div class="center">'+
                  '<a id="save-exercise-data" class="button" download="Genki Exercise Score Data.txt" href="data:text/plain;charset=utf-8,' + (storageOK && localStorage.Results ? encodeURIComponent(localStorage.Results.replace(/\n/g, '\r\n')) : '') + '"><i class="fa">&#xf019;</i><span class="en">Save Data</span><span class="ja">セーブする</span></a><br><br>'+
                  '<div title="' + (GenkiLang == 'ja' ? 'このポップアップを無効にします。\nデータを保存するリマインダーが再有効にしたいなら設定で有効にできます。' : 'Stops this popup from showing every 10 exercises.\nYou can re-enable the data backup reminder via the settings manager. ') + '">'+
                    '<input id="modal-data-backup-reminder" class="genki_input_hidden" type="checkbox" onchange="localStorage.dataBackupReminder = this.checked == true ? false : true;">'+
                    '<span tabindex="0" class="genki_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
                    '<label class="checkbox-label" for="modal-data-backup-reminder"><span class="en">Disable Data Backup Reminders</span><span class="ja">データを保存するリマインダーを無効にする</span></label><br><br>'+
                  '</div>'+
                  '<div>'+
                    '<div class="donate-box clear">'+
                      '<div class="donate-icon"><i class="fa">&#xf004;</i></div>'+
                      '<div class="donate-text">If Genki Study Resources has helped you with your studies, please also consider <a href="' + getPaths() + 'donate/' + Genki.local + '" target="_blank">making a donation <i class="fa">&#xf08e;</i></a> if you can, to help support the continued development and maintenance of these resources. Your support is greatly appreciated!</div>'+
                    '</div>'+
                  '</div>'+
                '</div>',
                zIndex : 'low',
                focus : '#save-exercise-data'
              });
            }, 100);
          }
          // save count for other pages
          localStorage.dataBackupReminderCount = Genki.dataBackupReminderCount;
        }
      }
      
      // changes display over certain buttons
      if (type == 'stroke')  {
        document.getElementById('toggle-stroke-numbers').style.display = '';
        document.getElementById('toggle-tracing-guide').style.display = 'none';
      }
      
      // kill drag event handlers
      if (Genki.drake) {
        // slight delay is required, otherwise an error is thrown
        setTimeout(function () {
          Genki.drake.destroy();
          delete Genki.drake;
        }, 100);
      }
      
      // hide change exercise type button
      var changeType = document.getElementById('change-exercise-type-container');
      if (changeType) changeType.style.display = 'none';

      // this class will indicate the quiz is over so post-test styles can be applied
      document.getElementById('exercise').className += ' quiz-over';
      Genki.scrollTo('#complete-banner', true); // jump to the quiz results
    },
    
    
    // resets exercise state, allowing students to redo quizzes without reloading the page
    reset : function (skipModal) {
      if (window.JSON) {
        // written answer preservation permission
        if (!skipModal && /fill-quiz|writing-quiz/.test(document.getElementById('exercise').className) && Genki.stats.mistakes > 0) {
          return GenkiModal.open({
            title : '<span class="en">Try again with your current answers?</span><span class="ja">前の答えを保存してやり直しますか？</span>',
            content : '<div><span class="en">Would you like to try again with your current answers? This will allow you to correct the answers you got wrong while preserving what you have already written.</span><span class="ja">前の答えを保存してやり直しますか？不正解の答えを修正することができます。</span></div><br>'+
            '<div><span class="en">※ Please note that your answers will be lost if you change the page or exercise type.</span><span class="ja">※ページや練習型を変更すると、答えは失われますのでご注意ください。</span></div>',
            buttonHTML : '<span class="en">Yes</span><span class="ja">はい</span>',
            closeButtonText : '<span class="en">No</span><span class="ja">いいえ</span>',
            customButton : '<button id="genki-modal-cancel" class="button" onclick="GenkiModal.close();"><span class="en">Cancel</span><span class="ja">戻る</span></button>',
            keepOpen : true,

            callback : function () {
              // get and cache current answers
              for (var currentAnswers = [], a = document.querySelectorAll('.writing-zone-input'), i = 0, j = a.length; i < j; i++) {
                currentAnswers.push(a[i].value);
              }
              
              // temporarily cache the answers and previous exercise type (in case of mulitple types, we can check and apply the answers or not)
              Genki.currentAnswers = {
                type : /fill-quiz/.test(document.getElementById('exercise').className) ? 'fill' : 'writing',
                list : currentAnswers
              };
              
              GenkiModal.close();
              Genki.reset(true);
            },
            
            closeCallback : function () {
              GenkiModal.close();
              Genki.reset(true);
            }
          });
        }
        
        // reset data
        Genki.exerciseComplete = false;
        Genki.quizOver = false;
        Genki.isTouching = false;
        Genki.textSelectMode = false;
        Genki.strokeNumberDisplay = false;
        Genki.markedItem = null;
        Genki.stats = {
          problems : 0,
            solved : 0,
          mistakes : 0,
             score : 0,
           exclude : 0
        };
        
        if (Genki.multiNodes) {
          delete Genki.multiNodes;
        }
        
        // stop timer
        Genki.timer.isRunning() && Genki.timer.stop();
        
        // reset quick dictionary state
        if (Genki.quickJisho.cache) {
          !Genki.quickJisho.hidden && Genki.quickJisho.toggle();
          Genki.quickJisho.search('');
          Genki.quickJisho.cache.search.value = '';
        }

        // hide exercise and reset contents
        var exercise = document.getElementById('exercise'),
            img = document.querySelector('.multi-quiz-image');
        
        exercise.className = 'content-block';
        exercise.innerHTML = document.getElementById('exercise-title').outerHTML + '<div id="quiz-result"></div><div id="quiz-zone" class="clear"></div>' + (img ? img.outerHTML : '') + '<div id="quiz-timer" class="center"></div>' + document.querySelector('.more-exercises').outerHTML;
        
        // things to do depending on the page
        // appendix
        if (Genki.appendix) {
          // hide/show main containers
          exercise.style.display = 'none'; // hides exercise
          document.getElementById('appendix-tool').style.display = ''; // shows tools
          
          // scroll to the main titles
          Genki.scrollTo(/\/dictionary\//.test(window.location) ? '#practice-words' : '.title');
          
          // launch exercise prompt based on the current page
          if (/\/dictionary\//.test(window.location)) Genki.appendix.jisho.launchExercise();
          else if (/\/map-of-japan\//.test(window.location)) Genki.appendix.studyMap();
          else if (/\/numbers-chart\//.test(window.location)) Genki.appendix.studyChart('numbers');
          else if (/\/conjugation-chart\//.test(window.location)) Genki.appendix.studyChart('conjugation');
        } 
        
        // study tools
        else if (Genki.tools) {
          // similar to appendix; see above comments
          exercise.style.display = 'none';
          document.getElementById('study-tool-editor').style.display = '';
          Genki.scrollTo('.title');
        }
        
        // standard quizzes
        else {
          Genki.generateQuiz(JSON.parse(Genki.exerciseData));
        }
        
      } else {
        window.location.reload(); // reloads the page if unable to use JSON to reset quizzes
      }
    },
    
    
    // allows the student to take a break before trying again
    breakTime : function () {
      GenkiModal.open({
        title : '<span class="en">Take a Break?</span><span class="ja">休憩しますか？</span>',
        content : '<span class="en">Taking a break and waiting before trying again can greatly help with building your memory. 5 to 10 minute breaks are recommended, but you\'re free to adjust the time to your liking.' + (/"format":"vocab"/.test(Genki.exerciseData) ? ' Please see <a href="' + getPaths() + 'help/vocab-memorization/' + Genki.local + '" target="_blank">this page</a> for more tips on memorizing vocab.' : '') + '</span><span class="ja">休憩してからもう一度やってみると記憶力のために役立ちます。５、１０分の休憩がおすすめですが、お好みの時間が調整できます。' + (/"format":"vocab"/.test(Genki.exerciseData) ? '単語を暗記するためのヒントには<a href="' + getPaths() + 'help/vocab-memorization/' + Genki.local + '" target="_blank">このページ</a>をご覧ください。' : '') + '</span><br><br>'+
        '<div class="center"><span class="en">Wait </span><span class="ja">待つ時間：</span><input id="break-minutes" class="center" type="number" value="' + Genki.breakTimer[Genki.breakMultiplier] + '" min="1" max="60" onchange="Genki.changeBreakMultiplier(this);"> <span class="en">Minute(s)</span><span class="ja">分</span></div>',
        buttonHTML : '<span class="en">Wait</span><span class="ja">待つ</span>',
        keepOpen : true,
        
        // initializes the break timer
        callback : function () {
          // increment default break time
          if (Genki.breakMultiplier < (Genki.breakTimer.length - 1)) {
            // automatically hide furigana for the 3rd session (if time is set manually, this is ignored)
            if (Genki.breakMultiplier == 2 && !Genki.breakTimerCustom) {
              var f = document.getElementById('toggle-furigana');
              if (f && /helper-present/.test(document.getElementById('quiz-zone').className) == true) {
                f.click();
              }
            }
            
            
            Genki.breakMultiplier++;
          }
          
          // request permission to show a notification when break time is up
          if (!Genki.local && Genki.canNotify && !/denied|granted/.test(Notification.permission)) {
            Notification.requestPermission();
          }
          
          var time = +document.getElementById('break-minutes').value, n;
          
          // corrects time
          if (time > 60) {
            time = 60;
          } else if (time <= 0) {
            time = 1;
          }
          
          // opens the break modal
          GenkiModal.open({
            title : '<span class="en">Taking a Break</span><span class="ja">休憩中</span>',
            content : '<div id="break-timer" class="center">00:' + (time < 10 ? '0' : '') + time + ':00</div>',
            buttonHTML : '<span class="en">End Break Time</span><span class="ja">休憩を終了する</span>',
            keepOpen : Genki.appendix || (!Genki.tools && /"format"/.test(Genki.exerciseData)) ? true : false,
            
            // reloads the current exercise
            callback : function () {
              Genki.reset();
              document.body.className = document.body.className.replace(' taking-a-break', '');
            }
          });
          
          document.body.className += ' taking-a-break'; // adjusts the style and functionality of the modal
          
          // turns the overlay into a soothing backround
          n = Math.floor(Math.random() * 10) + 1;
          document.getElementById('genki-modal-overlay').style.backgroundImage = 'url(../../../resources/images/backgrounds/bg-' + (n < 10 ? '0' : '') + n + '.jpg)';
          
          // initialize timer
          var timer = new Timer(),
              clock = document.getElementById('break-timer');

          timer.start({
            startValues : { minutes : time },
            target : { seconds : 0 },
            countdown : true
          });
          
          // update the timer
          timer.addEventListener('secondsUpdated', function (e) {
            var timeString = timer.getTimeValues().toString();
            clock.innerHTML = timeString;
            
            // break time ends
            if (timeString == '00:00:00') {
              clock.innerHTML = '<span class="en">Break time is up!</span><span class="ja">休憩が終了しました！</span><div style="font-size:15px;"><span class="en">Click the button below to resume your studies.</span><span class="ja">勉強を続けるために下のボタンをクリックしてください。</span></div>';
              document.getElementById('genki-modal-ok').style.display = 'inline-block';
              
              // notify the user that break time has ended
              if (!Genki.local && Genki.canNotify && Notification.permission == 'granted') {
                var notif = new Notification(document.title.replace(/ \| Genki Study Resources.*$/, ''), {
                  body : GenkiLang == 'ja' ? '休憩が終了しました！' : 'Break time is up!',
                  icon : document.querySelector('meta[property="og:image"]').content,
                  tag : 'breakTime-' + Genki.active.index
                });
                
                // focus the tab
                notif.onclick = function () {
                  window.focus();
                  this.close();
                };
              }
            }
          });
        }
      });
    },
    
    // break time increments based on number of breaks taken (limited to 8 break periods (4hrs total) + 10 study sessions (avg per sesson is about 2-5 mintues))
    // studying over this period of time seems to greatly help with retention, so long as you utilize the vocab afterwards by reading, writing, etc.
    breakMultiplier : 0,
    breakTimer : [
      5,
      10,
      15, // recommended to hide furigana after this point (done automatically if timer isn't manually set)
      20,
      30,
      40,
      50,
      60 // review vocab once more, then wait a day or two to review to check retention (reading anytime after this period is fine)
    ],
    
    breakTimerCustom : false, // tells if time was set manually by the user so furigana state remains untouched
    
    // adjusts break multiplier based on user input
    changeBreakMultiplier : function (caller) {
      var n = Number(caller.value);
      
      if (n <= 5) {
        Genki.breakMultiplier = 0;
      } else if (n <= 10) {
        Genki.breakMultiplier = 1;
      } else if (n <= 15) {
        Genki.breakMultiplier = 2;
      } else if (n <= 20) {
        Genki.breakMultiplier = 3;
      } else if (n <= 30) {
        Genki.breakMultiplier = 4;
      } else if (n <= 40) {
        Genki.breakMultiplier = 5;
      } else if (n <= 50) {
        Genki.breakMultiplier = 6;
      } else if (n <= 60) {
        Genki.breakMultiplier = 7;
      }
      
      Genki.breakTimerCustom = true;
    },
    

    // places draggable items into their correct places
    // allows the student to review meanings without having to consult their textbook
    review : function () {
      // ask for confirmation, just in case the button was clicked by accident
      GenkiModal.open({
        title : '<span class="en">Activate Review Mode?</span><span class="ja">単語を復習しますか？</span>',
        content : '<span class="en">Are you sure you want to review? Your current progress will be lost.</span><span class="ja">今までの進み具合は失われます。よろしいですか？</span>',
        
        callback : function () {
          var a = document.querySelectorAll('[data-answer]'),
              i = 0,
              j = a.length;

          for (; i < j; i++) {
            document.querySelector('[data-text="' + a[i].dataset.answer + '"]').appendChild(a[i]);
          }

          // stop and hide timer + drag/drop
          Genki.timer.stop();
          Genki.drake.destroy();
          document.getElementById('quiz-timer').style.display = 'none';

          // show restart button
          document.getElementById('review-exercise').innerHTML = (
            /\/dictionary\//.test(window.location) ? Genki.lang.back_to_dict :
            '<button class="button" onclick="Genki.reset();"><i class="fa">&#xf021;</i><span class="en">Restart</span><span class="ja">リセットする</span></button>'
          ) + (document.querySelector('.drag-quiz') ? Genki.lang.toggle_furigana + document.getElementById('toggle-orientation').outerHTML : '');

          // change the quiz info
          document.getElementById('quiz-info').innerHTML = '<span class="en">You are currently in review mode; go ahead and take your time to study. When you are ready to practice this exercise, click the "restart" button.</span><span class="ja">復習モードになっていますので、ゆっくり勉強してください。復習し終わったら「リセットする」をクリックしてください。</span>';
          document.getElementById('quiz-zone').className += ' review-mode';
          
          // hide change exercise type button
          var changeType = document.getElementById('change-exercise-type-container');
          if (changeType) changeType.style.display = 'none';
        }
      });
    },
    
    
    // converts to half-width characters if full-width (e.g. ＡＢＣ --> ABC)
    // used in check.answers to reduce erroneous incorrect answers due to usage of full-width characters.
    toHalfWidth : function (str) {
      return str.replace(/[\uFF01-\uFF5E]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
      });
    },
    
    
    // functions that check the value of input fields
    check : {
      // checks the value of the current input and automatically moves onto the next input if the value is correct
      // speeds things up, so the student doesn't need to click or tab into the next input field
      busy : false, // prevents IMEs from triggering multiple input events when a value is correct
      value : function (input) {
        if (!Genki.check.busy && input.value == input.dataset.answer) {
          Genki.check.busy = true;
          
          var next = Genki.input.map[Genki.input.index + 1];

          // focuses the next input if available, otherwise it asks if the student wants to check their answers
          if (next) {
            next.focus();

          } else {
            window.setTimeout(function() { // delay required since final value seems to be erased when checked immediately
              input.blur();
              Genki.check.answers(true);
              Genki.check.busy = false;
            }, 10);
          }
        }
        
        // checks if currently busy processing the previous answer
        else if (Genki.check.busy) {
          window.setTimeout(function() { // delay required to prevent text duplication when proceeding to already filled inputs
            Genki.check.busy = false;
            
            // use `document.activeElement` over `input` as the latter causes previously input text to disappear on firefox
            if (document.activeElement && document.activeElement.value && document.activeElement.value == Genki.input.map[Genki.input.index - 1].value) { // clears up duplicated texts from IMEs on current input
              document.activeElement.value = '';
            }
          }, 10);
        }
      },
      
      
      // check the answers for writing exercises
      // mapEnded means the end of Genki.input.map was reached via Genki.check.value()
      answers : function (mapEnded, type) {
        !Genki.exerciseComplete && GenkiModal.open({
          title : '<span class="en">Check Answers?</span><span class="ja">答え合わせをしますか？</span>',
          content : mapEnded ? '<span class="en">The last input field has been filled in. Are you ready to check your answers?</span><span class="ja">最後の入力欄が入力されました。答え合わせをしてもよろしいですか？</span>' : '<span class="en">Checking your answers will end the quiz. Do you want to continue?</span><span class="ja">答え合わせをするとテストが終了します。よろしいですか？</span>',
          buttonHTML : '<span class="en">Yes, check my answers!</span><span class="ja">はい、答え合わせをしよう！</span>',
          
          callback : function () {
            Genki.exerciseComplete = true;

            // hide check answers button
            document.querySelector('#check-answers button').style.display = 'none';
            
            // kanji/kana drawing quizzes
            if (type && type == 'drawing') {
              var answer = document.querySelectorAll('.kanji-canvas'), i = 0, j = answer.length, kanji;
              
              for (; i < j; i++) {
                kanji = KanjiCanvas.recognize(answer[i].id); // find kanji with the given strokes
                
                // debugging (logs info about matched kanji, match index, and whether the answer was correct or not)
                Genki.debug && console.log('toDraw: ' + answer[i].dataset.kanji);
                Genki.debug && console.log('Results: ' + kanji);
                Genki.debug && console.log('Correct: ' + (new RegExp(answer[i].dataset.kanji).test(kanji) && answer[i].dataset.strokesAnswer == answer[i].dataset.strokes).toString());
                
                // correct answer
                if (new RegExp(answer[i].dataset.kanji).test(kanji) && answer[i].dataset.strokesAnswer == answer[i].dataset.strokes) {
                  answer[i].dataset.answer = true;
                } 
                
                // incorrect answer
                else {
                  answer[i].dataset.answer = false;
                  ++Genki.stats.mistakes;
                }
                
                ++Genki.stats.solved;
              }
            } 
            
            // standard written quizzes
            else {
              // loop over the inputs and check to see if the answers are correct
              var input = document.querySelectorAll('#exercise .writing-zone-input'),
                  i = 0, j = input.length, k, correct, val, data, answer, alt;

              for (; i < j; i++) {
                correct = false;
                data = input[i].dataset;
                val = Genki.toHalfWidth(input[i].value).toLowerCase().replace(/。|、|^\s+|\s+$|\n/g, '');

                // check for the correct answer
                for (k in data) {
                  if (/answer/.test(k)) {
                    answer = Genki.toHalfWidth(data[k]).toLowerCase().replace(/。|、|^\s+|\s+$|\n/g, '');
                    
                    // check if there's alternative answers in the answer
                    // alternative answers are given as %(alt1/alt2/etc.)
                    if (/%\(.*?\)/.test(answer)) {
                      alt = answer.replace(/.*?%\((.*?)\).*/, '$1').split('/');

                      // loop through alternatives
                      while (alt.length) {
                        if (val == answer.replace(/%\(.*?\)/, alt[0])) {
                          correct = true;
                          break; // break out if correct answer is found
                        }

                        alt.splice(0, 1); // remove the checked answer
                      }
                    } 

                    // otherwise check the answer normally
                    else if (val == answer) {
                      correct = true;
                    }

                    // break out of the loop when a correct answer is found 
                    if (correct) break;
                  }
                }

                // add classname to correct answers
                if (correct) {
                  input[i].parentNode.className += ' answer-correct';  
                }

                // increment mistakes if the answer is incorrect
                else {
                  ++data.mistakes;
                  ++Genki.stats.mistakes;

                  if (type == 'fill') {
                    input[i].parentNode.insertAdjacentHTML('beforeend', ('<span class="problem-answer">' + data.answer + (data.answer2 || data.furigana ? '<span class="secondary-answer' + (data.furigana ? ' furigana-only' : '') + '">' + (data.answer2 || data.furigana) + '</span>' : '') + '</span>').replace(/%\((.*?)\)/g, function (Match, $1) {
                      return '<span class="alt-phrase">(</span>' + $1.replace(/\//g, '<span class="alt-phrase-sep">/</span>') + '<span class="alt-phrase">)</span>'
                    }));
                  }
                }

                // increment problems solved
                ++Genki.stats.solved;

                // disable the input
                input[i].disabled = true;
              }
            }

            Genki.endQuiz(type ? type : Genki.QuizType.WRITING); // show quiz results
          }
        });
      }
    },

    
    // functions that toggle the display of elements
    toggle : {
      
      // toggle the exercise list
      exerciseList : function (button) {
        button.className = button.className == 'list-open' ? '' : 'list-open';
      },
      
      
      // toggles the display of lists
      list : function (el) {
        var closed = 'lesson-title',
            opened = closed + ' lesson-open';

        el.className = el.className == opened ? closed : opened;

        // close any open lists
        for (var a = el.parentNode.querySelectorAll('.lesson-title'), i = 0, j = a.length; i < j; i++) {
          if (a[i] != el) {
            a[i].className = closed;
          }
        }
      },
      
      
      // toggles furigana in drag and drop quizzes
      furigana : function (button) {
        var zone = document.getElementById('quiz-zone'),
            state = (storageOK && localStorage.furiganaVisible) || (/helper-hidden/.test(zone.className) ? 'false' : 'true');
        
        // hide or show the textual aids
        switch (state) {
          case 'true' :
            state = 'false';
            zone.className = zone.className.replace('helper-present', 'helper-hidden');
            button.innerHTML = button.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
            break;

          case 'false' :
            state = 'true';
            zone.className = zone.className.replace('helper-hidden', 'helper-present');
            button.innerHTML = button.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
            break;
            
          default :
            break;
        }
        
        // update button html
        Genki.lang.toggle_furigana = button.outerHTML;
        
        // save settings if supported
        if (storageOK) {
          localStorage.furiganaVisible = state;
        }
      },
      
      
      // toggles the vocab spoiler in multi-choice vocab
      vocabSpoiler : function (button) {
        var spoiler = button.nextSibling;

        // turn spoiler on
        if (/spoiler-off/.test(spoiler.className)) {
          spoiler.className = spoiler.className.replace('spoiler-off', '');
          button.innerHTML = button.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
        }

        // turn spoiler off
        else {
          spoiler.className += ' spoiler-off';
          button.innerHTML = button.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
        }
      },
      
      
      // toggles the orientation of drag and drop vocab from vertical-vertical to horizontal-horizontal
      vocabOrientation : function (button, customState) {
        var zone = document.getElementById('quiz-zone'),
            state = typeof customState !== 'undefined' ? customState : (storageOK && localStorage.vocabHorizontal) || (/vocab-horizontal/.test(zone.className) ? 'true' : 'false'),
            answer = document.querySelectorAll('.quiz-answer-zone'),
            i = 0,
            j = answer.length;
        
        // change the vocab orientation
        switch (state) {
          case 'true' :
            state = 'false';
            zone.className = zone.className.replace(' vocab-horizontal', '');
            button.innerHTML = button.innerHTML.replace('Vertical', 'Horizontal').replace('垂直', '水平');
            button.querySelector('i').style.transform = 'rotate(90deg)';
            
            // revert answer zones to their original positions
            for (var dropList = document.getElementById('drop-list'); i < j; i++) {
              dropList.appendChild(answer[i]);
            }
            
            break;
            
          case 'false' :
            state = 'true';
            zone.className += ' vocab-horizontal';
            button.innerHTML = button.innerHTML.replace('Horizontal', 'Vertical').replace('水平', '垂直');
            button.querySelector('i').style.transform = 'rotate(0deg)';
            
            // reposition answer zones
            for (var group = document.querySelectorAll('.quiz-item-group'); i < j; i++) {
              group[i].appendChild(answer[i]);
            }
            
            break;
            
          default :
            break;
        }
        
        // save settings if supported
        if (storageOK && !customState) {
          localStorage.vocabHorizontal = state;
        }
      },
      
      
      // toggles display of stroke numbers in stroke order quizzes
      strokeNumbers : function (button) {
        var zone = document.getElementById('quiz-zone');
        
        // hide or show the textual aids
        switch (Genki.strokeNumberDisplay) {
          case true :
            Genki.strokeNumberDisplay = false;
            button.innerHTML = button.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
            break;
            
          case false :
            Genki.strokeNumberDisplay = true;
            button.innerHTML = button.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
            break;
            
          default :
            break;
        }
        
        // redraw each canvas
        for (var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length; i < j; i++) {
          if (KanjiCanvas['canvas_' + a[i].id]) KanjiCanvas.redraw(a[i].id, false, Genki.strokeNumberDisplay);
        }
      },
      
      
      // toggles stroke order in stroke order quizzes
      strokeOrder : function (button) {
        var zone = document.getElementById('quiz-zone'),
            state = (storageOK && localStorage.strokeOrderVisible) || (/stroke-order-hidden/.test(zone.className) ? 'false' : 'true');
        
        // hide or show the textual aids
        switch (state) {
          case 'true' :
            state = 'false';
            zone.className = zone.className += ' stroke-order-hidden';
            button.innerHTML = button.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
            break;
            
          case 'false' :
            state = 'true';
            zone.className = zone.className.replace(' stroke-order-hidden', '');
            button.innerHTML = button.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
            break;
            
          default :
            break;
        }
        
        // save settings if supported
        if (storageOK) {
          localStorage.strokeOrderVisible = state;
        }
      },
      
      
      // toggles tracing guides in the stroke order quizzes
      tracingGuide : function (button, drawingPractice) {
        var zone = document.getElementById('quiz-zone'),
            state = storageOK && localStorage.tracingGuideVisible ? localStorage.tracingGuideVisible : 'true';
        
        // hide or show the tracing guides
        switch (state) {
          case 'true' :
            state = 'false';
            button.innerHTML = button.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
            break;
            
          case 'false' :
            state = 'true';
            button.innerHTML = button.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
            break;
            
          default :
            break;
        }
        
        // loop through and update the data-guide value and redraw each canvas
        var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length
        
        // Stroke Order loop
        if (!drawingPractice) {
          for (; i < j; i++) {
            a[i].dataset.guide = state;
            if (KanjiCanvas['canvas_' + a[i].id]) KanjiCanvas.redraw(a[i].id, true);
          }
        }
        
        // Drawing Practice loop
        else {
          for (var n = 0, kanji = ''; i < j; i++) {
            // resets counter if new row
            if (a[i].dataset.kanji != kanji) {
              kanji = a[i].dataset.kanji;
              n = 0;
            }
            
            // changes the guide state of the first 3 canvases
            if (n++ < 3) {
              a[i].dataset.guide = state;
              if (KanjiCanvas['canvas_' + a[i].id]) KanjiCanvas.redraw(a[i].id, true);
            }
          }
        }
        
        // save settings if supported
        if (storageOK) {
          localStorage.tracingGuideVisible = state;
        }
      },
      
      
      // toggles text selection for buttons in multi-choice quizzes
      textSelection : function (button) {
        var zone = document.getElementById('quiz-zone');
        
        // hide or show the textual aids
        switch (Genki.textSelectMode) {
          case true :
            Genki.textSelectMode = false;
            zone.className = zone.className.replace(' text-selection-mode', '');
            button.innerHTML = button.innerHTML.replace('Dis', 'En').replace('無', '有');
            break;
            
          case false :
            Genki.textSelectMode = true;
            zone.className = zone.className += ' text-selection-mode';
            button.innerHTML = button.innerHTML.replace('En', 'Dis').replace('有', '無');
            break;
            
          default :
            break;
        }
      }
    },

    
    // functions that create new functionality and adds it to the document
    // usually functions that are executed via init
    create : {
      
      // creates prev/next exercise buttons
      exerciseButtons : function () {
        var more = '<div class="more-exercises clear">',
            i = 2,
            a;

        while (i --> 0) {
          a = Genki.exercises[i == 1 ? Genki.active.index - 1 : Genki.active.index + 1]; // the prev/next exercise; i=1 is prev, i=0 is next

          // if there's a prev/next exercise we'll add the link to more
          if (a && !/^\.\.\//.test(a)) {
            a = a.split('|');

            // create the next/prev link
            more += '<a href="../../../' + Genki.ed + '/' + a[0] + '/' + Genki.local + Genki.debug + '" class="button ' + (i == 1 ? 'prev' : 'next') + '-ex" title="' + (i == 1 ? 'Previous' : 'Next') + ' exercise">' + a[1] + '</a>';
          }
        }

        // add the "more exercises" buttons to the document
        document.getElementById('quiz-timer').insertAdjacentHTML('afterend', more + '</div>');
      },

      // removes the exercise list when needed update without refreshing the page
      removeExerciseList : function () {
        var list = document.getElementById('exercise-list'),
            toggle = document.getElementById('toggle-exercises');
        
        if (list) list.parentNode.removeChild(list);
        if (toggle) toggle.parentNode.removeChild(toggle);
      },


      // creates the exercise list
      exerciseList : function () {
        var main = 
          '<div id="link-list" class="normal-block indent-block">'+
            '<div><a id="link-home" class="button" href="' + (getPaths() + (storageOK && localStorage.GenkiEdition == '3rd' ? 'lessons-3rd/' : '') + Genki.local) + '"><i class="fa">&#xf015;</i><span class="en">Home</span><span class="ja">トップページ</span></a></div>'+
            '<div><a id="link-grammar" href="' + getPaths() + 'lessons-3rd/appendix/grammar-index/' + Genki.local + '"><i class="fa">&#xf02d;</i><span class="en">Grammar Index</span><span class="ja">文法索引</span></a></div>'+
            '<div><a id="link-anki" href="' + getPaths() + 'help/anki-decks/' + Genki.local + '"><i class="fa">&#xf005;</i><span class="en">Anki Decks</span><span class="ja">Ankiのデッキ</span></a></div>'+
            '<div><a id="link-help" href="' + getPaths() + 'help/' + Genki.local + '"><i class="fa">&#xf059;</i><span class="en">Help &amp; FAQ</span><span class="ja">FAQ</span></a></div>'+
            '<div><a id="link-report" href="' + getPaths() + 'report/' + Genki.local + '"><i class="fa">&#xf188;</i><span class="en">Reports &amp; Feedback</span><span class="ja">フィードバックを送る</span></a></div>'+
            '<div><a id="link-download" href="' + getPaths() + 'download/' + Genki.local + '"><i class="fa">&#xf019;</i><span class="en">Download</span><span class="ja">ダウンロードする</span></a></div>'+
            '<div><a id="link-donate" href="' + getPaths() + 'donate/' + Genki.local + '"><i class="fa">&#xf004;</i><span class="en">Donate</span><span class="ja">支援する</span></a></div>'+
            '<div><a id="link-github" href="https://github.com/SethClydesdale/genki-study-resources"><i class="fa">&#xf09b;</i>GitHub</a></div>'+
            '<div><a id="link-settings" href="#genki-site-settings" onclick="GenkiSettings.manager(); return false;"><i class="fa">&#xf013;</i><span class="en">Settings</span><span class="ja">設定</span></a></div>'+
          '</div>'+
          '<div id="related" class="indent-block">'+
            '<h3><span class="en">Related Projects</span><span class="ja">関連のプロジェクト</span></h3>'+
            '<a href="https://sethclydesdale.github.io/tobira-study-resources/" title="Tobira Study Resources"><img src="' + getPaths() + 'resources/images/tobira-img.png" alt="Tobira Study Resources"></a>'+
            '<a href="https://sethclydesdale.github.io/quartet-study-resources/" title="Quartet Study Resources"><img src="' + getPaths() + 'resources/images/quartet-img.png" alt="Quartet Study Resources"></a>'+
            '<a href="https://sethclydesdale.github.io/colloquial-kansai-dictionary/" title="Colloquial Kansai Japanese"><img src="' + getPaths() + 'resources/images/kansai-img.png" alt="Colloquial Kansai Japanese"></a>'+
          '</div>';
        
        if (Genki.exercises) {
          var attrs = 'class="lesson-title" onclick="Genki.toggle.list(this);" onkeydown="event.key == \'Enter\' && Genki.toggle.list(this);" tabindex="0"', // lesson-title attrs
              list = 
              '<nav id="exercise-list">'+
                '<h3 class="main-title"><span class="en">Exercise List</span><span class="ja">練習問題一覧</span></h3>'+
                '<button id="random-exercise" class="button" onclick="Genki.randomExercise();" title="' + (GenkiLang == 'ja' ? 'ランダム練習' : 'Random Exercise') + '"><i class="fa">&#xf074;</i></button>'+
                '<div id="lessons-list"><h4 ' + attrs + '><span class="en">Page Links</span><span class="ja">ページリンク</span></h4><ul id="page-links">' + main + '</ul>',
              lesson = '\\.\\.\\/',
              i = 0,
              j = Genki.exercises.length,
              linkData,
              active,

              // vars for grouping sub-sections
              currentGroup,
              group = '',
              groups = /workbook-\d+|literacy-\d+|literacy-wb-\d+/,
              groupTitles = {
                workbook : 'Workbook',
                literacy : 'Reading and Writing',
                'literacy-wb' : 'Workbook: Reading and Writing'
              };


          if (storageOK) {
            localStorage.GenkiEdition = /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd';

            // Create storage for lessons results for specific edition
            if (!localStorage.Results || !new RegExp(localStorage.GenkiEdition).test(localStorage.Results)) {
              var results = localStorage.Results ? JSON.parse(localStorage.Results) : {};
              results[localStorage.GenkiEdition] = {};
              localStorage.Results = JSON.stringify(results);
            }
          }

          // loop over all the exercises and place them into their respectice lesson group
          for (; i < j; i++) {
            linkData = Genki.exercises[i].split('|');
            currentGroup = linkData[0].replace(/^lesson-\d+\/|-\d+$/g, '');

            // if the lesson group is different create a new group
            if (!new RegExp(lesson).test(linkData[0])) {
              lesson = /^appendix/.test(linkData[0]) ? 'appendix' : 
                       /^study-tools/.test(linkData[0]) ? 'study-tools' :
                       linkData[0].replace(/(lesson-\d+)\/.*/, '$1');

              list += '</ul><h4 ' + attrs + '>' + lesson.charAt(0).toUpperCase() + lesson.replace(/-/, ' ').slice(1) + '</h4><ul id="' + lesson + '">';
              group = '';
            }

            // add a header to separate the workbook from the textbook exercises and grammar from reading and writing
            if (groups.test(linkData[0]) && group != currentGroup) {
              group = currentGroup;
              list += '<li><h4 class="sub-lesson-title">' + groupTitles[group] + '</h4></li>';
            }

            // add the exercise link to the group and display results
            var resultsStorage = JSON.parse(localStorage.Results),
                editionResultStorage = resultsStorage[localStorage.GenkiEdition],

                lessonResult = editionResultStorage ? parseInt(editionResultStorage[linkData[0]]) : null,
                resultsTooltip = GenkiLang == 'ja' ? 'テストの得点' : 'Exercise score',
                resultSpans = {
                  perfect: '<span class="exercise-results result--perfect" title="' + resultsTooltip + '"><i class="fa">&#xf005;</i> ',
                  good: '<span class="exercise-results result--good" title="' + resultsTooltip + '"><i class="fa">&#xf00c;</i> ',
                  average: '<span class="exercise-results result--average" title="' + resultsTooltip + '"><i class="fa">&#xf10c;</i> ',
                  low: '<span class="exercise-results result--low" title="' + resultsTooltip + '"><i class="fa">&#xf00d;</i> ',
                },

                resultSpan =  lessonResult == 100 ? resultSpans.perfect : lessonResult >= 70 ? resultSpans.good : lessonResult >= 50 ? resultSpans.average : resultSpans.low,
                prevScore = lessonResult > -1 ? resultSpan + lessonResult +'%' +'</span>' : '';

            list += '<li class="menu-item-list"><a href="' + (lesson == '\\.\\.\\/' ? linkData[0] : '../../../' + Genki.ed + '/' + linkData[0] + '/') + Genki.local +
              Genki.debug + '" ' + (linkData[2] ? 'data-page="Genki ' + (+linkData[0].replace(/lesson-(\d+).*/, '$1') < 13 ? 'I' : 'II') +
              (/workbook-|wb-/.test(linkData[0]) ? ' Workbook' : '') + ': ' + linkData[2] + '"' : '') + ' title="' + linkData[1] + '">'+ linkData[1] +'</a>'+ " "+  prevScore +'</li>';
          }

          // add the exercise list to the document
          document.getElementById('content').insertAdjacentHTML('afterbegin', '<a href="#toggle-exercises" id="toggle-exercises" onclick="Genki.toggle.exerciseList(this); return false;" title="' + (GenkiLang == 'ja' ? '練習問題一覧をトグルする' : 'Toggle exercise list') + '"></a>' + list + '</ul></div></nav>');

          // open the current lesson and scroll to the active exercise
          if (Genki.active.exercise) {
            // open the active lesson
            Genki.toggle.list(document.getElementById(/^appendix/.test(Genki.active.exercise[0]) ? 'appendix' : /^study-tools/.test(Genki.active.exercise[0]) ? 'study-tools' : Genki.active.exercise[0].replace(/(lesson-\d+)\/.*/, '$1')).previousSibling);

            // highlight the active exercise and scoll to it
            active = document.querySelector('a[href*="' + Genki.active.exercise[0] + '"]:not(#link-grammar)');
            active.className += ' active-lesson';
            active = active.parentNode;

            // jump to the active exercise
            document.getElementById('lessons-list').scrollTop = active.offsetTop - (active.getBoundingClientRect().height + (window.matchMedia && matchMedia('(pointer:coarse)').matches ? 0 : 6));
          }
        }
        
        // creates quick nav for non-exercise pages
        else {
          var nav = 
              '<a href="#toggle-navigation" id="toggle-exercises" onclick="Genki.toggle.exerciseList(this); return false;" title="' + (GenkiLang == 'ja' ? 'クイックナビゲーションをトグルする' : 'Toggle quick navigation') + '"></a>'+
              '<nav id="exercise-list">'+
                '<h3 class="main-title"><span class="en">Quick Navigation</span><span class="ja">クイックナビゲーション</span></h3>'+
                '<div id="lessons-list">'+
                  main+
                '</div>'+
              '</nav>';
          // add the quick nav to the document
          document.getElementById('content').insertAdjacentHTML('afterbegin', nav);
        }
      },
      
      
      // creates button for refreshing the page and triggering the exercise type selection
      exerciseTypeButton : function () {
        // container and button creation
        var timer = document.getElementById('quiz-timer'),
            div = document.createElement('DIV'),
            button = document.createElement('BUTTON');
        
        // container and button attributes
        div.id = 'change-exercise-type-container';
        div.className = 'center';
        
        button.id = 'change-exercise-type';
        button.className = 'button';
        button.innerHTML = '<i class="fa">&#xf021;</i> <span class="en">Change Exercise Type</span><span class="ja">練習型を変更する</span>';
        
        // action to perform on click of the button
        button.onclick = function () {
          // opens a prompt warning the user that the exercise will end
          GenkiModal.open({
            title : '<span class="en">Change Exercise Type?</span><span class="ja">練習型を変更しますか？</span>',
            content : '<span class="en">To change the exercise type, you must quit the current exercise. Do you want to quit?</span><span class="ja">練習型を変更するためにテストが終了しなければいけません。よろしいですか？</span>',
            buttonHTML : '<span class="en">Quit</span><span class="ja">終了する</span>',
            closeButtonText : '<span class="en">Cancel</span><span class="ja">戻る</span>',
            keepOpen : /\/dictionary\//.test(window.location) || (!Genki.tools && /"format"/.test(Genki.exerciseData)) ? true : false,
            
            // clicking "OK" will reload the exercise, leading to the exercise type selection screen
            callback : function () {
              // remove start/begin queries, so the user can select a new exercise type
              if (/(?:begin|start)=\d/.test(window.location.search)) {
                if (window.history && window.history.pushState) {
                  window.history.pushState({}, document.title, window.location.href.replace(window.location.search, '') + Genki.debug);
                } 
              
                // remove the old fashioned way if the history API cannot be used
                else {
                  window.location.search = '';
                  return;
                }
              } 
              
              // set flag so genkiSkipExType doesn't trigger while trying to change the exercise type
              Genki.changingExType = true;
              
              // reset exercise state
              Genki.reset();
            }
          });
        }
        
        // appends the button to the container
        div.appendChild(button);
        
        // adds the container and button to the document
        if (timer.nextSibling) {
          timer.parentNode.insertBefore(div, timer.nextSibling);
          
        } else {
          timer.parentNode.appendChild(div);
        }
      }
    },
    
    
    // parsing functions
    parse : {
      // parse images
      image : function (data) {
        // data[n] (n = 0, 1, 2..)
        // 0 = flag (ex. !IMG)
        // 1 = file name
        // 2 = alt text (optional)
        var url = /^http/.test(data[1]) ? data[1] : '../../../resources/images/lesson-images/' + data[1];

        return '<a href="' + url + '" target="blank" title="' + (GenkiLang == 'ja' ? '画像の全体を見る' : 'View full image') + '" class="lesson-image"><img src="' + url + '" alt="' + (data[2] || data[1]) + '" /></a>';

      }
    },
    
    
    // quick dictionary functionality
    quickJisho : {
      hidden : true, // display state of dictionary
      selectorHidden : true, // display state of "lookup button"
      tabbing : false, // prevents selection change from occuring while tabbing
      
      // creates the quick dictionary button and popup
      create : function () {
        if (Genki.quickJisho.cache) return; // prevent duplication of the quickJisho
        
        var button = document.createElement('DIV'),
            box = document.createElement('DIV'),
            selector = document.createElement('BUTTON'),
            frag = document.createDocumentFragment();
        
        // button attrs
        button.id = 'quick-jisho-toggle';
        button.innerHTML = '<i class="fa">&#xf02d;</i>';
        button.title = GenkiLang == 'ja' ? 'クイック辞書をトグルする' : 'Toggle Quick Dictionary';
        button.tabIndex = 0;
        button.onclick = Genki.quickJisho.toggle;
        button.onkeypress = function (e) {
          e.key == 'Enter' && Genki.quickJisho.toggle();
        }
        
        // box attrs
        box.id = 'quick-jisho-window';
        box.className = 'quick-jisho-hidden';
        box.innerHTML = 
          '<div class="quick-jisho-header">' +
            '<h3 id="quick-jisho-title" class="main-title"> <span class="en">Quick Dictionary</span><span class="ja">クイック辞書</span> <span id="quick-jisho-hits"></span> </h3> ' +
            '<i class="fa fa-hover" tabindex="0" onclick="Genki.quickJisho.toggle();" onkeydown="event.key == \'Enter\' && Genki.quickJisho.toggle();" title="' + (GenkiLang == 'ja' ? '最小化' : 'Minimize') + '">&#xf2d1;</i>  ' +
          '</div>' +
          '<div id="quick-jisho-content">' +
            '<div class="quick-jisho-row center">' +
              '<input tabindex="0" id="quick-jisho-search" type="text" placeholder="' + ( GenkiLang == 'ja' ? '探す…' : 'Search...' ) + '" oninput="Genki.quickJisho.search(this.value);">' +
            '</div>' +
            '<div class="quick-jisho-row">' +
              '<ul id="quick-jisho-results"></ul>' +
            '</div>' +
          '</div>';
        
        // selection button
        selector.id = 'quick-jisho-selector';
        selector.className = 'button';
        selector.style.display = 'none';
        selector.innerHTML = '<i class="fa">&#xf002;</i><span class="en">Look up</span><span class="ja">辞書で調べる</span>';
        selector.onclick = Genki.quickJisho.lookUp;
        selector.tabIndex = 0;
        
        // add nodes to the document
        frag.appendChild(box);
        frag.appendChild(button);
        frag.appendChild(selector);
        document.body.appendChild(frag);
        var footerRight = document.querySelector('.footer-right');
        footerRight.style.marginRight = '40px'; // offset footer so texts are visible
        
        // node cache
        Genki.quickJisho.cache = {
          box : box,
          search : document.getElementById('quick-jisho-search'),
          results : document.getElementById('quick-jisho-results'),
          hits : document.getElementById('quick-jisho-hits'),
          selector : document.getElementById('quick-jisho-selector')
        };
        
        // selection handler
        document.onselectionchange = Genki.quickJisho.getSelection;
        
        // get mouse position for adjusting x/y values of the selector
        document.onmousemove = function (e) {
          Genki.quickJisho.x = Math.abs(e.pageX - document.body.clientWidth) < 100 ? e.pageX - 95 : e.pageX;
          Genki.quickJisho.y = Math.abs(e.pageY - document.body.clientHeight) < 40 ? e.pageY - 32 : e.pageY + 12;
        };
        
        // key handler for focusing the dictionary lookup button with a tab press
        document.onkeydown = function (e) {
          if (e.key == 'Tab' && !Genki.quickJisho.selectorHidden && document.activeElement != Genki.quickJisho.cache.selector) {
            Genki.quickJisho.tabbing = true;
            Genki.quickJisho.cache.selector.focus();
            e.preventDefault();
          }
        };
      },
      
      
      // toggles the quick dictionary
      toggle : function () {
        // load in the dictionary definitions
        if (!Genki.jisho && !Genki.quickJisho.loading) {
          Genki.quickJisho.loading = true;
          
          var jisho = document.createElement('SCRIPT');
          jisho.src = getPaths() + 'resources/javascript/jisho.min.js';
          jisho.onload = function () {
            if (Genki.quickJisho.cache.search.value) {
              Genki.quickJisho.search(Genki.quickJisho.cache.search.value);
            }
            
            Genki.quickJisho.loading = false;
          };
          
          document.body.appendChild(jisho);
        }
        
        
        // toggle dictionary display
        if (Genki.quickJisho.hidden) {
          Genki.quickJisho.cache.box.className = '';
          Genki.quickJisho.hidden = false;
          Genki.quickJisho.cache.search.focus();
          
        } else {
          Genki.quickJisho.cache.box.className = 'quick-jisho-hidden';
          Genki.quickJisho.hidden = true;
        }
      },
      
      
      // searches the dictionary
      search : function (value, retry) {
        // clear existing timeout
        if (Genki.quickJisho.searchTimeout) {
          window.clearTimeout(Genki.quickJisho.searchTimeout);
        }
        
        // wait 300ms before submitting search, just in case the user is still typing
        Genki.quickJisho.searchTimeout = window.setTimeout(function() {
          var results = '',
              hits = 0,
              k, i, j, l, ja;
          
          Genki.quickJisho.cache.results.innerHTML = '';
          
          if (value) {
            value = value.toLowerCase();
            
            for (k in Genki.jisho) {
              for (i = 0, j = Genki.jisho[k].length; i < j; i++) {
                for (l in Genki.jisho[k][i]) {
                  if (Genki.jisho[k][i][l].toLowerCase().indexOf(value) != -1) {
                    ja = Genki.jisho[k][i].ja.split('|');

                    results += '<li tabindex="0" class="definition clear">'+
                      '<span class="def-ja' + (ja[1] ? ' def-furi' : '') + '">'+
                        ja[0]+
                        (ja[1] ? '<i>' + ja[1] + '</i>' : '')+
                      '</span>'+
                      '<span class="def-en">' + Genki.jisho[k][i].en + '</span>'+
                      (Genki.jisho[k][i].v ? ' <span class="def-vtype">[<i>' + Genki.jisho[k][i].v + '</i>]</span>' : '')+
                      '<span class="def-label">' + Genki.jisho[k][i].l + '</span>';
                    '</li>';

                    hits++;
                    break;
                  }
                }
              }
            }
          }
          
          // perform a kanji only search if the previous one yeilded no results
          if (!retry && !results && value && /[\u3400-\u9faf]/.test(value)) {
            var kanji = value.match(/[\u3400-\u9faf]+/);
            
            if (kanji && kanji[0]) {
              Genki.quickJisho.search(kanji[0], true);
            }
          } 
          
          // show results
          else {
            Genki.quickJisho.cache.results.innerHTML = results ? results : value ? '<li><span class="en">No results found for "' + value + '".</span><span class="ja">「' + value + '」が見つかりませんでした。</span></li>' : '';
            Genki.quickJisho.cache.hits.innerHTML = hits ? '(' + hits + ')' : '';
          }
          
          delete Genki.quickJisho.searchTimeout;
        }, 300);
      },
      
      
      // look up a selected word
      lookUp : function () {
        if (Genki.quickJisho.hidden) {
          Genki.quickJisho.toggle();
        }

        Genki.quickJisho.cache.search.value = ''.trim ? Genki.quickJisho.selectedText.trim() : Genki.quickJisho.selectedText;
        Genki.quickJisho.search(Genki.quickJisho.cache.search.value);

        // hide the selector search
        this.style.display = 'none';
        Genki.quickJisho.selectorHidden = true;
      },
      
      
      // gets the selected text and shows the look up button
      getSelection : function () {
        // disables quick jisho look up if preferred
        if (storageOK && localStorage.genkiJishoLookUp == 'false') return false;
        
        // returns if tabbing to the lookup button
        // required, as some browsers change selection when focusing a new element w/focus()
        if (Genki.quickJisho.tabbing) {
          // delay setting "tabbing" to false, as the selection change tends to proc twice for focus changes
          if (!Genki.quickJisho.tabbingOff) { // prevent duplication of timeout
            Genki.quickJisho.tabbingOff = setTimeout(function () {
              Genki.quickJisho.tabbing = false;
              delete Genki.quickJisho.tabbingOff;
            }, 10);
          }
          
          return false;
        }
        
        // get the currently selected texts
        if (document.getSelection) {
          var selection = document.getSelection();

          if (selection.type == 'Range' && selection.toString && !/quick-jisho/.test(selection.focusNode.className)) {
            // stores selected text for searches
            Genki.quickJisho.selectedText = selection.toString();
            
            // update lookup button position
            Genki.quickJisho.cache.selector.style.left = Genki.quickJisho.x + 'px';
            Genki.quickJisho.cache.selector.style.top = Genki.quickJisho.y + 'px';
            
            // show lookup button
            if (Genki.quickJisho.selectorHidden) {
              Genki.quickJisho.cache.selector.style.display = '';
              Genki.quickJisho.selectorHidden = false;
            }

          } else { // hide lookup button and clear selection
            Genki.quickJisho.selectedText = '';

            if (!Genki.quickJisho.selectorHidden) {
              Genki.quickJisho.cache.selector.style.display = 'none';
              Genki.quickJisho.selectorHidden = true;
            }
          }
        }
      }
    },
    
    
    // plays the specific audio element
    playAudio : function (id, time) {
      // play the targeted audio file
      var audio = document.getElementById(id);
      
      if (audio) {
        audio.currentTime = time;
        audio.play();
      }
    },
    
    
    // for viewing the stroke order in Kanji Writing Practice exercises
    viewStrokeOrder : function (kanji, order, kana) {
      var img = getPaths() + 'resources/images/stroke-order/' + order + '.png';
          
      GenkiModal.open({
        title : kanji + '<span class="en"> Stroke Order</span><span class="ja">の書き順</span>',
        content :
          '<div class="kanji-stroke-order center">'+
            '<div class="big-kanji' + (kana ? ' kana-font' : '') + '"' + ( /り/.test(kanji) ? ' style="font-family:SawarabiGothic, MS Gothic, Yu Gothic, NotoSansJP, Meiryo;"' : '' ) + '>' + kanji + '</div>'+
            '<a class="button-link" href="' + (kana ? getPaths() + 'resources/images/stroke-order/sasagami-' + kana + '.jpg' : 'https://jisho.org/search/' + kanji + '%20%23kanji') + '" target="_blank" title="' + (GenkiLang == 'ja' ? 'jisho.orgで書き順を見る' : 'View stroke order on jisho.org') + '"><button class="button"><i class="fa">&#xf002;</i></button></a>'+
            '<a href="' + img + '" target="_blank" title="' + (GenkiLang == 'ja' ? 'クリックして画像を見る' : 'Click to view image') + '"><img src="' + img + '" alt="' + ( GenkiLang == 'ja' ? '書き順' : 'stroke order' ) + '"/></a>'+
          '</div>'
        
      });
    },
    
    
    // Returns a list of alternative answers for a string. Generally used for mixed kana/kanji answers.
    // Special thanks to Patrick Roberts for helping me improve this function (stackoverflow.com/a/59337819/12502093)
    // USAGE: Genki.getAlts('...{A}...{B}...{C}...', '1|2|3'); // add 'true' to the 3rd arg to return an array
    // The text within curly braces is replaced with the identical index in the second argument, so:
    // A can only be A or 1, B can only be B or 2, and so on...
    getAlts : function (str, alt, arrayOnly) {
      var subs = alt.split('|'),
          length = subs.length,
          permutations = Math.pow(2, length),
          results = [],
          i = 0,
          bit, bitIndex, subIndex, result;

      for (; i < permutations; ++i) {
        bitIndex = 0;
        result = str.replace(/\{(.*?)\}/g, function (match, p1) {
          subIndex = bitIndex++;
          bit = length - 1 - subIndex;
          return ((1 << bit) & i) ? subs[subIndex] : p1;
        });

        results.push(result);
      }
      
      // append ?debug to the URL for debug logs
      if (Genki.debug) {
        var len = results.length;
        console[len / permutations * 100 == 100 ? 'log' : 'warn'](len + '/' + permutations + ' (' + (len / permutations * 100) + '% combo coverage for ' + length + ' replacements; ' + (permutations - len) + ' missing combos)', results);
      }

      return arrayOnly ? results : '%(' + results.join('/') + ')|';
    },
    
    
    // returns the specified grammar point in a popup window
    getGrammarPoint : function (caller, id) {
      // check if grammar point is being opened in the popup window, to cache the currently opened grammar point
      var parent = caller.parentNode;
      while (parent) {
        if (parent.id == 'genki-modal-content') {
          // push new history entry
          Genki.grammarPointHistory.push(parent.innerHTML);
          break;
          
        } else if (parent.tagName == 'BODY' || !parent) {
          break;
          
        } else {
          parent = parent.parentNode;
        }
      }
      
      // open modal
      GenkiModal.open({
        title : 'Quick Grammar Review',
        content : '<div id="appendix-tool" class="loading"></div>',
        customButton : 
        (Genki.grammarPointHistory.length ? '<button id="genki-modal-back" class="button" onclick="Genki.grammarPointBack(this);" title="Go back to previous grammar point."><i class="fa">&#xf112;</i><span class="en">Back</span><span class="ja">先の文法ノートに戻る</span></button>' : '')+
        '<a href="' + caller.href + '" class="button" target="_blank"><i class="fa">&#xf08e;</i><span class="en">View in Grammar Index</span><span class="ja">文法索引で見る</span></a>',
        customSize : {
          top : '10%',
          left : '20%',
          bottom : '10%',
          right : '20%'
        },
        zIndex : 'low',
        
        // clears grammar history when closed
        closeCallback : function () {
          Genki.grammarPointHistory = [];
        }
      });
      
      Get(caller.href, function (data) {
        var zone = document.querySelector('#genki-modal #appendix-tool'),
            grammar = data.match(new RegExp('(<h3 id="' + id + '"[\\s\\S]*?<\/table><br>)', 'm')), // should return h3 title and table right below it
            url = caller.href.replace(/#.*$/, ''); // clean grammar index url for use in anchor links
        
        if (grammar && grammar[0]) {
          if (zone) {
            // trim out grammar point number and format anchor links for use with the quick grammar review modal
            zone.innerHTML = grammar[0].replace(/\d+\. /, '').replace(/href="#(.*?)"/g, 'onclick="Genki.getGrammarPoint(this, \'$1\'); return false;" target="_blank" href="' + url + '#$1"');
            zone.className = 'grammar-index ' + (Genki.ed == 'lessons' ? 'second-ed' : 'third-ed');
          }
        } else if (zone) {
          zone.innerHTML = '<br><b><span class="en">Failed to retrieve grammar point. Click "View in Grammar Index" to try viewing the grammar point directly.</span><span class="ja">文法ノートが見つかりませんでした。「文法索引で見る」をクリックして文法索引で見てみます。</span></b>';
          zone.className = 'center';
        }
      });
    },
    
    // return to a previously viewed grammar point in the quick grammar review window
    grammarPointHistory : [],
    grammarPointBack : function (button) {
      if (Genki.grammarPointHistory.length) {
        var content = document.getElementById('genki-modal-content');
        content.innerHTML = Genki.grammarPointHistory.pop();
        content.scrollTop = 0;
        
        // hide button if no more history entries
        if (!Genki.grammarPointHistory.length) {
          button.style.display = 'none';
        }
      }
    },
    
    
    // takes the user to a random exercise
    randomExercise : function () {
      // random exercise preference (current lesson)
      if (storageOK && localStorage.genkiRandomExercise == 'lesson' && /lesson-\d+/.test(window.location.href)) {
        var regex = new RegExp(window.location.href.replace(/.*?(lesson-\d+).*/, '$1/')),
            list = Genki.exercises.filter(function(a) { return regex.test(a) });
      } 

      // random exercise preference (random, previously completed lesson)
      else if (storageOK && localStorage.genkiRandomExercise == 'completed' && localStorage.Results && JSON.parse(localStorage.Results)[localStorage.GenkiEdition]) {
        var editionLessonResults = JSON.parse(localStorage.Results)[localStorage.GenkiEdition];
        var list = Genki.exercises.filter(function(a) { return a.split('|')[0] in editionLessonResults });
        
        if (!list[0]) {
          return alert(GenkiLang == 'ja' ? '完成した練習が足りませんのでランダム練習はできません。' : 'Cannot select a random exercise, because you have not completed enough exercises yet.');
        }
      }
      
      else if (storageOK && localStorage.genkiRandomExercise == 'custom' && GenkiRandomList.length) {
        var list = GenkiRandomList;
      } 
      
      // default (all lessons), triggers this instead of preference if in the appendix or study tools since they're not lessons
      else {
        var list = Genki.exercises;
      }
      
      // the random exercise
      var exercise = list[Math.floor(Math.random() * list.length)].split('|');
      
      // only take the user to random lessons
      if (/lesson-\d+/.test(exercise[0])) {
        window.location.href = '../../../' + Genki.ed + '/' + exercise[0] + '/' + Genki.local + Genki.debug;
        
      } else { // try again if not a lesson
        Genki.randomExercise();
      }
    },
    

    // start or pause timer according to page visibility
    startOrPauseTimerByVisibility : function () {
      if (document.hidden && Genki.timer.isRunning()) {
        Genki.timer.pause();
      } else if (!document.hidden && Genki.timer.isPaused() && !Genki.isTimerPausedByPopup) {
        Genki.timer.start();
      }
    },


    // pause timer when open popup
    pauseTimerWhenOpenPopup: function () {
       Genki.timer.pause();
       Genki.isTimerPausedByPopup = true;
    },
    

    // start timer when close popup
    startTimerWhenClosePopup: function () {
       Genki.timer.start();
       Genki.isTimerPausedByPopup = false;
    },


    // initial setup for exercise functionality
    init : function () {
      if (Genki.exercises) {
        // finds the currently active exercise in the exercise list and sets up essential data for following statements
        var i = 0,
            j = Genki.exercises.length,
            result = document.getElementById('quiz-result'),
            lesson;

        for (; i < j; i++) {
          if (Genki.active.path == Genki.exercises[i].split('|')[0]) {
            Genki.active.exercise = Genki.exercises[i] ? Genki.exercises[i].split('|') : null;
            Genki.active.index = i;
            break;
          }
        }

        // add exercise title to the document
        if (Genki.active.exercise) {
          lesson = /^appendix/.test(Genki.active.exercise[0]) ? 'appendix' : /^study-tools/.test(Genki.active.exercise[0]) ? 'study-tools' : +Genki.active.exercise[0].replace(/lesson-(\d+).*/, '$1'); // current lesson

          result.insertAdjacentHTML('beforebegin', '<h2 id="exercise-title" class="center" ' + (Genki.active.exercise[2] ? 'data-page="Genki ' + (lesson < 13 ? 'I' : 'II') + (/workbook-|wb-/.test(Genki.active.exercise[0]) ? ' Workbook' : '') + ': ' + Genki.active.exercise[2] + '"' : '') + '>' + (
            lesson == 'appendix' ? '巻末' :
            lesson == 'study-tools' ? 'ツール' :
            '第' + lesson + '課'
          ) + ' - ' + Genki.active.exercise[1] + '</h2>');

        } else {
          result.insertAdjacentHTML('beforebegin', '<h2 id="exercise-title" class="center">' + document.querySelector('TITLE').innerText.replace(/\s\|.*/, '') + '</h2>');
        }


        // touch listeners for touch screen events
        if (Genki.isTouch) {
          document.ontouchstart = function () {
            Genki.isTouching = true;
          }

          // extra fallback for preventing page scroll while dragging objects
          document.addEventListener('touchmove', function (e) {
            if (Genki.isTouching && /hidden/i.test(document.body.style.overflow)) {
              e.preventDefault();
            }
          }, { passive : false });

          document.ontouchend = function () {
            Genki.isTouching = false;
          }

          document.ontouchcancel = function () {
            Genki.isTouching = false;
          }
        }


        // setup navigational objects
        Genki.create.exerciseButtons();
      }
      
      Genki.create.exerciseList();
      
      // define Genki in the global namespace
      window.Genki = this;
    }
    
  };
  
  
  // prevent progress loss on page change
  window.onbeforeunload = function () {
    var lossDetected = false,
        type = document.getElementById('exercise');
    
    if (type) {
      type = type.className;
      // determine exercise type and find if the user may incur progress loss for the current exercise
      if (/quiz-over/.test(type) || document.querySelector('.review-mode')) { // ignore this check completely if the quiz is over or student is in review mode
        lossDetected = false;
      } 

      // check if any of the inputs have been filled in for a written quiz
      else if (/fill-quiz|writing-quiz/.test(type)) {
        for (var a = document.querySelectorAll('.writing-zone-input'), i = 0, j = a.length; i < j; i++) {
          if (a[i].value != '') { // mark as a "loss" if an input is filled in and break out of the loop
            lossDetected = true;
            break;
          }
        }
      }

      // check if any of the canvases have been drawn on
      else if (/drawing-quiz|stroke-quiz/.test(type)) {
        for (var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length; i < j; i++) {
          if (KanjiCanvas['recordedPattern_' + a[i].id].length) { // mark as a "loss" if a canvas has been drawn on and break out of the loop
            lossDetected = true;
            break;
          }
        }
      }

      // check if progress has been made in the following quizzes
      else if (/multi-quiz|drag-quiz|kana-quiz/.test(type) && Genki.stats.solved > 0) {
        lossDetected = true;
      }

      // return warning about progress loss
      if (lossDetected) {
        return GenkiLang == 'ja' ? '進み具合は失われます。よろしいですか？' : 'Your progress will be lost. Do you want to continue?';
      }
    }
  };
  
  
  // initial setup
  Genki.init();
}(window, document));