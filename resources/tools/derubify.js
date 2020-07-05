// Strips ruby and rt tags and returns a clean string for both variations.
// Syntax: ''.derubify();
String.prototype.derubify = function () {
  return {
    ruby : this.replace(/<ruby>(.*?)<rt>.*?<\/rt><\/ruby>/g, '$1'),
    rt : this.replace(/<ruby>.*?<rt>(.*?)<\/rt><\/ruby>/g, '$1')
  };
};
