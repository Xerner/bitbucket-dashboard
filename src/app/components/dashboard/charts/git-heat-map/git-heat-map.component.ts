import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Commit } from '../../../../models/Commit';
import { DateTime } from 'luxon';
import { MatTooltipModule } from '@angular/material/tooltip';

interface CommitCount {
  date: DateTime;
  count: number;
}

@Component({
  selector: 'app-git-heat-map',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  templateUrl: './git-heat-map.component.html',
})
export class GitHeatMapComponent {
  middleLightness = 25;
  largestCount = 0;
  daysWindow = input.required<number>()
  author = input.required<string>()
  commits = input.required<Commit[]>()
  commitCounts = computed<CommitCount[]>(() => {
    var commits = this.commits();
    var startDate = DateTime.now().toUTC().startOf('day').minus({ 'days': this.daysWindow() - 1 });
    var commitCounts = new Array(this.daysWindow()).fill(0)
    commitCounts = commitCounts.map((_, index) => {
      return { date: startDate.plus({ 'days': index }), count: 0 }
    });
    commits.forEach(this.countCommit.bind(this, commitCounts))
    return commitCounts.sort((commitCount1, commitCount2) => commitCount1.date > commitCount2.date ? -1 : 1);
  })

  getCellStyle(commitCount: CommitCount) {
    if (commitCount.count == 0) {
      return "background-color: rgb(196, 196, 196);"
    }
    var lightness = this.getLightness(commitCount.count);
    return `background-color: hsl(120, 100%, ${lightness}%);` // this be green rgb(0, 128, 0)
  }

  getLightness(count: number) {
    var normalizedValue = (this.largestCount - count) / (this.largestCount / 2);
    normalizedValue = normalizedValue == 0 ? 1 : normalizedValue;
    return normalizedValue * this.middleLightness;
  }

  isCommitDateEqualToDateTime(commit: Commit, datetime: DateTime) {
    return datetime.diff(this.commitDateToDateTime(commit)).days == 0;
  }

  commitDateToDateTime(commit: Commit) {
    return DateTime.fromISO(commit.date).toUTC().startOf('day');
  }

  countCommit(commitCounts: CommitCount[], commit: Commit) {
    var commitCount = commitCounts.find(commitCount => this.isCommitDateEqualToDateTime(commit, commitCount.date))
    if (commitCount == undefined) {
      commitCount = {
        date: this.commitDateToDateTime(commit),
        count: 0
      }
      commitCounts.push(commitCount)
    }
    commitCount.count++;
    this.largestCount = Math.max(this.largestCount, commitCount.count)
  }

  getCountTooltip(commitCount: CommitCount) {
    var dateStr = commitCount.date.toLocaleString()
    return `${commitCount.count} commit(s) on ${dateStr}`
  }
}
