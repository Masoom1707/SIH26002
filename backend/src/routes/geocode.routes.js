import { Router } from "express";
import { getGeocode } from "../controllers/geocode.controller.js";

export const geocodeRouter = Router();

geocodeRouter.get("/", getGeocode);
