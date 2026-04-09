$path = Join-Path $PSScriptRoot 'bundle.js'
$content = [System.IO.File]::ReadAllText($path)
$old = '"scale":[16,16,16]'
$new = '"scale":[32,36,32]'
$content = $content.Replace($old, $new)
[System.IO.File]::WriteAllText($path, $content)
Write-Host "Done. Replaced scale."
