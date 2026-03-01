@echo off
cd /d C:\saju\cheonmyeong
mkdir src 2>nul
mkdir src\lib 2>nul
mkdir src\lib\__tests__ 2>nul
mkdir src\components 2>nul
echo Directories created
npm install > npm_install.log 2>&1
echo npm install completed
dir src
