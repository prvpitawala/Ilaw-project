from PyInstaller.utils.hooks import collect_all

datas, binaries, hiddenimports = collect_all('chromadb')

# Add any missing imports
hiddenimports += [
    'chromadb.api',
    'chromadb.config',
    'sentence_transformers'
]
