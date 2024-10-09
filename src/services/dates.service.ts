import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { PullRequest } from '../models/bitbucket/PullRequest';
import { Commit } from '../models/bitbucket/Commit';

@Injectable({
  providedIn: 'root'
})
export class DatesService {
  isCommitInsideDateWindow(commit: Commit, dateWindow: DateTime) {
    return DateTime.fromISO(commit.date) > dateWindow;
  }

  isPullRequestInsideDateWindow(pullRequest: PullRequest, dateWindow: DateTime) {
    return DateTime.fromISO(pullRequest.updated_on) > dateWindow;
  }

  getDateFromDateWindowForQuery(daysWindow: number | null) {
    if (daysWindow == null) {
      return null;
    }
    return DateTime.now().toUTC().startOf('day').minus({ 'days': daysWindow - 1 });
  }
}