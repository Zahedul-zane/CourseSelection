$bytes = [System.IO.File]::ReadAllBytes("f:\ALL PROJECT\Course selection\Faculty_List_Fall-2026..xlsx")
$b64 = [System.Convert]::ToBase64String($bytes)
Set-Content -Path "f:\ALL PROJECT\Course selection\b64.txt" -Value $b64
