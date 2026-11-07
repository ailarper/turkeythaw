Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/assets/dashboard.png"))
$w = $bmp.Width; $h = $bmp.Height

Write-Host "--- Scanning Dashboard for Active 16 lbs Pill (Orange) ---"
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
for ($y = 350; $y -lt 450; $y++) {
    for ($x = 350; $x -lt 600; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # orange color: R>220, G between 70 and 110, B<30
        if ($c.R -gt 220 -and $c.G -gt 70 -and $c.G -lt 120 -and $c.B -lt 40) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "16 lbs Pill: X=$minX..$maxX, Y=$minY..$maxY"
Write-Host ("16 lbs %: left={0:N2}%, top={1:N2}%, width={2:N2}%, height={3:N2}%" -f (($minX/$w)*100), (($minY/$h)*100), ((($maxX-$minX)/$w)*100), ((($maxY-$minY)/$h)*100))

Write-Host "--- Scanning Dashboard for '+ Add to Calendar' Button (Black) ---"
$bMinX = $w; $bMaxX = 0; $bMinY = $h; $bMaxY = 0
for ($y = 660; $y -lt 760; $y++) {
    for ($x = 750; $x -lt 1000; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 25 -and $c.G -lt 25 -and $c.B -lt 25) {
            if ($x -lt $bMinX) { $bMinX = $x }
            if ($x -gt $bMaxX) { $bMaxX = $x }
            if ($y -lt $bMinY) { $bMinY = $y }
            if ($y -gt $bMaxY) { $bMaxY = $y }
        }
    }
}
Write-Host "+ Add to Calendar: X=$bMinX..$bMaxX, Y=$bMinY..$bMaxY"
Write-Host ("Add to Cal %: left={0:N2}%, top={1:N2}%, width={2:N2}%, height={3:N2}%" -f (($bMinX/$w)*100), (($bMinY/$h)*100), ((($bMaxX-$bMinX)/$w)*100), ((($bMaxY-$bMinY)/$h)*100))

# Scan for the 5 affiliate buttons on the right side:
# usually x around 1400..1600, y around 430, 540, 640, 720, 800
Write-Host "--- Scanning Dashboard for Affiliate Buttons on Right ---"
# They are light pill buttons with border
for ($testY = 400; $testY -lt 850; $testY += 10) {
    $c = $bmp.GetPixel(1500, $testY)
    # Check if inside button (white / near white with border nearby)
}

$bmp.Dispose()

