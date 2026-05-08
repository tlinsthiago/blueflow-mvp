import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Building2,
    title: 'Operação condominial organizada',
    text: 'Acompanhe visitas técnicas mensais e mantenha síndicos e administradoras informados com clareza.',
  },
  {
    icon: Wrench,
    title: 'Controle da rotina técnica',
    text: 'Distribua atendimentos, registre ocorrências e mantenha a manutenção preventiva visível para toda a equipe.',
  },
  {
    icon: ShieldCheck,
    title: 'Relatórios com aceite digital',
    text: 'Reúna checklist técnico, fotos e termo de responsabilidade em um fluxo único e profissional.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <header className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">BlueFlow</p>
            <h1 className="text-xl font-semibold">Gestão Hidráulica</h1>
          </div>
          <Link
            to="/login"
            className="rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400"
          >
            Acessar protótipo
          </Link>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] bg-hero-grid px-6 py-10 shadow-soft lg:px-10 lg:py-16">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-300/30 bg-brand-400/10 px-4 py-2 text-xs font-medium text-brand-100">
              <CheckCircle2 size={15} />
              Manutenção hidráulica preventiva para condomínios
            </p>
            <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight lg:text-6xl">
              Um MVP profissional para gestão de serviços hidráulicos em condomínios.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-slate-200 lg:text-lg">
              Apresente uma experiência digital moderna para controle de visitas técnicas, aceite digital,
              registro fotográfico e emissão de relatórios, sem depender de backend nesta etapa.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Entrar no sistema
                <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/5"
              >
                Ver funcionalidades
              </a>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-slate-300">Destaques operacionais</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-3xl font-semibold">100%</p>
                  <p className="mt-1 text-sm text-slate-300">Visibilidade das visitas mensais por condomínio</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-3xl font-semibold">1 fluxo</p>
                  <p className="mt-1 text-sm text-slate-300">Checklist técnico, fotos e geração de relatório</p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-brand-500 p-6 text-brand-950">
              <p className="text-sm font-medium">Pensado para síndicos, administradoras e equipe técnica</p>
              <p className="mt-3 text-2xl font-semibold">Responsivo do registro em campo à gestão no escritório.</p>
            </div>
          </div>
        </div>

        <section id="features" className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="inline-flex rounded-2xl bg-brand-400/15 p-3 text-brand-200">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{feature.text}</p>
              </article>
            );
          })}
        </section>
      </section>
    </div>
  );
}
