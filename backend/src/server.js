import express from "express";
import ridesRoutes from "./routes/ridesRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001

connectDB()

app.use(express.json());

app.use("/api/rides", ridesRoutes);

app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
});