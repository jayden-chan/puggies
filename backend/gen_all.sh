#!/bin/zsh

DEMOS_PATH=${DEMOS_PATH:-../demos}

files=($DEMOS_PATH/pug_*.dem)
rm -f ../frontend/public/matchInfo.json

set -e
for f in $files; do
    matchId=${f:t:r}

    # process demo
    go run src/*.go $f > "$matchId.json"
    cd ../frontend

    # post-processing (previously in frontend but moved out to nodejs script)
    node processData.js "$matchId" ../backend/"$matchId.json"
    mv "$matchId.json" public/matches/

    # cleanup
    cd ../backend
    rm "$matchId.json"
    if [ "$1" != "--keep-img" ]; then
        rm ${f:t:r}*.png
    fi
done

cd ../frontend
# combine metadata files into one array in json file
jq -s 'map(.)'  *-meta.json > public/matchInfo.json
rm *-meta.json
cd ../backend
