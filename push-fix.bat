@echo off
cd /d "C:\Users\drake\Claude Cowork\DOMAINS\EM Feed\emfeed\sessions\jolly-sharp-johnson\mnt\outputs\em-feed"
del .git\index.lock 2>nul
git add -A
git commit -m "Fix FeedCard interface and rss exports"
git push
echo.
echo Done! Check Vercel for build status.
pause
