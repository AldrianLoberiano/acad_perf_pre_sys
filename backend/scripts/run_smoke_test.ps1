param(
    [string]$BaseUrl = "http://127.0.0.1:5000"
)

$ErrorActionPreference = "Stop"

function Assert-Condition {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

try {
    $teacherUsername = "teacher_smoke_$(Get-Date -Format 'yyyyMMddHHmmss')"
    $teacherPassword = "TeacherSmoke123!"
    $adminUsername = "admin_smoke_$(Get-Date -Format 'yyyyMMddHHmmss')"
    $adminPassword = "AdminSmoke123!"

    $summary = [ordered]@{}

    $health = Invoke-RestMethod -Method Get -Uri "$BaseUrl/health"
    Assert-Condition ($health.status -eq "ok") "Health endpoint failed"
    $summary.health = $health

    $teacherRegisterBody = @{ username = $teacherUsername; password = $teacherPassword; role = "teacher" } | ConvertTo-Json
    $teacherRegister = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/register" -ContentType "application/json" -Body $teacherRegisterBody

    $teacherLoginBody = @{ username = $teacherUsername; password = $teacherPassword } | ConvertTo-Json
    $teacherLogin = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType "application/json" -Body $teacherLoginBody
    $teacherToken = $teacherLogin.access_token
    Assert-Condition (-not [string]::IsNullOrWhiteSpace($teacherToken)) "Teacher login token is missing"
    $teacherHeaders = @{ Authorization = "Bearer $teacherToken" }

    $createStudentBody = @{ name = "Smoke Script Student"; age = 22; course = "Software Engineering" } | ConvertTo-Json
    $createdStudent = Invoke-RestMethod -Method Post -Uri "$BaseUrl/students" -Headers $teacherHeaders -ContentType "application/json" -Body $createStudentBody
    $studentId = $createdStudent.student.id
    Assert-Condition ($studentId -gt 0) "Student creation failed"

    $listStudents = Invoke-RestMethod -Method Get -Uri "$BaseUrl/students" -Headers $teacherHeaders
    Assert-Condition (($listStudents.data | Measure-Object).Count -ge 1) "Students list endpoint returned empty data"

    $updateStudentBody = @{ age = 23; course = "Computer Engineering" } | ConvertTo-Json
    $updatedStudent = Invoke-RestMethod -Method Put -Uri "$BaseUrl/students/$studentId" -Headers $teacherHeaders -ContentType "application/json" -Body $updateStudentBody
    Assert-Condition ($updatedStudent.student.age -eq 23) "Student update endpoint failed"

    $performanceBody = @{
        student_id       = $studentId
        attendance       = 74
        quiz_score       = 70
        assignment_score = 72
        study_hours      = 8
    } | ConvertTo-Json
    $createdPerformance = Invoke-RestMethod -Method Post -Uri "$BaseUrl/performance" -Headers $teacherHeaders -ContentType "application/json" -Body $performanceBody

    $performanceList = Invoke-RestMethod -Method Get -Uri "$BaseUrl/performance/$studentId" -Headers $teacherHeaders
    Assert-Condition (($performanceList.records | Measure-Object).Count -ge 1) "Performance retrieval failed"

    $prediction = Invoke-RestMethod -Method Post -Uri "$BaseUrl/predict/$studentId" -Headers $teacherHeaders
    Assert-Condition (-not [string]::IsNullOrWhiteSpace($prediction.risk_level)) "Prediction endpoint failed"

    $predictions = Invoke-RestMethod -Method Get -Uri "$BaseUrl/predictions" -Headers $teacherHeaders
    Assert-Condition (($predictions.data | Measure-Object).Count -ge 1) "Predictions list endpoint failed"

    $analyticsOverview = Invoke-RestMethod -Method Get -Uri "$BaseUrl/analytics/overview" -Headers $teacherHeaders
    $analyticsAtRisk = Invoke-RestMethod -Method Get -Uri "$BaseUrl/analytics/at-risk" -Headers $teacherHeaders

    $report = Invoke-RestMethod -Method Get -Uri "$BaseUrl/reports/students/$studentId" -Headers $teacherHeaders
    Assert-Condition ($report.student.id -eq $studentId) "Reports endpoint failed"

    $adminRegisterBody = @{ username = $adminUsername; password = $adminPassword; role = "admin" } | ConvertTo-Json
    $adminRegister = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/register" -ContentType "application/json" -Body $adminRegisterBody

    $adminLoginBody = @{ username = $adminUsername; password = $adminPassword } | ConvertTo-Json
    $adminLogin = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType "application/json" -Body $adminLoginBody
    $adminToken = $adminLogin.access_token
    Assert-Condition (-not [string]::IsNullOrWhiteSpace($adminToken)) "Admin login token is missing"
    $adminHeaders = @{ Authorization = "Bearer $adminToken" }

    $deleteResp = Invoke-RestMethod -Method Delete -Uri "$BaseUrl/students/$studentId" -Headers $adminHeaders
    Assert-Condition ($deleteResp.message -eq "Student deleted") "Admin delete endpoint failed"

    $summary.teacher_user = $teacherRegister.user
    $summary.admin_user = $adminRegister.user
    $summary.created_student_id = $studentId
    $summary.performance_id = $createdPerformance.performance.id
    $summary.prediction = $prediction
    $summary.analytics_overview = $analyticsOverview
    $summary.analytics_at_risk_count = ($analyticsAtRisk.data | Measure-Object).Count
    $summary.report_student_id = $report.student.id
    $summary.delete_message = $deleteResp.message

    Write-Host "Smoke test completed successfully" -ForegroundColor Green
    $summary | ConvertTo-Json -Depth 8
    exit 0
}
catch {
    Write-Error "Smoke test failed: $($_.Exception.Message)"
    exit 1
}
