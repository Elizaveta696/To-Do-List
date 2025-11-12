import { config } from "dotenv";
import { Sequelize } from "sequelize";

config();

export const sequelize = new Sequelize(
	process.env.POSTGRES_DB,
	process.env.POSTGRES_USER,
	process.env.POSTGRES_PASSWORD,
	{
		host: process.env.POSTGRES_HOST || "db",
		dialect: "postgres",
	},
);

export const connectDB = async () => {
	try {
		await sequelize.authenticate();
		console.log("PostgreSQL connected");
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
