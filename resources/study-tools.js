// tools used for creating custom exercises and other tools used for studying
// TODO: Custom Quiz
// TODO: Custom Fill in the Blanks
Genki.tools = {
  type : '', // tool type defined by the document (e.g. vocab, spelling, quiz..)

  
  // adds a new row
  addRow : function (caller) {
    var newRow = caller.parentNode.cloneNode(true),
        list = document.getElementById('study-tool-ui'),
        input = newRow.getElementsByTagName('INPUT'),
        i = input.length;

    while (i --> 0) {
      input[i].value = '';
    }

    list.appendChild(newRow);
    list.scrollTop = 9999;

    this.updateJSON();
  },
  
  
  // removes the selected row
  removeRow : function (caller) {
    document.getElementById('study-tool-ui').removeChild(caller.parentNode);
    this.updateJSON();
  },
  
  
  // updates the list when the JSON is edited
  updateUI : function () {
    var code = document.getElementById('study-tool-json');

    if (!code.value) {
      code.value = '{"":""}';
    }

    var data = JSON.parse(code.value),
        buttons = 
        '<button class="button" title="add another word" onclick="Genki.tools.addRow(this);"><i class="fa">&#xf067;</i></button>'+
        '<button class="button" title="remove word" onclick="Genki.tools.removeRow(this);"><i class="fa">&#xf068;</i></button>',
        str = '',
        i;

    // formatting for vocab rows
    if (this.type == 'vocab') {
      for (i in data) {
        str += 
        '<li class="item-row">'+
          '<input type="text" placeholder="word/kanji" oninput="Genki.tools.updateJSON();" value="' + (/\|/.test(i) ? i.split('|')[0] : i) + '">&nbsp;'+
          '<input type="text" placeholder="furigana (optional)" oninput="Genki.tools.updateJSON();" value="' + (/\|/.test(i) ? i.split('|')[1] : '') + '">&nbsp;'+
          '<input type="text" placeholder="definition/kana" oninput="Genki.tools.updateJSON();" value="' + data[i] + '">&nbsp;'+
          buttons+
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

    document.getElementById('study-tool-ui').innerHTML = str;
  },
  
  
  // updates the custom vocabulary code when the list is edited
  updateJSON : function () {
    var row = document.getElementById('study-tool-ui').getElementsByTagName('LI'),
        i = 0,
        j = row.length,
        code = {},
        input, json;

    // code formatting for custom vocab
    if (this.type == 'vocab') {
      for (; i < j; i++) {
        input = row[i].getElementsByTagName('INPUT');

        // 0 = word/kanji
        // 1 = furigana
        // 2 = definition/kana
        code[input[0].value + (input[1].value ? '|' + input[1].value : '')] =  input[2].value;
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

    json = document.getElementById('prettyCode').checked ? JSON.stringify(code, '', '  ') : JSON.stringify(code);
    document.getElementById('study-tool-json').value = json;
    
    // save JSON to localStorage
    window.localStorage[{
      vocab : 'customVocab',
      spelling : 'customSpelling'
    }[this.type]] = json;
  },
  
  
  // restores data saved to localStorage
  restore : function () {
    var type = {
      vocab : 'customVocab',
      spelling : 'customSpelling'
    }[this.type];
    
    if (window.localStorage[type]) {
      document.getElementById('study-tool-json').value = window.localStorage[type];
      this.updateUI();
      this.updateJSON();

    } else {
      this.updateJSON();
    }
  },
  

  // begin studying a custom exercise
  study : function () {
    if (document.getElementById('noStudyWarning').checked || confirm('Are you sure you\'re ready to study? Your custom exercise will be temporarily saved to the browser cache, however, if you want to use it again later, click "cancel", then copy the code and save it to a text document. (click "do not warn me" to disable this message)')) {
      var quizlet = document.getElementById('study-tool-json').value;
      
      document.getElementById('study-tool-editor').style.display = 'none';
      document.getElementById('exercise').style.display = '';
      
      // generate a vocab exercise
      if (this.type == 'vocab') {
        Genki.generateQuiz({
          type : 'drag',
          info : 'Match the definition/kana to the word/kanji.',

          quizlet : JSON.parse(quizlet)
        });
      }
      
      // generate a spelling exercise
      else if (this.type == 'spelling') {
        Genki.generateQuiz({
          type : 'writing',
          info : 'Practice spelling the following words.',

          columns : +document.getElementById('spellingColumns').value,
          quizlet : JSON.parse(quizlet)
        });
      }
    }
  },
  
  
  // general settings shared across tools
  settings : {
    
    // prettify the JSON code
    prettify : function (caller) {
      this.handleCheckbox(caller);
      Genki.tools.updateJSON();
    },
    
    
    // handle checkbox input
    handleCheckbox : function (caller, state) {
      if (state) {
        caller.checked = state == 'true' ? true : false;
      } else {
        window.localStorage[caller.id] = caller.checked;
      }
    },
    
    
    // function for restoring settings shared over various tools
    restore : function () {
      var settings = [
        'noStudyWarning', 
        'prettyCode'
      ],
      
      i = 0,
      j = settings.length;
      
      for (; i < j; i++) {
        if (window.localStorage[settings[i]]) {
          this.handleCheckbox(document.getElementById(settings[i]), window.localStorage[settings[i]]);
        }
      }
    }
    
  }
  
};