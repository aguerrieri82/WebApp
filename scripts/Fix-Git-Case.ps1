param (
    [Parameter(Mandatory=$true)]
    [string]$Directory
)

# Ensure the provided directory exists
if (-not (Test-Path -Path $Directory -PathType Container)) {
    Write-Host "Error: Directory '$Directory' does not exist."
    exit 1
}

# Resolve the absolute path
$FullPath = (Resolve-Path $Directory).Path.TrimEnd('\')

# Find the Git root for the given path
$gitRoot = git -C $FullPath rev-parse --show-toplevel 2>$null

if (-not $gitRoot) {
    Write-Host "Error: '$FullPath' is not in a Git repository."
    exit 1
}

Write-Host "Git root found at: $gitRoot"
Write-Host "Normalizing file casing for directory: $FullPath"
Write-Host ""

# Get all tracked files (with Git’s casing) relative to the Git root
$trackedFiles = git -C $gitRoot ls-files --full-name

# Retrieve all files under the given directory (real filesystem casing)
$files = Get-ChildItem -Recurse -File -Path $FullPath
$TotalFiles = $files.Count

Write-Host "Found $TotalFiles files in $FullPath."

# Track changes
$RenamedCount = 0
$SkippedCount = 0

foreach ($file in $files) {
    # Skip files in node_modules
    if ($file.FullName -like "*\node_modules\*") {
        Write-Host "Skipping (node_modules): $($file.FullName)"
        $SkippedCount++
        continue
    }

    # Compute relative path to Git root
    $relativePath = $file.FullName.Substring($gitRoot.Length + 1)
    $relativePathGit = $relativePath -replace '\\', '/'

    Write-Host "Checking: $relativePathGit"

    # Find the tracked file ignoring case, but ensure only the first match is used
$trackedFile = ($trackedFiles | Where-Object { $_ -ieq $relativePathGit } | Select-Object -First 1)

if ($trackedFile) {
    if ($trackedFile -cne $relativePathGit) {
        Write-Host " -> Mismatch detected (Git: '$trackedFile', FS: '$relativePathGit'). Renaming in Git..."
        git mv -f "$trackedFile" "$relativePathGit"
        if ($LASTEXITCODE -eq 0) {
            Write-Host " -> Renamed successfully."
            $RenamedCount++
        } else {
            Write-Host " -> Rename failed!"
        }
    } else {
        Write-Host " -> Casing already matches."
        $SkippedCount++
    }
} else {
    Write-Host " -> File not tracked by Git. Skipping."
    $SkippedCount++
}

    Write-Host ""
}

Write-Host "Normalization complete."
Write-Host "Files renamed to match FS casing: $RenamedCount"
Write-Host "Files skipped (already matched, untracked, or in node_modules): $SkippedCount"