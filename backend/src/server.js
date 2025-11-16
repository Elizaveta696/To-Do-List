// Import the production-aware OpenTelemetry initializer first so exporters
// (OTLP) are configured when `NODE_ENV=production`.
import "../otel.mjs";

// Use default import for the API (CJS-compatible) and extract only the stable pieces.
// Named exports like `logs` may not be present depending on the installed `@opentelemetry/*` packages.
import pkg from "@opentelemetry/api";
import cors from "cors";
import { config } from "dotenv";
import express, { json } from "express";
import { connectDB, sequelize } from "./config/db.js";
import { authRouter } from "./routes/authRoutes.js";
import { router } from "./routes/taskRoutes.js";

const { context, trace } = pkg;

config();
connectDB();

const app = express();
app.use(cors());
app.use(json());

/* ---------------------------
   Safe logger & metrics setup
   --------------------------- */
const SERVICE_NAME = process.env.SERVICE_NAME || "course-backend";

// The `logs` and `metrics` entrypoints are not guaranteed to exist on the installed API package.
// If they are present, use them; otherwise fall back to lightweight no-ops / console fallback.
const logsApi = pkg.logs ?? null;
const metricsApi = pkg.metrics ?? null;

const logger =
	logsApi && typeof logsApi.getLogger === "function"
		? logsApi.getLogger(SERVICE_NAME)
		: null;

const meter =
	metricsApi && typeof metricsApi.getMeter === "function"
		? metricsApi.getMeter(SERVICE_NAME)
		: null;

// No-op / fallback helpers so the rest of the code can call the same methods safely
const safeLoggerEmit = (rec) => {
	if (logger && typeof logger.emit === "function") {
		logger.emit(rec);
	} else {
		// fallback: print a structured-ish message to console for local debugging
		const body = rec?.body ?? "<no-body>";
		const attrs = rec?.attributes ?? {};
		const sev = rec?.severityNumber ?? 9;
		console.log(
			`[OTEL-LOG] sev=${sev} body=${body} attrs=${JSON.stringify(attrs)}`,
		);
	}
};

const createCounterSafe = (name, opts) => {
	if (meter && typeof meter.createCounter === "function") {
		return meter.createCounter(name, opts);
	}
	// lightweight no-op counter
	return { add: () => {} };
};

const createHistogramSafe = (name, opts) => {
	if (meter && typeof meter.createHistogram === "function") {
		return meter.createHistogram(name, opts);
	}
	// lightweight no-op histogram
	return { record: () => {} };
};

/* ---------------------------
   Setup manual tracer, metrics & logger
   --------------------------- */
const tracer = trace.getTracer(SERVICE_NAME);

const requestCounter = createCounterSafe("http.server.requests.count", {
	description: "Count of incoming HTTP requests",
});
const requestLatency = createHistogramSafe("http.server.requests.duration_ms", {
	description: "Request duration in milliseconds",
});

/* ---------------------------
   Tracing + logging + metrics middleware
   --------------------------- */
app.use((req, res, next) => {
	const span = tracer.startSpan("http.server", {
		attributes: {
			"http.method": req.method,
			"http.route": req.path,
			"http.target": req.originalUrl || req.url,
		},
	});

	// attach span to active context for downstream code
	const reqCtx = trace.setSpan(context.active(), span);
	const start = Date.now();

	// metrics: increment counter
	requestCounter.add(1, { route: req.path, method: req.method });

	// bind and continue
	context.with(reqCtx, () => next());

	res.on("finish", () => {
		const dur = Date.now() - start;
		requestLatency.record(dur, {
			route: req.path,
			method: req.method,
			status: res.statusCode,
		});

		span.setAttribute("http.status_code", res.statusCode);
		span.end();

		// structured log for the request (falls back to console if OTel logs api not available)
		safeLoggerEmit({
			body: `Handled request ${req.method} ${req.path}`,
			attributes: {
				event: "request_handled",
				route: req.path,
				method: req.method,
				request_id: req.headers["x-request-id"] || null,
				status: res.statusCode,
				duration_ms: dur,
			},
			severityNumber: 9,
		});
	});
});

app.use("/api/tasks", router);
app.use("/api/auth", authRouter);

sequelize.sync({ alter: true }).then(() => {
	console.log("Database synced");
});

const PORT = process.env.PORT || 3000;

// startup span for server boot
const startupSpan = tracer.startSpan("server.start");
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	startupSpan.end();

	safeLoggerEmit({
		body: "Server started",
		attributes: {
			event: "server_start",
			port: PORT,
			service: SERVICE_NAME,
		},
		severityNumber: 9,
	});
});

app.use((_req, res) => {
	res.status(404).json({ message: "Not Found" });
});

export default app;
