Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile("C:\Users\user\Downloads\TurkeyThaw Thanksgiving Timeline.png")
Write-Output "Timeline size: $($img.Width) x $($img.Height)"

# Let's find white card background along y = 350
$y = 350
$inCard = $false
$cardStarts = @()
$cardEnds = @()
for ($x = 0; $x -lt $img.Width; $x++) {
    $c = $img.GetPixel($x, $y)
    # Check if pixel is pure white or very close
    $isWhite = ($c.R -gt 250 -and $c.G -gt 250 -and $c.B -gt 250)
    if ($isWhite -and -not $inCard) {
        $inCard = $true
        $cardStarts += $x
    } elseif (-not $isWhite -and $inCard) {
        $inCard = $false
        $cardEnds += ($x - 1)
    }
}

for ($i = 0; $i -lt $cardStarts.Count; $i++) {
    Write-Output "Card $($i+1): X = $($cardStarts[$i]) to $($cardEnds[$i]) (width: $($cardEnds[$i] - $cardStarts[$i]))"
}

# Also let's find the card top and bottom for Card 1
$startX = $cardStarts[0] + 10
for ($y = 200; $y -lt 700; $y++) {
    $c = $img.GetPixel($startX, $y)
    $isWhite = ($c.R -gt 250 -and $c.G -gt 250 -and $c.B -gt 250)
    if ($isWhite) {
        Write-Output "Card top is at Y = $y"
        break
    }
}

for ($y = 650; $y -gt 250; $y--) {
    $c = $img.GetPixel($startX, $y)
    $isWhite = ($c.R -gt 250 -and $c.G -gt 250 -and $c.B -gt 250)
    if ($isWhite) {
        Write-Output "Card bottom is at Y = $y"
        break
    }
}

$img.Dispose()

