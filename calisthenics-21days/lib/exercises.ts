export interface Exercise {
  id: string;
  name: string;
  sets: number; // número de séries
  reps: number; // número de repetições
  restTime: number; // tempo de descanso em segundos
  gif: string; // URL do GIF
  description: string;
}

export interface Day {
  dayNumber: number;
  exercises: Exercise[];
}

export const EXERCISES_DATA: Day[] = [
  // DIA 1
  {
    dayNumber: 1,
    exercises: [
      {
        id: "1-1",
        name: "Aquecimento - Círculos com Braços",
        sets: 2,
        reps: 30,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/2/3/7/1/7/23717.gif",
        description: "2x30 segundos. Movimentos circulares com os braços para aquecer.",
      },
      {
        id: "1-2",
        name: "Flexões",
        sets: 3,
        reps: 10,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "3x10 repetições. Mantenha o corpo reto da cabeça até os pés.",
      },
      {
        id: "1-3",
        name: "Agachamentos",
        sets: 3,
        reps: 15,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "3x15 repetições. Joelhos atrás dos pés, peso do corpo.",
      },
    ],
  },

  // DIA 2
  {
    dayNumber: 2,
    exercises: [
      {
        id: "2-1",
        name: "Pular Corda",
        sets: 2,
        reps: 30,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/0/7/5/9/10759.gif",
        description: "2x30 segundos. Ritmo cardíaco elevado.",
      },
      {
        id: "2-2",
        name: "Flexões",
        sets: 3,
        reps: 15,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "3x15 repetições. Foco na forma.",
      },
      {
        id: "2-3",
        name: "Agachamentos",
        sets: 3,
        reps: 20,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "3x20 repetições. Ritmo constante.",
      },
      {
        id: "2-4",
        name: "Prancha",
        sets: 2,
        reps: 30,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "2x30 segundos. Corpo completamente alinhado.",
      },
    ],
  },

  // DIA 3
  {
    dayNumber: 3,
    exercises: [
      {
        id: "3-1",
        name: "Escaladores",
        sets: 2,
        reps: 30,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/9/8/5/7/19857.gif",
        description: "2x30 segundos. Aqueça o corpo rapidamente.",
      },
      {
        id: "3-2",
        name: "Flexões",
        sets: 3,
        reps: 20,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "3x20 repetições. Aumentando dificuldade.",
      },
      {
        id: "3-3",
        name: "Agachamentos",
        sets: 3,
        reps: 25,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "3x25 repetições.",
      },
      {
        id: "3-4",
        name: "Prancha",
        sets: 3,
        reps: 45,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "3x45 segundos cada série.",
      },
    ],
  },

  // DIA 4
  {
    dayNumber: 4,
    exercises: [
      {
        id: "4-1",
        name: "Pular Corda",
        sets: 2,
        reps: 40,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/0/7/5/9/10759.gif",
        description: "2x40 segundos. Aumentando intensidade.",
      },
      {
        id: "4-2",
        name: "Flexões",
        sets: 3,
        reps: 25,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "3x25 repetições.",
      },
      {
        id: "4-3",
        name: "Agachamentos",
        sets: 3,
        reps: 30,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "3x30 repetições.",
      },
      {
        id: "4-4",
        name: "Prancha",
        sets: 3,
        reps: 60,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "3x60 segundos. 1 minuto cada série.",
      },
    ],
  },

  // DIA 5
  {
    dayNumber: 5,
    exercises: [
      {
        id: "5-1",
        name: "Burpees",
        sets: 2,
        reps: 30,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/8/9/6/6/8966.gif",
        description: "2x30 segundos. Exercício completo.",
      },
      {
        id: "5-2",
        name: "Flexões",
        sets: 4,
        reps: 20,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "4x20 repetições. Você está ótimo!",
      },
      {
        id: "5-3",
        name: "Agachamentos",
        sets: 4,
        reps: 25,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "4x25 repetições com poder.",
      },
      {
        id: "5-4",
        name: "Prancha",
        sets: 3,
        reps: 75,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "3x75 segundos. Resistência aumentando.",
      },
    ],
  },

  // DIA 6
  {
    dayNumber: 6,
    exercises: [
      {
        id: "6-1",
        name: "Escaladores",
        sets: 3,
        reps: 30,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/9/8/5/7/19857.gif",
        description: "3x30 segundos.",
      },
      {
        id: "6-2",
        name: "Flexões",
        sets: 4,
        reps: 25,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "4x25 repetições.",
      },
      {
        id: "6-3",
        name: "Agachamentos",
        sets: 4,
        reps: 30,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "4x30 repetições.",
      },
      {
        id: "6-4",
        name: "Prancha",
        sets: 3,
        reps: 90,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "3x90 segundos. 1,5 minutos cada.",
      },
    ],
  },

  // DIA 7
  {
    dayNumber: 7,
    exercises: [
      {
        id: "7-1",
        name: "Pular Corda",
        sets: 3,
        reps: 40,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/0/7/5/9/10759.gif",
        description: "3x40 segundos.",
      },
      {
        id: "7-2",
        name: "Flexões",
        sets: 4,
        reps: 30,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "4x30 repetições. Uma semana passou!",
      },
      {
        id: "7-3",
        name: "Agachamentos",
        sets: 4,
        reps: 35,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "4x35 repetições.",
      },
      {
        id: "7-4",
        name: "Prancha",
        sets: 3,
        reps: 120,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "3x120 segundos. 2 minutos cada!",
      },
    ],
  },

  // DIA 8
  {
    dayNumber: 8,
    exercises: [
      {
        id: "8-1",
        name: "Burpees",
        sets: 3,
        reps: 30,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/8/9/6/6/8966.gif",
        description: "3x30 segundos.",
      },
      {
        id: "8-2",
        name: "Flexões",
        sets: 4,
        reps: 35,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "4x35 repetições. Você está muito mais forte!",
      },
      {
        id: "8-3",
        name: "Agachamentos",
        sets: 4,
        reps: 40,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "4x40 repetições.",
      },
      {
        id: "8-4",
        name: "Mergulhos em Cadeira",
        sets: 3,
        reps: 15,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/4/9/8/4/4984.gif",
        description: "3x15 repetições. Fortaleça os braços.",
      },
    ],
  },

  // DIA 9
  {
    dayNumber: 9,
    exercises: [
      {
        id: "9-1",
        name: "Escaladores",
        sets: 3,
        reps: 40,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/9/8/5/7/19857.gif",
        description: "3x40 segundos.",
      },
      {
        id: "9-2",
        name: "Flexões",
        sets: 4,
        reps: 40,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "4x40 repetições. Você é um guerreiro!",
      },
      {
        id: "9-3",
        name: "Agachamentos",
        sets: 4,
        reps: 45,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "4x45 repetições.",
      },
      {
        id: "9-4",
        name: "Mergulhos em Cadeira",
        sets: 3,
        reps: 20,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/4/9/8/4/4984.gif",
        description: "3x20 repetições.",
      },
    ],
  },

  // DIA 10
  {
    dayNumber: 10,
    exercises: [
      {
        id: "10-1",
        name: "Pular Corda",
        sets: 3,
        reps: 50,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/0/7/5/9/10759.gif",
        description: "3x50 segundos.",
      },
      {
        id: "10-2",
        name: "Flexões",
        sets: 5,
        reps: 35,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x35 repetições. Você é incrível!",
      },
      {
        id: "10-3",
        name: "Agachamentos",
        sets: 5,
        reps: 40,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x40 repetições.",
      },
      {
        id: "10-4",
        name: "Mergulhos em Cadeira",
        sets: 3,
        reps: 25,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/4/9/8/4/4984.gif",
        description: "3x25 repetições.",
      },
    ],
  },

  // DIA 11
  {
    dayNumber: 11,
    exercises: [
      {
        id: "11-1",
        name: "Burpees",
        sets: 3,
        reps: 40,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/8/9/6/6/8966.gif",
        description: "3x40 segundos.",
      },
      {
        id: "11-2",
        name: "Flexões",
        sets: 5,
        reps: 40,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x40 repetições.",
      },
      {
        id: "11-3",
        name: "Agachamentos",
        sets: 5,
        reps: 45,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x45 repetições.",
      },
      {
        id: "11-4",
        name: "Mergulhos em Cadeira",
        sets: 4,
        reps: 25,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/4/9/8/4/4984.gif",
        description: "4x25 repetições.",
      },
    ],
  },

  // DIA 12
  {
    dayNumber: 12,
    exercises: [
      {
        id: "12-1",
        name: "Escaladores",
        sets: 3,
        reps: 50,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/9/8/5/7/19857.gif",
        description: "3x50 segundos.",
      },
      {
        id: "12-2",
        name: "Flexões",
        sets: 5,
        reps: 45,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x45 repetições. Você está muito mais forte!",
      },
      {
        id: "12-3",
        name: "Agachamentos",
        sets: 5,
        reps: 50,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x50 repetições.",
      },
      {
        id: "12-4",
        name: "Mergulhos em Cadeira",
        sets: 4,
        reps: 30,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/4/9/8/4/4984.gif",
        description: "4x30 repetições.",
      },
    ],
  },

  // DIA 13
  {
    dayNumber: 13,
    exercises: [
      {
        id: "13-1",
        name: "Pular Corda",
        sets: 4,
        reps: 50,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/0/7/5/9/10759.gif",
        description: "4x50 segundos.",
      },
      {
        id: "13-2",
        name: "Flexões",
        sets: 5,
        reps: 50,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x50 repetições. Você é um campeão!",
      },
      {
        id: "13-3",
        name: "Agachamentos",
        sets: 5,
        reps: 55,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x55 repetições.",
      },
      {
        id: "13-4",
        name: "Mergulhos em Cadeira",
        sets: 4,
        reps: 35,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/4/9/8/4/4984.gif",
        description: "4x35 repetições.",
      },
    ],
  },

  // DIA 14 - Descanso Relativo
  {
    dayNumber: 14,
    exercises: [
      {
        id: "14-1",
        name: "Aquecimento - Círculos com Braços",
        sets: 2,
        reps: 45,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/2/3/7/1/7/23717.gif",
        description: "2x45 segundos. Alongamento leve para recuperação.",
      },
      {
        id: "14-2",
        name: "Flexões",
        sets: 3,
        reps: 30,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "3x30 repetições. Intensidade reduzida.",
      },
      {
        id: "14-3",
        name: "Agachamentos",
        sets: 3,
        reps: 35,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "3x35 repetições. Recuperação.",
      },
      {
        id: "14-4",
        name: "Prancha",
        sets: 2,
        reps: 90,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "2x90 segundos. Meditação e relaxamento.",
      },
    ],
  },

  // DIA 15
  {
    dayNumber: 15,
    exercises: [
      {
        id: "15-1",
        name: "Escaladores",
        sets: 3,
        reps: 60,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/9/8/5/7/19857.gif",
        description: "3x60 segundos.",
      },
      {
        id: "15-2",
        name: "Flexões",
        sets: 5,
        reps: 50,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x50 repetições. Voltou mais forte!",
      },
      {
        id: "15-3",
        name: "Agachamentos",
        sets: 5,
        reps: 60,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x60 repetições.",
      },
      {
        id: "15-4",
        name: "Burpees",
        sets: 3,
        reps: 10,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/8/9/6/6/8966.gif",
        description: "3x10 repetições.",
      },
    ],
  },

  // DIA 16
  {
    dayNumber: 16,
    exercises: [
      {
        id: "16-1",
        name: "Pular Corda",
        sets: 4,
        reps: 60,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/0/7/5/9/10759.gif",
        description: "4x60 segundos.",
      },
      {
        id: "16-2",
        name: "Flexões",
        sets: 5,
        reps: 55,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x55 repetições. Você é um herói!",
      },
      {
        id: "16-3",
        name: "Agachamentos",
        sets: 5,
        reps: 65,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x65 repetições.",
      },
      {
        id: "16-4",
        name: "Mergulhos em Cadeira",
        sets: 4,
        reps: 40,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/4/9/8/4/4984.gif",
        description: "4x40 repetições.",
      },
    ],
  },

  // DIA 17
  {
    dayNumber: 17,
    exercises: [
      {
        id: "17-1",
        name: "Burpees",
        sets: 3,
        reps: 50,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/8/9/6/6/8966.gif",
        description: "3x50 segundos.",
      },
      {
        id: "17-2",
        name: "Flexões",
        sets: 5,
        reps: 60,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x60 repetições. Você é uma lenda!",
      },
      {
        id: "17-3",
        name: "Agachamentos",
        sets: 5,
        reps: 70,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x70 repetições.",
      },
      {
        id: "17-4",
        name: "Prancha",
        sets: 3,
        reps: 150,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "3x150 segundos. 2,5 minutos cada.",
      },
    ],
  },

  // DIA 18
  {
    dayNumber: 18,
    exercises: [
      {
        id: "18-1",
        name: "Escaladores",
        sets: 4,
        reps: 60,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/9/8/5/7/19857.gif",
        description: "4x60 segundos.",
      },
      {
        id: "18-2",
        name: "Flexões",
        sets: 5,
        reps: 70,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x70 repetições. Quase lá!",
      },
      {
        id: "18-3",
        name: "Agachamentos",
        sets: 5,
        reps: 75,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x75 repetições.",
      },
      {
        id: "18-4",
        name: "Mergulhos em Cadeira",
        sets: 4,
        reps: 50,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/4/9/8/4/4984.gif",
        description: "4x50 repetições. Força máxima!",
      },
    ],
  },

  // DIA 19
  {
    dayNumber: 19,
    exercises: [
      {
        id: "19-1",
        name: "Pular Corda",
        sets: 4,
        reps: 60,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/0/7/5/9/10759.gif",
        description: "4x60 segundos.",
      },
      {
        id: "19-2",
        name: "Flexões",
        sets: 5,
        reps: 75,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x75 repetições.",
      },
      {
        id: "19-3",
        name: "Agachamentos",
        sets: 5,
        reps: 80,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x80 repetições.",
      },
      {
        id: "19-4",
        name: "Burpees",
        sets: 3,
        reps: 15,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/8/9/6/6/8966.gif",
        description: "3x15 repetições.",
      },
    ],
  },

  // DIA 20
  {
    dayNumber: 20,
    exercises: [
      {
        id: "20-1",
        name: "Escaladores",
        sets: 4,
        reps: 60,
        restTime: 30,
        gif: "https://gymvisual.com/img/p/1/9/8/5/7/19857.gif",
        description: "4x60 segundos.",
      },
      {
        id: "20-2",
        name: "Flexões",
        sets: 5,
        reps: 80,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x80 repetições. Penúltimo dia!",
      },
      {
        id: "20-3",
        name: "Agachamentos",
        sets: 5,
        reps: 85,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x85 repetições.",
      },
      {
        id: "20-4",
        name: "Prancha",
        sets: 3,
        reps: 180,
        restTime: 45,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "3x180 segundos. 3 minutos cada!",
      },
    ],
  },

  // DIA 21 - Grande Final
  {
    dayNumber: 21,
    exercises: [
      {
        id: "21-1",
        name: "Flexões",
        sets: 5,
        reps: 100,
        restTime: 90,
        gif: "https://gymvisual.com/img/p/1/0/0/8/3/10083.gif",
        description: "5x100 repetições. GRANDE FINAL!",
      },
      {
        id: "21-2",
        name: "Agachamentos",
        sets: 5,
        reps: 100,
        restTime: 90,
        gif: "https://gymvisual.com/img/p/5/5/1/1/5511.gif",
        description: "5x100 repetições. VOCÊ CONSEGUIU!",
      },
      {
        id: "21-3",
        name: "Prancha Final",
        sets: 1,
        reps: 300,
        restTime: 60,
        gif: "https://gymvisual.com/img/p/9/0/3/8/9038.gif",
        description: "1x300 segundos. 5 minutos! VOCÊ É UM CAMPEÃO!",
      },
    ],
  },
];
