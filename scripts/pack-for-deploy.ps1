$Source = Join-Path $PSScriptRoot "..\frontend"
$Target = Join-Path $env:USERPROFILE "Desktop\zhenskaya-site"

if (Test-Path $Target) {
    Remove-Item $Target -Recurse -Force
}
New-Item -ItemType Directory -Path $Target | Out-Null

$items = @(
    "src",
    "public",
    "prisma",
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "postcss.config.mjs",
    "next-env.d.ts",
    "Dockerfile",
    "railway.toml",
    "railway.json",
    ".node-version",
    ".dockerignore",
    ".gitignore",
    ".env.example",
    "DEPLOY.md"
)

foreach ($item in $items) {
    $from = Join-Path $Source $item
    if (Test-Path $from) {
        Copy-Item $from -Destination $Target -Recurse -Force
        Write-Host "OK: $item"
    }
}

$eslint = Join-Path $Source "eslint.config.mjs"
if (Test-Path $eslint) {
    Copy-Item $eslint -Destination $Target -Force
}

$readme = @"
# Женская консультация — сайт

Готовая папка для GitHub и Railway.

1. Upload all files here to GitHub (repo root)
2. Railway: New Project -> GitHub -> empty Root Directory
3. Generate Domain

See DEPLOY.md (Russian)
"@
Set-Content -Path (Join-Path $Target "README.md") -Value $readme -Encoding UTF8

Copy-Item (Join-Path $Source "README-DEPLOY-FOLDER.md") -Destination (Join-Path $Target "KAK-ZAGRUZIT.txt") -Force -ErrorAction SilentlyContinue

$count = (Get-ChildItem $Target -Recurse -File).Count
$zip = Join-Path $env:USERPROFILE "Desktop\zhenskaya-site.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $Target "*") -DestinationPath $zip -Force
Write-Host "Done: $Target"
Write-Host "Files: $count"
Write-Host "ZIP: $zip"
