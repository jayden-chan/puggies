#!/bin/sh

if [ "$1" = "" ]; then
    echo "specify path to demos folder"
    exit 1
fi

git archive --format=tar HEAD > "puggies-src.tar.gz"
cd frontend
PUBLIC_URL=/ yarn build
cd ../backend
go run src/*.go parseAll "$1" ../frontend/build --incremental

cd frontend
cp ../LICENSE build/LICENSE.txt
cp ../puggies-src.tar.gz build
cd build
cp index.html 200.html
cd ..

echo "Static frontend site is built at ./frontend/build"
