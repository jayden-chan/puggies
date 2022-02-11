#!/bin/sh

# Copyright 2022 Puggies Authors (see AUTHORS.txt)
#
# This file is part of Puggies.
#
# Puggies is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the
# Free Software Foundation, either version 3 of the License, or (at your
# option) any later version.
#
# Puggies is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
# FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
# License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Puggies. If not, see <https://www.gnu.org/licenses/>.

[[ -n $(git status -s) ]] && echo "Error: Git working tree isn't clean" && exit 1
git archive --format=tar HEAD > "puggies-src.tar.gz"

maj=${PUGGIES_MAJOR_VERSION:-$1}
min=${PUGGIES_MINOR_VERSION:-$2}
pat=${PUGGIES_PATCH_VERSION:-$3}
registry=${REGISTRY}

if [ "$maj" = "" -o "$min" = "" -o "$pat" = "" ]; then
    echo "Precise image version not specified. Tagging as latest"
    docker build . -f Dockerfile \
        -t "$registry"puggies:latest

    if [ "$1" = "--push" ]; then
        docker push "$registry"puggies:latest
    fi
else
    echo "Building and tagging as ${registry}puggies:$maj.$min.$pat"
    echo

    docker build . -f Dockerfile \
        -t "$registry"puggies:"$maj" \
        -t "$registry"puggies:"$maj.$min" \
        -t "$registry"puggies:"$maj.$min.$pat" \
        -t "$registry"puggies:latest

    if [ "$4" = "--push" ]; then
        docker push "$registry"puggies:"$maj"
        docker push "$registry"puggies:"$maj.$min"
        docker push "$registry"puggies:"$maj.$min.$pat"
        docker push "$registry"puggies:latest
    fi
fi
