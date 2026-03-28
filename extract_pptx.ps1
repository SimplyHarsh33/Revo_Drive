Add-Type -AssemblyName System.IO.Compression.FileSystem

function Extract-PptxText {
    param([string]$FilePath)
    
    $output = @()
    $output += "`n" + "="*60
    $output += "FILE: $(Split-Path $FilePath -Leaf)"
    $output += "="*60
    
    $zip = [System.IO.Compression.ZipFile]::OpenRead($FilePath)
    $slideFiles = $zip.Entries | Where-Object { $_.FullName -match '^ppt/slides/slide\d+\.xml$' } | Sort-Object FullName
    
    $slideNum = 0
    foreach ($slideFile in $slideFiles) {
        $slideNum++
        $stream = $slideFile.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xml = [xml]$reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        
        $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
        $ns.AddNamespace("a", "http://schemas.openxmlformats.org/drawingml/2006/main")
        
        $texts = $xml.SelectNodes("//a:t", $ns)
        if ($texts.Count -gt 0) {
            $output += "`n--- Slide $slideNum ---"
            $currentPara = ""
            foreach ($t in $texts) {
                $currentPara += $t.InnerText
            }
            # Split by getting paragraphs
            $paragraphs = @()
            $pNodes = $xml.SelectNodes("//a:p", $ns)
            foreach ($p in $pNodes) {
                $paraText = ""
                $tNodes = $p.SelectNodes(".//a:t", $ns)
                foreach ($t in $tNodes) {
                    $paraText += $t.InnerText
                }
                if ($paraText.Trim()) {
                    $paragraphs += $paraText.Trim()
                }
            }
            foreach ($para in $paragraphs) {
                $output += $para
            }
        }
    }
    $zip.Dispose()
    return $output -join "`n"
}

$file1 = "d:\fourth_sem\project\RevoDrive\DriveSafe_AI_Engineering.pptx"
$file2 = "d:\fourth_sem\project\RevoDrive\DriveSafe_Team_Roles.pptx"

$result = ""
$result += Extract-PptxText $file1
$result += "`n`n"
$result += Extract-PptxText $file2

$result | Out-File -FilePath "d:\fourth_sem\project\RevoDrive\extracted_content.txt" -Encoding UTF8
Write-Host "Extraction complete!"
Write-Host $result
