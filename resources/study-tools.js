// tools used for custom exercises and other tools used for studying
Genki.tools = {

  // custom vocab tools
  vocab : {

    // adds a new word row
    addWord : function (caller) {
      var newWord = caller.parentNode.cloneNode(true),
          list = document.getElementById('vocab-list-box'),
          input = newWord.getElementsByTagName('INPUT'),
          i = 3;

      while (i --> 0) {
        input[i].value = '';
      }

      list.appendChild(newWord);
      list.scrollTop = 9999;

      this.updateJSON();
    },

    
    // removes the selected word
    removeWord : function (caller) {
      document.getElementById('vocab-list-box').removeChild(caller.parentNode);

      this.updateJSON();
    },

    
    // updates the list when the JSON is edited
    updateList : function () {
      var code = document.getElementById('vocab-json');

      if (!code.value) {
        code.value = '{"":""}';
      }

      var words = JSON.parse(code.value),
          str = '',
          i, word, furigana, definition;

      for (i in words) {
        word = /\|/.test(i) ? i.split('|')[0] : i;
        furigana = /\|/.test(i) ? i.split('|')[1] : '';
        definition = words[i];

        str += 
          '<li class="word-row">'+
          '<input type="text" placeholder="word/kanji" oninput="Genki.tools.vocab.updateJSON();" value="' + word + '">&nbsp;'+
          '<input type="text" placeholder="furigana (optional)" oninput="Genki.tools.vocab.updateJSON();" value="' + furigana + '">&nbsp;'+
          '<input type="text" placeholder="definition/kana" oninput="Genki.tools.vocab.updateJSON();" value="' + definition + '">&nbsp;'+
          '<button class="button" title="add another word" onclick="Genki.tools.vocab.addWord(this);"><i class="fa">&#xf067;</i></button>'+
          '<button class="button" title="remove word" onclick="Genki.tools.vocab.removeWord(this);"><i class="fa">&#xf068;</i></button>'+
        '</li>';
      }

      document.getElementById('vocab-list-box').innerHTML = str;
    },

    
    // updates the custom vocabulary code when the list is edited
    updateJSON : function () {
      var word = document.getElementById('vocab-list-box').getElementsByTagName('LI'),
          i = 0,
          j = word.length,
          code = {},
          input, json;

      // loop over the words
      for (; i < j; i++) {
        input = word[i].getElementsByTagName('INPUT');

        // 0 = word/kanji
        // 1 = furigana
        // 2 = definition/kana
        code[input[0].value + (input[1].value ? '|' + input[1].value : '')] =  input[2].value;
      }

      json = JSON.stringify(code);
      document.getElementById('vocab-json').value = json;
      window.localStorage.customVocab = json;
    },

    
    // restores a vocab list saved to localStorage
    restore : function () {
      if (window.localStorage.customVocab) {
        document.getElementById('vocab-json').value = window.localStorage.customVocab;
        this.updateList();
        
      } else {
        Genki.tools.vocab.updateJSON();
      }
    },

    
    // begin studying the custom vocab
    study : function () {
      if (document.getElementById('noStudyWarning').checked || confirm('Are you sure you\'re ready to study? Your custom vocabulary list will be temporarily saved to the browser cache, however, if you want to use it again later, click "cancel", then copy the code and save it to a text document. (click "do not warn me" to disable this message)')) {

        document.getElementById('vocab-maker').style.display = 'none';
        document.getElementById('exercise').style.display = '';

        Genki.generateQuiz({
          type : 'drag',
          info : 'Match the definition/kana to the word/kanji.',

          quizlet : JSON.parse(document.getElementById('vocab-json').value)
        });
      }
    }
    
  },
  
  
  // general settings shared across tools
  settings : {
    
    // updates and saves the study warning preferences
    updateStudyWarning : function (caller, state) {
      if (state) {
        caller.checked = state == 'true' ? true : false;
      } else {
        window.localStorage.noStudyWarning = caller.checked;
      }
    },
    
    
    // function for restoring settings shared over various tools
    restore : function () {
      // restores cached study warning settings
      if (window.localStorage.noStudyWarning) {
        Genki.tools.settings.updateStudyWarning(document.getElementById('noStudyWarning'), window.localStorage.noStudyWarning);
      }
    }
    
  }
  
};

// restore general settings
Genki.tools.settings.restore();