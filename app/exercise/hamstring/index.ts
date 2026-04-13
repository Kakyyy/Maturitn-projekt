// Jazyk: TypeScript (TS)
// Popis: Zdrojový soubor projektu.

// Data: seznam cviků pro partii „hamstring“ (zadní stehno).

import { Exercise } from '@/src/data/types';

const HAMSTRING: Exercise[] = [{ id: 'hamstring-1', name: 'Romanian Deadlift', equipment: 'Činka', primaryMuscles: ['hamstrings'], difficulty: 'medium', instructions: ['Postavte se na šířku boků, činku držte před stehny.', 'Kolena mírně pokrčte a zpevněte střed těla.', 'Jděte do předklonu (hinge) – boky dozadu, záda v neutrálu.', 'Spouštějte činku těsně podél nohou, dokud cítíte protažení hamstringů.', 'S výdechem se vraťte nahoru zatlačením boků dopředu.', 'Nezakulacujte záda a nepoužívejte švih.'] },
  { id: 'hamstring-2', name: 'Leg Curl', equipment: 'Stroj', primaryMuscles: ['hamstrings'], difficulty: 'easy', instructions: ['Nastavte stroj tak, aby se opěrka dotýkala těsně nad patami.', 'Zpevněte trup a přitlačte boky do lavice/sedu.', 'Přitahujte paty k hýždím plynule a bez trhání.', 'Nahoře krátce zatněte hamstringy.', 'Pomalu vraťte zpět do natažení bez „odskoku“.', 'Držte stejnou dráhu pohybu v každém opakování.'] },
  { id: 'hamstring-3', name: 'Glute-ham Raise', equipment: 'Stroj', primaryMuscles: ['hamstrings'], difficulty: 'hard', instructions: ['Nastavte opěrky tak, aby byly kotníky fixované a stehna opřená.', 'Začněte v rovné linii kolena–kyčle–ramena.', 'Pomalým pohybem klesejte dolů a držte tělo zpevněné.', 'Jakmile to jde, přitáhněte se zpět nahoru hamstringy.', 'Pro lehčí variantu pomáhejte rukama na začátku pohybu.', 'Vyhněte se prohnutí v bedrech a trhání.'] },
  { id: 'hamstring-4', name: 'Single-leg RDL', equipment: 'Jednoručky', primaryMuscles: ['hamstrings'], difficulty: 'medium', instructions: ['Postavte se na jednu nohu, druhou zvedněte dozadu.', 'Zpevněte břicho a držte pánev stabilní.', 'Jděte do hinge pohybu – boky dozadu, záda rovně.', 'Zátěž držte blízko stojné nohy, koleno lehce pokrčené.', 'Zastavte v bodě největšího protažení a bez švihu se vraťte nahoru.', 'Když ztrácíte rovnováhu, zkraťte rozsah.'] },
  { id: 'hamstring-5', name: 'Nordic Hamstring Curl', equipment: 'Partner/řízení', primaryMuscles: ['hamstrings'], difficulty: 'hard', instructions: ['Klekněte si a nechte si zafixovat kotníky (partnerem nebo pod opěrou).', 'Zpevněte břicho a držte trup v rovné linii.', 'Pomalu se naklánějte dopředu a brzďte pohyb hamstringy.', 'Jakmile už neudržíte kontrolu, zachyťte se rukama o zem.', 'Pomozte si rukama a vraťte se zpět do startovní pozice.', 'Začněte s malým počtem opakování a soustřeďte se na kontrolu.'] },
  { id: 'hamstring-6', name: 'Hamstring Builder 6', equipment: 'Stroj', primaryMuscles: ['hamstring'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici stroje.', 'Provádějte kontrolovaný pohyb v plném rozsahu.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'hamstring-7', name: 'Hamstring Focus 7', equipment: 'Jednoručky', primaryMuscles: ['hamstring'], difficulty: 'medium', instructions: ['Zvolte přiměřenou zátěž pro čistý pohyb.', 'Proveďte koncentrickou fázi s výdechem.', 'Excentrickou fázi zpomalte na 2 až 3 sekundy.', 'Po celou dobu držte techniku bez kompenzací.'] },
  { id: 'hamstring-8', name: 'Hamstring Builder 8', equipment: 'Stroj', primaryMuscles: ['hamstring'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'hamstring-9', name: 'Hamstring Builder 9', equipment: 'Jednoručky', primaryMuscles: ['hamstring'], difficulty: 'medium', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
];

export default HAMSTRING;


