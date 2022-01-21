for %%f in (.\demos\pug_*.dem) do "cmd /c go run %~dp0main.go %%f > %~dp0..\frontend\src\matchData\%%~nf.json"
