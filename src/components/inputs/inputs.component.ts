import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AppStore, QueryParamKey } from '../../stores/app.store.service';
import { BitbucketAPI } from '../../services/bitbucket-api.service';
import { share } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputsService } from '../../services/inputs.service';
import { BitbucketService } from '../../services/bitbucket.service';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PersonnelStore } from '../../stores/personnel.store.service';
import { FileInputComponent } from "./file-input/file-input.component";
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CodeDialogComponent, ICodeDialogComponent } from './code-dialog/code-dialog.component';
import PERSONNEL_JSON_SCHEMA from '../../settings/personnel-json-schema.json'
import PERSONNEL_JSON_EXAMPLE from '../../settings/personnel-json-example.json'
import { MatFormFieldModule } from '@angular/material/form-field';
import { Feature } from '../../models/Feature';
import { Views } from '../../models/Views';

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
    FileInputComponent,
],
  templateUrl: "inputs.component.html",
})
export class InputsComponent {
  Views = Object.keys(Views);
  Features = Object.entries(Feature);
  @ViewChild('filterInput', { static: true })
  filterInput!: ElementRef<HTMLInputElement>;
  isLoadingProjects = signal<boolean>(false);

  constructor(
    protected appStore: AppStore,
    protected personnelStore: PersonnelStore,
    protected inputsService: InputsService,
    private bitbucketApi: BitbucketAPI,
    private bitbucketService: BitbucketService,
    protected dialogService: MatDialog
  ) { }

  onFetchAllClicked() {
    if (!this.inputsService.form.valid || this.appStore.itemsLoading()) {
      return;
    }
    var repositoriesSharedObservable = this.bitbucketApi.getRepositories(this.appStore.queryParams[QueryParamKey.project]()).pipe(share())
    this.bitbucketService.getPullRequestsFromRepositories(repositoriesSharedObservable);
    this.bitbucketService.getCommitsFromRepositories(repositoriesSharedObservable);
  }

  onFetchPullRequestsClicked() {
    this.bitbucketService.getPullRequests();
  }

  onFetchCommitsClicked() {
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
}
