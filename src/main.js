const yargs = require("yargs");
const {GitlabRegistryCleanupPolicyMgmt} = require("../lib/gitlabUtils");
const errorHandler = require('../errors/errorHandler'); 
const SecretManagerIntegrartion = require("../lib/awsModule");
const {initLogger, LOGGER_LEVEL} = require("../src/logger");
const logger = initLogger("registry-retntion-policy",LOGGER_LEVEL.DEBUG);

// Parse command line options
const parseCommandLineOptions = () => {
  return yargs
    .option("token", {
      describe: "gitlab token",
      type: "string",
    })
    .option("aws-secret", {
      describe: "AWS secret name contains gitlab token",
      type: "string",
    })
    .option("project", {
      describe: "gitlab project id",
      type: "string",
    })
    .option("json-file", {
      describe: "json file path with projects id and settings",
      type: "string",
    })
    .option("excluded-json-file", {
      describe: "excluded json file path with projects id to excluded",
      type: "string"
    })
    .option("dry-run", {
      describe: "if set to true dry run only",
      type: "boolean"
    })
    .conflicts('token', 'aws-secret')
    .epilogue("The following script configures gitlab registry cleanup policy.")
    .check((argv) => {
      const providedFlags = ['project', 'json-file'].filter((flag) => argv[flag]);
    
      if (providedFlags.length !== 1) {
        const msg = 'Please provide exactly one of the following options: project or json-file';
        errorHandler(logger,msg);
      }
    
      return true;
    })
    .argv;
};


const run = async (options) => {
  try {
    let token;
    if("aws-secret" in options){
      logger.info("Getting Gitlab token from AWS secret");
      const secretManagerInstance = new SecretManagerIntegrartion(logger);
      token = await secretManagerInstance.getSecret(options["aws-secret"]);
    }
    else {
      token = options["token"];
    }

    let registryCleanupPolicyMgmt;
    const dryRun = "dry-run" in options ? options["dry-run"] : false;

    if ("excluded-json-file" in options) {
      logger.info("Configure registry retention managgemnt with excludeds");
      logger.info(`Dry run is set to ${options["dry-run"]}`)
      registryCleanupPolicyMgmt = new GitlabRegistryCleanupPolicyMgmt(logger, token, dryRun, options["excluded-json-file"]); 
    }
    else {
      logger.info("Configure registry retention managgemnt");
      registryCleanupPolicyMgmt = new GitlabRegistryCleanupPolicyMgmt(logger, token,dryRun); 
    }
    
    await registryCleanupPolicyMgmt.initialize();
    
    if ("project" in options) {
      logger.info("Setting registry retention for specific project");
      await registryCleanupPolicyMgmt.setCleanupPolicy(options["project"]);
    }
    else if ("json-file" in options) {
      logger.info("Setting registry retention from json file");
      await registryCleanupPolicyMgmt.setCleanupPolicyFromJson(options["json-file"]);
    }
    else {
      logger.error("Missing flags please use one of the following options: json-file, project or all-projects")
    }
   await registryCleanupPolicyMgmt.savedOutputToFile("./logs")
   logger.info("Setting registry retention ended successfully")
  }
  catch (error) {
    errorHandler(logger, error);
  }
};

const main = () => {
  const options = parseCommandLineOptions();
  run(options);
};


main();