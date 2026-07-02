import IconNumber from "./IconNumber";

interface Strategy {
  number: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  description: string;
}

interface StrategiesSectionProps {
  title: string;
  strategies: Strategy[];
}

export default function StrategiesSection({
  title,
  strategies,
}: StrategiesSectionProps) {
  return (
    <section className="py-10">
      <article className="max-w-3xl mx-auto px-5">
        <h2 className="text-2xl md:text-3xl font-bold text-[rgb(124,45,18)] mb-8">
          {title}
        </h2>

        <div className="space-y-8">
          {strategies.map((strategy) => (
            <div key={strategy.number} className="flex gap-4 md:gap-6">
              <IconNumber number={strategy.number} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[rgb(124,45,18)] mb-2">
                  {strategy.title}
                </h3>
                <p className="text-base leading-relaxed text-[rgb(124,45,18)]">
                  {strategy.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
