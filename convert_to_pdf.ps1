$docPath = "F:\react-project\SOCIAL-CONNECTED\Social_Connect_15_Page_Project_Report.doc"
$pdfPath = "F:\react-project\SOCIAL-CONNECTED\Social_Connect_15_Page_Project_Report.pdf"

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($docPath)
    $wdFormatPDF = 17
    $doc.SaveAs([ref]$pdfPath, [ref]$wdFormatPDF)
    $doc.Close()
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    Write-Host "PDF_GENERATED_SUCCESSFULLY"
} catch {
    Write-Host "WORD_CONVERSION_ERROR: $($_.Exception.Message)"
}
