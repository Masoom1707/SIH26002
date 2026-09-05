import dotenv from "dotenv"
dotenv.config({quiet:true});

import express from "express"
import helmet from "helmet";
import cors from "cors"

import { dbConnection } from "./src/config/dbConnection.js";
import { vehicleRouter } from "./src/routes/vehicle.routes.js";
import errorMiddleware from "./src/middleware/errorMiddleware.js";


const app = express();

const allowedOrigins = [process.env.CLIENT_URL];
app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);


app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.disable("x-powered-by");


app.use("/api/vehicles", vehicleRouter);

app.use(errorMiddleware)



const PORT = process.env.PORT || 1707

const startServer = async () => {
  try {
    await dbConnection();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};


startServer();