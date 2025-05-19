(function (window, document) {
  'use strict';

  // set furigana state
  document.body.className = 'helper-' + ((storageOK && localStorage.furiganaVisible == 'false') ? 'hidden' : 'present');
  
  
  // grammar point visibility toggler
  window.GRIndex = {
    // toggles grammar points
    toggle : function (caller, id) {
      var list = document.getElementById('exercises-' + id);

      // show points
      if (/Show/.test(caller.innerHTML)) {
        list.style.display = 'block';
        caller.innerHTML = caller.innerHTML.replace('Show', 'Hide').replace('表示', '非表示');
      }

      // hide points
      else {
        list.style.display = '';
        caller.innerHTML = caller.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
      }
    },
    
    // toggles the display state of all lessons' grammar points
    toggleAll : function (caller) {
      var state = /Show/.test(caller.innerHTML) ? 'show' : 'hide';
      
      if (!GRIndex.buttons) {
        GRIndex.buttons = document.querySelectorAll('.grammar-toggler');
      }
      
      for (var i = 0, j = GRIndex.buttons.length; i < j; i++) {
        if (state == 'show' && /Show/.test(GRIndex.buttons[i].innerHTML)) {
          GRIndex.buttons[i].click();
        }

        else if (state == 'hide' && /Hide/.test(GRIndex.buttons[i].innerHTML)) {
          GRIndex.buttons[i].click();
        }
      }
      
      caller.innerHTML = state == 'show' ? caller.innerHTML.replace('Show', 'Hide').replace('表示', '非表示') : caller.innerHTML.replace('Hide', 'Show').replace('非表示', '表示');
    },
    
    // jumps to the specified grammar point in the URL
    jump : function () {
      if (/l\d+-p\d+|lesson-grammar-\d+/.test(window.location.hash)) {
        var head = /lesson-grammar-\d+/.test(window.location.hash),
            id = window.location.hash.slice(1),
            l = head ? window.location.hash.replace(/.*?lesson-grammar-(\d+).*/, '$1') : window.location.hash.replace(/.*?l(\d+)-p\d+.*/, '$1'),
            p = window.location.hash.replace(/.*?l\d+-p(\d+).*/, '$1'),
            button = document.getElementById('toggler-' + l);
        
        // open grammar points if they're closed
        if (button && /Show/.test(button.innerHTML)) {
          button.click();
          
          try {
            document.getElementById(id).scrollIntoView();
            
          } catch (error) { // fallback for the ancients
            window.location.hash = '#';
            window.location.hash = '#' + id;
          }
        }
      }
    }
  };
  
  // jumps to the clicked entry
  document.addEventListener('click', function (e) {
    var target = e.target;
    
    // loop through parents to find an anchor
    // this is required for cases such as the index list that employs <ruby> tags inside the anchors sometimes
    while (target.tagName != 'A') {
      if (!target.parentNode || target.parentNode.tagName == 'BODY') break;
      else target = target.parentNode;
    }
    
    if (target && target.href && /l\d+-p\d+|lesson-grammar-\d+/.test(target.href)) {
      window.setTimeout(GRIndex.jump, 50); // slight delay before the hash is changed
    }
  });
  
}(window, document));