#!/bin/bash
# SIMT MTs Server Start Script with Auto-Restart
cd /home/z/my-project

# Ensure Prisma Client is generated
npx prisma generate --no-hint 2>/dev/null

echo "Starting SIMT MTs server with auto-restart..."
RESTART_COUNT=0
MAX_RESTARTS=10

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
  echo "[$(date)] Starting server (attempt $((RESTART_COUNT+1))/$MAX_RESTARTS)..."
  NODE_ENV=production NODE_OPTIONS="--max-old-space-size=1024" npx next start -p 3000
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE"
  
  if [ $EXIT_CODE -eq 0 ]; then
    echo "Clean shutdown, not restarting."
    break
  fi
  
  RESTART_COUNT=$((RESTART_COUNT+1))
  echo "Restarting in 3 seconds..."
  sleep 3
done

echo "Max restarts reached or clean shutdown."
