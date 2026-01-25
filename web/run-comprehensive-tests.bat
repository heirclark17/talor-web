@echo off
echo ========================================
echo COMPREHENSIVE E2E TEST SUITE
echo ========================================
echo.
echo Testing: Backend APIs + Frontend Components
echo.
echo Components tested:
echo - Resume Upload and Parsing
echo - Job URL Extraction (Firecrawl)
echo - Resume Tailoring (AI)
echo - Interview Prep Generation
echo - Saved Comparisons CRUD
echo - STAR Stories Management
echo - Career Path Designer
echo - Settings and Data Management
echo - Error Handling
echo - UI Responsiveness
echo - Complete User Journeys
echo.
echo ========================================
echo.

cd /d "%~dp0"

echo Installing dependencies (if needed)...
call npm install
echo.

echo Running comprehensive test suite...
echo This will take 5-10 minutes due to AI processing
echo.

call npx playwright test comprehensive-e2e-test.spec.ts --reporter=html,list

echo.
echo ========================================
echo Tests complete!
echo.
echo Opening test report...
call npx playwright show-report

pause
