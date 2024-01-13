const GIT_BASE_URL = "https://git.zooz.co/api";
const API_VERSION = "v4";
const GIT_URL = `${GIT_BASE_URL}/${API_VERSION}`;

const GIT_URLS = {
  PROJECTS: () => `${GIT_URL}/projects`,
  PROJECT: (project_id) => `${GIT_URL}/projects/${project_id}`,
  COMMITS: (project_id) =>
    `${GIT_URL}/projects/${project_id}/repository/commits`,
  REPOSITORY_TREE: (project_id) =>
    `${GIT_URL}/projects/${project_id}/repository`,
  GROUP: (group_id) => `${GIT_URL}/groups/${group_id}`,
  SUBGROUP: (group_id) => `${GIT_URL}/groups/${group_id}/subgroups`
};


// You can check body valid properties on https://docs.gitlab.com/ee/user/packages/container_registry/reduce_container_registry_storage.html#:~:text=You%20can%20create%20a%20cleanup,section%2C%20select%20Set%20cleanup%20rules.

const GIT_DEFAULTS = {
  CLEANUP_POLICY: {
    enabled: "true",
    cadence: "1d",
    keep_n: 25,
    older_than: "90d",
    name_regex: ".*",
  },
};

module.exports = {
  GIT_URLS: GIT_URLS,
  GIT_DEFAULTS: GIT_DEFAULTS,
};
