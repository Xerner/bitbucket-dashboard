import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppStore } from '../../stores/app.store.service';
import { BitbucketAPI } from '../../services/bitbucket-api.service';
import { share } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InputsService } from '../../services/inputs.service';
import { BitbucketService } from '../../services/bitbucket.service';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PersonnelStore } from '../../stores/personnel.store.service';
import { FileInputComponent } from "../../../repos/common/angular/components";
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CodeDialogComponent, ICodeDialogComponent } from './code-dialog/code-dialog.component';
import PERSONNEL_JSON_SCHEMA from '../../settings/personnel-json-schema.json'
import PERSONNEL_JSON_EXAMPLE from '../../settings/personnel-json-example.json'
import { MatFormFieldModule } from '@angular/material/form-field';
import { Features } from '../../settings/features/Features';
import { QueryParamsStore } from '../../../repos/common/angular/services/query-params';
import { GlobalQueryParams } from '../../settings/global-query-params';
import { Views } from '../../settings/features/Views';

@Component({
  selector: 'app-api-inputs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    FileInputComponent,
],
  templateUrl: "inputs.component.html",
})
export class InputsComponent {
  Views = Object.values(Views);
  Features = Object.entries(Features);
  @ViewChild('filterInput', { static: true })
  filterInput!: ElementRef<HTMLInputElement>;
  isLoadingProjects = signal<boolean>(false);

  constructor(
    protected appStore: AppStore,
    protected queryParamsStore: QueryParamsStore<GlobalQueryParams>,
    protected personnelStore: PersonnelStore,
    protected inputsService: InputsService,
    private bitbucketApi: BitbucketAPI,
    private bitbucketService: BitbucketService,
    protected dialogService: MatDialog
  ) { }

  onFetchAllClicked() {
    if (!this.inputsService.form.valid || this.appStore.isLoading()) {
      return;
    }
    if (!this.validateCommitsFormInputs() || !this.validatePrFormInputs()) {
      return;
    }
    var repositoriesSharedObservable = this.bitbucketApi.getRepositories(this.queryParamsStore.params.project()[0]).pipe(share())
    this.bitbucketService.getPullRequestsFromRepositories(repositoriesSharedObservable);
    this.bitbucketService.getCommitsFromRepositories(repositoriesSharedObservable);
  }

  onFetchPullRequestsClicked() {
    if (this.appStore.isLoading()) {
      return;
    }
    if (!this.validatePrFormInputs()) {
      return
    }
    this.bitbucketService.getPullRequests();
  }

  onFetchCommitsClicked() {
    if (this.appStore.isLoading()) {
      return;
    }
    if (!this.validateCommitsFormInputs()) {
      return
    }
    this.bitbucketService.getCommits();
  }

  openPersonnelJsonDialog() {
    var args: ICodeDialogComponent = {
      filename: "personnel.json",
      code: JSON.stringify(this.personnelStore.personnel(), null, 2),
      schema: JSON.stringify(PERSONNEL_JSON_SCHEMA, null, 2),
      example: JSON.stringify(PERSONNEL_JSON_EXAMPLE, null, 2),
    }
    this.dialogService.open(CodeDialogComponent, {
      data: args,
      position: {
        top: "10%"
      }
    });
  }

  validateGeneralFormInputs() {
    var hasToken = this.inputsService.form.controls.accessToken.value != null;
    if (!hasToken) {
      this.appStore.addError("Token Input", "Access token is required");
    }
    var hasWorkspace = this.inputsService.form.controls.workspace.value != null;
    if (!hasWorkspace) {
      this.appStore.addError("Workspace Input", "Workspace is required");
    }
    var hasProject = this.inputsService.form.controls.project.value != null;
    if (!hasProject) {
      this.appStore.addError("Project Input", "Project is required");
    }
    return hasToken && hasWorkspace && hasProject;
  }

  validateCommitsFormInputs() {
    var hasGeneralFormInputs = this.validateGeneralFormInputs();
    var hasCommitDates = this.inputsService.form.controls.commitsStartDate.value != null && this.inputsService.form.controls.commitsEndDate.value != null;
    if (!hasCommitDates) {
      this.appStore.addError("Commit Dates", "Commit dates are required");
    }
    return hasGeneralFormInputs && hasCommitDates;
  }

  validatePrFormInputs() {
    var hasGeneralFormInputs = this.validateGeneralFormInputs();
    var hasPrDates = this.inputsService.form.controls.prStartDate.value != null && this.inputsService.form.controls.prEndDate.value != null;
    if (!hasPrDates) {
      this.appStore.addError("Pull Request Dates", "Pull request dates are required");
    }
    return hasGeneralFormInputs && hasPrDates;
  }
}
