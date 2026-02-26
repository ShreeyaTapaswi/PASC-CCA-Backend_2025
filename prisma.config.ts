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
    url: "postgresql://neondb_owner:npg_exLqB8RkUa4H@ep-dry-cell-a1bhu2td-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
  },
});
