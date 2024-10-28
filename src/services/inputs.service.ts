import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { debounceTime } from 'rxjs';
import { BitbucketService } from './bitbucket.service';
import { Person } from '../models/Person';
import { AnonymityService } from './AnonymityService.service';
import { PersonnelStore } from '../stores/personnel.store.service';
import { Features } from '../settings/features/Features';
import { QueryParamsStore } from '../../repos/common/angular/query-params';
import { GlobalQueryParams as GlobalQueryParams } from '../settings/global-query-params';
import { environment } from '../settings/environment/environment';
import { Views } from '../settings/features/Views';
import { FeatureService } from '../../repos/common/angular/feature-flags/feature.service';
import { FeatureFlags } from '../settings/features/FeatureFlags';

export interface IInputForm {
  overdueThreshold: FormControl<number | null>;
  commitDaysWindow: FormControl<number | null>;
  pullRequestDaysWindow: FormControl<number | null>;
  workspace: FormControl<string | null>;
  project: FormControl<string | null>;
  access_token: FormControl<string | null>;
  personnelFile: FormControl<File | null>;
  anonymity: FormControl<Person[] | null>;
  isAnonymityEnabled: FormControl<boolean | null>;
  view: FormControl<Views | null>;
  features: FormControl<Features[] | null>;
}

@Injectable({
  providedIn: 'root'
})
export class InputsService {
  form: FormGroup<IInputForm>;

  constructor(
    private personnelStore: PersonnelStore,
    private route: ActivatedRoute,
    private bitbucketService: BitbucketService,
    private anonymityService: AnonymityService,
    private queryParamStore: QueryParamsStore<GlobalQueryParams>,
    private featureService: FeatureService<Features, Views>,
  ) {
    this.form = this.buildForm();
    // TODO: clean up this cluttered garbage
    this.route.queryParamMap.subscribe(this.parseQueryParams.bind(this))
    // subscruibe all query param controls to query param changes
    // TODO: use new query param service in common-ts
    Object.keys(this.form.controls).forEach((key) => {
      if (!GlobalQueryParams.hasOwnProperty(key)) {
        return;
      }
      var control = this.form.controls[key as keyof typeof this.form.controls];
      this.subscribeToValueChanges(control);
    })
    // personnel
    this.form.controls.personnelFile.valueChanges.pipe(
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
    var file = new File([JSON.stringify(environment.personnel, null, 2)], "personnel.json", { type: "text/json" })
    this.form.controls.personnelFile.setValue(file);
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
        return;
      }
      var viewFeatures = this.featureService.views.find(view_ => view_.view == view);
      this.updateFeatureFlags(viewFeatures == null ? null : viewFeatures.features);
      if (viewFeatures == null) {
        return;
      }
      this.form.controls.features.setValue(viewFeatures!.features, { "emitEvent": false });
    });
    // features
    this.form.controls.features.valueChanges.subscribe(features => {      
      this.updateFeatureFlags(features);
      if (features == null) {
        this.form.controls.view.setValue(null);
        return;
      }
      if (features.length === 0) {
        this.form.controls.view.setValue(null);
      }
      var view: Views | null = Object.keys(Views).reduce((accumulator: string | null, view: string) => {
        var viewFeatures = this.featureService.views.find(view_ => view_.view == view);
        if (viewFeatures == null) {
          return accumulator;
        }
        var someFeatureDoesNotBelongInView = features.some(feature => viewFeatures!.features.includes(feature) == false);
        var featuresAreTheSameLength = this.featureService.views.length == features.length;
        if (someFeatureDoesNotBelongInView) {
          return accumulator;
        }
        if (featuresAreTheSameLength) {
          return view;
        }
        return accumulator;
      }, null) as Views | null;
      this.form.controls.view.setValue(view);
    });
  }

  updateFeatureFlags(features: Features[] | null) {
    if (features == null) {
      FeatureFlags.forEach(featureFlag => featureFlag.enabled = false);
      return;
    }
    FeatureFlags.forEach(featureFlag => {
      featureFlag.enabled = features.includes(featureFlag.feature);
    });
  }

  buildForm(): FormGroup<IInputForm> {
    return new FormGroup({
      [GlobalQueryParams.overdueThreshold]: new FormControl<number | null>(parseInt(this.queryParamStore.params[GlobalQueryParams.overdueThreshold]()[0])),
      [GlobalQueryParams.commitDaysWindow]: new FormControl<number | null>(parseInt(this.queryParamStore.params[GlobalQueryParams.commitDaysWindow]()[0])),
      [GlobalQueryParams.pullRequestDaysWindow]: new FormControl<number | null>(parseInt(this.queryParamStore.params[GlobalQueryParams.pullRequestDaysWindow]()[0])),
  
      [GlobalQueryParams.workspace]: new FormControl<string | null>(this.queryParamStore.params[GlobalQueryParams.workspace]()[0], [Validators.required]),
      [GlobalQueryParams.project]: new FormControl<string | null>(this.queryParamStore.params[GlobalQueryParams.project]()[0], [Validators.required]),
      [GlobalQueryParams.access_token]: new FormControl<string | null>(this.queryParamStore.params[GlobalQueryParams.access_token]()[0], [Validators.required]),
  
      personnelFile: new FormControl<File | null>(null),
      anonymity: new FormControl<Person[]>([]),
      isAnonymityEnabled: new FormControl<boolean>(true),
  
      view: new FormControl<Views | null>(null),
      features: new FormControl<Features[]>([]),
    });
  }

  subscribeToValueChanges(control: FormControl) {
    var name = this.getControlName(control) as GlobalQueryParams;
    this.route.queryParamMap.subscribe(params => {
      var queryParam = params.get(name);
      if (queryParam != control.value) {
        control.setValue(queryParam)
      }
    })
    control.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(value => {
      this.queryParamStore.set(name, value);
      if (name === GlobalQueryParams.workspace) {
        this.bitbucketService.getProjects(value);
      }
    });
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
    var workspace = params.get(GlobalQueryParams.workspace);
    if (workspace != this.queryParamStore.params[GlobalQueryParams.workspace]()[0]) {
      this.form.controls.workspace.setValue(workspace);
    }
    // overdue threshold
    var overdueThreshold = params.get(GlobalQueryParams.overdueThreshold);
    var overdueThresholdInt: number | null;
    if (typeof overdueThreshold === 'string') {
      overdueThresholdInt = parseInt(overdueThreshold)
    } else {
      overdueThresholdInt = null
    }
    this.form.controls.overdueThreshold.setValue(overdueThresholdInt)

    // commit days window
    var commitDaysWindow = params.get(GlobalQueryParams.commitDaysWindow);
    var commitDaysWindowInt: number | null;
    if (typeof commitDaysWindow === 'string') {
      commitDaysWindowInt = parseInt(commitDaysWindow)
    } else {
      commitDaysWindowInt = null
    }
    this.form.controls.commitDaysWindow.setValue(commitDaysWindowInt)

    // pull request days window
    var pullRequestDaysWindow = params.get(GlobalQueryParams.pullRequestDaysWindow);
    var pullRequestDaysWindowInt: number | null;
    if (typeof pullRequestDaysWindow === 'string') {
      pullRequestDaysWindowInt = parseInt(pullRequestDaysWindow)
    } else {
      pullRequestDaysWindowInt = null
    }
    this.form.controls.pullRequestDaysWindow.setValue(pullRequestDaysWindowInt)
  }
}
