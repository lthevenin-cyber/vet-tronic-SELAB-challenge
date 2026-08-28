"use client";

import { useEffect, useMemo, useState } from "react";

type Screen = "home" | "form" | "game" | "result" | "admin";
type Tab = "dashboard" | "leads" | "games" | "lots";
type Gift = { id: string; name: string; stock: number; threshold: number; active: boolean };
type Lead = { id: string; first: string; last: string; phone: string; city: string; profile: string; animals: string[]; identification: string; onsite: boolean; game: string; score: number; gift: string; createdAt: string; sync: "Synchronise" | "En attente" };
type Game = { id: string; title: string; profiles: string[]; photo: string; scene: string; proof: string; actions: string[]; warning?: string };

const profiles = ["Eleveur", "Veterinaire", "Proprietaire animaux", "Professionnel animal", "Institution", "Etudiant", "Visiteur"];
const animals = ["Bovins", "Ovins", "Caprins", "Porcins", "Volailles", "Chiens", "Chats", "Chevaux"];
const photos = [
  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484557985045-edf25e08da73?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560813562-fd09315f28d4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1554692918-08fa0fdc9db3?auto=format&fit=crop&w=1200&q=80"
];
const gameList: Game[] = [
  { id: "scanner", title: "Le scanner Vet'Tronic", profiles, photo: photos[0], scene: "Controle d'entree : plusieurs animaux doivent etre identifies avant d'etre rattaches a leur fiche.", proof: "Sans identification fiable, un animal peut etre impossible a tracer.", actions: ["Scanner animal", "Lire l'identifiant", "Comparer la fiche", "Valider le proprietaire", "Enregistrer le controle"] },
  { id: "lost-owner", title: "Retrouve mon proprietaire", profiles: ["Proprietaire animaux", "Veterinaire", "Etudiant", "Visiteur"], photo: photos[4], scene: "Un chien perdu est amene au stand. Il faut confirmer son proprietaire sans se fier seulement a l'apparence.", proof: "La puce permet de retrouver une famille et de prouver l'identite.", actions: ["Observer l'animal", "Scanner la puce", "Verifier le dossier", "Appeler le contact", "Restituer l'animal"] },
  { id: "herd", title: "A qui appartient ce troupeau ?", profiles: ["Eleveur"], photo: photos[1], scene: "Deux troupeaux se sont melanges. Les boucles et dossiers permettent de reconstituer les lots.", proof: "Identifier son troupeau protege son patrimoine et facilite la vente.", actions: ["Lire boucle rouge", "Classer ferme Nord", "Lire boucle bleue", "Classer ferme Sud", "Isoler non identifie", "Certifier le lot"] },
  { id: "epidemic", title: "Stop a l'epidemie", profiles: ["Eleveur", "Veterinaire", "Institution", "Professionnel animal"], photo: photos[2], scene: "Une alerte sanitaire fictive est declenchee. Il faut suivre les contacts et limiter la propagation.", proof: "La tracabilite accelere les decisions pendant une crise sanitaire.", actions: ["Identifier ferme source", "Tracer transport", "Verifier marche", "Lister contacts", "Bloquer le lot"] },
  { id: "market", title: "Le marche aux animaux", profiles: ["Eleveur", "Professionnel animal"], photo: photos[0], scene: "Au marche, les animaux avec origine connue inspirent plus confiance que les lots sans historique.", proof: "L'identification apporte confiance, valeur et securite aux transactions.", actions: ["Choisir animal identifie", "Verifier origine", "Controler sanitaire", "Refuser historique inconnu", "Valider achat"] },
  { id: "farm", title: "Sauve ton elevage", profiles: ["Eleveur"], photo: photos[3], scene: "Votre elevage subit plusieurs incidents. Les bons reflexes evitent les pertes de valeur.", proof: "L'identification protege le capital de l'eleveur.", actions: ["Signaler animal echappe", "Separer troupeaux melanges", "Prouver origine", "Controler suspicion", "Declarer vol"] },
  { id: "veterinary", title: "Mission veterinaire", profiles: ["Veterinaire", "Etudiant"], photo: photos[5], scene: "Deux patients se ressemblent. Il faut associer le bon animal au bon dossier medical.", proof: "L'identification securise le suivi veterinaire et sanitaire.", actions: ["Scanner patient", "Ouvrir dossier", "Comparer signalement", "Associer animal", "Enregistrer vaccination"] },
  { id: "who-am-i", title: "Qui suis-je ?", profiles, photo: photos[4], scene: "Retrouvez l'animal montre parmi des animaux similaires, puis prouvez son identite au scanner.", proof: "Reconnaitre visuellement ne suffit pas toujours a prouver l'identite.", actions: ["Memoriser photo", "Comparer animaux", "Scanner identifiant", "Verifier fiche"] },
  { id: "challenge", title: "Defi identification", profiles, photo: photos[2], scene: "Une serie rapide d'epreuves melange scan, association, controle et enquete de tracabilite.", proof: "Chaque preuve d'identite renforce la chaine de confiance.", actions: ["Scan", "Association", "Enquete", "Carte", "Controle", "Dossier", "Signalement", "Badge"] },
  { id: "cattle-theft", title: "Alerte betail : vol de troupeau", profiles: ["Eleveur", "Institution", "Professionnel animal", "Veterinaire"], photo: photos[0], scene: "Des bovins ont ete voles cette nuit. Les identifiants fiables aident a retrouver les bons animaux.", proof: "Identifier, c'est aussi mieux proteger son troupeau contre le vol.", warning: "Le systeme aide a prouver l'identite, sans garantir seul la recuperation d'un animal vole.", actions: ["Verification visuelle", "Lire boucle", "Scanner electronique", "Comparer declaration", "Signaler l'animal"] },
  { id: "patient-zero", title: "Patient zero : enquete Vet'Tronic", profiles: ["Veterinaire", "Institution", "Eleveur", "Professionnel animal"], photo: photos[1], scene: "Suspicion fictive d'origine animale. Il faut reconstituer une chaine de contacts sans poser de diagnostic medical.", proof: "L'identification facilite les enquetes sanitaires et la tracabilite.", actions: ["Indice patient", "Fournisseur", "Abattoir", "Marche", "Exploitation", "Animal source", "Contacts exposes"] }
];
const profilePriority: Record<string, string[]> = {
  Eleveur: ["herd", "farm", "cattle-theft", "market", "epidemic", "scanner"],
  Veterinaire: ["veterinary", "patient-zero", "epidemic", "lost-owner", "scanner"],
  "Proprietaire animaux": ["lost-owner", "who-am-i", "scanner"],
  "Professionnel animal": ["market", "epidemic", "cattle-theft", "scanner"],
  Institution: ["patient-zero", "epidemic", "cattle-theft", "scanner"],
  Etudiant: ["veterinary", "who-am-i", "lost-owner", "challenge"],
  Visiteur: ["who-am-i", "lost-owner", "challenge", "scanner"]
};
const animalBonus: Record<string, string[]> = {
  Bovins: ["cattle-theft", "herd", "market"],
  Ovins: ["herd", "epidemic"],
  Caprins: ["herd", "farm"],
  Porcins: ["epidemic", "market"],
  Volailles: ["epidemic", "patient-zero"],
  Chiens: ["lost-owner", "veterinary"],
  Chats: ["lost-owner", "who-am-i"],
  Chevaux: ["veterinary", "scanner"]
};
const baseGifts: Gift[] = [
  { id: "pen", name: "Stylo Vet'Tronic", stock: 200, threshold: 50, active: true },
  { id: "cap", name: "Casquette Vet'Tronic", stock: 100, threshold: 70, active: true },
  { id: "shirt", name: "T-shirt Vet'Tronic", stock: 50, threshold: 80, active: true },
  { id: "premium", name: "Lot premium", stock: 20, threshold: 95, active: true }
];

function hashText(text: string) { return text.split("").reduce((n, c) => n + c.charCodeAt(0), 0); }
function storage<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [step, setStep] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [gifts, setGifts] = useState<Gift[]>(baseGifts);
  const [enabledGames, setEnabledGames] = useState<string[]>(gameList.map((g) => g.id));
  const [selectedGameId, setSelectedGameId] = useState(gameList[0].id);
  const [actions, setActions] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const [form, setForm] = useState({ first: "", last: "", phone: "", city: "", profile: "Eleveur", animals: [] as string[], identification: "Je ne sais pas", onsite: false });

  useEffect(() => {
    setLeads(storage("vettronic-leads", [] as Lead[]));
    setGifts(storage("vettronic-gifts", baseGifts));
    setEnabledGames(storage("vettronic-games", gameList.map((g) => g.id)));
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const currentGame = useMemo(() => gameList.find((g) => g.id === selectedGameId) || gameList[0], [selectedGameId]);
  const wins = leads.filter((l) => l.gift !== "Participation").length;
  const avg = leads.length ? Math.round(leads.reduce((n, l) => n + l.score, 0) / leads.length) : 0;

  function persistGifts(next: Gift[]) { setGifts(next); localStorage.setItem("vettronic-gifts", JSON.stringify(next)); }
  function persistGames(next: string[]) { setEnabledGames(next); localStorage.setItem("vettronic-games", JSON.stringify(next)); }

  function automaticGameId() {
    const scores = new Map<string, number>();
    for (const id of profilePriority[form.profile] || ["scanner", "challenge"]) scores.set(id, (scores.get(id) || 0) + 10);
    for (const animal of form.animals) for (const id of animalBonus[animal] || []) scores.set(id, (scores.get(id) || 0) + 6);
    if (form.onsite) scores.set("scanner", (scores.get("scanner") || 0) + 4);
    if (form.identification === "Non" || form.identification === "Je ne sais pas") scores.set("scanner", (scores.get("scanner") || 0) + 3);
    const available = gameList.filter((g) => enabledGames.includes(g.id) && g.profiles.includes(form.profile));
    const ranked = available.sort((a, b) => (scores.get(b.id) || 0) - (scores.get(a.id) || 0));
    const bestScore = scores.get(ranked[0]?.id || "") || 0;
    const best = ranked.filter((g) => (scores.get(g.id) || 0) === bestScore);
    return (best[hashText(form.first + form.last + form.phone) % Math.max(best.length, 1)] || ranked[0] || gameList[0]).id;
  }

  function startAutomaticGame() {
    setSelectedGameId(automaticGameId());
    setActions([]);
    setBad([]);
    setScreen("game");
  }

  function chooseGift(score: number) {
    const available = [...gifts].filter((g) => g.active && g.stock > 0 && score >= g.threshold).sort((a, b) => b.threshold - a.threshold)[0];
    if (!available) return { gift: "Participation", nextGifts: gifts };
    const nextGifts = gifts.map((g) => (g.id === available.id ? { ...g, stock: Math.max(0, g.stock - 1) } : g));
    return { gift: available.name, nextGifts };
  }

  function finishGame() {
    const score = Math.max(0, Math.min(100, Math.round((actions.length / currentGame.actions.length) * 100) - bad.length * 8));
    const { gift, nextGifts } = chooseGift(score);
    persistGifts(nextGifts);
    const lead: Lead = { id: crypto.randomUUID(), ...form, game: currentGame.title, score, gift, createdAt: new Date().toISOString(), sync: navigator.onLine ? "Synchronise" : "En attente" };
    const nextLeads = [lead, ...leads];
    setLeads(nextLeads);
    localStorage.setItem("vettronic-leads", JSON.stringify(nextLeads));
    setScreen("result");
  }

  function exportCsv() {
    const header = "Nom,Telephone,Ville,Profil,Animaux,Identification,Sur site,Jeu,Score,Cadeau,Date\n";
    const rows = leads.map((l) => [l.first + " " + l.last, l.phone, l.city, l.profile, l.animals.join(" | "), l.identification, l.onsite ? "Oui" : "Non", l.game, String(l.score), l.gift, l.createdAt].map((x) => `"${x.replaceAll('"', '""')}"`).join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    a.download = "vettronic-leads.csv";
    a.click();
  }

  function resetParticipant() {
    setForm({ first: "", last: "", phone: "", city: "", profile: "Eleveur", animals: [], identification: "Je ne sais pas", onsite: false });
    setActions([]); setBad([]); setStep(0); setScreen("home");
  }

  if (screen === "admin") return <main className="min-h-screen bg-field p-4 md:p-6"><Top go={() => setScreen("home")} /><section className="mx-auto max-w-7xl"><HeroTitle label="Administration" title="Pilotage SELAB" text="Les jeux sont visibles ici uniquement. Cote participant, l'application choisit automatiquement le jeu selon le profil." /><PhotoStrip /><div className="mb-5 flex flex-wrap gap-2">{(["dashboard", "leads", "games", "lots"] as Tab[]).map((t) => <button key={t} onClick={() => setTab(t)} className={`tap rounded border px-4 py-2 font-black ${tab === t ? "bg-tech text-white" : "bg-white"}`}>{t === "dashboard" ? "Tableau" : t === "leads" ? "Contacts" : t === "games" ? "Jeux" : "Lots"}</button>)}</div>{tab === "dashboard" && <><div className="grid grid-cols-4 gap-3 grid2"><Stat k="Participants" v={leads.length} /><Stat k="Lots remis" v={wins} /><Stat k="Score moyen" v={avg + "%"} /><Stat k="Jeux actifs" v={enabledGames.length} /></div><StockSummary gifts={gifts} /></>}{tab === "leads" && <><button onClick={exportCsv} className="tap mb-4 rounded bg-tech px-5 py-3 font-black text-white">Exporter CSV</button><LeadTable leads={leads} /></>}{tab === "games" && <GameAdmin enabledGames={enabledGames} persistGames={persistGames} />}{tab === "lots" && <GiftManager gifts={gifts} setGifts={persistGifts} />}</section></main>;

  if (screen === "game") return <main className="min-h-screen bg-field p-4 md:p-6"><Top go={() => setScreen("home")} /><section className="mx-auto max-w-6xl"><p className="font-black text-tech">Defi personnalise</p><h1 className="mb-3 text-4xl font-black">Mission Vet'Tronic</h1><p className="mb-5 max-w-3xl text-lg text-ink/75">{currentGame.scene}</p><div className="grid grid-cols-[1.15fr_.85fr] gap-5 grid2"><div className="overflow-hidden rounded border bg-white shadow"><div className="relative"><img src={currentGame.photo} alt="Photo vraie d'animal" className="h-[420px] w-full object-cover" /><Hotspot label="Scan" pos="left-[18%] top-[22%]" onClick={() => setActions((x) => x.includes(currentGame.actions[0]) ? x : [...x, currentGame.actions[0]])} /><Hotspot label="ID" pos="right-[16%] top-[44%]" onClick={() => setActions((x) => x.includes(currentGame.actions[1]) ? x : [...x, currentGame.actions[1]])} /><button onClick={() => setBad((x) => x.includes("Erreur") ? x : [...x, "Erreur"])} className="absolute bottom-[12%] left-[42%] rounded-full bg-amber px-4 py-3 font-black text-white shadow">Leurre</button></div><div className="p-4"><p className="rounded bg-ink p-3 font-black text-white">{actions.length ? "Preuves collectees : " + actions.length : "Touchez la photo puis completez les actions."}</p><p className="mt-3 font-bold text-tech">{currentGame.proof}</p>{currentGame.warning && <p className="mt-3 rounded bg-amber/20 p-3 text-sm font-bold">{currentGame.warning}</p>}</div></div><div className="grid gap-3">{currentGame.actions.map((a) => <button key={a} onClick={() => setActions((x) => x.includes(a) ? x.filter((v) => v !== a) : [...x, a])} className={`tap rounded border px-4 py-3 text-left font-black ${actions.includes(a) ? "bg-tech text-white" : "bg-white"}`}>{a}</button>)}<button onClick={finishGame} className="tap rounded bg-tech py-4 text-xl font-black text-white">Terminer</button></div></div></section></main>;

  if (screen === "result") { const last = leads[0]; return <main className="grid min-h-screen place-items-center bg-field p-5"><section className="max-w-2xl overflow-hidden rounded bg-white text-center shadow"><img src={currentGame.photo} alt="Animal" className="h-56 w-full object-cover" /><div className="p-7"><img src="/branding/logo.png" className="mx-auto h-20 object-contain" alt="Vet'Tronic" /><h1 className="mt-4 text-4xl font-black">Bravo {form.first}</h1><p className="mt-3 text-2xl font-black text-tech">Score {last?.score}%</p><p className="mt-2 text-xl">Lot : {last?.gift}</p>{last?.gift !== "Participation" && <p className="mt-3 rounded bg-field p-3 font-bold text-leaf">Stock du lot deduit automatiquement.</p>}<button onClick={resetParticipant} className="tap mt-6 rounded bg-tech px-6 py-4 font-black text-white">Nouveau participant</button></div></section></main>; }

  if (screen === "form") return <main className="min-h-screen bg-field p-4 md:p-6"><Top go={() => setScreen("home")} /><section className="mx-auto grid max-w-6xl grid-cols-[.9fr_1.1fr] gap-5 grid2"><div className="overflow-hidden rounded bg-white shadow"><img src={photos[6]} alt="Animal" className="h-full min-h-[340px] w-full object-cover" /></div><div className="rounded bg-white p-5 shadow"><h1 className="mb-4 text-3xl font-black">Participation</h1>{step === 0 && <div className="grid gap-3"><Input p="Prenom" v={form.first} f={(v) => setForm({ ...form, first: v })} /><Input p="Nom" v={form.last} f={(v) => setForm({ ...form, last: v })} /><Input p="Telephone" v={form.phone} f={(v) => setForm({ ...form, phone: v })} /><Input p="Ville" v={form.city} f={(v) => setForm({ ...form, city: v })} /><button disabled={!form.first || !form.last || !form.phone || !form.city} onClick={() => setStep(1)} className="tap rounded bg-tech py-4 font-black text-white disabled:opacity-40">Valider</button></div>}{step === 1 && <div><p className="mb-3 font-black">Vous etes principalement :</p><div className="grid gap-2">{profiles.map((p) => <button onClick={() => setForm({ ...form, profile: p })} className={`tap rounded border px-4 py-3 text-left font-black ${form.profile === p ? "bg-tech text-white" : "bg-white"}`} key={p}>{p}</button>)}</div><button onClick={() => setStep(2)} className="tap mt-4 w-full rounded bg-tech py-4 font-black text-white">Continuer</button></div>}{step === 2 && <div><p className="mb-3 font-black">Animaux possedes ou geres :</p><div className="grid grid-cols-2 gap-2">{animals.map((a) => <button onClick={() => setForm({ ...form, animals: form.animals.includes(a) ? form.animals.filter((x) => x !== a) : [...form.animals, a] })} className={`tap rounded border px-3 py-3 font-bold ${form.animals.includes(a) ? "bg-tech text-white" : "bg-white"}`} key={a}>{a}</button>)}</div><select value={form.identification} onChange={(e) => setForm({ ...form, identification: e.target.value })} className="tap mt-4 w-full rounded border px-3"><option>Oui, tous</option><option>Oui, en partie</option><option>Non</option><option>Je ne sais pas</option></select><label className="mt-4 flex items-center gap-3 font-bold"><input type="checkbox" checked={form.onsite} onChange={(e) => setForm({ ...form, onsite: e.target.checked })} /> Animal present au SELAB</label><button onClick={startAutomaticGame} className="tap mt-4 w-full rounded bg-tech py-4 font-black text-white">Lancer mon defi</button></div>}</div></section></main>;

  return <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbf8,#dff5e7)] p-4 md:p-6"><header className="mx-auto flex max-w-6xl items-center justify-between gap-3"><img src="/branding/logo.png" className="h-24 object-contain" alt="Vet'Tronic" /><button onClick={() => setScreen("admin")} className="tap rounded border bg-white px-4 font-black text-tech">Admin</button></header><section className="mx-auto grid max-w-6xl grid-cols-[1fr_.9fr] items-center gap-6 py-8 grid2"><div><p className="mb-4 inline-block rounded-full bg-white px-4 py-2 font-bold text-tech">SELAB - defi adapte au profil - lots a gagner</p><h1 className="hero max-w-3xl text-7xl font-black leading-tight">Relevez le defi Vet'Tronic</h1><p className="mt-5 max-w-2xl text-xl text-ink/70">Le participant renseigne son profil, puis l'application lance automatiquement le scenario le plus coherent.</p><button onClick={() => setScreen("form")} className="tap mt-8 rounded bg-tech px-12 py-5 text-2xl font-black text-white">Jouer</button></div><div className="grid grid-cols-2 gap-3">{photos.slice(0, 4).map((p) => <img key={p} src={p} alt="Animal" className="h-48 w-full rounded border bg-white object-cover shadow" />)}</div></section></main>;
}

function Top({ go }: { go: () => void }) { return <button onClick={go} className="mb-5 text-sm font-bold text-tech">Retour accueil</button>; }
function Input({ p, v, f }: { p: string; v: string; f: (v: string) => void }) { return <label className="grid gap-1 font-bold">{p}<input value={v} onChange={(e) => f(e.target.value)} className="tap rounded border px-3" /></label>; }
function Stat({ k, v }: { k: string; v: number | string }) { return <div className="rounded bg-white p-4 shadow"><p className="font-bold text-ink/60">{k}</p><p className="text-3xl font-black text-tech">{v}</p></div>; }
function HeroTitle({ label, title, text }: { label: string; title: string; text: string }) { return <div className="mb-5"><p className="font-black text-tech">{label}</p><h1 className="text-4xl font-black">{title}</h1><p className="mt-2 max-w-2xl text-ink/70">{text}</p></div>; }
function PhotoStrip() { return <div className="mb-5 grid grid-cols-4 gap-3 grid2">{photos.slice(4, 8).map((p) => <img key={p} src={p} alt="Animal" className="h-36 w-full rounded object-cover shadow" />)}</div>; }
function Hotspot({ label, pos, onClick }: { label: string; pos: string; onClick: () => void }) { return <button onClick={onClick} className={`absolute ${pos} rounded-full bg-tech px-4 py-3 font-black text-white shadow`}>{label}</button>; }
function StockSummary({ gifts }: { gifts: Gift[] }) { return <div className="mt-5 grid grid-cols-4 gap-3 grid2">{gifts.map((g) => <article key={g.id} className="rounded border bg-white p-4 shadow"><p className="font-black">{g.name}</p><p className="mt-2 text-3xl font-black text-tech">{g.stock}</p><p className="text-sm font-bold text-ink/60">Score min {g.threshold}% - {g.active ? "actif" : "inactif"}</p></article>)}</div>; }
function GameAdmin({ enabledGames, persistGames }: { enabledGames: string[]; persistGames: (next: string[]) => void }) { return <div className="grid grid-cols-3 gap-4 grid2">{gameList.map((g) => <article key={g.id} className="overflow-hidden rounded border bg-white shadow"><img src={g.photo} alt="Animal" className="h-40 w-full object-cover" /><div className="p-4"><h2 className="text-xl font-black">{g.title}</h2><p className="mt-2 text-sm text-ink/70">{g.scene}</p><p className="mt-2 text-xs font-bold text-tech">Profils : {g.profiles.join(", ")}</p><label className="mt-4 flex items-center gap-3 font-bold"><input type="checkbox" checked={enabledGames.includes(g.id)} onChange={(e) => persistGames(e.target.checked ? [...enabledGames, g.id] : enabledGames.filter((id) => id !== g.id))} /> Actif</label></div></article>)}</div>; }
function LeadTable({ leads }: { leads: Lead[] }) { return <div className="overflow-auto rounded border bg-white"><table className="w-full min-w-[980px] text-left"><thead className="bg-field"><tr>{["Nom", "Telephone", "Ville", "Profil", "Animaux", "Jeu auto", "Score", "Lot", "Sync"].map((h) => <th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{leads.map((l) => <tr className="border-t" key={l.id}><td className="p-3 font-bold">{l.first} {l.last}</td><td className="p-3">{l.phone}</td><td className="p-3">{l.city}</td><td className="p-3">{l.profile}</td><td className="p-3">{l.animals.join(", ")}</td><td className="p-3">{l.game}</td><td className="p-3">{l.score}%</td><td className="p-3">{l.gift}</td><td className="p-3">{l.sync}</td></tr>)}</tbody></table>{!leads.length && <p className="p-6 text-center font-bold text-ink/60">Aucun participant pour le moment.</p>}</div>; }
function GiftManager({ gifts, setGifts }: { gifts: Gift[]; setGifts: (g: Gift[]) => void }) { function update(id: string, patch: Partial<Gift>) { setGifts(gifts.map((g) => (g.id === id ? { ...g, ...patch } : g))); } return <div className="grid gap-4"><button onClick={() => setGifts([...gifts, { id: crypto.randomUUID(), name: "Nouveau lot", stock: 10, threshold: 60, active: true }])} className="tap w-fit rounded bg-tech px-5 py-3 font-black text-white">Ajouter un lot</button>{gifts.map((g) => <article key={g.id} className="grid grid-cols-[1.5fr_.7fr_.7fr_.5fr] items-end gap-3 rounded border bg-white p-4 shadow grid2"><label className="grid gap-1 font-bold">Nom du lot<input value={g.name} onChange={(e) => update(g.id, { name: e.target.value })} className="tap rounded border px-3" /></label><label className="grid gap-1 font-bold">Stock restant<input type="number" min={0} value={g.stock} onChange={(e) => update(g.id, { stock: Number(e.target.value) })} className="tap rounded border px-3" /></label><label className="grid gap-1 font-bold">Score min<input type="number" min={0} max={100} value={g.threshold} onChange={(e) => update(g.id, { threshold: Number(e.target.value) })} className="tap rounded border px-3" /></label><label className="flex items-center gap-3 pb-3 font-bold"><input type="checkbox" checked={g.active} onChange={(e) => update(g.id, { active: e.target.checked })} /> Actif</label></article>)}</div>; }
