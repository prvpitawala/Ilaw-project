# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['backend/app.py'],  # Updated path to app.py
    pathex=[],
    binaries=[],
    datas=[
        ('backend/utill.py', '.'),  # Updated path to utill.py
    ],
    hiddenimports=[
        'flask',
        'flask_cors',
        'google.generativeai',
        'sentence_transformers',
        'chromadb',
        'openai',
        'dotenv',
        'requests',
        'tqdm'
    ],
    hookspath=['backend'],  # Updated path to the hookspath
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts, 
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Ilaw_System',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)