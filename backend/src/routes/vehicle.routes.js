import express from "express";
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle
} from "../controllers/vechile.controller.js";

export const vehicleRouter = express.Router();

vehicleRouter.post("/", createVehicle);
vehicleRouter.get("/", getVehicles);
vehicleRouter.put("/:id", updateVehicle);
vehicleRouter.delete("/:id", deleteVehicle);
