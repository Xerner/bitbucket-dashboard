import { Injectable, signal } from '@angular/core';
import { Commit } from '../models/bitbucket/Commit';
import { Person } from '../models/Person';
import { Author } from '../models/bitbucket/Author';
import { PullRequest } from '../models/bitbucket/PullRequest';
import { User } from '../models/bitbucket/User';

@Injectable({ providedIn: 'root' })
export class PersonnelStore {
  personnel = signal<Person[]>([]);

  constructor() { }

  upsertPersonnelFromCommits(commits: Commit[]) {
    var personnel = this.personnel();
    commits.forEach((commit) => this.upsertAuthorIntoAliases(commit.author, personnel))
    this.personnel.set(personnel)
  }

  upsertPersonnelFromPullRequests(pullRequests: PullRequest[]) {
    var personnel = this.personnel();
    pullRequests.forEach((pullRequest) => {
      var author: Author = {
        raw: this.stripName(pullRequest.author.display_name),
        user: pullRequest.author
      }
      this.upsertAuthorIntoAliases(author, personnel);
    })
    pullRequests.forEach(pullRequest => {
      pullRequest.participants.forEach(participant => {
        var author: Author = {
          raw: this.stripName(participant.user.display_name),
          user: participant.user
        }
        this.upsertAuthorIntoAliases(author, personnel);
      })
    })
    this.personnel.set(personnel)
  }

  upsertAuthorIntoAliases(author: Author, personnel: Person[]): void {
    var username = this.getUsernameFromAuthor(author);
    var person = personnel.find(personnel_ => this.doesPersonnelGoByName(personnel_, username))
    if (person == undefined) {
      person = { name: username, aliases: [] };
      personnel.push(person)
    }
  }

  getPersonByGitAuthor(author: Author): Person {
    var username = this.getUsernameFromAuthor(author);
    return this.getPersonByName(username);
  }

  getPersonByUser(user: User): Person {
    var username = this.getUsernameFromUser(user);
    return this.getPersonByName(username);
  }

  getPersonByName(name: string): Person {
    var name = this.stripName(name);
    var person = this.personnel().find(personnel_ => this.doesPersonnelGoByName(personnel_, name));
    if (person == undefined) {
      console.error("Author not found in aliases, please update author aliases on author fetch for proper state management. Updating is undesirable while rendering to prevent signal loops", name, person);
      throw new Error("Author not found in aliases, please update author aliases on author fetch for proper state management. Updating is undesirable while rendering to prevent signal loops");
    }
    return person;
  }

  doesPersonnelGoByName(personnel: Person, name: string) {
    return personnel.name == name || personnel.aliases.includes(name);
  }

  getUsernameFromAuthor(author: Author) {
    if (author.user === undefined) {
      return this.stripName(author.raw);
    } else {
      return this.getUsernameFromUser(author.user);
    }
  }

  getUsernameFromUser(user: User) {
    return this.stripName(user.display_name);
  }

  stripName(name: string) {
    var emailStartingIndex = name.indexOf("<");
    return name.substring(0, emailStartingIndex == -1 ? undefined : emailStartingIndex).trim();
  }
}
