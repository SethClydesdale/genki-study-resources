@echo off
title Anki Decks Maker for Genki Study Resources
color 1F

set /p id="Type 2nd or 3rd, then press ENTER to generate Anki decks for that edition. "

if %id% == 2nd (python anki_decks_maker.py ../../lessons) else if %id% == 3rd (python anki_decks_maker.py ../../lessons-3rd) else (echo No edition selected, please press any key to terminate the program.)

pause
