FROM composer:1

RUN apk add --no-cache wget
WORKDIR /app
CMD ["./update.sh"]
