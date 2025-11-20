import { Exercise } from '@/src/data/types';

const ABS: Exercise[] = [
  { id: 'abs-1', name: 'Crunches', equipment: 'Vlastní váha', primaryMuscles: ['abs'], difficulty: 'easy', instructions: ['Zvedejte trup ke kolenům s pevnými břišními svaly.'] },
  { id: 'abs-2', name: 'Plank', equipment: 'Vlastní váha', primaryMuscles: ['core'], difficulty: 'easy', instructions: ['Udržujte tělo v prkně po stanovený čas.'] },
  { id: 'abs-3', name: 'Leg Raises', equipment: 'Vlastní váha', primaryMuscles: ['abs'], difficulty: 'medium', instructions: ['Zvedání natažených nohou v lehu.'] },
  { id: 'abs-4', name: 'Russian Twists', equipment: 'Vlastní váha/medicinbal', primaryMuscles: ['obliques'], difficulty: 'easy', instructions: ['Rotace trupu vsedě s nohama nad zemí.'] },
  { id: 'abs-5', name: 'Hanging Knee Raises', equipment: 'Hrazda', primaryMuscles: ['abs'], difficulty: 'medium', instructions: ['Zvedejte pokrčená kolena směrem k hrudi.'] },
];

export default ABS;
