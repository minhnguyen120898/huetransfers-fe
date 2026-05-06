# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app
COPY --from=build /app/dist/booking-management-fe/browser /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf /etc/nginx/nginx.conf.template

# KEY FIX: Use '$$PORT' to tell envsubst to ONLY replace $PORT (not $uri)
CMD ["/bin/sh", "-c", "envsubst '$$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && cat /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
