Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path "public/assets/dashboard.png"))
$w = $bmp.Width; $h = $bmp.Height

# Look for the orange/brown text of ThermoWorks Direct / Walmart around x=1450..1580
for ($y = 400; $y -lt 850; $y++) {
    for ($x = 1450; $x -lt 1580; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # borders of pill buttons are light brown/orange or white inside
    }
}

# Let's inspect the 5 button vertical centers:
# Item 1: y ~ 445..485
# Item 2: y ~ 545..585
# Item 3: y ~ 635..675
# Item 4: y ~ 715..755
# Item 5: y ~ 795..835

$bmp.Dispose()
Write-Host "Scanned affiliate buttons"

