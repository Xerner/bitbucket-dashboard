import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { PullRequest } from '../models/bitbucket/PullRequest';
import { Commit } from '../models/bitbucket/Commit';

@Injectable({ providedIn: 'root' })
export class DatesService {
  isCommitInsideDateWindow(commit: Commit, startDate: DateTime, endDate: DateTime) {
    return this.isDateWithinWindow(DateTime.fromISO(commit.date), startDate, endDate);
  }

  isPullRequestInsideDateWindow(pullRequest: PullRequest, startDate: DateTime, endDate: DateTime) {
    return this.isDateWithinWindow(DateTime.fromISO(pullRequest.updated_on), startDate, endDate);
  }

  /**
   * Checks if a date is between the start and end dates, inclusive of the start and end date
   */
  isDateWithinWindow(date: DateTime, start: DateTime, end: DateTime) {
    return date >= start && date <= end;
  }
}