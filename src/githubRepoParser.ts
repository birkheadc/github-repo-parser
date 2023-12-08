import { GithubRepoParserConfig } from "./githubRepoParserConfig";
import { GithubRepoParserResult } from "./githubRepoParserResult";
import fetch from "node-fetch";

export class GithubRepoParser {
  private readonly config: GithubRepoParserConfig;
  constructor(config: GithubRepoParserConfig) {
    this.config = {
      username: config.username,
      root: config.root || 'repo-parser-target',
      apiToken: config.apiToken
    };
  }

  async getAllData(fileTypes: string[] = []): Promise<GithubRepoParserResult[] | undefined> {

    const results: GithubRepoParserResult[] = [];
    const items = await this.getRepositoriesWithRootFolderNameInReadme();
    if (items == null) return undefined;

    for (let i = 0; i < items.length; i++) {
      const result: GithubRepoParserResult | undefined = await this.getResultFromRepository(items[i], fileTypes);
      results.push(result);
    }

    return results;
  }

  private async getRepositoriesWithRootFolderNameInReadme(): Promise<any[] | undefined> {

    const url = `https://api.github.com/search/repositories?q=${this.config.root}%20user:${this.config.username}%20in:readme`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.config.apiToken ? {
        'Authorization': `Bearer ${this.config.apiToken}`
      } : {}
    });

    if (response.status === 401) {
      console.log("Github refused the supplied API key.");
      return undefined
    }
    if (!response.ok) {
      console.log("Bad response when attempting to search github repositories: ", response);
      return undefined;
    }

    const data: any = await response.json();
    if (data.items == null || data.items[0] == null) {
      console.log("Data was of an unexpected format: ", data);
      return undefined;
    }

    return data.items;
  }

  private async getResultFromRepository(repository: any, fileTypes: string[]): Promise<GithubRepoParserResult | undefined> {
    const repoName = repository.name;
    const baseUrl = repository.url;
    if (repoName == null || baseUrl == null) {
      return undefined;
    }

    const url = `${baseUrl}/contents/${this.config.root}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.config.apiToken ? {
        'Authorization': `Bearer ${this.config.apiToken}`
      } : {}
    });
    if (response.status === 401) {
      console.log("Github refused the supplied API key.");
      return undefined
    }
    if (!response.ok) {
      console.log("Bad response when attempting to fetch repo-parser folder: ", response);
      return undefined;
    }

    const data = await response.json();
    const json = await this.getJsonFromRepoParserFolder(data);
    const files = await this.getFilesFromRepo(repoName, fileTypes);
    
    const result: GithubRepoParserResult = {
      json,
      files
    }
    return result;
  }

  private async getJsonFromRepoParserFolder(data: any): Promise<any | undefined> {
    const jsonUrl = data.find((d: any) => d.name === 'data.json').download_url;
    const response = await fetch(jsonUrl, {
      method: 'GET'
    });
    if (response.status === 401) {
      console.log("Github refused the supplied API key.");
      return undefined
    }
    if (!response.ok) {
      console.log("Bad response when attempting to fetch data.json: ", response);
      return undefined;
    }
    return await response.json();
  }

  private async getFilesFromRepo(repoName: string, fileTypes: string[]): Promise<{[key: string]: string[]}> {
    const files = {};
    for (let j = 0; j < fileTypes.length; j++) {
      const fileType = fileTypes[j];
      const fileTypeUrl = `https://api.github.com/repos/${this.config.username}/${repoName}/contents/${this.config.root}/files/${fileType}`
      const response = await fetch(fileTypeUrl, {
        method: 'GET'
      });
      if (response.ok) {
        const data: any = await response.json();
        if (data == null || data[0] == null) {
          continue;
        }
        files[fileType] = [];
        for (let k = 0; k < data.length; k++) {
          files[fileType].push(data[k].download_url);
        }
      }
    }
    return files;
  }
}