<<<<<<< HEAD
import { logger } from "../logs/logger.js";
=======
import {logger} from "../logs/logger.js";
>>>>>>> 88ad075df6367fa41ce9e48d8eaa3a7bfa5c2e2d

export const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  res.status(500).json({
    message: "Something went wrong",
  });
};
