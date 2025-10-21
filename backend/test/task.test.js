import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../src/server.js"; // adjust if your app export is elsewhere
import { sequelize } from "../src/config/db.js";
import {Task} from "../src/models/Task.js";

let token; // JWT

describe("Task API Integration Tests", () => {

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        const userData = { username: "testuser", password: "testpassword" };

        // register

        await request(app).post("/api/auth/register").send(userData);

        // login

        const loginRes = await request(app).post("/api/auth/login").send(userData);

        token = loginRes.body.accessToken;
        expect(token).toBeDefined();
    })

    afterAll(async () => {
        await Task.destroy({ where: {} });
        await sequelize.close();
    })

    it("should return a list", async () => {
        const res = await request(app).get("/api/tasks").set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(0);
    });

    it("should create a new task", async () => {
        const newTask = {title: "Test Task", description:"Testsss"};
        const res = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send(newTask);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.title).toBe(newTask.title);
        expect(res.body.description).toBe(newTask.description);
    });

    it("should fetch the created task", async () => {
        const res = await request(app).get("/api/tasks").set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toHaveProperty("title", "Test Task");
    });

    it("should edit the created task", async () => {
        const tasks = await Task.findAll();
        const taskId = tasks[0].id;

        const res = await request(app).put(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${token}`).send({ completed: true });
        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(true);
    });

    it("should delete the task", async () => {
        const tasks = await Task.findAll();
        const taskId = tasks[0].id;

        const res = await request(app).delete(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(200);

        const taskCheck = await request(app).get("/api/tasks").set("Authorization", `Bearer ${token}`);
        expect(taskCheck.body).toHaveLength(0);
    });
});