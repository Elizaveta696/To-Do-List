FROM node:22-alpine
WORKDIR /app
COPY ./ /app/
RUN npm install
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["npm", "run", "start"]