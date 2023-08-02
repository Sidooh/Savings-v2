# Build Stage 1
# This build created a staging docker image
#
FROM node:lts-slim as build

WORKDIR /app

COPY ["package.json", "yarn.lock", ".yarnrc.yml", "./"]
COPY [".yarn/plugins/", "./.yarn/plugins/"]
COPY [".yarn/releases/", "./.yarn/releases/"]

RUN yarn

COPY ["src/", "./src/"]
COPY ["tsconfig.json", "."]

RUN yarn build



# Build Stage 2
# This build takes the production build from staging build
#
FROM gcr.io/distroless/nodejs:16
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist .

EXPOSE 8005

CMD ["index.js"]
