#!/bin/zsh

DEMOS_PATH=${DEMOS_PATH:-../demos}

files=($DEMOS_PATH/*.dem)
rm -f ../frontend/public/matchInfo.json

set -e
for f in $files; do
    matchId=${f:t:r}

    outPath="../frontend/public/matches/$matchId.json"
    go run src/*.go parse $f > "$outPath"
    jq '.meta' "$outPath" > "$matchId-meta.json"

    if [ "$1" != "--keep-img" ]; then
        rm ${f:t:r}*.png
    fi
done

# combine metadata files into one array in json file
jq -s 'map(.)'  *-meta.json > ../frontend/public/matchInfo.json
rm *-meta.json
