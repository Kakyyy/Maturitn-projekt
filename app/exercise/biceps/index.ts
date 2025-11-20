import { Exercise } from '@/src/data/types';

const BICEPS: Exercise[] = [
  { id: 'biceps-1', name: 'Barbell Curls', equipment: 'Činka', primaryMuscles: ['biceps'], difficulty: 'medium', instructions: ['Zvedejte činku lokty u těla.'] },
  { id: 'biceps-2', name: 'Dumbbell Hammer Curls', equipment: 'Jednoručky', primaryMuscles: ['biceps','forearm'], difficulty: 'easy', instructions: ['Udržujte neutrální úchop, zvedejte do ramen.'] },
  { id: 'biceps-3', name: 'Concentration Curls', equipment: 'Jednoručky', primaryMuscles: ['biceps'], difficulty: 'easy', instructions: ['Izolovaný zdvih z opory stehna.'] },
  { id: 'biceps-4', name: 'Preacher Curls', equipment: 'Lavice', primaryMuscles: ['biceps'], difficulty: 'medium', instructions: ['Kontrolovaný zdvih na preacher lavici.'] },
  { id: 'biceps-5', name: 'Cable Curls', equipment: 'Kladka', primaryMuscles: ['biceps'], difficulty: 'easy', instructions: ['Plynulý tah s konstantním napětím.'] },
];

export default BICEPS;
