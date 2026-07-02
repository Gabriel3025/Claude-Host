import BulletList from "./BulletList";

interface AgeCard {
  ageGroup: string;
  signs: string[];
}

interface AgeSignsSectionProps {
  title: string;
  cards: AgeCard[];
}

export default function AgeSignsSection({
  title,
  cards,
}: AgeSignsSectionProps) {
  return (
    <section className="py-10">
      <article className="max-w-3xl mx-auto px-5">
        <h2 className="text-2xl md:text-3xl font-bold text-[rgb(124,45,18)] mb-8">
          {title}
        </h2>

        {/* Grid of cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-[rgb(254,215,170)] bg-white/40"
            >
              <h3 className="text-lg font-semibold text-[rgb(124,45,18)] mb-4">
                {card.ageGroup}
              </h3>
              <BulletList items={card.signs} />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
