const { default: expect } = require("expect");
const GitRestRequests = require("./gitRestRequests");
const { GIT_URLS } = require("./config/constants");
const SecretManagerIntegrartion = require("./awsModule");

test('should retrun git projects', async () => {
  const gitRestRequests = new GitRestRequests();
  const gitProjects = await gitRestRequests.makeGetHttpRequest(GIT_URLS.PROJECTS());
  expect(gitProjects.length)
  expect(Array.isArray(gitProjects)).toBe(true);
  expect(gitProjects.length).toBeGreaterThan(0);
});

test('should retrun a git private project', async () => {
  const secretName = "gitlab-registry-retantion-management";
  const secretManagerInstance = new SecretManagerIntegrartion();
  const gitToken = await secretManagerInstance.getSecret(secretName);

  const gitRestRequests = new GitRestRequests(gitToken);
  const gitProjectID = '<test-project-id>';
  const gitProject = await gitRestRequests.makeGetHttpRequest(GIT_URLS.PROJECT(gitProjectID));
  expect(Array.isArray(gitProject)).toBe(true);
  expect(gitProject.length).toBe(1);
});