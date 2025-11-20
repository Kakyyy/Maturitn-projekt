import { Exercise } from '@/src/data/types';

const TRICEPS: Exercise[] = [
  { id: 'triceps-1', name: 'Skull Crushers', equipment: 'Činka', primaryMuscles: ['triceps'], difficulty: 'medium', instructions: ['Spouštějte činku směrem k čelu v loktech.'] },
  { id: 'triceps-2', name: 'Close-grip Bench Press', equipment: 'Činka, lavice', primaryMuscles: ['triceps','chest'], difficulty: 'medium', instructions: ['Úzký úchop, tlačte činku nahoru.'] },
  { id: 'triceps-3', name: 'Triceps Pushdown', equipment: 'Kladka', primaryMuscles: ['triceps'], difficulty: 'easy', instructions: ['Stlačujte rukojeť dolů až do propnutí loktů.'] },
  { id: 'triceps-4', name: 'Overhead Triceps Extension', equipment: 'Jednoručka', primaryMuscles: ['triceps'], difficulty: 'medium', instructions: ['Protahování za hlavou a natlačení nahoru.'] },
  { id: 'triceps-5', name: 'Dips (Triceps variant)', equipment: 'Paralelní bradla', primaryMuscles: ['triceps'], difficulty: 'medium', instructions: ['Tělo více vzpřímené, lokty blíž tělu.'] },
];

export default TRICEPS;
