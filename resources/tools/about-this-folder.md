# About Tools
This folder contains useful snippets for developing Genki Study Resources -- basically things that make working on it 100x easier. They're not to be installed on the website directly, so as such this folder is more of a toolbox that you open when you need to get a certain job done. Any snippets present in this folder will be explained below.


### link-grabber.js
This script is for use on the index page where all the exercises are listed. It grabs all the exercise links and parses them into a neat little array. It should be executed in your console while viewing the index page.

The resulting stringified array should be copied to your clipboard, if not, copy the output. Once the array is copied it can be used to update the exercise list in the main js file, javascript.js. (one dir. up from this folder) Scroll towards the bottom where the page specific functions are and find the **exercises** array. Delete it's contents and replace them with the new exercise array that you generated before, using this snippet. Doing so will ensure that the correct prev/next exercises are shown when viewing an exercise.

This should only need to be done whenever new exercises are added to the index.


### vocab-verifier.js
This script is used for verifying if the words in a vocabulary (type : 'drag') exercise have been added to the dictionary or not. Useful for finding words that are missing in the dictionary so that we may add them.

**How to use:** Add ?debug to the end of the URL while viewing a vocab exercise. This will enable debug mode. Once enabled, simply paste this script in your console and hit enter. It should bring up a log with results for each search. If no results are found, the log will be displayed in yellow, letting you know you should investigate further before adding the definition to the dictionary.

**Further verification:** Before a definition is added, you need to verify if the hit was a false positive or not. It's fairly simple; if the definition has special characters (e.g. '...', '~', etc..) try removing them and performing a search in the quick dictionary or a kanji only search as well. If nothing still comes up, the definition should be added to the dictionary.


### derubify.js
This script is for converting `<ruby>` tags in text strings into plain text. It returns two strings: `<ruby>` text and `<rt>` text which can be accessed via the object keys `ruby` or `rt`. Mainly used for converting ruby strings for usage in written quizzes as answers.

Sntax:
```javascript
'たけしさんはうちに<ruby>帰<rt>かえ</rt></ruby>ります。'.derubify();
```

Return value:
```javascript
{
  ruby: "たけしさんはうちに帰ります。",
  rt: "たけしさんはうちにかえります。"
}
```

While the example only shows a replacement of a single ruby tag, replacements of multiple ruby tags in a string are supported automatically.

**Note:** You should define the contents of this script in the console before usage.


### getCharWidth.js
Calculates the width of the string, returning a number which can be used in the `width` param of written answers. Useful for when the width cannot be calculated or is not of a desired value.

Syntax:
```javascript
'おはよう'.getCharWidth();
```

Return value: `70`

Return value usage example: `{おはよう||width:70}`

**Note:** You should define the contents of this script in the console before usage.
