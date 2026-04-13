// Jazyk: TypeScript (TS)
// Popis: Zdrojový soubor projektu.

// Data: seznam cviků pro partii „předloktí“.

import { Exercise } from '@/src/data/types';

const FOREARM: Exercise[] = [{ id: 'forearm-1', name: 'Wrist Curls', equipment: 'Činka', primaryMuscles: ['forearm'], difficulty: 'easy', instructions: ['Sedněte si a předloktí opřete o stehna nebo lavičku, dlaně směřují nahoru.', 'Činku držte lehce v prstech a nechte zápěstí klesnout do protažení.', 'Zvedejte zápěstí nahoru bez pohybu v lokti.', 'Nahoře krátce zatněte předloktí.', 'Pomalu spusťte zpět dolů do plného rozsahu.', 'Použijte lehkou váhu a dělejte plynulé opakování.'] },
  { id: 'forearm-2', name: 'Reverse Wrist Curls', equipment: 'Činka', primaryMuscles: ['forearm'], difficulty: 'easy', instructions: ['Sedněte si a předloktí opřete o stehna/lavičku, dlaně směřují dolů.', 'Nechte zápěstí klesnout dolů do protažení.', 'Zvedejte hřbet ruky nahoru (pohyb jde jen ze zápěstí).', 'Nahoře krátce zatněte a držte kontrolu.', 'Pomalu vraťte zpět dolů.', 'Držte lokty fixované a nepoužívejte švih.'] },
  { id: 'forearm-3', name: "Farmer's Walk", equipment: 'Činka/Jednoručky', primaryMuscles: ['forearm'], difficulty: 'medium', instructions: ['Vezměte do rukou jednoručky nebo trap bar a postavte se rovně.', 'Zpevněte břicho, stáhněte ramena dolů a držte dlouhý krk.', 'Začněte chodit krátkými stabilními kroky bez houpání tělem.', 'Držte úchop pevný, ale nekrčte ramena k uším.', 'Otočte se kontrolovaně a pokračujte do cílové vzdálenosti/času.', 'Ukončete sérii, když se začne hroutit držení těla.'] },
  { id: 'forearm-4', name: 'Towel Pull-ups', equipment: 'Hrazda + ručník', primaryMuscles: ['forearm','biceps'], difficulty: 'hard', instructions: ['Přehoďte ručník přes hrazdu a chyťte oba konce (nebo dva ručníky).', 'Pověste se do visu a aktivujte ramena stažením lopatek dolů.', 'Táhněte nahoru jako u shybů – lokty veďte dolů k bokům.', 'Nahoře krátce zastavte a držte tělo bez houpání.', 'Pomalu se spusťte zpět do visu.', 'Pokud je to moc těžké, použijte gumu nebo zkraťte rozsah.'] },
  { id: 'forearm-5', name: 'Plate Pinches', equipment: 'Závaží', primaryMuscles: ['forearm'], difficulty: 'easy', instructions: ['Vezměte kotouče a chyťte je mezi palec a prsty (pinch grip).', 'Postavte se rovně a držte ramena dole.', 'Držte kotouče po stanovený čas bez ohýbání zápěstí.', 'Dýchejte plynule a neprohýbejte se v bedrech.', 'Odložte a dejte pauzu, poté opakujte na další sérii.', 'Začněte lehčí váhou a postupně přidávejte.'] },
  { id: 'forearm-6', name: 'Forearm Builder 6', equipment: 'Stroj', primaryMuscles: ['forearm'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici stroje.', 'Provádějte kontrolovaný pohyb v plném rozsahu.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'forearm-7', name: 'Forearm Focus 7', equipment: 'Jednoručky', primaryMuscles: ['forearm'], difficulty: 'medium', instructions: ['Zvolte přiměřenou zátěž pro čistý pohyb.', 'Proveďte koncentrickou fázi s výdechem.', 'Excentrickou fázi zpomalte na 2 až 3 sekundy.', 'Po celou dobu držte techniku bez kompenzací.'] },
  { id: 'forearm-8', name: 'Forearm Builder 8', equipment: 'Stroj', primaryMuscles: ['forearm'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'forearm-9', name: 'Forearm Builder 9', equipment: 'Jednoručky', primaryMuscles: ['forearm'], difficulty: 'medium', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
];

export default FOREARM;


