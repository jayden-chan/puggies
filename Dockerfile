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

COPY ./backend/maps /backend/maps

COPY --from=frontendBuilder \
    /workspace/build \
    /frontend/build

COPY ./puggies-src.tar.gz /frontend/build/
COPY ./LICENSE /frontend/build/LICENSE.txt

ENV GIN_MODE=release

# do not change this without also changing PUBLIC_URL above
ENV PUGGIES_FRONTEND_PATH=/app

# do not change this without also updating the frontend COPY
# commands above (not sure why anyone would want to change this though)
ENV PUGGIES_STATIC_PATH=/frontend/build

EXPOSE 9115/tcp
ENTRYPOINT ["/backend/puggies"]
CMD ["serve"]
