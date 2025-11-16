// server.js
import "./otel.mjs"; // Must be imported first to initialize OTEL SDK

import pkg from "@opentelemetry/api";
import cors from "cors";
import { config } from "dotenv";
import express, { json } from "express";
import { connectDB, sequelize } from "./config/db.js";
import { authRouter } from "./routes/authRoutes.js";
import { router } from "./routes/taskRoutes.js";

const { context, trace, metrics, logs } = pkg;

config();
connectDB();

const app = express();
app.use(cors());
app.use(json());

/* ---------------------------
   Service Name
--------------------------- */
const SERVICE_NAME = process.env.SERVICE_NAME || "course-backend";

/* ---------------------------
   Tracer, Meter, Logger
--------------------------- */
const tracer = trace.getTracer(SERVICE_NAME);
const meter = metrics?.getMeter(SERVICE_NAME);
const logger = logs?.getLogger(SERVICE_NAME);

/* ---------------------------
   Safe helpers
--------------------------- */
const safeLoggerEmit = (rec) => {
	if (logger?.emit) logger.emit(rec);
	else {
		const body = rec?.body ?? "<no-body>";
		const attrs = rec?.attributes ?? {};
		const sev = rec?.severityNumber ?? 9;
		console.log(
			`[OTEL-LOG] sev=${sev} body=${body} attrs=${JSON.stringify(attrs)}`,
		);
	}
};

// Metrics
const requestCounter = meter?.createCounter("http.server.requests.count", {
	description: "Count of incoming HTTP requests",
}) ?? { add: () => {} };

const requestLatency = meter?.createHistogram(
	"http.server.requests.duration_ms",
	{
		description: "Request duration in milliseconds",
	},
) ?? { record: () => {} };

/* ---------------------------
   Tracing + Metrics Middleware
--------------------------- */
app.use((req, res, next) => {
	const span = tracer.startSpan("http.server", {
		attributes: {
			"http.method": req.method,
			"http.route": req.path,
			"http.target": req.originalUrl || req.url,
		},
	});

	const startTime = Date.now();
	const ctx = trace.setSpan(context.active(), span);

	context.with(ctx, () => next());

	res.on("finish", () => {
		const duration = Date.now() - startTime;

		// Metrics
		requestCounter.add(1, {
			route: req.path,
			method: req.method,
			status: res.statusCode,
		});
		requestLatency.record(duration, {
			route: req.path,
			method: req.method,
			status: res.statusCode,
		});

		// Span
		span.setAttribute("http.status_code", res.statusCode);
		span.setAttribute("http.duration_ms", duration);
		span.end();

		// Logs
		safeLoggerEmit({
			body: `Handled request ${req.method} ${req.path}`,
			attributes: {
				event: "request_handled",
				route: req.path,
				method: req.method,
				status: res.statusCode,
				duration_ms: duration,
				request_id: req.headers["x-request-id"] || null,
			},
			severityNumber: 9,
		});
	});
});

/* ---------------------------
   Routes
--------------------------- */
app.use("/api/tasks", router);
app.use("/api/auth", authRouter);

/* ---------------------------
   Database sync
--------------------------- */
sequelize.sync({ alter: true }).then(() => console.log("Database synced"));

/* ---------------------------
   Start server
--------------------------- */
const PORT = process.env.PORT || 3000;
const startupSpan = tracer.startSpan("server.start");

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	startupSpan.end();

	safeLoggerEmit({
		body: "Server started",
		attributes: { event: "server_start", port: PORT, service: SERVICE_NAME },
		severityNumber: 9,
	});
});

/* ---------------------------
   404 Handler
--------------------------- */
app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

export default app;
