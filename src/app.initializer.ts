import { HttpClient } from "@angular/common/http";
import { Person } from "./models/Person";
import { InputsService } from "./services/inputs.service";

export function initializeAppFactory(http: HttpClient, inputsService: InputsService): () => Promise<any> {
  return () => new Promise<void>((resolve, _) => {
    http.get<Person[]>("assets/personnel.json").subscribe(personnel => {
      var file = new File([JSON.stringify(personnel, null, 2)], "personnel.json", { type: "text/json" })
      inputsService.form.controls.personnel.setValue(file);
      resolve();
    })
  });
}
