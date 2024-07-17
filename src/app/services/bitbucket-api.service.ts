import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppStore } from "../stores/app.store.service";
import { map, Observable, subscribeOn, Subscriber } from "rxjs";
import { BitbucketApiResponse } from "../models/BitbucketApiResponse";
import { PullRequest } from "../models/PullRequest";
import { BitbucketRepository } from "../models/BitbucketRepository";


@Injectable({
  providedIn: "root",
})
export class BitbucketAPI {
  readonly BASE_URL = "https://api.bitbucket.org/2.0/"
  readonly REPOSITORIES_URL = this.BASE_URL + "repositories"

  constructor(
    private http: HttpClient,
    private appStore: AppStore
  ) { }

  getAllPages<T>(entryObservable: Observable<BitbucketApiResponse<T>>) {
    return new Observable<T[]>(subscriber => {
      entryObservable.subscribe(results => {
        subscriber.next(results.values);
        if (results.next != null && results.next != undefined) {
          this.getAllPages(this.http.get<BitbucketApiResponse<T>>(
            results.next,
            { headers: this.getHeaders(this.appStore.token()) }))
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
        `${this.REPOSITORIES_URL}/${this.appStore.workspace()}/${repository}/pullrequests`,
        { headers: this.getHeaders(this.appStore.token()) })
    )
  }

  getRepositories() {
    return this.getAllPages(
      this.http.get<BitbucketApiResponse<BitbucketRepository>>(
        `${this.REPOSITORIES_URL}/${this.appStore.workspace()}`,
        { headers: this.getHeaders(this.appStore.token()) })
    )
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
