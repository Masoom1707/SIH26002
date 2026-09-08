import { Router } from "express";
import { getAlerts } from "../controllers/alert.controller.js";

export const alertRouter = Router();

alertRouter.get("/", getAlerts);
