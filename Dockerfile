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

FROM golang:1.17.6-alpine as backendBuilder
WORKDIR /workspace

ENV CGO_ENABLED=0
COPY ./backend/go.mod ./backend/go.sum ./

RUN go mod download -x

COPY ./backend/src .
RUN go build -ldflags "-s -w" -o puggies .

# we will grab the SSL certs and timezone data so people
# don't have to mount this from their host machine
RUN apk update --no-cache && apk add --no-cache ca-certificates && apk --no-cache add tzdata

FROM node:lts-alpine as frontendBuilder
WORKDIR /workspace

ENV PUBLIC_URL=/app

COPY ./frontend/package.json ./frontend/tsconfig.json ./frontend/yarn.lock ./

RUN yarn install

ENV NODE_ENV=production

COPY ./frontend/public ./public
COPY ./frontend/src ./src

RUN yarn build

FROM scratch
WORKDIR /

ENV GIN_MODE=release

# None of these variables should need to be changed, the defaults are setup to work
# with the docker container. Only change these if you know what you're doing!!
# ENV PUGGIES_DATA_PATH=/data
# ENV PUGGIES_DEMOS_PATH=/demos
# ENV PUGGIES_STATIC_PATH=/frontend/build
# ENV PUGGIES_ASSETS_PATH=/backend/assets
# ENV PUGGIES_MIGRATIONS_PATH=/backend/migrations
# ENV PUGGIES_FRONTEND_PATH=/app
# ENV PUGGIES_HTTP_PORT=9115
# ENV PUGGIES_DEMOS_RESCAN_INTERVAL_MINUTES=180
# ENV PUGGIES_TRUSTED_PROXIES=""
# ENV PUGGIES_DEBUG="0"

COPY --from=backendBuilder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=backendBuilder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY ./LICENSE /frontend/build/LICENSE.txt
COPY ./backend/assets /backend/assets
COPY ./backend/migrations /backend/migrations

COPY --from=backendBuilder \
     /workspace/puggies \
     /backend/puggies

COPY --from=frontendBuilder \
    /workspace/build \
    /frontend/build

COPY ./puggies-src.tar.gz /frontend/build/

EXPOSE 9115/tcp
ENTRYPOINT ["/backend/puggies"]
CMD ["serve"]
