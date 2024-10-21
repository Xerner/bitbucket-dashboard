import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppStore } from "../stores/app.store.service";
import { filter, from, map, merge, Observable, of } from "rxjs";
import { BitbucketApiResponse } from "../models/bitbucket/BitbucketApiResponse";
import { BitbucketRepository } from "../models/bitbucket/BitbucketRepository";
import { DateTime } from "luxon";
import { Project } from "../models/bitbucket/Project";
import { Commit } from "../models/bitbucket/Commit";
import { PullRequest } from "../models/bitbucket/PullRequest";
import { DatesService } from "./dates.service";
import { QueryParamsStore } from "../../repos/common/angular/query-params";
import { GlobalQueryParams } from "../settings/global-query-params";

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
    private appStore: AppStore,
    private datesService: DatesService,
    private queryParamsStore: QueryParamsStore<GlobalQueryParams>,
  ) { }

  getAllPages<T>(entryObservable: Observable<BitbucketApiResponse<T>>, takeWhile: ((item: T[]) => boolean) | null = null, queryParams: HttpParams | {} = {}, count = 0) {
    if (count > this.MAX_PAGE_COUNT) {
      return from([])
    }
    count++;
    return new Observable<T[]>(subscriber => {
      entryObservable.subscribe(results => {
        subscriber.next(results.values);
        var hasNext = results.next != null && results.next != undefined;
        var shouldTakeNext = takeWhile != null && takeWhile(results.values);
        if (hasNext == false || shouldTakeNext == false) {
          subscriber.complete();
          return;
        }
        this.getAllPages(this.http.get<BitbucketApiResponse<T>>(
          results.next,
          { params: queryParams, headers: this.getHeaders(this.queryParamsStore.params[GlobalQueryParams.access_token]()[0]) }
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
      })
    });
  }

  //#region REST endpoints

  getProjects(workspace: string) {
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<Project>>(
        `https://api.bitbucket.org/2.0/workspaces/${workspace}/projects`,
        {
          headers: this.getHeaders(this.queryParamsStore.params[GlobalQueryParams.access_token]()[0])
        }
      )
    )
  }

  // https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-get
  getPullRequests(repository: string) {
    var alreadyFetchedIds = new Set<number>();
    return merge(this.getOpenPullRequests(repository), this.getPullRequestsUpToDate(repository))
      .pipe(
        map((prs) => prs.filter(pr => this.tryAddToSet(pr.id, alreadyFetchedIds))),
        filter(prs => prs.length != 0)
      )
  }

  /**
   * Attemps to add the item to the set
   * @returns returns true if it did not already exist, false if it did
   */
  tryAddToSet<TKey>(key: TKey, set: Set<TKey>): boolean {
    if (set.has(key)) {
      return false;
    }
    set.add(key)
    return true;
  }

  private getOpenPullRequests(repository: string) {
    var queryParams = new HttpParams()
    queryParams = queryParams.append("fields", "+values.participants")
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<PullRequest>>(
        `${this.REPOSITORIES_URL}/${this.queryParamsStore.params[GlobalQueryParams.workspace]()[0]}/${repository}/pullrequests`,
        {
          headers: this.getHeaders(this.queryParamsStore.params[GlobalQueryParams.access_token]()[0]),
          params: queryParams
        }
      ), null, queryParams
    )
  }

  private getPullRequestsUpToDate(repository: string) {
    var queryParams = new HttpParams()
    queryParams = queryParams.append("sort", "-created_on")
    queryParams = queryParams.append("fields", "+values.participants")
    // by default, the api returns only open pull requests
    Object.values(PULL_REQUEST_STATES).forEach(state => {
      queryParams = queryParams.append("state", state)
    })
    var daysWindow = parseInt(this.queryParamsStore.params[GlobalQueryParams.pullRequestDaysWindow]()[0]);
    var dateForQuery = this.datesService.getDateFromDateWindowForQuery(daysWindow);
    if (dateForQuery == null) {
      return of([]);
    }
    var takeWhile = (this.allAreInsideDateWindow<PullRequest>).bind(this, dateForQuery!, this.datesService.isPullRequestInsideDateWindow);
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<PullRequest>>(
        `${this.REPOSITORIES_URL}/${this.queryParamsStore.params[GlobalQueryParams.workspace]()[0]}/${repository}/pullrequests`,
        {
          headers: this.getHeaders(this.queryParamsStore.params[GlobalQueryParams.access_token]()[0]),
          params: queryParams
        }
      ),
      takeWhile, queryParams
    ).pipe(map((pullRequests) => pullRequests.filter(pullRequest => this.datesService.isPullRequestInsideDateWindow(pullRequest, dateForQuery!))))
  }

  getRepositories(project: string) {
    var queryParams = new HttpParams()
    queryParams = queryParams.set("q", `project.name="${project}"`)
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<BitbucketRepository>>(
        `${this.REPOSITORIES_URL}/${this.queryParamsStore.params[GlobalQueryParams.workspace]()}`,
        { params: queryParams, headers: this.getHeaders(this.queryParamsStore.params[GlobalQueryParams.access_token]()[0]) })
      , null, queryParams)
  }

  getCommits(repository: string) {
    var daysWindow = parseInt(this.queryParamsStore.params[GlobalQueryParams.commitDaysWindow]()[0]);
    var dateForQuery = this.datesService.getDateFromDateWindowForQuery(daysWindow);
    if (dateForQuery == null) {
      return [];
    }
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<Commit>>(
        `${this.REPOSITORIES_URL}/${this.queryParamsStore.params[GlobalQueryParams.workspace]()}/${repository}/commits`,
        {
          headers: this.getHeaders(this.queryParamsStore.params[GlobalQueryParams.access_token]()[0])
        }
      ),
      (this.allAreInsideDateWindow<Commit>).bind(this, dateForQuery, this.datesService.isCommitInsideDateWindow)
    ).pipe(map((commits) => commits.filter(commit => this.datesService.isCommitInsideDateWindow(commit, dateForQuery!))))
  }

  //#endregion

  //#region helpers

  allAreInsideDateWindow<T>(dateWindow: DateTime, checker: (item: T, datewindow: DateTime) => boolean, items: T[]) {
    var allCommitsAreInsideDateWindow = items.every(item => checker(item, dateWindow));
    return allCommitsAreInsideDateWindow
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

  //#endregion
}
