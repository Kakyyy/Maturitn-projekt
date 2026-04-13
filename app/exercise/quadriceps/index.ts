// Jazyk: TypeScript (TS)
// Popis: Zdrojový soubor projektu.

// Data: seznam cviků pro partii „kvadriceps“ (přední stehno).

import { Exercise } from '@/src/data/types';

const QUADRICEPS: Exercise[] = [{ id: 'quadriceps-1', name: 'Squat', equipment: 'Činka', primaryMuscles: ['quadriceps'], difficulty: 'medium', instructions: ['Postavte se na šířku ramen a zpevněte střed těla.', 'Nadechněte se do břicha a jděte dolů – kolena ve směru špiček.', 'Udržujte hrudník nahoře a záda v neutrální pozici.', 'Klesejte do hloubky, kterou zvládnete bez ztráty techniky.', 'Z dolní pozice se zvedejte tlakem přes celá chodidla.', 'Nehoupejte se a neklaďte paty od země.'] },
  { id: 'quadriceps-2', name: 'Leg Press', equipment: 'Stroj', primaryMuscles: ['quadriceps'], difficulty: 'medium', instructions: ['Nastavte sed tak, aby spodní pozice byla pohodlná a bezpečná.', 'Chodidla položte na platformu (cca na šířku ramen).', 'Odemkněte bezpečnostní zarážky a spusťte platformu dolů kontrolovaně.', 'Klesejte, dokud nepřestáváte držet pánev a bedra stabilní.', 'Vytlačte platformu nahoru bez zamykání kolen.', 'Udržujte plynulé tempo a neodrážejte se ze spodní pozice.'] },
  { id: 'quadriceps-3', name: 'Lunges', equipment: 'Vlastní váha/Jednoručky', primaryMuscles: ['quadriceps'], difficulty: 'easy', instructions: ['Postavte se rovně a zpevněte břicho.', 'Udělejte krok vpřed a spouštějte se dolů do výpadu.', 'Zadní koleno směřuje k zemi, přední koleno držte ve směru špičky.', 'Přední patu držte na zemi a tlakem přes ni se vraťte zpět nahoru.', 'Opakujte na stejnou nohu nebo střídejte strany.', 'Držte rovnováhu a nepadávejte dopředu.'] },
  { id: 'quadriceps-4', name: 'Leg Extension', equipment: 'Stroj', primaryMuscles: ['quadriceps'], difficulty: 'easy', instructions: ['Nastavte sed tak, aby osa stroje byla v úrovni kolen.', 'Opěrku dejte nad nárt a chyťte se madel.', 'Zpevněte trup a plynule natahujte kolena do zvednutí.', 'Nahoře krátce zatněte kvadricepsy.', 'Pomalu spouštějte dolů do natažení bez „padnutí“.', 'Držte kontrolu a nepřetěžujte kloub v horní pozici.'] },
  { id: 'quadriceps-5', name: 'Bulgarian Split Squat', equipment: 'Jednoručky', primaryMuscles: ['quadriceps','gluteal'], difficulty: 'hard', instructions: ['Postavte se před lavičku, zadní nárt opřete o lavičku.', 'Pro více kvadricepsů držte trup o něco vzpřímenější.', 'Klesejte dolů kontrolovaně, přední koleno směřuje ve směru špičky.', 'Udržujte stabilní pánev a nevybočujte kolenem dovnitř.', 'Vytlačte se nahoru tlakem přes celou plosku přední nohy.', 'Začněte bez velké zátěže a přidávejte postupně.'] },
  { id: 'quadriceps-6', name: 'Quadriceps Builder 6', equipment: 'Stroj', primaryMuscles: ['quadriceps'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici stroje.', 'Provádějte kontrolovaný pohyb v plném rozsahu.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'quadriceps-7', name: 'Quadriceps Focus 7', equipment: 'Jednoručky', primaryMuscles: ['quadriceps'], difficulty: 'medium', instructions: ['Zvolte přiměřenou zátěž pro čistý pohyb.', 'Proveďte koncentrickou fázi s výdechem.', 'Excentrickou fázi zpomalte na 2 až 3 sekundy.', 'Po celou dobu držte techniku bez kompenzací.'] },
  { id: 'quadriceps-8', name: 'Quadriceps Builder 8', equipment: 'Stroj', primaryMuscles: ['quadriceps'], difficulty: 'easy', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
  { id: 'quadriceps-9', name: 'Quadriceps Builder 9', equipment: 'Jednoručky', primaryMuscles: ['quadriceps'], difficulty: 'medium', instructions: ['Nastavte výchozí pozici.', 'Provádějte kontrolovaný pohyb.', 'Vracejte se pomalu bez trhání.', 'Držte stabilní trup a plynulý dech.'] },
];

export default QUADRICEPS;


