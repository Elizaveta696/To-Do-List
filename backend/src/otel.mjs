// server.js
import "./otel.mjs"; // ← MUST BE FIRST
import pkg from "@opentelemetry/api";
import cors from "cors";
import { config } from "dotenv";
import express, { json } from "express";
import { connectDB, sequelize } from "./config/db.js";
import { authRouter } from "./routes/authRoutes.js";
import { router } from "./routes/taskRoutes.js";
import { teamRouter } from "./routes/teamRoutes.js";

const { trace, context, metrics, logs } = pkg;
const SERVICE_NAME = "backend_service";
const tracer = trace.getTracer(SERVICE_NAME);
const meter = metrics?.getMeter(SERVICE_NAME);
const logger = logs?.getLogger(SERVICE_NAME);

config();

const app = express();
app.use(cors());
app.use(json());

// OTEL metrics
const requestCounter = meter?.createCounter("http_server_request_count", {
	description: "Total HTTP requests",
}) ?? { add: () => {} };

const requestDuration = meter?.createHistogram(
	"http_server_request_duration_seconds",
	{ description: "HTTP request duration in seconds" },
) ?? { record: () => {} };

// OTEL middleware — Tracing, Metrics, Logs
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

		// Logs
		if (logger?.emit) {
			logger.emit({
				body: `Handled request ${req.method} ${req.path}`,
				severityNumber: 9, // INFO
				attributes: {
					"service.name": SERVICE_NAME, // must match collector label
					route: req.path,
					method: req.method,
					status: res.statusCode,
					duration_s: duration,
				},
			});
		}
	});
});

// Routes
app.use("/api/tasks", router);
app.use("/api/auth", authRouter);
app.get("/health", (req, res) => res.status(200).send("OK"));
app.use("/api", teamRouter);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ message: "Not Found" });
});

// Server start
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
	try {
		await connectDB();
		await sequelize.sync({ alter: true });
		console.log("Database synced");
		console.log(`Server running on port ${PORT}`);
	} catch (err) {
		console.error("Startup failed:", err);
		process.exit(1);
	}
});

// Graceful shutdown
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
