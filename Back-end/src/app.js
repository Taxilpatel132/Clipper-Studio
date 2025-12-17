import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


// routes
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import renderRoutes from "./routes/render.routes.js";
//import videoRoutes from "./routes/video.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/render", renderRoutes);
//app.use("/api/video", videoRoutes);


export default app;
