#!/bin/sh

git archive --format=tar HEAD > "puggies-src.tar.gz"
docker build . -f Dockerfile -t registry.jayden.codes/puggies
