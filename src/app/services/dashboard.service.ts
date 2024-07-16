import { Injectable } from '@angular/core';
import { LabelAndData } from '../models/LabelAndData';

@Injectable({
  providedIn: 'root'
})
export class ChartService {
  constructor() { }

  getPullRequestStatuses(pullRequests: any[]): LabelAndData<number>[] {
    var formattedData = pullRequests.map(pullRequest => {
      return pullRequest["state"];
    });
    var statusCounts: LabelAndData<number>[] = [];
    formattedData.forEach((status: string) => {
      var statusCount = statusCounts.find(count => count[0] == status)
      if (statusCount == undefined) {
        statusCount = [status, 0]
        statusCounts.push(statusCount)
      }
      statusCount[1]++;
    });
    return statusCounts;
  }
}
