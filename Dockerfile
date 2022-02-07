FROM golang:1.17.5 as backendBuilder

WORKDIR /workspace
COPY ./backend/go.mod ./backend/go.sum ./
COPY ./backend/src .
ENV CGO_ENABLED=0
RUN go get && go build -o puggies .

FROM node:lts-alpine as frontendBuilder

WORKDIR /workspace
COPY ./frontend/package.json ./frontend/tsconfig.json ./frontend/yarn.lock ./

RUN yarn install

ENV NODE_ENV=production
ENV REACT_APP_PUGGIES_API_ENDPOINT=/api/v1
ENV PUBLIC_URL=/app

COPY ./frontend/public ./public
COPY ./frontend/src ./src

RUN yarn build

FROM scratch

WORKDIR /
COPY --from=backendBuilder \
     /workspace/puggies \
     /backend/puggies

COPY --from=frontendBuilder \
    /workspace/build \
    /frontend/build

COPY ./puggies-src.tar.gz /frontend/build/
COPY ./LICENSE /frontend/build/

ENV GIN_MODE=release
EXPOSE 9115/tcp
ENTRYPOINT ["/backend/puggies"]
CMD ["serve"]
