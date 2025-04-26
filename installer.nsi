!define APP_NAME "Ilaw System"
!define APP_VERSION "1.0.0"
!define PUBLISHER "Lumeo Labs"
!define AUTHOR_NAME "Raveen Pitawla"
!define AUTHOR_EMAIL "raveenpitawala2244@gmail.com"
!define STARTUP_PATH "$APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
!define APPDATA_FOLDER "$APPDATA\${APP_NAME}"  # Define the AppData folder path

# Include necessary NSIS functions
!include "MUI2.nsh"
!include "FileFunc.nsh"  # Added for the GetSize function
!include "LogicLib.nsh"  # Added for ${If} ${EndIf} statements

RequestExecutionLevel admin  ; Ensures installer runs as administrator

Name "${APP_NAME}"
OutFile "${APP_NAME}-Setup-${APP_VERSION}.exe"
InstallDir "$PROGRAMFILES\${APP_NAME}"

# Modern interface settings
!define MUI_ICON "build\icon.ico"
!define MUI_UNICON "build\icon.ico"

# Define UI pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

# Set languages
!insertmacro MUI_LANGUAGE "English"

Section "Install"
    # Check if application is already installed
    IfFileExists "$INSTDIR\uninstall.exe" 0 check_program_files_x86
        MessageBox MB_YESNO|MB_ICONQUESTION "${APP_NAME} is already installed. Would you like to uninstall it before continuing?" IDNO check_program_files_x86
        
        # Run the uninstaller
        ExecWait '"$INSTDIR\uninstall.exe" /S _?=$INSTDIR'
        
        # Wait for uninstaller to finish
        Sleep 2000
        
    check_program_files_x86:
    # Check if previous installation exists in Program Files (x86) and remove it
    IfFileExists "$PROGRAMFILES32\${APP_NAME}\*.*" 0 check_appdata
        MessageBox MB_YESNO|MB_ICONQUESTION "A previous installation of ${APP_NAME} was found in Program Files (x86). Would you like to remove it before continuing?" IDNO check_appdata
        RMDir /r "$PROGRAMFILES32\${APP_NAME}"
        
    check_appdata:
    # Check if previous installation exists in AppData and remove it
    IfFileExists "${APPDATA_FOLDER}\*.*" 0 continue_installation
        MessageBox MB_YESNO|MB_ICONQUESTION "Previous application data for ${APP_NAME} was found. Would you like to remove it before continuing?" IDNO continue_installation
        RMDir /r "${APPDATA_FOLDER}"
    
    continue_installation:
    SetOutPath "$INSTDIR"
    
    # Extract core files
    ; File /r "src\*.*"
    
    # Copy the Electron app files - use only one of these options:
    # Option 1: If your app is in the win-unpacked folder
    File /r "dist\win-unpacked\*.*"
    
    # Option 2: Or if your main app files are directly in dist
    # File /r "dist\*.*"
    
    # Copy additional files
    File "dist\Ilaw_System.exe"
    ; File "package.json"
    ; File "LICENSE.txt"
    File "build\icon.ico"  # Copy the icon file to the installation directory
    
    # Create shortcuts - make sure the .exe path is correct for your app
    CreateDirectory "$SMPROGRAMS\${APP_NAME}"
    
    # Adjust the executable path to match your actual Electron app executable
    # It might be something like Rag Doc System.exe or RagDocSystem.exe in the install dir
    CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\Ilaw System.exe" "" "$INSTDIR\icon.ico" 0
    CreateShortcut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
    CreateShortcut "$DESKTOP\Ilaw App.lnk" "$INSTDIR\Ilaw App.exe" "" "$INSTDIR\icon.ico" 0
    
    # Create Startup Batch File
    FileOpen $0 "$INSTDIR\startup.bat" "w"
    FileWrite $0 "@echo off$\r$\n"
    FileWrite $0 "cd $INSTDIR$\r$\n"
    FileWrite $0 'powershell -WindowStyle Hidden -Command "Start-Process \"$INSTDIR\Ilaw_System.exe\" -WindowStyle Hidden"$\r$\n'
    FileWrite $0 "exit$\r$\n"
    FileClose $0

    # Move Batch File to Startup Folder
    CopyFiles "$INSTDIR\startup.bat" "${STARTUP_PATH}\IlawStartup.bat"
    
    # Create uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    # Register application in Add/Remove Programs
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayName" "${APP_NAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayIcon" "$INSTDIR\icon.ico"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "Publisher" "${PUBLISHER}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayVersion" "${APP_VERSION}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "URLInfoAbout" "https://github.com/prvpitawala/Ilaw-project"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "HelpLink" "mailto:${AUTHOR_EMAIL}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "NoRepair" 1
    
    # Optional: Estimate size
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "0x%08X" $0
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "EstimatedSize" "$0"
    
    # Restart option
    MessageBox MB_YESNO "Installation complete.$\r$\nDo you want to restart now?$\r$\n(This app only works after restarting the computer)" IDNO NoRestart
    Reboot
NoRestart:

SectionEnd

Section "Uninstall"
    # Use ExecWait to kill processes
    MessageBox MB_ICONINFORMATION|MB_OK "Closing any running application processes..."
    
    # Kill app.exe and Ilaw System.exe processes using taskkill
    ExecWait 'taskkill /f /im "Ilaw_System.exe" /t' $0
    ExecWait 'taskkill /f /im "Ilaw App.exe" /t' $0
    
    # Wait a moment to ensure processes are terminated
    Sleep 1000
    
    # Remove startup batch file
    Delete "${STARTUP_PATH}\IlawStartup.bat"
    
    # Remove shortcuts
    Delete "$DESKTOP\Ilaw App.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
    Delete "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"
    RMDir "$SMPROGRAMS\${APP_NAME}"
    
    # Remove application files
    RMDir /r "$INSTDIR\src"
    RMDir /r "$INSTDIR\resources"
    RMDir /r "$INSTDIR\files"
    Delete "$INSTDIR\Ilaw _System.exe"
    Delete "$INSTDIR\package.json"
    Delete "$INSTDIR\LICENSE.txt"
    Delete "$INSTDIR\startup.bat"
    Delete "$INSTDIR\icon.ico"

    # Remove AppData files and folders
    RMDir /r "${APPDATA_FOLDER}"
    
    # Remove uninstaller
    Delete "$INSTDIR\uninstall.exe"
    
    # Try to remove installation directory
    RMDir /r "$INSTDIR"
    
    # Remove registry keys
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
SectionEnd