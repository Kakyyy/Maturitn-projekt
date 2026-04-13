// Jazyk: TypeScript (TS)
// Popis: Zdrojový soubor projektu.

// Data: seznam cviků pro partii „hrudník“.

import { Exercise } from '@/src/data/types';

const CHEST: Exercise[] = [{ id: 'chest-1', name: 'Bench Press', equipment: 'Činka, lavice', primaryMuscles: ['chest'], difficulty: 'medium', instructions: ['Lehněte si na lavičku, chodidla pevně na zemi a lopatky stáhněte k sobě.', 'Uchopte osu o něco širší než ramena a držte zápěstí rovně.', 'S nádechem spusťte činku kontrolovaně na střed hrudníku.', 'S výdechem vytlačte činku nahoru a držte lokty pod osou.', 'Neodrážejte činku od hrudníku a neprohýbejte se zbytečně v bedrech.', 'Vždy ukládejte činku bezpečně do stojanu.'] },
  { id: 'chest-2', name: 'Incline Dumbbell Press', equipment: 'Jednoručky, lavice', primaryMuscles: ['chest'], difficulty: 'medium', instructions: ['Nastavte šikmou lavici (cca 30–45°) a opřete záda i hlavu.', 'Zvedněte jednoručky do úrovně ramen, lokty mírně pod úrovní ramen.', 'S výdechem tlačte jednoručky nahoru a lehce k sobě (bez tvrdého „klepnutí“).', 'Kontrolovaně spouštějte zpět dolů do protažení hrudníku.', 'Držte lopatky stažené a ramena dole po celou dobu.', 'Neprohýbejte se a nepoužívejte švih.'] },
  { id: 'chest-3', name: 'Push-ups', equipment: 'Vlastní váha', primaryMuscles: ['chest'], difficulty: 'easy', instructions: ['Dejte dlaně pod ramena (nebo trochu širší) a zaujměte pozici prkna.', 'Zpevněte břicho a hýždě, tělo držte v jedné linii.', 'Spouštějte se dolů, lokty veďte šikmo dozadu (cca 30–60° od trupu).', 'Dostaňte hrudník blízko k zemi bez prohnutí v bedrech.', 'Vytlačte se zpět nahoru s výdechem do plného propnutí.', 'Pro lehčí variantu dejte ruce výš (o lavičku/stůl).'] },
  { id: 'chest-4', name: 'Cable Flyes', equipment: 'Kladka', primaryMuscles: ['chest'], difficulty: 'easy', instructions: ['Nastavte kladky zhruba do výšky ramen a chyťte madla.', 'Postavte se do mírného kroku a lehce se předkloňte.', 'Lokty držte mírně pokrčené a ramena dole.', 'Přitáhněte ruce před tělo a spojte je před hrudníkem.', 'Krátce zatněte hrudník a pomalu vraťte ruce zpět do protažení.', 'Nevytáčejte ramena dopředu – držte lopatky stabilně.'] },
  { id: 'chest-5', name: 'Dips', equipment: 'Paralelní bradla', primaryMuscles: ['chest', 'triceps'], difficulty: 'medium', instructions: ['Chyťte bradla a zvedněte se do opory s propnutými pažemi.', 'Pro variantu na hrudník se lehce předkloňte a lokty veďte šikmo ven.', 'Spouštějte se dolů kontrolovaně, dokud jsou paže zhruba rovnoběžně se zemí.', 'Zastavte dřív, pokud cítíte nepříjemný tlak v ramenou.', 'Vytlačte se zpět nahoru s výdechem bez trhání.', 'Udržujte lopatky dole a krk dlouhý.'] },
  { id: 'chest-6', name: 'Incline Barbell Press', equipment: 'Činka, šikmá lavice', primaryMuscles: ['chest'], difficulty: 'medium', instructions: ['Nastavte lavici na sklon 30 až 45 stupňů.', 'Spusťte osu kontrolovaně na horní část hrudníku.', 'Vytlačte činku nahoru bez švihu.', 'Držte lopatky stažené a nohy pevně na zemi.'] },
  { id: 'chest-7', name: 'Decline Bench Press', equipment: 'Činka, negativní lavice', primaryMuscles: ['chest'], difficulty: 'medium', instructions: ['Bezpečně fixujte nohy na lavici.', 'Spouštějte osu k dolní části hrudníku.', 'Tlačte plynule do propnutí paží.', 'Nepřetěžujte ramena ani zápěstí.'] },
  { id: 'chest-8', name: 'Machine Chest Press', equipment: 'Stroj', primaryMuscles: ['chest'], difficulty: 'easy', instructions: ['Nastavte sedadlo tak, aby madla byla v úrovni středu hrudníku.', 'Tlačte madla vpřed s výdechem.', 'Vracejte pomalu do výchozí polohy.', 'Neodlepujte záda od opěrky.'] },
  { id: 'chest-9', name: 'Dumbbell Fly', equipment: 'Jednoručky, lavice', primaryMuscles: ['chest'], difficulty: 'easy', instructions: ['Lehněte si na lavičku s jednoručkami nad hrudníkem.', 'S mírně pokrčenými lokty spouštějte paže do stran.', 'V dolní pozici cítíte protažení hrudníku.', 'Vraťte činky zpět obloukem nad hrudník.'] },
];

export default CHEST;


