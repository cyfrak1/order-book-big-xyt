import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  Input,
  signal,
  ViewChild,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent as ApexChartComponent,
  ApexDataLabels,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { createCustomTooltip } from './custom-tooltip';
import { isFirstAppUse } from '../../utils/first-use';
import introJs from 'intro.js';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart & {
    animations?: ApexChart['animations'] & {
      easing?: string;
    };
  };
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'ob-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSliderModule,
    MatButtonModule,
  ],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent {
  @ViewChild('chartRef') chartRef!: ApexChartComponent;

  private _rawData = signal<any[]>([]);
  protected isReplaying = false;
  private replayIntervalId: number | null = null;

  @Input() set rawData(data: any[]) {
    this._rawData.set(data || []);
  }

  public ngOnInit(): void {
    if (isFirstAppUse()) {
      introJs().start();
    }
  }

  protected rawDataTransformed = computed(() =>
    this._rawData().map((r) => ({
      ...r,
      Time: r.Time?.split('.')[0],
    }))
  );

  protected availableTimes = computed(() =>
    this.rawDataTransformed().map((r) => r.Time)
  );

  protected selectedTime = signal<string | null>(null);
  protected chartOptions = signal<Partial<ChartOptions>>({});

  protected currentIndex = computed(() => {
    const selected = this.selectedTime();
    return this.availableTimes().indexOf(selected ?? '');
  });

  protected initEffect = effect(() => {
    const times = this.availableTimes();
    if (times.length > 0 && !this.selectedTime()) {
      this.selectedTime.set(times[0]);
    }
  });

  protected updateEffect = effect(() => {
    const selected = this.selectedTime();
    const data = this.rawDataTransformed();
    const row = data.find((r) => r.Time === selected);
    if (!row) return;

    const bidData = Array.from(
      { length: 10 },
      (_, i) => (row as Record<string, number>)[`Bid${i + 1}`]
    );

    const askData = Array.from(
      { length: 10 },
      (_, i) => (row as Record<string, number>)[`Ask${i + 1}`]
    );

    const allPrices = [...bidData, ...askData];
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const spread = max - min || 0.01;
    const padding = spread * 0.2;

    const tooltip = createCustomTooltip(
      () => this.selectedTime(),
      () => this.rawDataTransformed()
    );

    if (this.chartRef) {
      this.chartRef.updateSeries(
        [
          { name: 'Bid', data: bidData },
          { name: 'Ask', data: askData },
        ],
        true
      );

      this.chartRef.updateOptions(
        {
          yaxis: {
            min: +(min - padding).toFixed(4),
            max: +(max + padding).toFixed(4),
            tickAmount: 5,
            title: { text: 'Price' },
            decimalsInFloat: 4,
          },
          title: {
            text: `Order Book Snapshot at ${selected}`,
            align: 'center' as const,
          },
          tooltip,
        },
        true,
        true
      );
    } else {
      this.chartOptions.set({
        series: [
          { name: 'Bid', data: bidData },
          { name: 'Ask', data: askData },
        ],
        chart: {
          height: 400,
          type: 'bar',
          stacked: false,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 500,
            animateGradually: {
              enabled: true,
              delay: 300,
            },
            dynamicAnimation: {
              enabled: true,
              speed: 700,
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => val.toFixed(4),
        },
        stroke: {
          curve: 'smooth',
        },
        title: {
          text: `Order Book Snapshot at ${selected}`,
          align: 'center' as const,
        },
        xaxis: {
          categories: Array.from({ length: 10 }, (_, i) => `Level ${i + 1}`),
        },
        yaxis: {
          min: +(min - padding).toFixed(4),
          max: +(max + padding).toFixed(4),
          tickAmount: 5,
          title: { text: 'Price' },
          decimalsInFloat: 4,
        },
        tooltip,
      });
    }
  });

  protected onTimeChange(time: string): void {
    this.selectedTime.set(time);
  }

  protected startReplay(): void {
    if (this.isReplaying) return;

    const times = this.availableTimes();
    if (times.length < 2) return;
    this.selectedTime.set(times[0]);
    this.isReplaying = true;
    let index = 0;

    this.replayIntervalId = window.setInterval(() => {
      if (index >= times.length) {
        this.stopReplay();
        return;
      }

      this.selectedTime.set(times[index]);
      index++;
    }, 5000);
  }

  protected stopReplay(): void {
    if (this.replayIntervalId) {
      clearInterval(this.replayIntervalId);
      this.replayIntervalId = null;
    }
    this.isReplaying = false;
  }

  protected onSliderChange(event: Event): void {
    const index = parseInt((event.target as HTMLInputElement).value, 10);
    const time = this.availableTimes()[index];

    if (time) {
      this.stopReplay();
      this.selectedTime.set(time);
    }
  }
}
