import "./otel.mjs"; // ← MUST BE FIRST
import pkg from "@opentelemetry/api";
import cors from "cors";
import { config } from "dotenv";
import express, { json } from "express";
import { connectDB, sequelize } from "./config/db.js";
import './models/index.js';
import { authRouter } from "./routes/authRoutes.js";
import { router } from "./routes/taskRoutes.js";
import { teamRouter } from "./routes/teamRoutes.js";

const { trace, context, metrics, logs } = pkg;
const SERVICE_NAME = "backend_service";
const tracer = trace.getTracer(SERVICE_NAME);
const meter = metrics?.getMeter(SERVICE_NAME);
const logger = logs?.getLogger(SERVICE_NAME);

config();

// DO NOT CALL connectDB() HERE

const app = express();
app.use(cors());
app.use(json());

app.get("/", (req, res) => {
	res.json({ status: "OK", service: SERVICE_NAME });
});

/* OTEL + Loki-Compatible Middleware */
const requestCounter = meter?.createCounter("http_server_request_count", {
	description: "Total HTTP requests",
}) ?? { add: () => {} };

const requestDuration = meter?.createHistogram(
	"http_server_request_duration_seconds",
	{ description: "HTTP request duration in seconds" },
) ?? { record: () => {} };

app.use((req, res, next) => {
	const span = tracer.startSpan("http.server", {
		attributes: { "http.method": req.method, "http.route": req.path },
	});
	const start = Date.now();
	const ctx = trace.setSpan(context.active(), span);
	context.with(ctx, () => next());

	res.on("finish", () => {
		const duration = (Date.now() - start) / 1000;

		// Metrics
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

		// Tracing
		span.setAttribute("http.status_code", res.statusCode);
		span.setAttribute("http.duration_s", duration);
		span.end();

		// Logs — OTEL if available, otherwise fallback to stdout
		const logRecord = {
			service: SERVICE_NAME,          // Loki label
			route: req.path,                // Loki label
			method: req.method,             // Loki label
			status: res.statusCode,         // Loki label
			duration_s: duration,
			msg: `Handled request ${req.method} ${req.path}`,
			level: "INFO",
		};

		if (logger?.emit) {
			logger.emit({
				body: logRecord.msg,
				attributes: {
					"service.name": SERVICE_NAME,   // matches collector labels
					route: req.path,
					method: req.method,
					status: res.statusCode,
					duration_s: duration,
				},
				severityNumber: 9,
			});
		} else {
			console.log(JSON.stringify(logRecord));
		}
	});
});

/* ROUTES */
app.use("/api/auth", authRouter);
app.use("/api/tasks", router);
app.get("/health", (req, res) => res.status(200).send("OK"));
app.use("/api", teamRouter);

/* 404 */
app.use((req, res) => {
	res.status(404).json({ message: "Not Found" });
});

/* SERVER START — DB INSIDE */
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
	try {
		await connectDB();
		await sequelize.sync();
		console.log("Database synced");
		console.log(`Server running on port ${PORT}`);
	} catch (err) {
		console.error("Startup failed:", err);
		process.exit(1);
	}
});

/* SHUTDOWN */
const shutdown = async () => {
	console.log("Shutting down...");
	server.close(async () => {
		try {
			if (globalThis.sdk) await globalThis.sdk.shutdown();
			console.log("OTEL SDK shutdown complete");
		} catch (err) {
			console.error("OTEL shutdown failed:", err);
		} finally {
			process.exit(0);
		}
	});
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
