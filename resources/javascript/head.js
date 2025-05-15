// # MODIFICATIONS FOR ALL PAGES (<HEAD>) #
(function (window, document) {
  'use strict';
  
  // apply class to body for OS based fixes
  if (document.documentElement) {
    document.documentElement.className += /Linux/.test(window.navigator.platform) ? ' os-linux' : '';
  }
  
  // Global used for telling if the site is being used offline with MS Edge (pre-chromium).
  // Helps prevent "unspecified errors" caused by checking for the existence of localStorage support offline.
  window.offlineEdge = window.location.protocol == 'file:' && /Edge/.test(navigator.userAgent);
  
  // Global used for checking localStorage support (ex: storageOK && localStorage.myStorageItem)
  // prevents long winded conditions everytime we want to use storage
  window.storageOK = navigator.cookieEnabled && !offlineEdge && window.localStorage ? true : false;
  
  // current edition
  window.GenkiEd = /lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd';
  
  // user language preference (either en or ja)
  window.GenkiLang = storageOK && localStorage.genkiLang ? localStorage.genkiLang : 'en';
  
  // user's random exercise list
  window.GenkiRandomList = storageOK && localStorage['genkiRandomList' + GenkiEd] ? JSON.parse(localStorage['genkiRandomList' + GenkiEd]) : [];
  
  // # GENKI MODAL #
  // creates a modal or closes one
  window.GenkiModal = {
    
    // opens a new modal
    // params: object (optional)
    // {
    //           title : string, (popup title)
    //         content : string, (popup content)
    //      buttonHTML : string, (custom HTML for the OK button)
    //      buttonText : string, (custom text for the OK button)
    // closeButtonText : string, (custom text for the close button)
    //         noFocus : bool, (keeps buttons from being focused)
    //           focus : string, (pass a css selector to focus a specific element; overrides noFocus)
    //      customSize : object, manually set the top, left, right, and bottom css properties
    //    customButton : string, add custom HTML to the button area
    //        keepOpen : bool, (keeps the modal open when clicking the callback button; useful for opening another modal afterwards)
    //         noClose : bool, (removes the close button)
    //          zIndex : 'low', lowers the z-index so the exercise menu can be used
    //        callback : function (function to execute when the OK button is clicked)
    //   closeCallback : function (function to execute when the close button is clicked)
    // } // all values are optional
    open : function (o) {
      o = o ? o : {};

      GenkiModal.close();

      // create the modal and set its params
      var modal = document.createElement('DIV'), button, buttons;
      modal.id = 'genki-modal';
      modal.innerHTML = 
      '<div id="genki-modal-overlay"' + ( o.zIndex == 'low' ? ' style="z-index:1;"' : '' ) + '></div>'+
      '<div id="genki-modal-body" style="' + ( o.zIndex == 'low' ? 'z-index:2;' : '' ) + ( o.customSize ? 'top:' + o.customSize.top + ';right:' + o.customSize.right + ';bottom:' + o.customSize.bottom + ';left:' + o.customSize.left + ';' : '' ) + '">'+
        '<h2 id="genki-modal-header">' + ( o.title ? o.title : 'Popup' ) + '</h2>'+
        '<div id="genki-modal-content">' + ( o.content ? o.content : '' ) + '</div>'+
        '<div id="genki-modal-buttons" class="center">'+
          (o.noClose ? '' : '<button id="genki-modal-close" class="button" onclick="GenkiModal.close();">' + (o.closeButtonText ? o.closeButtonText : '<span class="en">Close</span><span class="ja">戻る</span>') + '</button>')+
          (o.customButton ? o.customButton : '') +
        '</div>'+
      '</div>';

      // create a button for the callback function
      if (o.callback) {
        button = document.createElement('BUTTON');
        buttons = modal.querySelector('#genki-modal-buttons');

        // set button params
        if (o.buttonText) {
          button.innerText = o.buttonText ? o.buttonText : 'OK';
        } else {
          button.innerHTML = o.buttonHTML ? o.buttonHTML : '<span class="en">OK</span><span class="ja">はい</span>';
        }
        button.id = 'genki-modal-ok';
        button.className = 'button';
        button.onclick = function () {
          o.callback();
          !o.keepOpen && GenkiModal.close();
        };

        // insert button into buttons list
        buttons.insertBefore(button, buttons.firstChild);
      }

      // add the modal to the document
      document.body.style.overflow = 'hidden';
      document.body.appendChild(modal);

      // focus confirm/ok button
      if (o.focus) {
        document.querySelector(o.focus).focus();
        
      } else if (!o.noFocus) {
        document.getElementById('genki-modal-' + (o.callback ? 'ok' : 'close')).focus();
      }
      
      // apply close button callback
      if (o.closeCallback) {
        document.getElementById('genki-modal-close').onclick = function () {
          o.closeCallback();
          !o.keepOpen && GenkiModal.close();
        };
      }

      // pause the timer when opening the modal
      if (window.Genki && Genki.timer && Genki.timer.isRunning()) {
        Genki.pauseTimerWhenOpenPopup();
      }
      
      return o;
    },

    // close the modal
    close : function () {
      var modal = document.getElementById('genki-modal');

      if (modal) {
        document.body.style.overflow = '';
        document.body.removeChild(modal);
      }

      // resume the timer when closing the modal
      if (window.Genki && Genki.timer && Genki.timer.isPaused()) {
        Genki.startTimerWhenClosePopup();
      }
    }
  };
  
  
  // # CUSTOM INPUTS #
  window.CreateCustomInputs = function () {
    for (var input = document.querySelectorAll('input[type="checkbox"], input[type="radio"]'), i = 0, j = input.length, type; i < j; i++) {
      if (!/light-switch-checkbox|genki_input_hidden/g.test(input[i].outerHTML)) { // exclusions
        input[i].className += ' genki_input_hidden';
        input[i].insertAdjacentHTML('afterend', '<span tabindex="0" class="genki_pseudo_' + input[i].type + '" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"/>');
      }
    }
  };
  
  
  // # JUMP ARROWS #
  // Add arrows to each target that return the student to the specified element
  window.AddJumpArrowsTo = function (targets, tag, title) {
    for (var a = document.querySelectorAll(targets), i = 0, j = a.length; i < j; i++) {
      a[i].insertAdjacentHTML('beforeEnd', '<a href="#' + (tag ? tag : '') + '" class="jump-arrow fa" title="' + (title ? title : '') + '">&#xf062;</a>');
    }
  };
  
  
  // # getPaths (helper function) #
  // finds out how deep a file is and returns a path that leads to the root
  // example: getPaths() + 'resources/css/stylesheet-dark.min.css'
  window.getPaths = function () {
    var path = window.location.pathname;
    
    if (/\/lessons\/|\/lessons-3rd\/.*?\//.test(path)) {
      return '../../../'
      
    } else if (/\/help\/.*?\//.test(path)) {
      return '../../'    
      
    } else if (/\/lessons-3rd\/|\/report\/|\/download\/|\/donate\/|\/privacy\/|\/help\/(index|$)/.test(path)) {
      return '../';  
               
    } else {
      return '';
    }
  };
  
  
  /* # SETTINGS MANAGER # */
  // functions for managing global site settings
  window.GenkiSettings = {
    manager : function () {
      // various settings and their selected||default values
      var fontSize = +localStorage.genkiFontSize || 100,
          pageWidth = +localStorage.genkiPageWidth || 100,
          genkiLang = localStorage.genkiLang || 'en',
          genkiTheme = localStorage.genkiTheme || 'genki1',
          darkMode = localStorage.darkMode || 'off',
          adverts = localStorage.adverts || 'on',
          customCSS = localStorage.genkiCustomCSS || '',
          furigana = localStorage.furiganaVisible || 'true',
          spoilerMode = localStorage.spoilerMode || 'false',
          vocabHorizontal = localStorage.vocabHorizontal || 'false',
          feedbackMode = localStorage.feedbackMode || 'classic',
          randomExercise = localStorage.genkiRandomExercise || 'all',
          skipExType = localStorage.genkiSkipExType || 'false',
          jishoLookUp = localStorage.genkiJishoLookUp || 'true',
          strokeOrder = localStorage.strokeOrderVisible || 'true',
          tracingGuide = localStorage.tracingGuideVisible || 'true',
          timerAutoPause = localStorage.timerAutoPause || 'true',
          dataBackupReminder = localStorage.dataBackupReminder || 'true';
      
      // create stylesheet for settings
      if (!GenkiSettings.stylesheet) {
        GenkiSettings.createStylesheet();
      }
      
      // open settings popup
      GenkiModal.open({
        title : '<span class="en">Settings Manager</span><span class="ja">ウェブサイトの設定</span>',
        content : '<p><span class="en">You can manage your settings for Genki Study Resources in this window.<br>※ Please note that all data is saved locally to the browser, so clearing your browser\'s cache will reset your settings.</span><span class="ja">ここでGenki Study Resourcesの設定が変更できます。<br>※ウェブサイトの設定はブラウザーで保存していますのでキャッシュをクリアすると失います。注意してください。</span></p>'+
        '<div class="section-title"><span class="en">Display</span><span class="ja">表示</span></div>'+
        '<ul class="genki-settings-list">'+
          '<li>'+
            '<span class="label">'+
              '<span class="en">Font Size:</span><span class="ja">フォントサイズ：</span>'+
              '<span class="desc"><small class="en">Increases the font size for the site.</small><small class="ja">ウェブサイトのフォントサイズが増えられます。</small></span>'+
            '</span>'+
            '<input id="font-size-range" type="range" min="100" max="500" value="' + fontSize + '" oninput="GenkiSettings.updateFontSize(this);" onchange="GenkiSettings.updateFontSize(this, true);"><span id="font-size-value">' + fontSize + '%</span>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Page Width:</span><span class="ja">ページ幅：</span>'+
              '<span class="desc"><small class="en">Increases the maximum page width for the site (up to the size of your screen).</small><small class="ja">スクリーンサイズまで最高のページ幅が増えられます。</small></span>'+
            '</span>'+
            '<input id="page-width-range" type="range" min="100" max="500" value="' + pageWidth + '" oninput="GenkiSettings.updatePageWidth(this);" onchange="GenkiSettings.updatePageWidth(this, true);"><span id="page-width-value">' + pageWidth + '%</span>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Interface Language:</span><span class="ja">引用仕様の言語：</span>'+
              '<span class="desc"><small class="en">Changes the language of buttons, popups, etc. on the website. Try changing the language to 日本語 for some extra immersion!</small><small class="ja">ボタン、ポップアップなどの言語が変更できます。</small></span>'+
            '</span>'+
            '<select id="settings-lang" onchange="GenkiSettings.updateLang(this);">'+
              '<option value="en"' + ( genkiLang == 'en' ? ' selected' : '' ) + '>English</option>'+
              '<option value="ja"' + ( genkiLang == 'ja' ? ' selected' : '' ) + '>日本語</option>'+
            '</select>'+
          '</li>'+
        
          '<li>'+
            '<span class="label">'+
              '<span class="en">Theme:</span><span class="ja">テーマ：</span>'+
              '<span class="desc"><small class="en">Changes the main color of the website.</small><small class="ja">ウェブサイトのテームが変更できます。</small></span>'+
            '</span>'+
            '<select id="settings-theme" onchange="GenkiSettings.updateTheme(this);">'+
              '<option value="genki1"' + ( genkiTheme == 'genki1' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? 'げんき' : 'Genki ') + 'I</option>'+
              '<option value="genki2"' + ( genkiTheme == 'genki2' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? 'げんき' : 'Genki ') + 'II</option>'+
            '</select>'+
          '</li>'+
        
          '<li>'+
            '<span class="label">'+
              '<span class="en">Dark Mode:</span><span class="ja">ダークモード：</span>'+
              '<span class="desc"><small class="en">Enable or disable Dark Mode.</small><small class="ja">ダークモードのテーマがトグルできます。</small></span>'+
            '</span>'+
            '<button id="settings-dark-mode" class="button' + (darkMode == 'on' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateDarkMode(this);">' + (darkMode == 'on' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+
        
          (window.location.protocol == 'file:' ? '' : '<li>'+
            '<span class="label">'+
                '<span class="en">Ads:</span><span class="ja">広告：</span>'+
                '<span class="desc"><small class="en">Enable or disable Ads.<br>Ads help support the developer, but if they\'re annoying or distracting, you can turn them off with this option.</small><small class="ja">広告がトグルできます。<br>広告はこのウェブサイトの開発者が支援しますが邪魔だったら無効にできます。</small></span>'+
              '</span>'+
            '<button id="settings-dark-mode" class="button' + (adverts == 'on' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateAdverts(this);">' + (adverts == 'on' ? 'ON' : 'OFF') + '</button>'+
          '</li>')+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Custom CSS:</span><span class="ja">カスタムCSS：</span><br><a href="https://www.w3schools.com/css/css_intro.asp" target="_blank" style="font-weight:normal;"><small><span class="en">What is CSS?</span><span class="ja">CSSって何？</span></small></a>'+
              '<span class="desc"><small class="en">Use your own CSS to customize the design of the site to your liking.</small><small class="ja">自分のCSSが使えます。</small></span>'+
            '</span>'+
            '<textarea id="page-custom-css" oninput="GenkiSettings.updateCustomCSS(this, true);">' + customCSS + '</textarea>'+
          '</li>'+
        '</ul>'+
        
        '<div class="section-title"><span class="en">Exercises</span><span class="ja">練習</span></div>'+
        '<ul class="genki-settings-list">'+
          '<li>'+
            '<span class="label">'+
              '<span class="en">Furigana:</span><span class="ja">振り仮名：</span>'+
              '<span class="desc"><small class="en">Enable or disable furigana for kanji.</small><small class="ja">漢字の振り仮名がトグルできます。</small></span>'+
            '</span>'+
            '<button id="settings-furigana" class="button' + (furigana == 'true' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateFurigana(this);">' + (furigana == 'true' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Drag and Drop Mode:</span><span class="ja">ドラッグ＆ドロップモード：</span>'+
              '<span class="desc"><small class="en">Changes the orientation used for drag and drop vocabulary exercises.</small><small class="ja">単語の練習の方向が変更できます。</small></span>'+
            '</span>'+
            '<select id="settings-vocab-mode" onchange="GenkiSettings.updateVocabMode(this);">'+
              '<option value="false"' + ( vocabHorizontal == 'false' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? '垂直' : 'Vertical') + '</option>'+
              '<option value="true"' + ( vocabHorizontal == 'true' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? '水平' : 'Horizontal') + '</option>'+
            '</select>'+
          '</li>'+
        
          '<li>'+
            '<span class="label">'+
              '<span class="en">Multiple Choice Feedback Mode:</span><span class="ja">選択式モード：</span>'+
              '<span class="desc"><small class="en">Changes the feedback mode for multple choice quizzes.<br>Instant shows if your answer was correct right away, whereas Classic only shows your answers at the end of the quiz.</small><small class="ja">選択式モードが変更できます。<br>「インスタント」は答えが正解か不正解をすぐに見せます。</small></span>'+
            '</span>'+
            '<select id="settings-feedback-mode" onchange="GenkiSettings.updateFeedbackMode(this);">'+
              '<option value="classic"' + ( feedbackMode == 'classic' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? 'クラシック' : 'Classic') + '</option>'+
              '<option value="instant"' + ( feedbackMode == 'instant' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? 'インスタント' : 'Instant') + '</option>'+
            '</select>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Multiple Choice Vocab Spoiler:</span><span class="ja">単語の選択式モードのネタバレ：</span>'+
              '<span class="desc"><small class="en">Hides the choices in multiple choice vocab exercises, similar to a flash card mode.<br>Turn this mode on if you keep looking at the choices to remember what a word means instead of recalling it from memory.</small><small class="ja">単語の選択式モードで選択肢が隠せます。</small></span>'+
            '</span>'+
            '<button id="settings-vocab-spoiler" class="button' + (spoilerMode == 'true' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateSpoilerMode(this);">' + (spoilerMode == 'true' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+
        
          '<li>'+
            '<span class="label">'+
              '<span class="en">Random Exercise Range:</span><span class="ja">ランダム練習の範囲：</span>'+
              '<span class="desc"><small class="en">Changes the range for the Random Exercise button in the exercise list.<br>Change to Current Lesson if you want to avoid exercises above your current level.<br>Custom allows you to select your own exercises.</small><small class="ja">練習問題一覧でランダム練習ボタンの範囲が変更できます。<br>「カスタム」は自分で練習問題が選択できます。</small></span>'+
            '</span>'+
            '<select id="random-exercise-type" onchange="GenkiSettings.updateRandomExercise(this);">'+
              '<option value="all"' + ( randomExercise == 'all' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? 'すべての課' : 'All Lessons') + '</option>'+
              '<option value="lesson"' + ( randomExercise == 'lesson' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? '今の課' : 'Current Lesson') + '</option>'+
              '<option value="completed"' + ( randomExercise == 'completed' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? '終えた練習問題のみ' : 'Completed Exercises') + '</option>'+
              '<option value="custom"' + ( randomExercise == 'custom' ? ' selected' : '' ) + '>' + (GenkiLang == 'ja' ? 'カスタム' : 'Custom') + '</option>'+
            '</select>'+
            '<button id="random-exercise-list" class="button" style="display:' + (randomExercise == 'custom' ? '' : 'none') + ';" onclick="GenkiSettings.randomExerciseList();"><i class="fa">&#xf03a;</i><span class="en">Random Exercise List</span><span class="ja">ランダム練習リスト</span></button>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Skip Exercise Type Selection:</span><span class="ja">練習型の選択をスキップする：</span>'+
              '<span class="desc"><small class="en">Skips that pesky exercise type selection prompt and instantly starts exercises when enabled.<br>The exercise type can still be changed manually via the Change Exercise Type button at the bottom of an exercise.</small><small class="ja">練習型を選択するポップアップがスキップしてすぐに練習できます。<br>練習型を変更したいなら練習ページの下の「練習型を変更する」をクリックしてください。</small></span>'+
            '</span>'+
            '<button id="settings-skip-ex-type" class="button' + (skipExType == 'true' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateSkipExType(this);">' + (skipExType == 'true' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+
        

          '<li>'+
            '<span class="label">'+
              '<span class="en">Quick Jisho Look Up:</span><span class="ja">クイック辞書の調べるポップアップ：</span>'+
              '<span class="desc"><small class="en">Enable or disable the look up button that appears when you select texts.<br>This feature may interfere with some IMEs, so it is recommended to disable it if you encounter any issues.</small><small class="ja">テキストを選択した時に調べるポップアップの表示がトグルできます。</small></span>'+
            '</span>'+
            '<button id="settings-jisho-lookup" class="button' + (jishoLookUp == 'true' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateJishoLookUp(this);">' + (jishoLookUp == 'true' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Stroke Order:</span><span class="ja">書き順の表示：</span>'+
              '<span class="desc"><small class="en">Enable or disable the stroke order display in stroke order exercises.</small><small class="ja">書き順の練習での書き順の表記がトグルできます。</small></span>'+
            '</span>'+
            '<button id="settings-stroke-order" class="button' + (strokeOrder == 'true' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateStrokeOrder(this);">' + (strokeOrder == 'true' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Tracing Guide:</span><span class="ja">書き順のトレスガイド：</span>'+
              '<span class="desc"><small class="en">Enable or disable the tracing guide display in stroke order exercises.</small><small class="ja">書き順の練習でのトレスガイドの表示がトグルできます。</small></span>'+
            '</span>'+
            '<button id="settings-tracing-guide" class="button' + (tracingGuide == 'true' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateTracingGuide(this);">' + (tracingGuide == 'true' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Pause Timer Automatically:</span><span class="ja">練習の時間の停止：</span>'+
              '<span class="desc"><small class="en">Enable or disable pausing timer when you leave or hide the exercise page</small><small class="ja">練習でページを変更すると時間が停止できます。</small></span>'+
            '</span>'+
            '<button id="settings-timer-auto-pause" class="button' + (timerAutoPause == 'true' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateTimerAutoPause(this);">' + (timerAutoPause == 'true' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+
        
          '<li>'+
            '<span class="label">'+
              '<span class="en">Exercise Data Backup Reminder:</span><span class="ja">練習データを保存するリマインダー：</span>'+
              '<span class="desc"><small class="en">Shows a reminder every 10 exercises to backup your exercise score data.</small><small class="ja">練習データを保存するリマインダーのポップアップがトグルできます。</small></span>'+
            '</span>'+
            '<button id="settings-data-backup-reminder" class="button' + (dataBackupReminder == 'true' ? '' : ' opt-off') + '" onclick="GenkiSettings.updateDataBackupReminder(this);">' + (dataBackupReminder == 'true' ? 'ON' : 'OFF') + '</button>'+
          '</li>'+

          '<li>'+
            '<span class="label">'+
              '<span class="en">Save/Load Exercise Score Data:</span><span class="ja">練習データをセーブ／ロードする：</span>'+
              '<span class="desc"><small class="en">Save or load your exercise score data.<br>This data is stored locally in the browser, so it\'s highly recommended that you save your data periodically so you don\'t lose it.</small><small class="ja">練習データがセーブ／ロードできます。<br>このデータはブラウザーで保存していますのでキャッシュをクリアすると失います。ですから、定期的にセーブするのがおすすめします。</small></span>'+
            '</span>'+
            '<a id="settings-save-exercise-data" class="button" download="Genki Exercise Score Data.txt" href="data:text/plain;charset=utf-8,' + (storageOK && localStorage.Results ? encodeURIComponent(localStorage.Results.replace(/\n/g, '\r\n')) : '') + '"><i class="fa">&#xf019;</i><span class="en">Save</span><span class="ja">セーブする</span></a>'+
            '<button id="settings-load-exercise-data" class="button" onclick="this.nextSibling.click();"><i class="fa">&#xf093;</i><span class="en">Load</span><span class="ja">ロードする</span></button><input id="settings-load-data" type="file" accept=".txt,.json,.js" onchange="GenkiSettings.loadExerciseData(this);" style="visibility:hidden;position:absolute;">'+
            '<button id="settings-view-exercise-data" class="button" onclick="GenkiSettings.viewExerciseData();"><i class="fa">&#xf1c9;</i><span class="en">View Data</span><span class="ja">データを見る</span></button>'+
          '</li>'+
        '</ul>'+
        
        '<div class="section-title"><span class="en">Other</span><span class="ja">他の設定</span></div>'+
        '<ul class="genki-settings-list">'+
          '<li>'+
            '<span class="label">'+
              '<span class="en">Revert to Default Settings:</span><span class="ja">デフォルト設定に戻す：</span>'+
              '<span class="desc"><small class="en">Resets all settings to their default value.</small><small class="ja">すべての設定が初期状態に戻せます。</small></span>'+
            '</span>'+
            '<button id="settings-load-exercise-data" class="button" onclick="GenkiSettings.revert();"><i class="fa">&#xf0e2;</i><span class="en">Reset Settings</span><span class="ja">設定をリセットする</span></button>'+
          '</li>'+
        '</ul>',

        buttonText : 'Close',
        noFocus : true,
        focus : '#font-size-range',
        
        customSize : {
          top : '5%',
          left : '10%',
          bottom : '5%',
          right : '10%'
        }
      });
      
      // insert label title description as visible text under the label
      for (var a = document.querySelectorAll('.genki-settings-list .label'), i = 0, j = a.length; i < j; i++) {
        a[i].insertAdjacentHTML('beforeEnd', '<div class="desc">' + a[i].title.replace(/\n/g, '<br>') + '</div>');
      }
    },


    // asks if the user wants to reload the page to apply their new settings
    reloadPrompt : function () {
      GenkiModal.open({
        title : '<span class="en">Reload Required</span><span class="ja">ページリロードが必要です</span>',
        content : '<span class="en">The page needs to be reloaded for your changes to take effect. Do you want to reload now?</span><span class="ja">設定が変更するためにページリロードが必要です。リロードしてもよろしいですか？</span>',
        buttonHTML : '<span class="en">Reload</span><span class="ja">リロードする</span>',
        closeButtonText : '<span class="en">Return to Settings</span><span class="ja">設定に戻る</span>',

        callback : function () {
          window.location.reload();
        },

        closeCallback : function () {
          setTimeout(GenkiSettings.manager, 10);
        }
      });
    },
    
    
    // reverts settings to their default values by deleting their localStorage items
    revert : function () {
      GenkiModal.open({
        title : '<span class="en">Revert to Default Settings?</span><span class="ja">すべての設定を初期状態に戻しますか？</span>',
        content : '<span class="en">All of your settings will be reset to their default values. Do you want to continue?</span><span class="ja">すべての設定を初期状態に戻してもよろしいですか？</span>',
        buttonHTML : '<span class="en">Reset Settings</span><span class="ja">設定をリセットする</span>',
        closeButtonText : '<span class="en">Return to Settings</span><span class="ja">設定に戻る</span>',
        callback : function () {
          var settings = [
            'genkiFontSize',
            'genkiPageWidth',
            'genkiLang',
            'genkiTheme',
            'darkMode',
            'adverts',
            'genkiCustomCSS',
            'furiganaVisible',
            'spoilerMode',
            'vocabHorizontal',
            'feedbackMode',
            'genkiRandomExercise',
            'genkiSkipExType',
            'genkiJishoLookUp',
            'strokeOrderVisible',
            'tracingGuideVisible',
            'timerAutoPause',
            'dataBackupReminder'
          ], i = 0, j = settings.length;
          
          for (; i < j; i++) {
            localStorage.removeItem(settings[i]);
          }
          
          setTimeout(GenkiSettings.reloadPrompt, 10);
        },

        closeCallback : function () {
          setTimeout(GenkiSettings.manager, 10);
        }
      });
    },
    
    
    // loads exercise score data
    loadExerciseData : function (input) {
      var file = input.files[0],
          reader = new FileReader();
      
      reader.onload = function (e) {
        if (/"3rd"\:|"2nd"\:/.test(e.target.result)) {
          localStorage.Results = e.target.result;
          
          alert(GenkiLang == 'ja' ? '練習データが成功にロードしました。得点データをアップデートするためにページをリロードしてください。' : 'Exercise score data has been loaded successfully! Please reload the page to update your scores.');
          
        } else {
          alert(GenkiLang == 'ja' ? 'エラーが発生しました。やり直してみてください。またエラーが発生しましたらGitHubで連絡してください：https://github.com/SethClydesdale/genki-study-resources/issues' : 'There was an error loading the exercise score data. Please try again or open a new issue on GitHub for help: https://github.com/SethClydesdale/genki-study-resources/issues');
        }
      };
      
      reader.readAsText(file, 'UTF-8');
    },
    
    
    // displays the user's exercise score data in a popup so they can view/copy it
    viewExerciseData : function () {
      GenkiModal.open({
        title : '<span class="en">Exercise Score Data</span><span class="ja">練習の得点データ</span>',
        content : 
        '<div class="center">'+
          '<textarea id="copy-data" onfocus="this.select();" style="width:80%;height:150px;" readonly>' + (storageOK && localStorage.Results ? JSON.stringify(JSON.parse(localStorage.Results), '', '  ') : GenkiLang == 'ja' ? 'データが見つかりませんでした。(ᓀ‸ᓂ)' : 'No data found. (ᓀ‸ᓂ)') + '</textarea><br>'+

          '<button class="button" onclick="CopyText(document.getElementById(\'copy-data\').value, this);"><i class="fa">&#xf0c5;</i><span class="en">Copy</span><span class="ja">コピーする</span></button>'+
        '</div>',
        
        closeCallback : function () {
          window.setTimeout(GenkiSettings.manager, 10);
        }
      });
    },
    
    
    // update button state for settings
    updateButton : function (caller, callback) {
      // switches button state to ON if it's off
      if (/opt-off/.test(caller.className)) {
        caller.innerText = 'ON';
        caller.className = caller.className.replace('opt-off', '');
        callback && callback('ON');
      }
      
      // switches button state to OFF if it's on
      else {
        caller.innerText = 'OFF';
        caller.className += ' opt-off';
        callback && callback('OFF');
      }
    },
    
    
    // updates the font size
    updateFontSize : function (caller, updateCSS) {
      var n = (caller ? +caller.value : localStorage.genkiFontSize) / 100;
      
      // update number value
      if (caller) caller.nextSibling.innerText = caller.value + '%';
      
      // update the CSS
      if (updateCSS) {
        var css = '/*FONT-SIZE-START*/'+
          // font size
          'footer li:before { font-size:' + (6 * n) + 'px }'+
          '.kana-quiz.quiz-over [data-mistakes]:after { font-size:' + (8 * n) + 'px }'+
          '.quiz-over .vocab-horizontal [data-mistakes]:after, .verb-quiz.quiz-over [data-mistakes]:after { font-size:' + (10 * n) + 'px }'+
          '.define, #announcement .announcement .date, #quick-search-results li[data-lesson]:before, .writing-quiz .quiz-item:before, .helper-present #question-list .quiz-item:before, .furigana, .inline-furi i, ruby rt, .secondary-answer, .def-ja.def-furi i { font-size:' + (11 * n) + 'px }'+
          '#exercise-title:after, .title[data-page]:after, #exercise-list li a[data-page]:hover:after, #exercise-list li a[data-page]:focus:after, .leg-desc, .sectionNumber3rd { font-size:' + (12 * n) + 'px }'+
          '.kanji-readings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .kanji-meanings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .image-list span i, .checkbox-label { font-size:' + (13 * n) + 'px }'+
          'body, p, input[type="text"], input[type="number"], textarea, select, #announcement .announcement, #link-list span, .workbook-title, .normal-block, .quiz-over [data-mistakes]:after, #wrongAnswer:before, .writing-quiz .quiz-item, input.writing-zone-input, .quiz-multi-question, .quiz-multi-answer, .text-block, .fill-quiz .writing-zone-input, .problem-hint, .problem-answer, .definition, .lesson-summary, #exercise-list .sub-lesson-title, .button:not(.play-button), a.button, #study-tool-settings li { font-size:' + (14 * n) + 'px }'+
          '#exercise-list .lesson-title, #genki-modal-content, .table.grammar-table td { font-size:' + (15 * n) + 'px }'+
          '#link-list i, #exercise:before, .loading:before, .sub-lesson-title, .workbook-title, .title-desc, #exercise .text-passage, #complete-banner, #downloadCode:before, .definition-count, .multi-vocab rt, .table-head { font-size:' + (16 * n) + 'px }'+
          '.group-selectors .select-all:before, .group-selectors .deselect-all:before { font-size:' + (17 * n) + 'px }'+
          '.button .fa, .more-exercises a:after, .more-exercises a:before, #link-github i, #link-help i, .title-med, .sub-title, #exercise-list .main-title, .quiz-multi-answer:before, #genki-site-settings, .dictionary-index li, #quick-jisho-title { font-size:' + (18 * n) + 'px }'+
          '#quick-actions h2, .lesson-title, .vocab-key:before { font-size:' + (20 * n) + 'px }'+
          '.section-title, #exercise-title, #break-timer, #announcement .fa, .multi-vocab-sentence { font-size:' + (24 * n) + 'px }'+
          '.kanji-readings.drag-quiz #question-list .quiz-item, .kanji-meanings.drag-quiz #question-list .quiz-item { font-size:' + (26 * n) + 'px }'+
          '.title { font-size:' + (28 * n) + 'px }'+
          '.multi-vocab { font-size:' + (32 * n) + 'px }'+
          // width
          '.slim-ruby ruby { width:' + (10 * n) + 'px }'+
          '.result-label { width:' + (150 * n) + 'px }'+
          '.kana-quiz .quiz-answer-zone:empty, .kana-quiz .quiz-item { width:' + (35 * n) + 'px }'+
          // height
          '.problem-hint, .problem-answer { height:' + (20 * n) + 'px }'+
          '#quiz-progress, #quiz-progress-bar { height:' + (25 * n) + 'px }'+
          '#genki-site-settings { height:' + (26 * n) + 'px }'+
          '.kanji-meanings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .drag-quiz .quiz-item, .drag-quiz .quiz-answer-zone { height:' + (28 * n) + 'px }'+
          '.vocab-key:before, .kana-quiz .quiz-answer-zone:empty, .kana-quiz .quiz-item { height:' + (30 * n) + 'px }'+
          '#genki-modal-buttons, #genki-modal-header { height:' + (40 * n) + 'px }'+
          '.kanji-meanings.drag-quiz .quiz-answer-zone, .kanji-meanings.drag-quiz #question-list .quiz-item, .kanji-meanings.drag-quiz #question-list .quiz-item, .kanji-meanings.drag-quiz .quiz-answer-zone, .kanji-readings.drag-quiz .quiz-answer-zone, .kanji-readings.drag-quiz .quiz-item { height:' + (48 * n) + 'px }'+
          '#announcement { height:' + (105 * n) + 'px }'+
          '#announcement .announcement { height:' + (70 * n) + 'px }'+
          '.multi-vocab { min-height:' + (64 * n) + 'px }'+
          // line-height
          '.secondary-answer { line-height:' + (10 * n) + 'px; }'+
          '#exercise-list li a[data-page]:focus:after, #exercise-list li a[data-page]:hover:after { line-height:' + (12 * n) + 'px; }'+
          '.writing-quiz .quiz-item:before, .helper-present #question-list .quiz-item:before { line-height:' + (15 * n) + 'px; }'+
          '.kanji-readings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .kanji-meanings.drag-quiz .vocab-horizontal #question-list .quiz-answer-zone .quiz-item, .drag-quiz .quiz-item, .drag-quiz .quiz-answer-zone, .problem-hint, .problem-answer { line-height:' + (20 * n) + 'px; }'+
          '.kana-quiz .quiz-answer-zone:empty, .kana-quiz .quiz-item { line-height:' + (22 * n) + 'px; }'+
          '#genki-site-settings, #quiz-progress-text { line-height:' + (26 * n) + 'px; }'+
          '#quick-jisho-title { line-height:' + (32 * n) + 'px; }'+
          '.vocab-key:before { line-height:' + (34 * n) + 'px; }'+
          '#genki-modal-buttons, #genki-modal-header { line-height:' + (40 * n) + 'px; }'+
          '.kanji-readings.drag-quiz #question-list .quiz-item, .kanji-meanings.drag-quiz #question-list .quiz-item { line-height:' + (44 * n) + 'px; }'+
          // padding
          '.vocab-key { padding-top:' + (30 * n) + 'px; }'+
          // margin
          '.writing-quiz .helper-present #question-list .quiz-item[data-helper] { margin-bottom:' + (3 * n) + 'px; }'+
          '.quiz-multi-answer.next-question:before { margin-top:-' + (9 * n) + 'px; }'+
          '.quiz-multi-answer:before { margin-top:-' + (10 * n) + 'px; }'+
          '.writing-quiz .quiz-answer-row.furi-row { margin-bottom:' + (12 * n) + 'px; }'+
          '.def-ja.def-furi { margin-bottom:' + (15 * n) + 'px; }'+
          '.vocab-horizontal.helper-present #question-list .quiz-item, .helper-present #question-list .quiz-item[data-helper], .helper-present #drop-list .quiz-answer-zone.helper-answer { margin-bottom:' + (18 * n) + 'px; }'+
          '.problem-hint, .problem-answer { margin-bottom:-' + (20 * n) + 'px; }'+
          '.fill-quiz .small-margin .block, .fill-quiz .small-margin .problem { margin-bottom:' + (25 * n) + 'px; }'+
          '.question-block { margin:' + (30 * n) + 'px 0; }'+
          '.fill-quiz .big-margin, .fill-quiz .example-problem, .fill-quiz .problem, .fill-quiz.quiz-over td .writing-zone { margin-bottom:' + (40 * n) + 'px; }'+
          // positioning
          '.kana-quiz .answer-correct .quiz-item:before { top:-' + (5 * n) + 'px; right:-' + (8 * n) + 'px; }'+
          '.writing-quiz .quiz-item:before, .helper-present #question-list .quiz-item:before, .def-ja.def-furi i { bottom:-' + (15 * n) + 'px }'+
          '.question-block:after { top:-' + (20 * n) + 'px }'+
          '.quiz-multi-answer:before { left:-' + (25 * n) + 'px }'+
          '#genki-modal-content { top:' + (40 * n) + 'px }'+
          '#genki-modal-content { bottom:' + (40 * n) + 'px }'+
          '#wrongAnswer:before { right:-' + (70 * n) + 'px }'+
          '.quiz-over [data-mistakes]:after { right:-' + (85 * n) + 'px }'+
          // bottom borders
          '.fill-quiz .writing-zone-input, .section-title, .lesson-title, #link-list a { border-bottom-width:' + ( 2 * n ) + 'px; }'+
          // modal position
          '#genki-modal-body { top:' + (10 / n) + '%; left:' + (25 / n) + '%; right:' + (25 / n) + '%; bottom:' + (40 / n) + '%; }'+
          // exercise list
          '#exercise-list { width:' + (300 * n) + 'px; left:-' + (301 * n) + 'px; }'+
          '#toggle-exercises.list-open { left:' + ((300 * n) - 30) + 'px; }'+
          // quick jisho
          '#quick-jisho-window { height:' + ( 300 * n ) + 'px; width:' + ( 500 * n ) + 'px; }'+
          '#quick-jisho-window.quick-jisho-hidden { bottom:-' + (310 * n) + 'px; }'+
          '#quick-jisho-results { height:' + (219 * n) + 'px; }'+
          '#quick-jisho-search { height:' + (35 * n) + 'px; }'+
          '.quick-jisho-row, #quick-jisho-results { padding:' + (3 * n) + 'px; }'+
          '#quick-jisho-selector { border-radius:' + (15 * n) + 'px; }'+
          // quick nav sub-section buttons
          '#quick-nav-list a.sub-section-button { font-size:' + ( 11 * n ) + 'px; height:' + ( 18 * n ) + 'px; width:' + ( 18 * n ) + 'px; line-height:' + ( 20 * n ) + 'px; left:-' + ( 22 * n ) + 'px; }'+
          '#quick-nav-list li:before { height:' + ( 6 * n ) + 'px; width:' + ( 6 * n ) + 'px; left:-' + ( 16 * n ) + 'px; }'+
          '#quick-nav-list li ul li:before { height:' + ( 4 * n ) + 'px; width:' + ( 4 * n ) + 'px; }'+
          // play buttons
          '.button.play-button { height:' + ( 25 * n ) + 'px; width:' + ( 25 * n ) + 'px; }'+
          '.button.play-button i { font-size:' + ( 14 * n ) + 'px; }'+
          // example
          '.example-problem:before { font-size:' + ( 12 * n ) + 'px; line-height:' + ( 12 * n ) + 'px; padding:' + ( 2 * n ) + 'px; border-radius:' + ( 5 * n ) + 'px; }'+
          '.example-problem.inline-columns { padding-left:' + ( 62 * n ) + 'px; }'+
          // furigana (disabled; reason: 10/25/2020 furigana update)
          //'ruby { bottom:-' + ( 16 * n ) + 'px; margin:-' + ( 16 * n ) + 'px 0 ' + ( 16 * n ) + 'px 0 }'+
          //'ruby rt { height:' + ( 15 * n ) + 'px; line-height:' + ( 15 * n ) + 'px; margin-top:-' + ( 1 * n ) + 'px; }'+
          // section numbers/icons
          '.sectionNumber3rd, .section-number { width:' + ( 22 * n ) + 'px; height:' + ( 22 * n ) + 'px; line-height:' + ( 21 * n ) + 'px; }'+
          // info icon
          '#quiz-info { padding:' + ( 15 * n ) + 'px ' + ( 15 * n ) + 'px ' + ( 15 * n ) + 'px ' + ( 50 * n ) + 'px; }'+
          '#quiz-info:before { font-size:' + ( 32 * n ) + 'px; margin-top:-' + ( 16 * n ) + 'px; left:' + ( 12 * n ) + 'px; }'+
          // announcement controls
          '#announcement .announce-controls { margin-top:-' + ( 15 * n ) + 'px; height:' + ( 30 * n ) + 'px; width:' + ( 20 * n ) + 'px; }'+
          '#announcement .announce-controls i.fa { font-size:' + ( 18 * n ) + 'px; line-height:' + ( 26 * n ) + 'px; }'+
          '#announcement .announce-controls.button-left { left:-' + ( 20 * n ) + 'px; }'+
          '#announcement .announce-controls.button-right { right:-' + ( 20 * n ) + 'px; }'+
          '#announce-list { margin:0 ' + ( 20 * n ) + 'px; }'+
          // overrides
          '.drawing-quiz .stroke-order-button, .dictionary-group .group-selectors .button, .dict-search-wrapper .group-selectors .button, .button.icon-only, .kanji-stroke-order, .kanji-stroke-order .button, .drawing-zone { font-size:13px }'+
          '.dictionary-group .group-selectors .deselect-all:before, .dictionary-group .group-selectors .select-all:before, .dict-search-wrapper .group-selectors .deselect-all:before, .dict-search-wrapper .group-selectors .select-all:before { font-size:17px }'+
          '.button.icon-only .fa, #random-exercise i { font-size:18px }'+
        '/*FONT-SIZE-END*/';
        
        // replace old css rules
        if (/\/\*FONT-SIZE-START\*\//.test(GenkiSettings.stylesheet.innerText)) {
          GenkiSettings.stylesheet.innerText = GenkiSettings.stylesheet.innerText.replace(/\/\*FONT-SIZE-START\*\/.*?\/\*FONT-SIZE-END\*\//, css);
        }

        // add new css rules
        else {
          GenkiSettings.stylesheet.innerText += css;
        }
        
        // update the width of input elements
        if (caller) { // if caller is not present, CSS was updated on page load, thus the following elements are null
          for (var input = document.querySelectorAll('[data-default-width]'), i = 0, j = input.length; i < j; i++) {
            input[i].style.width = (input[i].dataset.defaultWidth * n) + 'px';
          }
        }
      }
      
      // save setting to localStorage
      if (caller) localStorage.genkiFontSize = caller.value;
    },
    
    
    // updates the page width
    updatePageWidth : function (caller, updateCSS) {
      var n = (caller ? +caller.value : localStorage.genkiPageWidth) / 100;
      
      // update number value
      if (caller) caller.nextSibling.innerText = caller.value + '%';
      
      // update the CSS
      if (updateCSS) {
        var css = '/*PAGE-WIDTH-START*/'+
          '.content-block, #announce-inner { max-width:' + (1000 * n) + 'px }'+
        '/*PAGE-WIDTH-END*/';
        
        // replace old css rules
        if (/\/\*PAGE-WIDTH-START\*\//.test(GenkiSettings.stylesheet.innerText)) {
          GenkiSettings.stylesheet.innerText = GenkiSettings.stylesheet.innerText.replace(/\/\*PAGE-WIDTH-START\*\/.*?\/\*PAGE-WIDTH-END\*\//, css);
        } 
        
        // add new css rules
        else {
          GenkiSettings.stylesheet.innerText += css;
        }
      }
      
      // save setting to localStorage
      if (caller) localStorage.genkiPageWidth = caller.value;
    },
    
    
    // updates theme state
    updateTheme : function (caller) {
      var theme = document.getElementById('website-theme');
      
      // remove current theme
      if (theme) {
        theme.parentNode.removeChild(theme);
      }
      
      // apply new theme
      if (caller.value != 'genki1') {
        var theme = document.createElement('LINK');
        theme.id = 'website-theme';
        theme.href = getPaths() + 'resources/css/theme-' + caller.value + '.min.css';
        theme.rel = 'stylesheet';
        document.head.appendChild(theme);
      }
      
      // save preference to cache
      if (storageOK) {
        localStorage.genkiTheme = caller.value;
      }
    },
    
    
    // updates language preference
    updateLang : function (caller, lang) {
      GenkiLang = lang ? lang : caller.value;
      document.documentElement.className = document.documentElement.className.replace(/lang-(?:en|ja)/, 'lang-' + (lang ? lang : caller.value));
      
      // save preference to cache
      if (storageOK) {
        localStorage.genkiLang = lang ? lang : caller.value;
      }
      
      // reset settings manager to apply new language
      if (!lang) {
        GenkiSettings.manager();
        document.getElementById('settings-lang').focus();
      }
    },
    
    
    // updates dark mode state
    updateDarkMode : function (caller) {
      document.getElementById('light-switch-checkbox').click();
      GenkiSettings.updateButton(caller);
    },
    
    
    // updates adverts state
    updateAdverts : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {
        localStorage.adverts = state == 'ON' ? 'on' : 'off';
        GenkiSettings.reloadPrompt();
      });
    },
    
    
    // updates custom css
    updateCustomCSS : function (caller, updateCSS) {
      // update the CSS
      if (updateCSS) {
        var css = '/*CUSTOM-CSS-START*/' + (caller ? caller.value : localStorage.genkiCustomCSS) + '/*CUSTOM-CSS-END*/';
        
        // replace old css rules
        if (/\/\*CUSTOM-CSS-START\*\//.test(GenkiSettings.stylesheet.innerText)) {
          GenkiSettings.stylesheet.innerText = GenkiSettings.stylesheet.innerText.replace(/\/\*CUSTOM-CSS-START\*\/.*?\/\*CUSTOM-CSS-END\*\//, css);
        } 
        
        // add new css rules
        else {
          GenkiSettings.stylesheet.innerText += css;
        }
      }
      
      // save setting to localStorage
      if (caller) localStorage.genkiCustomCSS = caller.value;
    },
    
    
    // updates the feedback mode preference
    updateFeedbackMode : function (caller) {
      if (caller) {
        localStorage.feedbackMode = caller.value;
        
        if (window.Genki && Genki.feedbackMode) {
          Genki.feedbackMode = caller.value;
        }
        
        // toggle display state of the next button
        var next = document.getElementById('next-button');
        
        if (next) {
          // automatically proceed to next question if the student answered while in instant mode and switched to classic mode
          if (Genki.feedbackMode == 'classic' && /visible/.test(next.style.visibility)) {
            next.firstChild.click();
          }
          
          next.style.display = Genki.feedbackMode == 'classic' ? 'none' : '';
        }
      }
    },
    
    
    // updates the random exercise preference
    updateRandomExercise : function (caller) {
      var list = document.getElementById('random-exercise-list');
      
      if (caller) { 
        localStorage.genkiRandomExercise = caller.value;
        
        if (list) {
          list.style.display = caller.value == 'custom' ? '' : 'none';
        }
      }
    },
    
    // opens a window to manage random exercise selection
    randomExerciseList : function () {
      GenkiModal.open({
        title : '<span class="en">Random Exercise List</span><span class="ja">ランダム練習リスト</span>',
        content : 
          '<span class="en">Please select the exercises that you would like to practice.</span><span class="ja">練習するための練習問題を選択してください。</span>'+
          '<div class="columns-2 clear">'+
            '<div>'+
              '<h3 class="main-color"><span class="en">Selected Exercises</span><span class="ja">選択した練習問題</span></h3>'+
              '<div id="random-selected" class="random-exercise-list"></div>'+
            '</div>'+
            '<div>'+
              '<h3 class="main-color"><span class="en">Exercises</span><span class="ja">練習問題</span></h3>'+
              '<div id="random-list" class="random-exercise-list"></div>'+
            '</div>'+
          '</div>'+
          '<div class="center"><button class="button" onclick="GenkiSettings.clearRandomList();"><i class="fa">&#xf12d;</i><span class="en">Clear Selected Exercises</span><span class="ja">選択した練習問題を解除する</span></button></div>',
        closeButtonText : '<span class="en">Return to Settings</span><span class="ja">設定に戻る</span>',

        closeCallback : function () {
          setTimeout(GenkiSettings.manager, 10);
        },
        
        customSize : {
          top : '5%',
          left : '10%',
          bottom : '5%',
          right : '10%'
        }
      });
      
      // parse random exercise list
      var parseExercises = function () {
        // parse the exercise list and selected exercise list
        for (var list = '', selected = '', i = 0, j = GenkiExercises.length, data, checked, item; i < j; i++) {
          checked = GenkiRandomList.indexOf(GenkiExercises[i]) != -1;
          data = GenkiExercises[i].split('|');
          
          if (!/study-tools|appendix/i.test(data[0])) {
            item = '<div data-lesson="' + data[0].replace(/.*?lesson-(\d+).*/, 'L$1') + '" data-path="' + data[0] + '" data-name="' + data[1] + '">'+
                '<input class="def-selector genki_input_hidden" type="checkbox" onchange="GenkiSettings.updateRandomList(this, \'' + GenkiExercises[i] + '\');"' + (GenkiRandomList.indexOf(GenkiExercises[i]) != -1 ? ' checked' : '') + '>'+
                '<span tabindex="0" class="genki_pseudo_checkbox" onclick="this.previousSibling.click();" onkeypress="event.key == \'Enter\' && this.previousSibling.click();"></span>'+
              '<a href="' + getPaths() + 'lessons' + (GenkiEd == '3rd' ? '-3rd' : '') + '/' + data[0] + '/' + (window.location.protocol == 'file:' ? 'index.html' : '') + '" target="_blank">' + data[1] + '</a>'+
            '</div>';
            
            list += item;
            if (checked) selected += item;
          }
        }
        
        // add the exercises to their respective lists
        document.getElementById('random-list').innerHTML = list;
        document.getElementById('random-selected').innerHTML = selected;
      };
      
      // load exercise data
      if (!window.GenkiExercises) {
        var exercises = document.createElement('SCRIPT');
        exercises.src = getPaths() + 'resources/javascript/exercises/' + (/lessons-3rd/.test(window.location.pathname) ? '3rd' : '2nd') + '-ed.min.js';
        exercises.onload = parseExercises;
        document.body.appendChild(exercises);
      } else {
        parseExercises();
      }
    },
    
    // updates the user's selected random exercises
    updateRandomList : function (caller, data) {
      
      // add exercise to the random list
      if (caller.checked) {
        GenkiRandomList.push(data);
        
        document.getElementById('random-selected').appendChild(caller.parentNode.cloneNode(true));
      }
      
      // remove exercise from the random list
      else {
        GenkiRandomList.splice(GenkiRandomList.indexOf(data), 1);
        
        var selected = document.querySelector('#random-selected [data-path="' + caller.parentNode.dataset.path + '"]'),
            checkbox = document.querySelector('#random-list [data-path="' + caller.parentNode.dataset.path + '"] input');
        
        if (selected) selected.parentNode.removeChild(selected);
        if (checkbox) checkbox.checked = false;
      }
      
      // save selected exercises to local storage
      localStorage['genkiRandomList' + GenkiEd] = JSON.stringify(GenkiRandomList);
    },
    
    // clears the random exercise list
    clearRandomList : function () {
      if (confirm(GenkiLang == 'ja' ? 'すべての選択した練習問題を解除してもよろしいですか？' : 'All selected exercises will be cleared. Do you want to continue?')) {
        for (var a = document.querySelectorAll('#random-selected input'), i = 0, j = a.length; i < j; i++) {
          a[i].click();
        }
      }
    },
    
    
    // updates vocab spoiler preference
    updateSpoilerMode : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {

        if (document.querySelector('.vocab-spoiler')) {
          var zone = document.getElementById('quiz-zone');

          if (state == 'ON') {
            zone.className += ' spoiler-mode';
          } else {
            zone.className = zone.className.replace('spoiler-mode', '');
          }
        }

        localStorage.spoilerMode = state == 'ON' ? 'true' : 'false';
      });
    },
    
    
    // updates furigana preference
    updateFurigana : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {
        var button = document.getElementById('toggle-furigana');

        // update preferences by clicking the button if it's present
        if (button) {
          button.click();
        }
        
        // otherwise manually update the localStorage preference
        else {
          localStorage.furiganaVisible = state == 'ON' ? 'true' : 'false';
        }
      });
    },
    
    
    // updates furigana preference
    updateVocabMode : function (caller) {
      var button = document.getElementById('toggle-orientation');

      // update preferences by clicking the button if it's present
      if (button) {
        button.click();
      }

      // otherwise manually update the localStorage preference
      else {
        localStorage.vocabHorizontal = caller.value;
      }
    },

    
    // updates exercise type selection skipping preference
    updateSkipExType : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {
        localStorage.genkiSkipExType = state == 'ON' ? 'true' : 'false';
      });
    },

    
    // updates exercise type selection skipping preference
    updateJishoLookUp : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {
        localStorage.genkiJishoLookUp = state == 'ON' ? 'true' : 'false';
      });
    },

    
    // updates stroke order preference
    updateStrokeOrder : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {
        var button = document.getElementById('toggle-stroke-order');

        // update preferences by clicking the button if it's present
        if (button) {
          button.click();
        }
        
        // otherwise manually update the localStorage preference
        else {
          localStorage.strokeOrderVisible = state == 'ON' ? 'true' : 'false';
        }
      });
    },

    
    // updates stroke order preference
    updateTracingGuide : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {
        var button = document.getElementById('toggle-tracing-guide');

        // update preferences by clicking the button if it's present
        if (button) {
          button.click();
        }
        
        // otherwise manually update the localStorage preference
        else {
          localStorage.tracingGuideVisible = state == 'ON' ? 'true' : 'false';
        }
      });
    },
    
    // updates data backup reminder
    updateDataBackupReminder : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {
        localStorage.dataBackupReminder = state == 'ON' ? 'true' : 'false';
      });
    },

    // updates timer auto pause preference
    updateTimerAutoPause : function (caller) {
      GenkiSettings.updateButton(caller, function (state) {
        localStorage.timerAutoPause = state == 'ON' ? 'true' : 'false';

        if (state == 'ON') {
          document.addEventListener("visibilitychange", Genki.startOrPauseTimerByVisibility);
        } else {
          document.removeEventListener("visibilitychange", Genki.startOrPauseTimerByVisibility);
        }
      });
    },
    
    // creates the global settings stylesheet
    createStylesheet : function () {
      if (!GenkiSettings.stylesheet) {
        GenkiSettings.stylesheet = document.createElement('STYLE');
        GenkiSettings.stylesheet.type = 'text/css';

        // append stylesheet to the document
        document.getElementsByTagName('HEAD')[0].appendChild(GenkiSettings.stylesheet);
      }
    }
  };
  
  // apply global settings on page load
  if (storageOK) {
    GenkiSettings.createStylesheet();
    
    // applies settings while the page is still loading, so long as they're not their default values
    // apply selected font size
    if (localStorage.genkiFontSize && localStorage.genkiFontSize != '100') {
      GenkiSettings.updateFontSize(false, true);
    }
    
    // apply selected page width
    if (localStorage.genkiPageWidth && localStorage.genkiPageWidth != '100') {
      GenkiSettings.updatePageWidth(false, true);
    }
    
    // apply custom CSS
    if (localStorage.genkiCustomCSS && localStorage.genkiCustomCSS != '') {
      GenkiSettings.updateCustomCSS(false, true);
    }
  }
  
  
  // # DARK MODE #
  // applies the dark mode theme on page load
  if (storageOK) {
    // automatically enables dark mode (once) based on the user's preferences
    if (!localStorage.darkMode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      localStorage.darkMode = 'on';
    }

    // applies the dark mode theme on page load
    if (localStorage.darkMode == 'on') {
      document.write('<link id="dark-mode" href="' + getPaths() + 'resources/css/stylesheet-dark.min.css" rel="stylesheet">');
      document.documentElement.className += ' dark-mode';
    }
  }
  
  
  // # THEME #
  // applies the selected theme on page load
  if (storageOK) {
    if (localStorage.genkiTheme && localStorage.genkiTheme != 'genki1') {
      document.write('<link id="website-theme" href="' + getPaths() + 'resources/css/theme-' + localStorage.genkiTheme + '.min.css" rel="stylesheet">');
    }
  }
  
  
  // # LANGUAGE #
  // applies the selected language on page load
  if (storageOK) {
    if (localStorage.genkiLang && localStorage.genkiLang != 'lang-en') {
      document.documentElement.className = document.documentElement.className.replace(/lang-(?:en|ja)/, 'lang-' + localStorage.genkiLang);
    }
  }
  
  
  // # FONT PRE-LOADING #
  // pre-loads fonts for kanji canvases
  window.preLoadFonts = function () {
    // function used to redraw canvases once the font is loaded
    var redraw = function () {
      if (window.KanjiCanvas) {
        for (var a = document.querySelectorAll('.kanji-canvas'), i = 0, j = a.length; i < j; i++) {
          if (KanjiCanvas['canvas_' + a[i].id]) {
            KanjiCanvas.redraw(a[i].id, true);
          }
        }
      }
    };
    
    // loop through arguments to form @font-face rules and apply events for loading fonts
    for (var a = arguments, i = 0, j = arguments.length, styles = '', fonts = '', font; i < j; i++) {
      font = a[i].replace(/\..*?$/, '');
      fonts += font + (i == j - 1 ? '' : ', ');
      styles += 
        '@font-face {'+
          'font-family:"' + font + '";'+
          'src:url(' + getPaths() + 'resources/fonts/' + a[i] + ') format("' + (/otf/.test(a[i]) ? 'opentype' : /ttf/ ? 'truetype' : '') + '");'+
        '}\n';
    }
    
    // apply @font-face rules to the document
    document.write('<style>' + styles + '</style>');
    
    // load and render fonts
    if (document.fonts && document.fonts.load) {
      document.fonts.load('10px ' + fonts).then(redraw);
    } 
    // fallback
    else {
      document.write('<span style="font-family:' + fonts + ';opacity:0;position:absolute;font-size:0;height:0;width:0;">' + fonts + '</span>');
      window.setTimeout(redraw, 1500);
    }
  };
  
  
  // # LIMITED MODE WARNING #
  // If cookies are blocked, Genki Study Resources will run in limited mode. Settings are not remembered in this mode and certain features, such as dark mode, are unavailable.
  if (!navigator.cookieEnabled) {
    console.warn('Cookies are not available either due to host or browser settings. Genki Study Resources will function in limited mode where settings are not remembered and certain features are unavailable. This issue can commonly be resolved by enabling third-party cookies. Please see the following page for help.\nhttps://sethclydesdale.github.io/genki-study-resources/help/stuck-loading/\n\nIf the issue still occurs after enabling third-party cookies, please contact the developer for further assistance.\nhttps://github.com/SethClydesdale/genki-study-resources/issues');
  }
  
  
  // AJAX page getter
  window.Get = function (url, callback, type) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        callback(this.response); // callback on success
      }
    };

    // set response type
    if (typeof type != 'undefined') {
      xhttp.responseType = type;
    }

    // open and send the request
    xhttp.open('get', url, true);
    xhttp.send();

    return xhttp;
  };
  
  
  // copies text to the user's clipboard
  window.CopyText = function (text, caller, callback) {
    if (text) {
      // cache original HTML
      if (!window.CopyTextDefault && caller) {
        window.CopyTextDefault = caller.innerHTML;
      }
      
      // clear text change timeout
      if (window.CopyTextTimeout) {
        clearTimeout(CopyTextTimeout);
      }
      
      // try copying the text
      try {
        navigator.clipboard.writeText(text);
        
        if (caller) {
          caller.innerHTML = '<i class="fa">&#xf00c;</i><span class="en">Copied!</span><span class="ja">コピーした！</span>';
        }
        
        callback && callback(true);

      } catch (err) {
        console.error(err);
                
        if (caller) {
          caller.innerHTML = '<i class="fa">&#xf071;</i><span class="en">Copy Failed</span><span class="ja">コピーが失敗した</span>';
        }
        
        callback && callback(false);
      }
      
      // return text default state
      window.CopyTextTimeout = setTimeout(function () {
        caller.innerHTML = CopyTextDefault;
        delete window.CopyTextTimeout;
        delete window.CopyTextDefault;
      }, 1000);
      
    } else {
      return false;
    }
  };
  
}(window, document));