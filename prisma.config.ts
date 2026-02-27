// import { defineConfig } from "prisma/config";
// import * as dotenv from "dotenv";

// dotenv.config();

// export default defineConfig({
//     datasourceUrl: process.env.DATABASE_URL,
// });

import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL
  }
});