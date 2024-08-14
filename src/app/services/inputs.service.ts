import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppStore } from '../stores/app.store.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InputsService {
  form = new FormGroup({
    overdueThreshold: new FormControl<number | null>(this.appStore.queryParams['overdueThreshold']()),
    daysWindow: new FormControl<number | null>(this.appStore.queryParams['daysWindow']()),

    workspace: new FormControl<string | null>(this.appStore.queryParams['workspace'](), [Validators.required]),
    project: new FormControl<number | null>(this.appStore.queryParams['project'](), [Validators.required]),
    access_token: new FormControl<string | null>(this.appStore.queryParams['access_token'](), [Validators.required]),
    author_aliases: new FormControl<string | null>(this.appStore.queryParams['author_aliases']()),
  });

  constructor(
    private appStore: AppStore,
    private route: ActivatedRoute,
  ) {
    this.route.queryParamMap.subscribe(this.parseQueryParams.bind(this))
    Object.keys(this.form.controls).forEach((key) => {
      var control = this.form.controls[key as keyof typeof this.form.controls];
      this.subscribeToValueChanges(control);
    })
  }

  subscribeToValueChanges(control: FormControl) {
    var name = this.getControlName(control);
    this.route.queryParamMap.subscribe(params => {
      var queryParam = params.get(name);
      this.appStore.updateStoredQueryParam(name, queryParam);
      this.updateControlValue(control, queryParam);
    })
    control.valueChanges.subscribe(value => {
      this.appStore.updateStoredQueryParam(name, value);
      this.appStore.updateQueryParam(name, value);
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
    var workspace = params.get('workspace');
    if (workspace != this.appStore.queryParams['workspace']()) {
      this.form.controls.workspace.setValue(workspace);
    }
    var overdueThreshold = params.get('overdueThreshold');
    var overdueThresholdInt: number | null;
    if (typeof overdueThreshold === 'string') {
      overdueThresholdInt = parseInt(overdueThreshold)
    } else {
      overdueThresholdInt = null
    }
    this.form.controls.overdueThreshold.setValue(overdueThresholdInt)

    var daysWindow = params.get('daysWindow');
    var daysWindowInt: number | null;
    if (typeof daysWindow === 'string') {
      daysWindowInt = parseInt(daysWindow)
    } else {
      daysWindowInt = null
    }
    this.form.controls.daysWindow.setValue(daysWindowInt)
  }
}
