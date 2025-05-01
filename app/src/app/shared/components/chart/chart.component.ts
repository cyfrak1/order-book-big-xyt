import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PlotlyModule } from 'angular-plotly.js';

@Component({
  selector: 'ob-chart',
  imports: [CommonModule, PlotlyModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent {}
