# syntax=docker/dockerfile:1

FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn install --immutable

COPY . .

# ENV=prod + URL_PROD no Coolify (build args ou variáveis de ambiente do build)
ARG ENV=prod
ARG URL_PROD
ARG NUXT_PUBLIC_API_BASE=http://localhost:4044
ENV ENV=${ENV}
ENV URL_PROD=${URL_PROD}
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}

RUN yarn build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.output ./.output

EXPOSE 4046

CMD ["node", ".output/server/index.mjs"]
