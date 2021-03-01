import re
import ast
import sys
from pathlib import Path
from itertools import chain

import genanki

lessons_folder = Path(sys.argv[1])
title_regex = re.compile(r'<title>(.*):(.*)- Lesson')
quizlet_regex = re.compile(r'quizlet : (.*?})', flags=re.S)
filter_regex = re.compile(r"format : 'kanji'|format : 'practice'|format : 'hirakata'|type : 'fill'|type : 'drawing'|type : 'stroke'|type : 'multi'|type : 'writing'|<title>Review:|Kanji Practice: Match the Readings|Kanji Practice: Match the Sentences|Kanji Practice: Match the Verbs|Katakana Practice: Countries and Capitals", flags=re.S)
output_folder = Path('.').absolute().joinpath('decks').joinpath(lessons_folder.name)


def get_tags(html):
    """
    <title>Useful Expressions: Time (Minutes 11-30) - Lesson 1 | Genki ...</title>
    Useful_Expressions , Time_(Minutes_11-30)
    """
    match = title_regex.search(html)
    return match.group(1).strip().replace(' ', '_'), match.group(2).strip().replace(' ', '_')


def get_vocab(html):
    return ast.literal_eval(quizlet_regex.search(html).group(1).replace(r'//', '#'))


def main():
    try :
        print('Creating folder for decks...')
        output_folder.mkdir(parents=True, exist_ok=False)
    except Exception:
        print('Folder already exists, skipping this step.')

    my_model = genanki.Model(
        1607392319,
        'Simple Model',
        fields=[
            {'name': 'Question'},
            {'name': 'Answer'},
        ],
        templates=[
            {
                'name': 'Card',
                'qfmt': '<span class="question-side">{{Question}}</span>',
                'afmt': '<span class="question-side">{{FrontSide}}</span><hr id="answer">{{Answer}}',
            },
        ],
        css="""
.question-side { font-size:48px; }

hr {
  border:none;
  border-bottom:1px solid #999;
}

ruby rt {
  color:#DDD;
  background:#DDD;
  border:1px solid #CCC;
  border-radius:10px;
}
ruby:hover rt {
  color:#333;
  background:none;
  border-color:transparent;
}

.card {
  color:#333;
  background-color:#EEE;
  font-size:25px;
  font-family:'メイリオ', 'Meiryo', 'Osaka', 'ＭＳ Ｐゴシック', 'MS PGothic', "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", Arial, sans-serif;
  text-align:center;
}

/* Night Mode CSS */
.nightMode hr { border-color:#555; }
.nightMode ruby rt {
  color:#333;
  background:#333;
  border-color:#444;
}
.nightMode ruby:hover rt {
  color:#CCC;
  background:none;
  border-color:transparent;
}
.nightMode.card {
  color:#CCC;
  background-color:#222;
}""")

    combined_deck = genanki.Deck(
        1810167044,  # Random hardcoded id
        f'Genki')
    combined_deck.add_model(my_model)

    decks = [combined_deck]
    for lesson_folder in lessons_folder.glob('lesson*'):
        lesson_number = lesson_folder.name.split('-')[-1]
        
        print(f'Getting vocab for Lesson {lesson_number}...')
        
        my_deck = genanki.Deck(
            1810167044 + int(lesson_number),  # Random hardcoded id
            f'Genki lesson {lesson_number}')
        my_deck.add_model(my_model)
        decks.append(my_deck)
        
        for vocab_folder in chain(lesson_folder.glob('vocab*'), lesson_folder.glob('literacy*')):
            with open(vocab_folder.joinpath('index.html'), 'r', encoding='UTF8') as f:
                html = f.read()
                if filter_regex.search(html) == None: # Filter out exercise types that are NOT vocab
                    tags = get_tags(html)
                    try:
                        vocab = get_vocab(html)
                    except Exception:
                        print(f'Failed parsing of lesson-{lesson_number}, vocab file {vocab_folder}')
                        continue
                    for jp, eng in vocab.items():
                        note = genanki.Note(model=my_model,
                                            fields=[re.sub(r'(.*?)\|(.*?)$', r'<ruby>\1<rt>\2</rt></ruby>', jp), eng],
                                            tags=['Genki', f'lesson-{lesson_number}', *tags])
                        my_deck.add_note(note)
                        combined_deck.add_note(note)

    for deck in decks:
        if deck.notes:
            print(f'Creating deck for {deck.name}...');
            genanki.Package(deck).write_to_file(output_folder.joinpath(f'{deck.name.replace(" ", "_")}.apkg'))
            
    print('All Anki decks for the selected edition have been generated!')


if __name__ == '__main__':
    main()