const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const {
  ExpressInstrumentation,
} = require("@opentelemetry/instrumentation-express");
const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { SERVICE_NAME, SERVICE_VERSION } = SemanticResourceAttributes;

const appName = process.env.OTEL_SERVICE_NAME || "app-a";

// This registers all instrumentation packages
registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});

const resource = Resource.default().merge(
  new Resource({ [SERVICE_NAME]: appName, [SERVICE_VERSION]: "0.1.0" })
);

const provider = new NodeTracerProvider({ resource });

const options = { url: process.env.OTEL_TRACE_ENDPOINT };
const exporter = new OTLPTraceExporter(options);
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();
