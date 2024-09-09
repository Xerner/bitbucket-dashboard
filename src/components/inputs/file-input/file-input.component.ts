import { Component, ElementRef, ViewChild, forwardRef, input, signal } from "@angular/core";
import { ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

/**
 * https://stackblitz.com/edit/angular-material-file-input-with-form-field?file=src%2Fapp%2Fapp.component.ts
 */
@Component({
  selector: "app-file-input",
  templateUrl: "./file-input.component.html",
  standalone: true,
  imports: [MatIconModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true
    }
  ]
})
export class FileInputComponent implements ControlValueAccessor {
  label = input<string>("Upload");
  icon = input<string>("attach_file");
  disabled = signal<boolean>(false);
  @ViewChild(FormControlDirective, { static: true })
  formControlDirective!: FormControlDirective;
  formControl = input.required<FormControl>();
  fileName = new FormControl<string>({ value: "", disabled: this.disabled() });

  @ViewChild('fileInput', { static: true })
  set fileInputRef(ref: ElementRef<HTMLInputElement>) {
    this.fileInput = ref.nativeElement;
  }
  fileInput!: HTMLInputElement;

  ngAfterViewInit(): void {
    if (this.formControl().value) {
      this.fileName.setValue("Custom config loaded");
    }
  }

  registerOnTouched(fn: any): void {
    this.formControlDirective.valueAccessor!.registerOnTouched(fn);
  }

  registerOnChange(fn: any): void {
    this.formControlDirective.valueAccessor!.registerOnChange(fn);
  }

  writeValue(file: File | null): void {
    if (file == null) {
      this.fileName.patchValue("");
      this.fileInput.value = "";
      return;
    }
    this.updateFile(file);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleFileInputChange(): void {
    var fileList = this.fileInput.files;
    if (!fileList || fileList.length == 0) {
      this.fileName.patchValue("");
      return;
    }
    var file = fileList[0];
    this.updateFile(file);
  }

  updateFile(file: File) {
    this.fileName.patchValue(file.name);
    file.text()
      .then(json => {
        this.formControl()?.setValue(json);
      })
  }

  public onBlur(): void {
    this.formControl()?.markAsTouched();
  }

  handleClick(event: Event) {
    event.stopPropagation();
    this.fileInput.click();
  }
}
