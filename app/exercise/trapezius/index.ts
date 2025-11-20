import { Exercise } from '@/src/data/types';

const TRAPEZIUS: Exercise[] = [
  { id: 'trapezius-1', name: 'Shrugs', equipment: 'Činka/ jednoručky', primaryMuscles: ['trapezius'], difficulty: 'easy', instructions: ['Zvedání ramen směrem k uším.'] },
  { id: 'trapezius-2', name: 'Face Pulls', equipment: 'Kladka', primaryMuscles: ['trapezius','rear-delts'], difficulty: 'medium', instructions: ['Tah ke tváři pro zadní delt a trapézy.'] },
  { id: 'trapezius-3', name: 'Upright Row', equipment: 'Činka', primaryMuscles: ['trapezius'], difficulty: 'medium', instructions: ['Tah činky k bradě s lokty nahoru.'] },
  { id: 'trapezius-4', name: 'Dumbbell High Pull', equipment: 'Jednoručky', primaryMuscles: ['trapezius'], difficulty: 'medium', instructions: ['Výbušný tah s lokty vysoko.'] },
  { id: 'trapezius-5', name: 'Barbell Upright Shrug', equipment: 'Činka', primaryMuscles: ['trapezius'], difficulty: 'medium', instructions: ['Shrug s činkou v ruce.'] },
];

export default TRAPEZIUS;
