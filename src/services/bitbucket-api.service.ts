import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { filter, from, map, merge, Observable, of } from "rxjs";
import { BitbucketApiResponse } from "../models/bitbucket/BitbucketApiResponse";
import { BitbucketRepository } from "../models/bitbucket/BitbucketRepository";
import { DateTime } from "luxon";
import { Project } from "../models/bitbucket/Project";
import { Commit } from "../models/bitbucket/Commit";
import { PullRequest } from "../models/bitbucket/PullRequest";
import { DatesService } from "./dates.service";
import { QueryParamsStore } from "../../repos/common/angular/services/query-params";
import { GlobalQueryParams } from "../settings/global-query-params";
import { ApiHelperService } from "../../repos/common/library";

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
    private datesService: DatesService,
    private queryParamsStore: QueryParamsStore<GlobalQueryParams>,
    private apiHelpers: ApiHelperService,
  ) { }

  //#region REST endpoints

  getProjects(workspace: string) {
    return this.apiHelpers.getAllPages(
      this.http.get<BitbucketApiResponse<Project>>(
        `https://api.bitbucket.org/2.0/workspaces/${workspace}/projects`,
        {
          headers: this.getHeaders(this.queryParamsStore.params.accessToken()[0])
        }
      ),
      this.getHeaders(this.queryParamsStore.params.accessToken()[0])
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
    return this.apiHelpers.getAllPages(
      this.http.get<BitbucketApiResponse<PullRequest>>(
        `${this.REPOSITORIES_URL}/${this.queryParamsStore.params.workspace()[0]}/${repository}/pullrequests`,
        {
          headers: this.getHeaders(this.queryParamsStore.params.accessToken()[0]),
          params: queryParams
        }
      ), 
      this.getHeaders(this.queryParamsStore.params.accessToken()[0]),
      null, 
      queryParams
    )
  }

  private getPullRequestsUpToDate(repository: string) {
    var queryParams = new HttpParams()
    queryParams = queryParams.append("sort", "-updated_on")
    queryParams = queryParams.append("fields", "+values.participants")
    // by default, the api returns only open pull requests
    Object.values(PULL_REQUEST_STATES).forEach(state => {
      queryParams = queryParams.append("state", state)
    })
    var endDate = DateTime.fromISO(this.queryParamsStore.params.prEndDate()[0]);
    var startDate = DateTime.fromISO(this.queryParamsStore.params.prStartDate()[0]);
    if (startDate == null || endDate == null) {
      return of([]);
    }
    var takeWhile = (this.allAreInsideDateWindow<PullRequest>).bind(this, startDate, DateTime.now(), this.datesService.isPullRequestInsideDateWindow.bind(this.datesService));
    return this.apiHelpers.getAllPages(
      this.http.get<BitbucketApiResponse<PullRequest>>(
        `${this.REPOSITORIES_URL}/${this.queryParamsStore.params.workspace()[0]}/${repository}/pullrequests`,
        {
          headers: this.getHeaders(this.queryParamsStore.params.accessToken()[0]),
          params: queryParams
        }
      ),
      this.getHeaders(this.queryParamsStore.params.accessToken()[0]),
      takeWhile, 
      queryParams
    ).pipe(map((pullRequests) => pullRequests.filter(pullRequest => this.datesService.isPullRequestInsideDateWindow(pullRequest, startDate, endDate))))
  }

  getRepositories(project: string) {
    var queryParams = new HttpParams()
    queryParams = queryParams.set("q", `project.name="${project}"`)
    return this.apiHelpers.getAllPages(
      this.http.get<BitbucketApiResponse<BitbucketRepository>>(
        `${this.REPOSITORIES_URL}/${this.queryParamsStore.params.workspace()}`,
        { params: queryParams, headers: this.getHeaders(this.queryParamsStore.params.accessToken()[0]) }
      ), 
      this.getHeaders(this.queryParamsStore.params.accessToken()[0]),
      null, 
      queryParams)
  }

  getCommits(repository: string) {
    var startDate = DateTime.fromISO(this.queryParamsStore.params.commitsStartDate()[0]);
    var endDate = DateTime.fromISO(this.queryParamsStore.params.commitsEndDate()[0]);
    if (startDate == null || endDate == null) {
      return [];
    }
    var takeUntil = (this.allAreInsideDateWindow<Commit>).bind(this, startDate, DateTime.now(), this.datesService.isCommitInsideDateWindow.bind(this.datesService));
    return this.apiHelpers.getAllPages(
      this.http.get<BitbucketApiResponse<Commit>>(
        `${this.REPOSITORIES_URL}/${this.queryParamsStore.params.workspace()}/${repository}/commits`,
        {
          headers: this.getHeaders(this.queryParamsStore.params.accessToken()[0])
        }
      ),
      this.getHeaders(this.queryParamsStore.params.accessToken()[0]),
      takeUntil
    ).pipe(map((commits) => commits.filter(commit => this.datesService.isCommitInsideDateWindow(commit, startDate, endDate))))
  }

  //#endregion

  //#region helpers

  allAreInsideDateWindow<T>(startDate: DateTime, endDate: DateTime, checker: (item: T, startDate: DateTime, endDate: DateTime) => boolean, items: T[]) {
    var allCommitsAreInsideDateWindow = items.every(item => checker(item, startDate, endDate));
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
