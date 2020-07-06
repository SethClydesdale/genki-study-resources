// # MODIFICATIONS FOR ALL PAGES (<HEAD>) #
(function (window, document) {
  'use strict';
  
  // # GENKI MODAL #
  // creates a modal or closes one
  window.GenkiModal = {
    
    // opens a new modal
    // params: object (optional)
    // {
    //      title : string,
    //    content : string,
    // buttonText : string,
    //    noFocus : bool, (keeps buttons from being focused)
    //      focus : string, (pass a css selector to focus a specific element; overrides noFocus)
    //   keepOpen : bool, (keeps the modal open when clicking the callback button; useful for opening another modal afterwards)
    //    noClose : bool, (removes the close button)
    //     zIndex : 'low', lowers the z-index so the exercise menu can be used
    //   callback : function
    // } // all values are optional
    open : function (o) {
      o = o ? o : {};

      GenkiModal.close();

      // create the modal and set its params
      var modal = document.createElement('DIV'), button, buttons;
      modal.id = 'genki-modal';
      modal.innerHTML = 
      '<div id="genki-modal-overlay"' + ( o.zIndex == 'low' ? ' style="z-index:1;"' : '' ) + '></div>'+
      '<div id="genki-modal-body"' + ( o.zIndex == 'low' ? ' style="z-index:2;"' : '' ) + '>'+
        '<h2 id="genki-modal-header">' + ( o.title ? o.title : 'Popup' ) + '</h2>'+
        '<div id="genki-modal-content">' + ( o.content ? o.content : '' ) + '</div>'+
        '<div id="genki-modal-buttons" class="center">'+
          (o.noClose ? '' : '<button id="genki-modal-close" class="button" onclick="GenkiModal.close();">Close</button>')+
        '</div>'+
      '</div>';

      // create a button for the callback function
      if (o.callback) {
        button = document.createElement('BUTTON');
        buttons = modal.querySelector('#genki-modal-buttons');

        // set button params
        button.innerText = o.buttonText ? o.buttonText : 'OK';
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
      

      // pause the timer when opening the modal
      if (window.Genki && Genki.timer && Genki.timer.isRunning()) {
        Genki.timer.pause();
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
        Genki.timer.start();
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
  
  
  // # DARK MODE #
  // applies the dark mode theme on page load
  if (navigator.cookieEnabled && window.localStorage && window.localStorage.darkMode == 'on') {
    document.write('<link id="dark-mode" href="' + getPaths() + 'resources/css/stylesheet-dark.min.css" rel="stylesheet">');
    document.documentElement.className += ' dark-mode';
  }
  
  
  // # LIMITED MODE WARNING #
  // If cookies are blocked, Genki Study Resources will run in limited mode. Settings are not remembered in this mode and certain features, such as dark mode, are unavailable.
  if (!navigator.cookieEnabled) {
    console.warn('Cookies are not available either due to host or browser settings. Genki Study Resources will function in limited mode where settings are not remembered and certain features are unavailable. This issue can commonly be resolved by enabling third-party cookies. Please see the following page for help.\nhttps://sethclydesdale.github.io/genki-study-resources/help/stuck-loading/\n\nIf the issue still occurs after enabling third-party cookies, please contact the developer for further assistance.\nhttps://github.com/SethClydesdale/genki-study-resources/issues');
  }
  
}(window, document));