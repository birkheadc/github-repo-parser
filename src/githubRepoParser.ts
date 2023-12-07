import { GithubRepoParserConfig } from "./githubRepoParserConfig";
import { GithubRepoParserResult } from "./githubRepoParserResult";

export class GithubRepoParser {
  config: GithubRepoParserConfig;
  constructor(config: GithubRepoParserConfig) {
    this.config = {
      username: config.username,
      root: config.root || 'repo-parser-target'
    };
  }
  // For the love of god please refactor this.
  async getAllData(fileTypes: string[] = []): Promise<GithubRepoParserResult[] | undefined> {
    const results: GithubRepoParserResult[] = [];
    const url = `https://api.github.com/search/repositories?q=${this.config.root}%20user:${this.config.username}%20in:readme`;
    const response = await fetch(url, {
      method: 'GET'
    });
    if (!response.ok) {
      console.log("Bad response: ", response);
      return undefined;
    }
    const data = await response.json();
    if (data.items == null || data.items[0] == null) {
      console.log("Bad data: ", data);
      return undefined;
    }
    for (let i = 0; i < data.items.length; i++) {
      const repoName = data.items[0].name;
      const baseUrl = data.items[i].url;
      if (baseUrl == null) {
        continue;
      }
      const url = `${baseUrl}/contents/${this.config.root}`;
      const response = await fetch(url, {
        method: 'GET'
      });
      if (response.ok) {
        const data = await response.json();
        let json = {};
        const jsonUrl = data.find(d => d.name === 'data.json').download_url;
        const jsonResponse = await fetch(jsonUrl, {
          method: 'GET'
        });
        if (jsonResponse.ok) {
          json = await jsonResponse.json();
        }
        const files = {};
        for (let j = 0; j < fileTypes.length; j++) {
          const fileType = fileTypes[j];
          const fileTypeUrl = `https://api.github.com/repos/${this.config.username}/${repoName}/contents/${this.config.root}/files/${fileType}`
          const response = await fetch(fileTypeUrl, {
            method: 'GET'
          });
          if (response.ok) {
            const data = await response.json();
            if (data == null || data[0] == null) {
              continue;
            }
            files[fileType] = [];
            for (let k = 0; k < data.length; k++) {
              files[fileType].push(data[k].download_url); 
            }
          }
        }
        const result: GithubRepoParserResult = {
          json,
          files
        }
        results.push(result);
      }
    }
    return results;
  }
}