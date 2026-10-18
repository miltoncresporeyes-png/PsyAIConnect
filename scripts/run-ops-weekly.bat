@echo off
cd /d "C:\workspace\PsyAI"
if not exist "docs\reports" mkdir "docs\reports"
call npm run ops:weekly:pipeline >> "docs\reports\ops_weekly_task.log" 2>&1
