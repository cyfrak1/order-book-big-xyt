import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChartComponent } from './shared/components/chart/chart.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { isFirstAppUse } from './shared/utils/first-use';
import introJs from 'intro.js';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'order-book';

  data: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getSampleData().subscribe((result) => {
      this.data = result;
    });
  }

  getSampleData(): Observable<any> {
    return this.http.get<any>('assets/data.json');
  }
}
