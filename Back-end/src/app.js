import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";



// routes
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import renderRoutes from "./routes/render.routes.js";
import frameRoutes from "./routes/frame.routes.js";
//import videoRoutes from "./routes/video.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/render", renderRoutes);
app.use("/api/frames", frameRoutes);
app.use(
  "/frames",
  express.static(path.join(__dirname, "../outputs/frames"))
);
//app.use("/api/video", videoRoutes);


export default app;
