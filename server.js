const traceSdk = require("./tracing");
const http = require("http");
const express = require("express");
const logger = require("./logger");
const metrics = require("express-prometheus-metrics");
const helmet = require("helmet");
const { createTerminus } = require("@godaddy/terminus");
const Pyroscope = require("@pyroscope/nodejs");
const { default: axios } = require("axios");

const APP_NAME = "app-a";
const PORT = 8080;
const SERVICE_B_URL = process.env.SERVICE_B_URL || "http://127.0.0.1:3000";
const PYROSCOPE_URL = process.env.PYROSCOPE_URL || "http://pyroscope:4040";

const app = express();
const metricsApp = metrics({
  metricsPath: "/metrics",
});

Pyroscope.init({
  serverAddress: PYROSCOPE_URL,
  appName: APP_NAME,
});

Pyroscope.start();

app.use(helmet());
metricsApp.use(helmet());

app.use(metricsApp);

app.get("/", (_, res) => {
  logger.info("Call hello endpoint");
  res.send(`Hello "${APP_NAME}"!`);
});

app.get("/proxy", async (_, res) => {
  logger.info("Call proxy endpoint");
  try {
    const response = await axios.get(`${SERVICE_B_URL}/random`);
    const content = await response.data;
    res.send(content);
  } catch {
    res.sendStatus(500);
  }
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
