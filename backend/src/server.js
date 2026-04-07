import app from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
