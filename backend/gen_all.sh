#!/bin/zsh

DEMOS_PATH=${DEMOS_PATH:-../demos}

files=($DEMOS_PATH/pug_*.dem)
for f in $files; do
    go run src/*.go $f > ../frontend/src/matchData/${f:t:r}.json
done
