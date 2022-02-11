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
