Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/assets/dashboard.png"))
$w = $bmp.Width; $h = $bmp.Height

# Check column x = 1490
for ($y = 400; $y -lt 850; $y++) {
    $c = $bmp.GetPixel(1490, $y)
    # Check if this pixel is inside the button (it has background ~255, 255, 255) vs outside (~250, 248, 243)
    if ($y % 20 -eq 0) {
        Write-Host "Y=$y R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}
$bmp.Dispose()

