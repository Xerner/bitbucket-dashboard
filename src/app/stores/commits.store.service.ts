import { computed, Injectable, signal } from "@angular/core";
import { Commit } from "../models/Commit";
import { AppStore, QueryParamKey } from "./app.store.service";
import { AuthorAlias } from "../models/AuthorAliases";
import { Author } from "../models/Author";

@Injectable({ providedIn: 'root' })
export class CommitsStore {
  constructor(
    private appStore: AppStore,
  ) { }

  commits = signal<Commit[]>([]);
  authorsCommits = computed(this.getAuthorsCommits.bind(this))

  getAuthorsCommits(): any {
    var authorAliasesJson = this.appStore.queryParams[QueryParamKey.author_aliases]();
    var authorAliases = authorAliasesJson ? JSON.parse(authorAliasesJson) as AuthorAlias[] : [];
    var commits = this.commits();
    var authorsCommits: [string, Commit[]][] = []
    commits.forEach((commit) => {
      var authorName = this.convertAuthorAlias(commit.author, authorAliases);
      var authorCommits = authorsCommits.find(ac => {
        return ac[0] == authorName;
      })
      if (authorCommits == undefined) {
        authorCommits = [authorName, []]
        authorsCommits.push(authorCommits)
      }
      authorCommits[1].push(commit)
    })
    return authorsCommits.sort((authorCommits1, authorCommits2) => authorCommits1[0] < authorCommits2[0] ? -1 : 1);
  }

  convertAuthorAlias(author: Author, authorAliases: AuthorAlias[]) {
    var username = author.raw.substring(0, author.raw.indexOf("<")).trim();
    if (!authorAliases) {
      return username;
    }
    username = authorAliases.reduce((accumulator, currentAuthor) => {
      if (currentAuthor.aliases.includes(username)) {
        return currentAuthor.name;
      }
      return accumulator;
    }, username)
    return username;
  }
}
