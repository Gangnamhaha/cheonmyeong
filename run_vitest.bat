@echo off
cd /d C:\saju\cheonmyeong
npx vitest run --reporter=verbose > vitest_output.txt 2>&1
echo Exit code: %ERRORLEVEL% >> vitest_output.txt
