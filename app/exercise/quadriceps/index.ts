import { Exercise } from '@/src/data/types';

const QUADRICEPS: Exercise[] = [
  { id: 'quadriceps-1', name: 'Squat', equipment: 'Činka', primaryMuscles: ['quadriceps'], difficulty: 'medium', instructions: ['Plný dřep s kontrolovaným pohybem.'] },
  { id: 'quadriceps-2', name: 'Leg Press', equipment: 'Stroj', primaryMuscles: ['quadriceps'], difficulty: 'medium', instructions: ['Tlačte plošinu nohou s plnou kontrolou.'] },
  { id: 'quadriceps-3', name: 'Lunges', equipment: 'Vlastní váha/Jednoručky', primaryMuscles: ['quadriceps'], difficulty: 'easy', instructions: ['Krok vpřed a dřep na jedné noze.'] },
  { id: 'quadriceps-4', name: 'Leg Extension', equipment: 'Stroj', primaryMuscles: ['quadriceps'], difficulty: 'easy', instructions: ['Izolované natažení kolene na stroji.'] },
  { id: 'quadriceps-5', name: 'Bulgarian Split Squat', equipment: 'Jednoručky', primaryMuscles: ['quadriceps','gluteal'], difficulty: 'hard', instructions: ['Jednonožný dřep s oporou zadní nohy.'] },
];

export default QUADRICEPS;
