#!/bin/bash
# usage: ./dl_player.sh urls...

for I in "$@" ; do
    FN="$(echo "$I" | \
        sed -E \
            -e 's%https://www.youtube.com/s/player/%%' \
            -e "s%^([a-fA-F0-9]+)/(player.*?)\.vflset/(.+?/)*(.+\.js)$%\1_\2-\4%" \
            -e 's/_ias//' \
            -e 's/-[[:lower:]]+_[[:upper:]]+//')"
    wget "$I" -O "youtube_playerjs/$FN" || exit 1
done
