FROM golang:1.17.5 as backendBuilder

WORKDIR /workspace
COPY ./backend/go.mod ./backend/go.sum ./
COPY ./backend/src .
ENV CGO_ENABLED=0
RUN go get && go build -o main .

FROM node:lts-alpine as frontendBuilder

WORKDIR /workspace
COPY ./frontend/package.json ./frontend/tsconfig.json ./frontend/yarn.lock ./

RUN yarn install

ENV NODE_ENV=production

COPY ./frontend/public ./public
COPY ./frontend/src ./src

RUN yarn build

FROM scratch

WORKDIR /workspace
COPY --from=backendBuilder \
     /workspace/main \
     /workspace/backend/main

COPY --from=frontendBuilder \
    /workspace/build \
    /workspace/frontend/build

ENV GIN_MODE=release
EXPOSE 9115/tcp
CMD ["/workspace/backend/main", "serve"]
