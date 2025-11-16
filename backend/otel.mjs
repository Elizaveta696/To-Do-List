import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
// otel.mjs
import { NodeSDK } from "@opentelemetry/sdk-node";

const isProd = process.env.NODE_ENV === "production";
const otlp = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://lgtm:4318";

const sdk = new NodeSDK({
	traceExporter: isProd
		? new OTLPTraceExporter({ url: `${otlp}/v1/traces` })
		: undefined,
	metricReader: isProd
		? new PeriodicExportingMetricReader({
				exporter: new OTLPMetricExporter({ url: `${otlp}/v1/metrics` }),
				exportIntervalMillis: 10000,
			})
		: undefined,
	// logs likewise: only configure exporter in prod
	instrumentations: [getNodeAutoInstrumentations()],
});

if (process.env.OTEL_SDK_DISABLED !== "true") {
	sdk.start();
}
