export interface Exercise {
  id: string;
  name: string;
  duration: number; // em minutos
  gif: string; // URL do GIF
  description: string;
}

export interface Day {
  dayNumber: number;
  totalDuration: number; // em minutos
  exercises: Exercise[];
}

export const EXERCISES_DATA: Day[] = [
  // DIA 1 - 10 minutos
  {
    dayNumber: 1,
    totalDuration: 10,
    exercises: [
      {
        id: "1-1",
        name: "Aquecimento - Círculos com Braços",
        duration: 2,
        gif: "https://gymvisual.com/img/p/2/3/7/1/7/23717.gif",
        description: "Faça movimentos circulares com os braços para aquecer a articulação.",
      },
      {
        id: "1-2",
        name: "Flexões - 10 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Flexões clássicas. Mantenha o corpo reto da cabeça até os pés.",
      },
      {
        id: "1-3",
        name: "Agachamentos - 15 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "Agachamentos com peso do corpo. Os joelhos devem ficar atrás dos pés.",
      },
    ],
  },

  // DIA 2 - 15 minutos
  {
    dayNumber: 2,
    totalDuration: 15,
    exercises: [
      {
        id: "2-1",
        name: "Aquecimento - Pulos com Braços Abertos",
        duration: 2,
        gif: "https://media.giphy.com/media/3ohzdKZ5I1ZvPAJAje/giphy.gif",
        description: "Pulos com aberturas de braços e pernas para elevar o ritmo cardíaco.",
      },
      {
        id: "2-2",
        name: "Flexões - 15 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Aumentamos as repetições. Foque na forma e controle.",
      },
      {
        id: "2-3",
        name: "Agachamentos - 20 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "20 agachamentos. Mantenha um ritmo constante e controlado.",
      },
      {
        id: "2-4",
        name: "Prancha - 30 segundos",
        duration: 5,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "Mantenha a posição da prancha com o corpo completamente alinhado.",
      },
    ],
  },

  // DIA 3 - 15 minutos
  {
    dayNumber: 3,
    totalDuration: 15,
    exercises: [
      {
        id: "3-1",
        name: "Aquecimento - Balanço de Pernas",
        duration: 2,
        gif: "https://media.giphy.com/media/Y4I52k8I5dJdKxnLl5/giphy.gif",
        description: "Balanços de perna para aquecer a articulação do quadril.",
      },
      {
        id: "3-2",
        name: "Flexões - 20 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Aumentando dificuldade. Você pode fazer variações para aumentar.",
      },
      {
        id: "3-3",
        name: "Agachamentos - 25 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "25 agachamentos com ritmo constante e controlado.",
      },
      {
        id: "3-4",
        name: "Prancha - 45 segundos",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Aumente o tempo de resistência mantendo a posição correta.",
      },
    ],
  },

  // DIA 4 - 15 minutos
  {
    dayNumber: 4,
    totalDuration: 15,
    exercises: [
      {
        id: "4-1",
        name: "Aquecimento - Pular Corda",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlQY9x8FZo0XO1i/giphy.gif",
        description: "Pule corda para aquecer o corpo e aumentar o ritmo cardíaco.",
      },
      {
        id: "4-2",
        name: "Flexões - 25 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Continue aumentando. Respire normalmente durante o exercício.",
      },
      {
        id: "4-3",
        name: "Agachamentos - 30 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "30 agachamentos. Mantenha a forma e não perca a concentração.",
      },
      {
        id: "4-4",
        name: "Prancha - 1 minuto",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "1 minuto completo de resistência de prancha.",
      },
    ],
  },

  // DIA 5 - 15 minutos
  {
    dayNumber: 5,
    totalDuration: 15,
    exercises: [
      {
        id: "5-1",
        name: "Aquecimento - Exercício Completo",
        duration: 2,
        gif: "https://media.giphy.com/media/pQmywQeKgVcFunyeBZ/giphy.gif",
        description: "Exercício completo para elevar o ritmo cardíaco rapidamente.",
      },
      {
        id: "5-2",
        name: "Flexões - 30 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Conseguimos! 30 flexões no dia 5. Você está ótimo!",
      },
      {
        id: "5-3",
        name: "Agachamentos - 35 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "35 agachamentos com poder. Você está ficando mais forte!",
      },
      {
        id: "5-4",
        name: "Prancha - 75 segundos",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Resistência aumentando significativamente. Você consegue!",
      },
    ],
  },

  // DIA 6 - 15 minutos
  {
    dayNumber: 6,
    totalDuration: 15,
    exercises: [
      {
        id: "6-1",
        name: "Aquecimento - Joelhos Altos",
        duration: 2,
        gif: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
        description: "Correr no lugar com joelhos altos para aquecer o corpo.",
      },
      {
        id: "6-2",
        name: "Flexões - 30 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Mantemos 30 flexões. Você pode fazer variações para aumentar dificuldade.",
      },
      {
        id: "6-3",
        name: "Agachamentos - 40 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "40 agachamentos. Suas pernas estão se tornando máquinas!",
      },
      {
        id: "6-4",
        name: "Prancha - 90 segundos",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Uma vez e meia de resistência em prancha.",
      },
    ],
  },

  // DIA 7 - 15 minutos
  {
    dayNumber: 7,
    totalDuration: 15,
    exercises: [
      {
        id: "7-1",
        name: "Aquecimento - Escaladores",
        duration: 2,
        gif: "https://media.giphy.com/media/xTiTnI0FGEt0jQfI3u/giphy.gif",
        description: "Movimento de escalador para aquecer o corpo rapidamente.",
      },
      {
        id: "7-2",
        name: "Flexões - 35 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Aumentamos mais! 35 flexões. Uma semana já passou!",
      },
      {
        id: "7-3",
        name: "Agachamentos - 45 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "45 agachamentos com poder e determinação.",
      },
      {
        id: "7-4",
        name: "Prancha - 2 minutos",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "2 minutos completos de prancha! Você é forte!",
      },
    ],
  },

  // DIA 8 - 15 minutos
  {
    dayNumber: 8,
    totalDuration: 15,
    exercises: [
      {
        id: "8-1",
        name: "Aquecimento - Agachamentos com Pulo",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlSY9x8FZo0XO1i/giphy.gif",
        description: "Agachamentos com pulo para aquecer o corpo.",
      },
      {
        id: "8-2",
        name: "Flexões - 40 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "40 flexões! Você está muito mais forte agora!",
      },
      {
        id: "8-3",
        name: "Agachamentos - 50 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "50 agachamentos! Metade do desafio foi concluído!",
      },
      {
        id: "8-4",
        name: "Levantamento de Perna - 20 repetições",
        duration: 5,
        gif: "https://media.giphy.com/media/xTiTpv0kxjvXe9L0m4/giphy.gif",
        description: "Levantamento de perna para fortalecer o abdômen e glúteos.",
      },
    ],
  },

  // DIA 9 - 15 minutos
  {
    dayNumber: 9,
    totalDuration: 15,
    exercises: [
      {
        id: "9-1",
        name: "Aquecimento - Movimento de Lagarta",
        duration: 2,
        gif: "https://media.giphy.com/media/xT9IgEx8SbQ0teblYQ/giphy.gif",
        description: "Movimentos de lagarta para aquecer o corpo inteiro.",
      },
      {
        id: "9-2",
        name: "Flexões - 45 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "45 flexões. Você é um verdadeiro guerreiro!",
      },
      {
        id: "9-3",
        name: "Agachamentos - 55 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "55 agachamentos com poder e determinação.",
      },
      {
        id: "9-4",
        name: "Levantamento de Perna - 25 repetições",
        duration: 5,
        gif: "https://media.giphy.com/media/xTiTpv0kxjvXe9L0m4/giphy.gif",
        description: "Levantamento de perna para fortalecer abdômen.",
      },
    ],
  },

  // DIA 10 - 15 minutos
  {
    dayNumber: 10,
    totalDuration: 15,
    exercises: [
      {
        id: "10-1",
        name: "Aquecimento - Exercício Completo",
        duration: 2,
        gif: "https://media.giphy.com/media/pQmywQeKgVcFunyeBZ/giphy.gif",
        description: "Exercício completo para aumentar o ritmo cardíaco.",
      },
      {
        id: "10-2",
        name: "Flexões - 50 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "50 flexões! Você é incrível!",
      },
      {
        id: "10-3",
        name: "Agachamentos - 60 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "60 agachamentos. Suas pernas são máquinas incríveis!",
      },
      {
        id: "10-4",
        name: "Levantamento de Perna - 30 repetições",
        duration: 5,
        gif: "https://media.giphy.com/media/xTiTpv0kxjvXe9L0m4/giphy.gif",
        description: "30 levantamentos de perna para fortalecer core.",
      },
    ],
  },

  // DIA 11 - 15 minutos
  {
    dayNumber: 11,
    totalDuration: 15,
    exercises: [
      {
        id: "11-1",
        name: "Aquecimento - Pular Corda",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlQY9x8FZo0XO1i/giphy.gif",
        description: "Pule corda para aquecer o corpo.",
      },
      {
        id: "11-2",
        name: "Flexões - 50 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Mantemos 50 flexões com consistência.",
      },
      {
        id: "11-3",
        name: "Agachamentos - 65 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "65 agachamentos com ritmo constante.",
      },
      {
        id: "11-4",
        name: "Mergulho em Cadeira - 15 repetições",
        duration: 5,
        gif: "https://media.giphy.com/media/26uf1EWagAe3GDXY7K/giphy.gif",
        description: "Mergulhos em cadeira para fortalecer os braços.",
      },
    ],
  },

  // DIA 12 - 15 minutos
  {
    dayNumber: 12,
    totalDuration: 15,
    exercises: [
      {
        id: "12-1",
        name: "Aquecimento - Joelhos Altos",
        duration: 2,
        gif: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
        description: "Correr no lugar com joelhos altos.",
      },
      {
        id: "12-2",
        name: "Flexões - 55 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "55 flexões! Você está muito mais forte!",
      },
      {
        id: "12-3",
        name: "Agachamentos - 70 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "70 agachamentos com poder e determinação.",
      },
      {
        id: "12-4",
        name: "Mergulho em Cadeira - 20 repetições",
        duration: 5,
        gif: "https://media.giphy.com/media/26uf1EWagAe3GDXY7K/giphy.gif",
        description: "20 mergulhos para fortalecer braços e tórax.",
      },
    ],
  },

  // DIA 13 - 15 minutos
  {
    dayNumber: 13,
    totalDuration: 15,
    exercises: [
      {
        id: "13-1",
        name: "Aquecimento - Pular Corda",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlQY9x8FZo0XO1i/giphy.gif",
        description: "Pule corda rápido para aquecer.",
      },
      {
        id: "13-2",
        name: "Flexões - 60 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "60 flexões! Você é um campeão!",
      },
      {
        id: "13-3",
        name: "Agachamentos - 75 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "75 agachamentos com determinação.",
      },
      {
        id: "13-4",
        name: "Mergulho em Cadeira - 25 repetições",
        duration: 5,
        gif: "https://media.giphy.com/media/26uf1EWagAe3GDXY7K/giphy.gif",
        description: "25 mergulhos para fortalecer.",
      },
    ],
  },

  // DIA 14 - 15 minutos (Descanso Relativo)
  {
    dayNumber: 14,
    totalDuration: 15,
    exercises: [
      {
        id: "14-1",
        name: "Aquecimento - Alongamento Leve",
        duration: 3,
        gif: "https://media.giphy.com/media/xUPGcp0C7eYXz3J2v2/giphy.gif",
        description: "Alongamento leve para recuperação e flexibilidade.",
      },
      {
        id: "14-2",
        name: "Flexões - 40 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "Reduzimos a intensidade para permitir recuperação.",
      },
      {
        id: "14-3",
        name: "Agachamentos - 50 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "Agachamentos leves para recuperação.",
      },
      {
        id: "14-4",
        name: "Respiração Profunda e Meditação",
        duration: 4,
        gif: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        description: "Respiração profunda e meditação para relaxamento.",
      },
    ],
  },

  // DIA 15 - 15 minutos
  {
    dayNumber: 15,
    totalDuration: 15,
    exercises: [
      {
        id: "15-1",
        name: "Aquecimento - Escaladores",
        duration: 2,
        gif: "https://media.giphy.com/media/xTiTnI0FGEt0jQfI3u/giphy.gif",
        description: "Movimento de escalador para aquecer.",
      },
      {
        id: "15-2",
        name: "Flexões - 65 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "65 flexões! Você voltou com mais força!",
      },
      {
        id: "15-3",
        name: "Agachamentos - 80 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "80 agachamentos com poder.",
      },
      {
        id: "15-4",
        name: "Balanço de Mão - 30 segundos",
        duration: 5,
        gif: "https://media.giphy.com/media/l3nWhI5c0F5T0h7kI/giphy.gif",
        description: "Balanço de mão para fortalecer ombros e braços.",
      },
    ],
  },

  // DIA 16 - 15 minutos
  {
    dayNumber: 16,
    totalDuration: 15,
    exercises: [
      {
        id: "16-1",
        name: "Aquecimento - Exercício Completo",
        duration: 2,
        gif: "https://media.giphy.com/media/pQmywQeKgVcFunyeBZ/giphy.gif",
        description: "Exercício completo para ritmo cardíaco.",
      },
      {
        id: "16-2",
        name: "Flexões - 70 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "70 flexões! Você é um herói!",
      },
      {
        id: "16-3",
        name: "Agachamentos - 85 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "85 agachamentos com determinação.",
      },
      {
        id: "16-4",
        name: "Balanço de Mão - 45 segundos",
        duration: 5,
        gif: "https://media.giphy.com/media/l3nWhI5c0F5T0h7kI/giphy.gif",
        description: "45 segundos de balanço de mão.",
      },
    ],
  },

  // DIA 17 - 15 minutos
  {
    dayNumber: 17,
    totalDuration: 15,
    exercises: [
      {
        id: "17-1",
        name: "Aquecimento - Agachamentos com Pulo",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlSY9x8FZo0XO1i/giphy.gif",
        description: "Agachamentos com pulo para aquecer.",
      },
      {
        id: "17-2",
        name: "Flexões - 75 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "75 flexões! Incrível!",
      },
      {
        id: "17-3",
        name: "Agachamentos - 90 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "90 agachamentos com determinação.",
      },
      {
        id: "17-4",
        name: "Balanço de Mão - 1 minuto",
        duration: 5,
        gif: "https://media.giphy.com/media/l3nWhI5c0F5T0h7kI/giphy.gif",
        description: "1 minuto de balanço de mão.",
      },
    ],
  },

  // DIA 18 - 15 minutos
  {
    dayNumber: 18,
    totalDuration: 15,
    exercises: [
      {
        id: "18-1",
        name: "Aquecimento - Joelhos Altos Rápido",
        duration: 2,
        gif: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
        description: "Joelhos altos em ritmo rápido para aquecer.",
      },
      {
        id: "18-2",
        name: "Flexões - 80 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "80 flexões! Você é uma máquina!",
      },
      {
        id: "18-3",
        name: "Agachamentos - 95 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "95 agachamentos.",
      },
      {
        id: "18-4",
        name: "Parede de Agachamento - 90 segundos",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Agachamento contra a parede por 90 segundos.",
      },
    ],
  },

  // DIA 19 - 15 minutos
  {
    dayNumber: 19,
    totalDuration: 15,
    exercises: [
      {
        id: "19-1",
        name: "Aquecimento - Movimento de Lagarta",
        duration: 2,
        gif: "https://media.giphy.com/media/xT9IgEx8SbQ0teblYQ/giphy.gif",
        description: "Movimentos de lagarta para aquecer.",
      },
      {
        id: "19-2",
        name: "Flexões - 85 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "85 flexões! Você está quase no final!",
      },
      {
        id: "19-3",
        name: "Agachamentos - 100 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "100 agachamentos! Uma centena completa!",
      },
      {
        id: "19-4",
        name: "Flexão em Arco - 15 repetições",
        duration: 5,
        gif: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        description: "Flexões em forma de arco para braços avançados.",
      },
    ],
  },

  // DIA 20 - 15 minutos
  {
    dayNumber: 20,
    totalDuration: 15,
    exercises: [
      {
        id: "20-1",
        name: "Aquecimento - Movimento Dinâmico Completo",
        duration: 2,
        gif: "https://media.giphy.com/media/3ohzdKZ5I1ZvPAJAje/giphy.gif",
        description: "Aquecimento dinâmico completo do corpo.",
      },
      {
        id: "20-2",
        name: "Flexões - 90 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "90 flexões! Penúltimo dia antes do final!",
      },
      {
        id: "20-3",
        name: "Agachamentos - 100 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "100 agachamentos novamente. Uma centena!",
      },
      {
        id: "20-4",
        name: "Flexão de Prancha - 10 repetições",
        duration: 5,
        gif: "https://media.giphy.com/media/l0HlSY9x8FZo0XO1i/giphy.gif",
        description: "Flexões avançadas de prancha.",
      },
    ],
  },

  // DIA 21 - 15 minutos (FINAL!)
  {
    dayNumber: 21,
    totalDuration: 15,
    exercises: [
      {
        id: "21-1",
        name: "Aquecimento - Celebração com Movimento",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlQY9x8FZo0XO1i/giphy.gif",
        description: "Você chegou no final! Celebre com um aquecimento completo!",
      },
      {
        id: "21-2",
        name: "Flexões - 100 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/1/8/2/6/1/18261.gif",
        description: "100 FLEXÕES! VOCÊ CONQUISTOU!",
      },
      {
        id: "21-3",
        name: "Agachamentos - 100 repetições",
        duration: 4,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "100 AGACHAMENTOS! PARABÉNS!",
      },
      {
        id: "21-4",
        name: "Alongamento de Vitória",
        duration: 5,
        gif: "https://media.giphy.com/media/XM5TwlmTAYqSI/giphy.gif",
        description: "Alongamento final e merecido descanso. Você é um campeão! 🏆",
      },
    ],
  },
];
