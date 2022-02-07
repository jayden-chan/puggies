#!/bin/dash

git archive --format=tar HEAD > "puggies-src.tar.gz"

maj=${PUGGIES_MAJOR_VERSION:-$1}
min=${PUGGIES_MINOR_VERSION:-$2}
pat=${PUGGIES_PATCH_VERSION:-$3}
registry=${REGISTRY}

if [ "$maj" = "" -o "$min" = "" -o "$pat" = "" ]; then
    echo "Precise image version not specified. Tagging as latest"
    docker build . -f Dockerfile \
        -t "$registry"puggies:latest
else
    echo "Building and tagging as $registry/puggies:$maj.$min.$pat"
    echo

    docker build . -f Dockerfile \
        -t "$registry"puggies:"$maj" \
        -t "$registry"puggies:"$maj.$min" \
        -t "$registry"puggies:"$maj.$min.$pat" \
        -t "$registry"puggies:latest 
fi
