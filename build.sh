#!/bin/dash

git archive --format=tar HEAD > "puggies-src.tar.gz"

maj=${PUGGIES_MAJOR_VERSION:-$1}
min=${PUGGIES_MINOR_VERSION:-$2}
pat=${PUGGIES_PATCH_VERSION:-$3}

if [ "$maj" = "" -o "$min" = "" -o "$pat" = "" ]; then
    echo "Precise image version not specified. Tagging as latest"
    docker build . -f Dockerfile \
        -t registry.jayden.codes/puggies:latest
else
    echo "Building and tagging version v$maj.$min.$pat"
    docker build . -f Dockerfile \
        -t registry.jayden.codes/puggies:"$maj" \
        -t registry.jayden.codes/puggies:"$maj.$min" \
        -t registry.jayden.codes/puggies:"$maj.$min.$pat" \
        -t registry.jayden.codes/puggies:latest 
fi
