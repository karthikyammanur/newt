# Test the /read_summary endpoint functionality

Write-Host "Testing /read_summary endpoint..." -ForegroundColor Green

# Step 1: Login and get token
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Body @{username="test@example.com"; password="password123"}
$token = $loginResponse.access_token
Write-Host "Token obtained: $($token.Substring(0,20))..." -ForegroundColor Green

# Step 2: Get user stats before reading
Write-Host "`n2. Getting initial user stats..." -ForegroundColor Yellow
$headers = @{Authorization="Bearer $token"}
$initialStats = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me" -Headers $headers
Write-Host "Initial Points: $($initialStats.points)" -ForegroundColor Green
Write-Host "Initial Today Reads: $($initialStats.today_reads)" -ForegroundColor Green
Write-Host "Initial Total Reads: $($initialStats.total_summaries_read)" -ForegroundColor Green

# Step 3: Get a summary to read
Write-Host "`n3. Getting today's summaries..." -ForegroundColor Yellow
$summaries = Invoke-RestMethod -Uri "http://localhost:8000/api/summaries/today"
$testSummary = $summaries | Select-Object -First 1
Write-Host "Test Summary ID: $($testSummary._id)" -ForegroundColor Green
Write-Host "Test Summary Title: $($testSummary.title.Substring(0, [Math]::Min(50, $testSummary.title.Length)))..." -ForegroundColor Green

# Step 4: Mark summary as read (first time)
Write-Host "`n4. Marking summary as read (first time)..." -ForegroundColor Yellow
$readHeaders = @{Authorization="Bearer $token"; "Content-Type"="application/json"}
$readBody = @{summary_id=$testSummary._id} | ConvertTo-Json
$readResult1 = Invoke-RestMethod -Uri "http://localhost:8000/api/read_summary" -Method POST -Headers $readHeaders -Body $readBody
Write-Host "Points Earned: $($readResult1.points_earned)" -ForegroundColor Green
Write-Host "Total Points: $($readResult1.total_points)" -ForegroundColor Green
Write-Host "Already Read: $($readResult1.already_read)" -ForegroundColor Green

# Step 5: Try to read same summary again (duplicate detection)
Write-Host "`n5. Trying to read same summary again..." -ForegroundColor Yellow
$readResult2 = Invoke-RestMethod -Uri "http://localhost:8000/api/read_summary" -Method POST -Headers $readHeaders -Body $readBody
Write-Host "Points Earned: $($readResult2.points_earned)" -ForegroundColor Green
Write-Host "Total Points: $($readResult2.total_points)" -ForegroundColor Green
Write-Host "Already Read: $($readResult2.already_read)" -ForegroundColor Green

# Step 6: Get final user stats
Write-Host "`n6. Getting final user stats..." -ForegroundColor Yellow
$finalStats = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/me" -Headers $headers
Write-Host "Final Points: $($finalStats.points)" -ForegroundColor Green
Write-Host "Final Today Reads: $($finalStats.today_reads)" -ForegroundColor Green
Write-Host "Final Total Reads: $($finalStats.total_summaries_read)" -ForegroundColor Green

# Step 7: Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Points Change: $($finalStats.points - $initialStats.points)" -ForegroundColor Green
Write-Host "Today Reads Change: $($finalStats.today_reads - $initialStats.today_reads)" -ForegroundColor Green
Write-Host "Total Reads Change: $($finalStats.total_summaries_read - $initialStats.total_summaries_read)" -ForegroundColor Green
Write-Host "Duplicate Prevention: $(if ($readResult2.already_read) { 'WORKING' } else { 'FAILED' })" -ForegroundColor $(if ($readResult2.already_read) { 'Green' } else { 'Red' })

Write-Host "`nTest completed!" -ForegroundColor Green
