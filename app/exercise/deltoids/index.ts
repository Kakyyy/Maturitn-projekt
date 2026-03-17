// Data: seznam cviků pro partii „ramena“ (deltoids).

import { Exercise } from '@/src/data/types';

const DELTOIDS: Exercise[] = [
  { id: 'deltoids-1', name: 'Overhead Press', equipment: 'Činka', primaryMuscles: ['deltoids'], difficulty: 'medium', instructions: ['Postavte se na šířku boků a činku držte v úrovni klíčních kostí.', 'Zpevněte břicho a hýždě, žebra držte „dole“.', 'S výdechem tlačte činku přímo nad hlavu a hlavu lehce posuňte dopředu pod osu.', 'Nahoře držte lokty plně propnuté bez přehnaného prohnutí v bedrech.', 'Kontrolovaně spouštějte činku zpět na ramena.', 'Pokud vás bolí ramena, zkraťte rozsah nebo snižte váhu.'] },
  { id: 'deltoids-2', name: 'Lateral Raises', equipment: 'Jednoručky', primaryMuscles: ['deltoids'], difficulty: 'easy', instructions: ['Postavte se rovně, jednoručky držte u stehen a lokty mírně pokrčte.', 'Zpevněte střed těla a držte ramena dole (nekrčte je k uším).', 'Zvedejte ruce do stran až do úrovně ramen – lokty lehce výš než zápěstí.', 'Nahoře krátce zastavte bez švihu.', 'Pomalu spouštějte dolů do výchozí pozice.', 'Použijte menší váhu a čistou techniku.'] },
  { id: 'deltoids-3', name: 'Front Raises', equipment: 'Jednoručky', primaryMuscles: ['deltoids'], difficulty: 'easy', instructions: ['Postavte se rovně a držte jednoručky před stehny.', 'Zpevněte břicho a držte lopatky stabilně.', 'Zvedejte jednoručky před sebe do úrovně ramen (bez prohnutí v bedrech).', 'Lokty držte mírně pokrčené a zápěstí rovně.', 'Pomalu spouštějte zpět dolů a držte kontrolu.', 'Pro lepší kontrolu můžete střídat ruce.'] },
  { id: 'deltoids-4', name: 'Reverse Flyes', equipment: 'Jednoručky', primaryMuscles: ['rear-delts'], difficulty: 'easy', instructions: ['Jděte do předklonu s rovnými zády (hinge) nebo se opřete o lavici.', 'Jednoručky nechte viset pod rameny, lokty mírně pokrčte.', 'Rozpažujte do stran a lokty veďte do úrovně ramen.', 'Nahoře stáhněte lopatky jemně k sobě (bez přetahování).', 'Pomalu vraťte dolů do výchozí pozice.', 'Nedělejte švih – raději snižte váhu.'] },
  { id: 'deltoids-5', name: 'Arnold Press', equipment: 'Jednoručky', primaryMuscles: ['deltoids'], difficulty: 'medium', instructions: ['Sedněte si nebo stůjte, jednoručky držte před obličejem, dlaně k sobě.', 'Zpevněte střed těla a držte ramena dole.', 'Při tlaku nahoru otáčejte dlaněmi ven, až jsou v horní pozici dopředu.', 'Nahoře držte lokty propnuté a kontrolujte bedra.', 'Při spouštění dolů otáčejte zpět do startovní pozice.', 'Pohyb je plynulý – bez trhání a bez švihu.'] },
];

export default DELTOIDS;
