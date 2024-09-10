import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppStore, QueryParamKey } from '../stores/app.store.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { debounceTime } from 'rxjs';
import { BitbucketService } from './bitbucket.service';
import { Person } from '../models/Person';
import { AnonymityService } from './AnonymityService.service';
import { PersonnelStore } from '../stores/personnel.store.service';
import { Feature } from '../models/Feature';
import { FeatureGroup } from '../models/FeatureGroup';
import { Views } from '../models/Views';

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

    personnel: new FormControl<File | null>(null),
    anonymity: new FormControl<Person[]>([]),
    isAnonymityEnabled: new FormControl<boolean>(true),

    view: new FormControl<FeatureGroup | null>(null),
    features: new FormControl<Feature[]>([]),
  });

  constructor(
    private appStore: AppStore,
    private personnelStore: PersonnelStore,
    private route: ActivatedRoute,
    private bitbucketService: BitbucketService,
    private anonymityService: AnonymityService
  ) {
    // TODO: clean up this cluttered garbage
    this.route.queryParamMap.subscribe(this.parseQueryParams.bind(this))
    // subscruibe all query param controls to query param changes
    // TODO: use new query param service in common-ts
    Object.keys(this.form.controls).forEach((key) => {
      if (!QueryParamKey.hasOwnProperty(key)) {
        return;
      }
      var control = this.form.controls[key as keyof typeof this.form.controls];
      this.subscribeToValueChanges(control);
    })
    // personnel
    this.form.controls.personnel.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(file => {
      if (file == null) {
        return;
      }
      file.text()
        .then(json => {
          var personnel = JSON.parse(json) as Person[];
          this.personnelStore.personnel.set(personnel);
        })
    });
    // anonymity
    this.form.controls.anonymity.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(anonymity => {
      if (anonymity == null) {
        this.anonymityService.anonymity.set([]);
      }
      this.anonymityService.anonymity.set(anonymity!);
    });
    // is anonymous enabled
    this.form.controls.isAnonymityEnabled.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(anonymityEnabled => {
      if (anonymityEnabled == null) {
        this.anonymityService.isAnonymityEnabled.set(true);
      }
      this.anonymityService.isAnonymityEnabled.set(anonymityEnabled!);
    });
    // view
    this.form.controls.view.valueChanges.subscribe(view => {
      if (view == null) {
        // this.form.controls.features.setValue([], { "emitEvent": false });
        return;
      }
      var features = Views[view];
      this.form.controls.features.setValue(features, { "emitEvent": false });
    });
    // features
    this.form.controls.features.valueChanges.subscribe(features => {
      if (features == null) {
        this.form.controls.view.setValue(null);
        return;
      }
      if (features.length === 0) {
        this.form.controls.view.setValue(null);
      }
      var view: FeatureGroup | null = Object.keys(Views).reduce((accumulator: string | null, view: string) => {
        var viewFeatures = Views[view as FeatureGroup];
        var someFeatureDoesNotBelongInView = features.some(feature => viewFeatures.includes(feature) == false);
        var featuresAreTheSameLength = viewFeatures.length == features.length;
        if (someFeatureDoesNotBelongInView) {
          return accumulator;
        }
        if (featuresAreTheSameLength) {
          return view;
        }
        return accumulator;
      }, null) as FeatureGroup | null;
      this.form.controls.view.setValue(view);
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
