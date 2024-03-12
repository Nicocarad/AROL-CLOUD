import express from "express";
import morgan from "morgan";
import publicRouter from "./routes/PublicRoutes";
import machineryRoutes from "./routes/MachineriesRoutes";
import User from "./entities/User";
import cors from "cors";
import companyRoutes from "./routes/CompaniesRoutes";
import dashboardRoutes from "./routes/DashboardsRoutes";
import documentsRoutes from "./routes/DocumentsRoutes";
import userRoutes from "./routes/UsersRoutes";

declare global {
  namespace Express {
    interface Request {
      principal: User;
    }
  }
}

require("dotenv").config({ path: __dirname + "/./../.env" });

const port = 8080;
const server = express();

server.use(morgan("dev"));
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/public", publicRouter);
server.use("/users", userRoutes);
server.use("/machinery", machineryRoutes);
server.use("/company", companyRoutes);
server.use("/dashboard", dashboardRoutes);
server.use("/documents", documentsRoutes);

// catch 404 and forward to error handler
server.use(function (req: express.Request, res: express.Response) {
  res.status(404).json({
    message: "No such route exists",
  });
});

// error handler
server.use(function (err: any, req: express.Request, res: express.Response) {
  res.status(err.status || 500).json({
    message: err.message || "An error occurred",
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

// timestreamIngestion.timestreamIngestion()

module.exports = server;
