import { signal } from "@angular/core";
import { Commit } from "../models/Commit";

export class CommitsStore {
  commits = signal<Commit[]>([]);

  getCommitGraphData(commits: Commit[]): any {
    var data = 0;
    return data;
  }
}
