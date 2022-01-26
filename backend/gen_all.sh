#!/bin/zsh

DEMOS_PATH=${DEMOS_PATH:-../demos}

files=($DEMOS_PATH/pug_*.dem)
rm ../frontend/public/matchInfo.json
for f in $files; do
    matchId=${f:t:r}
    go run src/*.go $f > "$matchId.json"
    cd ../frontend
    node processData.js "$matchId" ../backend/"$matchId.json"
    mv "$matchId.json" public/matches/

    cd ../backend
    rm "$matchId.json"
    if [ "$1" != "--keep-img" ]; then
        rm ${f:t:r}*.png
    fi
done

cd ../frontend
jq -s 'map(.)'  *-meta.json > public/matchInfo.json
rm *-meta.json
cd ../backend
