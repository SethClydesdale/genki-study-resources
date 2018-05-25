// # MODIFICATIONS FOR THE HOMEPAGE ONLY #
(function (window, document) {
  'use strict';
  
  // # QUICK SEARCH #
  var results = document.getElementById('quick-search-results'),
      li = document.querySelectorAll('.lesson-exercises li'),
      i = 0,
      j = li.length,
      frag, clone;

  // search for exercises that contain a specific keyword
  document.getElementById('quick-search').oninput = function () {
    frag = document.createDocumentFragment();
    results.innerHTML = '';

    if (this.value) {
      for (i = 0; i < j; i++) {
        if (li[i].innerText.toLowerCase().indexOf(this.value.toLowerCase()) != -1) {
          clone = li[i].cloneNode(true);
          
          // add lesson number to exercise
          clone.dataset.lesson = clone.querySelector('A').href.replace(/.*?(lesson-\d+).*/, function (Match, $1) {
            return $1.charAt(0).toUpperCase() + $1.split('-').pop();
          });
          
          clone.title = li[i].innerText; // add tooltip in case the text gets cut off
          
          frag.appendChild(clone);
        }
      }
    }

    // append the matched exercises or display an error message/hide the search results
    if (frag.childNodes.length) {
      results.appendChild(frag);

    } else {
      results.innerHTML = this.value ? '<li>No exercises found for "' + this.value + '".</li>' : '';
    }
  };
}(window, document));