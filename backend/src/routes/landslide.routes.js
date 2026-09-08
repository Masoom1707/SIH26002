import express from "express";
import { getRisk } from "../controllers/landslide.controller.js";

export const landslideRouter = express.Router();

landslideRouter.get("/", getRisk);
