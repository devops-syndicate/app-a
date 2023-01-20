const traceSdk = require("./tracing");
const http = require("http");
const express = require("express");
const logger = require("./logger");
const app = express();
const metrics = require("express-prometheus-metrics");
const { createTerminus } = require("@godaddy/terminus");
const Pyroscope = require("@pyroscope/nodejs");
const APP_NAME = "app-a";
const PORT = 8080;

Pyroscope.init({
  serverAddress: process.env.PYROSCOPE_URL || "http://pyroscope:4040",
  appName: APP_NAME,
});

Pyroscope.start();

app.use(
  metrics({
    metricsPath: "/metrics",
  })
);

app.get("/", (_, res) => {
  logger.info("Call hello endpoint");
  res.send(`Hello "${APP_NAME}"!`);
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
  logger.info(`${APP_NAME} listening on port ${PORT}`);
});
