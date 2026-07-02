interface HeroSectionProps {
  meta: {
    updated: string;
    readingTime: string;
  };
  title: string;
  introParagraphs: string[];
}

export default function HeroSection({
  meta,
  title,
  introParagraphs,
}: HeroSectionProps) {
  return (
    <section className="py-10">
      <article className="max-w-3xl mx-auto px-5">
        {/* Meta information */}
        <div className="flex flex-wrap gap-4 text-xs text-[rgb(124,45,18)] mb-4 font-normal">
          <span>Atualizado em {meta.updated}</span>
          <span>·</span>
          <span>Leitura de {meta.readingTime}</span>
        </div>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold text-[rgb(124,45,18)] mb-6 leading-tight">
          {title}
        </h1>

        {/* Intro paragraphs */}
        <div className="space-y-5">
          {introParagraphs.map((paragraph, index) => (
            <p key={index} className="text-base leading-relaxed text-[rgb(124,45,18)]">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </section>
  );
}
