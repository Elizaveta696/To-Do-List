// otel.mjs

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";

const OTEL_ENDPOINT =
	process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://lgtm:4318";

const sdk = new NodeSDK({
	serviceName: "backend_service",
	traceExporter: new OTLPTraceExporter({
		url: `${OTEL_ENDPOINT}/v1/traces`,
	}),
	metricReader: new PeriodicExportingMetricReader({
		exporter: new OTLPMetricExporter({
			url: `${OTEL_ENDPOINT}/v1/metrics`,
		}),
		exportIntervalMillis: 5000,
	}),
	logRecordProcessor: new BatchLogRecordProcessor(
		new OTLPLogExporter({
			url: `${OTEL_ENDPOINT}/v1/logs`,
		}),
	),
	instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
globalThis.sdk = sdk; // ← for shutdown

process.on("SIGTERM", () => sdk.shutdown().finally(() => process.exit(0)));
