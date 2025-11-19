export type Difficulty = "easy" | "medium" | "hard";

export type Exercise = {
  id: string;
  name: string;
  equipment?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  difficulty?: Difficulty;
  instructions?: string;
  videoUrl?: string;
};

export type ExerciseMap = Record<string, Exercise[]>;

export default {};
