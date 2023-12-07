export type GithubRepoParserResult = {
  json: any,
  files: {
    [key: string]: string[]
  }
}