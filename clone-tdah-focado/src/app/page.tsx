import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AgeSignsSection from "@/components/AgeSignsSection";
import AttentionSignsSection from "@/components/AttentionSignsSection";
import StrategiesSection from "@/components/StrategiesSection";
import CTASection from "@/components/CTASection";
import ProfessionalSection from "@/components/ProfessionalSection";
import Footer from "@/components/Footer";

export default function Home() {
  const heroContent = {
    meta: {
      updated: "2026",
      readingTime: "7 minutos",
    },
    title:
      "TDAH e desempenho escolar: como ajudar seu filho a aprender melhor",
    introParagraphs: [
      "Quando uma criança com TDAH começa a ter notas baixas, esquece a lição em casa ou não consegue ficar quieta na sala, a primeira reação de muitos pais é cobrar mais disciplina. Mas estudos da Academia mostram que crianças com TDAH não escolhem desatenção — o cérebro delas processa informação de forma diferente.",
      "O TDAH (Transtorno de Déficit de Atenção e Hiperatividade) afeta funções executivas como organização, memória de trabalho, controle de impulsos e gerenciamento de tempo. Tudo isso é exigido o tempo inteiro na escola.",
      "Este guia reúne o que pesquisadores e neuropsicopedagogos recomendam para pais que querem apoiar o desempenho escolar do filho com TDAH — sem brigas, sem chantagem e sem rotular a criança como problema.",
    ],
  };

  const ageSignsCards = [
    {
      ageGroup: "4-6 anos",
      signs: [
        "Dificuldade em seguir rotinas simples",
        "Brinquedo desorganizado, perde objetos frequentemente",
        "Impulsivo em atividades com outras crianças",
      ],
    },
    {
      ageGroup: "7-9 anos",
      signs: [
        "Esquece lição de casa mesmo quando anotou",
        "Dificuldade em completar tarefas mesmo que goste",
        "Notas baixas apesar de inteligência",
      ],
    },
    {
      ageGroup: "10+ anos",
      signs: [
        "Gestão de tempo ruim (procrastinação)",
        "Esquece compromissos e materiais escolares",
        "Dificuldade em organizar pensamentos na escrita",
      ],
    },
  ];

  const attentionSigns = [
    "Dificuldade em manter o foco em tarefas que exigem esforço mental",
    "Esquece compromissos, materiais e instruções recém-dadas",
    "Não termina o que começa — mesmo coisas que gosta",
    "Distrai-se com qualquer barulho, movimento ou pensamento próprio",
    "Parece não ouvir quando se fala diretamente com ela",
    "Reage de forma intensa a pequenas frustrações ou mudanças de rotina",
    "Tem o sono agitado, demora pra adormecer ou acorda várias vezes",
  ];

  const strategies = [
    {
      number: 1 as const,
      title: "Visualize a rotina",
      description:
        "Crianças com TDAH precisam ver o que vai acontecer. Use um quadro com horários, tarefas e símbolos. O que está no papel libera espaço no cérebro pra focar no que importa.",
    },
    {
      number: 2 as const,
      title: "Quebre tarefas em ações pequenas",
      description:
        'Faça o dever é abstrato demais. Abra o caderno, leia o enunciado, escreva o número da página é executável. Quebre tudo em ações pequenas.',
    },
    {
      number: 3 as const,
      title: "Pomodoro infantil: ciclos curtos de foco",
      description:
        "Pomodoro infantil: 25 minutos de foco + 5 de pausa. O cérebro com TDAH responde melhor a sprints curtos do que a maratonas de estudo.",
    },
    {
      number: 4 as const,
      title: "Valorize o esforço, não só o resultado",
      description:
        'Em vez de tirou nota boa, parabéns, diga você sentou e fez sem desistir, isso é o que importa. O TDAH precisa de feedback do processo.',
    },
    {
      number: 5 as const,
      title: "Elimine distrações físicas",
      description:
        "Tire celular, TV e brinquedos da mesa. Use fones com música instrumental se ajudar. O cérebro com TDAH não filtra ruído — você precisa filtrar por ele.",
    },
    {
      number: 6 as const,
      title: "Comunique com a escola",
      description:
        "Combine com o professor um sinal discreto (um toque na mesa) quando perceber dispersão. E peça uma agenda escolar compartilhada — não dependa só do que a criança lembra.",
    },
  ];

  const whenToSeekHelp = [
    "Sintomas começam em ambiente estruturado (escola) mais cedo que o esperado",
    "Comportamento interfere na vida social e academica",
    "Sintomas persistem apesar de estratégias implementadas",
    "Há histórico familiar de TDAH ou transtornos do neurodesenvolvimento",
    "A criança apresenta ansiedade ou depressão associada",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(255,251,245)] via-[rgb(255,248,238)] to-[rgb(255,244,227)]">
      <Header />

      <main>
        <HeroSection
          meta={heroContent.meta}
          title={heroContent.title}
          introParagraphs={heroContent.introParagraphs}
        />

        <AgeSignsSection
          title="Sinais de dificuldade escolar por idade"
          cards={ageSignsCards}
        />

        <AttentionSignsSection
          title="Sinais de atenção que merecem cuidado"
          intro="Crianças com TDAH não escolhem ignorar comandos. Elas têm um cérebro que processa informação de forma diferente. Fique atento se você nota:"
          signs={attentionSigns}
        />

        <StrategiesSection
          title="6 estratégias para apoiar em casa"
          strategies={strategies}
        />

        <CTASection
          heading="Aprenda as estratégias e aplique em casa a partir de hoje"
          intro="Quer um material prático com tudo isso aplicado?"
          description="Preparamos um planner pronto para imprimir, com rotina, sistema de recompensas e checklist escolar adaptado ao cérebro com TDAH."
          ctaText="Quero acessar o material →"
          ctaLink="https://pay.wiapy.com/3ICW1YyCBy?utm_source=organic&utm_medium=&utm_campaign=&utm_content=&utm_term="
        />

        <ProfessionalSection
          title="Quando é hora de procurar um profissional"
          intro="Estratégias em casa ajudam muito, mas existem situações em que o apoio de um especialista é indispensável. Procure um neuropediatra, psiquiatra infantil ou neuropsicopedagogo se você nota:"
          items={whenToSeekHelp}
        />

        <Footer
          copyright="© 2026 TDAH Focado · Conteúdo educativo para pais"
          disclaimer="Este conteúdo tem caráter exclusivamente informativo e educacional. Não substitui consulta com médico, psicólogo ou outro profissional de saúde. O diagnóstico de TDAH deve ser feito por especialista."
          secondaryCTA="Ver o material →"
          secondaryCTALink="https://pay.wiapy.com/3ICW1YyCBy?utm_source=organic&utm_medium=&utm_campaign=&utm_content=&utm_term="
        />
      </main>
    </div>
  );
}
