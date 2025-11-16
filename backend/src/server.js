// server.js
import "./otel.mjs"; // OTEL SDK initialized first
import pkg from "@opentelemetry/api";
import cors from "cors";
import express, { json } from "express";

const { trace, context, metrics, logs } = pkg;

const SERVICE_NAME = "backend_service";
const tracer = trace.getTracer(SERVICE_NAME);
const meter = metrics?.getMeter(SERVICE_NAME);
const logger = logs?.getLogger(SERVICE_NAME);

const app = express();
app.use(cors());
app.use(json());

// Metrics
const requestCounter = meter?.createCounter("http_server_request_count", {
	description: "Total HTTP requests",
}) ?? { add: () => {} };

const requestDuration = meter?.createHistogram(
	"http_server_request_duration_seconds",
	{
		description: "HTTP request duration in seconds",
	},
) ?? { record: () => {} };

// Logging helper
const safeLoggerEmit = (rec) => {
	if (logger?.emit) logger.emit(rec);
	else console.log("[OTEL-LOG]", rec);
};

// Middleware: tracing, metrics, logs
app.use((req, res, next) => {
	const span = tracer.startSpan("http.server", {
		attributes: { "http.method": req.method, "http.route": req.path },
	});
	const start = Date.now();
	const ctx = trace.setSpan(context.active(), span);

	context.with(ctx, () => next());

	res.on("finish", () => {
		const duration = (Date.now() - start) / 1000; // seconds
		requestCounter.add(1, {
			route: req.path,
			method: req.method,
			status: res.statusCode,
		});
		requestDuration.record(duration, {
			route: req.path,
			method: req.method,
			status: res.statusCode,
		});

		span.setAttribute("http.status_code", res.statusCode);
		span.setAttribute("http.duration_s", duration);
		span.end();

		safeLoggerEmit({
			body: `Handled request ${req.method} ${req.path}`,
			attributes: {
				service_name: SERVICE_NAME,
				route: req.path,
				method: req.method,
				status: res.statusCode,
				duration_s: duration,
			},
			severityNumber: 9,
		});
	});
});
