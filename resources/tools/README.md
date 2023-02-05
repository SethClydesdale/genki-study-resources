# About Tools
This folder contains useful snippets for Genki Study Resources. They're not to be installed on the website directly, so as such this folder is more of a toolbox that you open when you need to get a certain job done. Any snippets present in this folder will be explained below.


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

Syntax:
```javascript
'たけしさんはうちに<ruby>帰<rt>かえ</rt></ruby>ります'.derubify();
```

Return value:
```javascript
{
  ruby: "たけしさんはうちに帰ります",
  rt: "たけしさんはうちにかえります"
}
```

Passing `1` or `true` as a param will return an input sequence for written quizzes instead.
```javascript
'たけしさんはうちに<ruby>帰<rt>かえ</rt></ruby>ります'.derubify(true);
```

Return value:
```javascript
'{たけしさんはうちに帰ります|たけしさんはうちにかえります|answer}'
```

While the examples only shows a replacement of a single ruby tag, replacements for multiple ruby tags in a string are supported automatically.

**Note:** You should define the contents of this script in the console before usage.

If you're using Brackets, you can use [this extension](https://github.com/SethClydesdale/brackets-rubify-text) instead.


### get-char-width.js
Calculates the width of the string, returning a number which can be used in the `width` param of written answers. Useful for when the width cannot be calculated or is not of a desired value.

Syntax:
```javascript
'おはよう'.getCharWidth();
```

Return value: `70`

Return value usage example: `{おはよう||width:70}`

**Note:** You should define the contents of this script in the console before usage.


### jisho-dupe-checker.js
Checks for duplicate entries in the dictionary so that they can either be merged or removed. Execute this script in the console while viewing the [dictionary](https://sethclydesdale.github.io/genki-study-resources/lessons/appendix/dictionary/) to check for any dupes.

Considering how huge it is, we may end up making duplicate entries from time to time. So this script helps ensure the dictionary word count stays accurate, while delegating the tedious job of checking to robots!
 
 
 ### anki_decks_maker.py
 * Requires python 3.6+ with the [genanki](https://pypi.org/project/genanki) pkg installed  
 
 Create [Anki](https://apps.ankiweb.net/) flashcards decks to memorise vocabulary,
 each card that is created is tagged with it's lesson number, type, and category (e.g Lesson_1, Vocabulary, Family) 
 
 ```shell script
python3 anki_decks_maker.py <path_to_lessons_folder>

# For example: 
python3 anki_decks_maker.py ../../lessons-3rd
python3 anki_decks_maker.py ../../lessons
```

You can also generate decks by executing `anki_decks_maker-run.bat` and typing either `2nd` or `3rd` to generate a deck for that edition.
 
All of the decks created are currently available under the [decks](decks/) folder


 ### anki_kanji_decks_maker.py
 
 Similarly to the script above, this generates kanji anki decks! You can generate decks by using `anki_kanji_decks_maker-run.bat`. This only supports the 3rd edition, since the 2nd edition doesn't have meanings/readings exercises.


### wordlist_E-J.py
 * Requires python 3.6+.
 
 Create xlsx wordlist with words and their English meaning to memorise vocabulary,

 
 ```shell script
python3 wordlist_E-J.py <path_to_lessons_folder>

# For example: 
python3 wordlist_E-J.py ../../lessons-3rd
python3 wordlist_E-J.py ../../lessons
```

You can also generate decks by executing `wordlist_E-J-run.bat` and typing either `2nd` or `3rd` to generate a deck for that edition.
 
All of the lists created are currently available under the [wordlists_E-J](wordlists_E-J/) folder