"use client";

import { useEffect, useMemo, useState, type ReactNode, type SyntheticEvent } from "react";
import { animalBonus, games, profilePriority, profiles, speciesList, type GameScenario, type Profile, type Species } from "../lib/game-data";

type Screen = "home" | "form" | "intro" | "game" | "reward" | "admin";
type Tab = "dashboard" | "leads" | "games" | "lots";
type Gift = { id: string; name: string; stock: number; threshold: number; active: boolean };
type Lead = { id: string; first: string; last: string; phone: string; city: string; profile: Profile; animals: Species[]; identification: string; onsite: boolean; game: string; score: number; maxScore: number; percentage: number; durationSeconds: number; gift: string; metadata: Record<string, unknown>; createdAt: string; sync: "Synchronise" | "En attente" };
type GameConfig = { id: string; active: boolean; duration: number; difficulty: "facile" | "normal" | "difficile"; frequency: number; rounds: number; sounds: boolean; animations: boolean };
type FormState = { first: string; last: string; phone: string; city: string; profile: Profile; animals: Species[]; identification: string; onsite: boolean };
type Action = { key: string; label: string; kind: "good" | "bad"; points: number; feedback: string };

const speciesImages: Record<Species, string> = {
  Bovins: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Holstein_dairy_cows.jpg/800px-Holstein_dairy_cows.jpg",
  Ovins: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flock_of_sheep.jpg/526px-Flock_of_sheep.jpg",
  Caprins: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Goat.jpg/800px-Goat.jpg",
  Porcins: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Pig_farm_Vampula_9.jpg/800px-Pig_farm_Vampula_9.jpg",
  Volailles: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Free_range_chicken_flock.jpg/800px-Free_range_chicken_flock.jpg",
  Chiens: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/YellowLabradorLooking_new.jpg/800px-YellowLabradorLooking_new.jpg",
  Chats: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Cat_poster_1.jpg/800px-Cat_poster_1.jpg",
  Chevaux: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Nokota_Horses.jpg/800px-Nokota_Horses.jpg"
};
const baseGifts: Gift[] = [
  { id: "pen", name: "Stylo Vet'Tronic", stock: 200, threshold: 45, active: true },
  { id: "cap", name: "Casquette Vet'Tronic", stock: 100, threshold: 65, active: true },
  { id: "shirt", name: "T-shirt Vet'Tronic", stock: 50, threshold: 80, active: true },
  { id: "premium", name: "Lot premium", stock: 20, threshold: 95, active: true }
];
const baseConfig: GameConfig[] = games.map((g) => ({ id: g.id, active: true, duration: g.duration, difficulty: g.difficulty, frequency: g.frequency, rounds: Math.max(3, Math.min(10, g.good.length)), sounds: false, animations: true }));
const emptyForm: FormState = { first: "", last: "", phone: "", city: "", profile: "Eleveur", animals: [], identification: "Je ne sais pas", onsite: false };

function storage<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function hashText(text: string) { return text.split("").reduce((n, c) => n + c.charCodeAt(0), 0); }
function imageFor(species?: Species) { return speciesImages[species || "Bovins"] || speciesImages.Bovins; }
function gameImage(game: GameScenario) { return imageFor(game.species[0]); }
function imageFallback(e: SyntheticEvent<HTMLImageElement>) { const label = e.currentTarget.alt || "Animal"; e.currentTarget.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 520'><rect width='800' height='520' fill='#ecf7ef'/><circle cx='400' cy='210' r='110' fill='#66bb89'/><text x='400' y='390' text-anchor='middle' font-size='44' font-family='Arial' font-weight='700' fill='#0f766e'>${label}</text></svg>`); }

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [step, setStep] = useState(0);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [gifts, setGifts] = useState<Gift[]>(baseGifts);
  const [configs, setConfigs] = useState<GameConfig[]>(baseConfig);
  const [gameId, setGameId] = useState(games[0].id);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("Pret");
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    setLeads(storage("vettronic-leads", [] as Lead[]));
    setGifts(storage("vettronic-gifts", baseGifts));
    setConfigs(storage("vettronic-config", baseConfig));
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const game = useMemo(() => games.find((g) => g.id === gameId) || games[0], [gameId]);
  const config = useMemo(() => configs.find((c) => c.id === game.id) || baseConfig[0], [configs, game.id]);
  const wins = leads.filter((l) => l.gift !== "Participation").length;
  const avg = leads.length ? Math.round(leads.reduce((n, l) => n + l.percentage, 0) / leads.length) : 0;

  function persistGifts(next: Gift[]) { setGifts(next); localStorage.setItem("vettronic-gifts", JSON.stringify(next)); }
  function persistConfig(next: GameConfig[]) { setConfigs(next); localStorage.setItem("vettronic-config", JSON.stringify(next)); }

  function automaticGameId() {
    const scores = new Map<string, number>();
    for (const id of profilePriority[form.profile]) scores.set(id, (scores.get(id) || 0) + 12);
    for (const animal of form.animals) for (const id of animalBonus[animal]) scores.set(id, (scores.get(id) || 0) + 8);
    if (form.onsite) scores.set("scanner", (scores.get("scanner") || 0) + 4);
    if (form.identification === "Non" || form.identification === "Je ne sais pas") scores.set("scanner", (scores.get("scanner") || 0) + 3);
    const active = games.filter((g) => g.profiles.includes(form.profile) && (configs.find((c) => c.id === g.id)?.active ?? true));
    const ranked = active.sort((a, b) => ((scores.get(b.id) || 0) + (configs.find((c) => c.id === b.id)?.frequency || 0)) - ((scores.get(a.id) || 0) + (configs.find((c) => c.id === a.id)?.frequency || 0)));
    const topScore = scores.get(ranked[0]?.id || "") || 0;
    const best = ranked.filter((g) => (scores.get(g.id) || 0) === topScore);
    return (best[hashText(form.first + form.last + form.phone) % Math.max(best.length, 1)] || ranked[0] || games[0]).id;
  }

  function prepareGame() { setGameId(automaticGameId()); setSelected([]); setFeedback("Pret"); setScreen("intro"); }
  function startGame() { setStartedAt(Date.now()); setSelected([]); setFeedback("GO"); setScreen("game"); }
  function tapAction(action: Action) { if (selected.includes(action.key)) return; navigator.vibrate?.(action.kind === "good" ? 25 : 10); setSelected([...selected, action.key]); setFeedback(action.feedback); }

  function actionSet(g: GameScenario): Action[] {
    const good = g.good.map((x, i) => ({ key: "g" + i, label: labelFor(g, x), kind: "good" as const, points: Math.round(g.maxScore / Math.max(g.good.length, 1)), feedback: ["Bien joue", "Identification confirmee", "Bonne piste"][i % 3] }));
    const bad = g.bad.map((x, i) => ({ key: "b" + i, label: labelFor(g, x), kind: "bad" as const, points: -Math.max(3, Math.round(g.maxScore / 12)), feedback: ["Ce n'est pas suffisant", "Verifiez l'identification", "Mauvaise piste"][i % 3] }));
    return [...good, ...bad];
  }

  function labelFor(g: GameScenario, raw: string) {
    if (g.mechanic === "scanner" && raw === "scan confirme") return "Scanner sur la zone active";
    if (g.mechanic === "assign" && raw === "Non certifiable") return "Placer en non certifiable";
    if (g.mechanic === "market" && raw.includes("acheter")) return "Acheter le lot trace";
    if (g.mechanic === "patient" && raw === "diagnostic medical") return "Conclure une cause medicale";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function finishGame() {
    const actions = actionSet(game).filter((a) => selected.includes(a.key));
    const rawScore = actions.reduce((n, a) => n + a.points, 0);
    const completeBonus = game.good.every((_, i) => selected.includes("g" + i)) ? 10 : 0;
    const score = Math.max(0, Math.min(game.maxScore, rawScore + completeBonus));
    const percentage = Math.round((score / game.maxScore) * 100);
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const giftResult = chooseGift(percentage);
    persistGifts(giftResult.nextGifts);
    const lead: Lead = { id: crypto.randomUUID(), ...form, game: game.title, score, maxScore: game.maxScore, percentage, durationSeconds, gift: giftResult.gift, metadata: { gameId: game.id, completed: true, goodActions: selected.filter((x) => x.startsWith("g")).length, errors: selected.filter((x) => x.startsWith("b")).length, mechanic: game.mechanic, difficulty: config.difficulty }, createdAt: new Date().toISOString(), sync: navigator.onLine ? "Synchronise" : "En attente" };
    const nextLeads = [lead, ...leads];
    setLeads(nextLeads);
    localStorage.setItem("vettronic-leads", JSON.stringify(nextLeads));
    setScreen("reward");
  }

  function chooseGift(percentage: number) {
    const available = [...gifts].filter((g) => g.active && g.stock > 0 && percentage >= g.threshold).sort((a, b) => b.threshold - a.threshold)[0];
    if (!available) return { gift: "Participation", nextGifts: gifts };
    return { gift: available.name, nextGifts: gifts.map((g) => (g.id === available.id ? { ...g, stock: Math.max(0, g.stock - 1) } : g)) };
  }

  function exportCsv() {
    const header = "Nom,Telephone,Ville,Profil,Animaux,Identification,Sur site,Jeu auto,Score,Pourcentage,Lot,Duree,Date\n";
    const rows = leads.map((l) => [l.first + " " + l.last, l.phone, l.city, l.profile, l.animals.join(" | "), l.identification, l.onsite ? "Oui" : "Non", l.game, String(l.score), l.percentage + "%", l.gift, l.durationSeconds + "s", l.createdAt].map((x) => `"${x.replaceAll('"', '""')}"`).join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" }));
    a.download = "vettronic-leads.csv";
    a.click();
  }

  function resetParticipant() { setForm(emptyForm); setSelected([]); setStep(0); setScreen("home"); }

  if (screen === "admin") return <main className="min-h-screen bg-field p-4 md:p-6"><Top go={() => setScreen("home")} /><section className="mx-auto max-w-7xl"><HeroTitle label="Administration" title="Pilotage SELAB" text="Les scenarios, profils, durees, frequences et lots sont geres ici. Le participant ne choisit jamais son jeu." /><PhotoStrip /><Tabs tab={tab} setTab={setTab} />{tab === "dashboard" && <><div className="grid grid-cols-4 gap-3 grid2"><Stat k="Participants" v={leads.length} /><Stat k="Lots remis" v={wins} /><Stat k="Score moyen" v={avg + "%"} /><Stat k="Jeux actifs" v={configs.filter((c) => c.active).length} /></div><StockSummary gifts={gifts} /></>}{tab === "leads" && <><button onClick={exportCsv} className="tap mb-4 rounded bg-tech px-5 py-3 font-black text-white">Exporter CSV</button><LeadTable leads={leads} /></>}{tab === "games" && <GameAdmin configs={configs} setConfigs={persistConfig} />}{tab === "lots" && <GiftManager gifts={gifts} setGifts={persistGifts} />}</section></main>;
  if (screen === "intro") return <main className="min-h-screen bg-field p-4 md:p-6"><section className="mx-auto grid max-w-5xl grid-cols-[.9fr_1.1fr] gap-5 grid2"><Img species={game.species[0]} className="h-full min-h-[420px] w-full rounded object-cover shadow" /><div className="grid content-center rounded bg-white p-6 shadow"><img src="/branding/logo.png" alt="Vet'Tronic" className="mb-6 h-20 object-contain" /><p className="font-black text-tech">Mission personnalisee</p><h1 className="mt-2 text-5xl font-black">Mission Vet'Tronic</h1><p className="mt-5 text-xl text-ink/75">{game.intro}</p><p className="mt-4 rounded bg-field p-4 font-bold">{game.mission}</p><button onClick={startGame} className="tap mt-6 rounded bg-tech px-6 py-5 text-2xl font-black text-white">Commencer</button></div></section></main>;
  if (screen === "game") return <GamePlay game={game} feedback={feedback} selected={selected} actions={actionSet(game)} tapAction={tapAction} finish={finishGame} />;
  if (screen === "reward") { const last = leads[0]; return <main className="grid min-h-screen place-items-center bg-field p-5"><section className="max-w-2xl overflow-hidden rounded bg-white text-center shadow"><Img species={game.species[0]} className="h-56 w-full object-cover" /><div className="p-7"><img src="/branding/logo.png" className="mx-auto h-20 object-contain" alt="Vet'Tronic" /><h1 className="mt-4 text-4xl font-black">Bravo {form.first}</h1><p className="mt-3 text-2xl font-black text-tech">Score {last?.percentage}%</p><p className="mt-2 text-xl">Lot : {last?.gift}</p><p className="mt-4 rounded bg-field p-4 font-bold text-tech">{game.teaching}</p>{last?.gift !== "Participation" && <p className="mt-3 rounded bg-leaf/10 p-3 font-bold text-leaf">Stock du lot deduit automatiquement.</p>}<button onClick={resetParticipant} className="tap mt-6 rounded bg-tech px-6 py-4 font-black text-white">Nouveau participant</button></div></section></main>; }
  if (screen === "form") return <FormScreen step={step} setStep={setStep} form={form} setForm={setForm} start={prepareGame} />;
  return <Home start={() => setScreen("form")} admin={() => setScreen("admin")} />;
}

function GamePlay({ game, feedback, selected, actions, tapAction, finish }: { game: GameScenario; feedback: string; selected: string[]; actions: Action[]; tapAction: (a: Action) => void; finish: () => void }) {
  const progress = Math.round((selected.filter((x) => x.startsWith("g")).length / Math.max(game.good.length, 1)) * 100);
  return <main className="min-h-screen bg-field p-4 md:p-6"><section className="mx-auto max-w-6xl"><p className="font-black text-tech">Mission en cours</p><h1 className="mb-3 text-4xl font-black">Mission Vet'Tronic</h1><div className="mb-4 h-4 overflow-hidden rounded bg-white"><div className="h-full bg-tech transition-all" style={{ width: progress + "%" }} /></div><div className="grid grid-cols-[1.1fr_.9fr] gap-5 grid2"><MechanicView game={game} actions={actions} selected={selected} tapAction={tapAction} /><div className="grid gap-3"><p className="rounded bg-ink p-4 font-black text-white">{feedback}</p>{actions.map((a) => <button key={a.key} onClick={() => tapAction(a)} className={`tap rounded border px-4 py-3 text-left font-black ${selected.includes(a.key) ? a.kind === "good" ? "bg-tech text-white" : "bg-amber text-white" : "bg-white"}`}>{a.label}</button>)}<button onClick={finish} className="tap rounded bg-tech py-4 text-xl font-black text-white">Terminer la mission</button></div></div></section></main>;
}

function MechanicView({ game, actions, tapAction }: { game: GameScenario; actions: Action[]; selected: string[]; tapAction: (a: Action) => void }) {
  const firstGood = actions.find((a) => a.kind === "good") || actions[0];
  if (game.mechanic === "assign") return <Panel species={game.species[0]}><div className="absolute inset-x-4 top-4 rounded bg-white/90 p-3 font-black">Touchez un animal puis son exploitation</div><AnimalDots game={game} /><div className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2">{game.destinations?.map((d, i) => <button key={d} onClick={() => tapAction(actions.find((a) => a.label.includes(d)) || actions[Math.min(i, actions.length - 1)])} className="rounded bg-white/95 p-3 font-black shadow">{d}</button>)}</div></Panel>;
  if (["map", "patient", "theft"].includes(game.mechanic)) return <Panel species={game.species[0]}><div className="absolute inset-4 grid grid-cols-2 gap-3">{[...(game.facts || []), ...game.bad].slice(0, 8).map((f, i) => <button key={f} onClick={() => tapAction(actions[i % actions.length])} className="rounded border bg-white/95 p-3 text-left font-black shadow">{f}</button>)}</div>{game.warning && <p className="absolute inset-x-4 bottom-4 rounded bg-amber/90 p-3 text-sm font-black text-white">{game.warning}</p>}</Panel>;
  if (["market", "economy", "veterinary", "memory"].includes(game.mechanic)) return <Panel species={game.species[0]}><div className="absolute inset-x-4 top-4 rounded bg-white/95 p-3 font-black">{game.facts?.[0] || "Comparez, scannez, puis confirmez."}</div><div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-3">{game.animals.map((a, i) => <button key={a.id} onClick={() => tapAction(actions[i % actions.length])} className="rounded bg-white/95 p-2 font-black shadow"><Img species={a.species} className="mb-2 h-24 w-full rounded object-cover" />{a.species}</button>)}</div></Panel>;
  return <Panel species={game.species[0]}><div className="absolute inset-x-4 top-4 rounded bg-white/95 p-3 font-black">Zone de scan virtuelle</div><AnimalDots game={game} /><button onClick={() => tapAction(firstGood)} className="absolute rounded-full bg-tech p-6 font-black text-white shadow" style={{ left: game.animals[0]?.x + "%", top: game.animals[0]?.y + "%" }}>BIP</button><button onClick={() => tapAction(actions.find((a) => a.kind === "bad") || firstGood)} className="absolute bottom-5 right-5 rounded bg-white/95 p-4 font-black shadow">Aucune identification</button></Panel>;
}

function Img({ species, className }: { species: Species; className: string }) { return <img onError={imageFallback} src={imageFor(species)} alt={species} className={className} />; }
function Panel({ species, children }: { species: Species; children: ReactNode }) { return <div className="relative min-h-[520px] overflow-hidden rounded border bg-white shadow"><Img species={species} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/10" />{children}</div>; }
function AnimalDots({ game }: { game: GameScenario }) { return <>{game.animals.map((a) => <div key={a.id} className="absolute rounded-full border-4 border-white bg-tech/90 px-3 py-2 text-sm font-black text-white shadow" style={{ left: a.x + "%", top: a.y + "%" }}>{a.species}<br />{a.identified ? a.electronicId?.slice(-4) : "?"}</div>)}</>; }
function Home({ start, admin }: { start: () => void; admin: () => void }) { return <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbf8,#dff5e7)] p-4 md:p-6"><header className="mx-auto flex max-w-6xl items-center justify-between gap-3"><img src="/branding/logo.png" className="h-24 object-contain" alt="Vet'Tronic" /><button onClick={admin} className="tap rounded border bg-white px-4 font-black text-tech">Admin</button></header><section className="mx-auto grid max-w-6xl grid-cols-[1fr_.9fr] items-center gap-6 py-8 grid2"><div><p className="mb-4 inline-block rounded-full bg-white px-4 py-2 font-bold text-tech">SELAB - mission adaptee au profil - lots a gagner</p><h1 className="hero max-w-3xl text-7xl font-black leading-tight">Relevez le defi Vet'Tronic</h1><p className="mt-5 max-w-2xl text-xl text-ink/70">Le participant renseigne son profil. L'application lance ensuite automatiquement une vraie mini-experience de jeu.</p><button onClick={start} className="tap mt-8 rounded bg-tech px-12 py-5 text-2xl font-black text-white">Jouer</button></div><div className="grid grid-cols-2 gap-3">{speciesList.slice(0, 4).map((s) => <Img key={s} species={s} className="h-48 w-full rounded border bg-white object-cover shadow" />)}</div></section></main>; }
function FormScreen({ step, setStep, form, setForm, start }: { step: number; setStep: (n: number) => void; form: FormState; setForm: (f: FormState) => void; start: () => void }) { const visual = form.animals[0] || (form.profile === "Veterinaire" ? "Chevaux" : form.profile === "Proprietaire animaux" ? "Chiens" : "Bovins"); return <main className="min-h-screen bg-field p-4 md:p-6"><Top go={() => setStep(Math.max(0, step - 1))} /><section className="mx-auto grid max-w-6xl grid-cols-[.9fr_1.1fr] gap-5 grid2"><Img species={visual} className="h-full min-h-[360px] w-full rounded object-cover shadow" /><div className="rounded bg-white p-5 shadow"><h1 className="mb-4 text-3xl font-black">Participation</h1>{step === 0 && <div className="grid gap-3"><Input p="Prenom" v={form.first} f={(v) => setForm({ ...form, first: v })} /><Input p="Nom" v={form.last} f={(v) => setForm({ ...form, last: v })} /><Input p="Telephone" v={form.phone} f={(v) => setForm({ ...form, phone: v })} /><Input p="Ville" v={form.city} f={(v) => setForm({ ...form, city: v })} /><button disabled={!form.first || !form.last || !form.phone || !form.city} onClick={() => setStep(1)} className="tap rounded bg-tech py-4 font-black text-white disabled:opacity-40">Valider</button></div>}{step === 1 && <div><p className="mb-3 font-black">Vous etes principalement :</p><div className="grid gap-2">{profiles.map((p) => <button onClick={() => setForm({ ...form, profile: p })} className={`tap rounded border px-4 py-3 text-left font-black ${form.profile === p ? "bg-tech text-white" : "bg-white"}`} key={p}>{p}</button>)}</div><button onClick={() => setStep(2)} className="tap mt-4 w-full rounded bg-tech py-4 font-black text-white">Continuer</button></div>}{step === 2 && <div><p className="mb-3 font-black">Animaux possedes ou geres :</p><div className="grid grid-cols-2 gap-2">{speciesList.map((a) => <button onClick={() => setForm({ ...form, animals: form.animals.includes(a) ? form.animals.filter((x) => x !== a) : [...form.animals, a] })} className={`tap rounded border px-3 py-3 font-bold ${form.animals.includes(a) ? "bg-tech text-white" : "bg-white"}`} key={a}>{a}</button>)}</div><select value={form.identification} onChange={(e) => setForm({ ...form, identification: e.target.value })} className="tap mt-4 w-full rounded border px-3"><option>Oui, tous</option><option>Oui, en partie</option><option>Non</option><option>Je ne sais pas</option></select><label className="mt-4 flex items-center gap-3 font-bold"><input type="checkbox" checked={form.onsite} onChange={(e) => setForm({ ...form, onsite: e.target.checked })} /> Animal present au SELAB</label><button onClick={start} className="tap mt-4 w-full rounded bg-tech py-4 font-black text-white">Lancer mon defi</button></div>}</div></section></main>; }
function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) { return <div className="mb-5 flex flex-wrap gap-2">{(["dashboard", "leads", "games", "lots"] as Tab[]).map((t) => <button key={t} onClick={() => setTab(t)} className={`tap rounded border px-4 py-2 font-black ${tab === t ? "bg-tech text-white" : "bg-white"}`}>{t === "dashboard" ? "Tableau" : t === "leads" ? "Contacts" : t === "games" ? "Jeux" : "Lots"}</button>)}</div>; }
function Top({ go }: { go: () => void }) { return <button onClick={go} className="mb-5 text-sm font-bold text-tech">Retour</button>; }
function Input({ p, v, f }: { p: string; v: string; f: (v: string) => void }) { return <label className="grid gap-1 font-bold">{p}<input value={v} onChange={(e) => f(e.target.value)} className="tap rounded border px-3" /></label>; }
function Stat({ k, v }: { k: string; v: number | string }) { return <div className="rounded bg-white p-4 shadow"><p className="font-bold text-ink/60">{k}</p><p className="text-3xl font-black text-tech">{v}</p></div>; }
function HeroTitle({ label, title, text }: { label: string; title: string; text: string }) { return <div className="mb-5"><p className="font-black text-tech">{label}</p><h1 className="text-4xl font-black">{title}</h1><p className="mt-2 max-w-2xl text-ink/70">{text}</p></div>; }
function PhotoStrip() { return <div className="mb-5 grid grid-cols-4 gap-3 grid2">{speciesList.slice(4).map((s) => <Img key={s} species={s} className="h-36 w-full rounded object-cover shadow" />)}</div>; }
function StockSummary({ gifts }: { gifts: Gift[] }) { return <div className="mt-5 grid grid-cols-4 gap-3 grid2">{gifts.map((g) => <article key={g.id} className="rounded border bg-white p-4 shadow"><p className="font-black">{g.name}</p><p className="mt-2 text-3xl font-black text-tech">{g.stock}</p><p className="text-sm font-bold text-ink/60">Score min {g.threshold}% - {g.active ? "actif" : "inactif"}</p></article>)}</div>; }
function GameAdmin({ configs, setConfigs }: { configs: GameConfig[]; setConfigs: (c: GameConfig[]) => void }) { function patch(id: string, update: Partial<GameConfig>) { setConfigs(configs.map((c) => c.id === id ? { ...c, ...update } : c)); } return <div className="grid grid-cols-3 gap-4 grid2">{games.map((g) => { const c = configs.find((x) => x.id === g.id) || baseConfig[0]; return <article key={g.id} className="overflow-hidden rounded border bg-white shadow"><Img species={g.species[0]} className="h-40 w-full object-cover" /><div className="p-4"><h2 className="text-xl font-black">{g.title}</h2><p className="mt-2 text-sm text-ink/70">{g.mission}</p><p className="mt-2 text-xs font-bold text-tech">Profils : {g.profiles.join(", ")}</p><label className="mt-3 flex items-center gap-3 font-bold"><input type="checkbox" checked={c.active} onChange={(e) => patch(g.id, { active: e.target.checked })} /> Actif</label><div className="mt-3 grid grid-cols-3 gap-2"><Num label="Duree" value={c.duration} set={(v) => patch(g.id, { duration: v })} /><Num label="Freq." value={c.frequency} set={(v) => patch(g.id, { frequency: v })} /><Num label="Manches" value={c.rounds} set={(v) => patch(g.id, { rounds: v })} /></div><select value={c.difficulty} onChange={(e) => patch(g.id, { difficulty: e.target.value as GameConfig["difficulty"] })} className="tap mt-3 w-full rounded border px-3"><option>facile</option><option>normal</option><option>difficile</option></select></div></article>; })}</div>; }
function Num({ label, value, set }: { label: string; value: number; set: (n: number) => void }) { return <label className="grid gap-1 text-xs font-bold">{label}<input type="number" value={value} onChange={(e) => set(Number(e.target.value))} className="rounded border px-2 py-2" /></label>; }
function LeadTable({ leads }: { leads: Lead[] }) { return <div className="overflow-auto rounded border bg-white"><table className="w-full min-w-[1060px] text-left"><thead className="bg-field"><tr>{["Nom", "Telephone", "Ville", "Profil", "Animaux", "Jeu auto", "Score", "Lot", "Duree", "Sync"].map((h) => <th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{leads.map((l) => <tr className="border-t" key={l.id}><td className="p-3 font-bold">{l.first} {l.last}</td><td className="p-3">{l.phone}</td><td className="p-3">{l.city}</td><td className="p-3">{l.profile}</td><td className="p-3">{l.animals.join(", ")}</td><td className="p-3">{l.game}</td><td className="p-3">{l.percentage}%</td><td className="p-3">{l.gift}</td><td className="p-3">{l.durationSeconds}s</td><td className="p-3">{l.sync}</td></tr>)}</tbody></table>{!leads.length && <p className="p-6 text-center font-bold text-ink/60">Aucun participant pour le moment.</p>}</div>; }
function GiftManager({ gifts, setGifts }: { gifts: Gift[]; setGifts: (g: Gift[]) => void }) { function update(id: string, patch: Partial<Gift>) { setGifts(gifts.map((g) => (g.id === id ? { ...g, ...patch } : g))); } return <div className="grid gap-4"><button onClick={() => setGifts([...gifts, { id: crypto.randomUUID(), name: "Nouveau lot", stock: 10, threshold: 60, active: true }])} className="tap w-fit rounded bg-tech px-5 py-3 font-black text-white">Ajouter un lot</button>{gifts.map((g) => <article key={g.id} className="grid grid-cols-[1.5fr_.7fr_.7fr_.5fr] items-end gap-3 rounded border bg-white p-4 shadow grid2"><label className="grid gap-1 font-bold">Nom du lot<input value={g.name} onChange={(e) => update(g.id, { name: e.target.value })} className="tap rounded border px-3" /></label><label className="grid gap-1 font-bold">Stock restant<input type="number" min={0} value={g.stock} onChange={(e) => update(g.id, { stock: Number(e.target.value) })} className="tap rounded border px-3" /></label><label className="grid gap-1 font-bold">Score min<input type="number" min={0} max={100} value={g.threshold} onChange={(e) => update(g.id, { threshold: Number(e.target.value) })} className="tap rounded border px-3" /></label><label className="flex items-center gap-3 pb-3 font-bold"><input type="checkbox" checked={g.active} onChange={(e) => update(g.id, { active: e.target.checked })} /> Actif</label></article>)}</div>; }
