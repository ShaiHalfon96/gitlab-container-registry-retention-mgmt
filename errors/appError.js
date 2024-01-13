class CustomError extends Error {
    constructor(action, error) {
      const message = `Error during ${action}: ${error.message}`;
      super(message);
      this.name = this.constructor.name;
      this.originalError = error;
    }
  }
  
class CreateSecretManagerClientError extends CustomError {
    constructor(error) {
      super("create secrete manager client", error);
    }
  }
  
  class GetSecretValueError extends CustomError {
    constructor(error) {
      super("getting secret from AWS",error);
    }
  }

  class GetReauestError extends CustomError {
    constructor(error) {
      super("GET request",error);
    }
  }
  
  class PutReauestError extends CustomError {
    constructor(error) {
      super("PUT request",error);
    }   
  }
  
  class SetRegistryRetentionPolicyError extends CustomError {
    constructor(projectID, error) {
      super(`Retention policy for ${projectID} project failed`,error);
    }   
  }

  class GetGitlabGroupError extends CustomError {
    constructor(groupID, error) {
      super(`Get ${groupID} group`,error);
    }   
  }

  class GetGitlabProjectsError extends CustomError {
    constructor(error) {
      super(`Get projects`,error);
    }   
  }
  class WriteToFileError extends CustomError {
    constructor(error) {
      super(`wrtiting to a file`,error);
    }   
  }

  class CreateFolderError extends CustomError {
    constructor(error) {
      super(`create folder`,error);
    }   
  }
  
  module.exports = {CreateSecretManagerClientError, GetSecretValueError, GetReauestError, PutReauestError, SetRegistryRetentionPolicyError, GetGitlabGroupError, GetGitlabProjectsError, WriteToFileError, CreateFolderError};