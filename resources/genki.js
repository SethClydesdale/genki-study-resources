// # FUNCTIONALITY FOR EXERCISES #
(function (window, document) {
  'use strict';
  
  // primary object for functionality of Genki exercises
  var Genki = {
    
    // exercise statistics
    stats : {
      problems : 0, // number of problems to solve in the lesson
        solved : 0, // number of problems solved
      mistakes : 0, // number of mistakes made in the lesson
         score : 0, // the student's score
       exclude : 0  // answers to exclude, mostly for text-only segments in multi-choice quizzes
    },

    // tells us if Genki is being used on a local file system so we can append index.html to URLs
    local : window.location.protocol == 'file:' ? 'index.html' : '',

    // frequently used/generic strings
    lang : {
      std_drag : 'Drag the English expression to the Japanese expression that has the same meaning.',
      std_kana : 'Drag the Kana to the matching Romaji.',
      std_num : 'Drag the Numbers to the matching Kana.',
      std_multi : 'Solve the problems by choosing the correct answers.',
      std_questions : 'Answer the questions as best as you can.',
      std_culture : 'Answer the questions about Japanese culture as best as you can.',
      mistakes : 'The items outlined in <span class="t-red">red</span> were answered wrong before finding the correct answer. Review these problems before trying again.',
      writing_mistakes : 'The items outlined in <span class="t-red">red</span> were answered wrong. Review these problems before trying again.',
      multi_mistakes : 'The answers you selected that were wrong are outlined in <span class="t-red">red</span>. The correct answers are outlined in <span class="t-orange">orange</span>. Review these problems before trying again.',
      fill_mistakes : 'The items underlined in <span class="t-red">red</span> were answered wrong, the correct answers are listed underneath in <span class="t-red">red</span>. Review these problems before trying again.',
      
      // buttons
      // review button for drag/drop exercises
      review : '<div id="review-exercise" class="center clearfix"><button id="review-button" class="button" onclick="Genki.review();">Review</button></div>', 
      // furigana toggle for vocab exercises
      toggle_furigana : '<button class="button" onclick="Genki.toggle.furigana(this);">' + ((window.localStorage && localStorage.furiganaVisible == 'false') ? 'Show' : 'Hide') + ' Furigana</button>'
    },

    // info about the currently active exercise
    active : {
      exercise : null, // placeholder for the active exercise's data
      index : 0, // index where active.exercise is located
      path : window.location.pathname.replace(/.*?\/lessons\/(.*?\/.*?)\/.*/g, '$1'), // current exercise path
    },
    
    // exercise list
    exercises : [
      // Pre-Lesson
      'lesson-0/hiragana-1|Hiragana|p.24-25',
      'lesson-0/hiragana-2|Hiragana: Diacritical Marks|p.25',
      'lesson-0/hiragana-3|Hiragana: Combos|p.25-26',
      'lesson-0/katakana-1|Katakana|p.28',
      'lesson-0/katakana-2|Katakana: Diacritical Marks|p.28-29',
      'lesson-0/katakana-3|Katakana: Combos|p.29',
      'lesson-0/katakana-4|Katakana: Additional Combos|p.30',
      'lesson-0/match-1|Match: Hiragana and Katakana|p.24 & 28',
      'lesson-0/greetings|Greetings|p.34-35',
      'lesson-0/greetings-practice|Practice: Greetings|p.37',
      'lesson-0/culture-1|Culture Note: Greetings and Bowing|p.37',
      'lesson-0/workbook-1|Workbook: Greetings|p.11-12',

      // Lesson 1
      'lesson-1/vocab-1|Vocabulary: Part 1|p.40',
      'lesson-1/vocab-2|Vocabulary: Part 2|p.40',
      'lesson-1/vocab-3|Vocabulary: Countries|p.41',
      'lesson-1/vocab-4|Vocabulary: Majors|p.41',
      'lesson-1/vocab-5|Vocabulary: Occupations|p.41',
      'lesson-1/vocab-6|Vocabulary: Family|p.41',
      'lesson-1/culture-1|Culture Note: Japanese Names|p.45',
      'lesson-1/numbers-1|Numbers: 0-10|p.46-47',
      'lesson-1/numbers-2|Numbers: 11-20, 30, 40...|p.48',
      'lesson-1/numbers-3|Practice: Numbers|p.48; I-A, B & C',
      'lesson-1/time-1|Time|p.49',
      'lesson-1/time-2|Practice: Time|p.49-50; II-A & B',
      'lesson-1/phone-1|Practice: Telephone Numbers|p.50; III-A',
      'lesson-1/grammar-1|Practice: の|p.51; IV',
      'lesson-1/grammar-2|Practice: Describing People|p.51-52; V-A',
      'lesson-1/grammar-3|Practice: Q&A|p.52-53; V-B',
      'lesson-1/grammar-4|Practice: Describing People 2|p.53-54; VI-A',
      'lesson-1/grammar-5|Practice: Q&A 2|p.54; VI-B',
      'lesson-1/time-3|Time: Minutes|p.57',
      'lesson-1/age-1|Age|p.57',
      'lesson-1/vocab-7|Bonus Vocabulary: Words in Genki|p.24-57',
      'lesson-1/workbook-1|Workbook: Numbers|p.13',
      'lesson-1/workbook-2|Workbook: Time|p.14; I',
      'lesson-1/workbook-3|Workbook: Telephone Numbers|p.14; II',
      'lesson-1/workbook-4|Workbook: NounのNoun|p.15; I',
      'lesson-1/workbook-5|Workbook: XはYです|p.15; II',
      'lesson-1/workbook-6|Workbook: Question Sentences|p.16; I & II',
      'lesson-1/workbook-7|Workbook: Questions|p.19',
      'lesson-1/literacy-1|Hiragana Practice: Identifying Hiragana|p.290; I-A',
      'lesson-1/literacy-2|Hiragana Practice: Word Match|p.290; I-B',
      'lesson-1/literacy-3|Hiragana Practice: Diacritical Marks|p.290; I-E',
      'lesson-1/literacy-4|Hiragana Practice: Combos|p.290; I-F',
      'lesson-1/literacy-5|Hiragana Practice: Rearrange|p.291; I-H',
      'lesson-1/literacy-6|Hiragana Reading Practice|p.292-293; II',
      'lesson-1/literacy-wb-1|Workbook: Hiragana Writing Practice (あ-こ)|p.117; I',
      'lesson-1/literacy-wb-2|Workbook: Spelling Practice (あ-こ)|p.117; II & III',
      'lesson-1/literacy-wb-3|Workbook: Hiragana Writing Practice (さ-と)|p.118; I',
      'lesson-1/literacy-wb-4|Workbook: Spelling Practice (さ-と)|p.118; II & III',
      'lesson-1/literacy-wb-5|Workbook: Hiragana Writing Practice (な-ほ)|p.119; I',
      'lesson-1/literacy-wb-6|Workbook: Spelling Practice (な-ほ)|p.119; II & III',
      'lesson-1/literacy-wb-7|Workbook: Hiragana Writing Practice (ま-よ)|p.120; I',
      'lesson-1/literacy-wb-8|Workbook: Spelling Practice (ま-よ)|p.120; II & III',
      'lesson-1/literacy-wb-9|Workbook: Hiragana Writing Practice (ら-ん)|p.121; I',
      'lesson-1/literacy-wb-10|Workbook: Spelling Practice (ら-ん)|p.121; II & III',
      'lesson-1/literacy-wb-11|Workbook: Diacritical Marks|p.122; I & II',
      'lesson-1/literacy-wb-12|Workbook: Small や, ゆ, よ|p.122; III & IV',
      'lesson-1/literacy-wb-13|Workbook: Double Consonants|p.123; I & II',
      'lesson-1/literacy-wb-14|Workbook: Long Vowels|p.123; III & IV',

      // Lesson 2
      'lesson-2/vocab-1|Vocabulary: Words that Point|p.60',
      'lesson-2/vocab-2|Vocabulary: Food|p.60',
      'lesson-2/vocab-3|Vocabulary: Things|p.60-61',
      'lesson-2/vocab-4|Vocabulary: Places|p.61',
      'lesson-2/vocab-5|Vocabulary: Money and Expressions|p.61',
      'lesson-2/culture-1|Culture Note: Japanese Currency|p.68',
      'lesson-2/numbers-1|Numbers: Hundreds|p.69',
      'lesson-2/numbers-2|Numbers: Thousands|p.69',
      'lesson-2/numbers-3|Numbers: Ten Thousands|p.69',
      'lesson-2/numbers-4|Practice: Numbers|p.69; I-A',
      'lesson-2/numbers-5|Practice: Prices|p.69-70; I-B',
      'lesson-2/grammar-1|Practice: これ, それ, and あれ|p.71-72; II-A & B',
      'lesson-2/grammar-2|Practice: この, その, and あの|p.72-73; III-A',
      'lesson-2/grammar-3|Practice: Asking for Directions|p.74; IV',
      'lesson-2/grammar-4|Practice: Giving Directions|p.74; IV',
      'lesson-2/grammar-5|Practice: も|p.75-76; VI',
      'lesson-2/grammar-6|Practice: Negative Statements|p.76; VII-A',
      'lesson-2/vocab-6|Bonus Vocabulary: Food|p.79',
      'lesson-2/vocab-7|Bonus Vocabulary: Classroom Objects|p.83',
      'lesson-2/vocab-8|Useful Expressions: In the Classroom|p.83',
      'lesson-2/workbook-1|Workbook: Numbers|p.20; I, II, & III',
      'lesson-2/workbook-2|Workbook: これ, それ, and あれ|p.21; I & II',
      'lesson-2/workbook-3|Workbook: この, その, and あの|p.22',
      'lesson-2/workbook-4|Workbook: ここ, そこ, and あそこ・だれの|p.23; I & II',
      'lesson-2/workbook-5|Workbook: Noun も|p.24; I',
      'lesson-2/workbook-6|Workbook: Noun じゃないです|p.24; II',
      'lesson-2/workbook-7|Workbook: Questions|p.26',
      'lesson-2/literacy-1|Katakana Practice: Identifying Katakana|p.294; I-A',
      'lesson-2/literacy-2|Katakana Practice: Word Match|p.294; I-B',
      'lesson-2/literacy-3|Katakana Practice: Countries and Capitals|p.295; I-C',
      'lesson-2/literacy-4|Katakana Practice: Rearrange|p.296; I-E',
      'lesson-2/literacy-5|Katakana Reading Practice|p.297; III',
      'lesson-2/literacy-wb-1|Workbook: Katakana Writing Practice (ア-コ)|p.124; I',
      'lesson-2/literacy-wb-2|Workbook: Spelling Practice (ア-コ)|p.124; II',
      'lesson-2/literacy-wb-3|Workbook: Katakana Writing Practice (サ-ト)|p.125; I',
      'lesson-2/literacy-wb-4|Workbook: Spelling Practice (サ-ト)|p.125; II',
      'lesson-2/literacy-wb-5|Workbook: Katakana Writing Practice (ナ-ホ)|p.126; I',
      'lesson-2/literacy-wb-6|Workbook: Spelling Practice (ナ-ホ)|p.126; II',
      'lesson-2/literacy-wb-7|Workbook: Katakana Writing Practice (マ-ヨ)|p.127; I',
      'lesson-2/literacy-wb-8|Workbook: Spelling Practice (マ-ヨ)|p.127; II',
      'lesson-2/literacy-wb-9|Workbook: Katakana Writing Practice (ラ-ン)|p.128; I',
      'lesson-2/literacy-wb-10|Workbook: Spelling Practice (ラ-ン)|p.128; II',

      // Lesson 3
      'lesson-3/vocab-1|Vocabulary: Entertainment and Sports|p.86',
      'lesson-3/vocab-2|Vocabulary: Food and Drinks|p.86',
      'lesson-3/vocab-3|Vocabulary: Places and Time|p.86-87',
      'lesson-3/vocab-4|Vocabulary: U-verbs|p.87',
      'lesson-3/vocab-5|Vocabulary: Ru-verbs and Irregular verbs|p.87',
      'lesson-3/vocab-6|Vocabulary: Adverbs|p.87',
      'lesson-3/vocab-7|Vocabulary: Adjectives and Expressions|p.87',
      'lesson-3/grammar-7|Review: Identifying Verbs|p.89',
      'lesson-3/grammar-1|Practice: Verb Conjugation|p.95; I-A',
      'lesson-3/grammar-2|Practice: を and で|p.95-96; I-B',
      'lesson-3/grammar-3|Practice: Indicating the Goal of Movement|p.96; I-C',
      'lesson-3/grammar-4|Practice: Time Expressions|p.98; II-A',
      'lesson-3/grammar-5|Practice: Time Expressions 2|p.98; II-C',
      'lesson-3/grammar-6|Practice: Making Suggestions|p.99; III-A',
      'lesson-3/culture-1|Culture Note: Japanese Houses|p.101',
      'lesson-3/workbook-1|Workbook: Verb Conjugation|p.27',
      'lesson-3/workbook-2|Workbook: Noun を Verb|p.28',
      'lesson-3/workbook-3|Workbook: Verbs with Places|p.29; I & II',
      'lesson-3/workbook-4|Workbook: Time Expressions|p.30; I',
      'lesson-3/workbook-5|Workbook: Time References|p.30; II & III',
      'lesson-3/workbook-6|Workbook: Suggestion Using ～ませんか|p.31; I & II',
      'lesson-3/workbook-7|Workbook: Frequency Adverbs|p.32',
      'lesson-3/workbook-8|Workbook: Questions|p.35',
      'lesson-3/literacy-1|Kanji Practice: 一 and 二|p.298',
      'lesson-3/literacy-2|Kanji Practice: 三 and 四|p.298',
      'lesson-3/literacy-3|Kanji Practice: 五 and 六|p.298',
      'lesson-3/literacy-4|Kanji Practice: 七 and 八|p.298',
      'lesson-3/literacy-5|Kanji Practice: 九 and 十|p.299',
      'lesson-3/literacy-6|Kanji Practice: 百, 千, and 万|p.299',
      'lesson-3/literacy-7|Kanji Practice: 円 and 時|p.299',
      'lesson-3/literacy-8|Kanji Practice: Prices|p.300; I-A & B',
      'lesson-3/literacy-9|Reading Practice: まいにちのせいかつ|p.301; II',
      'lesson-3/literacy-wb-1|Workbook: Kanji Writing Practice|p.129',
      'lesson-3/literacy-wb-2|Workbook: Spelling Practice (一, 二, and 三)|p.129; bonus',
      'lesson-3/literacy-wb-3|Workbook: Spelling Practice (四, 五, and 六)|p.129; bonus',
      'lesson-3/literacy-wb-4|Workbook: Spelling Practice (七, 八, and 九)|p.129; bonus',
      'lesson-3/literacy-wb-5|Workbook: Spelling Practice (十, 百, and 千)|p.129; bonus',
      'lesson-3/literacy-wb-6|Workbook: Spelling Practice (万, 円, and 時)|p.129; bonus',
      'lesson-3/literacy-wb-7|Workbook: Using Kanji (Numbers)|p.130; I',
      'lesson-3/literacy-wb-8|Workbook: Fill in the Kanji|p.130; II',
      'lesson-3/literacy-wb-9|Workbook: Translate the Sentences|p.130; III',

      // Lesson 4
      'lesson-4/vocab-1|Vocabulary: People and Things|p.104',
      'lesson-4/vocab-2|Vocabulary: Activities and Places|p.104',
      'lesson-4/vocab-3|Vocabulary: Time|p.105',
      'lesson-4/vocab-4|Vocabulary: U-verbs and Ru-verbs|p.105',
      'lesson-4/vocab-5|Vocabulary: Adverbs and Expressions|p.105',
      'lesson-4/vocab-6|Vocabulary: Location Words|p.106',
      'lesson-4/culture-1|Culture Note: Japanese National Holidays|p.114',
      'lesson-4/grammar-1|Practice: Ｘがあります|p.116; I-C',
      'lesson-4/grammar-2|Practice: Describing Locations|p.117; II-A & B',
      'lesson-4/grammar-3|Practice: Past Tense of です|p.118; III-A',
      'lesson-4/grammar-4|Practice: Past Tense of Verbs|p.120; IV-A',
      'lesson-4/grammar-5|Practice: Past Tense|p.120; IV-B',
      'lesson-4/grammar-6|Practice: Past Tense 2|p.121; IV-C & D',
      'lesson-4/grammar-7|Practice: も|p.122; V-A',
      'lesson-4/grammar-8|Practice: Descriptions Using も|p.122-123; V-B',
      'lesson-4/grammar-9|Practice: ～時間|p.123; VI-A',
      'lesson-4/vocab-7|Bonus Vocabulary: Days 1-15|p.127',
      'lesson-4/vocab-8|Bonus Vocabulary: Days 16-31|p.127',
      'lesson-4/vocab-9|Bonus Vocabulary: Months|p.127',
      'lesson-4/vocab-10|Useful Expressions: Time Words|p.127',
      'lesson-4/workbook-1|Workbook: Ｘがあります／います|p.36; I & II',
      'lesson-4/workbook-2|Workbook: Describing Where Things Are|p.37; I & II',
      'lesson-4/workbook-3|Workbook: Past Tense (Nouns)|p.38; I & II',
      'lesson-4/workbook-4|Workbook: Verb Conjugation (Past Tense)|p.39',
      'lesson-4/workbook-5|Workbook: Past Tense (Verbs)|p.40; I & II',
      'lesson-4/workbook-6|Workbook: も|p.41',
      'lesson-4/workbook-7|Workbook: ～時間・Particles|p.42; I & II',
      'lesson-4/workbook-8|Workbook: Questions|p.44',
      'lesson-4/literacy-1|Kanji Practice: 日 and 本|p.302',
      'lesson-4/literacy-2|Kanji Practice: 人 and 月|p.302',
      'lesson-4/literacy-3|Kanji Practice: 火 and 水|p.302',
      'lesson-4/literacy-4|Kanji Practice: 木, 金, and 土|p.302-303',
      'lesson-4/literacy-5|Kanji Practice: 曜, 上, and 下|p.303',
      'lesson-4/literacy-6|Kanji Practice: 中 and 半|p.303',
      'lesson-4/literacy-7|Kanji Practice: Days of the Week|p.304; I-A',
      'lesson-4/literacy-8|Kanji Practice: Location Words|p.304; I-B',
      'lesson-4/literacy-9|Reading Practice: おかあさんへのメモ|p.304; II',
      'lesson-4/literacy-10|Reading Practice: メアリーさんのしゅうまつ|p.305; III',
      'lesson-4/literacy-wb-1|Workbook: Kanji Writing Practice|p.131',
      'lesson-4/literacy-wb-2|Workbook: Spelling Practice (日, 本, and 人)|p.131; bonus',
      'lesson-4/literacy-wb-3|Workbook: Spelling Practice (月, 火, and 水)|p.131; bonus',
      'lesson-4/literacy-wb-4|Workbook: Spelling Practice (木, 金, 土, and 曜)|p.131; bonus',
      'lesson-4/literacy-wb-5|Workbook: Spelling Practice (上, 下, 中, and 半)|p.131; bonus',
      'lesson-4/literacy-wb-6|Workbook: Spelling the Days of the Week|p.132; I',
      'lesson-4/literacy-wb-7|Workbook: Fill in the Kanji|p.132; II',
      'lesson-4/literacy-wb-8|Workbook: Translate the Sentences|p.132; III',

      // Lesson 5
      'lesson-5/vocab-1|Vocabulary: Nouns|p.130',
      'lesson-5/vocab-2|Vocabulary: い-adjectives|p.130-131',
      'lesson-5/vocab-3|Vocabulary: な-adjectives|p.131',
      'lesson-5/vocab-4|Vocabulary: Verbs and Expressions|p.131',
      'lesson-5/grammar-1|Practice: Present Affirmative Adjectives|p.137; I-A',
      'lesson-5/grammar-2|Practice: Present Negative Adjectives|p.137; I-B',
      'lesson-5/grammar-3|Practice: Present Adjectives|p.137-138; I-C',
      'lesson-5/grammar-4|Practice: Present Adjectives 2|p.138; I-D',
      'lesson-5/grammar-5|Practice: Past Affirmative Adjectives|p.139; II-A',
      'lesson-5/grammar-6|Practice: Past Negative Adjectives|p.139; II-B',
      'lesson-5/grammar-7|Practice: Past Adjectives|p.139; II-C',
      'lesson-5/grammar-8|Practice: Past Adjectives 2|p.140; II-D',
      'lesson-5/grammar-9|Practice: Modifying Nouns with Adjectives|p.140; III-A',
      'lesson-5/grammar-10|Practice: Describing People with Adjectives|p.141; III-B',
      'lesson-5/grammar-11|Practice: 好き(な)／きらい(な)|p.141; IV-A',
      'lesson-5/grammar-12|Practice: 好き(な)／きらい(な) 2|p.141; IV-B',
      'lesson-5/grammar-13|Practice: ～ましょう|p.142; V-A',
      'lesson-5/culture-1|Culture Note: Japanese Festivals|p.144',
      'lesson-5/vocab-5|Bonus Vocabulary: At the Post Office|p.145',
      'lesson-5/vocab-6|Useful Expressions: At the Post Office|p.145',
      'lesson-5/workbook-1|Workbook: Adjective Conjugation (Present Tense)|p.45',
      'lesson-5/workbook-2|Workbook: Adjectives (Present Tense)|p.46; I & II',
      'lesson-5/workbook-3|Workbook: Adjective Conjugation (Present and Past Tenses)|p.47',
      'lesson-5/workbook-4|Workbook: Adjectives (Past Tense)|p.48; I & II',
      'lesson-5/workbook-5|Workbook: Adjective + Noun|p.49; I & II',
      'lesson-5/workbook-6|Workbook: 好き(な)／きらい(な)|p.50',
      'lesson-5/workbook-7|Workbook: ～ましょう|p.51; I & II',
      'lesson-5/workbook-8|Workbook: Questions|p.53; I & II',
      'lesson-5/literacy-1|Kanji Practice: 山, 川, and 元|p.306',
      'lesson-5/literacy-2|Kanji Practice: 気, 天, and 私|p.306',
      'lesson-5/literacy-3|Kanji Practice: 今 and 田|p.306',
      'lesson-5/literacy-4|Kanji Practice: 女 and 男|p.307',
      'lesson-5/literacy-5|Kanji Practice: 見 and 行|p.307',
      'lesson-5/literacy-6|Kanji Practice: 食 and 飲|p.307',
      'lesson-5/literacy-7|Kanji Practice: Match the Sentences|p.308; I-B',
      'lesson-5/literacy-8|Kanji Practice: Match the Readings|p.308; I-C',
      'lesson-5/literacy-9|Katakana Practice: Match the Words|p.309; II-A',
      'lesson-5/literacy-10|Reading Practice: Yoko\'s Postcard|p.309; II-B',
      'lesson-5/literacy-11|Reading Practice: Robert\'s Postcard|p.310; II-C',
      'lesson-5/literacy-wb-1|Workbook: Kanji Writing Practice|p.133',
      'lesson-5/literacy-wb-2|Workbook: Spelling Practice (山, 川, 元, and 気)|p.133; bonus',
      'lesson-5/literacy-wb-3|Workbook: Spelling Practice (天, 私, 今, and 田)|p.133; bonus',
      'lesson-5/literacy-wb-4|Workbook: Spelling Practice (女, 男, and 見)|p.133; bonus',
      'lesson-5/literacy-wb-5|Workbook: Spelling Practice (行, 食, and 飲)|p.133; bonus',
      'lesson-5/literacy-wb-6|Workbook: Fill in the Kanji|p.134; I',
      'lesson-5/literacy-wb-7|Workbook: Translate the Sentences|p.134; II',
      
      // Lesson 6
      'lesson-6/vocab-1|Vocabulary: Nouns|p.148',
      'lesson-6/vocab-2|Vocabulary: な-adjective and U-verbs|p.148-149',
      'lesson-6/vocab-3|Vocabulary: Ru-verbs and Irregular Verbs|p.149',
      'lesson-6/vocab-4|Vocabulary: Adverbs and Other Expressions|p.149',
      'lesson-6/grammar-1|Review: Te-form Conjugation Rules|p.150-151',
      'lesson-6/culture-1|Culture Note: Japan\'s Educational System (1)|p.154',
      'lesson-6/grammar-2|Practice: Te-form Conjugation|p.156; I-A',
      'lesson-6/grammar-3|Practice: ～てください|p.156-157; I-C & D',
      'lesson-6/grammar-4|Practice: ～てもいいですか|p.158; II-A & B',
      'lesson-6/grammar-5|Practice: ～てはいけません|p.159; III-A',
      'lesson-6/grammar-6|Practice: ～てもいいです／～てはいけません|p.159; III-C',
      'lesson-6/grammar-7|Practice: Describing Two Activites|p.159-160; IV-A & B',
      'lesson-6/grammar-8|Practice: ～から|p.161; V-A',
      'lesson-6/grammar-9|Practice: ～ましょうか|p.162-163; VI-A & B',
      'lesson-6/vocab-5|Useful Expressions: Directions|p.165',
      'lesson-6/workbook-1|Workbook: Te-form Conjugation 1|p.54',
      'lesson-6/workbook-2|Workbook: Te-form Conjugation 2|p.55-56',
      'lesson-6/workbook-3|Workbook: ～てください|p.57; I & II',
      'lesson-6/workbook-4|Workbook: ～てもいいです|p.58',
      'lesson-6/workbook-5|Workbook: ～てはいけません|p.59; I & II',
      'lesson-6/workbook-6|Workbook: Describing Two Activities|p.60; I & II',
      'lesson-6/workbook-7|Workbook: ～から|p.61; I & II',
      'lesson-6/workbook-8|Workbook: Questions|p.63',
      'lesson-6/literacy-1|Kanji Practice: 東 and 西|p.312',
      'lesson-6/literacy-2|Kanji Practice: 南 and 北|p.312',
      'lesson-6/literacy-3|Kanji Practice: 口 and 出|p.312',
      'lesson-6/literacy-4|Kanji Practice: 右 and 左|p.312',
      'lesson-6/literacy-5|Kanji Practice: 分, 先, and 生|p.313',
      'lesson-6/literacy-6|Kanji Practice: 大 and 学|p.313',
      'lesson-6/literacy-7|Kanji Practice: 外 and 国|p.313',
      'lesson-6/literacy-8|Kanji Practice: Combine the Kanji|p.314; I-A',
      'lesson-6/literacy-9|Reading Practice: Find the Location|p.314; I-B',
      'lesson-6/literacy-10|Reading Practice: Bulletin Board|p.314-315; II',
      'lesson-6/literacy-11|Reading Practice: Chiaki\'s Favorite Restaurant|p.316-317; III-A, B, & C',
      'lesson-6/literacy-wb-1|Workbook: Kanji Writing Practice|p.135',
      'lesson-6/literacy-wb-2|Workbook: Spelling Practice (東, 西, and 南)|p.135; bonus',
      'lesson-6/literacy-wb-3|Workbook: Spelling Practice (北, 口, and 出)|p.135; bonus',
      'lesson-6/literacy-wb-4|Workbook: Spelling Practice (右, 左, and 分)|p.135; bonus',
      'lesson-6/literacy-wb-5|Workbook: Spelling Practice (先, 生, and 大)|p.135; bonus',
      'lesson-6/literacy-wb-6|Workbook: Spelling Practice (学, 外, and 国)|p.135; bonus',
      'lesson-6/literacy-wb-7|Workbook: Fill in the Kanji|p.136; I',
      'lesson-6/literacy-wb-8|Workbook: Translate the Sentences|p.136; II',
      
      // Lesson 7
      'lesson-7/vocab-1|Vocabulary: Nouns 1|p.168',
      'lesson-7/vocab-2|Vocabulary: Nouns 2|p.168',
      'lesson-7/vocab-3|Vocabulary: い-adjectives and な-adjectives|p.168-169',
      'lesson-7/vocab-4|Vocabulary: U-verbs, Ru-verbs, and Irregular Verbs|p.169',
      'lesson-7/vocab-5|Vocabulary: Adverbs and Other Expressions|p.169',
      'lesson-7/vocab-7|Bonus Vocabulary: Counting People|p.174',
      'lesson-7/grammar-1|Practice: ～ている (Actions in Progress)|p.176; I-A',
      'lesson-7/grammar-2|Practice: ～ている (Result of a Change)|p.177; II-A',
      'lesson-7/grammar-3|Practice: Describing People 1|p.178; III-A',
      'lesson-7/grammar-4|Practice: Describing People 2|p.178; III-B',
      'lesson-7/grammar-5|Practice: Te-forms for Joining Sentences 1|p.179; IV-A',
      'lesson-7/grammar-6|Practice: Te-forms for Joining Sentences 2|p.180; IV-B',
      'lesson-7/grammar-7|Practice: Verb Stem + に行く／来る／帰る|p.181; V-A',
      'lesson-7/culture-1|Culture Note: Kinship Terms 1|p.184',
      'lesson-7/culture-2|Culutre Note: Kinship Terms 2|p.184',
      'lesson-7/vocab-6|Useful Expressions: Parts of the Body|p.185',
      'lesson-7/workbook-1|Workbook: Te-form Conjugation Practice|p.64',
      'lesson-7/workbook-2|Workbook: ～ている (Actions in Progress)|p.65; I, II, & III',
      'lesson-7/workbook-3|Workbook: ～ている (Result of a Change)|p.66; I',
      'lesson-7/workbook-4|Workbook: Describing People|p.67; I & II',
      'lesson-7/workbook-5|Workbook: Te-forms for Joining Sentences|p.68; I & II',
      'lesson-7/workbook-6|Workbook: Verb Stem + に行く／来る／帰る|p.69; I',
      'lesson-7/workbook-7|Workbook: Counting People|p.70',
      'lesson-7/workbook-8|Workbook: Questions|p.72',
      'lesson-7/literacy-1|Kanji Practice: 京, 子, and 小|p.318',
      'lesson-7/literacy-2|Kanji Practice: 会 and 社|p.318',
      'lesson-7/literacy-3|Kanji Practice: 父 and 母|p.318',
      'lesson-7/literacy-4|Kanji Practice: 高, 校, and 毎|p.318-319',
      'lesson-7/literacy-5|Kanji Practice: 語 and 文|p.319',
      'lesson-7/literacy-6|Kanji Practice: 帰 and 入|p.319',
      'lesson-7/literacy-7|Kanji Practice: Fill in the Blanks|p.320; I-A',
      'lesson-7/literacy-8|Reading Practice: Mary\'s Letter|p.321-322; II',
      'lesson-7/literacy-wb-1|Workbook: Kanji Writing Practice|p.137',
      'lesson-7/literacy-wb-2|Workbook: Spelling Practice (京, 子, 小, and 会)|p.137; bonus',
      'lesson-7/literacy-wb-3|Workbook: Spelling Practice (社, 父, and 母)|p.137; bonus',
      'lesson-7/literacy-wb-4|Workbook: Spelling Practice (高, 校, 毎, and 語)|p.137; bonus',
      'lesson-7/literacy-wb-5|Workbook: Spelling Practice (文, 帰, and 入)|p.137; bonus',
      'lesson-7/literacy-wb-6|Workbook: Fill in the Kanji|p.138; I',
      'lesson-7/literacy-wb-7|Workbook: Translate the Sentences|p.138; II',
      
      // Lesson 8
      'lesson-8/vocab-1|Vocabulary: Nouns 1|p.188',
      'lesson-8/vocab-2|Vocabulary: Nouns 2|p.188',
      'lesson-8/vocab-3|Vocabulary: な-adjectives and U-verbs|p.188-189',
      'lesson-8/vocab-4|Vocabulary: Ru-verbs and Irregular Verbs|p.189',
      'lesson-8/vocab-5|Vocabulary: Adverbs and Other Expressions|p.189',
      'lesson-8/grammar-1|Review: Short Form Conjugation Rules|p.190-191',
      'lesson-8/grammar-2|Practice: Short Form Conjugation (Verbs)|p.198; I-A',
      'lesson-8/grammar-3|Practice: Short Form Conjugation (Adjectives/Nouns)|p.198; I-B',
      'lesson-8/grammar-4|Practice: Informal Speech (Verbs)|p.198-199; II-A',
      'lesson-8/grammar-5|Practice: Informal Speech (Adjectives/Nouns)|p.199; II-B',
      'lesson-8/grammar-6|Practice: Quotations (～と思います)|p.199; III-A',
      'lesson-8/grammar-7|Practice: Quotations (～と思います) 2|p.199-200; III-B',
      'lesson-8/grammar-8|Practice: Quotations (～と言っていました)|p.201; IV-A',
      'lesson-8/grammar-9|Practice: ～ないでください|p.202; V-A',
      'lesson-8/grammar-10|Practice: Verb のが好きです|p.202; VI-A',
      'lesson-8/grammar-11|Practice: が|p.203; VII-A',
      'lesson-8/grammar-12|Practice: 何もしませんでした|p.204; VIII-A',
      'lesson-8/vocab-6|Bonus Vocabulary: 日本の食べ物|p.207',
      'lesson-8/culture-1|Culture Note: Foods in Japan|p.207',
      'lesson-8/workbook-1|Workbook: Short Forms (Present Tense)|p.73',
      'lesson-8/workbook-2|Workbook: Short Forms (Informal Speech)|p.74; I & II',
      'lesson-8/workbook-3|Workbook: Quotations (～と思います)|p.75; I & II',
      'lesson-8/workbook-4|Workbook: Quotations (～と言っていました)|p.76',
      'lesson-8/workbook-5|Workbook: ～ないでください|p.77; I & II',
      'lesson-8/workbook-6|Workbook: Verb のが好きです|p.78; I & II',
      'lesson-8/workbook-7|Workbook: が・何か and 何も|p.79; I & II',
      'lesson-8/workbook-8|Workbook: Questions|p.81; I & II',
      'lesson-8/literacy-1|Kanji Practice: 員, 新, and 聞|p.323',
      'lesson-8/literacy-2|Kanji Practice: 作, 仕, and 事|p.323',
      'lesson-8/literacy-3|Kanji Practice: 電 and 車|p.323',
      'lesson-8/literacy-4|Kanji Practice: 休, 言, and 読|p.324',
      'lesson-8/literacy-5|Kanji Practice: 思, 次, and 何|p.324',
      'lesson-8/literacy-6|Kanji Practice: Match the Verbs|p.325; I-B',
      'lesson-8/literacy-7|Reading Practice: 日本の会社員|p.326-327; II-C',
      'lesson-8/literacy-wb-1|Workbook: Kanji Writing Practice|p.139',
      'lesson-8/literacy-wb-2|Workbook: Spelling Practice (員, 新, 聞, and 作)|p.139; bonus',
      'lesson-8/literacy-wb-3|Workbook: Spelling Practice (仕, 事, 電, and 車)|p.139; bonus',
      'lesson-8/literacy-wb-4|Workbook: Spelling Practice (休, 言, and 読)|p.139; bonus',
      'lesson-8/literacy-wb-5|Workbook: Spelling Practice (思, 次, and 何)|p.139; bonus',
      'lesson-8/literacy-wb-6|Workbook: Fill in the Kanji|p.140; I',
      'lesson-8/literacy-wb-7|Workbook: Translate the Sentences|p.140; II',
      
      // Lesson 9
      'lesson-9/vocab-1|Vocabulary: Nouns|p.210',
      'lesson-9/vocab-2|Vocabulary: い-adjectives and な-adjectives|p.210',
      'lesson-9/vocab-3|Vocabulary: U-verbs, Ru-verbs, and Irregular Verbs|p.210-211',
      'lesson-9/vocab-4|Vocabulary: Adverbs and Other Expressions|p.211',
      'lesson-9/vocab-5|Vocabulary: Numbers (to count small items)|p.211',
      'lesson-9/grammar-1|Review: Short Form Conjugation Rules (Past Tense)|p.212',
      'lesson-9/grammar-2|Practice: Short Form Past Conjugation (Verbs)|p.217; I-A',
      'lesson-9/grammar-3|Practice: Short Form Past Conjugation (Adjectives/Nouns)|p.217-218; I-B',
      'lesson-9/grammar-4|Practice: Informal Speech (Verbs)|p.218; II-A',
      'lesson-9/grammar-5|Practice: Informal Speech (Adjectives/Nouns)|p.219; II-B',
      'lesson-9/grammar-6|Practice: Quotations (～と思います)|p.219; III-A',
      'lesson-9/grammar-7|Practice: Quotations (～と言っていました)|p.220; IV-A',
      'lesson-9/grammar-8|Practice: Qualifying Nouns with Verbs|p.221; V-A',
      'lesson-9/grammar-9|Practice: まだ～ていません|p.222; VI-A',
      'lesson-9/grammar-10|Practice: ～から|p.223; VII-A',
      'lesson-9/culture-1|Culture Note: Japanese Traditional Culture|p.226',
      'lesson-9/vocab-6|Bonus Vocabulary: Colors|p.227',
      'lesson-9/vocab-7|Useful Expressions: Colors|p.227',
      'lesson-9/workbook-1|Workbook: Past Tense Short Forms|p.82',
      'lesson-9/workbook-2|Workbook: Past Tense Short Forms (Informal Speech)|p.83; I & II',
      'lesson-9/workbook-3|Workbook: Past Tense Short Forms (～と思います)|p.84; I & II',
      'lesson-9/workbook-4|Workbook: Past Tense Short Forms (～と言っていました)|p.85',
      'lesson-9/workbook-5|Workbook: Qualifying Nouns with Verbs|p.86',
      'lesson-9/workbook-6|Workbook: まだ～ていません|p.87',
      'lesson-9/workbook-7|Workbook: ～から|p.88; I & II',
      'lesson-9/workbook-8|Workbook: Questions|p.90',
      'lesson-9/literacy-1|Kanji Practice: 午, 後, and 前|p.328',
      'lesson-9/literacy-2|Kanji Practice: 名 and 白|p.328',
      'lesson-9/literacy-3|Kanji Practice: 雨, 書, and 友|p.328',
      'lesson-9/literacy-4|Kanji Practice: 間 and 家|p.329',
      'lesson-9/literacy-5|Kanji Practice: 話 and 少|p.329',
      'lesson-9/literacy-6|Kanji Practice: 古, 知, and 来|p.329',
      'lesson-9/literacy-7|Kanji Practice: Fill in the Blanks|p.330; I-A & B',
      'lesson-9/literacy-8|Reading Practice: スーさんの日記|p.330-332; II-A, B, & C',
      'lesson-9/literacy-9|Useful Expressions for Letters|p.333',
      'lesson-9/literacy-wb-1|Workbook: Kanji Writing Practice|p.141',
      'lesson-9/literacy-wb-2|Workbook: Spelling Practice (午, 後, 前, and 名)|p.141; bonus',
      'lesson-9/literacy-wb-3|Workbook: Spelling Practice (白, 雨, 書, and 友)|p.141; bonus',
      'lesson-9/literacy-wb-4|Workbook: Spelling Practice (間, 家, and 話)|p.141; bonus',
      'lesson-9/literacy-wb-5|Workbook: Spelling Practice (少, 古, 知, and 来)|p.141; bonus',
      'lesson-9/literacy-wb-6|Workbook: Fill in the Kanji|p.142; I',
      'lesson-9/literacy-wb-7|Workbook: Translate the Sentences|p.142; II',
      
      // Lesson 10
      'lesson-10/vocab-1|Vocabulary: Nouns 1|p.230',
      'lesson-10/vocab-2|Vocabulary: Nouns 2|p.230',
      'lesson-10/vocab-3|Vocabulary: い-adjectives and な-adjectives|p.230-231',
      'lesson-10/vocab-4|Vocabulary: U-verbs, Ru-verbs, and Irregular Verbs|p.231',
      'lesson-10/vocab-5|Vocabulary: Adverbs and Other Expressions|p.231',
      'lesson-10/grammar-1|Practice: Comparison between Two Items|p.237; I-A',
      'lesson-10/grammar-2|Practice: Comparison among Three or More Items|p.238-239; II-A',
      'lesson-10/grammar-3|Practice: Adjective/Noun + の|p.240; III-A',
      'lesson-10/grammar-4|Practice: ～つもりだ|p.241; IV-A',
      'lesson-10/grammar-5|Practice: Adjective + なる|p.242-243; V-A',
      'lesson-10/grammar-6|Practice: どこかに／どこにも|p.244; VI-A',
      'lesson-10/grammar-7|Practice: で行きます|p.245; VII-A',
      'lesson-10/grammar-8|Practice: かかります|p.245; VII-B',
      'lesson-10/culture-1|Culture Note: Public Transportation in Japan|p.247',
      'lesson-10/vocab-6|Bonus Vocabulary: At the Station 1|p.248',
      'lesson-10/vocab-7|Bonus Vocabulary: At the Station 2|p.248',
      'lesson-10/vocab-8|Useful Expressions: At the Station|p.249',
      'lesson-10/workbook-1|Workbook: Comparison between Two Items|p.91; I & II',
      'lesson-10/workbook-2|Workbook: Comparison among Three or More Items|p.92; I & II',
      'lesson-10/workbook-3|Workbook: Adjective/Noun + の|p.93; I & II',
      'lesson-10/workbook-4|Workbook: ～つもりだ|p.94; I & II',
      'lesson-10/workbook-5|Workbook: Adjective + なる|p.95; I & II',
      'lesson-10/workbook-6|Workbook: ～で行きます／かかります・どこかに／どこにも|p.96; I & II',
      'lesson-10/workbook-7|Workbook: Questions|p.99',
      'lesson-10/literacy-1|Kanji Practice: 住, 正, and 年|p.334',
      'lesson-10/literacy-2|Kanji Practice: 売, 買, and 町|p.334',
      'lesson-10/literacy-3|Kanji Practice: 長, 道, and 雪|p.334-335',
      'lesson-10/literacy-4|Kanji Practice: 立, 自, and 夜|p.335',
      'lesson-10/literacy-5|Kanji Practice: 朝 and 持|p.335',
      'lesson-10/literacy-6|Kanji Practice: Antonyms|p.336; I-B',
      'lesson-10/literacy-7|Kanji Practice: Fill in the Blanks|p.336; I-C',
      'lesson-10/literacy-8|Reading Practice: かさじぞう|p.337-339; II-C & D',
      'lesson-10/literacy-wb-1|Workbook: Kanji Writing Practice|p.143',
      'lesson-10/literacy-wb-2|Workbook: Spelling Practice (住, 正, 年, and 売)|p.143; bonus',
      'lesson-10/literacy-wb-3|Workbook: Spelling Practice (買, 町, 長, and 道)|p.143; bonus',
      'lesson-10/literacy-wb-4|Workbook: Spelling Practice (雪, 立, and 自)|p.143; bonus',
      'lesson-10/literacy-wb-5|Workbook: Spelling Practice (夜, 朝, and 持)|p.143; bonus',
      'lesson-10/literacy-wb-6|Workbook: Fill in the Kanji|p.144; I',
      'lesson-10/literacy-wb-7|Workbook: Translate the Sentences|p.144; II',
      
      // Lesson 11
      'lesson-11/vocab-1|Vocabulary: Nouns 1|p.252',
      'lesson-11/vocab-2|Vocabulary: Nouns 2|p.252',
      'lesson-11/vocab-3|Vocabulary: U-verbs, Ru-verbs, and Irregular Verbs|p.252-253',
      'lesson-11/vocab-4|Vocabulary: Adverbs and Other Expressions|p.253',
      'lesson-11/vocab-5|Vocabulary: Occupations|p.253',
      'lesson-11/grammar-1|Practice: ～たい|p.259; I-A',
      'lesson-11/grammar-2|Practice: ～たい (Past Tense)|p.259; I-C',
      'lesson-11/grammar-3|Practice: ～たり～たりする|p.261; II-A',
      'lesson-11/grammar-4|Practice: ～ことがある|p.262; III-A',
      'lesson-11/grammar-5|Practice: Noun A や Noun B|p.263; IV-A',
      'lesson-11/culture-1|Culture Note: New Year\'s|p.264',
      'lesson-11/vocab-6|Useful Expressions: In the Japanese Class|p.265',
      'lesson-11/vocab-7|Bonus Vocabulary: In the Japanese Class 1|p.265',
      'lesson-11/vocab-8|Bonus Vocabulary: In the Japanese Class 2|p.265',
      'lesson-11/workbook-1|Workbook: ～たい|p.100; I & II',
      'lesson-11/workbook-2|Workbook: ～たり～たりする|p.101; I & II',
      'lesson-11/workbook-3|Workbook: ～ことがある|p.102; I & II',
      'lesson-11/workbook-4|Workbook: Noun A や Noun B|p.103',
      'lesson-11/workbook-5|Workbook: Questions|p.105; I & II',
      'lesson-11/literacy-1|Kanji Practice: 手, 紙, and 好|p.340',
      'lesson-11/literacy-2|Kanji Practice: 近, 明, 病, and 院|p.340',
      'lesson-11/literacy-3|Kanji Practice: 映, 画, and 歌|p.340-341',
      'lesson-11/literacy-4|Kanji Practice: 市, 所, and 勉|p.341',
      'lesson-11/literacy-5|Kanji Practice: 強, 有, and 旅|p.341',
      'lesson-11/literacy-6|Kanji Practice: Compounds|p.342; I-B',
      'lesson-11/literacy-7|Reading Practice: 友だち募集|p.342-344; II-C, D, & E',
      'lesson-11/literacy-wb-1|Workbook: Kanji Writing Practice|p.145',
      'lesson-11/literacy-wb-2|Workbook: Spelling Practice (手, 紙, 好, and 近)|p.145; bonus',
      'lesson-11/literacy-wb-3|Workbook: Spelling Practice (明, 病, 院, and 映)|p.145; bonus',
      'lesson-11/literacy-wb-4|Workbook: Spelling Practice (画, 歌, 市, and 所)|p.145; bonus',
      'lesson-11/literacy-wb-5|Workbook: Spelling Practice (勉, 強, 有, and 旅)|p.145; bonus',
      'lesson-11/literacy-wb-6|Workbook: Fill in the Kanji|p.146; I',
      'lesson-11/literacy-wb-7|Workbook: Translate the Sentences|p.146; II',
      
      // Lesson 12
      'lesson-12/vocab-1|Vocabulary: Nouns 1|p.268',
      'lesson-12/vocab-2|Vocabulary: Nouns 2|p.268',
      'lesson-12/vocab-3|Vocabulary: い-adjectives and な-adjectives|p.268-269',
      'lesson-12/vocab-4|Vocabulary: U-verbs, Ru-verbs, and Irregular Verbs|p.269',
      'lesson-12/vocab-5|Vocabulary: Adverbs and Other Expressions|p.269',
      'lesson-12/grammar-1|Practice: ～んです|p.276; I-A',
      'lesson-12/grammar-2|Practice: ～んです 2|p.277; I-B',
      'lesson-12/grammar-3|Practice: ～すぎる|p.278-279; II-A',
      'lesson-12/grammar-4|Practice: ～ほうがいいです|p.280; III-A',
      'lesson-12/grammar-5|Practice: ～ので|p.281; IV-A',
      'lesson-12/grammar-6|Practice: ～なければいけません／なきゃいけません|p.282; V-A',
      'lesson-12/grammar-7|Practice: ～なければいけません／なきゃいけません (Informal)|p.282; V-C',
      'lesson-12/grammar-8|Practice: ～でしょう|p.283; VI-A',
      'lesson-12/culture-1|Culture Note: The Japanese Climate|p.286',
      'lesson-12/vocab-6|Useful Expressions: Health and Illness|p.287-288',
      'lesson-12/vocab-7|Bonus Vocabulary: Health and Illness|p.288',
      'lesson-12/workbook-1|Workbook: ～んです|p.106; I & II',
      'lesson-12/workbook-2|Workbook: ～すぎる|p.107; I & II',
      'lesson-12/workbook-3|Workbook: ～ほうがいいです|p.108; I & II',
      'lesson-12/workbook-4|Workbook: ～ので|p.109; I & II',
      'lesson-12/workbook-5|Workbook: ～なければいけません／なきゃいけません|p.110; I & II',
      'lesson-12/workbook-6|Workbook: ～でしょう|p.111; I & II',
      'lesson-12/workbook-7|Workbook: Questions|p.113',
      'lesson-12/literacy-1|Kanji Practice: 昔, 々, and 神|p.346',
      'lesson-12/literacy-2|Kanji Practice: 早, 起, and 牛|p.346',
      'lesson-12/literacy-3|Kanji Practice: 使, 働, and 連|p.346-347',
      'lesson-12/literacy-4|Kanji Practice: 別 and 度|p.347',
      'lesson-12/literacy-5|Kanji Practice: 赤, 青, and 色|p.347',
      'lesson-12/literacy-6|Kanji Practice: Match the Readings|p.348; I-A',
      'lesson-12/literacy-7|Reading Practice: 七夕|p.349-350; II-B & C',
      'lesson-12/literacy-wb-1|Workbook: Kanji Writing Practice|p.147',
      'lesson-12/literacy-wb-2|Workbook: Spelling Practice (昔, 々, 神, and 早)|p.147; bonus',
      'lesson-12/literacy-wb-3|Workbook: Spelling Practice (起, 牛, 使, and 働)|p.147; bonus',
      'lesson-12/literacy-wb-4|Workbook: Spelling Practice (連, 別, and 度)|p.147; bonus',
      'lesson-12/literacy-wb-5|Workbook: Spelling Practice (赤, 青, and 色)|p.147; bonus',
      'lesson-12/literacy-wb-6|Workbook: Fill in the Kanji|p.148; I',
      'lesson-12/literacy-wb-7|Workbook: Translate the Sentences|p.148; II',
      
      // Lesson 13
      'lesson-13/vocab-1|Vocabulary: Nouns 1|p.28',
      'lesson-13/vocab-2|Vocabulary: Nouns 2|p.28',
      'lesson-13/vocab-3|Vocabulary: い-adjectives and な-adjectives|p.28-29',
      'lesson-13/vocab-4|Vocabulary: U-verbs and Irregular Verbs|p.29',
      'lesson-13/vocab-5|Vocabulary: Adverbs and Other Expressions|p.29',
      'lesson-13/vocab-6|Vocabulary: Numbers Used to Count Days|p.29',
      'lesson-13/grammar-1|Practice: Potential Verbs 1|p.37; I-A',
      'lesson-13/grammar-2|Practice: Potential Verbs 2|p.37; I-B',
      'lesson-13/grammar-3|Practice: Potential Verbs 3|p.39; I-F',
      'lesson-13/grammar-4|Practice: ～し|p.39-40; II-A',
      'lesson-13/grammar-5|Practice: ～そうです 1|p.41; III-A',
      'lesson-13/grammar-6|Practice: ～そうです 2|p.42; III-B',
      'lesson-13/grammar-7|Practice: ～てみる|p.43; IV-A',
      'lesson-13/grammar-8|Practice: なら|p.44; V-A',
      'lesson-13/grammar-9|Practice: 一週間に三回|p.45-46; VI-A',
      'lesson-13/culture-1|Culture Note: Names of Years|p.48',
      'lesson-13/culture-2|Culture Note: East Asian Zodiacs|p.48',
      'lesson-13/vocab-7|Bonus Vocabulary: At the Bank|p.49',
      'lesson-13/vocab-8|Useful Expressions: At the Bank|p.49',
      'lesson-13/workbook-1|Workbook: Potential Verbs Conjugation Practice|p.11; I',
      'lesson-13/workbook-2|Workbook: Potential Verbs 1|p.12; II',
      'lesson-13/workbook-3|Workbook: Potential Verbs 2|p.13; I & II',
      'lesson-13/workbook-4|Workbook: ～し|p.14; I & II',
      'lesson-13/workbook-5|Workbook: ～そうです|p.15; I & II',
      'lesson-13/workbook-6|Workbook: ～てみる|p.16; I & II',
      'lesson-13/workbook-7|Workbook: なら|p.17; I & II',
      'lesson-13/workbook-8|Workbook: 一週間に三回|p.18; I & II',
      'lesson-13/workbook-9|Workbook: Questions|p.20; I & II',
      'lesson-13/literacy-1|Kanji Practice: 物, 鳥, and 料|p.276',
      'lesson-13/literacy-2|Kanji Practice: 理, 特, and 安|p.276',
      'lesson-13/literacy-3|Kanji Practice: 販, 肉, and 悪|p.276-277',
      'lesson-13/literacy-4|Kanji Practice: 体, 空, and 港|p.277',
      'lesson-13/literacy-5|Kanji Practice: 着, 同, 海, and 昼|p.277',
      'lesson-13/literacy-6|Kanji Practice: Write the Readings|p.278; I-A & B',
      'lesson-13/literacy-7|Reading Practice: Identify the Food|p.279; II-A',
      'lesson-13/literacy-8|Reading Practice: 日本のおもしろい経験|p.279-280; II-B & C',
      'lesson-13/literacy-9|Reading Practice: 満員電車|p.281-282; III-B & C',
      'lesson-13/literacy-wb-1|Workbook: Kanji Writing Practice|p.109',
      'lesson-13/literacy-wb-2|Workbook: Spelling Practice (物, 鳥, 料, and 理)|p.109; bonus',
      'lesson-13/literacy-wb-3|Workbook: Spelling Practice (特, 安, 飯, and 肉)|p.109; bonus',
      'lesson-13/literacy-wb-4|Workbook: Spelling Practice (悪, 体, 空, and 港)|p.109; bonus',
      'lesson-13/literacy-wb-5|Workbook: Spelling Practice (着, 同, 海, and 昼)|p.109; bonus',
      'lesson-13/literacy-wb-6|Workbook: Fill in the Blanks|p.110',
      
      // Lesson 14
      'lesson-14/vocab-1|Vocabulary: Nouns 1|p.52',
      'lesson-14/vocab-2|Vocabulary: Nouns 2|p.52',
      'lesson-14/vocab-3|Vocabulary: Adjectives and Verbs|p.53',
      'lesson-14/vocab-4|Vocabulary: Adverbs and Other Expressions|p.53',
      'lesson-14/vocab-5|Vocabulary: Counters|p.53',
      'lesson-14/grammar-1|Practice: ほしい (Present)|p.61; I-A',
      'lesson-14/grammar-2|Practice: ほしい (Past)|p.61; I-B',
      'lesson-14/grammar-3|Practice: ～かもしれません|p.63; II-A',
      'lesson-14/grammar-4|Practice: あげる|p.65; III-A',
      'lesson-14/grammar-5|Practice: くれる／もらう|p.66; III-C',
      'lesson-14/grammar-6|Practice: あげる／くれる／もらう|p.66; III-D',
      'lesson-14/grammar-7|Practice: ～たらどうですか|p.68; IV-A',
      'lesson-14/grammar-8|Practice: Counters|p.69; V-A',
      'lesson-14/grammar-9|Practice: Number+も／Number+しか+Negative|p.69; V-B',
      'lesson-14/culture-1|Culture Note: Annual Events in Japan|p.72',
      'lesson-14/vocab-6|Useful Expressions: Counters|p.73',
      'lesson-14/workbook-1|Workbook: ほしい|p.21; I, II, & III',
      'lesson-14/workbook-2|Workbook: ～かもしれません|p.22; I & II',
      'lesson-14/workbook-3|Workbook: あげる／くれる／もらう|p.23; I & II',
      'lesson-14/workbook-4|Workbook: ～たらどうですか|p.24; I & II',
      'lesson-14/workbook-5|Workbook: Number+も／Number+しか+Negative|p.25; I & II',
      'lesson-14/workbook-6|Workbook: Questions|p.27; I',
      'lesson-14/literacy-1|Kanji Practice: 彼, 代, and 留|p.283',
      'lesson-14/literacy-2|Kanji Practice: 族, 親, and 切|p.283',
      'lesson-14/literacy-3|Kanji Practice: 英, 店, and 去|p.283-284',
      'lesson-14/literacy-4|Kanji Practice: 急, 乗, and 当|p.284',
      'lesson-14/literacy-5|Kanji Practice: 音, 楽, 医, and 者|p.284',
      'lesson-14/literacy-6|Kanji Practice: Write the Readings|p.285; I-A & B',
      'lesson-14/literacy-7|Reading Practice: 悩みの相談|p.286-287; II-B & C',
      'lesson-14/literacy-wb-1|Workbook: Kanji Writing Practice|p.111',
      'lesson-14/literacy-wb-2|Workbook: Spelling Practice (彼, 代, 留, and 族)|p.111; bonus',
      'lesson-14/literacy-wb-3|Workbook: Spelling Practice (親, 切, 英, and 店)|p.111; bonus',
      'lesson-14/literacy-wb-4|Workbook: Spelling Practice (去, 急, 乗, and 当)|p.111; bonus',
      'lesson-14/literacy-wb-5|Workbook: Spelling Practice (音, 楽, 医, and 者)|p.111; bonus',
      'lesson-14/literacy-wb-6|Workbook: Fill in the Blanks|p.112',
      
      // Lesson 15
      'lesson-15/vocab-1|Vocabulary: Nouns 1|p.76',
      'lesson-15/vocab-2|Vocabulary: Nouns 2|p.76',
      'lesson-15/vocab-3|Vocabulary: い-adjectives, U-verbs, and Ru-Verbs|p.76-77',
      'lesson-15/vocab-4|Vocabulary: Irregular Verbs, Adverbs, and Other Expressions|p.77',
      'lesson-15/culture-1|Culture Note: Japanese Accommodations|p.81',
      'lesson-15/vocab-6|Bonus Vocabulary: ～目|p.83',
      'lesson-15/grammar-1|Practice: Volitional Form 1|p.84; I-A',
      'lesson-15/grammar-2|Practice: Volitional Form 2|p.84-85; I-B',
      'lesson-15/grammar-3|Practice: Volitional Form + と思っています|p.86; II-A',
      'lesson-15/grammar-4|Practice: ～ておく|p.87; III-A',
      'lesson-15/grammar-5|Practice: Using Sentences to Qualify Nouns 1|p.88-89; IV-A',
      'lesson-15/grammar-6|Practice: Using Sentences to Qualify Nouns 2|p.89; IV-B',
      'lesson-15/grammar-7|Practice: Using Sentences to Qualify Nouns 3|p.90-91; IV-D',
      'lesson-15/vocab-5|Useful Expressions: At the Hotel|p.95',
      'lesson-15/workbook-1|Workbook: Volitional Form Conjugation Practice|p.28; I',
      'lesson-15/workbook-2|Workbook: Volitional Form|p.28; II',
      'lesson-15/workbook-3|Workbook: Volitional Form + と思っています|p.29; I & II',
      'lesson-15/workbook-4|Workbook: ～ておく|p.30; I & II',
      'lesson-15/workbook-5|Workbook: Using Sentences to Qualify Nouns 1|p.31; I & II',
      'lesson-15/workbook-6|Workbook: Using Sentences to Qualify Nouns 2|p.32; I & II',
      'lesson-15/workbook-7|Workbook: Questions|p.34; I',
      'lesson-15/literacy-1|Kanji Practice: 死, 意, and 味|p.288',
      'lesson-15/literacy-2|Kanji Practice: 注, 夏, 魚, and 寺|p.288',
      'lesson-15/literacy-3|Kanji Practice: 広, 転, and 借|p.288-289',
      'lesson-15/literacy-4|Kanji Practice: 走, 建, and 地|p.289',
      'lesson-15/literacy-5|Kanji Practice: 場, 足, and 通|p.289',
      'lesson-15/literacy-6|Kanji Practice: Write the Readings|p.290; I-A & B',
      'lesson-15/literacy-7|Reading Practice: 私が好きな所|p.291-294; II-B, C, & B',
      'lesson-15/literacy-wb-1|Workbook: Kanji Writing Practice|p.113',
      'lesson-15/literacy-wb-2|Workbook: Spelling Practice (死, 意, 味, and 注)|p.113; bonus',
      'lesson-15/literacy-wb-3|Workbook: Spelling Practice (夏, 魚, 寺, and 広)|p.113; bonus',
      'lesson-15/literacy-wb-4|Workbook: Spelling Practice (転, 借, 走, and 建)|p.113; bonus',
      'lesson-15/literacy-wb-5|Workbook: Spelling Practice (地, 場, 足, and 通)|p.113; bonus',
      'lesson-15/literacy-wb-6|Workbook: Fill in the Blanks|p.114',
      
      // Lesson 16
      'lesson-16/vocab-1|Vocabulary: Nouns|p.98',
      'lesson-16/vocab-2|Vocabulary: い-adjectives and U-verbs|p.98-99',
      'lesson-16/vocab-3|Vocabulary: Ru-verbs and Irregular Verbs|p.99',
      'lesson-16/vocab-4|Vocabulary: Adverbs and Other Expressions|p.99',
      'lesson-16/grammar-1|Practice: ～てあげる|p.108; I-A',
      'lesson-16/grammar-2|Practice: ～てくれる／～てもらう|p.109; I-C',
      'lesson-16/grammar-3|Practice: ～てあげる／～てくれる／～てもらう|p.110; I-E',
      'lesson-16/grammar-4|Practice: ～ていただけませんか|p.112; II-A',
      'lesson-16/grammar-5|Practice: ～といいですね|p.113; III-A',
      'lesson-16/grammar-6|Practice: ～時 1|p.114; IV-A',
      'lesson-16/grammar-7|Practice: ～時 2|p.115; IV-B',
      'lesson-16/grammar-8|Practice: ～てすみませんでした 1|p.116; V-A',
      'lesson-16/grammar-9|Practice: ～てすみませんでした 2|p.116; V-B',
      'lesson-16/culture-1|Culture Note: Gift-giving in Japan|p.117',
      'lesson-16/workbook-1|Workbook: ～てあげる／～てくれる／～てもらう 1|p.35; I & II',
      'lesson-16/workbook-2|Workbook: ～てあげる／～てくれる／～てもらう 2|p.36; I & II',
      'lesson-16/workbook-3|Workbook: ～ていただけませんか|p.37; I & II',
      'lesson-16/workbook-4|Workbook: ～といいですね／～といいんですが|p.38; I & II',
      'lesson-16/workbook-5|Workbook: ～時 1|p.39; I & II',
      'lesson-16/workbook-6|Workbook: ～時 2|p.40; I & II',
      'lesson-16/workbook-7|Workbook: ～てすみませんでした|p.41; I & II',
      'lesson-16/workbook-8|Workbook: Questions|p.43; I',
      'lesson-16/literacy-1|Kanji Practice: 供, 世, and 界|p.295',
      'lesson-16/literacy-2|Kanji Practice: 全, 部, and 始|p.295',
      'lesson-16/literacy-3|Kanji Practice: 週, 以, and 考|p.295-296',
      'lesson-16/literacy-4|Kanji Practice: 開, 屋, and 方|p.296',
      'lesson-16/literacy-5|Kanji Practice: 運, 動, 教, and 室|p.296',
      'lesson-16/literacy-6|Kanji Practice: Write the Readings|p.297; I-A & B',
      'lesson-16/literacy-7|Reading Practice: まんが「ドラえもん」|p.298-300; II-B, C, & D',
      'lesson-16/literacy-wb-1|Workbook: Kanji Writing Practice|p.115',
      'lesson-16/literacy-wb-2|Workbook: Spelling Practice (供, 世, 界, and 全)|p.115; bonus',
      'lesson-16/literacy-wb-3|Workbook: Spelling Practice (部, 始, 週, and 以)|p.115; bonus',
      'lesson-16/literacy-wb-4|Workbook: Spelling Practice (考, 開, 屋, and 方)|p.115; bonus',
      'lesson-16/literacy-wb-5|Workbook: Spelling Practice (運, 動, 教, and 室)|p.115; bonus',
      'lesson-16/literacy-wb-6|Workbook: Fill in the Blanks|p.116',
      
      // Lesson 17
      'lesson-17/vocab-1|Vocabulary: Nouns 1|p.120',
      'lesson-17/vocab-2|Vocabulary: Nouns 2|p.120',
      'lesson-17/vocab-3|Vocabulary: い-adjectives and U-verbs|p.120-121',
      'lesson-17/vocab-4|Vocabulary: Ru-verbs and Irregular Verbs|p.121',
      'lesson-17/vocab-5|Vocabulary: Adverbs and Other Expressions|p.121',
      'lesson-17/culture-1|Culture Note: Japanese Gestures|p.128',
      'lesson-17/grammar-1|Practice: ～そうです (I hear)|p.129; I-A',
      'lesson-17/grammar-2|Practice: ～って|p.130; II-A',
      'lesson-17/grammar-3|Practice: ～たら 1|p.131; III-A',
      'lesson-17/grammar-4|Practice: ～たら 2|p.131; III-B',
      'lesson-17/grammar-5|Practice: ～なくてもいいです|p.132; IV-A',
      'lesson-17/grammar-6|Practice: ～みたいです|p.134; V-A',
      'lesson-17/grammar-7|Practice: ～てから|p.136; VI-A',
      'lesson-17/grammar-8|Practice: ～前に|p.137; VI-B',
      'lesson-17/vocab-6|Useful Expressions: At the Barber/Beauty Salon|p.139',
      'lesson-17/vocab-7|Bonus Vocabulary: At the Barber/Beauty Salon|p.139',
      'lesson-17/workbook-1|Workbook: ～そうです／～って|p.44; I, II, & III',
      'lesson-17/workbook-2|Workbook: ～たら|p.45; I & II',
      'lesson-17/workbook-3|Workbook: ～なくてもいいです|p.46; I, II, & III',
      'lesson-17/workbook-4|Workbook: ～みたいです|p.47; I & II',
      'lesson-17/workbook-5|Workbook: ～前に／～てから|p.48; I & II',
      'lesson-17/workbook-6|Workbook: Questions|p.50; I',
      'lesson-17/literacy-1|Kanji Practice: 歳, 習, and 主|p.301',
      'lesson-17/literacy-2|Kanji Practice: 結, 婚, and 集|p.301',
      'lesson-17/literacy-3|Kanji Practice: 発, 表, and 品|p.301-302',
      'lesson-17/literacy-4|Kanji Practice: 字, 活, and 写|p.302',
      'lesson-17/literacy-5|Kanji Practice: 真, 歩, and 野|p.302',
      'lesson-17/literacy-6|Kanji Practice: Write the Readings|p.303; I-A & B',
      'lesson-17/literacy-7|Reading Practice: オノ・ヨーコ|p.304-306; II-A, B, & C',
      'lesson-17/literacy-wb-1|Workbook: Kanji Writing Practice|p.117',
      'lesson-17/literacy-wb-2|Workbook: Spelling Practice (歳, 習, 主, and 結)|p.117; bonus',
      'lesson-17/literacy-wb-3|Workbook: Spelling Practice (婚, 集, 発, and 表)|p.117; bonus',
      'lesson-17/literacy-wb-4|Workbook: Spelling Practice (品, 字, and 活)|p.117; bonus',
      'lesson-17/literacy-wb-5|Workbook: Spelling Practice (写, 真, 歩, and 野)|p.117; bonus',
      'lesson-17/literacy-wb-6|Workbook: Fill in the Blanks|p.118',
      
      // Lesson 18
      'lesson-18/vocab-1|Vocabulary: Nouns 1|p.142',
      'lesson-18/vocab-2|Vocabulary: Nouns 2|p.142',
      'lesson-18/vocab-3|Vocabulary: い-adjectives and U-verbs|p.142-143',
      'lesson-18/vocab-4|Vocabulary: Ru-verbs and Irregular Verbs|p.143',
      'lesson-18/vocab-5|Vocabulary: Adverbs and Other Expressions|p.143',
      'lesson-18/vocab-6|Review: Transitivity Pairs|p.144',
      'lesson-18/grammar-1|Practice: Transitivity Pairs|p.150; I-A',
      'lesson-18/grammar-2|Practice: Transitivity Pairs + ている|p.151-152; I-C',
      'lesson-18/grammar-3|Practice: ～てしまう 1|p.153; II-A',
      'lesson-18/grammar-4|Practice: ～てしまう 2|p.153; II-B',
      'lesson-18/grammar-5|Practice: ～ちゃう／～じゃう|p.154; II-C',
      'lesson-18/grammar-6|Practice: ～と|p.155; III-A',
      'lesson-18/grammar-7|Practice: ～ながら|p.157; IV-A',
      'lesson-18/grammar-8|Practice: ～ばよかったです Conjugation|p.158; V-A',
      'lesson-18/grammar-9|Practice: ～ばよかったです|p.158-159; V-B',
      'lesson-18/culture-1|Culture Note: Sushi|p.163',
      'lesson-18/culture-2|Culture Note: Popular Sushi Toppings|p.163',
      'lesson-18/workbook-0|Workbook: Transitivity Pairs|bonus',
      'lesson-18/workbook-1|Workbook: Transitivity Pairs 1|p.51; I & II',
      'lesson-18/workbook-2|Workbook: Transitivity Pairs 2|p.52; I',
      'lesson-18/workbook-3|Workbook: ～てしまう|p.53; I & II',
      'lesson-18/workbook-4|Workbook: ～と|p.54; I, II, & III',
      'lesson-18/workbook-5|Workbook: ～ながら|p.55; I, II, & III',
      'lesson-18/workbook-6|Workbook: ～ばよかったです|p.56; I, II, & III',
      'lesson-18/workbook-7|Workbook: Questions|p.58; I',
      'lesson-18/literacy-1|Kanji Practice: 目, 的, and 力|p.308',
      'lesson-18/literacy-2|Kanji Practice: 洋, 服, 堂, and 授|p.308',
      'lesson-18/literacy-3|Kanji Practice: 業, 試, and 験|p.308-309',
      'lesson-18/literacy-4|Kanji Practice: 貸, 図, and 館|p.309',
      'lesson-18/literacy-5|Kanji Practice: 終, 宿, and 題|p.309',
      'lesson-18/literacy-6|Kanji Practice: Write the Readings|p.310; I-A & B',
      'lesson-18/literacy-7|Reading Practice: 大学生のアルバイト|p.310-311; II-B',
      'lesson-18/literacy-8|Reading Practice: 橋本くんの大学生活|p.312-313; III-A & B',
      'lesson-18/literacy-wb-1|Workbook: Kanji Writing Practice|p.119',
      'lesson-18/literacy-wb-2|Workbook: Spelling Practice (目, 的, 力, and 洋)|p.119; bonus',
      'lesson-18/literacy-wb-3|Workbook: Spelling Practice (服, 堂, 授, and 業)|p.119; bonus',
      'lesson-18/literacy-wb-4|Workbook: Spelling Practice (試, 験, 貸, and 図)|p.119; bonus',
      'lesson-18/literacy-wb-5|Workbook: Spelling Practice (館, 終, 宿, and 題)|p.119; bonus',
      'lesson-18/literacy-wb-6|Workbook: Fill in the Blanks|p.120',
      
      // Lesson 19
      'lesson-19/vocab-1|Vocabulary: Nouns 1|p.166',
      'lesson-19/vocab-2|Vocabulary: Nouns 2 and Adjectives|p.166',
      'lesson-19/vocab-3|Vocabulary: U-verbs|p.166-167',
      'lesson-19/vocab-4|Vocabulary: Ru-verbs and Irregular Verbs|p.167',
      'lesson-19/vocab-5|Vocabulary: Adverbs and Other Expressions|p.167',
      'lesson-19/grammar-1|Practice: Honorific Verbs 1|p.174; I-A',
      'lesson-19/grammar-2|Practice: Honorific Verbs 2|p.174-175; I-B',
      'lesson-19/grammar-3|Practice: Honorific Verbs 3|p.175; I-C',
      'lesson-19/grammar-4|Practice: Giving Respectful Advice|p.176; II',
      'lesson-19/grammar-5|Practice: ～てくれてありがとう|p.177; III-A',
      'lesson-19/grammar-6|Practice: ～てよかったです|p.178; IV-A',
      'lesson-19/grammar-7|Practice: ～はずです 1|p.179; V-A',
      'lesson-19/grammar-8|Practice: ～はずです 2|p.180-181; V-D',
      'lesson-19/culture-1|Culture Note: Visiting Someone\'s House|p.183',
      'lesson-19/workbook-1|Workbook: Honorific Verbs 1|p.59',
      'lesson-19/workbook-2|Workbook: Honorific Verbs 2|p.60; I & II',
      'lesson-19/workbook-3|Workbook: Honorific Verbs 3・Giving Respectful Advice|p.61; I & II',
      'lesson-19/workbook-4|Workbook: ～てくれてありがとう|p.62; I & II',
      'lesson-19/workbook-5|Workbook: ～てよかったです|p.63; I & II',
      'lesson-19/workbook-6|Workbook: ～はずです|p.64; I, II, & III',
      'lesson-19/workbook-7|Workbook: Questions|p.67; I',
      'lesson-19/literacy-1|Kanji Practice: 春, 秋, and 冬|p.315',
      'lesson-19/literacy-2|Kanji Practice: 花, 様, and 不|p.315',
      'lesson-19/literacy-3|Kanji Practice: 姉, 兄, 漢, and 卒|p.315-316',
      'lesson-19/literacy-4|Kanji Practice: 工, 研, and 究|p.316',
      'lesson-19/literacy-5|Kanji Practice: 質, 問, and 多|p.316',
      'lesson-19/literacy-6|Kanji Practice: Write the Readings|p.317; I-A & B',
      'lesson-19/literacy-7|Reading Practice: お礼の手紙|p.318-319; II-A, B, & C',
      'lesson-19/literacy-8|Reading Practice: マリアさんのメール|p.320-321; II-A & B',
      'lesson-19/literacy-9|Useful Expressions for Greeting Cards|p.322',
      'lesson-19/literacy-wb-1|Workbook: Kanji Writing Practice|p.121',
      'lesson-19/literacy-wb-2|Workbook: Spelling Practice (春, 秋, 冬, and 花)|p.121; bonus',
      'lesson-19/literacy-wb-3|Workbook: Spelling Practice (様, 不, 姉, and 兄)|p.121; bonus',
      'lesson-19/literacy-wb-4|Workbook: Spelling Practice (漢, 卒, 工, and 研)|p.121; bonus',
      'lesson-19/literacy-wb-5|Workbook: Spelling Practice (究, 質, 問, and 多)|p.121; bonus',
      'lesson-19/literacy-wb-6|Workbook: Fill in the Blanks|p.122',
      
      // Lesson 20
      'lesson-20/vocab-1|Vocabulary: Nouns 1|p.186',
      'lesson-20/vocab-2|Vocabulary: Nouns 2 and い-adjectives|p.186',
      'lesson-20/vocab-3|Vocabulary: U-verbs|p.186-187',
      'lesson-20/vocab-4|Vocabulary: Ru-verbs and Irregular Verbs|p.187',
      'lesson-20/vocab-5|Vocabulary: Adverbs and Other Expressions|p.187',
      'lesson-20/grammar-1|Practice: Extra-modest Expressions 1|p.195; I-A',
      'lesson-20/grammar-2|Practice: Extra-modest Expressions 2|p.195; I-B',
      'lesson-20/grammar-3|Practice: Extra-modest Expressions 3|p.196; I-D',
      'lesson-20/grammar-4|Practice: Humble Expressions 1|p.197; II-A',
      'lesson-20/grammar-5|Practice: Humble Expressions 2|p.197-198; II-B',
      'lesson-20/grammar-6|Practice: ～ないで|p.199-200; III-A',
      'lesson-20/grammar-7|Practice: Questions within Larger Sentences 1|p.200-201; IV-A',
      'lesson-20/grammar-8|Practice: Questions within Larger Sentences 2|p.201; IV-B',
      'lesson-20/grammar-9|Practice: name という item|p.202; V-A',
      'lesson-20/grammar-10|Practice: ～やすい／にくい|p.203; VI-A',
      'lesson-20/culture-1|Culture Note: Japanese Pop Culture|p.207',
      'lesson-20/workbook-1|Workbook: Extra-modest Expressions|p.68',
      'lesson-20/workbook-2|Workbook: Humble Expressions 1|p.69',
      'lesson-20/workbook-3|Workbook: Humble Expressions 2|p.70; I & II',
      'lesson-20/workbook-4|Workbook: Three Types of Respect Language|p.71; I & II',
      'lesson-20/workbook-5|Workbook: ～ないで|p.72; I & II',
      'lesson-20/workbook-6|Workbook: Questions Within Larger Sentences|p.73; I & II',
      'lesson-20/workbook-7|Workbook: Name という Item・～やすい／～にくい|p.74; I & II',
      'lesson-20/workbook-8|Workbook: Questions|p.76; I',
      'lesson-20/literacy-1|Kanji Practice: 皿, 声, and 茶|p.323',
      
      // Study Tools
      'study-tools/custom-vocab|Custom Vocabulary Practice',
      'study-tools/custom-spelling|Custom Spelling Practice',
      'study-tools/custom-quiz|Custom Quiz',
      'study-tools/custom-written-quiz|Custom Written Quiz'
    ],


    // scroll to the specified element: Genki.scrollTo('#lesson-3')
    // scrolling can be delayed by passing a value that evaluates to true (true; 1; '.') to the second param; delay
    // the second param is mostly for script generated content, i.e. the exercises, since there's a small delay before the content is visible
    scrollTo : function (el, delay) {
      // check if el is a selector
      if (typeof el == 'string') {
        el = document.querySelector(el);
      }

      var scroll = function () {
        document.body.scrollTop = el.offsetTop;
        document.documentElement.scrollTop = el.offsetTop;
      };

      // scroll immediately or wait 100ms
      // the latter is for exercises, where there's a slight delay before content is available
      if (delay) {
        setTimeout(scroll, 100);
      } else {
        scroll();
      }
    },


    // To generate a quiz simply pass an object with the necessary data (see vocab-1/index.html and other quiz files for examples)
    generateQuiz : function (o) {
      var zone = document.getElementById('quiz-zone'); // area where quizzes are inserted

      /****************************
      ======# EXERCISE TYPES #=====
      *****************************
      ** 1. DRAG AND DROP        **
      ** 2. KANA DRAG AND DROP   **
      ** 3. VERB CONJUGATION     **
      ** 4. WRITING PRACTICE     **
      ** 5. MULTIPLE CHOICE      **
      ** 6. FILL IN THE BLANKS   **
      *****************************/

      // # 1. DRAG AND DROP #
      if (o.type == 'drag') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
            dropList = '<div id="drop-list">',
            keysQ = [],
            keysA,
            helper,
            helperPresent,
            i;

        // generate a key list for the quizlet so we can randomly sort questions and answers
        for (i in o.quizlet) {
          keysQ.push(i);
        }
        keysA = keysQ.slice(0);

        // generate the questions
        while (keysQ.length) {
          i = Math.floor(Math.random() * keysQ.length);
          
          // | is used to separate a word from a helper
          helper = /\|/.test(keysQ[i]) ? 'data-helper="' + keysQ[i].split('|').pop() + '"' : null;
          
          // add the quiz items and drop zones
          quiz += '<div class="quiz-item" ' + (helper || '') + '>' + (helper ? keysQ[i].replace(/(.*?)\|(.*)/, '$1<span class="hidden-text">$2</span>') : keysQ[i]) + '</div>';
          dropList += '<div class="quiz-answer-zone' + (/\|/.test(keysQ[i]) ? ' helper-answer' : '') + '" data-text="' + keysQ[i].replace(/\|.*?$/, '') + '" data-mistakes="0"></div>';
          keysQ.splice(i, 1);
          
          ++Genki.stats.problems;
          
          // indicate that a helper, such as furigana, is present
          if (!helperPresent && helper) {
            helperPresent = true;
          }
        }
        quiz += '</div>' + dropList + '</div>'; // close the question list and add the drop list

        // add a class for the helper styles
        if (helperPresent) {
          zone.className += ' helper-' + ((window.localStorage && localStorage.furiganaVisible == 'false') ? 'hidden' : 'present');
        }
        
        // generate the answers
        quiz += '<div id="answer-list">';
        while (keysA.length) {
          i = Math.floor(Math.random() * keysA.length);
          quiz += '<div class="quiz-item" data-answer="' + keysA[i].replace(/\|.*?$/, '') + '">' + o.quizlet[keysA[i]] + '</div>';
          keysA.splice(i, 1);
        }
        quiz += '</div>'; // close the answer list

        // add the quiz to the document
        zone.innerHTML = quiz + Genki.lang.review.replace('</div>', Genki.lang.toggle_furigana + '</div>');
      }


      // # 2. KANA DRAG AND DROP #
      else if (o.type == 'kana') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list" class="clear">',
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
            ++Genki.stats.problems;
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
        zone.innerHTML = quiz + '</div>' + answers + '</div>' + Genki.lang.review;
      }


      // # 3. VERB CONJUGATION #
      else if (o.type == 'verb') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list"><div class="quiz-column-title"></div>',
            dropList = '<div id="drop-list">',
            answers = [],
            keysQ = [],
            keysA,
            columns = -1, i, j;

        // generate a key list for the quizlet so we can randomly sort questions and answers
        for (i in o.quizlet) {
          keysQ.push(i);
        }
        keysA = keysQ.slice(0);

        // generate the column titles
        dropList += '<div class="quiz-title-row">';
        while (++columns < o.columns.length) {
          dropList += '<div class="quiz-column-title">' + o.columns[columns] + '</div>';
        }
        dropList += '</div>';


        // generate the questions
        while (keysQ.length) {
          columns = -1;
          i = Math.floor(Math.random() * keysQ.length);
          quiz += '<div class="quiz-item">' + keysQ[i] + '</div>';

          // create the answer row and contents
          dropList += '<div class="quiz-answer-row">';
          while (++columns < o.columns.length) {
            dropList += '<div class="quiz-answer-zone" data-text="' + keysQ[i] + '-' + columns + '" data-mistakes="0"></div>';
            ++Genki.stats.problems;
          }
          dropList += '</div>';

          keysQ.splice(i, 1);
        }
        quiz += '</div>' + dropList + '</div>'; // close the question list and add the drop list


        // generate the answers
        for (i = 0, j = keysA.length; i < j; i++) {
          columns = -1;

          while (++columns < o.columns.length) {
            answers.push('<div class="quiz-item" data-answer="' + keysA[i] + '-' + columns + '">' + o.quizlet[keysA[i]][columns] + '</div>');
          }
        }

        // randomize the answer list
        quiz += '<div id="answer-list">';
        while (answers.length) {
          i = Math.floor(Math.random() * answers.length);

          quiz += answers[i];

          answers.splice(i, 1);
        }
        quiz += '</div>'; // close the answer list

        // add the quiz to the document
        zone.innerHTML = quiz + Genki.lang.review;
      }


      // # 4. WRITING PRACTICE #
      else if (o.type == 'writing') {
        var quiz = '<div id="quiz-info">' + o.info + '<br>If you don\'t know how to type in Japanese on your computer, please visit our help page by <a href="../../../help/writing/' + Genki.local + '" target="_blank">clicking here</a>.</div><div id="question-list">',
            columns = o.columns,
            width = 'style="width:' + (100 / (columns + 1)) + '%;"',
            index = 0,
            i, j;

        for (i in o.quizlet) {
          // create a new row
          quiz += '<div class="quiz-answer-row"><div class="quiz-item" data-helper="' + o.quizlet[i] + '" ' + width + '>' + i + '</div>';
          j = 0;

          // insert the writing zones
          while (columns --> 0) {
            quiz += '<div class="writing-zone" ' + width + '><input class="writing-zone-input" type="text" ' + ((!o.quiz && j++ < 3) ? 'placeholder="' + i + '"' : '') + ' data-answer="' + (o.quiz ? o.quizlet[i] : i) + '" data-mistakes="0" tabindex="0" ' + (o.quiz ? '' : 'oninput="Genki.check.value(this);"') + ' onfocus="Genki.input.index = ' + index++ + '"></div>';
            ++Genki.stats.problems;
          }

          quiz += '</div>'; // close the row
          columns = o.columns; // reset column value for next iteration
        }

        // add the quiz to the document
        zone.innerHTML = quiz + '</div>' + '<div id="check-answers" class="center"><button class="button" onclick="Genki.check.answers();">Check Answers</button></div>';
        
        // add a class for non-practice writing exercises
        // this will remove helpers, forcing the student to recall what they learned
        if (o.quiz) {
          zone.className += ' no-helper';
        }
        
        // input field data
        Genki.input = {
          map : document.querySelectorAll('.writing-zone-input'),
          index : 0
        };
        
        // auto-focus the first input field
        Genki.input.map[0].autofocus = true;
      }


      // # 5. MULTIPLE CHOICE #
      else if (o.type == 'multi') {
        var quiz = '<div id="quiz-info">' + o.info + '</div><div id="question-list">',
            answers = '<div id="answer-list">',
            option = 65, // used for tagging answers as A(65), B(66), C(67)..
            isAnswer = false,
            q = o.quizlet,
            i = 0,
            j = q.length,
            n;

        // create individual blocks for each question and hide them until later
        for (; i < j; i++) {
          quiz += '<div id="quiz-q' + i + '" class="question-block" data-qid="' + (i + 1) + '" style="display:none;"><div class="quiz-multi-question">' + (typeof q[i].question != 'undefined' ? q[i].question.replace(/\{.*?\}/g, function (match) {
            var data = match.slice(1, match.length - 1).split('|');
          
            if (data[0] == '!IMG') {
              return Genki.parse.image(data);
            }
          }) : '<div class="text-passage' + (q[i].vertical ? ' vertical-text' : '') + '" ' + (q[i].text.replace(/<br>/g, '').length < 50 ? 'style="text-align:center;"' : '') + '>' + q[i].text + '</div>' + (q[i].helper || '')) + '</div>';

          // ready-only questions contain text only, no answers
          if (q[i].text) {
            quiz += '<div class="quiz-multi-row"><button class="quiz-multi-answer next-question" onclick="Genki.progressQuiz(this, true);">NEXT</button></div>';
            ++Genki.stats.exclude; // exclude this block from the overall score

          } else { // standard question block construction

            // add answers to the question block
            while (q[i].answers.length) {
              n = Math.floor(Math.random() * q[i].answers.length);

              // answers that begin with "A" are the correct answer. 'ATrue';
              // "!" is for answers that begin with "A", but aren't correct. '!Aomori Nebuta Festival'; lit. ! == NOT(correct)
              if (/^A|^\!/.test(q[i].answers[n])) {

                // marks the option as the correct answer if it begins with "A"
                if (q[i].answers[n].charAt(0) == 'A') {
                  isAnswer = true;
                }

                q[i].answers[n] = q[i].answers[n].slice(1);
              }

              quiz += '<div class="quiz-multi-row"><button class="quiz-multi-answer" data-answer="' + isAnswer + '" data-option="' + String.fromCharCode(option++) + '" onclick="Genki.progressQuiz(this);">' + q[i].answers[n] + '</button></div>';
              isAnswer = false;

              q[i].answers.splice(n, 1);
            }

          }

          quiz += '</div>'; // ends the question block
          option = 65; // resets the option id so the next answers begin with A, B, C..
          ++Genki.stats.problems; // increment problems number
        }

        // add the multi-choice quiz to the quiz zone
        zone.innerHTML = quiz + '</div><div id="quiz-progress"><div id="quiz-progress-bar"></div></div>';

        // begin the quiz
        Genki.progressQuiz('init');
      }
      
      
      // # 6. FILL IN THE BLANKS #
      else if (o.type == 'fill') {
        
        // add the quiz to the document
        zone.innerHTML = '<div id="quiz-info">' + o.info + '<br>If you don\'t know how to type in Japanese on your computer, please visit our help page by <a href="../../../help/writing/' + Genki.local + '" target="_blank">clicking here</a>.</div><div class="text-block">' + o.quizlet.replace(/\{.*?\}/g, function (match) {
          var data = match.slice(1, match.length - 1).split('|'), hint, flag;
          
          if (data[0] == '!IMG') {
            return Genki.parse.image(data);
            
          } else {
            // Split the answer from the hint.
            // Syntax is {ANSWER|HINT|HIDE_HINT} HINT and HIDE_HINT is optional.
            // passing "answer" to HIDE_HINT will hide HINT and make it a secondary answer.
            // passing "furigana" to HIDE_HINT will hide HINT and make it furigana only to aid with reading.
            // passing "width:N" to HIDE_HINT will set the width of the field to N, manually. The hint will remain visible.
            hint = data[1] ? data[1] : '',
            flag = data[2] ? data[2] : '';

            ++Genki.stats.problems; // increment problems number

            // parse and return the input field
            return '<span class="writing-zone">'+
              '<input '+
                'class="writing-zone-input" '+
                'type="text" '+
                'data-answer="' + data[0] + '" '+
                (flag == 'answer' ? 'data-answer2="' + hint + '" ' : '')+
                (flag == 'furigana' ? 'data-furigana="' + hint + '" ' : '')+
                'data-mistakes="0" '+
                'tabindex="0" '+
                'style="width:' + (/width/.test(flag) ? flag.split(':')[1] : (((hint || data[0]).length * (14 / (/[a-z]/i.test(hint || data[0]) ? 2 : 1))) + 14))+ 'px;"'+
              '>'+
              ((hint && !/answer|furigana/.test(flag)) ? '<span class="problem-hint">' + hint + '</span>' : '')+
            '</span>';
          }
          
        }) + '</div>' + '<div id="check-answers" class="center"><button class="button" onclick="Genki.check.answers(false, \'fill\');">Check Answers</button></div>';
        
        // auto-focus the first input field
        document.querySelector('.writing-zone-input').autofocus = true;
      }


      // # DRAG AND DROP FUNCTIONALITY #
      if (o.type == 'drag' || o.type == 'kana' || o.type == 'verb') {
        // setup drag and drop
        var drake = dragula([document.querySelector('#answer-list')], {
          isContainer : function (el) {
            return el.classList.contains('quiz-answer-zone');
          }
        });

        // check if the answer is correct before dropping the element
        drake.on('drop', function (el, target, source) {
          if (target.dataset.text) { // makes sure the element is a drop zone (data-text == data-answer)

            // if the answer is wrong we'll send the item back to the answer list
            if (el.dataset.answer != target.dataset.text) {
              document.getElementById('answer-list').appendChild(el);

              // global mistakes are incremented along with mistakes specific to problems
              target.dataset.mistakes = ++target.dataset.mistakes;
              ++Genki.stats.mistakes;

            } else {
              target.className += ' answer-correct';

              // when all problems have been solved..
              // stop the timer, show the score, and congratulate the student
              if (++Genki.stats.solved == Genki.stats.problems) {
                Genki.endQuiz();
              }
            }
          }
        });

        Genki.drake = drake;
      }


      // exercise timer
      var timer = new Timer(),
          clock = document.getElementById('quiz-timer');

      clock.innerHTML = '00:00:00'; // placeholder
      timer.start();
      timer.addEventListener('secondsUpdated', function (e) {
        clock.innerHTML = timer.getTimeValues().toString()
      });

      Genki.timer = timer;

      // indicate the exercise has been loaded in
      document.getElementById('exercise').className += ' content-loaded ' + o.type + '-quiz';

      // jump to the exercise title
      Genki.scrollTo('#exercise-title', true);
    },


    // increment the progress bar (for multi-choice quizzes)
    incrementProgressBar : function () {
      var bar = document.getElementById('quiz-progress-bar'),
          progress = Math.floor((Genki.stats.solved+1) / Genki.stats.problems * 100);

      bar.style.width = progress + '%';
      bar.innerHTML = '<span id="quiz-progress-text">' + (Genki.stats.solved+1) + '/' + Genki.stats.problems + '</span>';
    },


    // show the next question in a multi-choice quiz
    progressQuiz : function (answer, exclude) {
      if (answer == 'init') {
        document.getElementById('quiz-q' + Genki.stats.solved).style.display = '';
        Genki.incrementProgressBar();

      } else {
        // mark the selected answer for reviews
        answer.className += ' selected-answer';

        // hide NEXT button for read-only questions
        if (exclude) {
          answer.parentNode.className += ' hidden-answer';
        }

        // increment mistakes if the chosen answer was wrong and add a class to the parent
        if (answer.dataset.answer == 'false') {
          answer.parentNode.parentNode.className += ' wrong-answer';
          ++Genki.stats.mistakes;
        }

        // if there's another question, show it and hide the last one
        var last = document.getElementById('quiz-q' + Genki.stats.solved++),
            next = document.getElementById('quiz-q' + Genki.stats.solved);

        if (next) {
          next.style.display = ''; // show the next question
          last.style.display = 'none'; // hide the prior question
          Genki.incrementProgressBar();

        } else { // end the quiz if there's no new question
          Genki.endQuiz('multi');

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
    endQuiz : function (type) {
      // calculate the total score based on problems solved and mistakes made
      var solved = Genki.stats.solved - Genki.stats.exclude,
          problems = Genki.stats.problems - Genki.stats.exclude;

      Genki.stats.score = Math.floor((solved - Genki.stats.mistakes) * 100 / problems);
      Genki.timer.stop();

      // hide the timer and store it so we can show the completion time in the results
      var timer = document.getElementById('quiz-timer');
      timer.style.display = 'none';

      // show the student their results
      document.getElementById('quiz-result').innerHTML = 
      '<div id="complete-banner" class="center">Quiz Complete!</div>'+
      '<div id="result-list">'+
        '<div class="result-row"><span class="result-label">Problems Solved:</span>' + problems + '</div>'+
        '<div class="result-row"><span class="result-label">Answers Wrong:</span>' + Genki.stats.mistakes + '</div>'+
        '<div class="result-row"><span class="result-label">Score:</span>' + Genki.stats.score + '%</div>'+
        '<div class="result-row"><span class="result-label">Completion Time:</span>' + timer.innerHTML + '</div>'+
        '<div class="result-row center">'+
          ( // depending on the score, a specific message will show
            Genki.stats.score == 100 ? 'PERFECT! Great Job, you have mastered this quiz! Feel free to move on or challenge yourself by trying to beat your completion time.' :
            Genki.stats.score > 70 ? 'Nice work! ' + Genki.lang[type ? type + '_mistakes' : 'mistakes'] :
            'Keep studying! ' + Genki.lang[type ? type + '_mistakes' : 'mistakes']
          )+
          '<div class="center">'+
            '<a href="./' + Genki.local + '" class="button">Try Again</a>'+
            '<a href="' + document.getElementById('home-link').href + '" class="button">Back to Index</a>'+
          '</div>'+
        '</div>'+
      '</div>';

      // this class will indicate the quiz is over so post-test styles can be applied
      document.getElementById('exercise').className += ' quiz-over';
      Genki.scrollTo('#complete-banner', true); // jump to the quiz results
    },
    

    // places draggable items into their correct places
    // allows the student to review meanings without having to consult their textbook
    review : function () {
      // ask for confirmation, just in case the button was clicked by accident
      if (confirm('Are you sure you want to review? Your current progress will be lost.')) {
        var a = document.querySelectorAll('[data-answer]'),
            i = 0,
            j = a.length;

        for (; i < j; i++) {
          document.querySelector('[data-text="' + a[i].dataset.answer + '"]').appendChild(a[i]);
        }

        // stop and hide timer + drag/drop
        Genki.timer.stop();
        Genki.drake.destroy();
        document.getElementById('quiz-timer').style.display = 'none';

        // show restart button
        document.getElementById('review-exercise').innerHTML = '<a href="./' + Genki.local + '" class="button">Restart</a>' + (document.querySelector('.drag-quiz') ? Genki.lang.toggle_furigana : '');

        // change the quiz info
        document.getElementById('quiz-info').innerHTML = 'You are currently in review mode; go ahead and take your time to study. When you are ready to practice this exercise, click the "restart" button.';
      }
    },
    
    
    // functions that check the value of input fields
    check : {
      
      // checks the value of the current input and automatically moves onto the next input if the value is correct
      // speeds things up, so the student doesn't need to click or tab into the next input field
      busy : false, // prevents IMEs from triggering multiple input events when a value is correct
      value : function (input) {
        if (!Genki.check.busy && input.value == input.dataset.answer) {
          var next = Genki.input.map[Genki.input.index + 1];
          
          // focuses the next input if available, otherwise it asks if the student wants to check their answers
          if (next) {
            Genki.check.busy = true;
          
            next.focus();
              
            setTimeout(function () {
              Genki.check.busy = false;
            }, 100);
            
          } else {
            input.blur();
            Genki.check.answers(true);
          }
        }
      },
      
      
      // check the answers for writing exercises
      // mapEnded means the end of Genki.input.map was reached via Genki.check.value()
      answers : function (mapEnded, type) {
        // ask for confirmation, just in case the button was clicked by accident
        if (!Genki.exerciseComplete && confirm(mapEnded ? 'The last input field has been filled in. Are you ready to check your answers?' : 'Checking your answers will end the quiz. Do you want to continue?')) {
          Genki.exerciseComplete = true;

          // hide check answers button
          document.getElementById('check-answers').style.display = 'none';

          // loop over the inputs and check to see if the answers are correct
          var input = document.querySelectorAll('#exercise .writing-zone-input'),
              i = 0, j = input.length, val, answer, data;

          for (; i < j; i++) {
            data = input[i].dataset;
            val = input[i].value.toLowerCase();
            answer = data.answer.toLowerCase();

            // increment mistakes if the answer is incorrect
            if (
              (!data.answer2 && val != answer)
              || 
              (data.answer2 && val != answer && val != data.answer2.toLowerCase())
            ) {
              data.mistakes = ++data.mistakes;
              ++Genki.stats.mistakes;
              
              if (type == 'fill') {
                input[i].parentNode.insertAdjacentHTML('beforeend', '<span class="problem-answer">' + data.answer + (data.answer2 || data.furigana ? '<span class="secondary-answer' + (data.furigana ? ' furigana-only' : '') + '">' + (data.answer2 || data.furigana) + '</span>' : '') + '</span>');
              }
            }

            // add classname to correct answers
            else {
              input[i].parentNode.className += ' answer-correct';  
            }

            // increment problems solved
            ++Genki.stats.solved;
            
            // disable the input
            input[i].disabled = true;
          }

          Genki.endQuiz(type ? type : 'writing'); // show quiz results
        }
      }
    },

    
    // functions that toggle the display of elements
    toggle : {
      
      // toggle the exercise list
      exerciseList : function (button) {
        button.className = button.className == 'list-open' ? '' : 'list-open';
      },
      
      
      // toggles the display of lists
      list : function (el) {
        var closed = 'lesson-title',
            opened = closed + ' lesson-open';

        el.className = el.className == opened ? closed : opened;

        // close any open lists
        for (var a = el.parentNode.querySelectorAll('.lesson-title'), i = 0, j = a.length; i < j; i++) {
          if (a[i] != el) {
            a[i].className = closed;
          }
        }
      },
      
      
      // toggles furigana in drag and drop quizzes
      furigana : function (button) {
        var state = (window.localStorage && localStorage.furiganaVisible) || 'true',
            zone = document.getElementById('quiz-zone');
        
        // hide or show the textual aids
        switch (state) {
          case 'true' :
            state = 'false';
            zone.className = zone.className.replace('helper-present', 'helper-hidden');
            button.innerHTML = button.innerHTML.replace('Hide', 'Show');
            break;
            
          case 'false' :
            state = 'true';
            zone.className = zone.className.replace('helper-hidden', 'helper-present');
            button.innerHTML = button.innerHTML.replace('Show', 'Hide');
            break;
            
          default :
            break;
        }
        
        // update button html
        Genki.lang.toggle_furigana = button.outerHTML;
        
        // save settings if supported
        if (window.localStorage) {
          localStorage.furiganaVisible = state;
        }
      }
    },

    
    // functions that create new functionality and adds it to the document
    // usually functions that are executed via init
    create : {
      
      // creates prev/next exercise buttons
      exerciseButtons : function () {
        var more = '<div id="more-exercises" class="clear">',
            i = 2,
            a;

        while (i --> 0) {
          a = Genki.exercises[i == 1 ? Genki.active.index - 1 : Genki.active.index + 1]; // the prev/next exercise; i=1 is prev, i=0 is next

          // if there's a prev/next exercise we'll add the link to more
          if (a) {
            a = a.split('|');

            // create the next/prev link
            more += '<a href="../../../lessons/' + a[0] + '/' + Genki.local + '" class="button ' + (i == 1 ? 'prev' : 'next') + '-ex" title="' + (i == 1 ? 'Previous' : 'Next') + ' exercise">' + a[1] + '</a>';
          }
        }

        // add the "more exercises" buttons to the document
        document.getElementById('quiz-timer').insertAdjacentHTML('afterend', more + '</div>');
      },


      // creates the exercise list
      exerciseList : function () {
        var attrs = 'class="lesson-title" onclick="Genki.toggle.list(this);" onkeydown="event.key == \'Enter\' && Genki.toggle.list(this);" tabindex="0"', // lesson-title attrs
            list = '<nav id="exercise-list"><h3 class="main-title">Exercise List</h3><div id="lessons-list"><h4 ' + attrs + '>Pre-Lesson</h4><ul id="lesson-0">',
            lesson = 'lesson-0',
            i = 0,
            j = Genki.exercises.length,
            linkData,
            active,
            
            // vars for grouping sub-sections
            currentGroup,
            group = '',
            groups = /workbook-\d+|literacy-\d+|literacy-wb-\d+/,
            groupTitles = {
              workbook : 'Workbook',
              literacy : 'Reading and Writing',
              'literacy-wb' : 'Workbook: Reading and Writing'
            };

        // loop over all the exercises and place them into their respectice lesson group
        for (; i < j; i++) {
          linkData = Genki.exercises[i].split('|');
          currentGroup = linkData[0].replace(/^lesson-\d+\/|-\d+$/g, '');

          // if the lesson group is different create a new group
          if (!new RegExp(lesson).test(linkData[0])) {
            lesson = /^study-tools/.test(linkData[0]) ? 'study-tools' : linkData[0].replace(/(lesson-\d+)\/.*/, '$1');
            list += '</ul><h4 ' + attrs + '>' + lesson.charAt(0).toUpperCase() + lesson.replace(/-/, ' ').slice(1) + '</h4><ul id="' + lesson + '">';
            group = '';
          }

          // add a header to separate the workbook from the textbook exercises and grammar from reading and writing
          if (groups.test(linkData[0]) && group != currentGroup) {
            group = currentGroup;
            list += '<li><h4 class="sub-lesson-title">' + groupTitles[group] + '</h4></li>';
          }
          
          // add the exercise link to the group
          list += '<li><a href="../../../lessons/' + linkData[0] + '/' + Genki.local + '" ' + (linkData[2] ? 'data-page="Genki ' + (+linkData[0].replace(/lesson-(\d+).*/, '$1') < 13 ? 'I' : 'II') + (/workbook-|wb-/.test(linkData[0]) ? ' Workbook' : '') + ': ' + linkData[2] + '"' : '') + ' title="' + linkData[1] + '">' + linkData[1] + '</a></li>';
          
        }

        // add the exercise list to the document
        document.getElementById('content').insertAdjacentHTML('afterbegin', '<a href="#toggle-exercises" id="toggle-exercises" onclick="Genki.toggle.exerciseList(this); return false;" title="Toggle exercise list"></a>' + list + '</ul></div></nav>');

        // open the current lesson and scroll to the active exercise
        if (Genki.active.exercise) {
          // open the active lesson
          Genki.toggle.list(document.getElementById(/^study-tools/.test(Genki.active.exercise[0]) ? 'study-tools' : Genki.active.exercise[0].replace(/(lesson-\d+)\/.*/, '$1')).previousSibling);

          // highlight the active exercise and scoll to it
          active = document.querySelector('a[href*="' + Genki.active.exercise[0] + '"]');
          active.className += ' active-lesson';

          // jump to the active exercise
          document.getElementById('lessons-list').scrollTop = active.offsetTop - (active.getBoundingClientRect().height + (window.matchMedia && matchMedia('(pointer:coarse)').matches ? 0 : 6));
        }
      }
    },
    
    
    // parsing functions
    parse : {
      
      // parse images
      image : function (data) {
        // data[n] (n = 0, 1, 2..)
        // 0 = flag (ex. !IMG)
        // 1 = file name
        // 2 = alt text (optional)
        var url = /^http/.test(data[1]) ? data[1] : '../../../resources/images/lesson-images/' + data[1];

        return '<a href="' + url + '" target="blank" title="View full image" class="lesson-image"><img src="' + url + '" alt="' + (data[2] || data[1]) + '" /></a>';
      }
      
    },

    // initial setup for exercise functionality
    init : function () {
      // finds the currently active exercise in the exercise list and sets up essential data for following statements
      var i = 0,
          j = Genki.exercises.length,
          result = document.getElementById('quiz-result'),
          lesson;

      for (; i < j; i++) {
        if (Genki.active.path == Genki.exercises[i].split('|')[0]) {
          Genki.active.exercise = Genki.exercises[i] ? Genki.exercises[i].split('|') : null;
          Genki.active.index = i;
          break;
        }
      }

      // add exercise title to the document
      if (Genki.active.exercise) {
        lesson = /^study-tools/.test(Genki.active.exercise[0]) ? 'study-tools' : +Genki.active.exercise[0].replace(/lesson-(\d+).*/, '$1'); // current lesson
        
        result.insertAdjacentHTML('beforebegin', '<h2 id="exercise-title" class="center" ' + (Genki.active.exercise[2] ? 'data-page="Genki ' + (lesson < 13 ? 'I' : 'II') + (/workbook-|wb-/.test(Genki.active.exercise[0]) ? ' Workbook' : '') + ': ' + Genki.active.exercise[2] + '"' : '') + '>' + (lesson == 'study-tools' ? 'ツール' : '第' + lesson + '課') + ' - ' + Genki.active.exercise[1] + '</h2>');
        
      } else {
        result.insertAdjacentHTML('beforebegin', '<h2 id="exercise-title" class="center">' + document.querySelector('TITLE').innerText.replace(/\s\|.*/, '') + '</h2>');
      }
      

      // setup navigational objects
      Genki.create.exerciseButtons();
      Genki.create.exerciseList();
      
      // define Genki in the global namespace
      window.Genki = this;
    }
    
  };

  // initial setup
  Genki.init();
}(window, document));