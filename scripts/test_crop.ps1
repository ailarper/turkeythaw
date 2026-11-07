Add-Type -AssemblyName System.Drawing

$src = "C:\Users\user\Downloads\TurkeyThaw Thanksgiving Planner.png"
$img = [System.Drawing.Bitmap]::FromFile($src)
Write-Output "Image loaded: $($img.Width) x $($img.Height)"

$crop = New-Object System.Drawing.Bitmap(1672, 600)
$g = [System.Drawing.Graphics]::FromImage($crop)
$rect = New-Object System.Drawing.Rectangle(0, 0, 1672, 600)
$g.DrawImage($img, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$destDir = "c:\Users\user\Downloads\turkey\public\assets"
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

$dest = "$destDir\hero_panoramic.jpg"
$crop.Save($dest, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$crop.Dispose()
$img.Dispose()

Write-Output "Successfully saved $dest"

