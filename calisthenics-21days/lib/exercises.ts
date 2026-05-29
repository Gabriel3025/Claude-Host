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
        gif: "https://media.giphy.com/media/gEvab1ilmJjORKLE26/giphy.gif",
        description: "Faça movimentos circulares com os braços para aquecer a articulação.",
      },
      {
        id: "1-2",
        name: "Flexões - 10 repetições",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Flexões clássicas. Mantenha o corpo reto da cabeça até os pés.",
      },
      {
        id: "1-3",
        name: "Agachamentos - 15 repetições",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
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
        name: "Aquecimento - Jumping Jacks",
        duration: 2,
        gif: "https://media.giphy.com/media/3ohzdKZ5I1ZvPAJAje/giphy.gif",
        description: "Pulos com aberturas de braços e pernas",
      },
      {
        id: "2-2",
        name: "Push-ups (15 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Aumentamos as repetições. Foco na forma.",
      },
      {
        id: "2-3",
        name: "Squats (20 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "20 agachamentos. Mantém o ritmo.",
      },
      {
        id: "2-4",
        name: "Plank Hold (30 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Mantenha a posição com o corpo reto",
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
        name: "Aquecimento - Leg Swings",
        duration: 2,
        gif: "https://media.giphy.com/media/Y4I52k8I5dJdKxnLl5/giphy.gif",
        description: "Balanços de perna para aquecer",
      },
      {
        id: "3-2",
        name: "Push-ups (20 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Aumentando dificuldade. Pode fazer variações.",
      },
      {
        id: "3-3",
        name: "Squats (25 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "25 agachamentos com ritmo constante",
      },
      {
        id: "3-4",
        name: "Plank Hold (45 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Aumente o tempo de resistência",
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
        name: "Aquecimento - Rope Skipping",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlQY9x8FZo0XO1i/giphy.gif",
        description: "Pule corda para aquecer o corpo",
      },
      {
        id: "4-2",
        name: "Push-ups (25 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Continue aumentando. Respire normalmente.",
      },
      {
        id: "4-3",
        name: "Squats (30 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "30 agachamentos. Mantenha a forma.",
      },
      {
        id: "4-4",
        name: "Plank Hold (60 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "1 minuto de resistência",
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
        name: "Aquecimento - Burpees (10 repetições)",
        duration: 2,
        gif: "https://media.giphy.com/media/pQmywQeKgVcFunyeBZ/giphy.gif",
        description: "Aquecimento com burpees para elevar o ritmo cardíaco",
      },
      {
        id: "5-2",
        name: "Push-ups (30 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Conseguimos! 30 flexões no dia 5.",
      },
      {
        id: "5-3",
        name: "Squats (35 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "35 agachamentos. Você está ficando mais forte!",
      },
      {
        id: "5-4",
        name: "Plank Hold (75 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Resistência aumentando significativamente",
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
        name: "Aquecimento - High Knees",
        duration: 2,
        gif: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
        description: "Joelhos altos para aquecer",
      },
      {
        id: "6-2",
        name: "Push-ups (30 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Mantendo 30 flexões. Pode fazer com variações.",
      },
      {
        id: "6-3",
        name: "Squats (40 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "40 agachamentos. Pernas ficando fortes!",
      },
      {
        id: "6-4",
        name: "Plank Hold (90 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Uma vez e meia de resistência",
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
        name: "Aquecimento - Mountain Climbers",
        duration: 2,
        gif: "https://media.giphy.com/media/xTiTnI0FGEt0jQfI3u/giphy.gif",
        description: "Escaladores para aquecer",
      },
      {
        id: "7-2",
        name: "Push-ups (35 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Aumentamos mais! 35 flexões.",
      },
      {
        id: "7-3",
        name: "Squats (45 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "45 agachamentos. Uma semana já passou!",
      },
      {
        id: "7-4",
        name: "Plank Hold (2 minutos)",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "2 minutos completos de plank",
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
        name: "Aquecimento - Jump Squats",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlSY9x8FZo0XO1i/giphy.gif",
        description: "Agachamentos com pulo para aquecer",
      },
      {
        id: "8-2",
        name: "Push-ups (40 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "40 flexões! Você está muito mais forte.",
      },
      {
        id: "8-3",
        name: "Squats (50 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "50 agachamentos! Metade do desafio feito.",
      },
      {
        id: "8-4",
        name: "Leg Raises (20 repetições)",
        duration: 5,
        gif: "https://media.giphy.com/media/xTiTpv0kxjvXe9L0m4/giphy.gif",
        description: "Levantamento de perna para fortalecer abdômen",
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
        name: "Aquecimento - Inchworms",
        duration: 2,
        gif: "https://media.giphy.com/media/xT9IgEx8SbQ0teblYQ/giphy.gif",
        description: "Movimentos de lagarta para aquecer",
      },
      {
        id: "9-2",
        name: "Push-ups (45 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "45 flexões. Você é um guerreiro!",
      },
      {
        id: "9-3",
        name: "Squats (55 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "55 agachamentos com poder",
      },
      {
        id: "9-4",
        name: "Leg Raises (25 repetições)",
        duration: 5,
        gif: "https://media.giphy.com/media/xTiTpv0kxjvXe9L0m4/giphy.gif",
        description: "Levantamento de perna para fortalecer",
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
        name: "Aquecimento - Burpees",
        duration: 2,
        gif: "https://media.giphy.com/media/pQmywQeKgVcFunyeBZ/giphy.gif",
        description: "Burpees para aumentar ritmo cardíaco",
      },
      {
        id: "10-2",
        name: "Push-ups (50 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "50 flexões! Metade do caminho!",
      },
      {
        id: "10-3",
        name: "Squats (60 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "60 agachamentos. Suas pernas são máquinas!",
      },
      {
        id: "10-4",
        name: "Leg Raises (30 repetições)",
        duration: 5,
        gif: "https://media.giphy.com/media/xTiTpv0kxjvXe9L0m4/giphy.gif",
        description: "30 levantamentos de perna",
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
        name: "Aquecimento - Rope Skipping",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlQY9x8FZo0XO1i/giphy.gif",
        description: "Pule corda para aquecer",
      },
      {
        id: "11-2",
        name: "Push-ups (50 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Mantendo 50 flexões",
      },
      {
        id: "11-3",
        name: "Squats (65 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "65 agachamentos",
      },
      {
        id: "11-4",
        name: "Dips (15 repetições)",
        duration: 5,
        gif: "https://media.giphy.com/media/26uf1EWagAe3GDXY7K/giphy.gif",
        description: "Mergulhos em cadeira ou banco",
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
        name: "Aquecimento - High Knees",
        duration: 2,
        gif: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
        description: "Joelhos altos para aquecer",
      },
      {
        id: "12-2",
        name: "Push-ups (55 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "55 flexões! Você é forte!",
      },
      {
        id: "12-3",
        name: "Squats (70 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "70 agachamentos com poder",
      },
      {
        id: "12-4",
        name: "Dips (20 repetições)",
        duration: 5,
        gif: "https://media.giphy.com/media/26uf1EWagAe3GDXY7K/giphy.gif",
        description: "20 mergulhos para fortalecer braços",
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
        name: "Aquecimento - Jump Rope",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlQY9x8FZo0XO1i/giphy.gif",
        description: "Pule corda rápido",
      },
      {
        id: "13-2",
        name: "Push-ups (60 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "60 flexões! Você está incrível!",
      },
      {
        id: "13-3",
        name: "Squats (75 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "75 agachamentos",
      },
      {
        id: "13-4",
        name: "Dips (25 repetições)",
        duration: 5,
        gif: "https://media.giphy.com/media/26uf1EWagAe3GDXY7K/giphy.gif",
        description: "25 mergulhos",
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
        name: "Aquecimento - Yoga Stretching",
        duration: 3,
        gif: "https://media.giphy.com/media/xUPGcp0C7eYXz3J2v2/giphy.gif",
        description: "Alongamento leve para recuperação",
      },
      {
        id: "14-2",
        name: "Push-ups (40 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "Reduzimos a intensidade para recuperação",
      },
      {
        id: "14-3",
        name: "Squats (50 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "Agachamentos leves",
      },
      {
        id: "14-4",
        name: "Deep Breathing & Meditation",
        duration: 4,
        gif: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        description: "Respiração profunda e meditação",
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
        name: "Aquecimento - Mountain Climbers",
        duration: 2,
        gif: "https://media.giphy.com/media/xTiTnI0FGEt0jQfI3u/giphy.gif",
        description: "Escaladores para aquecer",
      },
      {
        id: "15-2",
        name: "Push-ups (65 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "65 flexões! Você voltou mais forte!",
      },
      {
        id: "15-3",
        name: "Squats (80 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "80 agachamentos com poder",
      },
      {
        id: "15-4",
        name: "Handstand Hold (30 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/l3nWhI5c0F5T0h7kI/giphy.gif",
        description: "Balanço de mão para fortalecer",
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
        name: "Aquecimento - Burpees",
        duration: 2,
        gif: "https://media.giphy.com/media/pQmywQeKgVcFunyeBZ/giphy.gif",
        description: "Burpees para ritmo cardíaco",
      },
      {
        id: "16-2",
        name: "Push-ups (70 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "70 flexões! Você é um herói!",
      },
      {
        id: "16-3",
        name: "Squats (85 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "85 agachamentos",
      },
      {
        id: "16-4",
        name: "Handstand Hold (45 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/l3nWhI5c0F5T0h7kI/giphy.gif",
        description: "45 segundos de balanço de mão",
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
        name: "Aquecimento - Jump Squats",
        duration: 2,
        gif: "https://media.giphy.com/media/l0HlSY9x8FZo0XO1i/giphy.gif",
        description: "Agachamentos com pulo",
      },
      {
        id: "17-2",
        name: "Push-ups (75 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "75 flexões!",
      },
      {
        id: "17-3",
        name: "Squats (90 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "90 agachamentos com determinação",
      },
      {
        id: "17-4",
        name: "Handstand Hold (60 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/l3nWhI5c0F5T0h7kI/giphy.gif",
        description: "1 minuto de balanço de mão",
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
        name: "Aquecimento - High Knees Sprint",
        duration: 2,
        gif: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
        description: "Joelhos altos em ritmo rápido",
      },
      {
        id: "18-2",
        name: "Push-ups (80 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "80 flexões! Você é uma máquina!",
      },
      {
        id: "18-3",
        name: "Squats (95 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "95 agachamentos",
      },
      {
        id: "18-4",
        name: "Wall Sits (90 segundos)",
        duration: 5,
        gif: "https://media.giphy.com/media/3nFbK92nzg2Dm/giphy.gif",
        description: "Agachamento contra a parede por tempo",
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
        name: "Aquecimento - Inchworms",
        duration: 2,
        gif: "https://media.giphy.com/media/xT9IgEx8SbQ0teblYQ/giphy.gif",
        description: "Movimentos de lagarta",
      },
      {
        id: "19-2",
        name: "Push-ups (85 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "85 flexões! Você está quase lá!",
      },
      {
        id: "19-3",
        name: "Squats (100 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "100 agachamentos! Centena completa!",
      },
      {
        id: "19-4",
        name: "Archer Push-ups (15 repetições)",
        duration: 5,
        gif: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        description: "Flexões em forma de arco para braços",
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
        name: "Aquecimento - Full Body Dynamic",
        duration: 2,
        gif: "https://media.giphy.com/media/3ohzdKZ5I1ZvPAJAje/giphy.gif",
        description: "Aquecimento dinâmico completo",
      },
      {
        id: "20-2",
        name: "Push-ups (90 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "90 flexões! Último dia antes do final!",
      },
      {
        id: "20-3",
        name: "Squats (100 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "100 agachamentos novamente",
      },
      {
        id: "20-4",
        name: "Planche Push-ups (10 repetições)",
        duration: 5,
        gif: "https://media.giphy.com/media/l0HlSY9x8FZo0XO1i/giphy.gif",
        description: "Flexões avançadas de planche",
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
        name: "Push-ups (100 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/J0KWz8UNH51pNhHc1I/giphy.gif",
        description: "100 FLEXÕES! VOCÊ CONQUISTOU!",
      },
      {
        id: "21-3",
        name: "Squats (100 repetições)",
        duration: 4,
        gif: "https://media.giphy.com/media/qrNZlhSC0yMw8/giphy.gif",
        description: "100 AGACHAMENTOS! PARABÉNS!",
      },
      {
        id: "21-4",
        name: "Victory Cool Down",
        duration: 5,
        gif: "https://media.giphy.com/media/XM5TwlmTAYqSI/giphy.gif",
        description: "Alongamento final e merecido descanso. Você é um campeão! 🏆",
      },
    ],
  },
];
