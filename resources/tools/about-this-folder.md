# About Tools
This folder contains useful snippets for developing Genki Study Resources -- basically things that make working on it 100x easier. They're not to be installed on the website directly, so as such this folder is more of a toolbox that you open when you need to get a certain job done. Any snippets present in this folder will be explained below.

### link-grabber.js
This script is for use on the index page where all the exercises are listed. It grabs all the exercise links and parses them into a neat little array. It should be executed in your console while viewing the index page.

The resulting stringified array should be copied to your clipboard, if not, copy the output. Once the array is copied it can be used to update the exercise list in the main js file, javascript.js. (one dir. up from this folder) Scroll towards the bottom where the page specific functions are and find the **exercises** array. Delete it's contents and replace them with the new exercise array that you generated before using this snippet. Doing so will ensure that the correct prev/next exercises are shown when viewing an exercise.

This should only need to be done whenever new exercises are added to the index.