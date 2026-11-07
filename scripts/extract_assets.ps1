Add-Type -AssemblyName System.Drawing

$plannerSrc = "C:\Users\user\Downloads\TurkeyThaw Thanksgiving Planner.png"
$dashboardSrc = "C:\Users\user\Downloads\Watercolor Turkey Thaw Planner Dashboard.png"
$safetySrc = "C:\Users\user\Downloads\TurkeyThaw Thanksgiving Safety Guide.png"
$timelineSrc = "C:\Users\user\Downloads\TurkeyThaw Thanksgiving Timeline.png"

$assetsDir = "c:\Users\user\Downloads\turkey\public\assets"
if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null
}

function Crop-Image($srcFile, $x, $y, $w, $h, $destFile) {
    $img = [System.Drawing.Bitmap]::FromFile($srcFile)
    $crop = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($crop)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $g.DrawImage($img, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $crop.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
    $img.Dispose()
    Write-Output "Saved: $destFile ($w x $h)"
}

# 1. Hero Landscape (top 560px of Planner, full width)
Crop-Image $plannerSrc 0 0 1672 580 "$assetsDir\hero-landscape.png"

# 2. Result Card Turkey Platter from Dashboard
Crop-Image $dashboardSrc 85 715 220 120 "$assetsDir\turkey-platter.png"

# 3. Gear Items from Dashboard
Crop-Image $dashboardSrc 1025 415 150 85 "$assetsDir\gear-thermopop.png"
Crop-Image $dashboardSrc 1025 515 150 85 "$assetsDir\gear-dot-probe.png"
Crop-Image $dashboardSrc 1025 605 150 90 "$assetsDir\gear-roasting-pan.png"
Crop-Image $dashboardSrc 1040 695 120 90 "$assetsDir\gear-thaw-bags.png"
Crop-Image $dashboardSrc 1040 775 150 75 "$assetsDir\gear-lifters.png"

# 4. Safety Guide Turkey Probe Image
Crop-Image $safetySrc 90 540 780 215 "$assetsDir\turkey-temp-guide.png"

# 5. Timeline 5 Step Illustrations
Crop-Image $timelineSrc 55 385 260 170 "$assetsDir\battle-step-1.png"
Crop-Image $timelineSrc 370 385 265 170 "$assetsDir\battle-step-2.png"
Crop-Image $timelineSrc 690 385 285 170 "$assetsDir\battle-step-3.png"
Crop-Image $timelineSrc 1035 385 270 170 "$assetsDir\battle-step-4.png"
Crop-Image $timelineSrc 1360 385 265 170 "$assetsDir\battle-step-5.png"

# 6. Kitchen backdrop
Crop-Image $dashboardSrc 850 0 822 450 "$assetsDir\kitchen-backdrop.png"

Write-Output "Asset extraction complete!"
