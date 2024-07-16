import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppStore } from "../stores/app.store.service";


@Injectable({
  providedIn: "root",
})
export class BitbucketAPI {
  readonly BASE_URL = "https://api.bitbucket.org/2.0/"
  readonly REPOSITORIES_URL = this.BASE_URL + "repositories"

  constructor(
    private http: HttpClient,
    private appStore: AppStore
  ) {}

  getPullRequests() {
    return this.http.get<{ values: any[] }>(
      `${this.REPOSITORIES_URL}/${this.appStore.workspace()}/${this.appStore.repository()}/pullrequests`,
      { headers: this.getHeaders(this.appStore.token()) }
    );
  }

  getHeaders(token: string | null): HttpHeaders | { [header: string]: string | string[]; } {
    return {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  }
}
