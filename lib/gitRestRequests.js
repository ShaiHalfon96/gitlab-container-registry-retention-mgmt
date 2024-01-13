const axios = require("axios");
const {GetReauestError, PutReauestError} = require("../errors/appError")

class GitRestRequests {
  constructor(token) {
    this.config = {};
    this.config["headers"] = {};
    this.config["headers"]["Content-Type"] = "application/json;charset=UTF-8";

    if (typeof token !== "undefined") {
      this.config.headers["PRIVATE-TOKEN"] = token;
    }
  }

  async makePutHttpRequest(url, body) {
    let response;
    try {
      response = await axios.put(url, JSON.stringify(body), this.config);
      return response;
    } catch (error) {
      throw new PutReauestError(error);
    }
  }

  async makeGetHttpRequest(url, perPage=100) {
      let page = 1;
      let allRespones = [];
      
      try {
      while (true) {
        const response = await axios.get(`${url}?page=${page}&per_page=${perPage}`, this.config);
        allRespones = allRespones.concat(response.data);

        // If there are more pages, increment the page number; otherwise, exit the loop
        if (response.headers['x-next-page']) {
          page++;
        } else {
          break;
        }
      }
      return allRespones;
    } catch (error) {
      throw new GetReauestError(error)
    }
  }
}

module.exports = GitRestRequests;
