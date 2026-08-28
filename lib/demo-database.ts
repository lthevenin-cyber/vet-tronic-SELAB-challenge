export type Profile = "Eleveur" | "Veterinaire" | "Proprietaire animaux" | "Professionnel animal" | "Institution" | "Etudiant" | "Visiteur";
export type Species = "Bovins" | "Ovins" | "Caprins" | "Porcins" | "Chiens" | "Chats" | "Chevaux";
export type IdStatus = "identified" | "unidentified" | "visual_only" | "electronic_only" | "mismatch";
export type HealthStatus = "up_to_date" | "check_required" | "unknown";
export type Movement = { date: string; place: string; type: string; ref?: string };
export type DemoAnimal = {
  id: string;
  electronicId?: string;
  visualTag?: string;
  species: Species;
  breed: string;
  sex: "male" | "female";
  birthDate: string;
  ownerId?: string;
  farmId?: string;
  identificationStatus: IdStatus;
  healthStatus: HealthStatus;
  vaccinations: { name: string; date: string; status: string }[];
  treatments: { name: string; date: string; status: string }[];
  movements: Movement[];
  sanitaryChecks: { date: string; result: string; place: string }[];
  stolenStatus?: boolean;
  chipPosition?: { x: number; y: number };
};
export type Owner = { id: string; name: string; phone: string; city: string };
export type Farm = { id: string; name: string; city: string; ownerId: string; registryIds: string[] };

export const profiles: Profile[] = ["Eleveur", "Veterinaire", "Proprietaire animaux", "Professionnel animal", "Institution", "Etudiant", "Visiteur"];
export const speciesList: Species[] = ["Bovins", "Ovins", "Caprins", "Porcins", "Chiens", "Chats", "Chevaux"];
export const speciesImages: Record<Species, string> = {
  Bovins: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80",
  Ovins: "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=1200&q=80",
  Caprins: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80",
  Porcins: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80",
  Chiens: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
  Chats: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80",
  Chevaux: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80"
};

export const owners: Owner[] = [
  ["own_001", "M. Kouassi Yao", "07 ** ** 42 18", "Bouake"], ["own_002", "Mme Aminata Kone", "07 ** ** 45 21", "Abidjan"],
  ["own_003", "M. Koffi N'Guessan", "05 ** ** 14 09", "Daloa"], ["own_004", "Mme Akissi Diarra", "01 ** ** 78 33", "Yamoussoukro"],
  ["own_005", "Moussa Traore", "07 ** ** 91 02", "Korhogo"], ["own_006", "Awa Bamba", "05 ** ** 63 10", "Man"],
  ["own_007", "M. Serge N'Dri", "01 ** ** 27 44", "Abengourou"], ["own_008", "Fatou Cisse", "07 ** ** 32 77", "San Pedro"],
  ["own_009", "Issa Dao", "05 ** ** 83 12", "Bouake"], ["own_010", "Mariam Coulibaly", "01 ** ** 54 66", "Abidjan"],
  ["own_011", "Dr K. Toure", "07 ** ** 20 11", "Abidjan"], ["own_012", "Mme Soro Elise", "05 ** ** 10 84", "Korhogo"],
  ["own_013", "M. Yapi Franck", "01 ** ** 73 28", "Daloa"], ["own_014", "Nadia Koffi", "07 ** ** 29 16", "Bouake"],
  ["own_015", "M. Bakayoko Salif", "05 ** ** 40 25", "Man"]
].map(([id, name, phone, city]) => ({ id, name, phone, city }));

export const farms: Farm[] = [
  { id: "farm_lagunes", name: "Ferme des Lagunes", city: "Bouake", ownerId: "own_001", registryIds: ["384 250 000 018 542", "384 250 000 018 543", "384 250 000 018 544"] },
  { id: "farm_nzi", name: "Ferme N'Zi", city: "Daloa", ownerId: "own_003", registryIds: ["384 250 000 018 442", "384 250 000 018 443", "384 250 000 018 444", "384 250 000 018 445", "384 250 000 018 446"] },
  { id: "farm_nord", name: "Ferme du Nord", city: "Korhogo", ownerId: "own_005", registryIds: ["384 250 000 018 773", "384 250 000 018 774"] },
  { id: "farm_akissi", name: "Ferme Akissi", city: "Yamoussoukro", ownerId: "own_004", registryIds: ["384 250 000 019 754"] },
  { id: "farm_belier", name: "Ferme du Belier", city: "Yamoussoukro", ownerId: "own_009", registryIds: [] },
  { id: "farm_yao", name: "Ferme Yao", city: "Bouake", ownerId: "own_001", registryIds: ["384 250 000 018 701", "384 250 000 018 702"] },
  { id: "farm_traore", name: "Ferme Traore", city: "Korhogo", ownerId: "own_005", registryIds: ["384 250 000 018 601", "384 250 000 018 602", "384 250 000 018 603"] },
  { id: "farm_kouassi", name: "Ferme Kouassi", city: "Bouake", ownerId: "own_001", registryIds: ["384 250 000 018 327", "384 250 000 018 372"] },
  { id: "farm_sud", name: "Ferme du Sud", city: "San Pedro", ownerId: "own_008", registryIds: [] },
  { id: "farm_montagnes", name: "Ferme des Montagnes", city: "Man", ownerId: "own_006", registryIds: [] }
];

const breeds: Record<Species, string[]> = {
  Bovins: ["N'Dama", "Baoule", "Zebu"], Ovins: ["Djallonke", "Sahelien"], Caprins: ["Naine", "Sahelienne"], Porcins: ["Large White", "Local"],
  Chiens: ["Berger allemand", "Labrador"], Chats: ["Europeen", "Tigre"], Chevaux: ["Barbe", "Pur-sang"]
};
const distribution: Species[] = [...Array(15).fill("Bovins"), ...Array(8).fill("Ovins"), ...Array(8).fill("Caprins"), ...Array(6).fill("Chiens"), ...Array(5).fill("Chats"), ...Array(5).fill("Chevaux"), ...Array(3).fill("Porcins")];

function idFor(i: number) { return "384 250 000 " + String(18000 + i).padStart(6, "0").replace(/(\d{3})(\d{3})/, "$1 $2"); }
function makeAnimal(species: Species, index: number): DemoAnimal {
  const owner = owners[index % owners.length];
  const farm = farms[index % farms.length];
  const electronicId = idFor(index + 500);
  const status: IdStatus = index % 13 === 0 ? "unidentified" : index % 11 === 0 ? "mismatch" : index % 7 === 0 ? "visual_only" : index % 5 === 0 ? "electronic_only" : "identified";
  return {
    id: "animal_" + String(index + 1).padStart(3, "0"), electronicId: status === "unidentified" || status === "visual_only" ? undefined : electronicId,
    visualTag: status === "unidentified" || status === "electronic_only" ? undefined : "CI-" + electronicId.slice(-6).replace(" ", ""), species,
    breed: breeds[species][index % breeds[species].length], sex: index % 2 ? "female" : "male", birthDate: `0${(index % 9) + 1}/0${(index % 8) + 1}/202${index % 5}`,
    ownerId: owner.id, farmId: farm.id, identificationStatus: status, healthStatus: index % 6 === 0 ? "check_required" : index % 13 === 0 ? "unknown" : "up_to_date",
    vaccinations: [{ name: "Vaccination fictive A", date: "10/01/2026", status: index % 6 === 0 ? "rappel a verifier" : "enregistre" }],
    treatments: [{ name: "Antiparasitaire", date: "18/05/2026", status: "enregistre" }],
    movements: [{ date: "18/08/2026", place: farm.name, type: "exploitation" }, { date: "20/08/2026", place: "Marche B", type: "marche" }, { date: "21/08/2026", place: "Camion TR-331", type: "transport", ref: "TR-331" }],
    sanitaryChecks: [{ date: "15/07/2026", result: index % 6 === 0 ? "controle documentaire incomplet" : "suivi a jour", place: farm.city }],
    stolenStatus: [442, 444, 445, 446].some((n) => electronicId.endsWith(String(n))), chipPosition: { x: 34 + (index * 7) % 40, y: 28 + (index * 9) % 36 }
  };
}
export const demoAnimals: DemoAnimal[] = distribution.map(makeAnimal);

export const featuredAnimals: Record<string, DemoAnimal> = {
  scannerIdentified: { ...makeAnimal("Bovins", 1), electronicId: "384 250 000 018 542", visualTag: "CI-ABJ-018542", breed: "N'Dama", sex: "female", birthDate: "12/02/2024", ownerId: "own_001", farmId: "farm_lagunes", identificationStatus: "identified", healthStatus: "up_to_date", chipPosition: { x: 58, y: 42 } },
  scannerUnidentified: { ...makeAnimal("Caprins", 2), electronicId: undefined, visualTag: "illisible", ownerId: undefined, farmId: undefined, identificationStatus: "unidentified", healthStatus: "unknown", chipPosition: undefined },
  lostDog: { ...makeAnimal("Chiens", 16), electronicId: "384 250 000 020 145", visualTag: undefined, breed: "Berger allemand", sex: "male", ownerId: "own_002", farmId: undefined, identificationStatus: "identified", healthStatus: "up_to_date", chipPosition: { x: 49, y: 36 } },
  epidemicSource: { ...makeAnimal("Bovins", 20), electronicId: "384 250 000 019 754", visualTag: "CI-BKE-019754", ownerId: "own_004", farmId: "farm_akissi", identificationStatus: "identified", healthStatus: "check_required", chipPosition: { x: 45, y: 40 } },
  vetDogA: { ...makeAnimal("Chiens", 21), electronicId: "384 250 000 022 718", breed: "Berger allemand", sex: "male", ownerId: "own_010" },
  vetDogB: { ...makeAnimal("Chiens", 22), electronicId: "384 250 000 022 781", breed: "Berger allemand", sex: "male", ownerId: "own_004" },
  patientAnimal: { ...makeAnimal("Bovins", 23), electronicId: "384 250 000 018 773", visualTag: "CI-018773", ownerId: "own_005", farmId: "farm_nord", identificationStatus: "identified", healthStatus: "check_required" }
};

export function ownerOf(a: DemoAnimal) { return owners.find((o) => o.id === a.ownerId); }
export function farmOf(a: DemoAnimal) { return farms.find((f) => f.id === a.farmId); }
