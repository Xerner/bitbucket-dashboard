import { computed, Injectable, signal } from "@angular/core";
import { Commit } from "../models/bitbucket/Commit";
import { Person } from "../models/Person";
import { PersonnelStore } from "./personnel.store.service";
import { AnonymityService } from "../services/AnonymityService.service";

@Injectable({ providedIn: 'root' })
export class CommitsStore {
  constructor(
    private personnelStore: PersonnelStore,
    private anonymityService: AnonymityService,
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
    return authorsCommits.sort((authorCommits1, authorCommits2) => {
      if (this.anonymityService.isAnonymityEnabled() == false || (
        this.anonymityService.isAnonymous(authorCommits1[0]) == true
        && this.anonymityService.isAnonymous(authorCommits2[0]) == true
      )) {
        return authorCommits1[0].name < authorCommits2[0].name ? -1 : 1;
      }
      // dont sort meaningfully if content should be anonymous
      if (this.anonymityService.isAnonymous(authorCommits1[0]) == true
       && this.anonymityService.isAnonymous(authorCommits2[0]) == false) {
        return 1;
      }
      if (this.anonymityService.isAnonymous(authorCommits1[0]) == false
       && this.anonymityService.isAnonymous(authorCommits2[0]) == true) {
        return -1;
      }
      var rand1 = Math.random();
      var rand2 = Math.random();
      return rand1 < rand2 ? -1 : 1;
    });
  }
}
