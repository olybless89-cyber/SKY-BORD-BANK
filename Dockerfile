FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (ignore engine warnings, force fresh install)
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy source
COPY . .

# Build
RUN node_modules/.bin/vite build

# Production stage - serve with nginx
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing (all routes serve index.html)
RUN printf 'server {\n\
  listen $PORT;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf.template

# Use envsubst to fill in $PORT at runtime
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
