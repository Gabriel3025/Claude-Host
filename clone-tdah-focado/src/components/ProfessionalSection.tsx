import BulletList from "./BulletList";

interface ProfessionalSectionProps {
  title: string;
  intro: string;
  items: string[];
}

export default function ProfessionalSection({
  title,
  intro,
  items,
}: ProfessionalSectionProps) {
  return (
    <section className="py-10">
      <article className="max-w-3xl mx-auto px-5">
        <h2 className="text-2xl md:text-3xl font-bold text-[rgb(124,45,18)] mb-4">
          {title}
        </h2>

        <p className="text-base leading-relaxed text-[rgb(124,45,18)] mb-6">
          {intro}
        </p>

        <BulletList items={items} />
      </article>
    </section>
  );
}
