import "dotenv/config";
import express from "express";
import cors from "cors";
import weatherRoutes from "./routes/weatherRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import aiRoutes
    from "./routes/aiRoutes.js";

import riskRoutes
    from "./routes/riskRoutes.js";
import {
    errorHandler,
} from "./middleware/errorHandler.js";


const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://agrin-ai-frontend.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());


app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "AgriN API is running"
    });

});


app.use(
    "/api/farmers",
    farmerRoutes
);

app.use(
    "/api/weather",
    weatherRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);

app.use(
    "/api/risk",
    riskRoutes
);

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});

app.use(
    errorHandler
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriN API is running successfully 🚜🌱",
  });
});

app.listen(PORT, () => {
    console.log(
        `AgriN server running on port ${PORT}`
    );
});