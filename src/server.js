import app from "#app.js";
import { initDb, closeDb } from "#models/pool.js";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 3000;
const PUBLIC_HOST = process.env.RENDER_EXTERNAL_HOSTNAME || `localhost:${PORT}`;

let server;

const startServer = async () => {
  try {
    await initDb();

    server = app.listen(PORT, HOST, (error) => {
      if (error) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.log(`Server listening internally on http://${HOST}:${PORT}/`);
      // eslint-disable-next-line no-console
      console.log(`Publicly accessible at https://${PUBLIC_HOST}`);
    });
  } catch (error) {
    console.error("Failed to start server due to database error:", error);
    process.exit(1); // eslint-disable-line no-process-exit
  }
};

const gracefulShutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Closing HTTP server...`);

  if (!server) {
    await closeDb();
    process.exit(0); // eslint-disable-line no-process-exit
  }

  server.close(async (err) => {
    if (err) {
      console.error("Error closing HTTP server:", err);
    } else {
      // eslint-disable-next-line no-console
      console.log("HTTP server closed.");
    }

    try {
      await closeDb();
    } catch (dbErr) {
      console.error("Error closing database pool:", dbErr);
    } finally {
      process.exit(0); // eslint-disable-line no-process-exit
    }
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();
