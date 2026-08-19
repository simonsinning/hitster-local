@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "APP_DIR=%ROOT_DIR%spotify-connect-test"
set "URL=http://127.0.0.1:5187"
set "NODE_EXE=node.exe"
set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

where node.exe >nul 2>nul
if errorlevel 1 (
  if exist "%CODEX_NODE%" (
    set "NODE_EXE=%CODEX_NODE%"
  ) else (
    echo.
    echo Node.js blev ikke fundet.
    echo.
    echo Installer Node.js fra:
    echo https://nodejs.org
    echo.
    echo Naar Node.js er installeret, kan du dobbeltklikke paa denne fil igen.
    echo.
    start "" "https://nodejs.org"
    pause
    exit /b 1
  )
)

if not exist "%APP_DIR%\server.js" (
  echo Kunne ikke finde server.js i:
  echo %APP_DIR%
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$open = $false; $client = New-Object Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 5187); $open = $true } catch { $open = $false } finally { if ($client) { $client.Dispose() } }; if (-not $open) { Start-Process -FilePath '%NODE_EXE%' -ArgumentList 'server.js' -WorkingDirectory '%APP_DIR%' -WindowStyle Minimized; Start-Sleep -Seconds 1 }; Start-Process '%URL%'"
