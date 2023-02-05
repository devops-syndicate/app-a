const opentelemetry = require("@opentelemetry/sdk-node");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  FetchInstrumentation,
} = require("@opentelemetry/instrumentation-fetch");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const {
  WinstonInstrumentation,
} = require("@opentelemetry/instrumentation-winston");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { ZoneContextManager } = require("@opentelemetry/context-zone");
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
  contextManager: new ZoneContextManager(),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new WinstonInstrumentation(),
    new FetchInstrumentation(),
  ],
});
sdk.start();

module.exports = sdk;
