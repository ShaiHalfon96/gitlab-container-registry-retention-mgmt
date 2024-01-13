const { GIT_URLS, GIT_DEFAULTS} = require("./config/constants");
const GitRestRequests = require("./gitRestRequests");
const errorHandler = require('../errors/errorHandler'); 
const {SetRegistryRetentionPolicyError, GetGitlabGroupError, GetGitlabProjectsError} = require("../errors/appError")
const fs = require("fs");
const readline = require('readline');
const {writeJsonDataToFile,generateTimestamp} = require("./utils");

class GitUtils
{
    constructor(logger, token)
    {
        this.logger = logger;
        this.gitRestRequests = new GitRestRequests(token);
    }

    async setRegistryCleanupPolicy(project,requestBody) {
      try {
        let response;
          response = await this.gitRestRequests.makePutHttpRequest(GIT_URLS.PROJECT(project["id"]), requestBody);
          this.logger.info(`Retention policy for ${project["name"]} project successfully set.`);
          return response;
      }
      catch (error){
        throw new SetRegistryRetentionPolicyError(projectId,error);
      }
    }

    async getProject(projectID){
      try {
        const response = await this.gitRestRequests.makeGetHttpRequest(GIT_URLS.PROJECT(projectID));
        return response[0];
      }
      catch(error)
      {
        throw new GetGitlabProjectsError(error);
      }
    }
    async getProjects(){
      try {
        const response = await this.gitRestRequests.makeGetHttpRequest(GIT_URLS.PROJECTS());
        return response[0];
      }
      catch(error)
      {
        throw new GetGitlabProjectsError(error);
      }
    }

    async getGroup(groupID){
      try {
        const response = await this.gitRestRequests.makeGetHttpRequest(GIT_URLS.GROUP(groupID));
        return response[0];
      }
      catch(error)
      {
        throw new GetGitlabGroupError(groupID,error);
      }
    }
    async getGroupSubgroups(groupID){
      try {
        const response = await this.gitRestRequests.makeGetHttpRequest(GIT_URLS.SUBGROUP(groupID));
        return response;
      }
      catch(error)
      {
        throw new GetGitlabGroupError(groupID,error);
      }
    }
    async getGroupProjects(groupID, recursive=true){
      try {
        const group = await this.getGroup(groupID);
        let projects = group.projects;
        if(recursive)
        {
          const subgroups = await this.getGroupSubgroups(groupID);
          for(const subgroup of subgroups) {
            let subgroupProjects =  await this.getGroup(subgroup.id);
            projects = projects.concat(subgroupProjects.projects);
          }
        }
        const projectIDs = projects.map(project => project.id);
        return projectIDs;
      }
      catch(error)
      {
        throw new GetGitlabGroupError(groupID,error);
      }
    }

}


class GitlabRegistryCleanupPolicyMgmt extends GitUtils{
  constructor(logger, token,dryRun=true, excludedJsonFilePath="")
  {
      super(logger, token)
      this.configuredProjects =[];
      this.excludedProjects = [];
      this.excludedJsonFilePath=excludedJsonFilePath
      this.dryRun = dryRun;
      if(this.dryRun)
      {
        this.logger.info("Running dry run");
      }
  }

  async initialize() {
    if(this.excludedJsonFilePath)
      {
        await this._updateExcluded();
      }
  }

  async _getProjectDetails(projectId) {
    const projectDetails = await this.getProject(projectId);
    return {
      id: projectDetails.id,
      name: projectDetails.name,
      web_url: projectDetails.web_url,
      path_with_namespace: projectDetails.path_with_namespace
    }
  }

  async _updateExcluded(){
    const excludedData = fs.readFileSync(this.excludedJsonFilePath,"utf8");
    this.logger.info("Read excluded file sucessfully")
    const excludedProjects = JSON.parse(excludedData)['projects'];
    const excludedGroups = JSON.parse(excludedData)['groups'];

    this.logger.info("Excluding projects")
    this.excludedProjects = excludedProjects.map(project => project.id);

    this.logger.info("Excluding groups")
    for (let group of excludedGroups){
      let groupProjects = await this.getGroupProjects(group.id, true);
      this.excludedProjects = this.excludedProjects.concat(groupProjects)
    }

    this.excludedProjects = await Promise.all(
      this.excludedProjects.map(async(project)=> {
      return await this._getProjectDetails(project);
    }))
  }
  
  _isExcludedProject(projectID) {
    if (this.excludedProjects !== "undefined")
      return this.excludedProjects.some(project => project["id"] == projectID)
    return false;
  }

  async _updateSetting(project, cleanupDefaultSettings = GIT_DEFAULTS.CLEANUP_POLICY) {
    // Deep copy default setting
    let projectSettings = JSON.parse(JSON.stringify(cleanupDefaultSettings));
  
    if (project.hasOwnProperty("settings")) {
      for (let newSetting in project["settings"]) {
        if (projectSettings.hasOwnProperty(newSetting))
          projectSettings[newSetting] = project["settings"][newSetting];
        }
    }
    return projectSettings;
  }

  async setCleanupPolicy(project, cleanupPolicy =  GIT_DEFAULTS.CLEANUP_POLICY) 
    {
        let requestBody = {container_expiration_policy_attributes: cleanupPolicy,}; 
        try {
            if(this._isExcludedProject(project["id"])) {
              this.logger.info(`Project '${project["path_with_namespace"]}' is excluded and won't be configured.`)
              return;
            }
            this.logger.info(`Setting cleanup policy for '${project["path_with_namespace"]}' project with the following ${JSON.stringify(cleanupPolicy)}`)
            if(this.configuredProjects !== 'undefiend') {
              this.configuredProjects.push(project); 
            }
            if(!this.dryRun) {
              return await super.setRegistryCleanupPolicy(project,requestBody, this.dryRun);
            }
            else {
              this.logger.info(`Dry Run: Retention policy for ${project["path_with_namespace"]} project will be set.`)
            }
        } catch (error) {
            errorHandler(this.logger, error);
        }
    }
  async setCleanupPolicyFromJson(jsonFilePath) {
    try {
      const data = fs.readFileSync(jsonFilePath,"utf8");
      let groups = JSON.parse(data)["groups"];
      let projects = JSON.parse(data)["projects"];
      let allProjects=[];

      if(typeof groups !=='undefined' && groups.length > 0) {
        for (let group of groups){
          allProjects = await super.getGroupProjects(group.id, true);
          allProjects = allProjects.map(project=> {
            if(!group?.settings)
              return {"id":project}
            else
              return {"id":project, "settings": group.settings}
          })
        }
      }
      if(typeof projects !=='undefined') {
        allProjects = allProjects.concat(projects);
      }

      allProjects = await Promise.all(
        allProjects.map(async(project)=> {
        return await this._getProjectDetails(project["id"]);
      }))

      for (let project of allProjects){
        let cleanupSetting = await this._updateSetting(project);
        await this.setCleanupPolicy(project,cleanupSetting );
      }
    }
    catch(error){
      errorHandler(this.logger, error);
    }
  }
  
  async savedOutputToFile(filePath) {
    let configuredOutput = {"Configured": this.configuredProjects};
    let excludedOutput = {"Excluded": this.excludedProjects};
    try {
      const timestamp = generateTimestamp();
      let fileName = `output-${timestamp}.json`
      if(this.dryRun) {
        fileName = `dryrun-output-${timestamp}.json`
      }
      await writeJsonDataToFile(filePath,fileName,{configuredOutput,excludedOutput});
    }
    catch(error){
      errorHandler(this.logger,error)
    }
  }
}
function confirmRunScript(callback) {
  const readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  // Display a confirmation prompt
  readLine.question('Are you sure you want to run the script? (yes/no) ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      callback(); // Call the provided callback if the user confirms
    } else {
      console.log('Script aborted.');
    }

    rl.close();
});
}

module.exports = {GitUtils, GitlabRegistryCleanupPolicyMgmt, confirmRunScript};