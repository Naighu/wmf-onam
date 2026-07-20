import express from "express";
import cors from "cors";

import { notFound, errorHandler } from "./middlewares/error_handler";
import routes from "./routes";
import mongoose from "mongoose";



let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGODB_URI!);

  isConnected = true;
  console.log("MongoDB connected");
}


const app = express();

app.use(cors());
app.use(express.json());


app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);


export default app;
