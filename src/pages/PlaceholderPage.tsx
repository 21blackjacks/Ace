import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";

type PlaceholderPageProps = {
  title: string;
  standalone?: boolean;
};

export function PlaceholderPage({ title, standalone = false }: PlaceholderPageProps) {
  const page = (
    <section className="flex min-h-screen flex-col gap-6 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ace-cyan">ACE</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-ace-secondary">
            Foundation route is wired. Real data and interactions will land in the next implementation pass.
          </p>
        </div>
        {!standalone ? (
          <Link
            to="/profile"
            aria-label="Open profile"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-ace-text"
          >
            <UserRound size={20} />
          </Link>
        ) : null}
      </header>
      <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 shadow-ace-glow backdrop-blur">
        <p className="text-sm leading-6 text-ace-secondary">
          This placeholder exists only while the app foundation is being assembled.
        </p>
      </div>
    </section>
  );

  if (standalone) {
    return <main className="min-h-screen bg-ace-bg text-ace-text">{page}</main>;
  }

  return page;
}
