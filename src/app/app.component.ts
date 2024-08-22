import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiInputsComponent } from "./components/api-inputs/api-inputs.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ApiInputsComponent,
    DashboardComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
