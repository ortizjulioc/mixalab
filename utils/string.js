export function escapeForRegex(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export function normalizeString(s, options = {}) {
  const replacement = options.replacement ?? "-";
  const charmap = options.charmap ?? {};
  const userPreserve = options.preserveChars ?? "";

  // 1) Aplica charmap (sustituye cada carácter según el mapa)
  let result = s.split("").map(char => (charmap[char] ?? char)).join("");

  // 2) Normaliza (separa acentos) y quita diacríticos, luego lowercase
  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // 3) Auto-preserve: añade al conjunto de preservados las claves del charmap
  //    que se mapean a sí mismas y que sean un solo carácter.
  const autoPreserve = Object.entries(charmap)
    .filter(([k, v]) => k.length === 1 && v === k)
    .map(([k]) => k)
    .join("");

  // Combina lo que el usuario pidió preservar + lo detectado automáticamente
  const preserve = Array.from(new Set((userPreserve + autoPreserve).split("")));
  const preserveStr = preserve.join("");

  // 4) Construye la regex que permite a-z0-9 más los caracteres preservados
  const escapedPreserve = escapeForRegex(preserveStr);
  const notAllowedPattern = new RegExp(`[^a-z0-9${escapedPreserve}]+`, "g");

  // Reemplaza todo lo no permitido por el replacement
  result = result.replace(notAllowedPattern, replacement);

  // 5) Colapsa repeticiones del replacement y limpia extremos
  const repEsc = escapeForRegex(replacement);
  result = result.replace(new RegExp(`${repEsc}+`, "g"), replacement)
    .replace(new RegExp(`^${repEsc}|${repEsc}$`, "g"), "");

  return result;
}

export const normalizeFileName = (name) => {
  // Separar el nombre y la extensión
  const lastDot = name.lastIndexOf(".");
  let baseName = lastDot !== -1 ? name.substring(0, lastDot) : name;
  const extension = lastDot !== -1 ? name.substring(lastDot) : "";
  const normalizedBase = normalizeString(baseName, { preserveChars: "_.-" });
  const timestamp = Date.now();
  return `${normalizedBase}-${timestamp}${extension}`;
};
