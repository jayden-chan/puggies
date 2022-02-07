#!/bin/sh

git archive --format=tar HEAD > "puggies-src.tar.gz"
cd frontend
PUBLIC_URL=/ yarn build
cp ../LICENSE build
cp ../puggies-src.tar.gz build
cd build
cp index.html 200.html
surge . --domain=pugs.jayden.codes
