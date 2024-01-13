# GitLab Conatiner Registry Retention Management 

This module facilitates the implementation of a container registry cleanup policy for GitLab projects by utilizing a JSON file to specify the Gitlab projects, groups and their cleanup configurations.

## Introduction

The Registry Retention Policy script automates the deletion of tags from the container registry, enabling efficient storage management by retaining only the necessary tags. The script connects to GitLab using an access token stored in AWS Secret Manager and applies the specified cleanup policy to the provided projects.

## Default Configuration

The project includes two default JSON files
- './data/repositories.json', containing information about the Gitlab projects, groups and serving as the basis for the cleanup policy. The JSON file can also be used to override default. settings.
- './data/excludedProjects.json', containing information about Gitlab projects that never should be set. Those projects won't be set neigther if set specifc or as part of group.

The default policy is as follows:

- **Enabled**: Enable the policy.
- **Cadence**: The policy runs monthly.
- **Retention**: Retains the most recent 25 images.
- **Deletion Criteria**: Removes images older than 90 days.
- **Image Selection**: Considers all images for cleanup, regardless of their names (name_regex: ".*").

## How to Use The Project

Modify the './data/repositories.json' file to define projects and their specific settings.

```json
{
    "projects": [
        {
           "id": "<project-id>",
           "settings": {
               "cadence": "1d"
           }
       },
    ],
    "groups": [
        {
            "id": "<group-id>",
            "settings" : {
                "cadence": "3month"
            }
        }
    ]
}

```
Refer to the [documentation](https://docs.gitlab.com/ee/user/packages/container_registry/reduce_container_registry_storage.html) for valid settings and values.

After the json file has been prepared and pushed to the projects, the gitlab pipeline will run tests, dry run and finally the script and the configuration will be seted.

If needed set the './data/excludedProjects.json' file.
```json
{
    "projects": [
        {
           "id": "<project-id>",
           "owner": "<owner-mail>" // for documentation only.
       },
    ],
    "groups": [
        {
            "id": "<group-id>",
            "owner": "<owner-mail>" // for documentation only.
        }
    ]
}

```

## How to Run The Project?
To initiate the project, you have several options. You can establish a connection by providing a GitLab token using the '--token' flag. Alternatively, you can provide an AWS secret that contains the token using the '--aws-secret' flag, although this will require an SSO login or an AWS role. To specify the projects, you can use a JSON file with the '--json-file' flag or directly mention the project ID. To set the excluded file use '--excluded-json-file' . In addtion you can use -dry-run flag to view the result before applying, below are a few examples:

```shell
node ./src/main.js --token <git_access_token> --project <git_project_id> 
```
```shell
node ./src/main.js --aws-secret <aws_secret_name> --json-file <path_to_json> --excluded-json-file <path_to_excluded_json>
```
```shell
node ./src/main.js --aws-secret <aws_secret_name> --json-file <path_to_json> --excluded-json-file <path_to_excluded_json> --dry-run
```
For more detailed information, you can use the '--help' option.

**Note:** Ensure you have the necessary credentials and permissions to access the GitLab project.

Make sure you well understand and test the project before useing it.
