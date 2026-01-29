const { Insert } = require("./queries.util");
const {
  getNetworkv2,
  InsertStatement,
} = require("../../util/customhelper.util");
const { System } = require("../model/System");
const { logger } = require("../../utils/logger.util");
const { SQLQueryBuilder } = require("../../util/helper.util");

const SQL = new SQLQueryBuilder();

exports.SystemLog = async (logData, error) => {
  const { createdDate, logLevel, source, userid, onSuccess } = logData;
  const ipaddress = await getNetworkv2();
  let logMessage = onSuccess;

  if (error) {
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      logMessage = `Attempted Duplicate Insert`;
    } else {
      logMessage = `Failed Insert - Error: ${error.message.substring(0, 100)}`;
    }
  }

  try {
    let data = [];
    const query = SQL.insert(System.system_logs.tablename, {
      prefix: System.system_logs.prefix,
      columns: System.system_logs.insertColumns,
    }).build();

    data.push([createdDate, logLevel, source, logMessage, userid, ipaddress]);
    await Insert(query, data);
    // logger.info(`System Log added successfully.`)
  } catch (logError) {
    logger.error("CRITICAL: Failed to log transaction outcome:", logError);
  }
};
