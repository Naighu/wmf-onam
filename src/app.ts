import express from "express";
import cors from "cors";

import { notFound, errorHandler } from "./middlewares/error_handler";
import routes from "./routes";
import { connectRabbitMQ } from "./services/rabbitmq";
import { connectDB } from "./services/mongodb";




connectDB();

connectRabbitMQ()

const app = express();

app.use(cors());
app.use(express.json());


app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/", routes);

app.use(notFound);
app.use(errorHandler);


export default app;
