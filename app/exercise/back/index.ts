// Data: seznam cviků pro partii „záda“.

import { Exercise } from '@/src/data/types';

const BACK: Exercise[] = [
  { id: 'back-1', name: 'Deadlift', equipment: 'Činka', primaryMuscles: ['back'], difficulty: 'hard', instructions: ['Postavte se na šířku boků, činka nad středem chodidel.', 'Chyťte osu, zpevněte střed těla a srovnejte záda do neutrálu.', 'Zatlačte chodidly do země a zvedejte činku s osou co nejblíž u těla.', 'V horní pozici se narovnejte bez zbytečného záklonu.', 'Spouštějte kontrolovaně zpět dolů stejnou dráhou.', 'Pokud se vám kulatí záda, snižte váhu nebo rozsah.'] },
  { id: 'back-2', name: 'Pull-ups', equipment: 'Hrazda', primaryMuscles: ['upper-back','lats'], difficulty: 'hard', instructions: ['Chyťte hrazdu nadhmatem nebo shybem a pověste se do plného visu.', 'Začněte pohyb stažením lopatek dolů a dozadu (ne ramena k uším).', 'Táhněte hrudník směrem k hrazdě a lokty veďte dolů k bokům.', 'Nahoře krátce zpevněte záda a držte tělo bez houpání.', 'Pomalu se spusťte zpět do plného visu.', 'Pokud je to těžké, použijte gumu nebo asistovaný stroj.'] },
  { id: 'back-3', name: 'Bent Over Row', equipment: 'Činka', primaryMuscles: ['upper-back'], difficulty: 'medium', instructions: ['Postavte se, uchopte činku a jděte do předklonu (hinge) se rovnými zády.', 'Kolena mírně pokrčte, břicho zpevněte a držte neutrální páteř.', 'Táhněte činku k spodním žebrům / břichu a lokty veďte podél těla.', 'Nahoře stáhněte lopatky k sobě a dolů.', 'Spouštějte činku pomalu a nenechte ramena „vyjet“ dopředu.', 'Nepoužívejte švih – raději snižte váhu.'] },
  { id: 'back-4', name: 'Lat Pulldown', equipment: 'Kladka', primaryMuscles: ['lats'], difficulty: 'medium', instructions: ['Nastavte si sed a opěrku na stehna, aby vás „nezvedalo“ ze sedačky.', 'Chyťte tyč o něco širší než ramena a trup držte vzpřímeně.', 'Začněte stažením lopatek dolů a poté táhněte tyč k horní části hrudníku.', 'Lokty veďte dolů a lehce dozadu, ne dopředu.', 'Pomalu vraťte tyč nahoru do natažení bez trhání.', 'Držte kontrolu a neprohýbejte se v bedrech.'] },
  { id: 'back-5', name: 'Seated Cable Row', equipment: 'Kladka', primaryMuscles: ['middle-back'], difficulty: 'medium', instructions: ['Sedněte si, chodidla opřete o platformu a chyťte rukojeť.', 'Narovnejte záda a zpevněte břicho – žádné hrbení.', 'Táhněte rukojeť k pasu a současně stahujte lopatky k sobě.', 'Nahoře krátce zastavte a držte ramena dole.', 'Pomalým pohybem vraťte rukojeť dopředu do protažení zad.', 'Udržujte stejný úhel trupu po celý pohyb.'] },
];

export default BACK;
