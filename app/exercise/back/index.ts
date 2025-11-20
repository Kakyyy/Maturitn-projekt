import { Exercise } from '@/src/data/types';

const BACK: Exercise[] = [
  { id: 'back-1', name: 'Deadlift', equipment: 'Činka', primaryMuscles: ['back'], difficulty: 'hard', instructions: ['Zvedejte činku s rovnými zády.'] },
  { id: 'back-2', name: 'Pull-ups', equipment: 'Hrazda', primaryMuscles: ['upper-back','lats'], difficulty: 'hard', instructions: ['Tah k hrudi s plným rozsahem.'] },
  { id: 'back-3', name: 'Bent Over Row', equipment: 'Činka', primaryMuscles: ['upper-back'], difficulty: 'medium', instructions: ['Táhněte činku k břichu při předklonu.'] },
  { id: 'back-4', name: 'Lat Pulldown', equipment: 'Kladka', primaryMuscles: ['lats'], difficulty: 'medium', instructions: ['Stahujte kladku k hrudi.'] },
  { id: 'back-5', name: 'Seated Cable Row', equipment: 'Kladka', primaryMuscles: ['middle-back'], difficulty: 'medium', instructions: ['Táhněte rukojeť k pasu s pevnými lopatkami.'] },
];

export default BACK;
