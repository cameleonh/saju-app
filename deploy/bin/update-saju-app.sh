#!/bin/sh
set -eu

REPOSITORY_URL="https://github.com/cameleonh/saju-app.git"
BRANCH="main"
STATE_DIR="/var/lib/saju-app"
SOURCE_DIR="$STATE_DIR/source"
RUNTIME_DIR="$STATE_DIR/runtime"
RELEASES_DIR="/var/www/saju-app-releases"
CURRENT_LINK="/var/www/saju-app"
LOCK_FILE="/run/lock/saju-app-update.lock"

switch_link() {
    target="$1"
    temporary_link="${CURRENT_LINK}.next"
    rm -f "$temporary_link"
    ln -s "$target" "$temporary_link"
    mv -Tf "$temporary_link" "$CURRENT_LINK"
}

wait_for_health() {
    attempts=0
    while [ "$attempts" -lt 30 ]; do
        if curl -fsS http://127.0.0.1:4174/health >/dev/null; then
            return 0
        fi
        attempts=$((attempts + 1))
        sleep 1
    done
    return 1
}

umask 022
install -d -o root -g root -m 755 "$STATE_DIR" "$RELEASES_DIR"
exec 9>"$LOCK_FILE"
flock -n 9 || exit 0

if [ ! -d "$SOURCE_DIR/.git" ]; then
    rm -rf "$SOURCE_DIR"
    git clone --depth=1 --branch "$BRANCH" "$REPOSITORY_URL" "$SOURCE_DIR"
else
    git -C "$SOURCE_DIR" fetch --depth=1 origin "$BRANCH"
    git -C "$SOURCE_DIR" reset --hard "origin/$BRANCH"
    git -C "$SOURCE_DIR" clean -fdx
fi

commit="$(git -C "$SOURCE_DIR" rev-parse "origin/$BRANCH")"
release_root="$RELEASES_DIR/$commit"
current_root="$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)"

if [ "$current_root" = "$release_root" ]; then
    exit 0
fi

previous_root="$current_root"
rm -rf "$release_root"
install -d -o root -g root -m 755 "$release_root"
git -C "$SOURCE_DIR" archive "$commit" | tar -x -C "$release_root"
chown -R root:root "$release_root"

if ! (
    cd "$release_root"
    npm ci --omit=dev --ignore-scripts
    if [ -f /etc/saju-app-migrate.env ]; then
        set -a
        . /etc/saju-app-migrate.env
        set +a
        node scripts/migrate-postgres.mjs
    fi
    install -m 644 deploy/systemd/saju-app.service /etc/systemd/system/saju-app.service
    install -m 644 deploy/systemd/saju-app-deletion-finalize.service /etc/systemd/system/saju-app-deletion-finalize.service
    install -m 644 deploy/systemd/saju-app-deletion-finalize.timer /etc/systemd/system/saju-app-deletion-finalize.timer
    install -m 644 deploy/apache/saju.blog.conf /etc/apache2/sites-available/saju.blog.conf
    install -m 644 deploy/apache/saju.blog-le-ssl.conf /etc/apache2/sites-available/saju.blog-le-ssl.conf
    apache2ctl configtest
    systemctl daemon-reload
    systemctl stop saju-app || true
    install -d -o www-data -g www-data -m 750 "$RUNTIME_DIR"
    if [ -f "$STATE_DIR/saju.sqlite" ] && [ ! -e "$RUNTIME_DIR/saju.sqlite" ]; then
        mv "$STATE_DIR/saju.sqlite" "$RUNTIME_DIR/saju.sqlite"
    fi
    for database_file in "$RUNTIME_DIR"/saju.sqlite*; do
        [ -e "$database_file" ] || continue
        chown www-data:www-data "$database_file"
        chmod 640 "$database_file"
    done
    switch_link "$release_root"
    systemctl enable saju-app
    systemctl enable --now saju-app-deletion-finalize.timer
    systemctl restart saju-app
    systemctl is-active --quiet saju-app
    wait_for_health
    systemctl reload apache2
    install -m 755 deploy/bin/update-saju-app.sh /usr/local/sbin/saju-app-update
    install -m 755 deploy/bin/configure-managed-data.sh /usr/local/sbin/saju-app-configure-managed-data
); then
    if [ -n "$previous_root" ] && [ -d "$previous_root" ]; then
        switch_link "$previous_root"
        systemctl restart saju-app || true
    fi
    exit 1
fi

find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -nr | tail -n +6 | cut -d' ' -f2- | xargs -r rm -rf
