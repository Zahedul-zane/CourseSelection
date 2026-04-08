$bytes = [System.IO.File]::ReadAllBytes("f:\Course selection\Faculty_List_Summer-2026.(Date_ 2026-03-31).xlsx")
$b64 = [System.Convert]::ToBase64String($bytes)
Set-Content -Path "f:\Course selection\b64.txt" -Value $b64
