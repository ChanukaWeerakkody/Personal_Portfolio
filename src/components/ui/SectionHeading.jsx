import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, children }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-semibold md:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-muted md:text-lg">{children}</p>}
    </Reveal>
  );
}
