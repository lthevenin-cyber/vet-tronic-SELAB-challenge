"use client";

import { useEffect, useMemo, useState, type ReactNode, type SyntheticEvent } from "react";
import { demoAnimals, farms, featuredAnimals, farmOf, ownerOf, owners, profiles, speciesImages, speciesList, type DemoAnimal, type Profile, type Species } from "../lib/demo-database";

type Screen = "home" | "form" | "intro" | "game" | "reward" | "admin";
type Tab = "dashboard" | "leads" | "games" | "lots" | "data";
type Gift = { id: string; name: string; stock: number; threshold: number; active: boolean };
type Lead = { id: string; first: string; last: string; phone: string; city: string; profile: Profile; animals: Species[]; identification: string; onsite: boolean; game: string; concreteResult: string; score: number; percentage: number; durationSeconds: number; gift: string; metadata: Record<string, unknown>; createdAt: string; sync: "Synchronise" | "En attente" };
type FormState = { first: string; last: string; phone: string; city: string; profile: Profile; animals: Species[]; identification: string; onsite: boolean };
type GameId = "scanner" | "theft" | "patient" | "veterinary" | "epidemic";
type Step = { id: string; label: string; detail: string; points: number; view: "rfid" | "identity" | "health" | "movement" | "registry" | "compare" | "network"; animal?: DemoAnimal; wrong?: boolean };

type Scenario = { id: GameId; adminTitle: string; intro: string; mission: string; profiles: Profile[]; species: Species[]; result: string; lesson: string; withId: string[]; withoutId: string[]; steps: Step[] };

const baseGifts: Gift[] = [
  { id: "pen", name: "Stylo Vet'Tronic", stock: 200, threshold: 45, active: true },
  { id: "cap", name: "Casquette Vet'Tronic", stock: 100, threshold: 65, active: true },
  { id: "shirt", name: "T-shirt Vet'Tronic", stock: 50, threshold: 80, active: true },
  { id: "premium", name: "Lot premium", stock: 20, threshold: 95, active: true }
];
const emptyForm: FormState = { first: "", last: "", phone: "", city: "", profile: "Eleveur", animals: [], identification: "Je ne sais pas", onsite: false };
const scenarios: Scenario[] = [
  {
    id: "scanner", adminTitle: "Scanner Vet'Tronic", profiles, species: ["Bovins", "Caprins"],
    intro: "Un animal arrive au controle. Le lecteur RFID doit ouvrir un vrai dossier, puis le joueur doit verifier si les donnees sont suffisantes pour un deplacement.",
    mission: "Scannez, ouvrez le dossier, consultez identite, sanitaire et mouvements, puis prenez une decision justifiee.",
    result: "Dossier exploitable confirme pour 384 250 000 018 542", lesson: "Scanner ne sert pas seulement a trouver un numero : il ouvre l'identite, le proprietaire, l'exploitation, les controles et les mouvements.",
    withId: ["identite electronique lue", "proprietaire retrouve", "exploitation retrouvee", "controle sanitaire consulte"],
    withoutId: ["boucle illisible", "proprietaire non verifiable", "historique absent", "decision moins fiable"],
    steps: [
      { id: "scan", label: "Deplacer le scanner sur la puce", detail: "BIP. Signal fort sur la zone active. ID lu : 384 250 000 018 542.", points: 18, view: "rfid", animal: featuredAnimals.scannerIdentified },
      { id: "open", label: "Ouvrir le dossier animal", detail: "Le dossier rattache le numero au bovin N'Dama et a son exploitation.", points: 18, view: "identity", animal: featuredAnimals.scannerIdentified },
      { id: "health", label: "Verifier sanitaire et dernier controle", detail: "Vaccination fictive A enregistree, dernier controle du 15/07/2026 : suivi a jour.", points: 18, view: "health", animal: featuredAnimals.scannerIdentified },
      { id: "moves", label: "Controler les mouvements", detail: "Les mouvements recents sont documentes et rattaches a l'identifiant electronique.", points: 18, view: "movement", animal: featuredAnimals.scannerIdentified },
      { id: "compare", label: "Comparer avec une chevre non identifiee", detail: "La chevre a une boucle illisible et aucun identifiant electronique detecte.", points: 18, view: "compare", animal: featuredAnimals.scannerUnidentified },
      { id: "bad", label: "Declarer l'animal pret sans ouvrir le dossier", detail: "Ce n'est pas suffisant : le numero doit servir a verifier les informations enregistrees.", points: -10, view: "identity", animal: featuredAnimals.scannerIdentified, wrong: true }
    ]
  },
  {
    id: "theft", adminTitle: "Alerte betail", profiles: ["Eleveur", "Institution", "Professionnel animal", "Veterinaire"], species: ["Bovins"],
    intro: "Dossier vol V-2026-0041 : cinq bovins de la Ferme N'Zi ont ete declares voles le 28/08/2026 a 06:45.",
    mission: "Ouvrez le dossier, comparez les numeros proches, scannez les animaux suspects et signalez seulement les correspondances confirmees.",
    result: "4 animaux sur 5 retrouves avec preuve d'identification", lesson: "L'identification ne garantit pas qu'un animal vole sera retrouve, mais elle donne un element unique pour verifier son identite lors d'un controle.",
    withId: ["018442 au Marche A", "018444 dans le camion TR-214", "018445 au Marche B", "incoherence 018443 detectee"],
    withoutId: ["bovins visuellement similaires", "numeros proches confondus", "signalements incertains", "propriete difficile a verifier"],
    steps: [
      { id: "file", label: "Ouvrir le dossier vol V-2026-0041", detail: "Animaux recherches : 018442, 018443, 018444, 018445, 018446. Proprietaire : M. Koffi N'Guessan.", points: 15, view: "registry", animal: featuredAnimals.epidemicSource },
      { id: "marketA", label: "Scanner l'animal CI-018442 au Marche A", detail: "Scan : 384 250 000 018 442. Statut base : declare vole. Signalement justifie.", points: 20, view: "rfid", animal: { ...featuredAnimals.epidemicSource, electronicId: "384 250 000 018 442", visualTag: "CI-018442", stolenStatus: true } },
      { id: "mismatch", label: "Detecter l'incoherence CI-018443 / 018493", detail: "Boucle : CI-018443. Scan : 384 250 000 018 493. Controle necessaire, pas accusation automatique.", points: 15, view: "compare", animal: { ...featuredAnimals.epidemicSource, electronicId: "384 250 000 018 493", visualTag: "CI-018443", identificationStatus: "mismatch" } },
      { id: "truck", label: "Verifier le camion TR-214", detail: "Le registre du camion contient 018444. Correspondance electronique confirmee.", points: 20, view: "movement", animal: { ...featuredAnimals.epidemicSource, electronicId: "384 250 000 018 444", stolenStatus: true } },
      { id: "wrong", label: "Signaler 384 250 000 018 455", detail: "Mauvaise piste : ce numero ne correspond a aucun animal du dossier vol.", points: -8, view: "rfid", wrong: true, animal: { ...featuredAnimals.epidemicSource, electronicId: "384 250 000 018 455" } }
    ]
  },
  {
    id: "patient", adminTitle: "Patient zero", profiles: ["Veterinaire", "Institution", "Eleveur", "Professionnel animal"], species: ["Bovins"],
    intro: "Enquete sanitaire fictive PS-08-026 : une origine animale est suspectee apres un repas. Aucun diagnostic medical n'est pose.",
    mission: "Remontez du lot au fournisseur, puis a l'abattoir, a l'exploitation, a l'animal et aux contacts potentiels.",
    result: "Lot relie a l'animal 384 250 000 018 773 et 17 contacts potentiels", lesson: "La tracabilite facilite une enquete sanitaire en reliant lot, animal, exploitation, mouvements, controles et contacts a verifier.",
    withId: ["lot LOT-BOV-240826-B", "animal 018773", "Ferme du Nord", "camion TR-331", "17 contacts potentiels"],
    withoutId: ["quel animal ?", "quelle exploitation ?", "quel transport ?", "quels contacts ?"],
    steps: [
      { id: "patient", label: "Selectionner les indices utiles", detail: "Restaurant Chez Akissi, date 24/08/2026, produit viande bovine, lot LOT-BOV-240826-B.", points: 15, view: "registry", animal: featuredAnimals.patientAnimal },
      { id: "lot", label: "Ouvrir le lot fournisseur", detail: "Animaux associes : 018771, 018772, 018773. Le 018773 a un controle documentaire incomplet.", points: 20, view: "compare", animal: featuredAnimals.patientAnimal },
      { id: "animal", label: "Scanner l'animal 018773", detail: "ID confirme : 384 250 000 018 773. Proprietaire Moussa Traore, Ferme du Nord.", points: 20, view: "identity", animal: featuredAnimals.patientAnimal },
      { id: "health", label: "Signaler la donnee sanitaire manquante", detail: "Vaccination fictive B : absence d'information. Donnee a verifier, pas cause medicale certaine.", points: 20, view: "health", animal: featuredAnimals.patientAnimal },
      { id: "contacts", label: "Reconstituer les 17 contacts directs", detail: "Marche B : 12 du meme parc. Transport TR-331 : 6 animaux. Contacts retenus : 17.", points: 25, view: "network", animal: featuredAnimals.patientAnimal },
      { id: "bad", label: "Dire que l'animal est la cause medicale", detail: "Formulation interdite : le jeu parle de piste et d'anomalie a verifier.", points: -12, view: "health", animal: featuredAnimals.patientAnimal, wrong: true }
    ]
  },
  {
    id: "veterinary", adminTitle: "Mission veterinaire", profiles: ["Veterinaire", "Etudiant"], species: ["Chiens", "Bovins", "Chevaux"],
    intro: "Deux chiens Berger allemand males de 4 ans se ressemblent. Le veterinaire doit vacciner l'animal 384 250 000 022 781.",
    mission: "Scannez les deux chiens, comparez les numeros proches, ouvrez le bon dossier et enregistrez l'acte fictif.",
    result: "Acte enregistre sur le bon dossier : 384 250 000 022 781", lesson: "Un identifiant unique evite de mettre a jour le mauvais dossier medical quand deux animaux se ressemblent.",
    withId: ["chien B confirme", "dossier Mme Diarra ouvert", "rappel 12/09/2026 verifie", "acte fictif enregistre"],
    withoutId: ["deux chiens similaires", "risque de mauvais dossier", "historique mal attribue"],
    steps: [
      { id: "scanA", label: "Scanner chien A", detail: "Chien A : 384 250 000 022 718. Numero proche, mais ce n'est pas l'animal demande.", points: 12, view: "rfid", animal: featuredAnimals.vetDogA },
      { id: "scanB", label: "Scanner chien B", detail: "Chien B : 384 250 000 022 781. Correspondance exacte avec la mission.", points: 22, view: "rfid", animal: featuredAnimals.vetDogB },
      { id: "dossier", label: "Ouvrir dossier B", detail: "Proprietaire Mme Diarra, poids 31,2 kg, vaccin precedent 12/09/2025, rappel 12/09/2026.", points: 22, view: "identity", animal: featuredAnimals.vetDogB },
      { id: "health", label: "Verifier historique vaccinal", detail: "Le dossier B contient le bon historique. Le joueur evite de modifier le dossier A.", points: 20, view: "health", animal: featuredAnimals.vetDogB },
      { id: "act", label: "Enregistrer l'acte fictif du 28/08/2026", detail: "Nouvelle entree : acte veterinaire fictif enregistre sur le dossier B.", points: 24, view: "health", animal: featuredAnimals.vetDogB },
      { id: "bad", label: "Choisir le dossier A", detail: "Attention : le mauvais dossier aurait ete mis a jour.", points: -12, view: "identity", animal: featuredAnimals.vetDogA, wrong: true }
    ]
  },
  {
    id: "epidemic", adminTitle: "Stop a l'epidemie", profiles: ["Eleveur", "Veterinaire", "Institution", "Professionnel animal"], species: ["Bovins", "Porcins"],
    intro: "Alerte sanitaire fictive : l'animal 384 250 000 019 754 a ete signale. Il faut reduire le perimetre d'enquete.",
    mission: "Ouvrez les lieux relies au parcours, consultez registres marche et transport, puis ciblez les contacts a controler.",
    result: "18 contacts cibles sur 247 animaux potentiellement concernes", lesson: "La tracabilite permet de passer d'un perimetre large a une liste precise d'animaux a controler.",
    withId: ["Ferme N'Zi", "TR-042", "Marche de Bouake", "TR-118", "Ferme Akissi", "18 contacts directs"],
    withoutId: ["247 animaux a verifier", "parcours incertain", "contacts difficiles a prioriser"],
    steps: [
      { id: "source", label: "Ouvrir la fiche 019754", detail: "Origine Ferme N'Zi. Dernier controle 12/08/2026. Historique exploitable.", points: 18, view: "identity", animal: featuredAnimals.epidemicSource },
      { id: "move1", label: "Verifier TR-042 puis Marche de Bouake", detail: "04/08 Ferme N'Zi, 08/08 Transport TR-042, 08/08 Marche de Bouake.", points: 20, view: "movement", animal: featuredAnimals.epidemicSource },
      { id: "park", label: "Isoler le parc partage au marche", detail: "28 bovins au marche, mais seulement 11 ont partage le meme parc.", points: 20, view: "network", animal: featuredAnimals.epidemicSource },
      { id: "truck", label: "Identifier les animaux du camion TR-118", detail: "Le registre TR-118 contient 6 animaux ayant voyage ensemble.", points: 20, view: "registry", animal: featuredAnimals.epidemicSource },
      { id: "reduce", label: "Calculer le perimetre final", detail: "247 -> 209 -> 93 -> 31 -> 18 contacts directs.", points: 22, view: "compare", animal: featuredAnimals.epidemicSource },
      { id: "bad", label: "Ouvrir Ferme C sans passage enregistre", detail: "Aucun passage enregistre ici. Mauvaise piste sans lourde penalite.", points: -6, view: "registry", animal: featuredAnimals.epidemicSource, wrong: true }
    ]
  }
];

function storage<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function imageFallback(e: SyntheticEvent<HTMLImageElement>) { const alt = e.currentTarget.alt || "Animal"; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 520'><rect width='800' height='520' fill='#ecf7ef'/><circle cx='400' cy='210' r='105' fill='#66bb89'/><text x='400' y='390' text-anchor='middle' font-size='44' font-family='Arial' font-weight='700' fill='#0f766e'>${alt}</text></svg>`); }
function ownerName(a?: DemoAnimal) { return a ? ownerOf(a)?.name || "Non verifie" : "Non verifie"; }
function farmName(a?: DemoAnimal) { return a ? farmOf(a)?.name || "Non verifiable" : "Non verifiable"; }
function hash(text: string) { return text.split("").reduce((n, c) => n + c.charCodeAt(0), 0); }

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [gameId, setGameId] = useState<GameId>("scanner");
  const [startedAt, setStartedAt] = useState(Date.now());
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Step | null>(null);
  const [feedback, setFeedback] = useState("Pret");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [gifts, setGifts] = useState<Gift[]>(baseGifts);
  const [activeGames, setActiveGames] = useState<GameId[]>(scenarios.map((s) => s.id));

  useEffect(() => {
    setLeads(storage("vettronic-leads-v2", [] as Lead[]));
    setGifts(storage("vettronic-gifts", baseGifts));
    setActiveGames(storage("vettronic-games-v2", scenarios.map((s) => s.id)));
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const scenario = useMemo(() => scenarios.find((s) => s.id === gameId) || scenarios[0], [gameId]);
  const wins = leads.filter((l) => l.gift !== "Participation").length;
  const avg = leads.length ? Math.round(leads.reduce((n, l) => n + l.percentage, 0) / leads.length) : 0;

  function chooseScenario() {
    const priority: GameId[] = form.profile === "Veterinaire" ? ["veterinary", "patient", "epidemic", "scanner", "theft"] : form.profile === "Institution" ? ["patient", "epidemic", "theft", "scanner", "veterinary"] : form.profile === "Eleveur" ? ["theft", "scanner", "epidemic", "patient", "veterinary"] : form.profile === "Etudiant" ? ["veterinary", "scanner", "patient", "epidemic", "theft"] : ["scanner", "veterinary", "patient", "epidemic", "theft"];
    const candidates = priority.filter((id) => activeGames.includes(id) && scenarios.find((s) => s.id === id)?.profiles.includes(form.profile));
    const animalBoost = form.animals.includes("Bovins") ? candidates.find((id) => ["theft", "epidemic", "patient"].includes(id)) : form.animals.includes("Chiens") ? candidates.find((id) => id === "veterinary") : undefined;
    return animalBoost || candidates[hash(form.first + form.phone) % Math.max(candidates.length, 1)] || "scanner";
  }

  function prepareGame() { setGameId(chooseScenario()); setSelected([]); setDetail(null); setFeedback("Pret"); setScreen("intro"); }
  function startGame() { setStartedAt(Date.now()); setFeedback("Choisissez une action utile pour avancer dans l'enquete."); setScreen("game"); }
  function persistGifts(next: Gift[]) { setGifts(next); localStorage.setItem("vettronic-gifts", JSON.stringify(next)); }
  function persistGames(next: GameId[]) { setActiveGames(next); localStorage.setItem("vettronic-games-v2", JSON.stringify(next)); }

  function playStep(s: Step) {
    if (selected.includes(s.id)) return;
    navigator.vibrate?.(s.wrong ? 10 : 25);
    setSelected([...selected, s.id]);
    setDetail(s);
    setFeedback(s.wrong ? "Verifiez l'identification" : s.points >= 20 ? "Identification confirmee" : "Bonne piste");
  }

  function chooseGift(percentage: number) {
    const gift = [...gifts].filter((g) => g.active && g.stock > 0 && percentage >= g.threshold).sort((a, b) => b.threshold - a.threshold)[0];
    if (!gift) return { gift: "Participation", nextGifts: gifts };
    return { gift: gift.name, nextGifts: gifts.map((g) => g.id === gift.id ? { ...g, stock: Math.max(0, g.stock - 1) } : g) };
  }

  function finishGame() {
    const done = scenario.steps.filter((s) => selected.includes(s.id));
    const score = Math.max(0, Math.min(100, done.reduce((n, s) => n + s.points, 0)));
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const giftResult = chooseGift(score);
    persistGifts(giftResult.nextGifts);
    const lead: Lead = { id: crypto.randomUUID(), ...form, game: scenario.adminTitle, concreteResult: scenario.result, score, percentage: score, durationSeconds, gift: giftResult.gift, metadata: { gameId: scenario.id, completed: true, actions: selected, result: { gameId: scenario.id, score, maxScore: 100, percentage: score, durationSeconds, completed: true } }, createdAt: new Date().toISOString(), sync: navigator.onLine ? "Synchronise" : "En attente" };
    const next = [lead, ...leads];
    setLeads(next);
    localStorage.setItem("vettronic-leads-v2", JSON.stringify(next));
    setScreen("reward");
  }

  function exportCsv() {
    const header = "Nom,Telephone,Ville,Profil,Animaux,Jeu auto,Resultat,Score,Lot,Duree,Date\n";
    const rows = leads.map((l) => [l.first + " " + l.last, l.phone, l.city, l.profile, l.animals.join(" | "), l.game, l.concreteResult, l.percentage + "%", l.gift, l.durationSeconds + "s", l.createdAt].map((x) => `"${x.replaceAll('"', '""')}"`).join(","));
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" })); a.download = "vettronic-leads.csv"; a.click();
  }

  if (screen === "admin") return <main className="min-h-screen bg-field p-4 md:p-6"><Top go={() => setScreen("home")} /><section className="mx-auto max-w-7xl"><HeroTitle label="Administration" title="Pilotage SELAB" text="Les jeux refondus utilisent de vrais dossiers fictifs, des numeros proches, des registres et des donnees sanitaires." /><Tabs tab={tab} setTab={setTab} />{tab === "dashboard" && <><div className="grid grid-cols-4 gap-3 grid2"><Stat k="Participants" v={leads.length} /><Stat k="Lots remis" v={wins} /><Stat k="Score moyen" v={avg + "%"} /><Stat k="Animaux demo" v={demoAnimals.length} /></div><StockSummary gifts={gifts} /></>}{tab === "leads" && <><button onClick={exportCsv} className="tap mb-4 rounded bg-tech px-5 py-3 font-black text-white">Exporter CSV</button><LeadTable leads={leads} /></>}{tab === "games" && <GameAdmin active={activeGames} setActive={persistGames} />}{tab === "lots" && <GiftManager gifts={gifts} setGifts={persistGifts} />}{tab === "data" && <DatasetView />}</section></main>;
  if (screen === "intro") return <main className="min-h-screen bg-field p-4 md:p-6"><section className="mx-auto grid max-w-5xl grid-cols-[.9fr_1.1fr] gap-5 grid2"><SpeciesImg species={scenario.species[0]} className="h-full min-h-[420px] w-full rounded object-cover shadow" /><div className="grid content-center rounded bg-white p-6 shadow"><img src="/branding/logo.png" alt="Vet'Tronic" className="mb-6 h-20 object-contain" /><p className="font-black text-tech">Mission personnalisee</p><h1 className="mt-2 text-5xl font-black">Mission Vet'Tronic</h1><p className="mt-5 text-xl text-ink/75">{scenario.intro}</p><p className="mt-4 rounded bg-field p-4 font-bold">{scenario.mission}</p><button onClick={startGame} className="tap mt-6 rounded bg-tech px-6 py-5 text-2xl font-black text-white">Commencer</button></div></section></main>;
  if (screen === "game") return <GameScreen scenario={scenario} selected={selected} detail={detail} feedback={feedback} playStep={playStep} finish={finishGame} />;
  if (screen === "reward") { const last = leads[0]; return <main className="grid min-h-screen place-items-center bg-field p-5"><section className="max-w-3xl overflow-hidden rounded bg-white shadow"><SpeciesImg species={scenario.species[0]} className="h-56 w-full object-cover" /><div className="p-7"><img src="/branding/logo.png" className="mx-auto h-20 object-contain" alt="Vet'Tronic" /><h1 className="mt-4 text-center text-3xl font-black">{scenario.result}</h1><p className="mt-3 text-center text-2xl font-black text-tech">Score {last?.percentage}% - Lot : {last?.gift}</p><Compare withId={scenario.withId} withoutId={scenario.withoutId} /><p className="mt-4 rounded bg-field p-4 font-bold text-tech">{scenario.lesson}</p><button onClick={() => { setForm(emptyForm); setStep(0); setScreen("home"); }} className="tap mt-6 w-full rounded bg-tech px-6 py-4 font-black text-white">Nouveau participant</button></div></section></main>; }
  if (screen === "form") return <FormScreen step={step} setStep={setStep} form={form} setForm={setForm} start={prepareGame} />;
  return <Home start={() => setScreen("form")} admin={() => setScreen("admin")} />;
}

function GameScreen({ scenario, selected, detail, feedback, playStep, finish }: { scenario: Scenario; selected: string[]; detail: Step | null; feedback: string; playStep: (s: Step) => void; finish: () => void }) {
  const goodCount = selected.filter((id) => !scenario.steps.find((s) => s.id === id)?.wrong).length;
  const progress = Math.round((goodCount / scenario.steps.filter((s) => !s.wrong).length) * 100);
  return <main className="min-h-screen bg-field p-4 md:p-6"><section className="mx-auto max-w-7xl"><p className="font-black text-tech">Probleme -> Enquete -> Donnees -> Identification -> Consequence</p><h1 className="mb-3 text-4xl font-black">Mission Vet'Tronic</h1><div className="mb-4 h-4 overflow-hidden rounded bg-white"><div className="h-full bg-tech transition-all" style={{ width: progress + "%" }} /></div><div className="grid grid-cols-[.95fr_1.15fr_.9fr] gap-4 grid2"><Panel species={scenario.species[0]} scenario={scenario} selected={selected} /><Dossier step={detail || scenario.steps[0]} /><div className="grid content-start gap-3"><p className="rounded bg-ink p-4 font-black text-white">{feedback}</p>{scenario.steps.map((s) => <button key={s.id} onClick={() => playStep(s)} className={`tap rounded border px-4 py-3 text-left font-black ${selected.includes(s.id) ? s.wrong ? "bg-amber text-white" : "bg-tech text-white" : "bg-white"}`}>{s.label}</button>)}<button onClick={finish} className="tap rounded bg-tech py-4 text-xl font-black text-white">Valider le resultat</button></div></div></section></main>;
}

function Panel({ species, scenario, selected }: { species: Species; scenario: Scenario; selected: string[] }) { return <div className="relative min-h-[560px] overflow-hidden rounded border bg-white shadow"><SpeciesImg species={species} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/20" /><div className="absolute left-4 right-4 top-4 rounded bg-white/95 p-4"><p className="font-black">{scenario.mission}</p><p className="mt-2 text-sm font-bold text-tech">Actions utiles realisees : {selected.filter((id) => !scenario.steps.find((s) => s.id === id)?.wrong).length}</p></div><div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2">{scenario.steps.filter((s) => !s.wrong).slice(0, 4).map((s) => <div key={s.id} className="rounded bg-white/95 p-3 text-sm font-black shadow">{s.label}</div>)}</div></div>; }
function Dossier({ step }: { step: Step }) { return <div className="min-h-[560px] rounded border bg-white p-4 shadow"><p className="font-black text-tech">{step.wrong ? "Mauvaise piste" : "Donnee consultee"}</p><h2 className="mt-1 text-2xl font-black">{step.label}</h2><p className="mt-3 rounded bg-field p-3 font-bold">{step.detail}</p>{step.view === "rfid" && <RFID animal={step.animal} />}{step.view === "identity" && <AnimalIdentityCard animal={step.animal} />}{step.view === "health" && <AnimalHealthRecord animal={step.animal} />}{step.view === "movement" && <AnimalMovementTimeline animal={step.animal} />}{step.view === "registry" && <FarmRegistry />}{step.view === "compare" && <TagComparison animal={step.animal} />}{step.view === "network" && <ContactNetwork />}</div>; }
function RFID({ animal }: { animal?: DemoAnimal }) { return <div className="mt-4 rounded bg-ink p-4 font-mono text-white"><p>LECTURE RFID</p><p className="mt-3 text-2xl font-black">{animal?.electronicId || "AUCUN SIGNAL"}</p><p className="mt-3 text-leaf">SIGNAL : {animal?.electronicId ? "██████████" : "██░░░░░░░░"}</p><p className="mt-2">{animal?.electronicId ? "Lecture reussie" : "Aucune identification electronique detectee"}</p></div>; }
function AnimalIdentityCard({ animal }: { animal?: DemoAnimal }) { return <div className="mt-4 grid grid-cols-[120px_1fr] gap-4 rounded border p-3"><SpeciesImg species={animal?.species || "Bovins"} className="h-28 w-full rounded object-cover" /><div className="text-sm"><Info k="ID electronique" v={animal?.electronicId || "Non detecte"} /><Info k="Boucle visuelle" v={animal?.visualTag || "Non lisible"} /><Info k="Espece / race" v={`${animal?.species || "?"} - ${animal?.breed || "?"}`} /><Info k="Proprietaire" v={ownerName(animal)} /><Info k="Exploitation" v={farmName(animal)} /></div></div>; }
function AnimalHealthRecord({ animal }: { animal?: DemoAnimal }) { return <div className="mt-4 rounded border p-3"><h3 className="font-black">Dossier sanitaire</h3>{animal?.vaccinations.map((v) => <Info key={v.name} k={v.name} v={`${v.date} - ${v.status}`} />)}{animal?.sanitaryChecks.map((c) => <Info key={c.date} k="Controle" v={`${c.date} - ${c.result} - ${c.place}`} />)}</div>; }
function AnimalMovementTimeline({ animal }: { animal?: DemoAnimal }) { return <div className="mt-4 rounded border p-3"><h3 className="font-black">Mouvements</h3>{animal?.movements.map((m) => <div key={m.date + m.place} className="mt-2 border-l-4 border-tech pl-3"><b>{m.date}</b><br />{m.place} - {m.type} {m.ref || ""}</div>)}</div>; }
function FarmRegistry() { return <div className="mt-4 grid gap-3">{farms.slice(0, 4).map((f) => <div key={f.id} className="rounded border p-3"><p className="font-black">{f.name} - {f.city}</p><p className="mt-1 font-mono text-sm">{f.registryIds.join(" / ") || "Registre demo consultable"}</p></div>)}</div>; }
function TagComparison({ animal }: { animal?: DemoAnimal }) { return <div className="mt-4 rounded border p-3"><h3 className="font-black">Comparaison identification</h3><Info k="Boucle visuelle" v={animal?.visualTag || "Illisible"} /><Info k="Lecture electronique" v={animal?.electronicId || "Aucune"} /><Info k="Conclusion" v={animal?.identificationStatus === "mismatch" ? "Incoherence : controle necessaire" : animal?.electronicId ? "Identite verifiable" : "Informations non verifiables"} /></div>; }
function ContactNetwork() { return <div className="mt-4 grid grid-cols-2 gap-3"><Stat k="Depart" v="247" /><Stat k="Apres registres" v="93" /><Stat k="Parc partage" v="31" /><Stat k="Contacts directs" v="18" /></div>; }
function Compare({ withId, withoutId }: { withId: string[]; withoutId: string[] }) { return <div className="mt-5 grid grid-cols-2 gap-3 grid2"><div className="rounded bg-field p-4"><h3 className="font-black text-tech">Avec identification</h3>{withId.map((x) => <p key={x} className="mt-2 font-bold">- {x}</p>)}</div><div className="rounded bg-amber/10 p-4"><h3 className="font-black text-amber">Sans identification</h3>{withoutId.map((x) => <p key={x} className="mt-2 font-bold">- {x}</p>)}</div></div>; }
function Info({ k, v }: { k: string; v: string }) { return <p className="mt-1"><b>{k} :</b> {v}</p>; }
function SpeciesImg({ species, className }: { species: Species; className: string }) { return <img onError={imageFallback} src={speciesImages[species]} alt={species} className={className} />; }
function Home({ start, admin }: { start: () => void; admin: () => void }) { return <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbf8,#dff5e7)] p-4 md:p-6"><header className="mx-auto flex max-w-6xl items-center justify-between"><img src="/branding/logo.png" className="h-24 object-contain" alt="Vet'Tronic" /><button onClick={admin} className="tap rounded border bg-white px-4 font-black text-tech">Admin</button></header><section className="mx-auto grid max-w-6xl grid-cols-[1fr_.9fr] items-center gap-6 py-8 grid2"><div><p className="mb-4 inline-block rounded-full bg-white px-4 py-2 font-bold text-tech">SELAB - mission automatique - dossiers reels fictifs</p><h1 className="hero max-w-3xl text-7xl font-black leading-tight">Defi Vet'Tronic</h1><p className="mt-5 max-w-2xl text-xl text-ink/70">Le participant renseigne son profil. L'application lance automatiquement une mission de tracabilite adaptee.</p><button onClick={start} className="tap mt-8 rounded bg-tech px-12 py-5 text-2xl font-black text-white">Jouer</button></div><div className="grid grid-cols-2 gap-3">{speciesList.slice(0, 4).map((s) => <SpeciesImg key={s} species={s} className="h-48 w-full rounded border bg-white object-cover shadow" />)}</div></section></main>; }
function FormScreen({ step, setStep, form, setForm, start }: { step: number; setStep: (n: number) => void; form: FormState; setForm: (f: FormState) => void; start: () => void }) { const visual = form.animals[0] || (form.profile === "Veterinaire" ? "Chiens" : "Bovins"); return <main className="min-h-screen bg-field p-4 md:p-6"><Top go={() => setStep(Math.max(0, step - 1))} /><section className="mx-auto grid max-w-6xl grid-cols-[.9fr_1.1fr] gap-5 grid2"><SpeciesImg species={visual} className="h-full min-h-[360px] w-full rounded object-cover shadow" /><div className="rounded bg-white p-5 shadow"><h1 className="mb-4 text-3xl font-black">Participation</h1>{step === 0 && <div className="grid gap-3"><Input p="Prenom" v={form.first} f={(v) => setForm({ ...form, first: v })} /><Input p="Nom" v={form.last} f={(v) => setForm({ ...form, last: v })} /><Input p="Telephone" v={form.phone} f={(v) => setForm({ ...form, phone: v })} /><Input p="Ville" v={form.city} f={(v) => setForm({ ...form, city: v })} /><button disabled={!form.first || !form.last || !form.phone || !form.city} onClick={() => setStep(1)} className="tap rounded bg-tech py-4 font-black text-white disabled:opacity-40">Valider</button></div>}{step === 1 && <div><p className="mb-3 font-black">Vous etes principalement :</p><div className="grid gap-2">{profiles.map((p) => <button onClick={() => setForm({ ...form, profile: p })} className={`tap rounded border px-4 py-3 text-left font-black ${form.profile === p ? "bg-tech text-white" : "bg-white"}`} key={p}>{p}</button>)}</div><button onClick={() => setStep(2)} className="tap mt-4 w-full rounded bg-tech py-4 font-black text-white">Continuer</button></div>}{step === 2 && <div><p className="mb-3 font-black">Animaux possedes ou geres :</p><div className="grid grid-cols-2 gap-2">{speciesList.map((a) => <button onClick={() => setForm({ ...form, animals: form.animals.includes(a) ? form.animals.filter((x) => x !== a) : [...form.animals, a] })} className={`tap rounded border px-3 py-3 font-bold ${form.animals.includes(a) ? "bg-tech text-white" : "bg-white"}`} key={a}>{a}</button>)}</div><select value={form.identification} onChange={(e) => setForm({ ...form, identification: e.target.value })} className="tap mt-4 w-full rounded border px-3"><option>Oui, tous</option><option>Oui, en partie</option><option>Non</option><option>Je ne sais pas</option></select><label className="mt-4 flex items-center gap-3 font-bold"><input type="checkbox" checked={form.onsite} onChange={(e) => setForm({ ...form, onsite: e.target.checked })} /> Animal present au SELAB</label><button onClick={start} className="tap mt-4 w-full rounded bg-tech py-4 font-black text-white">Lancer mon defi</button></div>}</div></section></main>; }
function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) { return <div className="mb-5 flex flex-wrap gap-2">{(["dashboard", "leads", "games", "lots", "data"] as Tab[]).map((t) => <button key={t} onClick={() => setTab(t)} className={`tap rounded border px-4 py-2 font-black ${tab === t ? "bg-tech text-white" : "bg-white"}`}>{t === "dashboard" ? "Tableau" : t === "leads" ? "Contacts" : t === "games" ? "Jeux" : t === "lots" ? "Lots" : "Donnees"}</button>)}</div>; }
function GameAdmin({ active, setActive }: { active: GameId[]; setActive: (ids: GameId[]) => void }) { return <div className="grid grid-cols-3 gap-4 grid2">{scenarios.map((s) => <article key={s.id} className="overflow-hidden rounded border bg-white shadow"><SpeciesImg species={s.species[0]} className="h-40 w-full object-cover" /><div className="p-4"><h2 className="text-xl font-black">{s.adminTitle}</h2><p className="mt-2 text-sm text-ink/70">{s.mission}</p><p className="mt-2 text-xs font-bold text-tech">Profils : {s.profiles.join(", ")}</p><label className="mt-3 flex items-center gap-3 font-bold"><input type="checkbox" checked={active.includes(s.id)} onChange={(e) => setActive(e.target.checked ? [...active, s.id] : active.filter((id) => id !== s.id))} /> Actif</label></div></article>)}</div>; }
function DatasetView() { return <div className="grid grid-cols-2 gap-4 grid2"><div className="rounded bg-white p-4 shadow"><h2 className="text-2xl font-black">Base fictive</h2><p className="mt-2 font-bold">{demoAnimals.length} animaux, {owners.length} proprietaires, {farms.length} exploitations.</p><div className="mt-4 grid gap-2">{speciesList.map((s) => <p key={s} className="font-bold">{s} : {demoAnimals.filter((a) => a.species === s).length}</p>)}</div></div><div className="rounded bg-white p-4 shadow"><h2 className="text-2xl font-black">Exemple dossier</h2><AnimalIdentityCard animal={featuredAnimals.scannerIdentified} /><AnimalHealthRecord animal={featuredAnimals.scannerIdentified} /></div></div>; }
function LeadTable({ leads }: { leads: Lead[] }) { return <div className="overflow-auto rounded border bg-white"><table className="w-full min-w-[1080px] text-left"><thead className="bg-field"><tr>{["Nom", "Telephone", "Profil", "Animaux", "Jeu auto", "Resultat", "Score", "Lot", "Duree"].map((h) => <th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{leads.map((l) => <tr className="border-t" key={l.id}><td className="p-3 font-bold">{l.first} {l.last}</td><td className="p-3">{l.phone}</td><td className="p-3">{l.profile}</td><td className="p-3">{l.animals.join(", ")}</td><td className="p-3">{l.game}</td><td className="p-3">{l.concreteResult}</td><td className="p-3">{l.percentage}%</td><td className="p-3">{l.gift}</td><td className="p-3">{l.durationSeconds}s</td></tr>)}</tbody></table>{!leads.length && <p className="p-6 text-center font-bold text-ink/60">Aucun participant pour le moment.</p>}</div>; }
function GiftManager({ gifts, setGifts }: { gifts: Gift[]; setGifts: (g: Gift[]) => void }) { function update(id: string, patch: Partial<Gift>) { setGifts(gifts.map((g) => g.id === id ? { ...g, ...patch } : g)); } return <div className="grid gap-4"><button onClick={() => setGifts([...gifts, { id: crypto.randomUUID(), name: "Nouveau lot", stock: 10, threshold: 60, active: true }])} className="tap w-fit rounded bg-tech px-5 py-3 font-black text-white">Ajouter un lot</button>{gifts.map((g) => <article key={g.id} className="grid grid-cols-[1.5fr_.7fr_.7fr_.5fr] items-end gap-3 rounded border bg-white p-4 shadow grid2"><label className="grid gap-1 font-bold">Nom<input value={g.name} onChange={(e) => update(g.id, { name: e.target.value })} className="tap rounded border px-3" /></label><label className="grid gap-1 font-bold">Stock<input type="number" min={0} value={g.stock} onChange={(e) => update(g.id, { stock: Number(e.target.value) })} className="tap rounded border px-3" /></label><label className="grid gap-1 font-bold">Score min<input type="number" min={0} max={100} value={g.threshold} onChange={(e) => update(g.id, { threshold: Number(e.target.value) })} className="tap rounded border px-3" /></label><label className="flex items-center gap-3 pb-3 font-bold"><input type="checkbox" checked={g.active} onChange={(e) => update(g.id, { active: e.target.checked })} /> Actif</label></article>)}</div>; }
function StockSummary({ gifts }: { gifts: Gift[] }) { return <div className="mt-5 grid grid-cols-4 gap-3 grid2">{gifts.map((g) => <article key={g.id} className="rounded border bg-white p-4 shadow"><p className="font-black">{g.name}</p><p className="mt-2 text-3xl font-black text-tech">{g.stock}</p><p className="text-sm font-bold text-ink/60">Score min {g.threshold}%</p></article>)}</div>; }
function Top({ go }: { go: () => void }) { return <button onClick={go} className="mb-5 text-sm font-bold text-tech">Retour</button>; }
function Input({ p, v, f }: { p: string; v: string; f: (v: string) => void }) { return <label className="grid gap-1 font-bold">{p}<input value={v} onChange={(e) => f(e.target.value)} className="tap rounded border px-3" /></label>; }
function Stat({ k, v }: { k: string; v: number | string }) { return <div className="rounded bg-white p-4 shadow"><p className="font-bold text-ink/60">{k}</p><p className="text-3xl font-black text-tech">{v}</p></div>; }
function HeroTitle({ label, title, text }: { label: string; title: string; text: string }) { return <div className="mb-5"><p className="font-black text-tech">{label}</p><h1 className="text-4xl font-black">{title}</h1><p className="mt-2 max-w-2xl text-ink/70">{text}</p></div>; }
