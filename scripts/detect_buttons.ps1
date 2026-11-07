Add-Type -AssemblyName System.Drawing
$baseDir = Resolve-Path "public/assets"

function Analyze-Image($filename) {
    $path = Join-Path $baseDir $filename
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    $w = $bmp.Width
    $h = $bmp.Height
    Write-Host "=== $filename (${w}x${h}) ==="

    # Find the top navbar "Plan dinner" black pill button:
    # Usually around y in [20..70], x in [1300..1650], color is near black (R<30, G<30, B<30)
    $blackMinX = $w; $blackMaxX = 0; $blackMinY = $h; $blackMaxY = 0
    for ($y = 20; $y -lt 80; $y++) {
        for ($x = [int]($w * 0.8); $x -lt [int]($w * 0.98); $x++) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.R -lt 30 -and $c.G -lt 30 -and $c.B -lt 30) {
                if ($x -lt $blackMinX) { $blackMinX = $x }
                if ($x -gt $blackMaxX) { $blackMaxX = $x }
                if ($y -lt $blackMinY) { $blackMinY = $y }
                if ($y -gt $blackMaxY) { $blackMaxY = $y }
            }
        }
    }
    if ($blackMaxX -gt $blackMinX) {
        $lPct = [Math]::Round(($blackMinX / $w) * 100, 2)
        $tPct = [Math]::Round(($blackMinY / $h) * 100, 2)
        $wPct = [Math]::Round((($blackMaxX - $blackMinX) / $w) * 100, 2)
        $hPct = [Math]::Round((($blackMaxY - $blackMinY) / $h) * 100, 2)
        Write-Host "Top 'Plan dinner' button: X=$blackMinX..$blackMaxX, Y=$blackMinY..$blackMaxY -> left:${lPct}%, top:${tPct}%, width:${wPct}%, height:${hPct}%"
    }

    # Find Logo "TurkeyThaw" around y in [20..70], x in [20..350]
    # Look for orange color (R>200, G>60, B<40)
    $orgMinX = $w; $orgMaxX = 0; $orgMinY = $h; $orgMaxY = 0
    for ($y = 20; $y -lt 80; $y++) {
        for ($x = [int]($w * 0.02); $x -lt [int]($w * 0.22); $x++) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.R -gt 190 -and $c.G -gt 60 -and $c.B -lt 50) {
                if ($x -lt $orgMinX) { $orgMinX = $x }
                if ($x -gt $orgMaxX) { $orgMaxX = $x }
                if ($y -lt $orgMinY) { $orgMinY = $y }
                if ($y -gt $orgMaxY) { $orgMaxY = $y }
            }
        }
    }
    if ($orgMaxX -gt $orgMinX) {
        $lPct = [Math]::Round(($orgMinX / $w) * 100, 2)
        $tPct = [Math]::Round(($orgMinY / $h) * 100, 2)
        $wPct = [Math]::Round((($orgMaxX - $orgMinX) / $w) * 100, 2)
        $hPct = [Math]::Round((($orgMaxY - $orgMinY) / $h) * 100, 2)
        Write-Host "Logo icon/text: X=$orgMinX..$orgMaxX, Y=$orgMinY..$orgMaxY -> left:${lPct}%, top:${tPct}%, width:${wPct}%, height:${hPct}%"
    }

    $bmp.Dispose()
}

Analyze-Image "planner.png"
Analyze-Image "dashboard.png"
Analyze-Image "guide.png"
Analyze-Image "timeline.png"

