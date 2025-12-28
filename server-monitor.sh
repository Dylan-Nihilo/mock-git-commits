#!/bin/bash

PORT=3000
MAX_RETRIES=3
LOG_FILE="server-monitor.log"
PROJECT_DIR="/Users/dylanthomas/Desktop/projects/MockGitCommits"

cd "$PROJECT_DIR"

restart_server() {
  local attempt=1
  
  while [ $attempt -le $MAX_RETRIES ]; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Attempt $attempt/$MAX_RETRIES: Starting server..." >> "$LOG_FILE"
    
    npm run dev > /dev/null 2>&1 &
    SERVER_PID=$!
    
    sleep 5
    
    if lsof -i :$PORT | grep LISTEN > /dev/null 2>&1; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server started successfully (PID: $SERVER_PID)" >> "$LOG_FILE"
      echo "✓ Server running on http://localhost:$PORT"
      return 0
    else
      kill $SERVER_PID 2>/dev/null
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server start failed (attempt $attempt/$MAX_RETRIES)" >> "$LOG_FILE"
      ((attempt++))
    fi
  done
  
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] CRITICAL: Failed to start server after $MAX_RETRIES attempts" >> "$LOG_FILE"
  echo "❌ Failed to start server after $MAX_RETRIES attempts"
  return 1
}

check_server() {
  if ! lsof -i :$PORT | grep LISTEN > /dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Server down, attempting restart..." >> "$LOG_FILE"
    restart_server
  fi
}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting server monitor..." >> "$LOG_FILE"
check_server

while true; do
  sleep 10
  check_server
done
