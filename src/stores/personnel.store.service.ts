import { Injectable, signal } from '@angular/core';
import { Commit } from '../models/bitbucket/Commit';
import { Person } from '../models/Person';
import { Author } from '../models/bitbucket/Author';
import { PullRequest } from '../models/bitbucket/PullRequest';

@Injectable({ providedIn: 'root' })
export class PersonnelStore {
  personnel = signal<Person[]>([]);

  constructor() { }

  upsertPersonnelFromCommits(commits: Commit[]) {
    commits.forEach((commit) => this.upsertAuthorIntoAliases(commit.author))
  }

  upsertPersonnelFromPullRequests(pullRequests: PullRequest[]) {
    pullRequests.forEach((pullRequest) => {
      var author: Author = {
        raw: this.stripName(pullRequest.author.display_name),
        user: pullRequest.author
      }
      this.upsertAuthorIntoAliases(author);
    })
    pullRequests.forEach(pullRequest => {
      pullRequest.participants.forEach(participant => {
        var author: Author = {
          raw: this.stripName(participant.user.display_name),
          user: participant.user
        }
        this.upsertAuthorIntoAliases(author);
      })
    })
  }

  upsertAuthorIntoAliases(author: Author): Person {
    var personnel = this.personnel();
    if (author.user === undefined) {
      var username = this.stripName(author.raw);
    } else {
      var username = this.stripName(author.user.display_name);
    }
    var person = personnel.find(personnel_ => personnel_.name == username || personnel_.aliases.includes(username))
    if (person == undefined) {
      person = { name: username, aliases: [] };
      personnel.push(person)
    }
    return person;
  }

  getPersonByGitAuthor(author: Author): Person {
    return this.getPersonByName(author.raw);
  }

  getPersonByName(name: string): Person {
    var name = this.stripName(name);
    var person = this.personnel().find(person_ => person_.name == name || person_.aliases.includes(name))
    if (person == undefined) {
      console.error("Author not found in aliases, please update author aliases on author fetch for proper state management. Updating is undesirable while rendering to prevent signal loops", name, person);
      throw new Error("Author not found in aliases, please update author aliases on author fetch for proper state management. Updating is undesirable while rendering to prevent signal loops");
    }
    return person;
  }

  stripName(name: string) {
    var emailStartingIndex = name.indexOf("<");
    return name.substring(0, emailStartingIndex == -1 ? undefined : emailStartingIndex).trim();
  }
}
