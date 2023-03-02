import errorMiddleware from "@middlewares/error.middleware";
import { logger, stream } from "@utils/logger";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import { connect, set } from "mongoose";
import morgan from "morgan";
import { exit } from "process";
import { indexRouter } from "./routes";
import validateEnv from "./utils/validateEnv";

export const app = express();

app.use(morgan("dev", { stream }));
app.use(cors({ origin: "*", credentials: true }));
app.use(hpp());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorMiddleware);

const mongoDBURI = `mongodb+srv://${validateEnv.MONGODB_USERNAME}:${validateEnv.MONGODB_PASSWORD}@githappenscluster.zpjbjkc.mongodb.net/?retryWrites=true&w=majority`;

connect(mongoDBURI)
    .then((res) => {
        logger.info("Connected to MongoDB");
    })
    .catch((err) => {
        logger.error("Failed to connected to MongoDB");
        exit(1);
    });

// Add routes
app.use("/", indexRouter);
