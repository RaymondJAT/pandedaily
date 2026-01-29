const mysql = require("mysql2/promise");
const { execSync } = require("child_process");
const { logger } = require("../../utils/logger.util");
const CONFIG = require("../config/config");
require("dotenv").config();
(async () => {
  const dbName = CONFIG[process.env.NODE_ENV].database;
  const dbUser = CONFIG[process.env.NODE_ENV].username;
  const dbPass = CONFIG[process.env.NODE_ENV].password;
  const dbHost = CONFIG[process.env.NODE_ENV].host;
  logger.info(dbName);
  logger.info(dbUser);
  logger.info(dbPass);
  logger.info(dbHost);

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPass,
    });

    const [rows] = await connection.query(`SHOW DATABASES LIKE ?`, [dbName]);

    if (rows.length === 0) {
      await connection.query(`CREATE DATABASE \`${dbName}\`;`);
      logger.info(`✅ Database '${dbName}' created.`);
    } else {
      logger.info(`Database '${dbName}' already exists.`);
    }

    await connection.end();

    logger.info(`📦 Running migrations...`);
    execSync("npx sequelize-cli db:migrate", { stdio: "inherit" });

    logger.info(`🌱 Running seeders...`);
    execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });

    logger.info(`🔄 Generating models from migrations...`);
    // Execute the model generator script
    try {
      require("./generateModels.util");
      logger.info(`✅ Models generated successfully`);
    } catch (error) {
      logger.error(`❌ Error generating models:`, error);
      throw error;
    }

    logger.info(`📋 Generating schemas from models...`);
    // Execute the schema generator script
    try {
      require("./generateSchema.util");
      logger.info(`✅ Schemas generated successfully`);
    } catch (error) {
      logger.error(`❌ Error generating schemas:`, error);
      throw error;
    }

    logger.info(`✅ Database setup complete.`);
  } catch (error) {
    console.error("❌ Error during DB setup:", error);
    process.exit(1);
  }
})();
