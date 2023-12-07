import { GithubRepoParser } from "./githubRepoParser"
import { GithubRepoParserConfig } from "./githubRepoParserConfig";

export {
  GithubRepoParser,
  GithubRepoParserConfig
};

(async function awaitMe() {
  const parser = new GithubRepoParser({ username: 'birkheadc' });
  const results = await parser.getAllData([ 'images' ]);
  console.log("Results: ", results);
})();