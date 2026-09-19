[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z0-9._-]+$')]
    [string]$WorkId,

    [Parameter(Mandatory = $true)]
    [ValidateSet('codex', 'claude-code', 'human', 'ci')]
    [string]$Builder,

    [Parameter(Mandatory = $true)]
    [string]$BuildCommand,

    [Parameter(Mandatory = $true)]
    [int]$BuildExitCode,

    [string[]]$ArtifactPath = @(),
    [string]$RenderEnvironment,
    [string]$RenderServiceId,
    [string]$RenderDeployId,
    [string]$RenderHealthUrl,
    [string]$RenderDeployedRevision,
    [Nullable[bool]]$RenderRevisionMatchesCandidate,
    [string]$SupersedesReceiptId,
    [string[]]$Note = @()
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (git rev-parse --show-toplevel 2>$null).Trim()
if (-not $repoRoot) {
    throw 'Run this script inside a Git repository.'
}

$repoRoot = [System.IO.Path]::GetFullPath($repoRoot)
$repository = Split-Path -Leaf $repoRoot
$dirtyBeforeReceipt = @(git -C $repoRoot status --porcelain)
if ($dirtyBeforeReceipt.Count -ne 0) {
    throw 'Commit the validated implementation/artifacts first; the worktree must be clean before creating its receipt.'
}

$implementationSha = (git -C $repoRoot rev-parse HEAD).Trim()
$baseSha = $null
git -C $repoRoot rev-parse "$implementationSha^" 2>$null | ForEach-Object { $baseSha = $_.Trim() }
$observedAt = [DateTimeOffset]::UtcNow
$timestamp = $observedAt.ToString('yyyyMMddTHHmmssZ')
$receiptId = "$repository-$timestamp-$WorkId-$Builder"
$historyDir = Join-Path $repoRoot 'docs/build-history'
New-Item -ItemType Directory -Force -Path $historyDir | Out-Null

$artifacts = @()
foreach ($candidate in $ArtifactPath) {
    $resolved = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $candidate).Path)
    if (-not $resolved.StartsWith($repoRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Artifact is outside the repository: $candidate"
    }
    $item = Get-Item -LiteralPath $resolved
    if ($item.PSIsContainer) {
        throw "Artifact paths must name files: $candidate"
    }
    $relative = [System.IO.Path]::GetRelativePath($repoRoot, $resolved).Replace('\', '/')
    $artifacts += [ordered]@{
        path = $relative
        sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $resolved).Hash.ToLowerInvariant()
        size_bytes = $item.Length
    }
}

$render = [ordered]@{
    environment = if ($RenderEnvironment) { $RenderEnvironment } else { $null }
    service_id = if ($RenderServiceId) { $RenderServiceId } else { $null }
    deploy_id = if ($RenderDeployId) { $RenderDeployId } else { $null }
    health_url = if ($RenderHealthUrl) { $RenderHealthUrl } else { $null }
    http_status = $null
    observation_status = 'not_configured'
    deployed_revision = if ($RenderDeployedRevision) { $RenderDeployedRevision } else { $null }
    deployed_revision_matches_candidate = if ($null -ne $RenderRevisionMatchesCandidate) { $RenderRevisionMatchesCandidate.Value } else { $null }
    mutation_performed = $false
}

if ($RenderServiceId -and -not $RenderHealthUrl) {
    $render.observation_status = 'authentication_required'
}

if ($RenderHealthUrl) {
    $uri = [Uri]$RenderHealthUrl
    if ($uri.Scheme -ne 'https' -or $uri.UserInfo -or $uri.Query -or $uri.Fragment) {
        throw 'RenderHealthUrl must be an HTTPS URL without credentials, query parameters, or a fragment.'
    }
    try {
        $response = Invoke-WebRequest -Uri $uri.AbsoluteUri -Method Get -MaximumRedirection 3 -TimeoutSec 20 -UseBasicParsing
        $render.http_status = [int]$response.StatusCode
        $render.observation_status = if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) { 'healthy' } else { 'degraded' }
    }
    catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $render.http_status = [int]$_.Exception.Response.StatusCode
            $render.observation_status = 'degraded'
        }
        else {
            $render.observation_status = 'unreachable'
        }
    }
}

$receipt = [ordered]@{
    schema_version = '1.0.0'
    receipt_id = $receiptId
    observed_at = $observedAt.ToString('o')
    repository = $repository
    work_id = $WorkId
    builder = $Builder
    source_base_sha = $baseSha
    implementation_sha = $implementationSha
    receipt_identity = 'the Git commit containing this receipt'
    build = [ordered]@{
        command = $BuildCommand
        exit_code = $BuildExitCode
        artifacts = $artifacts
    }
    tests = @()
    render = $render
    supersedes_receipt_id = if ($SupersedesReceiptId) { $SupersedesReceiptId } else { $null }
    notes = @($Note)
}

$filename = "$timestamp-$WorkId-$Builder.json"
$outputPath = Join-Path $historyDir $filename
if (Test-Path -LiteralPath $outputPath) {
    throw "Receipt already exists: $outputPath"
}

$json = $receipt | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText($outputPath, $json + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
Write-Output $outputPath
