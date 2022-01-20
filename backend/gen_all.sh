#!/bin/zsh

files=(~/Downloads/pug_*.dem)
for f in $files; do
    go run main.go $f > ../frontend/src/matchData/${f:t:r}.json
done
