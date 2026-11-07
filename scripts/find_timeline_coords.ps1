Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/assets/timeline.png"))
$w = $bmp.Width; $h = $bmp.Height

# Find Back to top button in bottom right
$bMinX = $w; $bMaxX = 0; $bMinY = $h; $bMaxY = 0
for ($y = 800; $y -lt 920; $y++) {
    for ($x = 1450; $x -lt 1630; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Button border is white/light gray
        if ($c.R -gt 150 -and $c.G -gt 150 -and $c.B -gt 150) {
            if ($x -lt $bMinX) { $bMinX = $x }
            if ($x -gt $bMaxX) { $bMaxX = $x }
            if ($y -lt $bMinY) { $bMinY = $y }
            if ($y -gt $bMaxY) { $bMaxY = $y }
        }
    }
}
Write-Host "Back to top button: X=$bMinX..$bMaxX, Y=$bMinY..$bMaxY"
Write-Host ("Back to top %: left={0:N2}%, top={1:N2}%, width={2:N2}%, height={3:N2}%" -f (($bMinX/$w)*100), (($bMinY/$h)*100), ((($bMaxX-$bMinX)/$w)*100), ((($bMaxY-$bMinY)/$h)*100))

# Find the 5 cards along y = 400
Write-Host "--- Scanning Timeline Cards ---"
$inCard = $false
$starts = @(); $ends = @()
for ($x = 0; $x -lt $w; $x++) {
    $c = $bmp.GetPixel($x, 400)
    $isWhite = ($c.R -gt 250 -and $c.G -gt 250 -and $c.B -gt 250)
    if ($isWhite -and -not $inCard) {
        $inCard = $true
        $starts += $x
    } elseif (-not $isWhite -and $inCard) {
        $inCard = $false
        $ends += ($x - 1)
    }
}
for ($i = 0; $i -lt $starts.Count; $i++) {
    $sx = $starts[$i]; $ex = $ends[$i]
    Write-Host ("Card {0}: X={1}..{2} -> left={3:N2}%, width={4:N2}%" -f ($i+1), $sx, $ex, (($sx/$w)*100), ((($ex-$sx)/$w)*100))
}

$bmp.Dispose()

