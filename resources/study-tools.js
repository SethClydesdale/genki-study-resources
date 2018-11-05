// tools used for creating custom exercises and other tools used for studying
// TODO: Custom Spelling Practice
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
        str = '',
        i;

    // fromatting for vocab rows
    if (this.type == 'vocab') {
      var word, furigana, definition;
      
      for (i in data) {
        word = /\|/.test(i) ? i.split('|')[0] : i;
        furigana = /\|/.test(i) ? i.split('|')[1] : '';
        definition = data[i];

        str += 
          '<li class="item-row">'+
          '<input type="text" placeholder="word/kanji" oninput="Genki.tools.updateJSON();" value="' + word + '">&nbsp;'+
          '<input type="text" placeholder="furigana (optional)" oninput="Genki.tools.updateJSON();" value="' + furigana + '">&nbsp;'+
          '<input type="text" placeholder="definition/kana" oninput="Genki.tools.updateJSON();" value="' + definition + '">&nbsp;'+
          '<button class="button" title="add another word" onclick="Genki.tools.addRow(this);"><i class="fa">&#xf067;</i></button>'+
          '<button class="button" title="remove word" onclick="Genki.tools.removeRow(this);"><i class="fa">&#xf068;</i></button>'+
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

    json = document.getElementById('prettyCode').checked ? JSON.stringify(code, '', '  ') : JSON.stringify(code);
    document.getElementById('study-tool-json').value = json;
    
    // save JSON to localStorage
    window.localStorage[{
      vocab : 'customVocab'
    }[this.type]] = json;
  },
  
  
  // restores data saved to localStorage
  restore : function () {
    var type = {
      vocab : 'customVocab'
    }[this.type];
    
    if (window.localStorage[type]) {
      document.getElementById('study-tool-json').value = window.localStorage[type];
      this.updateUI();

    } else {
      this.updateJSON();
    }
  },
  

  // begin studying a custom exercise
  study : function () {
    if (document.getElementById('noStudyWarning').checked || confirm('Are you sure you\'re ready to study? Your custom exercise will be temporarily saved to the browser cache, however, if you want to use it again later, click "cancel", then copy the code and save it to a text document. (click "do not warn me" to disable this message)')) {

      document.getElementById('study-tool-editor').style.display = 'none';
      document.getElementById('exercise').style.display = '';
      
      // generate a quiz based on the tool type
      Genki.generateQuiz({
        // generate a vocab exercise
        vocab : {
          type : 'drag',
          info : 'Match the definition/kana to the word/kanji.',

          quizlet : JSON.parse(document.getElementById('study-tool-json').value)
        }
      }[this.type]);

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