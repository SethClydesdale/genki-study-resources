// tools used for creating custom exercises and other tools used for studying
(function (window, document) {
  'use strict';
  
  Genki.tools = {
    type : '', // tool type defined by the document (e.g. vocab, spelling, quiz..)


    // adds a new row
    addRow : function (caller) {
      var newRow = caller.parentNode.cloneNode(true),
          list = caller.parentNode.parentNode,
          input = newRow.querySelectorAll('input, textarea'),
          i = input.length;

      // clear values
      while (i --> 0) {
        if (input[i].type == 'checkbox') {
          input[i].checked = false;
        } else {
          input[i].value = '';
        }
      }

      list.appendChild(newRow);
      list.scrollTop = 9999;

      this.updateJSON();
    },


    // removes the selected row
    removeRow : function (caller) {
      caller.parentNode.parentNode.removeChild(caller.parentNode);
      this.updateJSON();
    },


    // updates the list when the JSON is edited
    updateUI : function () {
      var code = document.getElementById('study-tool-json');

      if (!code.value) {
        code.value = this.type == 'quiz' ? '[{"question":"","answers":[""]}]' : this.type == 'fill' ? '{"quiz":""}' : '{"":""}';
      }

      var data = JSON.parse(code.value),
          buttons = 
          '<button class="button row-add" title="add" onclick="Genki.tools.addRow(this);"><i class="fa">&#xf067;</i></button>'+
          '<button class="button row-remove" title="remove" onclick="Genki.tools.removeRow(this);"><i class="fa">&#xf068;</i></button>',
          str = '',
          i, j, k, l, answers;

      // formatting for vocab rows
      if (this.type == 'vocab') {
        for (i in data) {
          str += 
          '<li class="item-row">'+
            '<input type="text" placeholder="word/kanji" oninput="Genki.tools.updateJSON();" value="' + (/\|/.test(i) ? i.split('|')[0] : i) + '">&nbsp;'+
            '<input type="text" placeholder="furigana (optional)" oninput="Genki.tools.updateJSON();" value="' + (/\|/.test(i) ? i.split('|')[1] : '') + '">&nbsp;'+
            '<input type="text" placeholder="definition/kana" oninput="Genki.tools.updateJSON();" value="' + (/\|/.test(data[i]) ? data[i].split('|')[0] : data[i]) + '">&nbsp;'+
            buttons+
            '<input type="text" placeholder="sentence (optional)" oninput="Genki.tools.updateJSON();" class="sentence-field" value="' + (/\|/.test(data[i]) ? data[i].split('|')[1] : '') + '">'+
          '</li>';
        }
      }

      // formatting for spelling rows
      else if (this.type == 'spelling') {
        for (i in data) {
          str += 
          '<li class="item-row">'+
            '<input type="text" placeholder="word/kanji" oninput="Genki.tools.updateJSON();" value="' + i + '">&nbsp;'+
            '<input type="text" placeholder="furigana (optional)" oninput="Genki.tools.updateJSON();" value="' + (data[i] ? data[i] : '') + '">&nbsp;'+
            buttons+
          '</li>';
        }
      }

      // formatting for quiz rows
      else if (this.type == 'quiz') {
        for (i = 0, j = data.length; i < j; i++) {

          // formatting answers for insertion into the string below
          for (answers = '', k = 0, l = data[i].answers.length; k < l; k++) {
            answers +=
            '<li class="quiz-answer">'+
              '<input type="checkbox" title="Correct answer" onchange="Genki.tools.updateJSON();"' + (/^A/.test(data[i].answers[k]) ? ' checked' : '') + '>'+
              '<input type="text" placeholder="answer" oninput="Genki.tools.updateJSON();" value="' + (/^A|!/.test(data[i].answers[k]) ? data[i].answers[k].slice(1) : data[i].answers[k]) + '">'+
              buttons+
            '</li>';
          }

          str += 
          '<li class="item-row question-row">'+
            '<textarea placeholder="question" oninput="Genki.tools.updateJSON();">' + data[i].question + '</textarea>'+
            buttons+
            '<ol>' + answers + '</ol>'+
          '</li>';
        }
      }

      // formatting for written quiz
      else if (this.type == 'fill') {
        str =
        '<li class="item-row">'+
          '<textarea oninput="Genki.tools.updateJSON();">' + data.quiz + '</textarea>'+
        '</li>'
      }

      document.getElementById('study-tool-ui').innerHTML = str;
      
      // parse custom checkboxes
      if (Genki.tools.type == 'quiz') {
        CreateCustomInputs();
      }
    },


    // updates the custom vocabulary code when the list is edited
    updateJSON : function () {
      var row = document.getElementById('study-tool-ui').querySelectorAll('.item-row'),
          i = 0,
          j = row.length, k, l,
          code = {},
          input, json, answers, answerRow;

      // code formatting for custom vocab
      if (this.type == 'vocab') {
        for (; i < j; i++) {
          input = row[i].getElementsByTagName('INPUT');

          // 0 = word/kanji
          // 1 = furigana
          // 2 = definition/kana
          // 3 = sentence
          code[input[0].value + (input[1].value ? '|' + input[1].value : '')] =  input[2].value + (input[3].value ? '|' + input[3].value : '');
        }
      }

      // code formatting for spelling
      else if (this.type == 'spelling') {
        for (; i < j; i++) {
          input = row[i].getElementsByTagName('INPUT');

          // 0 = word/kanji
          // 1 = furigana
          code[input[0].value] = input[1].value;
        }
      }

      // code formatting for quizzes
      else if (this.type == 'quiz') {
        code = [];

        for (; i < j; i++) {

          // compile answers
          for (answers = [], answerRow = row[i].querySelectorAll('.quiz-answer'), k = 0, l = answerRow.length; k < l; k++) {
            input = answerRow[k].getElementsByTagName('INPUT');

            // 0 = checkbox (defines the correct answer)
            // 1 = answer texts
            answers[k] = (input[0].checked ? 'A' : '') + (!input[0].checked && /^A/.test(input[1].value) ? '!' : '') + input[1].value;
          }

          // add the formatted question to the question list
          code[i] = {
            question : row[i].getElementsByTagName('TEXTAREA')[0].value,
            answers : answers
          }
        }
      }

      // code formatting for written quizzes
      else if (this.type == 'fill') {
        code.quiz = row[i].getElementsByTagName('TEXTAREA')[0].value;
      }

      json = document.getElementById('prettyCode').checked ? JSON.stringify(code, '', '  ') : JSON.stringify(code);
      document.getElementById('study-tool-json').value = json;

      // update download link
      document.getElementById('downloadCode').href = 'data:,' + encodeURIComponent(json.replace(/\n/g, '\r\n'));

      // save JSON to localStorage
      if (storageOK) {
        localStorage[{
          vocab : 'customVocab',
          spelling : 'customSpelling',
          quiz : 'customQuiz',
          fill : 'customWrittenQuiz'
        }[this.type]] = json;
      }
    },


    // restores data saved to localStorage or the URL
    restore : function () {
      var type = {
        vocab : 'customVocab',
        spelling : 'customSpelling',
        quiz : 'customQuiz',
        fill : 'customWrittenQuiz'
      }[this.type];

      if (storageOK && localStorage[type]) {
        document.getElementById('study-tool-json').value = localStorage[type];
        this.updateUI();
        this.updateJSON();

      } else {
        this.updateJSON();
      }
    },


    // initialize the study session after asking for confirmation
    study : function () {
      if (document.getElementById('noStudyWarning').checked) {
        this.begin();
      } else {
        GenkiModal.open({
          title : '<span class="en">Ready to Study?</span><span class="ja">勉強の準備はOK？</span>',
          content : '<span class="en">Are you sure you\'re ready to study? Your custom exercise will be temporarily saved to the browser cache, however, if you want to use it again later, click "cancel", and then click "Save" to save it to a text document. (click "do not warn me" to disable this message)</span><span class="ja">カスタム練習コードはブラウザーのキャッシュで保存していますがセーブするのがおすすめです。勉強してもよろしいですか？（このメッセージが邪魔の場合は「注意しないで」をクリックしてください。）</span>'+
          (navigator.cookieEnabled && !offlineEdge ? '' : '<br><br><div style="color:#F00;font-weight:bold;">WARNING: Cookies are blocked by your browser, so your custom exercise will NOT be saved. Please click "close" and then click "Save" to backup your custom exercise.</div>'),
          keepOpen : Genki.tools.type == 'vocab' ? true : false,

          callback : Genki.tools.begin
        });
      }
    },

    // begin studying a custom exercise
    begin : function () {
      var type = Genki.tools.type,
      quizlet = document.getElementById('study-tool-json').value
      // sanitization
      .replace(/<script.*?>/g, '<span>')
      .replace(/<\/script>/g, '</span>')
      .replace(/ on.*?=\\".*?\\"/g, '');

      document.getElementById('study-tool-editor').style.display = 'none';
      document.getElementById('exercise').style.display = '';

      // generate a vocab exercise
      if (type == 'vocab') {
        Genki.generateQuiz({
          format : 'vocab',
          type : ['multi', 'drag', 'writing', 'fill'],
          info : [Genki.lang.vocab_multi, Genki.lang.std_drag, Genki.lang.vocab_writing, Genki.lang.vocab_fill],

          quizlet : JSON.parse(quizlet)
        });
      }

      // generate a spelling exercise
      else if (type == 'spelling') {
        Genki.generateQuiz({
          type : 'writing',
          info : Genki.lang.vocab_writing,

          columns : +document.getElementById('spellingColumns').value,
          quizlet : JSON.parse(quizlet)
        });
      }

      // generate a multi-choice quiz
      else if (type == 'quiz') {
        Genki.generateQuiz({
          type : 'multi',
          info : Genki.lang.std_questions,

          quizlet : JSON.parse(quizlet)
        });
      }

      // generate a written quiz
      else if (type == 'fill') {
        Genki.generateQuiz({
          type : 'fill',
          info : Genki.lang.std_written,

          quizlet : JSON.parse(quizlet).quiz
        });
      }
    },


    // imports snippets for custom written quizzes
    importSnippet : function (id) {
      GenkiModal.open({
        title : '<span class="en">Import Snippet?</span><span class="ja">練習コードをインポートしますか？</span>',
        content : '<span class="en">Are you sure you want to import this snippet? It will overwrite your current quiz settings.</span><span class="ja">今の練習コードは失います。インポートしてもよろしいですか？</span>',

        callback : function () {
          document.querySelector('#study-tool-ui textarea').value = document.getElementById(id).value;
          Genki.tools.updateJSON();

          Genki.scrollTo('#quiz-settings');
        }
      });
    },
    
    
    // loads a custom exercise code from a txt/json/js file
    loadCode : function (input, dropped) {
      var file = dropped ? input : input.files[0],
          reader = new FileReader();
      
      reader.onload = function (e) {
        document.getElementById('study-tool-json').value = e.target.result;
        if (!dropped) input.value = '';
        Genki.tools.updateUI();
        Genki.tools.updateJSON();
      };
      
      reader.readAsText(file, 'UTF-8');
    },
    
    
    // handles drag and dropping an exercise code file into the textarea
    dropFile : function (e) {
      Genki.tools.loadCode(e.dataTransfer.files[0], true);
      e.preventDefault();
    },


    // general settings shared across tools
    settings : {

      // prettify the JSON code
      prettify : function (caller) {
        this.handleCheckbox(caller);
        Genki.tools.updateJSON();
      },
      
      
      // toggles the display of the sentence field in the custom vocab tool
      toggleSentences : function (caller) {
        this.handleCheckbox(caller);

        if (caller.checked) {
          document.body.className += ' show-sentences';

        } else {
          document.body.className = document.body.className.replace(' show-sentences', '');
        }
      },


      // handle checkbox input
      handleCheckbox : function (caller, state) {
        if (state) {
          caller.checked = state == 'true' ? true : false;
          
          // hide sentence fields
          if (caller.id == 'showSentenceField' && state == 'true') {
            document.body.className += ' show-sentences';
          }
          
        } else if (storageOK) {
          localStorage[caller.id] = caller.checked;
        }
      },


      // function for restoring settings shared over various tools
      restore : function () {
        if (storageOK) {
          var settings = [
            'noStudyWarning', 
            'prettyCode',
            'showSentenceField'
          ],

          i = 0,
          j = settings.length,
          caller;

          for (; i < j; i++) {
            if (localStorage[settings[i]]) {
              caller = document.getElementById(settings[i]);
              if (caller) this.handleCheckbox(caller, localStorage[settings[i]]);
            }
          }
        }
      }

    },

    // shows page after setup
    finishedLoading : function () {
      CreateCustomInputs(); // parse custom checkboxes
      
      var loading = document.querySelector('.loading');
      loading.className = loading.className.replace('loading', '');
    }
  };

  // clone more exercises and add it to the study tools editor
  document.getElementById('study-tool-editor').appendChild(document.querySelector('.more-exercises').cloneNode(true));
}(window, document));
