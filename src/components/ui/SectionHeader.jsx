// src/components/ui/SectionHeader.jsx
const SectionHeader = ({
  eyebrow,
  title,
  highlight,
  description,
  align = 'left',
  cta = null,
  light = false,
}) => {
  const isCenter = align === 'center';
  const titleColor = light ? 'text-[#0D1F3C]' : 'text-white';
  const descColor  = light ? 'text-[#4A6A8A]' : 'text-white/60';

  return (
    <div
      className={`flex flex-col md:flex-row justify-between mb-12 sm:mb-16
        ${isCenter
          ? 'items-center text-center'
          : 'items-center md:items-end text-center md:text-left'}
      `}
    >
      <div className={isCenter ? 'mx-auto' : ''}>
        {/* Eyebrow — identique partout */}
        <div
          className={`flex items-center gap-3 mb-4
            ${isCenter ? 'justify-center' : 'justify-center md:justify-start'}
          `}
        >
          <span className="w-8 md:w-12 h-px bg-[#F0C75E]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#F0C75E] font-bold font-['Montserrat']">
            {eyebrow}
          </span>
        </div>

        {/* Titre — échelle unique */}
        <h2
          className={`font-['Playfair_Display'] font-bold tracking-tight leading-tight
            text-3xl sm:text-4xl md:text-5xl
            ${titleColor}`}
        >
          {highlight ? (
            <>
              {title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F0C75E] via-[#fce8aa] to-[#d4aa3a]">
                {highlight}
              </span>
            </>
          ) : title}
        </h2>

        {/* Description — taille/opacité uniformes */}
        {description && (
          <p
            className={`mt-4 text-sm sm:text-base font-['Montserrat'] font-light max-w-xl
              ${descColor}
              ${isCenter ? 'mx-auto' : 'mx-auto md:mx-0'}`}
          >
            {description}
          </p>
        )}
      </div>

      {cta && <div className="mt-6 md:mt-0 shrink-0">{cta}</div>}
    </div>
  );
};

export default SectionHeader;