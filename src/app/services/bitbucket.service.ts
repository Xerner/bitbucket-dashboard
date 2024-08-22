import { Injectable } from '@angular/core';
import { share, concatMap, mergeAll, map, Observable } from 'rxjs';
import { PullRequest } from '../models/PullRequest';
import { AppStore, QueryParamKey } from '../stores/app.store.service';
import { BitbucketAPI } from './bitbucket-api.service';
import { PullRequestsStore } from '../stores/pull-requests.store.service';
import { BitbucketRepository } from '../models/BitbucketRepository';
import { Commit } from '../models/Commit';
import { CommitsStore } from '../stores/commits.store.service';

@Injectable({
  providedIn: 'root'
})
export class BitbucketService {
  constructor(
    private bitbucketAPI: BitbucketAPI,
    private appStore: AppStore,
    private pullRequestsStore: PullRequestsStore,
    private commitsStore: CommitsStore,
  ) { }

  getPullRequestsFromRepositories(reposObservable: Observable<BitbucketRepository[]>) {
    var allPullRequests: PullRequest[] = [];
    this.appStore.itemsLoading.set(this.appStore.itemsLoading() + 1);
    // fetch pull requests
    reposObservable.pipe(
      concatMap(repositories => repositories.map(repository => this.bitbucketAPI.getPullRequests(repository.uuid))),
      mergeAll(),
      map((pullRequests) => pullRequests.flat())
    ).subscribe({
      next: (pullRequests) => {
        allPullRequests = allPullRequests.concat(pullRequests)
      },
      error: (error) => {
        this.appStore.addError('fetching pull requests', error)
      },
      complete: () => {
        this.appStore.removeError('fetching pull requests')
        this.appStore.itemsLoading.set(this.appStore.itemsLoading() - 1);
        this.pullRequestsStore.pullRequests.set(allPullRequests);
      }
    })
  }

  getCommitsFromRepositories(reposObservable: Observable<BitbucketRepository[]>) {
    var allCommits: Commit[] = [];
    this.appStore.itemsLoading.set(this.appStore.itemsLoading() + 1);
    reposObservable.pipe(
      concatMap(repositories => repositories.map(repository => this.bitbucketAPI.getCommits(repository.uuid))),
      mergeAll(),
      map((commits) => commits.flat())
    ).subscribe({
      next: (commits) => {
        allCommits = allCommits.concat(commits)
      },
      error: (error) => {
        this.appStore.addError('fetching commits', error)
      },
      complete: () => {
        this.appStore.removeError('fetching commits')
        this.appStore.itemsLoading.set(this.appStore.itemsLoading() - 1);
        this.commitsStore.commits.set(allCommits);
      }
    })
  }

  getPullRequests() {
    var repositoriesSharedObservable = this.bitbucketAPI.getRepositories(this.appStore.queryParams[QueryParamKey.project]())
    return this.getPullRequestsFromRepositories(repositoriesSharedObservable);
  }

  getCommits() {
    var repositoriesSharedObservable = this.bitbucketAPI.getRepositories(this.appStore.queryParams[QueryParamKey.project]())
    return this.getCommitsFromRepositories(repositoriesSharedObservable);
  }
}
