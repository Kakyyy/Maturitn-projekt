# Dokumentace maturitního projektu – PowerGainz

Tato složka obsahuje písemnou dokumentaci maturitního projektu.

## Obsah složky

| Soubor | Popis |
|--------|-------|
| `PowerGainz-dokumentace.docx` | Písemná práce maturitního projektu (30+ stran) |

## Jak nahrát Word dokument do repozitáře

### Možnost 1 – přes GitHub web (nejjednodušší)

1. Otevři repozitář na [github.com](https://github.com/Kakyyy/Maturitn-projekt)
2. Přejdi do složky `docs/`
3. Klikni na tlačítko **„Add file"** → **„Upload files"**
4. Přetáhni nebo vyber svůj `.docx` soubor
5. Dole napiš commit zprávu, např. `docs: přidána písemná práce`
6. Klikni na **„Commit changes"**

### Možnost 2 – přes Git příkazový řádek

```bash
# 1. Zkopíruj svůj Word soubor do složky docs/
cp cesta/k/tvemu/souboru.docx docs/PowerGainz-dokumentace.docx

# 2. Přidej soubor do gitu
git add docs/PowerGainz-dokumentace.docx

# 3. Vytvoř commit
git commit -m "docs: přidána písemná práce maturitního projektu"

# 4. Nahraj na GitHub
git push
```

## Poznámka k velikosti souboru

GitHub podporuje soubory do **100 MB** bez dalšího nastavení.  
Pokud je tvůj Word dokument větší než 100 MB, použij [Git LFS](https://git-lfs.github.com/).  
Běžná písemná práce (30–50 stran, bez velkých obrázků) je obvykle do 10 MB, takže žádný problém.
