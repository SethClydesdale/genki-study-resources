import re
import ast
import sys
from pathlib import Path

import genanki

lessons_folder = Path(sys.argv[1])
title_regex = re.compile(r'<title>(.*):(.*)- Lesson')
quizlet_regex = re.compile(r'quizlet : (.*?})', flags=re.S)
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
    output_folder.mkdir(parents=True, exist_ok=False)

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
                'qfmt': '{{Question}}',
                'afmt': '{{FrontSide}}<hr id="answer">{{Answer}}',
            },
        ],
        css="""
            .card {
             font-size: 48px;
             text-align: center;
            }""")

    combined_deck = genanki.Deck(
        1810167044,  # Random hardcoded id
        f'Genki')
    combined_deck.add_model(my_model)

    decks = [combined_deck]
    for lesson_folder in lessons_folder.glob('lesson*'):
        lesson_number = lesson_folder.name.split('-')[-1]

        my_deck = genanki.Deck(
            1810167044 + int(lesson_number),  # Random hardcoded id
            f'Genki lesson {lesson_number}')
        my_deck.add_model(my_model)
        decks.append(my_deck)

        for vocab_folder in lesson_folder.glob('vocab*'):
            with open(vocab_folder.joinpath('index.html')) as f:
                html = f.read()
                tags = get_tags(html)
                try:
                    vocab = get_vocab(html)
                except Exception:
                    print(f'Failed parsing of lesson-{lesson_number}, vocab file {vocab_folder}')
                for jp, eng in vocab.items():
                    note = genanki.Note(model=my_model,
                                        fields=[jp, eng],
                                        tags=['Genki', f'lesson-{lesson_number}', *tags])
                    my_deck.add_note(note)
                    combined_deck.add_note(note)

    for deck in decks:
        if deck.notes:
            genanki.Package(deck).write_to_file(output_folder.joinpath(f'{deck.name.replace(" ", "_")}.apkg'))


if __name__ == '__main__':
    main()