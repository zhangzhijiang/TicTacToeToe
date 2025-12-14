# Script to update app icons and splash screens from tttt_logo_512_512.png
Add-Type -AssemblyName System.Drawing

$sourceFile = Join-Path $PSScriptRoot "tttt_logo_512_512.png"
$resPath = Join-Path $PSScriptRoot "android\app\src\main\res"

if (-not (Test-Path $sourceFile)) {
    Write-Host "Error: tttt_logo_512_512.png not found"
    exit 1
}

Write-Host "Starting asset generation..."
Write-Host ""

try {
    $sourceImg = [System.Drawing.Image]::FromFile($sourceFile)
    Write-Host "Loaded source image: $($sourceImg.Width)x$($sourceImg.Height)"
} catch {
    Write-Host "Error loading image: $($_.Exception.Message)"
    exit 1
}

function Resize-Image {
    param(
        [System.Drawing.Image]$source,
        [int]$width,
        [int]$height,
        [string]$outputPath
    )
    
    try {
        $newImg = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($newImg)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.DrawImage($source, 0, 0, $width, $height)
        
        $dir = Split-Path $outputPath -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        $newImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $newImg.Dispose()
        $graphics.Dispose()
        return $true
    } catch {
        Write-Host "Error creating $outputPath : $($_.Exception.Message)"
        return $false
    }
}

Write-Host "Generating App Icons..."
$iconSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

$iconCount = 0
foreach ($folder in $iconSizes.Keys) {
    $size = $iconSizes[$folder]
    $folderPath = Join-Path $resPath $folder
    
    $iconPath = Join-Path $folderPath "ic_launcher.png"
    if (Resize-Image -source $sourceImg -width $size -height $size -outputPath $iconPath) { $iconCount++ }
    
    $roundIconPath = Join-Path $folderPath "ic_launcher_round.png"
    if (Resize-Image -source $sourceImg -width $size -height $size -outputPath $roundIconPath) { $iconCount++ }
    
    $foregroundPath = Join-Path $folderPath "ic_launcher_foreground.png"
    if (Resize-Image -source $sourceImg -width $size -height $size -outputPath $foregroundPath) { $iconCount++ }
    
    $backgroundPath = Join-Path $folderPath "ic_launcher_background.png"
    if (Resize-Image -source $sourceImg -width $size -height $size -outputPath $backgroundPath) { $iconCount++ }
}

Write-Host "Generated $iconCount app icon files"
Write-Host ""

Write-Host "Generating Splash Screens..."

function Create-SplashScreen {
    param(
        [int]$width,
        [int]$height,
        [string]$outputPath,
        [System.Drawing.Image]$logo
    )
    
    try {
        $splash = New-Object System.Drawing.Bitmap($width, $height)
        $graphics = [System.Drawing.Graphics]::FromImage($splash)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            [System.Drawing.Point]::new(0, 0),
            [System.Drawing.Point]::new($width, $height),
            [System.Drawing.Color]::FromArgb(255, 251, 207, 232),
            [System.Drawing.Color]::FromArgb(255, 221, 160, 221)
        )
        $graphics.FillRectangle($bgBrush, 0, 0, $width, $height)
        $bgBrush.Dispose()
        
        $maxLogoSize = [Math]::Min($width, $height) * 0.8
        $logoSize = [Math]::Min($maxLogoSize, 512)
        $logoX = ($width - $logoSize) / 2
        $logoY = ($height - $logoSize) / 2
        $graphics.DrawImage($logo, $logoX, $logoY, $logoSize, $logoSize)
        
        $dir = Split-Path $outputPath -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        
        $splash.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $splash.Dispose()
        $graphics.Dispose()
        return $true
    } catch {
        Write-Host "Error creating $outputPath : $($_.Exception.Message)"
        return $false
    }
}

$splashSizes = @{
    "drawable-port-mdpi" = @{width = 320; height = 480}
    "drawable-port-hdpi" = @{width = 480; height = 800}
    "drawable-port-xhdpi" = @{width = 720; height = 1280}
    "drawable-port-xxhdpi" = @{width = 960; height = 1600}
    "drawable-port-xxxhdpi" = @{width = 1280; height = 1920}
}

$landscapeSizes = @{
    "drawable-land-mdpi" = @{width = 480; height = 320}
    "drawable-land-hdpi" = @{width = 800; height = 480}
    "drawable-land-xhdpi" = @{width = 1280; height = 720}
    "drawable-land-xxhdpi" = @{width = 1600; height = 960}
    "drawable-land-xxxhdpi" = @{width = 1920; height = 1280}
}

$splashCount = 0

foreach ($folder in $splashSizes.Keys) {
    $size = $splashSizes[$folder]
    $splashPath = Join-Path $resPath "$folder\splash.png"
    if (Create-SplashScreen -width $size.width -height $size.height -outputPath $splashPath -logo $sourceImg) { $splashCount++ }
}

foreach ($folder in $landscapeSizes.Keys) {
    $size = $landscapeSizes[$folder]
    $splashPath = Join-Path $resPath "$folder\splash.png"
    if (Create-SplashScreen -width $size.width -height $size.height -outputPath $splashPath -logo $sourceImg) { $splashCount++ }
}

foreach ($folder in $splashSizes.Keys) {
    $nightFolder = $folder -replace "port-", "port-night-"
    $size = $splashSizes[$folder]
    $splashPath = Join-Path $resPath "$nightFolder\splash.png"
    if (Create-SplashScreen -width $size.width -height $size.height -outputPath $splashPath -logo $sourceImg) { $splashCount++ }
}

foreach ($folder in $landscapeSizes.Keys) {
    $nightFolder = $folder -replace "land-", "land-night-"
    $size = $landscapeSizes[$folder]
    $splashPath = Join-Path $resPath "$nightFolder\splash.png"
    if (Create-SplashScreen -width $size.width -height $size.height -outputPath $splashPath -logo $sourceImg) { $splashCount++ }
}

$mainSplashPath = Join-Path $resPath "drawable\splash.png"
if (Create-SplashScreen -width 720 -height 1280 -outputPath $mainSplashPath -logo $sourceImg) { $splashCount++ }

$nightSplashPath = Join-Path $resPath "drawable-night\splash.png"
if (Create-SplashScreen -width 720 -height 1280 -outputPath $nightSplashPath -logo $sourceImg) { $splashCount++ }

Write-Host "Generated $splashCount splash screen files"
Write-Host ""

$sourceImg.Dispose()

Write-Host "SUCCESS! All assets have been generated."
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run: npm run android:sync"
Write-Host "2. Rebuild your app: npm run android:build"
