// otel.mjs

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";

const SERVICE_NAME = process.env.SERVICE_NAME || "backend_service";

const OTEL_TEMPO =
	process.env.OTEL_TEMPO_ENDPOINT || "http://tempo:4318/v1/traces";
const OTEL_LOKI = process.env.OTEL_LOKI_ENDPOINT || "http://loki:4318/v1/logs";
const OTEL_PROM =
	process.env.OTEL_PROM_ENDPOINT || "http://mimir:4318/v1/metrics";

const traceExporter = new OTLPTraceExporter({ url: OTEL_TEMPO });

const metricReader = new PeriodicExportingMetricReader({
	exporter: new OTLPMetricExporter({ url: OTEL_PROM }),
	exportIntervalMillis: 10000,
});

const logExporter = new OTLPLogExporter({ url: OTEL_LOKI });

export const sdk = new NodeSDK({
	serviceName: SERVICE_NAME,
	traceExporter,
	metricReader,
	logRecordProcessor: new BatchLogRecordProcessor(logExporter),
	instrumentations: [getNodeAutoInstrumentations()],
});

if (process.env.NODE_ENV === "production") {
	sdk
		.start()
		.then(() =>
			console.log("✅ OpenTelemetry SDK started (traces + metrics + logs)"),
		)
		.catch((err) => console.error("❌ OTEL SDK start failed", err));

	process.on("SIGTERM", () => sdk.shutdown());
	process.on("SIGINT", () => sdk.shutdown());
}
