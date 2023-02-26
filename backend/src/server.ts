import { logger } from "@utils/logger";
import { app } from "./app";

const port = process.env.PORT ?? 5000;

app.listen(port, () => {
    logger.info("=================================");
    logger.info(`======= ENV: ${process.env.NODE_ENV} =======`);
    logger.info(`🚀 App listening on the port ${port}`);
    logger.info("=================================");
});
