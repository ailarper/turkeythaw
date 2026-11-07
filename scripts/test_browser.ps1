$chromePath = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
$proc = Start-Process $chromePath -ArgumentList '--headless=new', '--remote-debugging-port=9222', 'http://localhost:3000' -PassThru
Start-Sleep -Seconds 3

try {
    $pages = Invoke-RestMethod -Uri 'http://127.0.0.1:9222/json/list'
    Write-Host "Found $($pages.Count) pages in Chrome"
    Write-Host "Page 0 title: $($pages[0].title)"
    Write-Host "Page 0 URL: $($pages[0].url)"
} finally {
    Stop-Process -Id $proc.Id -Force
}

