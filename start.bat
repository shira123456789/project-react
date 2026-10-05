@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
echo ========================================
echo    חנות ספרים דיגיטלית - הפעלה
echo ========================================
echo.
echo פותח שרת נתונים (פורט 3001)...
start "JSON Server" cmd /k "SET PATH=C:\Program Files\nodejs;%PATH% && node node_modules\json-server\lib\cli\bin.js --watch db.json --port 3001"
timeout /t 2 /nobreak >nul
echo פותח אפליקציית React (פורט 5173)...
start "Vite React" cmd /k "SET PATH=C:\Program Files\nodejs;%PATH% && node node_modules\vite\bin\vite.js --port 5173"
echo.
echo ========================================
echo  שני החלונות נפתחו!
echo  המתן כמה שניות ואז פתח:
echo  http://localhost:5173
echo ========================================
pause
