import { CommonModule } from '@angular/common';
import { Component, computed, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

export interface ICodeDialogComponent {
  filename: string;
  code: string;
  schema?: string;
  example?: string;
}

@Component({
  selector: 'app-code-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
  ],
  templateUrl: './code-dialog.component.html',
})
export class CodeDialogComponent {
  downloadJsonStr = computed<string>(() => "data:text/json;charset=utf-8," + encodeURIComponent(this.codeDialogArgs.code));

  constructor(
    @Inject(MAT_DIALOG_DATA) protected codeDialogArgs: ICodeDialogComponent,
  ) {
  }

  onCopyClicked() {
    navigator.clipboard.writeText(this.codeDialogArgs.code);
  }
}
