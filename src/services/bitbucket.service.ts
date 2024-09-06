import { Injectable } from '@angular/core';
import { concatMap, mergeAll, map, Observable } from 'rxjs';
import { PullRequest } from '../models/bitbucket/PullRequest';
import { AppStore, QueryParamKey } from '../stores/app.store.service';
import { BitbucketAPI } from './bitbucket-api.service';
import { PullRequestsStore } from '../stores/pull-requests.store.service';
import { BitbucketRepository } from '../models/bitbucket/BitbucketRepository';
import { Commit } from '../models/bitbucket/Commit';
import { CommitsStore } from '../stores/commits.store.service';
import { Project } from '../models/bitbucket/Project';
import { PersonnelStore } from '../stores/personnel.store.service';

@Injectable({
  providedIn: 'root'
})
export class BitbucketService {
  constructor(
    private bitbucketAPI: BitbucketAPI,
    private appStore: AppStore,
    private personnelStore: PersonnelStore,
    private pullRequestsStore: PullRequestsStore,
    private commitsStore: CommitsStore,
  ) { }

  getProjects(workspace: string) {
    var projectsObservable = this.bitbucketAPI.getProjects(workspace)
    var allProjects: Project[] = [];
    this.appStore.itemsLoading.set(this.appStore.itemsLoading() + 1);
    // fetch pull requests
    projectsObservable.subscribe({
      next: (projects) => {
        allProjects = allProjects.concat(projects)
      },
      error: (error) => {
        this.appStore.addError('fetching projects', error)
      },
      complete: () => {
        this.appStore.removeError('fetching projects')
        this.appStore.itemsLoading.set(this.appStore.itemsLoading() - 1);
        this.appStore.projects.set(allProjects);
      }
    })
  }

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
        this.personnelStore.upsertPersonnelFromPullRequests(allPullRequests);
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
        this.personnelStore.upsertPersonnelFromCommits(allCommits);
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
