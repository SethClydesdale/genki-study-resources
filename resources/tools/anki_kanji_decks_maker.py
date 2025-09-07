import re
import ast
import sys
from pathlib import Path
from itertools import chain

import genanki

lessons_folder = Path(sys.argv[1])
title_regex = re.compile(r'<title>(.*):(.*)- Lesson')
quizlet_regex = re.compile(r'quizlet : (.*?})', flags=re.S)
filter_regex = re.compile(r"Kanji Practice: Readings|Kanji Practice: Meanings")
output_folder = Path('.').absolute().joinpath('kanji').joinpath(lessons_folder.name)


def lesson_sort_key(path_name):
    """
    Generates sort key for lesson folders to approximate the order in which a
    student would encounter the lessons in the Genki books.
    """
    match_groups = re.match(r'^.*-(\d\d*)$', path_name).groups()
    return int(match_groups[0])


def vocab_type_sort_key(path_name):
    """
    Generates sort key for vocab folders to approximate the order in which a
    student would encounter the sections in the Genki books.
    """
    match_groups = re.match(r'^(.*)-(\d\d*)$', path_name).groups()
    vocab_type = match_groups[0]
    lesson_number = int(match_groups[1])
    if vocab_type == "literacy":
        return (lesson_number, 1)
    else:
        return (lesson_number, 2)


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
            {'name': 'Kanji'},
            {'name': 'On-Yomi'},
            {'name': 'Kun-Yomi'},
            {'name': 'Meanings'},
        ],
        templates=[
            {
                'name': 'Kanji',
                'qfmt': '<span class="kanji">{{Kanji}}</span>',
                'afmt': '{{FrontSide}}<br><span class="meaning">{{Meanings}}</span><br><span class="header">On-Yomi</span>{{#On-Yomi}}<br><span class="reading">{{On-Yomi}}</span>{{/On-Yomi}}{{#Kun-Yomi}}<br><span class="header">Kun-Yomi</span><br><span class="reading">{{Kun-Yomi}}</span>{{/Kun-Yomi}}',
            },
        ],
        css="""
.kanji { font-size:102px; }

.header {
  color:#666;
  font-size:9px;
}

.reading { font-size:36px; }

.meaning {
  padding:75px;
  font-size:36px;
}

hr {
  border:none;
  border-bottom:1px solid #999;
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
.nightMode.card {
  color:#CCC;
  background-color:#222;
}""")

    combined_deck = genanki.Deck(
        1810167044,  # Random hardcoded id
        f'Genki All Kanji')
    combined_deck.add_model(my_model)

    decks = [combined_deck]
    for lesson_folder in sorted(lessons_folder.glob('lesson*'),
                                key=lambda path: lesson_sort_key(path.name)):
        lesson_number = lesson_folder.name.split('-')[-1]
        my_deck = genanki.Deck(
            1810167044 + int(lesson_number),  # Random hardcoded id
            f'Genki Kanji {str(lesson_number).zfill(2)}')
        my_deck.add_model(my_model)
        decks.append(my_deck)
        lesson_dict = {}
        for vocab_folder in sorted(chain(lesson_folder.glob('literacy*')),
                                   key=lambda path: vocab_type_sort_key(path.name)):
            with open(vocab_folder.joinpath('index.html'), 'r', encoding='UTF8') as f:
                html = f.read()
            for pathpart in ["literacy-1\\", "literacy-2\\"]: # \\ may need to be changed to / to properly execute, depending on your OS
                if pathpart in str(vocab_folder.joinpath('index.html')):
                    if filter_regex.search(html): # Filter out exercise types that are NOT vocab
                        try:
                            vocab = get_vocab(html)
                        except Exception:
                            print(f'Failed parsing of lesson-{lesson_number}, vocab file {vocab_folder}')
                            continue
                        for jp, eng in vocab.items():
                            if jp in lesson_dict:
                                lesson_dict[jp] += ", {}".format(eng)
                            else:
                                lesson_dict[jp] = eng
                else:
                    continue
        for k,v in lesson_dict.items():
            readings = re.sub(r'^(.*), (.*)$', r'\1', v)
            meaning = re.sub(r'^(.*), (.*)$', r'\2', v)
            if '|' in readings:
                onyomi = re.sub(r'^(.*)\|(.*)$', r'\1', readings)
                kunyomi = re.sub(r'^(.*)\|(.*)$', r'\2', readings)
            else:
                onyomi = readings
                kunyomi = ''

            note = genanki.Note(model=my_model,
                                    fields=[k, onyomi, kunyomi, meaning],
                                    tags=['Genki', f'lesson-{lesson_number}', "Kanji"])
            my_deck.add_note(note)
            combined_deck.add_note(note)
    for deck in decks:
        if deck.notes:
            print(f'Creating deck for {deck.name}...');
            genanki.Package(deck).write_to_file(output_folder.joinpath(f'{deck.name.replace(" ", "_")}.apkg'))
            
    print('All Anki decks for the selected edition have been generated!')

if __name__ == '__main__':
    main()