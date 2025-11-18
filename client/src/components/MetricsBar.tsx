import { libertyChainData } from "@shared/schema";
import { AnimatedCounter } from "./AnimatedCounter";

export function MetricsBar() {
  const metricIds = ['tps', 'validators', 'evm-compatibility', 'finality'];
  
  return (
    <section className="py-20 bg-card/50 border-y border-border/50" id="metrics" data-testid="section-metrics">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
          {libertyChainData.metrics.map((metric, index) => (
            <div key={index} className="text-center space-y-2" data-testid={`metric-${metricIds[index]}`}>
              <div className="text-5xl md:text-6xl font-black tabular-nums gradient-text" data-testid={`text-metric-value-${metricIds[index]}`}>
                <AnimatedCounter 
                  target={parseInt(metric.value)} 
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                />
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide" data-testid={`text-metric-label-${metricIds[index]}`}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
