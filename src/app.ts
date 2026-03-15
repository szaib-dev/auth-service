import express from "express";
import type { Application } from "express";

const app: Application = express()

app.use(express.json());

export default app