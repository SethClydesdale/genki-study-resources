// Strips ruby and rt tags and returns a clean string for both variations.
// Syntax: ''.derubify();
// Params: returnInput [boolean]; returns an input sequence for written quizzes if `true`
String.prototype.derubify = function (returnInput) {
  var o = {
    ruby : this.replace(/<ruby>(.*?)<rt>.*?<\/rt><\/ruby>/g, '$1'),
    rt : this.replace(/<ruby>.*?<rt>(.*?)<\/rt><\/ruby>/g, '$1')
  };
  
  return returnInput ? '{' + o.ruby + '|' + o.rt + '|answer}' : o;
};
