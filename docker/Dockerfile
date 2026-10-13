# The explorEDA team server. Build it from a packed exploreda tarball:
#
#   pnpm --filter exploreda build && pnpm --filter app build
#   cd packages/explorEDA && pnpm pack --pack-destination ../../pack
#   docker build -f docker/Dockerfile pack
#
# The command-line build bundles its own code, so the image needs only Node
# and the package's dist folder: no npm install, no other dependencies.
FROM node:24-slim

LABEL org.opencontainers.image.source="https://github.com/byronwall/explorEDA" \
      org.opencontainers.image.description="explorEDA team server"

ENV NODE_ENV=production \
    EXPLOREDA_DATA=/data \
    EXPLOREDA_PORT=8080

COPY exploreda-*.tgz /tmp/
RUN mkdir -p /opt/exploreda /data \
    && tar -xzf /tmp/exploreda-*.tgz -C /opt/exploreda --strip-components=1 \
    && rm /tmp/exploreda-*.tgz \
    && chown node:node /data

USER node
VOLUME /data
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8080/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]

ENTRYPOINT ["node", "/opt/exploreda/dist/cli/exploreda.js", "server"]
