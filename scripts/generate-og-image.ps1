Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot '..\public\images\og-homepage.png'
$out = [System.IO.Path]::GetFullPath($out)

$W = 1200
$H = 630

$bmp = New-Object System.Drawing.Bitmap($W, $H)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Fondo: degradado diagonal verde institucional
$rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(15, 42, 34),
    [System.Drawing.Color]::FromArgb(45, 111, 94),
    35
)
$g.FillRectangle($grad, $rect)

# Acento suave en la esquina inferior derecha
$accent = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 92, 78))
$g.FillEllipse($accent, 900, 380, 460, 460)

$fontFamily = 'Segoe UI'
$brand = New-Object System.Drawing.Font($fontFamily, 34, [System.Drawing.FontStyle]::Bold)
$headline = New-Object System.Drawing.Font($fontFamily, 50, [System.Drawing.FontStyle]::Bold)
$sub = New-Object System.Drawing.Font($fontFamily, 26, [System.Drawing.FontStyle]::Regular)
$foot = New-Object System.Drawing.Font($fontFamily, 22, [System.Drawing.FontStyle]::Bold)

$white = [System.Drawing.Brushes]::White
$soft = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(188, 221, 208))
$accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(143, 197, 179))

$g.DrawString('PsyDoctor', $brand, $white, 64, 56)

$g.FillRectangle(
    (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(95, 166, 146))),
    64, 118, 84, 5
)

function Wrap-Text {
    param($Graphics, $Text, $Font, $MaxWidth)
    $words = $Text.Split(' ')
    $lines = New-Object System.Collections.ArrayList
    $current = ''
    foreach ($w in $words) {
        $candidate = if ($current -eq '') { $w } else { "$current $w" }
        $size = $Graphics.MeasureString($candidate, $Font)
        if ($size.Width -le $MaxWidth -or $current -eq '') {
            $current = $candidate
        } else {
            [void]$lines.Add($current)
            $current = $w
        }
    }
    if ($current -ne '') { [void]$lines.Add($current) }
    return $lines
}

$y = 200
foreach ($line in (Wrap-Text -Graphics $g -Text 'Encuentra el profesional de salud mental que necesitas' -Font $headline -MaxWidth 1000)) {
    $g.DrawString($line, $headline, $white, 64, $y)
    $y += 66
}

$y += 22
$g.DrawString('Verificados | Online y presencial | Cobertura Fonasa e Isapre', $sub, $soft, 64, $y)

$g.DrawString('PSYDOCTER.CL', $foot, $accentBrush, 64, 552)

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$brand.Dispose()
$headline.Dispose()
$sub.Dispose()
$foot.Dispose()
$soft.Dispose()
$accentBrush.Dispose()
$accent.Dispose()
$grad.Dispose()

Write-Output "OK: $out"