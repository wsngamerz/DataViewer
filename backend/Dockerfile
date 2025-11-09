FROM alpine:3.16
RUN apk upgrade --no-cache
COPY ./build /
COPY docs/swagger.json /docs/swagger.json
COPY internal/data /internal/data

CMD ["./dataviewer"]
