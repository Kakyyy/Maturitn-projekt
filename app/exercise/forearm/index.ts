import { Exercise } from '@/src/data/types';

const FOREARM: Exercise[] = [
  { id: 'forearm-1', name: 'Wrist Curls', equipment: 'Činka', primaryMuscles: ['forearm'], difficulty: 'easy', instructions: ['Ohýbání zápěstí s lehkým závažím.'] },
  { id: 'forearm-2', name: 'Reverse Wrist Curls', equipment: 'Činka', primaryMuscles: ['forearm'], difficulty: 'easy', instructions: ['Viz obrácené zápěstní zdvihy.'] },
  { id: 'forearm-3', name: "Farmer's Walk", equipment: 'Činka/Jednoručky', primaryMuscles: ['forearm'], difficulty: 'medium', instructions: ['Chůze se závažím v rukou pro úchop.'] },
  { id: 'forearm-4', name: 'Towel Pull-ups', equipment: 'Hrazda + ručník', primaryMuscles: ['forearm','biceps'], difficulty: 'hard', instructions: ['Zvedání s ručníkem pro pevný úchop.'] },
  { id: 'forearm-5', name: 'Plate Pinches', equipment: 'Závaží', primaryMuscles: ['forearm'], difficulty: 'easy', instructions: ['Držení závaží mezi prsty pro zlepšení úchopu.'] },
];

export default FOREARM;
