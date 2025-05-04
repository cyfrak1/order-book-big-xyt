type ApexTooltipContext = {
  series: number[][];
  seriesIndex: number;
  dataPointIndex: number;
  w: any;
};

export function createCustomTooltip(
  getSelectedTime: () => string | null,
  getRawData: () => any[]
) {
  return {
    shared: false,
    intersect: true,
    custom: ({
      series,
      seriesIndex,
      dataPointIndex,
      w,
    }: ApexTooltipContext): string => {
      const level = dataPointIndex + 1;
      const selected = getSelectedTime();
      const row = getRawData().find((r) => r.Time === selected);
      if (!row) return '';

      const label = seriesIndex === 0 ? 'Bid' : 'Ask';
      const price = row[`${label}${level}`];
      const size = row[`${label}${level}Size`];
      const color = w?.config?.colors?.[seriesIndex] ?? '#ccc';

      return `
          <div class="apexcharts-tooltip-title">Level ${level}</div>
          <div class="apexcharts-tooltip-series-group" style="display: flex; align-items: start;">
            <span class="apexcharts-tooltip-marker" style="background-color: ${color}; margin-top: 4px;"></span>
            <div class="apexcharts-tooltip-text" style="margin-left: 8px;">
              ${label}: <strong>${price?.toFixed?.(4) ?? '-'}</strong><br/>
              ${label} Size: <strong>${size?.toLocaleString?.() ?? '-'}</strong>
            </div>
          </div>
        `;
    },
  };
}
