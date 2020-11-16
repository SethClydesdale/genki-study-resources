// script for getting the vocab object and verifying if the words have been added to the dictionary or not
// false positives may be given depending on definition variations
// if so, do an additional check in the quick dictionary by removing certain characters, such as "~" for example or searching kanji only
function verifyVocab (vocab) {
  // load in the dictionary + definitions
  if (!Genki.jisho && !Genki.quickJisho.loading) {
    Genki.quickJisho.create();
    Genki.quickJisho.loading = true;

    var jisho = document.createElement('SCRIPT');
    jisho.src = getPaths() + 'resources/javascript/jisho.min.js';
    jisho.onload = function () {
      Genki.quickJisho.loading = false;
      verifyVocab(vocab);
    };

    document.body.appendChild(jisho);
  }
  
  // perform verification
  else {
    var v, i, j, k, l, results;
    
    for (v in vocab) {
      results = [];

      for (k in Genki.jisho) {
        for (i = 0, j = Genki.jisho[k].length; i < j; i++) {
          for (l in Genki.jisho[k][i]) {
            if (Genki.jisho[k][i][l].indexOf(v) != -1) {
              results.push(Genki.jisho[k][i]);
              break;
            }
          }
        }
      }
      
      console[results.length ? 'log' : 'warn'](results.length + ' result' + (results.length == 1 ? '' : 's') + ' found for "' + v + '"', results);
    }
  }
};

// switch to debug mode if not enabled
if (!/\?debug/.test(window.location.search)) {
  window.location.search = '?debug';
}

// verify the vocab
else {
  verifyVocab(JSON.parse(Genki.exerciseData).quizlet);
}