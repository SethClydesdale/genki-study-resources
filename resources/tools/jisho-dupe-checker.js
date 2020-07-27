// checks for and logs duplicate entries in the dictionary (execute from console while viewing the dictionary)
// if duplicates are found, either A. remove them if the contents are equal OR B. merge them.
var o = {}, n = 0, i, j, k;

for (k in Genki.jisho) {
  for (i = 0, j = Genki.jisho[k].length; i < j; i++) {
    // add definition to object if it's not already defined
    if (!o[Genki.jisho[k][i].ja]) {
      o[Genki.jisho[k][i].ja] = Genki.jisho[k][i].en;
    }
    
    // alerts of duplicate and increments dupe number
    else {
      console.log('(' + (++n) + ') Duplicate found: ', Genki.jisho[k][i]);
    }
  }
}

console[n == 0 ? 'log' : 'warn'](n + ' duplicate' + (n == 1 ? '' : 's') + ' found');
