// Grabs all the exercise links on the index and parses them into a neat little array
// This script should be executed in your console while viewing the index
// Once executed it'll copy the array; you can then use this array to update the `exercises` array in javascript.js
(function() {
  var minify = false, // minifies the output if set to true
      a = document.querySelectorAll('a[href*="lessons"]'), // grab all exercise links; they're in the "lessons" folder
      i = 0,
      j = a.length,
      str = '[' + (minify ? '' : ' // exercise list\n'); // open and start the array
  
  // loop over the links and parse them into a neat {key:value} pair
  for (; i < j; i++) {
    str += (minify ? '' : '  ') + '\'' + a[i].href.replace(/.*?\/lessons\/(.*?\/.*?)\/.*/g, '$1') + '|' + a[i].parentNode.innerText.replace(/(.*?)\s\((.*?)\)/, '$1|$2') + '\'' + ( i == j - 1 ? '' : ',' ) + (minify ? '' : '\n')
  }

  str += ']'; // close the array

  if (window.copy) copy(str); // copy to clipboard, if supported
  console.log(str); // show the result, just in case the above fails
}());