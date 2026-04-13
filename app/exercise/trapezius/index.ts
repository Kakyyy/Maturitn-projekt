// Jazyk: TypeScript (TS)
// Popis: Zdrojový soubor projektu.

// Data: seznam cviků pro partii „trapézy“ (trapezius).

import { Exercise } from '@/src/data/types';

const TRAPEZIUS: Exercise[] = [{ id: 'trapezius-1', name: 'Shrugs', equipment: 'Činka/ jednoručky', primaryMuscles: ['trapezius'], difficulty: 'easy', instructions: ['Postavte se rovně a držte zátěž podél těla.', 'Zpevněte břicho a držte ramena „dole“ v neutrálu.', 'Zvedněte ramena přímo nahoru směrem k uším (bez kroužení).', 'Nahoře krátce zatněte trapézy.', 'Pomalu spusťte zpět dolů do výchozí pozice.', 'Hlavu držte rovně a neprohýbejte krk.'] },
  { id: 'trapezius-2', name: 'Face Pulls', equipment: 'Kladka', primaryMuscles: ['trapezius','rear-delts'], difficulty: 'medium', instructions: ['Nastavte kladku na horní pozici a chyťte lano.', 'Postavte se stabilně a zpevněte střed těla.', 'Začněte stažením lopatek dozadu a dolů.', 'Táhněte lano k obličeji, lokty veďte vysoko do stran.', 'V konci pohybu lehce „roztrhněte“ lano a zatněte zadní delty.', 'Pomalu vraťte zpět bez vytažení ramen k uším.'] },
  { id: 'trapezius-3', name: 'Upright Row', equipment: 'Činka', primaryMuscles: ['trapezius'], difficulty: 'medium', instructions: ['Postavte se rovně a držte činku nadhmatem na šířku ramen.', 'Zpevněte břicho a držte ramena dole.', 'Táhněte činku vzhůru podél těla, lokty veďte výš než zápěstí.', 'Zvedejte do pohodlné výšky (není nutné až k bradě).', 'Pomalu spouštějte zpět dolů bez trhání.', 'Pokud cítíte nepohodlí v ramenou, zkraťte rozsah nebo zvolte jiný cvik.'] },
  { id: 'trapezius-4', name: 'Dumbbell High Pull', equipment: 'Jednoručky', primaryMuscles: ['trapezius'], difficulty: 'medium', instructions: ['Postavte se a držte jednoručky před tělem.', 'Zpevněte střed těla a lehce pokrčte kolena.', 'Vyjeďte výbušně nahoru a táhněte lokty vysoko do stran.', 'Jednoručky vedou pohyb, ale lokty jsou „motor“.', 'Vraťte se dolů kontrolovaně a připravte další opakování.', 'Použijte spíš lehčí váhu a čistý pohyb.'] },
  { id: 'trapezius-5', name: 'Barbell Upright Shrug', equipment: 'Činka', primaryMuscles: ['trapezius'], difficulty: 'medium', instructions: ['Postavte se rovně a držte činku nadhmatem před tělem.', 'Zpevněte břicho a držte krk dlouhý.', 'Zvedněte ramena nahoru a lehce dozadu, jako byste je chtěli „zasunout“.', 'Nahoře krátce zatněte trapézy.', 'Pomalu spusťte zpět dolů bez kroužení rameny.', 'Držte pohyb krátký a kontrolovaný.'] },
  { id: 'trapezius-6', name: 'Trapezius Builder 6', equipment: 'Stroj', primaryMuscles: ['trapezius'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici stroje.', 'Provádějte kontrolovaný pohyb v plném rozsahu.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'trapezius-7', name: 'Trapezius Focus 7', equipment: 'Jednoručky', primaryMuscles: ['trapezius'], difficulty: 'medium', instructions: ['Zvolte přiměřenou zátěž pro čistý pohyb.', 'Proveďte koncentrickou fázi s výdechem.', 'Excentrickou fázi zpomalte na 2 až 3 sekundy.', 'Po celou dobu držte techniku bez kompenzací.'] },
  { id: 'trapezius-8', name: 'Trapezius Builder 8', equipment: 'Stroj', primaryMuscles: ['trapezius'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'trapezius-9', name: 'Trapezius Builder 9', equipment: 'Jednoručky', primaryMuscles: ['trapezius'], difficulty: 'medium', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
];

export default TRAPEZIUS;


