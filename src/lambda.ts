import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import routes from "./routes";
import { errorHandler, notFound } from "./middlewares/error_handler";
import { connectDB } from "./app";




const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

export const handler = serverless(app);
