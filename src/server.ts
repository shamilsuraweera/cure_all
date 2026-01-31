import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  const publicUrl =
    process.env.RENDER_EXTERNAL_URL ?? `http://localhost:${PORT}`;
  console.log(`API running on ${publicUrl}`);
});
