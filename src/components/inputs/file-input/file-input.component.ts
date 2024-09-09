import { Component, ElementRef, ViewChild, forwardRef, input, signal } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

/**
 * https://stackblitz.com/edit/angular-material-file-input-with-form-field?file=src%2Fapp%2Fapp.component.ts
 */
@Component({
  selector: "app-file-input",
  templateUrl: "./file-input.component.html",
  standalone: true,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true
    }
  ]
})
export class FileInputComponent {
  label = input<string>("Upload");
  icon = input<string>("attach_file");
  formControl = input.required<FormControl<File | null>>();
  fileName = signal<string>("")
  @ViewChild("fileInput", { static: true })
  fileInputControl!: HTMLInputElement;
  @ViewChild('fileInput', { static: true })
  set fileInputRef(ref: ElementRef<HTMLInputElement>) {
    this.fileInputElement = ref.nativeElement;
  }
  fileInputElement!: HTMLInputElement;

  ngOnInit(): void {
    this.formControl().valueChanges.subscribe(this.updateFileName.bind(this))
  }

  ngAfterViewInit() {
    this.updateFileName(this.formControl().value)
  }

  updateFileName(file: File | null) {
    if (file == null) {
      this.fileName.set("file.name")
      return;
    }
    this.fileName.set(file.name)
  }

  handleClick(event: Event) {
    event.stopPropagation();
    this.fileInputElement.click();
  }

  handleFileChange() {
    var fileList = this.fileInputElement.files;
    if (!fileList || fileList.length == 0) {
      this.formControl().setValue(null);
      return;
    }
    var file = fileList[0];
    this.formControl().setValue(file);
  }
}
