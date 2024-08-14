import { computed, Injectable, signal } from "@angular/core";
import { Commit } from "../models/Commit";

@Injectable({ providedIn: 'root' })
export class CommitsStore {
  commits = signal<Commit[]>([]);
  authorsCommits = computed(this.getAuthorsCommits.bind(this))

  getAuthorsCommits(): any {
    var commits = this.commits();
    var authorsCommits: [string, Commit[]][] = []
    commits.forEach((commit) => {
      var authorName = commit.author.raw.substring(0, commit.author.raw.indexOf("<")).trim();
      var authorCommits = authorsCommits.find(ac => {
        return ac[0].trim() == authorName;
      })
      if (authorCommits == undefined) {
        authorCommits = [authorName, []]
        authorsCommits.push(authorCommits)
      }
      authorCommits[1].push(commit)
    })
    return authorsCommits.sort((authorCommits1, authorCommits2) => authorCommits1[0] < authorCommits2[0] ? -1 : 1);
  }
}
