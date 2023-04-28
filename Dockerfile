FROM node:18

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm i

COPY . .
COPY index.ts index.ts

COPY tsconfig.json tsconfig.json

RUN npm run build

EXPOSE 7008

CMD npm start