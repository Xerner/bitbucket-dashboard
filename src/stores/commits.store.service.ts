import { computed, Injectable, signal } from "@angular/core";
import { Commit } from "../models/bitbucket/Commit";
import { Person } from "../models/Personnel";
import { PersonnelStore } from "./personnel.store.service";

@Injectable({ providedIn: 'root' })
export class CommitsStore {
  constructor(
    private personnelStore: PersonnelStore,
  ) { }

  commits = signal<Commit[]>([]);
  authorsCommits = computed<[Person, Commit[]][]>(this.getAuthorsCommits.bind(this))

  getAuthorsCommits(): [Person, Commit[]][] {
    var commits = this.commits();
    var authorsCommits: [Person, Commit[]][] = []
    commits.forEach((commit) => {
      var person = this.personnelStore.getPersonByGitAuthor(commit.author);
      var authorCommits = authorsCommits.find(ac => {
        return ac[0].name == person.name;
      })
      if (authorCommits == undefined) {
        authorCommits = [person, []]
        authorsCommits.push(authorCommits)
      }
      authorCommits[1].push(commit)
    })
    return authorsCommits.sort((authorCommits1, authorCommits2) => authorCommits1[0] < authorCommits2[0] ? -1 : 1);
  }
}
