@echo off
setlocal

set "APP_DIR=C:\Users\simon\Desktop\Hitster\spotify-connect-test"
set "URL=http://127.0.0.1:5187"
set "NODE_EXE=node.exe"
set "CODEX_NODE=C:\Users\simon\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

where node.exe >nul 2>nul
if errorlevel 1 (
  set "NODE_EXE=%CODEX_NODE%"
)

if not exist "%APP_DIR%\server.js" (
  echo Kunne ikke finde server.js i:
  echo %APP_DIR%
  pause
  exit /b 1
)

if /i not "%NODE_EXE%"=="node.exe" if not exist "%NODE_EXE%" (
  echo Node.js blev ikke fundet.
  echo Installer Node.js, eller start appen fra Codex igen.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$open = $false; $client = New-Object Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 5187); $open = $true } catch { $open = $false } finally { $client.Dispose() }; if (-not $open) { Start-Process -FilePath '%NODE_EXE%' -ArgumentList 'server.js' -WorkingDirectory '%APP_DIR%' -WindowStyle Minimized; Start-Sleep -Seconds 1 }; Start-Process '%URL%'"
