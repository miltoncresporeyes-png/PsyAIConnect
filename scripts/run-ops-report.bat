@echo off
cd /d "C:\workspace\PsyAI"
if not exist "docs\reports" mkdir "docs\reports"
call npm run ops:report >> "docs\reports\ops_report_task.log" 2>&1
