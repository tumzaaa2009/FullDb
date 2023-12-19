var express = require("express");
var router = express.Router();
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);
const fs = require("fs").promises;

// Database configuration
const dbConfig = {
  host: "209.15.108.231",
  user: "ket4",
  password: "kethealth4",
};

// Backup directory
const backupDirectory = "./backupshie/";

async function backupDatabase(databaseName) {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${(
    currentDate.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
  const backupFolder = `${backupDirectory}${formattedDate}/`;
  const backupFile = `${backupFolder}${databaseName}_backup.sql`;

  // Construct the mysqldump command
const command = `mysqldump --host=${dbConfig.host} --user=${dbConfig.user} --password=${dbConfig.password} --databases ${databaseName} --skip-column-statistics > ${backupFile}`;

  try {
    // Create the backup folder if it doesn't exist
    await fs.mkdir(backupFolder, { recursive: true });

    // Execute the mysqldump command
    const { stdout, stderr } = await execAsync(command);
    console.log(`Backup successful for ${databaseName}. Output: ${stdout}`);
  } catch (error) {
    console.error(`Backup failed for ${databaseName}: ${error.stderr}`);
  }
}

// Function to get the list of databases
async function getDatabaseList() {
  try {
    const { stdout } = await execAsync(
      `mysql --host=${dbConfig.host} --user=${dbConfig.user} --password=${dbConfig.password} -e "SHOW DATABASES;" | grep -Ev "(Database|information_schema|performance_schema|mysql)"`
    );
    const databaseList = stdout.split("\n").filter((db) => db !== "");
    return databaseList;
  } catch (error) {
    console.error(`Error fetching database list: ${error.stderr}`);
    return [];
  }
}

// Main function to backup all databases
async function backupAllDatabases() {
  const databases = await getDatabaseList();

  if (databases.length === 0) {
    console.log("No databases found for backup.");
    return "No databases found for backup.";
  }

  console.log(`Backing up ${databases.length} databases...`);

  // Create the backup directory if it doesn't exist
  try {
    await fs.mkdir(backupDirectory, { recursive: true });
  } catch (error) {
    console.error(`Error creating backup directory: ${error}`);
    return `Error creating backup directory: ${error}`;
  }

  // Backup each database
  for (const database of databases) {
    console.log(database);
    await backupDatabase(database);
  }

  console.log("Backup process completed.");
  return "Backup process completed.";
}

// Route to trigger backup
router.get("/backupshie", async function (req, res, next) {
  const result = await backupAllDatabases();
  res.send(result);
});

module.exports = router;
