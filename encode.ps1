$bytes = [System.IO.File]::ReadAllBytes("f:\ALL PROJECT\Course selection\Updated_Faculty_List_Fall-2026.2026-08-02.12-03-37.xlsx")
$b64 = [System.Convert]::ToBase64String($bytes)
Set-Content -Path "f:\ALL PROJECT\Course selection\b64.txt" -Value $b64
