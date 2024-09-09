import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Commit } from '../../../../models/bitbucket/Commit';
import { DateTime, WeekdayNumbers } from 'luxon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Person } from '../../../../models/Person';

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
  readonly CELL_SPACING = 1/4;
  readonly CELL_HEIGHT = 3/4;
  readonly CELL_WIDTH = 3/4;
  readonly ROWS = 7;
  readonly LUXON_SATURDAY: WeekdayNumbers = 6;
  readonly LUXON_SUNDAY: WeekdayNumbers = 7;
  readonly MIN_GREEN = 64;
  readonly MAX_GREEN = 196;

  largestCount = 0;
  daysWindow = input.required<number>()
  author = input.required<Person>()
  commits = input.required<Commit[]>()
  isAnonymous = input<boolean>();
  commitCounts = computed<CommitCount[][]>(() => {
    var commits = this.commits();
    var startDate = this.startDate();
    var endDate = this.getEndDate()
    var daysInGraph = Math.abs(Math.floor(startDate.diff(endDate, "days").days))
    var commitCounts = new Array(daysInGraph).fill(0)
    commitCounts = commitCounts.map((_, index) => {
      return { date: startDate.plus({ 'days': index }), count: 0 }
    });
    commitCounts.sort((commitCount1, commitCount2) => commitCount1.date < commitCount2.date ? -1 : 1);
    commits.forEach(this.countCommit.bind(this, commitCounts))
    var commitCountsPerWeek: CommitCount[][] = []
    var currentWeek: CommitCount[] = [];
    commitCounts.forEach((commitCount, i) => {
      if (i % this.ROWS == 0) {
        currentWeek = []
        commitCountsPerWeek.push(currentWeek)
      }
      currentWeek.push(commitCount)
    });
    return commitCountsPerWeek;
  })
  startDateForData = computed<DateTime>(() => {
    var datetime = DateTime.now().toUTC().startOf('day').minus({ 'days': this.daysWindow() - 1 });
    return datetime;
  })
  startDate = computed<DateTime>(() => {
    return this.adjustedStartDate(this.startDateForData());
  })
  columns = computed<number>(() => {
    var startDate = this.startDate()
    var endDate = this.getEndDate()
    var days = Math.abs(startDate.diff(endDate, "days").days)
    return Math.ceil(days / this.ROWS)
  })

  getColumnContainerStyle() {
    return `grid-template-columns: repeat(${this.columns()}, minmax(0, ${this.columns()}fr));`
  }

  getRowContainerStyle() {
    return `grid-template-rows: repeat(${this.ROWS}, minmax(0, ${this.ROWS}fr));`
  }

  getCellStyle(commitCount: CommitCount) {
    var style = `
      height: ${this.CELL_HEIGHT}rem;
      width: ${this.CELL_WIDTH}rem;
      margin-bottom: ${this.CELL_SPACING}rem;`
    if (commitCount.date > DateTime.now() || commitCount.date < this.startDateForData()) {
      style += " background-color: rgb(255, 255, 255, 0);"
      return style;
    }
    if (commitCount.count == 0) {
      style += " background-color: rgb(196, 196, 196);"
      return style;
    }
    var greenness = this.getGreenness(commitCount.count);
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
    return datetime.diff(this.commitDateToDateTime(commit), "days").days == 0;
  }

  commitDateToDateTime(commit: Commit) {
    return DateTime.fromISO(commit.date).toUTC().startOf('day');
  }

  countCommit(commitCounts: CommitCount[], commit: Commit) {
    var commitCount = commitCounts.find(commitCount => this.isCommitDateEqualToDateTime(commit, commitCount.date))
    if (commitCount == undefined) {
      return;
    }
    commitCount.count++;
    this.largestCount = Math.max(this.largestCount, commitCount.count)
  }

  /**
   * The column end would normally be saturday
   */
  getEndDate() {
    var datetime = DateTime.now();
    var distanceFromNextColumnEnd = Math.abs(LuxonToHeatMapWeekdays[this.LUXON_SATURDAY] - LuxonToHeatMapWeekdays[datetime.weekday]);
    return datetime.plus({ "days": distanceFromNextColumnEnd })
  }

  /**
   * The column end would normally be saturday
   */
  adjustedStartDate(datetime: DateTime) {
    var distanceFromNextColumnEnd = Math.abs(LuxonToHeatMapWeekdays[this.LUXON_SUNDAY] - LuxonToHeatMapWeekdays[datetime.weekday]);
    return datetime.minus({ "days": distanceFromNextColumnEnd })
  }

  getCountTooltip(commitCount: CommitCount) {
    var weekday: string = LuxonWeekdaysToString[commitCount.date.weekday]
    var dateStr = commitCount.date.toLocaleString()
    return `${weekday}
${commitCount.count} commit(s) on ${dateStr}`
  }

  getAuthor(): string {
    return this.isAnonymous() ? "Anonymous" : this.author().name;
  }
}
