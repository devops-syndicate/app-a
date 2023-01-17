const traceSdk = require("./tracing");
const http = require("http");
const express = require("express");
const logger = require("./logger");
const app = express();
const promBundle = require("express-prom-bundle");
const { createTerminus } = require("@godaddy/terminus");
const Pyroscope = require('@pyroscope/nodejs');
const PORT = 8080;

Pyroscope.init({
  serverAddress: process.env.PYROSCOPE_URL,
  appName: 'app-a'
});

Pyroscope.start()

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { app: "app-a" },
  promClient: { collectDefaultMetrics: {} },
});

app.use(metricsMiddleware);

app.get("/", (_, res) => {
  logger.info("Call hello endpoint");
  res.send('Hello "app-a"!');
});

const server = http.createServer(app);

async function onShutdown() {
  logger.info("server shuts down");
  await traceSdk.shutdown();
}

createTerminus(server, {
  onShutdown,
  signals: ["SIGINT", "SIGTERM"],
  useExit0: true,
});

server.listen(PORT, () => {
  logger.info(`app-a listening on port ${PORT}`);
});
