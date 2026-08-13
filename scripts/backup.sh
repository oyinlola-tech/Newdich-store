#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="${DB_CONTAINER:-telente-mysql}"
DB_NAME="${DB_NAME:-telente_store}"
DB_USER="${DB_USER:-telente}"

mkdir -p "$BACKUP_DIR"

docker exec "$DB_CONTAINER" mysqldump -u"$DB_USER" -p"${DB_PASSWORD:-telente_password}" "$DB_NAME" \
  | gzip > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Backup saved to $BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete 2>/dev/null || true
echo "Old backups cleaned up."
