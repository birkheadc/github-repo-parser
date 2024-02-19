# Birkheadc's Github Repo Parser

Searches all of a user's public repositories for a specific folder, then parses those folders in order to collect meta-data about those repositories. Essentially facilitating the creation of advanced, API-legible READMEs.

# How to Install
`npm install @birkheadc/github-repo-parser`

# How to Use
```
import { GithubRepoParser } from '@birkheadc/github-repo-parser';

const parser = new GithubRepoParser({
  username: //your-github-username

  root?: //defaults to 'repo-parser-target', the name of the folder you will create in your repository to hold the data you want to store

  apiToken?: //optional, requests will use a token if provided, which will substantially increase Github API's rate limit
});

const data: GithubRepoParserResult[] | undefined = await parser.getAllData([ 'fileType1', 'fileType2' ]);
// array of fileTypes is optional

if (data !== undefined) {
  data.forEach(result => {
    // do what you want with your data!
    // if fileTypes were passed, result.files[fileType] will contain an array of strings, which are links to the file on github
  })
}
```

# Setting Up the Repository

In order for the package to find and parse your repository, you must do two things:

- First, you must include a keyword in your repository's README. This keyword defaults to `repo-parser-target`, but can be changed to whatever you like by passing a different value to the `root?` option of the constructor's config. Try to use something unique, or the parser might flag repositories you didn't mean it to.
- Second, you must create a folder with the name equal to this keyword. In this folder, create `data.json`, and fill it with the json object you want this repository to return. Also, if you want to host static files, create `files`, and in `files`, create any number of folders for each file type, like `images` or `audio`.

The end result is that `GithubRepoParser.getAllData([ 'images', 'audio' ])` will return an array of GithubRepoParserResults.

Each result will contain `result.json`, which will be the contents of `data.json`; and `result.files.images` and `result.files.audio`, each of which will be an array of strings linking back to the static files in the `files/images` and `files/audio` folders.
# Repo-Parser

This repository is parse-able by... this package! The contents of the `repo-parser-target` directory are meant to be consumed by an API using this very package.