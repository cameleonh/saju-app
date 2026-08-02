#!/bin/sh
set -eu

REPOSITORY_URL="https://github.com/cameleonh/saju-app.git"
BRANCH="main"
STATE_DIR="/var/lib/saju-app"
SOURCE_DIR="$STATE_DIR/source"
RELEASES_DIR="/var/www/saju-app-releases"
CURRENT_LINK="/var/www/saju-app"
LOCK_FILE="/run/lock/saju-app-update.lock"

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
    install -m 644 deploy/systemd/saju-app.service /etc/systemd/system/saju-app.service
    systemctl daemon-reload
    install -d -o www-data -g www-data -m 750 "$STATE_DIR"
    ln -sfn "$release_root" "$CURRENT_LINK"
    systemctl enable saju-app
    systemctl restart saju-app
    systemctl is-active --quiet saju-app
    curl -fsS http://127.0.0.1:4174/health >/dev/null
); then
    if [ -n "$previous_root" ] && [ -d "$previous_root" ]; then
        ln -sfn "$previous_root" "$CURRENT_LINK"
        systemctl restart saju-app || true
    fi
    exit 1
fi

find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -nr | tail -n +6 | cut -d' ' -f2- | xargs -r rm -rf
