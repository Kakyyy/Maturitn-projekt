import { Exercise } from '@/src/data/types';

const HAMSTRING: Exercise[] = [
  { id: 'hamstring-1', name: 'Romanian Deadlift', equipment: 'Činka', primaryMuscles: ['hamstrings'], difficulty: 'medium', instructions: ['Hinge pohyb s mírným pokrčením kolen.'] },
  { id: 'hamstring-2', name: 'Leg Curl', equipment: 'Stroj', primaryMuscles: ['hamstrings'], difficulty: 'easy', instructions: ['Přitahujte paty k hýždím na stroji.'] },
  { id: 'hamstring-3', name: 'Glute-ham Raise', equipment: 'Stroj', primaryMuscles: ['hamstrings'], difficulty: 'hard', instructions: ['Kontrolovaný pohyb na glute-ham zařízení.'] },
  { id: 'hamstring-4', name: 'Single-leg RDL', equipment: 'Jednoručky', primaryMuscles: ['hamstrings'], difficulty: 'medium', instructions: ['Jeden stojící hinge pro zadní řetězec.'] },
  { id: 'hamstring-5', name: 'Nordic Hamstring Curl', equipment: 'Partner/řízení', primaryMuscles: ['hamstrings'], difficulty: 'hard', instructions: ['Excentrické posilování hamstringů.'] },
];

export default HAMSTRING;
