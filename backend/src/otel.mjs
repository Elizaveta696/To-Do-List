import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";

const isProd = process.env.NODE_ENV === "production";
const otlpEndpoint =
	process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://lgtm:4318";

let sdk;

if (isProd && process.env.OTEL_SDK_DISABLED !== "true") {
	const traceExporter = new OTLPTraceExporter({
		url: `${otlpEndpoint}/v1/traces`,
	});

	const metricReader = new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter({ url: `${otlpEndpoint}/v1/metrics` }),
		exportIntervalMillis: 10000, // adjust as needed
	});

	const logExporter = new OTLPLogExporter({
		url: `${otlpEndpoint}/v1/logs`,
	});

	sdk = new NodeSDK({
		traceExporter,
		metricReader,
		logRecordProcessor: new BatchLogRecordProcessor(logExporter),
		instrumentations: [getNodeAutoInstrumentations()],
	});

	try {
		sdk.start();
		console.log("✅ OpenTelemetry SDK initialized (production mode)");
	} catch (err) {
		console.error("❌ Error starting OpenTelemetry SDK", err);
	}

	process.on("SIGTERM", () => sdk.shutdown());
	process.on("SIGINT", () => sdk.shutdown());
} else {
	console.log("ℹ️ OpenTelemetry SDK disabled (not production)");
}

export { sdk };
