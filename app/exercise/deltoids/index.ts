import { Exercise } from '@/src/data/types';

const DELTOIDS: Exercise[] = [
  { id: 'deltoids-1', name: 'Overhead Press', equipment: 'Činka', primaryMuscles: ['deltoids'], difficulty: 'medium', instructions: ['Tlačte činku nad hlavu v kontrolovaném pohybu.'] },
  { id: 'deltoids-2', name: 'Lateral Raises', equipment: 'Jednoručky', primaryMuscles: ['deltoids'], difficulty: 'easy', instructions: ['Zvedejte ruce do stran s lehkým pokrčením loktů.'] },
  { id: 'deltoids-3', name: 'Front Raises', equipment: 'Jednoručky', primaryMuscles: ['deltoids'], difficulty: 'easy', instructions: ['Zvedejte jednoručky před sebe do úrovně ramen.'] },
  { id: 'deltoids-4', name: 'Reverse Flyes', equipment: 'Jednoručky', primaryMuscles: ['rear-delts'], difficulty: 'easy', instructions: ['Skloněné reverse flyes pro zadní část ramen.'] },
  { id: 'deltoids-5', name: 'Arnold Press', equipment: 'Jednoručky', primaryMuscles: ['deltoids'], difficulty: 'medium', instructions: ['Rotace dlaní při tlaku nad hlavu.'] },
];

export default DELTOIDS;
