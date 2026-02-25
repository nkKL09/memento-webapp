# Деплой memento-webapp на Cloudflare Pages (папка dist)
# Запускай из корня проекта после того, как выполнил:
#   npm install -g wrangler
#   wrangler login
#   npx wrangler pages project create  (и ввёл имя memento-webapp, branch main)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path "dist\index.html")) {
    Write-Host "Папка dist не найдена или пуста. Сначала выполни: npx expo export --platform web" -ForegroundColor Red
    exit 1
}

Write-Host "Деплой dist на Cloudflare Pages (memento-webapp)..." -ForegroundColor Cyan
npx wrangler pages deploy dist --project-name=memento-webapp
Write-Host "Готово. URL: https://memento-webapp.pages.dev" -ForegroundColor Green
