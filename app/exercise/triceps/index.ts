// Jazyk: TypeScript (TS)
// Popis: Zdrojový soubor projektu.

// Data: seznam cviků pro partii „triceps“.

import { Exercise } from '@/src/data/types';

const TRICEPS: Exercise[] = [{ id: 'triceps-1', name: 'Skull Crushers', equipment: 'Činka', primaryMuscles: ['triceps'], difficulty: 'medium', instructions: ['Lehněte si na lavičku a činku držte nad hrudníkem.', 'Lokty držte nad rameny a zpevněte lopatky.', 'Spouštějte činku směrem k čelu (nebo lehce za hlavu) pouze ohybem v loktech.', 'Nenechte lokty utíkat do stran.', 'S výdechem narovnejte paže zpět do startu.', 'Použijte kontrolované tempo a nepřetěžujte lokty.'] },
  { id: 'triceps-2', name: 'Close-grip Bench Press', equipment: 'Činka, lavice', primaryMuscles: ['triceps','chest'], difficulty: 'medium', instructions: ['Lehněte si na lavičku, lopatky stáhněte k sobě a chodidla na zem.', 'Uchopte osu užším úchopem (cca na šířku ramen).', 'Spusťte činku na střed hrudníku s lokty blíž k tělu.', 'S výdechem vytlačte činku nahoru bez zamykání ramen.', 'Držte zápěstí rovně a neodrážejte činku od hrudníku.', 'Začněte lehčí váhou, technika je důležitější.'] },
  { id: 'triceps-3', name: 'Triceps Pushdown', equipment: 'Kladka', primaryMuscles: ['triceps'], difficulty: 'easy', instructions: ['Nastavte kladku nahoře a chyťte tyč nebo lano.', 'Postavte se stabilně, lokty držte u těla a ramena dole.', 'S výdechem tlačte dolů do propnutí loktů.', 'Nahoře nehýbejte rameny – pracuje pouze loket.', 'Pomalu vraťte zpět nahoru do ohybu, ale neztrácejte kontrolu.', 'V horní pozici neodpočívejte – držte napětí.'] },
  { id: 'triceps-4', name: 'Overhead Triceps Extension', equipment: 'Jednoručka', primaryMuscles: ['triceps'], difficulty: 'medium', instructions: ['Postavte se nebo si sedněte, jednoručku držte oběma rukama nad hlavou.', 'Zpevněte břicho a držte žebra dole.', 'Spouštějte jednoručku za hlavu pouze ohybem v loktech.', 'Lokty držte co nejvíc u sebe a neměňte pozici ramen.', 'S výdechem vytlačte zpět nahoru do propnutí.', 'Použijte kontrolované tempo a nepřehánějte rozsah.'] },
  { id: 'triceps-5', name: 'Dips (Triceps variant)', equipment: 'Paralelní bradla', primaryMuscles: ['triceps'], difficulty: 'medium', instructions: ['Chyťte bradla a zvedněte se do opory s trupem více vzpřímeně.', 'Lokty veďte blízko těla a ramena držte dole.', 'Spouštějte se dolů kontrolovaně do pohodlné hloubky.', 'Zastavte dřív, pokud cítíte tlak v přední části ramene.', 'Vytlačte se zpět nahoru s výdechem do propnutí.', 'Udržujte stabilní trup bez kymácení.'] },
  { id: 'triceps-6', name: 'Triceps Builder 6', equipment: 'Stroj', primaryMuscles: ['triceps'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici stroje.', 'Provádějte kontrolovaný pohyb v plném rozsahu.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'triceps-7', name: 'Triceps Focus 7', equipment: 'Jednoručky', primaryMuscles: ['triceps'], difficulty: 'medium', instructions: ['Zvolte přiměřenou zátěž pro čistý pohyb.', 'Proveďte koncentrickou fázi s výdechem.', 'Excentrickou fázi zpomalte na 2 až 3 sekundy.', 'Po celou dobu držte techniku bez kompenzací.'] },
  { id: 'triceps-8', name: 'Triceps Builder 8', equipment: 'Stroj', primaryMuscles: ['triceps'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'triceps-9', name: 'Triceps Builder 9', equipment: 'Jednoručky', primaryMuscles: ['triceps'], difficulty: 'medium', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
];

export default TRICEPS;


