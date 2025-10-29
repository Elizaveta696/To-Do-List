import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const authRouter = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
	process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
let refreshTokens = [];

// register
authRouter.post("/register", async (req, res) => {
	try {
		const { username, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({ username, password: hashedPassword });
		res.status(201).json({
			message: "User created!!",
			user: { id: user.id, username: user.username },
		});
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
});

// login
authRouter.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ where: { username } });
	if (!user) return res.status(404).json({ message: "User not found" });

	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid)
		return res.status(401).json({ message: " Invalid password :(" });

	const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});
	const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
		expiresIn: "30d",
	});
	refreshTokens.push(refreshToken);

	res.json({ accessToken, refreshToken });
});

// refresh token
authRouter.post("/token", (req, res) => {
	const { token } = req.body;
	if (!token) return res.sendStatus(401);
	if (!refreshTokens.includes(token)) return res.sendStatus(403);

	jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		const accessToken = jwt.sign({ userId: user.userId }, ACCESS_TOKEN_SECRET, {
			expiresIn: "15m",
		});
		res.json({ accessToken });
	});
});

// logout
authRouter.post("/logout", (req, res) => {
	const { token } = req.body;
	refreshTokens = refreshTokens.filter((t) => t !== token);
	res.json({ message: "Logged out" });
});
