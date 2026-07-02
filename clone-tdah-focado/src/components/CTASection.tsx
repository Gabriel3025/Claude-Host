interface CTASectionProps {
  heading: string;
  intro: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export default function CTASection({
  heading,
  intro,
  description,
  ctaText,
  ctaLink,
}: CTASectionProps) {
  return (
    <section className="py-10">
      <div className="max-w-3xl mx-auto px-5">
        <div className="mx-auto max-w-xl bg-gradient-to-r from-[rgb(255,140,0)] to-[rgb(255,179,102)] rounded-2xl p-8 md:p-8 text-white">
          <h3 className="text-xl md:text-2xl font-semibold mb-4 leading-tight">
            {heading}
          </h3>

          <p className="text-base mb-3 leading-relaxed opacity-95">
            {intro}
          </p>

          <p className="text-base mb-6 leading-relaxed opacity-95">
            {description}
          </p>

          <a
            href={ctaLink}
            className="inline-flex items-center gap-2 bg-white text-[rgb(255,140,0)] font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
}
