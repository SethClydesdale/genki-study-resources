window.Genki = {
  problems : 0, // number of problems to solve in the lesson
    solved : 0, // number of problems solved
  mistakes : 0, // number of mistakes made in the lesson
  score : 0, // the student's score
  
  // frequently used strings
  lang : {
    std_drag : 'Read the Japanese on the left and match the correct meaning by dragging an answer from the right.',
    std_kana : 'Drag the Kana to the matching Romaji.',
    std_num : 'Drag the Numbers to the matching Kana.',
    std_multi : 'Solve the problems by choosing the correct answers.',
    mistakes : 'The items outlined in <span class="t-red">red</span> were answered wrong before finding the correct answer. Review these problems before trying again.',
    multi_mistakes : 'The answers you selected that were wrong are outlined in <span class="t-red">red</span>. The correct answers are outlined in <span class="t-orange">orange</span>. Review these problems before trying again.'
  },
  
  
  // scroll to the specified element
  scrollTo : function (el) {
    window.setTimeout(function () {
      document.body.scrollTop = el.offsetTop;
      document.documentElement.scrollTop = el.offsetTop;
    }, 100);
  },
  
  
  // To generate a quiz simply pass an object with the necessary data (see vocab-1/index.html and other quiz files for examples)
  generateQuiz : function (o) {

    // create a drag and drop quiz
    if (o.type == 'drag') {
      var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
          dropList = '<div id="drop-list">',
          keysQ = [],
          keysA,
          i;

      // generate a key list for the quizlet so we can randomly sort questions and answers
      for (i in o.quizlet) {
        keysQ.push(i);
      }
      keysA = keysQ.slice(0);

      // generate the questions
      while (keysQ.length) {
        i = Math.floor(Math.random() * keysQ.length);
        quiz += '<div class="quiz-item">' + keysQ[i] + '</div>';
        dropList += '<div class="quiz-answer-zone" data-text="' + keysQ[i] + '" data-mistakes="0"></div>';
        keysQ.splice(i, 1);
        ++Genki.problems;
      }
      quiz += '</div>' + dropList + '</div>'; // close the question list and add the drop list


      // generate the answers
      quiz += '<div id="answer-list">';
      while (keysA.length) {
        i = Math.floor(Math.random() * keysA.length);
        quiz += '<div class="quiz-item" data-answer="' + keysA[i] + '">' + o.quizlet[keysA[i]] + '</div>';
        keysA.splice(i, 1);
      }
      quiz += '</div>'; // close the answer list

      // add the quiz to the document
      document.getElementById('quiz-zone').innerHTML = quiz;

      // setup drag and drop
      var drake = dragula([document.querySelector('#answer-list')], {
        isContainer : function (el) {
          return el.classList.contains('quiz-answer-zone');
        }
      });

      // check if the answer is correct before dropping the element
      drake.on('drop', function (el, target, source) {
        if (target.parentNode.id == 'drop-list'){

          // if the answer is wrong we'll send the item back to the answer list
          if (el.dataset.answer != target.dataset.text) {
            document.getElementById('answer-list').append(el);

            // global mistakes are incremented along with mistakes specific to problems
            target.dataset.mistakes = ++target.dataset.mistakes;
            ++Genki.mistakes;

          } else {
            target.className += ' answer-correct';

            // when all problems have been solved..
            // stop the timer, show the score, and congratulate the student
            if (++Genki.solved == Genki.problems) {
              Genki.endQuiz();
            }
          }
        }
      });
    }


    // create a kana drag and drop quiz
    if (o.type == 'kana') {
      var zone = document.getElementById('quiz-zone'),
          quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list" class="clear">',
          answers = '<div id="answer-list">',
          kanaList = [],
          kana = o.quizlet,
          i = kana.length - 1,
          k;

      // create the columns for the student to drop the kana into
      for (; i > -1; i--) {
        quiz += '<div class="quiz-column">';

        // insert the romaji and empty container for dropping the kana
        for (k in kana[i]) {
          quiz += 
          '<div class="quiz-item-row">'+
            '<div class="quiz-answer-zone" data-text="' + kana[i][k] + '" data-mistakes="0"></div>'+
            '<div class="quiz-item">' + kana[i][k] + '</div>'+
          '</div>';

          // put the kana into an array for later..
          kanaList.push('<div class="quiz-item" data-answer="' + kana[i][k] + '">' + k + '</div>');
          ++Genki.problems;
        }

        quiz += '</div>'; // close the column
      }

      // randomize the kana order, so the student cannot memorize the locations
      while (kanaList.length) {
        i = Math.floor(Math.random() * kanaList.length);
        answers += kanaList[i];
        kanaList.splice(i, 1);
      }

      // add the kana list to the document
      zone.innerHTML = quiz + '</div>' + answers + '</div>';
      zone.className += ' kana-quiz'; // change the quiz styles

      // setup drag and drop
      var drake = dragula([document.querySelector('#answer-list')], {
        isContainer : function (el) {
          return el.classList.contains('quiz-answer-zone');
        }
      });

      // check if the answer is correct before dropping the element
      drake.on('drop', function (el, target, source) {
        if (target.parentNode.className == 'quiz-item-row'){

          // if the answer is wrong we'll send the kana back
          if (el.dataset.answer != target.dataset.text) {
            document.getElementById('answer-list').append(el);

            // global mistakes are incremented along with mistakes specific to problems
            target.dataset.mistakes = ++target.dataset.mistakes;
            ++Genki.mistakes;

          } else {
            target.className += ' answer-correct';

            // when all problems have been solved..
            // stop the timer, show the score, and congratulate the student
            if (++Genki.solved == Genki.problems) {
              Genki.endQuiz();
            }
          }
        }
      });
    }


    // create a multiple choice quiz
    if (o.type == 'multi') {
      var zone = document.getElementById('quiz-zone'),
          quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
          answers = '<div id="answer-list">',
          option = ['A', 'B', 'C', 'D'], oid = 0, // used for tagging answers as A, B, C..
          isAnswer = false,
          q = o.quizlet,
          i = 0,
          j = q.length,
          n;

      // create individual blocks for each question and hide them until later
      for (; i < j; i++) {
        quiz += '<div id="quiz-q' + i + '" class="question-block" data-qid="' + (i + 1) + '" style="display:none;"><div class="quiz-multi-question">' + q[i].question + '</div>';

        // add answers A-B to the question block
        while (q[i].answers.length) {
          n = Math.floor(Math.random() * q[i].answers.length);

          // answers that begin with "A" are the correct answer
          if (/^A/.test(q[i].answers[n])) {
            q[i].answers[n] = q[i].answers[n].slice(1);
            isAnswer = true;
          }

          quiz += '<div class="quiz-multi-row"><button class="quiz-multi-answer" data-answer="' + isAnswer + '" data-option="' + option[oid++] + '" onclick="Genki.progressQuiz(this);">' + q[i].answers[n] + '</button></div>';
          isAnswer = false;

          q[i].answers.splice(n, 1);
        }

        quiz += '</div>'; // ends the question block
        oid = 0; // resets the option id so the next answers begin with A, B, C..
        ++Genki.problems;
      }

      // add the multi-choice quiz to the quiz zone
      zone.innerHTML = quiz + '</div><div id="quiz-progress"><div id="quiz-progress-bar"></div></div>';
      zone.className += ' multi-quiz'; // change the quiz styles

      // begin the quiz
      Genki.progressQuiz('init');
    }


    // setup timer
    var timer = new Timer(),
        clock = document.getElementById('quiz-timer');

    clock.innerHTML = '00:00:00'; // placeholder
    timer.start();
    timer.addEventListener('secondsUpdated', function (e) {
      clock.innerHTML = timer.getTimeValues().toString()
    });

    Genki.timer = timer;
    Genki.drake = drake;

    // jump to the quiz info
    Genki.scrollTo(document.getElementById('quiz-info'));
  },
  
  
  // increment the progress bar (for multi-choice quizzes)
  incProgressBar : function () {
    var bar = document.getElementById('quiz-progress-bar'),
        progress = Math.floor((Genki.solved+1) / Genki.problems * 100);

    bar.style.width = progress + '%';
    bar.innerHTML = '<span id="quiz-progress-text">' + (Genki.solved+1) + '/' + Genki.problems + '</span>';
  },
  
  
  // show the next question in a multi-choice quiz
  progressQuiz : function (answer) {
    if (answer == 'init') {
      document.getElementById('quiz-q' + Genki.solved).style.display = '';
      Genki.incProgressBar();

    } else {
      // mark the selected answer for reviews
      answer.className += ' selected-answer';

      // hide the prior question
      document.getElementById('quiz-q' + Genki.solved++).style.display = 'none';

      // increment mistakes if the chosen answer was wrong and add a class to the parent
      if (answer.dataset.answer == 'false') {
        answer.parentNode.parentNode.className += ' wrong-answer';
        ++Genki.mistakes;
      }

      // if there's another question, show it
      var next = document.getElementById('quiz-q' + Genki.solved);
      if (next) {
        next.style.display = '';
        Genki.incProgressBar();
      } else {
        Genki.endQuiz(true);

        // show all questions and answers
        for (var q = document.querySelectorAll('[id^="quiz-q"]'), i = 0, j = q.length; i < j; i++) {
          q[i].style.display = '';
        }

        // hide the progress bar
        document.getElementById('quiz-progress').style.display = 'none';
      }
    }
  },
  
  
  // ends the quiz
  endQuiz : function (multi) {
    // calculate the total score based on problems solved and mistakes made
    Genki.score = Math.floor((Genki.solved - Genki.mistakes) * 100 / Genki.problems);
    Genki.timer.stop();

    // hide the timer and store it so we can show the completion time in the results
    var timer = document.getElementById('quiz-timer');
    timer.style.display = 'none';

    // show the student their results
    document.getElementById('quiz-result').innerHTML = 
    '<div id="complete-banner" class="center">Quiz Complete!</div>'+
    '<div id="result-list">'+
      '<div class="result-row"><span class="result-label">Problems Solved:</span>' + Genki.problems + '</div>'+
      '<div class="result-row"><span class="result-label">Answers Wrong:</span>' + Genki.mistakes + '</div>'+
      '<div class="result-row"><span class="result-label">Score:</span>' + Genki.score + '%</div>'+
      '<div class="result-row"><span class="result-label">Completion Time:</span>' + timer.innerHTML + '</div>'+
      '<div class="result-row center">'+
        ( // depending on the score, a specific message will show
          Genki.score == 100 ? 'PERFECT! Great Job, you have mastered this quiz! Feel free to move on or challenge yourself by trying to beat your completion time.' :
          Genki.score > 70 ? 'Nice work! ' + Genki.lang[multi ? 'multi_mistakes' : 'mistakes'] :
          'Keep studying! ' + Genki.lang[multi ? 'multi_mistakes' : 'mistakes']
        )+
        '<div class="center">'+
          '<a href="' + window.location.pathname + '" class="button">Try Again</a>'+
          '<a href="' + document.getElementById('home-link').href + '" class="button">Back to Index</a>'+
        '</div>'+
      '</div>'+
    '</div>';

    // this class will indicate the quiz is over so post-test styles can be applied
    document.getElementById('quiz-zone').className += ' quiz-over';
    Genki.scrollTo(document.getElementById('complete-banner')); // jump to the quiz results
  },
  
  
  // toggle the exercise list
  toggleExercises : function () {
    var list = document.getElementById('exercise-list');
    list.className = list.className == 'list-open' ? '' : 'list-open';
  },
  
  
  // toggles the display of lists
  toggleList : function (el) {
    var list = el.nextSibling;
    
    if (/none/.test(list.style.display)) {
      list.style.display = '';
      el.dataset.open = true;
    } else {
      list.style.display = 'none';
      el.dataset.open = false;
    }
  }
};


// page specific functions
(function () {
  var fileSys = false; // tells if GSR is being used on the local filesystem
  
  // append index.html to links if this project is hosted on the local file system
  // it makes browsing easier offline, since otherwise links will just open the directory and not the file
  if (window.location.protocol == 'file:') {
    for (var a = document.querySelectorAll('a[href$="/"]'), i = 0, j = a.length; i < j; i++) {
      if (!/http/.test(a[i].href)) {
        a[i].href += 'index.html';
      }
    }
    
    fileSys = true;
  }


  // show prev/next exercise if currently viewing one
  if (/\/lessons\//.test(window.location.pathname)) {
    var exercises = [ // exercise list
      '/lessons/lesson-0/hiragana-1/|Hiragana',
      '/lessons/lesson-0/hiragana-2/|Hiragana: Diacritical Marks',
      '/lessons/lesson-0/hiragana-3/|Hiragana: Combos',
      '/lessons/lesson-0/katakana-1/|Katakana',
      '/lessons/lesson-0/katakana-2/|Katakana: Diacritical Marks',
      '/lessons/lesson-0/katakana-3/|Katakana: Combos',
      '/lessons/lesson-0/katakana-4/|Katakana: Additional Combos',
      '/lessons/lesson-0/greetings/|Greetings',
      '/lessons/lesson-0/greetings-practice/|Practice: Greetings',
      '/lessons/lesson-0/culture-1/|Culture Note: Greetings and Bowing',
      '/lessons/lesson-1/vocab-1/|Vocabulary: Part 1',
      '/lessons/lesson-1/vocab-2/|Vocabulary: Part 2',
      '/lessons/lesson-1/vocab-3/|Vocabulary: Countries',
      '/lessons/lesson-1/vocab-4/|Vocabulary: Majors',
      '/lessons/lesson-1/vocab-5/|Vocabulary: Occupations',
      '/lessons/lesson-1/vocab-6/|Vocabulary: Family',
      '/lessons/lesson-1/culture-1/|Culture Note: Japanese Names',
      '/lessons/lesson-1/numbers-1/|Numbers: 0-10',
      '/lessons/lesson-1/numbers-2/|Numbers: 11-20, 30, 40...',
      '/lessons/lesson-1/numbers-3/|Practice: Numbers',
      '/lessons/lesson-1/time-1/|Time',
      '/lessons/lesson-1/time-2/|Practice: Time',
      '/lessons/lesson-1/phone-1/|Practice: Telephone Numbers',
      '/lessons/lesson-1/grammar-1/|Practice: の',
      '/lessons/lesson-1/grammar-2/|Practice: Describing People',
      '/lessons/lesson-1/grammar-3/|Practice: Q&A',
      '/lessons/lesson-1/grammar-4/|Practice: Describing People 2',
      '/lessons/lesson-1/grammar-5/|Practice: Q&A 2',
      '/lessons/lesson-1/time-3/|Time: Minutes',
      '/lessons/lesson-1/age-1/|Age',
      '/lessons/lesson-2/vocab-1/|Vocabulary: Words that Point',
      '/lessons/lesson-2/vocab-2/|Vocabulary: Food',
      '/lessons/lesson-2/vocab-3/|Vocabulary: Things',
      '/lessons/lesson-2/vocab-4/|Vocabulary: Places',
      '/lessons/lesson-2/vocab-5/|Vocabulary: Money and Expressions',
      '/lessons/lesson-2/culture-1/|Culture Note: Japanese Currency',
      '/lessons/lesson-2/numbers-1/|Numbers: Hundreds',
      '/lessons/lesson-2/numbers-2/|Numbers: Thousands',
      '/lessons/lesson-2/numbers-3/|Numbers: Ten Thousands',
      '/lessons/lesson-2/numbers-4/|Practice: Numbers',
      '/lessons/lesson-2/numbers-5/|Practice: Prices',
      '/lessons/lesson-2/grammar-1/|Practice: これ, それ, and あれ',
      '/lessons/lesson-2/grammar-2/|Practice: この, その, and あの',
      '/lessons/lesson-2/grammar-3/|Practice: Asking for Directions',
      '/lessons/lesson-2/grammar-4/|Practice: Giving Directions'
    ],
    i = 0,
    j = exercises.length,
    k, a,
    current = window.location.pathname.replace(/.*?(\/lessons\/.*?\/.*?\/).*/g, '$1'),
    more = '<div id="more-exercises" class="clear">',
    activeLesson;
    
    // find the current exercise
    for (; i < j; i++) {
      if (current == exercises[i].split('|')[0]) {
        break;
      }
    }
    
    // update the active lesson
    activeLesson = exercises[i].split('|');
    
    // create the prev/next exercise links
    j = 2;
    while (j --> 0) {
      a = exercises[j == 1 ? i - 1 : i + 1].split('|'); // the prev/next exercise; j=1 is prev, j=0 is next
      
      if (a) { // if there's a prev/next exercise we'll add the link to more
        more += '<a href="../../..' + a[0] + (fileSys ? 'index.html' : '') + '" class="button ' + (j == 1 ? 'prev' : 'next') + '-ex" title="' + (j == 1 ? 'Previous' : 'Next') + ' exercise">' + a[1] + '</a>';
      }
    }
    
    // add the "more exercises" buttons to the document
    document.getElementById('quiz-timer').insertAdjacentHTML('afterend', more + '</div>');
    
    
    // Create the exercise list
    var list = '<div id="exercise-list"><h2 class="main-title">Exercise List</h2><h3 class="lesson-title" onclick="Genki.toggleList(this);">Pre-Lesson</h3><ul id="lesson-0" style="display:none;">',
        lesson = 'lesson-0',
        linkData;
    
    for (i = 0, j = exercises.length; i < j; i++) {
      linkData = exercises[i].split('|');
      
      if (!new RegExp(lesson).test(linkData[0])) {
        lesson = linkData[0].replace(/.*?\/(lesson-\d+)\/.*/, '$1');
        list += '</ul><h3 class="lesson-title" onclick="Genki.toggleList(this);">' + lesson.charAt(0).toUpperCase() + lesson.replace(/-/, ' ').slice(1) + '</h3><ul id="' + lesson + '" style="display:none;">'
      }
      
      list += '<li><a href="../../..' + linkData[0] + (fileSys ? 'index.html' : '') + '">' + linkData[1] + '</a></li>';
    }
    
    // add the exercise list to the document
    document.getElementById('content').insertAdjacentHTML('afterbegin', list + '</ul></div><div id="toggle-exercises" onclick="Genki.toggleExercises();" title="Toggle exercise list"></div>');
    
    // open the current lesson
    Genki.toggleList(document.getElementById(activeLesson[0].replace(/.*?\/(lesson-\d+)\/.*/, '$1')).previousSibling);
    
    // highlight the active exercise
    document.querySelector('a[href*="' + activeLesson[0] + '"]').className += ' active-lesson';
  }
  
}());