import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppStore, QueryParamKey } from '../stores/app.store.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { debounceTime } from 'rxjs';
import { BitbucketService } from './bitbucket.service';
import { Person } from '../models/Personnel';
import { AnonymityService } from './AnonymityService.service';
import { PersonnelStore } from '../stores/personnel.store.service';

@Injectable({
  providedIn: 'root'
})
export class InputsService {
  form = new FormGroup({
    [QueryParamKey.overdueThreshold]: new FormControl<number | null>(this.appStore.queryParams[QueryParamKey.overdueThreshold]()),
    [QueryParamKey.commitDaysWindow]: new FormControl<number | null>(this.appStore.queryParams[QueryParamKey.commitDaysWindow]()),
    [QueryParamKey.pullRequestDaysWindow]: new FormControl<number | null>(this.appStore.queryParams[QueryParamKey.pullRequestDaysWindow]()),

    [QueryParamKey.workspace]: new FormControl<string | null>(this.appStore.queryParams[QueryParamKey.workspace](), [Validators.required]),
    [QueryParamKey.project]: new FormControl<string | null>(this.appStore.queryParams[QueryParamKey.project](), [Validators.required]),
    [QueryParamKey.access_token]: new FormControl<string | null>(this.appStore.queryParams[QueryParamKey.access_token](), [Validators.required]),
    personnel: new FormControl<string | null>(JSON.stringify(this.personnelStore.personnel())),
    anonymity: new FormControl<Person[]>([]),
    isAnonymityEnabled: new FormControl<boolean>(true),
  });

  constructor(
    private appStore: AppStore,
    private personnelStore: PersonnelStore,
    private route: ActivatedRoute,
    private bitbucketService: BitbucketService,
    private anonymityService: AnonymityService
  ) {
    this.route.queryParamMap.subscribe(this.parseQueryParams.bind(this))
    Object.keys(this.form.controls).forEach((key) => {
      if (!QueryParamKey.hasOwnProperty(key)) {
        return;
      }
      var control = this.form.controls[key as keyof typeof this.form.controls];
      this.subscribeToValueChanges(control);
    })
    this.form.controls.personnel.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(value => {
      if (value == null) {
        return;
      }
      var personnel = JSON.parse(value) as Person[];
      this.personnelStore.personnel.set(personnel);
    });
    this.form.controls.anonymity.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(anonymity => {
      if (anonymity == null) {
        this.anonymityService.anonymity.set([]);
      }
      this.anonymityService.anonymity.set(anonymity!);
    });
    this.form.controls.isAnonymityEnabled.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(anonymityEnabled => {
      if (anonymityEnabled == null) {
        this.anonymityService.isAnonymityEnabled.set(true);
      }
      this.anonymityService.isAnonymityEnabled.set(anonymityEnabled!);
    });
  }

  subscribeToValueChanges(control: FormControl) {
    var name = this.getControlName(control);
    this.route.queryParamMap.subscribe(params => {
      var queryParam = params.get(name);
      this.appStore.updateStoredQueryParam(name, queryParam);
      this.updateControlValue(control, queryParam);
    })
    control.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(value => {
      this.appStore.updateStoredQueryParam(name, value);
      this.appStore.updateQueryParam(name, value);
      if (name === QueryParamKey.workspace) {
        this.bitbucketService.getProjects(value);
      }
    });
  }

  updateControlValue(control: FormControl, value: any) {
    if (value != control.value) {
      control.setValue(value)
    }
  }

  getControlName(control: FormControl): string {
    var parent = control.parent
    if (parent == null) {
      throw new Error("This control has no parent! There's no way to know what name it has")
    }
    var name = Object.entries(parent.controls).find(entry => entry[1] == control)?.[0]
    if (name == undefined) {
      throw new Error("Could not find the name of the control")
    }
    return name;
  }

  parseQueryParams(params: ParamMap) {
    // workspace
    var workspace = params.get(QueryParamKey.workspace);
    if (workspace != this.appStore.queryParams[QueryParamKey.workspace]()) {
      this.form.controls.workspace.setValue(workspace);
    }
    // overdue threshold
    var overdueThreshold = params.get(QueryParamKey.overdueThreshold);
    var overdueThresholdInt: number | null;
    if (typeof overdueThreshold === 'string') {
      overdueThresholdInt = parseInt(overdueThreshold)
    } else {
      overdueThresholdInt = null
    }
    this.form.controls.overdueThreshold.setValue(overdueThresholdInt)

    // commit days window
    var commitDaysWindow = params.get(QueryParamKey.commitDaysWindow);
    var commitDaysWindowInt: number | null;
    if (typeof commitDaysWindow === 'string') {
      commitDaysWindowInt = parseInt(commitDaysWindow)
    } else {
      commitDaysWindowInt = null
    }
    this.form.controls.commitDaysWindow.setValue(commitDaysWindowInt)

    // pull request days window
    var pullRequestDaysWindow = params.get(QueryParamKey.pullRequestDaysWindow);
    var pullRequestDaysWindowInt: number | null;
    if (typeof pullRequestDaysWindow === 'string') {
      pullRequestDaysWindowInt = parseInt(pullRequestDaysWindow)
    } else {
      pullRequestDaysWindowInt = null
    }
    this.form.controls.pullRequestDaysWindow.setValue(pullRequestDaysWindowInt)
  }
}
