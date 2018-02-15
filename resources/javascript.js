window.Genki = {
  problems : 0, // number of problems to solve in the lesson
    solved : 0, // number of problems solved
  mistakes : 0, // number of mistakes made in the lesson
  score : 0, // the student's score
  
  // Questions and answers for Lesson 1 : New Friends
  lesson_1 : {
    
    // Vocabulary : Part 1
    vocab_1 : {
      type : 'drag',
      info : 'Read the Japanese on the left and match the correct meaning by dragging an answer from the right.',
      
      quizlet : {
        'あの' : 'um...',
        'いま' : 'now',
        'えいご' : 'English (language)',
        'ええ' : 'yes',
        'がくせい' : 'student',
        '～ご' : '...language',
        'こうこう' : 'high school',
        'ごご' : 'P.M.',
        'ごぜん' : 'A.M.',
        '～さい' : '...years old',
        '～さん' : 'Mr./Ms....',
        '～じ' : 'o\'clock',
        '～じん' : '...people',
        'せんこう' : 'major'
      },
    }
    
  }
  
};


// To generate a quiz simply pass an exercise from the Genki object.
// EXAMPLE : generateQuiz(Genki.lesson_1.vocab_1); // SEE : lesson-1\vocab-1\index.html
function generateQuiz (o) {
  
  // create a drag and drop quiz
  if (o.type = 'drag') {
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
    
    document.getElementById('quiz-zone').innerHTML = quiz;
  }
  
  
  // setup drag and drop
  var drake = dragula([document.querySelector('#answer-list')], {
    isContainer : function (el) {
      return el.classList.contains('quiz-answer-zone');
    }
  });
  
  drake.on('drop', function (el, target, source) {
    if (target.parentNode.id == 'drop-list'){
      if (el.dataset.answer != target.dataset.text) {
        document.getElementById('answer-list').append(el);
        
        target.dataset.mistakes = ++target.dataset.mistakes;
        ++Genki.mistakes;
        
      } else {
        target.className += ' answer-correct';
        
        // when all problems have been solved..
        // stop the timer, show the score, and congratulate the student
        if (++Genki.solved == Genki.problems) {
          Genki.score = Math.floor((Genki.solved - Genki.mistakes) * 100 / Genki.problems);
          Genki.timer.stop();
          
          var timer = document.getElementById('quiz-timer');
          
          timer.style.display = 'none';
          
          document.getElementById('quiz-result').innerHTML = 
          '<div id="complete-banner" class="center">Quiz Complete!</div>'+
          '<div id="result-list">'+
            '<div class="result-row"><span class="result-label">Problems Solved : </span>' + Genki.problems + '</div>'+
            '<div class="result-row"><span class="result-label">Mistakes : </span>' + Genki.mistakes + '</div>'+
            '<div class="result-row"><span class="result-label">Score : </span>' + Genki.score + '%</div>'+
            '<div class="result-row"><span class="result-label">Completion Time : </span>' + timer.innerHTML + '</div>'+
            '<div class="result-row center">'+
              (
                Genki.score == 100 ? 'PERFECT! Great Job, you have mastered this quiz! Feel free to move on or challenge yourself by trying to beat your completion time.' :
                Genki.score > 70 ? 'Nice work! Review the problems you got wrong (outlined in red) and take a short break before trying again.' :
                'Keep studying! Review the problems you got wrong (outlined in red) and take a short break before trying again.' 
              )+
              '<div class="center">'+
                '<a href="' + window.location.pathname + '" class="button">Try Again</a>'+
                '<a href="https://sethclydesdale.github.io/genki-study-resources/" class="button">Back to Index</a>'+
              '</div>'+
            '</div>'+
          '</div>';
          
          document.getElementById('quiz-zone').className = 'quiz-over';
          window.location.hash = '#complete-banner'; // jump to the quiz results
        }
      }
    }
  });
  
  
  // setup timer
  var timer = new Timer(),
      clock = document.getElementById('quiz-timer');
  
  clock.innerHTML = '00:00:00';
  timer.start();
  timer.addEventListener('secondsUpdated', function (e) {
    clock.innerHTML = timer.getTimeValues().toString()
  });
  
  Genki.timer = timer;
  Genki.drake = drake;
  
  // jump to the quiz info
  window.location.hash = 'quiz-info';
};