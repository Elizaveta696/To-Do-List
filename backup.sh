#!/bin/bash
# Get the directory of the script
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

BACKUP_DIR="$BASE_DIR/backups"
SERVICE_NAME="db"
DB_NAME="teamboard"
DB_USER="postgres"
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "Starting backup..."
docker-compose -f "$BASE_DIR/docker-compose.yml" exec -T $SERVICE_NAME pg_dump -U $DB_USER $DB_NAME > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
else
    echo "Backup FAILED"
    exit 1
fi

# Remove backups older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +7 -exec rm {} \;
echo "Old backups cleaned up."
