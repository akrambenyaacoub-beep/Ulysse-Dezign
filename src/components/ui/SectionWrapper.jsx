// src/components/ui/SectionWrapper.jsx
const SectionWrapper = ({ id, children, className = '', light = false }) => (
  <section
    id={id}
    className={`relative overflow-hidden py-20 md:py-28
      ${light ? 'bg-[#F8FAFC]' : 'bg-[#071325]'} ${className}`}
  >
    {!light && (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-[#071325] via-[#0D1F3C] to-[#0A1628]" />
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] bg-[#F0C75E]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-[#1E7AC4]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      </>
    )}

    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
      {children}
    </div>
  </section>
);

export default SectionWrapper;