class Utils {
  static formatDate(date) {
    return date.toLocaleString(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short"
      }
    );
  }
}
