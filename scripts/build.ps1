$Node = "C:\Users\miche\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$Tsc = "node_modules\.pnpm\typescript@5.9.3\node_modules\typescript\lib\tsc.js"
$Vite = "node_modules\.pnpm\vite@7.3.3_jiti@1.21.7\node_modules\vite\bin\vite.js"

& $Node $Tsc -b
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $Node $Vite build
