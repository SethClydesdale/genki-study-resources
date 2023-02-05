@echo off
title Anki Kanji Decks Maker for Genki Study Resources
color 1F

set /p id="Please press ENTER to generate Kanji Decks for Genki."

python anki_kanji_decks_maker.py ../../lessons-3rd

pause
