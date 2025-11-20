import { Exercise } from '@/src/data/types';

const GLUTEAL: Exercise[] = [
  { id: 'gluteal-1', name: 'Hip Thrust', equipment: 'Lavice, činka', primaryMuscles: ['gluteal'], difficulty: 'medium', instructions: ['Tlačte boky vzhůru s činkou přes pánev.'] },
  { id: 'gluteal-2', name: 'Glute Bridge', equipment: 'Vlastní váha', primaryMuscles: ['gluteal'], difficulty: 'easy', instructions: ['Zvedejte boky z lehu na zádech.'] },
  { id: 'gluteal-3', name: 'Bulgarian Split Squat', equipment: 'Jednoručky', primaryMuscles: ['gluteal','quadriceps'], difficulty: 'hard', instructions: ['Jednonožný dřep s oporou zadní nohy.'] },
  { id: 'gluteal-4', name: 'Single-leg Romanian Deadlift', equipment: 'Jednoručky', primaryMuscles: ['gluteal','hamstrings'], difficulty: 'medium', instructions: ['Kontrolovaný hinge na jedné noze.'] },
  { id: 'gluteal-5', name: 'Cable Kickbacks', equipment: 'Kladka', primaryMuscles: ['gluteal'], difficulty: 'easy', instructions: ['Kopání zadní nohou proti odporu kladky.'] },
];

export default GLUTEAL;
