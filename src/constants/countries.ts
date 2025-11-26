// src/data/countries.ts
export interface Country {
  code: string
  dial: string
}

export const countries: Country[] = [
  { code: "fr", dial: "+33" },  // France
  { code: "be", dial: "+32" },  // Belgium
  { code: "ch", dial: "+41" },  // Switzerland
  { code: "ca", dial: "+1" },   // Canada
  { code: "lu", dial: "+352" }, // Luxembourg
  { code: "mc", dial: "+377" }, // Monaco
  { code: "sn", dial: "+221" }, // Senegal
  { code: "ci", dial: "+225" }, // Côte d'Ivoire
  { code: "ma", dial: "+212" }, // Morocco
  { code: "dz", dial: "+213" }, // Algeria
  { code: "tn", dial: "+216" }, // Tunisia
  { code: "ml", dial: "+223" }, // Mali
  { code: "bf", dial: "+226" }, // Burkina Faso
]
