import ABS from '../abs';
import BACK from '../back';
import BICEPS from '../biceps';
import CALVES from '../calves';
import CHEST from '../chest';
import DELTOIDS from '../deltoids';
import FOREARM from '../forearm';
import GLUTEAL from '../gluteal';
import HAMSTRING from '../hamstring';
import QUADRICEPS from '../quadriceps';
import TRAPEZIUS from '../trapezius';
import TRICEPS from '../triceps';

import { ExerciseMap } from '@/src/data/types';

export const EXERCISES: ExerciseMap = {
  chest: CHEST,
  back: BACK,
  deltoids: DELTOIDS,
  gluteal: GLUTEAL,
  trapezius: TRAPEZIUS,
  biceps: BICEPS,
  triceps: TRICEPS,
  forearm: FOREARM,
  abs: ABS,
  quadriceps: QUADRICEPS,
  hamstring: HAMSTRING,
  calves: CALVES,
};

export default EXERCISES;
