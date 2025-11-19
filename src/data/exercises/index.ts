import CHEST from "./chest";
import BACK from "./back";
import DELTOIDS from "./deltoids";
import TRAPEZIUS from "./trapezius";
import GLUTEAL from "./gluteal";
import { ExerciseMap } from "../types";

export const EXERCISES: ExerciseMap = {
  chest: CHEST,
  back: BACK,
  deltoids: DELTOIDS,
  trapezius: TRAPEZIUS,
  gluteal: GLUTEAL,
};

export default EXERCISES;
