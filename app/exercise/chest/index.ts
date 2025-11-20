import { Exercise } from '@/src/data/types';

const CHEST: Exercise[] = [
  { id: 'chest-1', name: 'Bench Press', equipment: 'Činka, lavice', primaryMuscles: ['chest'], difficulty: 'medium', instructions: ['Lehněte si na lavičku a tlačte činku nahoru.'] },
  { id: 'chest-2', name: 'Incline Dumbbell Press', equipment: 'Jednoručky, lavice', primaryMuscles: ['chest'], difficulty: 'medium', instructions: ['Tlačte jednoručky ze šikmé lavice.'] },
  { id: 'chest-3', name: 'Push-ups', equipment: 'Vlastní váha', primaryMuscles: ['chest'], difficulty: 'easy', instructions: ['Klasické kliky s pevnou technikou.'] },
  { id: 'chest-4', name: 'Cable Flyes', equipment: 'Kladka', primaryMuscles: ['chest'], difficulty: 'easy', instructions: ['Stažení paží uprostřed při mírném předklonu.'] },
  { id: 'chest-5', name: 'Dips', equipment: 'Paralelní bradla', primaryMuscles: ['chest', 'triceps'], difficulty: 'medium', instructions: ['Spouštějte trup dolů a tlačte nahoru.'] },
];

export default CHEST;
