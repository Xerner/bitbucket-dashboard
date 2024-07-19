import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppStore, QueryParamKey } from "../stores/app.store.service";
import { filter, from, map, Observable, takeWhile } from "rxjs";
import { BitbucketApiResponse } from "../models/BitbucketApiResponse";
import { PullRequest } from "../models/PullRequest";
import { BitbucketRepository } from "../models/BitbucketRepository";
import { Commit } from "../models/Commit";
import { DateTime } from "luxon";

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

  getPullRequests(repository: string) {
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<PullRequest>>(
        `${this.REPOSITORIES_URL}/${this.appStore.queryParams['workspace']()}/${repository}/pullrequests`,
        { headers: this.getHeaders(this.appStore.queryParams['access_token']()) })
    )
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
    var daysWindow = this.appStore.queryParams[QueryParamKey.daysWindow]();
    if (daysWindow == null) {
      return []; // do not send a request to retrieve all commits without filtering them by date (or some other means)
    }
    var dateForQuery = DateTime.now().toUTC().startOf('day').minus({ 'days': daysWindow - 1 });
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<Commit>>(
        `${this.REPOSITORIES_URL}/${this.appStore.queryParams['workspace']()}/${repository}/commits`,
        { headers: this.getHeaders(this.appStore.queryParams['access_token']()) })
      , this.allCommitsAreInsideDateWindow.bind(this, dateForQuery)
    ).pipe(map((commits) => commits.filter(commit => this.isCommitInsideDateWindow(commit, dateForQuery))))
  }

  allCommitsAreInsideDateWindow(dateWindow: DateTime, commits: Commit[]) {
    var allCommitsAreInsideDateWindow = commits.every(commit => this.isCommitInsideDateWindow(commit, dateWindow));
    return allCommitsAreInsideDateWindow
  }

  isCommitInsideDateWindow(commit: Commit, dateWindow: DateTime) {
    return DateTime.fromISO(commit.date) > dateWindow;
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
}
