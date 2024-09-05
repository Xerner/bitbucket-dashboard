import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppStore, QueryParamKey } from "../stores/app.store.service";
import { from, map, Observable } from "rxjs";
import { BitbucketApiResponse } from "../models/bitbucket/BitbucketApiResponse";
import { BitbucketRepository } from "../models/bitbucket/BitbucketRepository";
import { DateTime } from "luxon";
import { Project } from "../models/bitbucket/Project";
import { Commit } from "../models/bitbucket/Commit";
import { PullRequest } from "../models/bitbucket/PullRequest";

export enum PULL_REQUEST_STATES {
  OPEN = "OPEN",
  MERGED = "MERGED",
  DECLINED = "DECLINED",
  SUPERSEDED = "SUPERSEDED",
}

@Injectable({
  providedIn: "root",
})
export class BitbucketAPI {
  readonly BASE_URL = "https://api.bitbucket.org/2.0/"
  readonly REPOSITORIES_URL = this.BASE_URL + "repositories"
  readonly MAX_PAGE_COUNT = 10000;

  constructor(
    private http: HttpClient,
    private appStore: AppStore
  ) { }

  getAllPages<T>(entryObservable: Observable<BitbucketApiResponse<T>>, takeWhile: ((item: T[]) => boolean) | null = null, queryParams: HttpParams | null = null, count = 0) {
    if (count > this.MAX_PAGE_COUNT) {
      return from([])
    }
    count++;
    return new Observable<T[]>(subscriber => {
      entryObservable.subscribe(results => {
        subscriber.next(results.values);
        if (takeWhile != null && !takeWhile(results.values)) {
          subscriber.complete();
          return;
        }
        if (results.next != null && results.next != undefined) {
          this.getAllPages(this.http.get<BitbucketApiResponse<T>>(
            results.next,
            { params: queryParams ?? {}, headers: this.getHeaders(this.appStore.queryParams['access_token']()) }
          ), takeWhile, queryParams, count)
            .subscribe({
              next: (values) => {
                subscriber.next(values)
              },
              error: (error) => {
                subscriber.error(error)
              },
              complete: () => {
                subscriber.complete()
              }
            });
        } else {
          subscriber.complete();
        }
      })
    });
  }

  //#region REST endpoints

  getProjects(workspace: string) {
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<Project>>(
        `https://api.bitbucket.org/2.0/workspaces/${workspace}/projects`,
        {
          headers: this.getHeaders(this.appStore.queryParams['access_token']())
        }
      )
    )
  }

  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-get
  getPullRequests(repository: string) {
    var states = Object.values(PULL_REQUEST_STATES).map(state => "state=" + state)
    var queryStr: string = states.join("&")
    var dateForQuery = this.getDateFromDateWindowForQuery(this.appStore.queryParams[QueryParamKey.pullRequestDaysWindow]());
    if (dateForQuery == null) {
      return [];
    }
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<PullRequest>>(
        `${this.REPOSITORIES_URL}/${this.appStore.queryParams['workspace']()}/${repository}/pullrequests?${queryStr}&fields=%2Bvalues.participants`,
        {
          headers: this.getHeaders(this.appStore.queryParams['access_token']())
        }
      ),
      (this.allAreInsideDateWindow<PullRequest>).bind(this, dateForQuery, this.isPullRequestInsideDateWindow)
    ).pipe(map((pullRequests) => pullRequests.filter(pullRequest => this.isPullRequestInsideDateWindow(pullRequest, dateForQuery!))))
  }

  getRepositories(project: string) {
    var queryParams = new HttpParams()
    queryParams = queryParams.set("q", `project.name="${project}"`)
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<BitbucketRepository>>(
        `${this.REPOSITORIES_URL}/${this.appStore.queryParams['workspace']()}`,
        { params: queryParams, headers: this.getHeaders(this.appStore.queryParams['access_token']()) })
      , null, queryParams)
  }

  getCommits(repository: string) {
    var dateForQuery = this.getDateFromDateWindowForQuery(this.appStore.queryParams[QueryParamKey.commitDaysWindow]());
    if (dateForQuery == null) {
      return [];
    }
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<Commit>>(
        `${this.REPOSITORIES_URL}/${this.appStore.queryParams['workspace']()}/${repository}/commits`,
        {
          headers: this.getHeaders(this.appStore.queryParams['access_token']())
        }
      ),
      (this.allAreInsideDateWindow<Commit>).bind(this, dateForQuery, this.isCommitInsideDateWindow)
    ).pipe(map((commits) => commits.filter(commit => this.isCommitInsideDateWindow(commit, dateForQuery!))))
  }

  //#endregion

  //#region helpers

  allAreInsideDateWindow<T>(dateWindow: DateTime, checker: (item: T, datewindow: DateTime) => boolean, items: T[]) {
    var allCommitsAreInsideDateWindow = items.every(item => checker(item, dateWindow));
    return allCommitsAreInsideDateWindow
  }

  isCommitInsideDateWindow(commit: Commit, dateWindow: DateTime) {
    return DateTime.fromISO(commit.date) > dateWindow;
  }

  isPullRequestInsideDateWindow(pullRequest: PullRequest, dateWindow: DateTime) {
    return DateTime.fromISO(pullRequest.created_on) > dateWindow;
  }

  getHeaders(token: string | null): HttpHeaders | { [header: string]: string | string[]; } {
    return {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  }

  getTotalPages<T>(response: BitbucketApiResponse<T>) {
    return response.page * (response.page)
  }

  private getDateFromDateWindowForQuery(daysWindow: number | null) {
    if (daysWindow == null) {
      return null; // do not send a request to retrieve all commits without filtering them by date (or some other means)
    }
    return DateTime.now().toUTC().startOf('day').minus({ 'days': daysWindow - 1 });
  }

  //#endregion
}
