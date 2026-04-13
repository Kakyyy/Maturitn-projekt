// Jazyk: JavaScript (JS)
// Popis: Zdrojovy soubor projektu.

module.exports = {
  getTransformModulePath() {
    return require.resolve("react-native-typescript-transformer");
  },
  getSourceExts() {
    return ["ts", "tsx"];
  }
};

