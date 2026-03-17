// Data: seznam cviků pro partii „biceps“.

import { Exercise } from '@/src/data/types';

const BICEPS: Exercise[] = [
  { id: 'biceps-1', name: 'Barbell Curls', equipment: 'Činka', primaryMuscles: ['biceps'], difficulty: 'medium', instructions: ['Postavte se rovně, chodidla na šířku boků a činku držte podhmatem.', 'Zpevněte břicho a držte lokty u těla.', 'Zvedejte činku nahoru pouze ohybem v loktech – bez švihu trupem.', 'Nahoře krátce zatněte biceps a držte zápěstí v neutrálu.', 'Pomalu spouštějte dolů až do natažení (bez „odskoku“).', 'Když musíte houpat, snižte váhu.'] },
  { id: 'biceps-2', name: 'Dumbbell Hammer Curls', equipment: 'Jednoručky', primaryMuscles: ['biceps','forearm'], difficulty: 'easy', instructions: ['Postavte se a držte jednoručky neutrálně (dlaně k sobě).', 'Zpevněte střed těla a držte ramena dole.', 'Zvedejte jednoručky k ramenům, lokty zůstávají u těla.', 'Nahoře krátce zatněte a nechte předloktí stále v neutrálu.', 'Pomalým pohybem vraťte zpět dolů do natažení.', 'Střídejte ruce nebo dělejte obě najednou – bez švihu.'] },
  { id: 'biceps-3', name: 'Concentration Curls', equipment: 'Jednoručky', primaryMuscles: ['biceps'], difficulty: 'easy', instructions: ['Sedněte si, loket opřete o vnitřní stranu stehna.', 'Ruku nechte volně nataženou dolů a zpevněte rameno (nepohybujte s ním).', 'Zvedejte jednoručku nahoru kontrolovaně, bez odlepení lokte z opory.', 'Nahoře krátce zatněte biceps a držte zápěstí rovně.', 'Pomalu spouštějte zpět dolů do natažení.', 'Pro jistotu jeďte menší váhu a čistou techniku.'] },
  { id: 'biceps-4', name: 'Preacher Curls', equipment: 'Lavice', primaryMuscles: ['biceps'], difficulty: 'medium', instructions: ['Nastavte preacher lavici tak, aby paže pohodlně ležely na opěrce.', 'Chyťte EZ osu nebo jednoručku a lokty nechte fixované na podložce.', 'Zvedejte váhu nahoru plynule bez odlepení paží.', 'Nahoře krátce zatněte biceps, ale nepřetěžujte lokty.', 'Spouštějte pomalu dolů do protažení.', 'Vyhněte se trhání ze spodní pozice.'] },
  { id: 'biceps-5', name: 'Cable Curls', equipment: 'Kladka', primaryMuscles: ['biceps'], difficulty: 'easy', instructions: ['Nastavte kladku dole a chyťte rovnou tyč nebo lano.', 'Postavte se rovně, lokty držte u těla a ramena dole.', 'Táhněte nahoru do ohybu loktů a držte konstantní napětí.', 'Nahoře krátce zatněte biceps a nepouštějte lokty dopředu.', 'Pomalým pohybem vraťte zpět dolů do natažení.', 'Udržujte plynulý rytmus a bez švihu.'] },
];

export default BICEPS;
