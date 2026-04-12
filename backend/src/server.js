import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import ridesRoutes from "./routes/ridesRoutes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import rideRequestRoutes from "./routes/rideRequest.routes.js";
import negotiationRoutes from "./routes/negotiation.routes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv"
import vehicleRoutes from "./routes/vehicleRoutes.js";
import savedRouteRoutes from "./routes/savedRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

connectDB(); // Connect to MongoDB

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/rides", ridesRoutes);

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/saved-routes", savedRouteRoutes);

app.use("/api/requests", rideRequestRoutes);
app.use("/api/negotiations", negotiationRoutes);

app.get("/", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Carpoolio backend is running",
    });
});


app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
});