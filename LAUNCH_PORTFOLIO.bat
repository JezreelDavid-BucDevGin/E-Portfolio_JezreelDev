@echo off
:: ================================================================
:: E-Portfolio Jezreel David — Setup & Launch Script
:: Run this once to copy placeholder images and open the portfolio
:: ================================================================
echo.
echo  ================================================
echo    E-Portfolio Setup ^& Launcher
echo    Jezreel David — Jose Rizal University BSIT
echo  ================================================
echo.

:: Get the directory where this script is located
set "PORTFOLIO_DIR=%~dp0"
set "IMG_SRC=C:\Users\JDM.D\.gemini\antigravity\brain\13fc08b6-25f8-421d-8897-7a3524fbd8c1"
set "IMG_DEST=%PORTFOLIO_DIR%assets\images"

:: Copy placeholder images if they don't already exist
echo  [*] Checking placeholder images...

if not exist "%IMG_DEST%\profile-placeholder.png" (
    copy /Y "%IMG_SRC%\profile_placeholder_1776340237934.png" "%IMG_DEST%\profile-placeholder.png" >nul 2>&1
    echo  [+] Copied profile placeholder image
) else (
    echo  [=] Profile image already present
)

if not exist "%IMG_DEST%\hero-bg.png" (
    copy /Y "%IMG_SRC%\hero_banner_bg_1776340255397.png" "%IMG_DEST%\hero-bg.png" >nul 2>&1
    echo  [+] Copied hero background image
) else (
    echo  [=] Hero background already present
)

if not exist "%IMG_DEST%\project-1.png" (
    copy /Y "%IMG_SRC%\project_placeholder1_1776340281676.png" "%IMG_DEST%\project-1.png" >nul 2>&1
    echo  [+] Copied project 1 image
) else (
    echo  [=] Project 1 image already present
)

if not exist "%IMG_DEST%\project-2.png" (
    copy /Y "%IMG_SRC%\project_placeholder2_1776340298169.png" "%IMG_DEST%\project-2.png" >nul 2>&1
    echo  [+] Copied project 2 image
) else (
    echo  [=] Project 2 image already present
)

if not exist "%IMG_DEST%\project-3.png" (
    copy /Y "%IMG_SRC%\project_placeholder3_1776340316077.png" "%IMG_DEST%\project-3.png" >nul 2>&1
    echo  [+] Copied project 3 image
) else (
    echo  [=] Project 3 image already present
)

echo.
echo  [*] Launching portfolio in your default browser...
echo.
start "" "%PORTFOLIO_DIR%index.html"

echo  [✓] Done! Your E-Portfolio is now open.
echo.
echo  ================================================
echo   To edit your portfolio, open index.html
echo   See README.md for full customization guide
echo  ================================================
echo.
pause
