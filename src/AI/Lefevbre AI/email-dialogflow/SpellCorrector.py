from spellchecker import SpellChecker

def getSpellCorrectedWord(word):
    spell = SpellChecker()

    return spell.correction(word)

def getSpellCorrectedPhrase(phrase):
    wordList= phrase.split()
    spellCorrectedPhrase = ""
    for word in wordList:
        spellCorrectedPhrase = spellCorrectedPhrase + " " + getSpellCorrectedWord(word)

    return spellCorrectedPhrase[1:]


