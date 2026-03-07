# Quick Deployment Script
$GitPath = "C:\Users\User\AppData\Local\GitHubDesktop\app-3.5.5\resources\app\git\cmd\git.exe"

# 1. Add all changes
& $GitPath add .

# 2. Commit changes
$Msg = Read-Host "Commit message (default: 'Update from Antigravity'): "
if ([string]::IsNullOrWhiteSpace($Msg)) { $Msg = "Update from Antigravity" }
& $GitPath commit -m $Msg

# 3. Push to GitHub
& $GitPath push origin main

Write-Host "`n🚀 Pushed to GitHub! Check Render for the update (usually takes 1-2 mins)." -ForegroundColor Green
