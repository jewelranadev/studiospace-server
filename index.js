import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase } from "./config/db.js";
import studioRoutes from "./routes/studioRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Studio API
app.use("/api/studios", studioRoutes);

app.get("/", (req, res) => {
  res.send("StudioSpace Server is Running!");
});

const startServer = async () => {
  await connectToDatabase();


  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();