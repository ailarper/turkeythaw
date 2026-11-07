Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/assets/planner.png"))
$w = $bmp.Width; $h = $bmp.Height

# Search for the center badge: "USDA Safety Guidance • 165°F Safe Temperature"
# It has a light border or white background around y: 480..560, x: 550..1150
Write-Host "--- Scanning Planner for Badge ---"
$badgeMinX = $w; $badgeMaxX = 0; $badgeMinY = $h; $badgeMaxY = 0
for ($y = 480; $y -lt 550; $y++) {
    for ($x = 550; $x -lt 1150; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # badge has light color/border
        if ($c.R -gt 220 -and $c.G -gt 210 -and $c.B -gt 195) {
            if ($x -lt $badgeMinX) { $badgeMinX = $x }
            if ($x -gt $badgeMaxX) { $badgeMaxX = $x }
            if ($y -lt $badgeMinY) { $badgeMinY = $y }
            if ($y -gt $badgeMaxY) { $badgeMaxY = $y }
        }
    }
}
Write-Host "Badge: X=$badgeMinX..$badgeMaxX, Y=$badgeMinY..$badgeMaxY"
Write-Host ("Badge %: left={0:N2}%, top={1:N2}%, width={2:N2}%, height={3:N2}%" -f (($badgeMinX/$w)*100), (($badgeMinY/$h)*100), ((($badgeMaxX-$badgeMinX)/$w)*100), ((($badgeMaxY-$badgeMinY)/$h)*100))

# Bottom links: "Thanksgiving 2026 Ready" and "Scroll down to configure weight & time"
# along y: 900..935
$bmp.Dispose()

