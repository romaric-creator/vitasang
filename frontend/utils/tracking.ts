export const getStatusUI = (s: string) => {
  switch (s) {
    case "accepte":
      return { color: "#10B981", label: "Accepté" };
    case "don_effectue":
      return { color: "#3B82F6", label: "Effectué" };
    case "en_cours":
      return { color: "#F59E0B", label: "En cours" };
    default:
      return { color: "#94A3B8", label: s };
  }
};
