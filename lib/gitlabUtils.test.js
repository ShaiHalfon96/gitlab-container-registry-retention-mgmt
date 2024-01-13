const { default: expect } = require("expect");
const {GitUtils,GitlabRegistryCleanupPolicyMgmt} = require("./gitlabUtils");
const SecretManagerIntegrartion = require("./awsModule");
const {initLogger, LOGGER_LEVEL} = require("../src/logger");
const logger = initLogger("registry-retntion-policy-test", LOGGER_LEVEL.INFO);



test('should get group projects IDs', async () => {
    const secretName = "<aws-secret-name>";
    const secretManagerInstance = new SecretManagerIntegrartion();
    const gitToken = await secretManagerInstance.getSecret(secretName);

    const gitUtils = new GitUtils(logger, gitToken);
    const groupID = '<group-id>';
    const projectsIDs = await gitUtils.getGroupProjects(groupID);
    expect(projectsIDs).toBeInstanceOf(Array);
    expect(projectsIDs.length).toBeGreaterThan(0);
});

test('should set registery cleanup policy', async () => {
    const secretName = "<aws-secret-name";
    const secretManagerInstance = new SecretManagerIntegrartion();
    const gitToken = await secretManagerInstance.getSecret(secretName);

    const gitProjectID = '<test-project-id>';
    const registryCleanupPolicyMgmt = new GitlabRegistryCleanupPolicyMgmt(logger, gitToken,false);
    const gitProject = await registryCleanupPolicyMgmt._getProjectDetails(gitProjectID);
    const cleanupPolicy = await registryCleanupPolicyMgmt.setCleanupPolicy(gitProject);

    expect(cleanupPolicy).toBeDefined;
    expect(cleanupPolicy.status).toBeDefined;
    expect(cleanupPolicy.status).toBe(200);
});


test('should return excluded for repo <test-excluded-project-id>', async () => {
    const projectID = '<test-excluded-project-id>';

    const secretName = "<aws-secret-name>";
    const secretManagerInstance = new SecretManagerIntegrartion();
    const gitToken = await secretManagerInstance.getSecret(secretName);

    const registryCleanupPolicyMgmt = new GitlabRegistryCleanupPolicyMgmt(logger, gitToken,false, "./data/testing/excludedProjects.json");
    await registryCleanupPolicyMgmt.initialize();
    const isExcluded = await registryCleanupPolicyMgmt._isExcludedProject(projectID) 
    expect(isExcluded).toBe(true);
});