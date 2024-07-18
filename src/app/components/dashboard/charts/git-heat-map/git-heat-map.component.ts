import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Commit } from '../../../../models/Commit';
import { DateTime } from 'luxon';

interface CommitCount {
  date: DateTime;
  count: number;
}

@Component({
  selector: 'app-git-heat-map',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './git-heat-map.component.html',
})
export class GitHeatMapComponent {
  maxLightness = 25;
  largestCount = 0;
  commits = input.required<Commit[]>()
  commitCounts = computed<CommitCount[]>(() => {
    var commits = this.commits();
    var commitCounts: CommitCount[] = [];
    commits.forEach(this.countCommit.bind(this, commitCounts))
    return commitCounts.sort((commitCount1, commitCount2) => commitCount1.date > commitCount2.date ? -1 : 1);
  })

  getCellStyle(commitCount: CommitCount) {
    var lightness = this.getLightness(commitCount.count);
    return `background-color: hsl(120, 100%, ${lightness}%);` // this be green rgb(0, 128, 0)
  }

  getLightness(count: number) {
    return (count / this.largestCount) * this.maxLightness;
  }

  isCommitDateEqualToDateTime(commit: Commit, datetime: DateTime) {
    return datetime.equals(this.commitDateToDateTime(commit));
  }

  commitDateToDateTime(commit: Commit) {
    return DateTime.fromISO(commit.date).startOf('day');
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
}
