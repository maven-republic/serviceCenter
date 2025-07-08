"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      {children}
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config || {}).filter(
    ([_, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart="${id}"] {
  --color-earnings: hsl(var(--chart-1));
}
${Object.entries(config || {})
  .filter(([_, itemConfig]) => itemConfig.color)
  .map(([key, itemConfig]) => {
    return `  --color-${key}: ${itemConfig.color};`;
  })
  .join("\n")}
        `,
      }}
    />
  );
};

const ChartTooltip = ({ active, payload, label, className, indicator = "dot", hideLabel = false, hideIndicator = false, labelFormatter, formatter, color, nameKey, labelKey, ...props }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const [item] = payload;
  
  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      <div className="grid gap-1.5">
        {!hideLabel && labelFormatter && (
          <div className="font-medium">
            {labelFormatter(label, payload)}
          </div>
        )}
        {!hideLabel && !labelFormatter && label && (
          <div className="font-medium">{label}</div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const [formattedValue, formattedName] = formatter 
              ? formatter(item.value, item.name, item, index, item.payload)
              : [item.value, item.name];

            return (
              <div
                key={item.dataKey || index}
                className="flex w-full flex-wrap items-stretch gap-2"
              >
                {!hideIndicator && (
                  <div
                    className="shrink-0 rounded-[2px] w-2.5 h-2.5"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                <div className="flex flex-1 justify-between leading-none items-center">
                  <span className="text-muted-foreground">
                    {formattedName || item.name || "Value"}
                  </span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formattedValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ChartTooltipContent = React.forwardRef((props, ref) => {
  return <ChartTooltip ref={ref} {...props} />;
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = React.forwardRef(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" && "pb-3",
        className
      )}
    >
      {payload.map((item) => (
        <div
          key={item.value}
          className="flex items-center gap-1.5"
        >
          {!hideIcon && (
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color,
              }}
            />
          )}
          <span className="text-sm">{item.value}</span>
        </div>
      ))}
    </div>
  );
});
ChartLegend.displayName = "ChartLegend";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartStyle,
};