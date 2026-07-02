interface FooterProps {
  copyright: string;
  disclaimer: string;
  secondaryCTA?: string;
  secondaryCTALink?: string;
}

export default function Footer({
  copyright,
  disclaimer,
  secondaryCTA,
  secondaryCTALink,
}: FooterProps) {
  return (
    <footer className="border-t border-[rgb(254,215,170)] bg-white/60 mt-10">
      <article className="max-w-3xl mx-auto px-5 py-10">
        {/* Copyright */}
        <p className="text-sm text-[rgb(124,45,18)] text-center mb-8 font-medium">
          {copyright}
        </p>

        {/* Disclaimer */}
        <div className="bg-white/40 rounded-lg p-6 mb-6 border border-[rgb(254,215,170)]">
          <p className="text-xs md:text-sm text-[rgb(124,45,18)] leading-relaxed">
            <strong>Aviso:</strong> {disclaimer}
          </p>
        </div>

        {/* Secondary CTA */}
        {secondaryCTA && secondaryCTALink && (
          <div className="text-center">
            <a
              href={secondaryCTALink}
              className="inline-flex items-center gap-2 text-[rgb(255,140,0)] font-semibold hover:opacity-80 transition-opacity"
            >
              {secondaryCTA}
            </a>
          </div>
        )}
      </article>
    </footer>
  );
}
