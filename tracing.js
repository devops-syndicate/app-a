const opentelemetry = require("@opentelemetry/sdk-node");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const logger = require("./logger");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { SERVICE_NAME, SERVICE_VERSION } = SemanticResourceAttributes;

const appName = process.env.OTEL_SERVICE_NAME || "app-a";

const resource = Resource.default().merge(
  new Resource({ [SERVICE_NAME]: appName, [SERVICE_VERSION]: "0.1.0" })
);

const options = {
  endpoint: process.env.OTEL_EXPORTER_JAEGER_HTTP_ENDPOINT,
};

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new JaegerExporter(options),
  resource,
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});
sdk
  .start()
  .then(() => logger.info("Tracing initialized"))
  .catch((error) => logger.error("Error initializing tracing", error));

module.exports = sdk;
