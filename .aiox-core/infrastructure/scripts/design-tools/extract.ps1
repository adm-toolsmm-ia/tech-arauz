Add-Type -AssemblyName System.Drawing

function Get-TopColors {
    param([string]$ImagePath)
    
    $bmp = New-Object System.Drawing.Bitmap $ImagePath
    $colors = @{}
    
    # Check pixels (sampling to speed up)
    for ($y = 0; $y -lt $bmp.Height; $y += 5) {
        for ($x = 0; $x -lt $bmp.Width; $x += 5) {
            $pixel = $bmp.GetPixel($x, $y)
            if ($pixel.A -gt 10) {
                # Format exactly as hex
                $hex = "#{0:X2}{1:X2}{2:X2}" -f $pixel.R, $pixel.G, $pixel.B
                if ($colors.ContainsKey($hex)) {
                    $colors[$hex]++
                } else {
                    $colors[$hex] = 1
                }
            }
        }
    }
    
    $bmp.Dispose()
    
    Write-Host "Top colors in $ImagePath"
    $colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 5 | ForEach-Object {
        Write-Host "$($_.Name) - $($_.Value)"
    }
}

Get-TopColors -ImagePath "c:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz\docs\temp\Layout\Logo Transparente\LOGO PADRÃO-1.png"
Get-TopColors -ImagePath "c:\Users\Gabriel Cristofolini\Documents\SOLUCOESSISTEMAS\tech-arauz\docs\temp\Layout\Logo Transparente\LOGO LARANJA-6.png"
