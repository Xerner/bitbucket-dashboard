import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { Commit } from '../../../../models/bitbucket/Commit';
import { DateTime, WeekdayNumbers } from 'luxon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Person } from '../../../../models/Person';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

export const LuxonToHeatMapWeekdays: Record<number, number> = {
  1: 2, // 1 is Monday in Luxon
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 7,
  7: 1, // 7 is Sunday in Luxon
}

export const LuxonWeekdaysToString: Record<number, string> = {
  1: "Monday", // 1 is Monday in Luxon
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday", // 7 is Sunday in Luxon
}

interface CommitsOnDate {
  date: DateTime;
  commits: Commit[];
}

@Component({
  selector: 'app-git-heat-map',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatMenuModule,
    MatMenuTrigger,
  ],
  templateUrl: './git-heat-map.component.html',
})
export class GitHeatMapComponent {
  readonly CELL_SPACING = 1/4;
  readonly CELL_HEIGHT = 3/4;
  readonly CELL_WIDTH = 3/4;
  readonly ROWS = 7;
  readonly LUXON_SATURDAY: WeekdayNumbers = 6;
  readonly LUXON_SUNDAY: WeekdayNumbers = 7;
  readonly MIN_GREEN = 64;
  readonly MAX_GREEN = 196;

  largestCount = 0;
  startDate = input.required<DateTime>()
  endDate = input.required<DateTime>()
  author = input.required<Person>()
  commits = input.required<Commit[]>()
  isAnonymous = input<boolean>();
  commitCounts = computed<CommitsOnDate[][]>(() => {
    var commits = this.commits();
    var startDate = this.adjustedStartDate();
    var endDate = this.getAdjustedEndDate()
    var daysInGraph = Math.abs(Math.floor(startDate.diff(endDate, "days").days))
    var commitCounts: CommitsOnDate[] = new Array(daysInGraph).fill(0)
    commitCounts = commitCounts.map((_, index) => {
      return {
        date: startDate.plus({ 'days': index }),
        commits: []
      }
    });
    // sort by date ascending
    commitCounts.sort((commitCount1, commitCount2) => commitCount1.date < commitCount2.date ? -1 : 1);
    commits.forEach(this.countCommit.bind(this, commitCounts))
    var commitCountsPerWeek: CommitsOnDate[][] = []
    var currentWeek: CommitsOnDate[] = [];
    commitCounts.forEach((commitCount, i) => {
      if (i % this.ROWS == 0) {
        currentWeek = []
        commitCountsPerWeek.push(currentWeek)
      }
      currentWeek.push(commitCount)
    });
    return commitCountsPerWeek;
  })
  adjustedStartDate = computed<DateTime>(() => {
    return this.adjustStartDate(this.startDate());
  })
  columns = computed<number>(() => {
    var startDate = this.adjustedStartDate()
    var endDate = this.getAdjustedEndDate();
    var days = Math.abs(startDate.diff(endDate, "days").days)
    return Math.ceil(days / this.ROWS)
  })
  selectedCommitsOnDate = signal<CommitsOnDate | null>(null)

  getColumnContainerStyle() {
    return `grid-template-columns: repeat(${this.columns()}, minmax(0, ${this.columns()}fr));`
  }

  getRowContainerStyle() {
    return `grid-template-rows: repeat(${this.ROWS}, minmax(0, ${this.ROWS}fr));`
  }

  getCellStyle(commitCount: CommitsOnDate) {
    var style = `
      height: ${this.CELL_HEIGHT}rem;
      width: ${this.CELL_WIDTH}rem;
      margin-bottom: ${this.CELL_SPACING}rem;`
    if (commitCount.date < this.startDate() || commitCount.date > this.endDate() ) {
      style += " background-color: rgb(216, 216, 216, 0.5);"
      return style;
    }
    if (commitCount.commits.length == 0) {
      style += " background-color: rgb(164, 164, 164);"
      return style;
    }
    var greenness = this.getGreenness(commitCount.commits.length);
    style += ` background-color: rgb(0, ${greenness}, 0);`
    return style;
  }

  getGreenness(count: number) {
    var greenRange = this.MAX_GREEN - this.MIN_GREEN;
    var normalizedValue = (count / this.largestCount) * greenRange;
    normalizedValue += this.MIN_GREEN;
    return normalizedValue;
  }

  isCommitDateEqualToDateTime(commit: Commit, datetime: DateTime) {
    return Math.floor(datetime.diff(this.commitDateToDateTime(commit), "days").days) == 0;
  }

  commitDateToDateTime(commit: Commit) {
    return DateTime.fromISO(commit.date).toUTC().startOf('day');
  }

  countCommit(commitCounts: CommitsOnDate[], commit: Commit) {
    var commitCount = commitCounts.find(commitCount => this.isCommitDateEqualToDateTime(commit, commitCount.date))
    if (commitCount == undefined) {
      return;
    }
    commitCount.commits.push(commit);
    this.largestCount = Math.max(this.largestCount, commitCount.commits.length)
  }

  /**
   * The column end would normally be saturday
   */
  getAdjustedEndDate() {
    var datetime = this.endDate();
    var distanceFromNextColumnEnd = Math.abs(LuxonToHeatMapWeekdays[this.LUXON_SATURDAY] - LuxonToHeatMapWeekdays[datetime.weekday]);
    return datetime.plus({ "days": distanceFromNextColumnEnd + 1 })
  }

  /**
   * The column end would normally be saturday
   */
  adjustStartDate(datetime: DateTime) {
    var distanceFromNextColumnEnd = Math.abs(LuxonToHeatMapWeekdays[this.LUXON_SUNDAY] - LuxonToHeatMapWeekdays[datetime.weekday]);
    return datetime.minus({ "days": distanceFromNextColumnEnd })
  }

  getCountTooltip(commitCount: CommitsOnDate) {
    var weekday: string = LuxonWeekdaysToString[commitCount.date.weekday]
    var dateStr = commitCount.date.toLocaleString()
    return `${weekday}
${commitCount.commits.length} commit(s) on ${dateStr}
Click to view commits`
  }

  formatCommitsForMenu(commitsOnDate: CommitsOnDate | null) {
    if (commitsOnDate == null || commitsOnDate.commits.length == 0) {
      return "No commits";
    }
    return commitsOnDate.commits.map(commit => `${commit.repository.name}\t${commit.hash.substring(0, 8)}`).join("\n");
  }

  getAuthor(): string {
    return this.isAnonymous() ? "Anonymous" : this.author().name;
  }

  onCommitMenuOpened(commitsOnDate: CommitsOnDate) {
    this.selectedCommitsOnDate.set(commitsOnDate);
  }
}
