#!/bin/sh
set -e

DB_PATH=${MONGO_DATA_DIR:-/data/db}
mkdir -p "$DB_PATH"

# Default internal URI if not provided
if [ -z "${MONGO_URI}" ]; then
  export MONGO_URI="mongodb://127.0.0.1:27017/stok_takip"
fi

echo "[AIO] Using MONGO_URI=$MONGO_URI"

echo "[AIO] Starting mongod (fork mode) ..."
mongod --dbpath "$DB_PATH" --bind_ip 127.0.0.1 --fork --logpath /var/log/mongod.log --quiet

echo "[AIO] Waiting for Mongo readiness..."
TRIES=0
MAX_TRIES=40
while true; do
  if command -v mongosh >/dev/null 2>&1; then
    mongosh --quiet "$MONGO_URI" --eval 'db.adminCommand({ ping: 1 })' >/dev/null 2>&1 && break || true
  elif command -v mongo >/dev/null 2>&1; then
    mongo --quiet "$MONGO_URI" --eval 'db.adminCommand("ping")' >/dev/null 2>&1 && break || true
  else
    echo "[AIO] Neither mongosh nor mongo client found" >&2
    exit 1
  fi
  TRIES=$((TRIES+1))
  if [ $TRIES -ge $MAX_TRIES ]; then
    echo "[AIO] Mongo did not become ready in time (>$MAX_TRIES s). Last 20 log lines:" >&2
    tail -n 20 /var/log/mongod.log || true
    exit 1
  fi
  echo "[AIO] Waiting ($TRIES) ..."
  sleep 1
done

echo "[AIO] Mongo is ready"

# Simple background log rotation for /var/log/mongod.log
rotate_logs() {
  local file="/var/log/mongod.log"
  local maxSize="${LOG_ROTATE_SIZE:-20M}"
  local backups="${LOG_ROTATE_BACKUPS:-5}"
  while true; do
    if [ -f "$file" ]; then
      # Busybox stat fallback: use wc -c
      sizeBytes=$(wc -c < "$file" 2>/dev/null || echo 0)
      # Convert maxSize (e.g., 20M) to bytes (supports M,G)
      case "$maxSize" in
        *M|*m) limit=$(( ${maxSize%M} * 1024 * 1024 ));;
        *G|*g) limit=$(( ${maxSize%G} * 1024 * 1024 * 1024 )) ;;
        *) limit=${maxSize};; 
      esac
      if [ "$sizeBytes" -gt "$limit" ]; then
        ts=$(date +%Y%m%d-%H%M%S)
        mv "$file" "${file}.${ts}" || true
        touch "$file"
        chmod 644 "$file"
        echo "[AIO][logrotate] Rotated mongod.log at $(date) size=${sizeBytes}B" >&2
        # Prune old backups
        ls -1t ${file}.* 2>/dev/null | tail -n +$((backups+1)) | xargs -r rm -f
      fi
    fi
    sleep "${LOG_CHECK_INTERVAL:-60}"
  done
}

rotate_logs &

exec "$@"
