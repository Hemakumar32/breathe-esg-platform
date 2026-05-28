$dir = "c:\Users\Lenovo\.gemini\antigravity-ide\scratch\breathe-esg\frontend\src\pages"

Get-ChildItem -Path $dir -Filter "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # 1. H1 Headers
    $content = $content -replace 'className="(.*?)text-2xl font-bold text-gray-900(.*?)"', 'className="$1text-[32px] font-semibold text-[#0f172a] tracking-tight$2"'
    $content = $content -replace 'className="(.*?)text-2xl font-bold(.*?)"', 'className="$1text-[32px] font-semibold tracking-tight$2"'

    # 2. Descriptions
    $content = $content -replace '<p className="(.*?)text-gray-500 text-sm mt-1(.*?)"', '<p className="$1text-gray-500 text-[15px] mt-2$2"'

    # 3. Tables
    $content = $content -replace '<table className="(.*?)text-xs(.*?)"', '<table className="$1text-sm$2"'

    # 4. Table Headers
    $content = $content -replace '<th className="(.*?)font-bold text-gray-900 tracking-wider(.*?)"', '<th className="$1text-xs font-bold text-gray-500 uppercase tracking-wider$2"'

    [IO.File]::WriteAllText($_.FullName, $content)
}

$appJsxPath = "c:\Users\Lenovo\.gemini\antigravity-ide\scratch\breathe-esg\frontend\src\App.jsx"
$appJsxContent = Get-Content $appJsxPath -Raw
$appJsxContent = $appJsxContent -replace '<h2 className="(.*?)text-2xl font-bold text-gray-900(.*?)"', '<h2 className="$1text-[32px] font-semibold text-[#0f172a] tracking-tight$2"'
[IO.File]::WriteAllText($appJsxPath, $appJsxContent)

Write-Host "Fonts fixed!"
