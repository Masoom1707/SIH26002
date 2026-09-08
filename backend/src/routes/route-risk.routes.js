import { Router } from "express";
import { getRouteRisk } from "../controllers/route-risk.controller.js";

export const routeRiskRouter = Router();

routeRiskRouter.post("/", getRouteRisk);
