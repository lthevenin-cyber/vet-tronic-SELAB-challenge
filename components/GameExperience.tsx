"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { farms, featuredAnimals, ownerOf, farmOf, speciesImages, type DemoAnimal, type Species } from "../lib/demo-database";

export type PriorityGameId = "scanner" | "theft" | "patient" | "veterinary" | "herd";

type FinishPayload = { score: number; durationSeconds: number; actions: string[] };
type GameExperienceProps = {
  gameId: PriorityGameId;
  title: string;
  mission: string;
  onFinish: (payload: FinishPayload) => void;
};
type StageProps = {
  stage: number;
  success: (label: string, points?: number) => void;
  error: (label: string) => void;
};

const gameMeta: Record<PriorityGameId, { steps: number; species: Species; objectives: string[] }> = {
  scanner: {
    steps: 4,
    species: "Bovins",
    objectives: ["Localisez la puce avec le lecteur", "Ouvrez le dossier RFID", "Consultez les informations utiles", "Prenez une decision justifiee"]
  },
  theft: {
    steps: 5,
    species: "Bovins",
    objectives: ["Ouvrez le dossier de vol", "Choisissez une zone de controle", "Comparez les numeros proches", "Traitez l'incoherence boucle / puce", "Signalez la correspondance confirmee"]
  },
  patient: {
    steps: 5,
    species: "Bovins",
    objectives: ["Isolez l'indice qui relie le repas au lot", "Remontez la chaine de tracabilite", "Explorez le dossier animal", "Retrouvez les contacts directs", "Formulez une conclusion prudente"]
  },
  veterinary: {
    steps: 4,
    species: "Chiens",
    objectives: ["Scannez les deux patients similaires", "Comparez les identifiants", "Verifiez le bon historique", "Enregistrez l'acte dans le bon dossier"]
  },
  herd: {
    steps: 5,
    species: "Bovins",
    objectives: ["Ouvrez les trois registres", "Classez l'animal 018543", "Classez l'animal 018602", "Classez l'animal 018701", "Traitez l'animal sans identification"]
  }
};

function fallback(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 520'><rect width='800' height='520' fill='#dff5e7'/><circle cx='400' cy='230' r='120' fill='#63bb88'/><text x='400' y='410' text-anchor='middle' font-size='40' font-family='Arial' font-weight='700' fill='#10231f'>Animal SELAB</text></svg>");
}

function AnimalPhoto({ species, className = "" }: { species: Species; className?: string }) {
  return <img src={speciesImages[species]} onError={fallback} alt={species} className={className} draggable={false} />;
}

export default function GameExperience({ gameId, title, mission, onFinish }: GameExperienceProps) {
  const meta = gameMeta[gameId];
  const [stage, setStage] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [countdown, setCountdown] = useState(3);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState("Observez la mission");
  const [popup, setPopup] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [actions, setActions] = useState<string[]>([]);
  const startedAt = useRef(Date.now());
  const audioRef = useRef<AudioContext | null>(null);

  const sound = useCallback((kind: "ok" | "bad" | "finish") => {
    if (!soundOn || typeof window === "undefined") return;
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const context = audioRef.current || new AudioCtor();
    audioRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "bad" ? "sawtooth" : "sine";
    oscillator.frequency.value = kind === "bad" ? 155 : kind === "finish" ? 720 : 520;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (kind === "finish" ? 0.35 : 0.16));
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + (kind === "finish" ? 0.36 : 0.17));
  }, [soundOn]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = window.setTimeout(() => setCountdown((value) => value - 1), 700);
      return () => window.clearTimeout(timer);
    }
    if (countdown === 0) {
      const timer = window.setTimeout(() => {
        startedAt.current = Date.now();
        setCountdown(-1);
        setRunning(true);
        setFeedback(meta.objectives[0]);
      }, 600);
      return () => window.clearTimeout(timer);
    }
  }, [countdown, meta.objectives]);

  useEffect(() => {
    if (!running || completed) return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          setCompleted(true);
          setFeedback("Temps ecoule : consultez votre bilan");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, completed]);

  const success = useCallback((label: string, points = 20) => {
    if (completed) return;
    const nextCombo = combo + 1;
    const gained = Math.min(25, points + Math.min(5, nextCombo - 1));
    const nextStage = stage + 1;
    setScore((value) => Math.min(100, value + gained));
    setCombo(nextCombo);
    setPopup(gained);
    setFeedback(label);
    setActions((value) => [...value, "OK: " + label]);
    navigator.vibrate?.(28);
    sound(nextStage >= meta.steps ? "finish" : "ok");
    window.setTimeout(() => setPopup(null), 650);
    if (nextStage >= meta.steps) {
      setRunning(false);
      setCompleted(true);
    } else {
      setStage(nextStage);
    }
  }, [combo, completed, meta.steps, sound, stage]);

  const error = useCallback((label: string) => {
    if (completed) return;
    setScore((value) => Math.max(0, value - 3));
    setCombo(0);
    setPopup(-3);
    setFeedback(label);
    setActions((value) => [...value, "ERREUR: " + label]);
    navigator.vibrate?.([20, 35, 20]);
    sound("bad");
    window.setTimeout(() => setPopup(null), 650);
  }, [completed, sound]);

  const finish = () => onFinish({ score, durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)), actions });

  return (
    <main className="game-shell min-h-screen bg-field p-3 md:p-5">
      <section className="mx-auto max-w-7xl">
        <GameHUD title={title} score={score} time={timeLeft} progress={stage} total={meta.steps} combo={combo} objective={completed ? "Mission terminee" : meta.objectives[stage]} soundOn={soundOn} toggleSound={() => setSoundOn((value) => !value)} />
        <div className="game-mission"><span>MISSION</span><p>{mission}</p></div>
        <div key={stage} className={`game-stage ${popup && popup < 0 ? "shake" : ""}`}>
          <GameStage gameId={gameId} stage={stage} success={success} error={error} />
          <aside className="feedback-rail" aria-live="polite">
            <div className="feedback-status"><span className="status-dot" />{feedback}</div>
            <FlowTracker current={stage} total={meta.steps} />
            <div className="spectator-card">
              <strong>{meta.objectives[stage] || "Bilan disponible"}</strong>
              <span>Identifiez. Verifiez. Decidez.</span>
            </div>
          </aside>
        </div>
        {popup !== null && <div className={`score-popup ${popup < 0 ? "negative" : ""}`}>{popup > 0 ? "+" : ""}{popup}</div>}
      </section>
      {countdown >= 0 && <CountdownOverlay value={countdown} />}
      {completed && (
        <div className="completion-overlay">
          <div className="completion-panel success-burst">
            <p className="eyebrow">MISSION TERMINEE</p>
            <h2>{stage >= meta.steps - 1 ? "Trace confirmee" : "Temps ecoule"}</h2>
            <div className="completion-score">{score}<small>/100</small></div>
            <p>{feedback}</p>
            <button onClick={finish} className="primary-action">Voir mon resultat</button>
          </div>
        </div>
      )}
    </main>
  );
}

function GameHUD({ title, score, time, progress, total, combo, objective, soundOn, toggleSound }: { title: string; score: number; time: number; progress: number; total: number; combo: number; objective: string; soundOn: boolean; toggleSound: () => void }) {
  const minutes = Math.floor(time / 60).toString().padStart(2, "0");
  const seconds = (time % 60).toString().padStart(2, "0");
  return (
    <header className="game-hud">
      <div className="hud-brand"><img src="/branding/logo.png" alt="Vet'Tronic" /><div><span>DEFI SELAB</span><strong>{title}</strong></div></div>
      <div className="hud-objective"><span>OBJECTIF</span><strong>{objective}</strong></div>
      <div className="hud-metrics">
        <HudMetric label="Score" value={String(score)} />
        <HudMetric label="Temps" value={`${minutes}:${seconds}`} alert={time <= 15} />
        <HudMetric label="Progression" value={`${Math.min(progress, total)}/${total}`} />
        <HudMetric label="Combo" value={`x${Math.max(1, combo)}`} />
        <button className="sound-toggle" onClick={toggleSound} aria-label={soundOn ? "Couper le son" : "Activer le son"} title={soundOn ? "Couper le son" : "Activer le son"}>{soundOn ? "SON ON" : "SON OFF"}</button>
      </div>
    </header>
  );
}

function HudMetric({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return <div className={`hud-metric ${alert ? "hud-alert" : ""}`}><span>{label}</span><strong>{value}</strong></div>;
}

function CountdownOverlay({ value }: { value: number }) {
  return <div className="countdown-overlay"><div className="countdown-pulse">{value === 0 ? "GO !" : value}</div><p>Preparez-vous</p></div>;
}

function FlowTracker({ current, total }: { current: number; total: number }) {
  const labels = ["Probleme", "Action", "Identification", "Information", "Decision", "Lecon"];
  return <div className="flow-tracker">{labels.map((label, index) => <div key={label} className={index <= Math.round((current / Math.max(1, total - 1)) * 5) ? "active" : ""}><span>{index + 1}</span>{label}</div>)}</div>;
}

function GameStage(props: StageProps & { gameId: PriorityGameId }) {
  if (props.gameId === "scanner") return <ScannerGame {...props} />;
  if (props.gameId === "theft") return <TheftGame {...props} />;
  if (props.gameId === "patient") return <PatientGame {...props} />;
  if (props.gameId === "veterinary") return <VeterinaryGame {...props} />;
  return <HerdGame {...props} />;
}

function Scene({ children, aside, className = "" }: { children: ReactNode; aside?: ReactNode; className?: string }) {
  return <section className={`play-scene ${className}`}><div className="scene-main">{children}</div>{aside && <div className="scene-dossier">{aside}</div>}</section>;
}

function ScannerGame({ stage, success, error }: StageProps) {
  const animal = featuredAnimals.scannerIdentified;
  const [signal, setSignal] = useState(1);
  const [visited, setVisited] = useState<string[]>([]);
  if (stage === 0) {
    const scan = (zone: string, strength: number) => {
      setSignal(strength);
      if (zone === "cou") window.setTimeout(() => success("Puce detectee : 384 250 000 018 542"), 420);
      else error("Signal faible : rapprochez le lecteur de l'encolure");
    };
    return <Scene className="scanner-scene" aside={<RFIDDisplay signal={signal} animal={signal === 4 ? animal : undefined} />}><div className="animal-scan-board"><AnimalPhoto species="Bovins" className="scene-photo" /><div className="scan-sweep" /><button style={{ left: "20%", top: "42%" }} onClick={() => scan("flanc", 2)} className="scan-zone">Flanc</button><button style={{ left: "56%", top: "28%" }} onClick={() => scan("cou", 4)} className="scan-zone correct-zone">Encolure</button><button style={{ left: "72%", top: "48%" }} onClick={() => scan("epaule", 3)} className="scan-zone">Epaule</button><button style={{ left: "46%", top: "76%" }} onClick={() => scan("patte", 1)} className="scan-zone">Patte</button><div className="scanner-tool"><span className="scanner-light" /><b>LECTEUR RFID</b><small>Touchez une zone</small></div></div></Scene>;
  }
  if (stage === 1) return <Scene aside={<RFIDDisplay signal={4} animal={animal} />}><DossierCover animal={animal} onOpen={() => success("Dossier RFID ouvert : proprietaire et exploitation retrouves")} /></Scene>;
  if (stage === 2) {
    const tabs = ["Identite", "Sanitaire", "Mouvements"];
    const open = (tab: string) => setVisited((value) => value.includes(tab) ? value : [...value, tab]);
    return <Scene aside={<AnimalRecord animal={animal} active={visited.at(-1) || "Identite"} />}><h2 className="scene-title">Explorez le dossier</h2><p className="scene-lead">Consultez les 3 onglets avant de prendre une decision.</p><div className="record-tabs">{tabs.map((tab) => <button key={tab} onClick={() => open(tab)} className={visited.includes(tab) ? "visited" : ""}>{visited.includes(tab) ? "OK " : ""}{tab}</button>)}</div><button disabled={visited.length < 3} onClick={() => success("Identite, sanitaire et mouvements verifies")} className="primary-action">Valider les informations</button></Scene>;
  }
  return <DecisionScene title="Le dossier est-il exploitable pour confirmer l'identite ?" options={[{ label: "Oui, les donnees concordent", correct: true }, { label: "Oui, le visuel suffit", correct: false }, { label: "Non, sans consulter le numero", correct: false }]} success={() => success("Decision justifiee par l'identifiant unique")} error={error} />;
}

function TheftGame({ stage, success, error }: StageProps) {
  const [selected, setSelected] = useState("");
  if (stage === 0) return <Scene aside={<TheftFile />}><div className="alert-hero"><span className="alert-beacon" /><p>ALERTE BETAIL</p><h2>5 bovins declares voles</h2><strong>Dossier V-2026-0041</strong><button onClick={() => success("Dossier de vol memorise : 018442 a 018446")} className="primary-action">Ouvrir le dossier</button></div></Scene>;
  if (stage === 1) return <Scene aside={<TheftFile compact />}><h2 className="scene-title">Ou controler en premier ?</h2><div className="investigation-map"><div className="map-route" /><MapNode label="Marche A" detail="3 bovins suspects" x="15%" y="30%" onClick={() => success("Marche A ouvert : trois numeros proches a verifier")} /><MapNode label="Route Nord" detail="aucun controle" x="55%" y="16%" onClick={() => error("Aucun animal controle dans cette zone")} /><MapNode label="TR-214" detail="registre disponible" x="70%" y="62%" onClick={() => error("Bonne piste, mais le Marche A est prioritaire")} /><MapNode label="Abattoir" detail="lot deja verifie" x="24%" y="72%" onClick={() => error("Le registre ne contient aucun numero recherche")} /></div></Scene>;
  if (stage === 2) {
    const animals = ["384 250 000 018 454", "384 250 000 018 442", "384 250 000 018 455"];
    return <Scene aside={<TheftFile compact />}><h2 className="scene-title">Scannez et comparez les numeros</h2><div className="candidate-grid">{animals.map((id, index) => <button key={id} onClick={() => setSelected(id)} className={`animal-candidate ${selected === id ? "selected" : ""}`}><AnimalPhoto species="Bovins" /><span>Bovin {index + 1}</span><code>{selected === id ? id : "Scanner"}</code></button>)}</div><button disabled={!selected} onClick={() => selected.endsWith("442") ? success("Correspondance exacte : 018442 retrouve") : error("Numero proche, mais absent du dossier de vol")} className="primary-action">Comparer au dossier</button></Scene>;
  }
  if (stage === 3) return <DecisionScene title="La boucle et la puce ne concordent pas" data={<TagPair visual="CI-018443" electronic="384 250 000 018 493" />} options={[{ label: "Controle necessaire", correct: true }, { label: "Fraude confirmee", correct: false }, { label: "Ignorer l'ecart", correct: false }]} success={() => success("Incoherence signalee sans conclure a une fraude")} error={error} />;
  return <Scene aside={<RecoveredHerd />}><div className="confirmation-target"><AnimalPhoto species="Bovins" /><span className="rfid-ring" /><h2>384 250 000 018 444</h2><p>Correspondance electronique dans le camion TR-214</p><button onClick={() => success("Signalement justifie : identite verifiee lors du controle")} className="danger-action">Signaler la correspondance</button></div></Scene>;
}

function PatientGame({ stage, success, error }: StageProps) {
  const [chain, setChain] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [contacts, setContacts] = useState<string[]>([]);
  if (stage === 0) return <Scene aside={<SimulationNotice />}><h2 className="scene-title">Trouvez l'indice tracable</h2><div className="evidence-grid">{[{ k: "Restaurant", v: "Chez Akissi" }, { k: "Date", v: "24/08/2026" }, { k: "Lot", v: "LOT-BOV-240826-B", good: true }, { k: "Temoignage", v: "imprecis" }].map((item) => <button key={item.k} onClick={() => item.good ? success("Lot retrouve : LOT-BOV-240826-B") : error("Indice utile, mais il ne relie pas encore le produit aux animaux")}><span>{item.k}</span><strong>{item.v}</strong></button>)}</div></Scene>;
  if (stage === 1) {
    const order = ["Restaurant", "Fournisseur", "Abattoir", "Lot", "Animal 018773"];
    const touch = (node: string) => {
      if (node === order[chain.length]) {
        const next = [...chain, node]; setChain(next);
        if (next.length === order.length) success("Chaine reconstituee jusqu'a l'animal 018773");
      } else error("Suivez la chaine dans l'ordre des registres");
    };
    return <Scene aside={<TraceCounter value={chain.length} />}><h2 className="scene-title">Remontez la piste</h2><div className="trace-board">{order.map((node, index) => <button key={node} onClick={() => touch(node)} className={chain.includes(node) ? "active" : ""}><span>{index + 1}</span>{node}</button>)}</div></Scene>;
  }
  if (stage === 2) {
    const tabs = ["Identite", "Deplacements", "Vaccinations", "Traitements", "Controles"];
    const open = (tab: string) => setVisited((value) => value.includes(tab) ? value : [...value, tab]);
    return <Scene aside={<AnimalRecord animal={featuredAnimals.patientAnimal} active={visited.at(-1) || "Identite"} />}><h2 className="scene-title">Dossier 384 250 000 018 773</h2><div className="record-tabs vertical">{tabs.map((tab) => <button key={tab} onClick={() => open(tab)} className={visited.includes(tab) ? "visited" : ""}>{visited.includes(tab) ? "OK " : ""}{tab}</button>)}</div><button disabled={visited.length < tabs.length} onClick={() => success("Anomalie documentaire reperee dans le dossier")} className="primary-action">Retenir l'anomalie</button></Scene>;
  }
  if (stage === 3) {
    const toggle = (id: string) => setContacts((value) => value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
    return <Scene aside={<ContactCounter selected={contacts} />}><h2 className="scene-title">Quels registres revelent les contacts directs ?</h2><div className="contact-network">{[{ id: "market", label: "Marche B", count: 12 }, { id: "truck", label: "Transport TR-331", count: 6 }, { id: "farmC", label: "Ferme C", count: 31 }].map((node) => <button key={node.id} onClick={() => toggle(node.id)} className={contacts.includes(node.id) ? "selected" : ""}><span>{node.count}</span>{node.label}</button>)}</div><button disabled={!contacts.length} onClick={() => contacts.length === 2 && contacts.includes("market") && contacts.includes("truck") ? success("17 contacts uniques retenus apres dedoublonnage") : error("La Ferme C n'apparait pas dans le parcours enregistre")} className="primary-action">Calculer les contacts</button></Scene>;
  }
  return <DecisionScene title="Quelle conclusion transmettre ?" data={<SimulationNotice />} options={[{ label: "Anomalie a verifier", correct: true }, { label: "Cause medicale certaine", correct: false }, { label: "Aucune enquete necessaire", correct: false }]} success={() => success("Piste documentee, sans diagnostic ni conclusion certaine")} error={error} />;
}

function VeterinaryGame({ stage, success, error }: StageProps) {
  const [scanned, setScanned] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [actSelected, setActSelected] = useState(false);
  if (stage === 0) {
    const scan = (id: string) => setScanned((value) => value.includes(id) ? value : [...value, id]);
    return <Scene aside={<TargetId />}><h2 className="scene-title">Deux patients presque identiques</h2><div className="dog-grid">{[{ id: "718", label: "Chien A" }, { id: "781", label: "Chien B" }].map((dog) => <button key={dog.id} onClick={() => scan(dog.id)} className={scanned.includes(dog.id) ? "scanned" : ""}><AnimalPhoto species="Chiens" /><strong>{dog.label}</strong><code>{scanned.includes(dog.id) ? `384 250 000 022 ${dog.id}` : "TOUCHER POUR SCANNER"}</code></button>)}</div><button disabled={scanned.length < 2} onClick={() => success("Les deux patients sont scannes : comparaison possible")} className="primary-action">Comparer les deux lectures</button></Scene>;
  }
  if (stage === 1) return <DecisionScene title="Selectionnez l'identifiant demande" data={<TagPair visual="022718" electronic="022781" neutral />} options={[{ label: "384 250 000 022 781", correct: true }, { label: "384 250 000 022 718", correct: false }]} success={() => success("Patient B confirme par correspondance exacte")} error={error} />;
  if (stage === 2) {
    const tabs = ["Identite", "Vaccinations", "Traitements"];
    const open = (tab: string) => setVisited((value) => value.includes(tab) ? value : [...value, tab]);
    return <Scene aside={<AnimalRecord animal={featuredAnimals.vetDogB} active={visited.at(-1) || "Identite"} />}><h2 className="scene-title">Verifiez le dossier B</h2><div className="record-tabs">{tabs.map((tab) => <button key={tab} onClick={() => open(tab)} className={visited.includes(tab) ? "visited" : ""}>{visited.includes(tab) ? "OK " : ""}{tab}</button>)}</div><button disabled={visited.length < tabs.length} onClick={() => success("Rappel fictif verifie dans le bon historique")} className="primary-action">Preparer l'acte</button></Scene>;
  }
  return <Scene aside={<TargetId />}><h2 className="scene-title">Touchez l'acte, puis le bon dossier</h2><div className="act-transfer"><button onClick={() => setActSelected(true)} className={`medical-act ${actSelected ? "selected" : ""}`}><span>ACTE FICTIF</span><strong>Vaccination - 28/08/2026</strong></button><div className="transfer-arrow">→</div><button onClick={() => actSelected ? success("Acte enregistre sur le dossier 022781") : error("Selectionnez d'abord l'acte a enregistrer")} className="medical-record"><span>DOSSIER</span><strong>384 250 000 022 781</strong></button><button onClick={() => error("Le dossier 022718 appartient a l'autre chien")} className="medical-record muted"><span>DOSSIER</span><strong>384 250 000 022 718</strong></button></div></Scene>;
}

function HerdGame({ stage, success, error }: StageProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [scanned, setScanned] = useState(false);
  const assignments = [
    { id: "384 250 000 018 543", tag: "CI-018543", farm: "Ferme des Lagunes" },
    { id: "384 250 000 018 602", tag: "CI-018602", farm: "Ferme Traore" },
    { id: "384 250 000 018 701", tag: "CI-018701", farm: "Ferme Yao" }
  ];
  if (stage === 0) {
    const registries = [farms[0], farms[6], farms[5]];
    const open = (id: string) => setOpened((value) => value.includes(id) ? value : [...value, id]);
    return <Scene><h2 className="scene-title">Ouvrez les registres des enclos</h2><div className="registry-grid">{registries.map((farm) => <button key={farm.id} onClick={() => open(farm.id)} className={opened.includes(farm.id) ? "open" : ""}><strong>{farm.name}</strong><span>{farm.city}</span><code>{opened.includes(farm.id) ? farm.registryIds.join("\n") : "Toucher pour ouvrir"}</code></button>)}</div><button disabled={opened.length < 3} onClick={() => success("Trois registres ouverts : le tri peut commencer")} className="primary-action">Commencer le tri</button></Scene>;
  }
  if (stage >= 1 && stage <= 3) {
    const animal = assignments[stage - 1];
    return <Scene aside={<PenRegistries />}><h2 className="scene-title">A quel troupeau appartient cet animal ?</h2><div className="herd-animal"><AnimalPhoto species="Bovins" /><button onClick={() => setScanned(true)} className={`scanner-button ${scanned ? "detected" : ""}`}>{scanned ? animal.id : "Scanner la puce"}</button></div><div className="pen-grid">{["Ferme des Lagunes", "Ferme Traore", "Ferme Yao"].map((farm) => <button key={farm} disabled={!scanned} onClick={() => farm === animal.farm ? success(`${animal.tag} rattache a ${farm}`) : error("Ce numero n'apparait pas dans ce registre")}>{farm}<span>ENClos</span></button>)}</div></Scene>;
  }
  return <Scene aside={<PenRegistries />}><h2 className="scene-title">Dernier animal : aucun signal, boucle illisible</h2><div className="unidentified-animal"><AnimalPhoto species="Caprins" /><RFIDDisplay signal={1} /></div><div className="pen-grid"><button onClick={() => error("Aucun registre ne permet de certifier ce proprietaire")}>Ferme des Lagunes</button><button onClick={() => error("Le visuel seul ne suffit pas a certifier le troupeau")}>Ferme Traore</button><button onClick={() => success("Animal place en zone proprietaire non certifiable")}>Proprietaire non certifiable</button></div></Scene>;
}

function DecisionScene({ title, data, options, success, error }: { title: string; data?: ReactNode; options: { label: string; correct: boolean }[]; success: () => void; error: (label: string) => void }) {
  return <Scene aside={data}><h2 className="scene-title">{title}</h2><div className="decision-grid">{options.map((option) => <button key={option.label} onClick={() => option.correct ? success() : error("Cette decision n'est pas justifiee par les donnees")}>{option.label}</button>)}</div></Scene>;
}

function RFIDDisplay({ signal, animal }: { signal: number; animal?: DemoAnimal }) {
  return <div className="rfid-display"><div className="rfid-heading"><span className="rfid-pulse" />LECTEUR RFID</div><SignalBars value={signal} /><p className="rfid-status">{animal ? "LECTURE REUSSIE" : signal > 1 ? "SIGNAL EN APPROCHE" : "RECHERCHE..."}</p><code>{animal?.electronicId || "--- --- --- --- ---"}</code>{animal && <><span>Boucle {animal.visualTag}</span><strong>{ownerOf(animal)?.name}</strong></>}</div>;
}

function SignalBars({ value }: { value: number }) {
  return <div className="signal-bars" aria-label={`Signal ${value} sur 4`}>{[1, 2, 3, 4].map((bar) => <i key={bar} className={bar <= value ? "on" : ""} />)}</div>;
}

function DossierCover({ animal, onOpen }: { animal: DemoAnimal; onOpen: () => void }) {
  return <div className="dossier-cover"><span>DOSSIER ANIMAL</span><h2>{animal.electronicId}</h2><p>{animal.species} {animal.breed}</p><button onClick={onOpen} className="primary-action">Ouvrir le dossier</button></div>;
}

function AnimalRecord({ animal, active }: { animal: DemoAnimal; active: string }) {
  const owner = ownerOf(animal); const farm = farmOf(animal);
  return <div className="animal-record"><AnimalPhoto species={animal.species} /><p className="record-label">{active.toUpperCase()}</p><h3>{animal.electronicId}</h3>{active === "Identite" && <dl><Data label="Boucle" value={animal.visualTag || "Non lisible"} /><Data label="Proprietaire" value={owner?.name || "Non verifie"} /><Data label="Exploitation" value={farm?.name || "Non verifiee"} /></dl>}{active === "Sanitaire" || active === "Vaccinations" || active === "Controles" ? <dl><Data label="Vaccination" value={animal.vaccinations[0]?.status || "Aucune donnee"} /><Data label="Dernier controle" value={animal.sanitaryChecks[0]?.date || "Non renseigne"} /><Data label="Statut" value={animal.sanitaryChecks[0]?.result || "A verifier"} /></dl> : null}{active === "Mouvements" || active === "Deplacements" ? <div className="mini-timeline">{animal.movements.map((move) => <p key={move.date + move.place}><b>{move.date}</b>{move.place}</p>)}</div> : null}{active === "Traitements" ? <dl><Data label="Acte" value={animal.treatments[0]?.name || "Aucun"} /><Data label="Date" value={animal.treatments[0]?.date || "Non renseignee"} /></dl> : null}</div>;
}

function Data({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function TheftFile({ compact = false }: { compact?: boolean }) { const ids = ["018442", "018443", "018444", "018445", "018446"]; return <div className={`theft-file ${compact ? "compact" : ""}`}><span>DOSSIER V-2026-0041</span><h3>Ferme N'Zi</h3><p>M. Koffi N'Guessan</p><div>{ids.map((id) => <code key={id}>{id}</code>)}</div><small>Declaration : 28/08/2026 - 06:45</small></div>; }
function MapNode({ label, detail, x, y, onClick }: { label: string; detail: string; x: string; y: string; onClick: () => void }) { return <button style={{ left: x, top: y }} onClick={onClick} className="map-node"><strong>{label}</strong><span>{detail}</span></button>; }
function TagPair({ visual, electronic, neutral = false }: { visual: string; electronic: string; neutral?: boolean }) { return <div className="tag-pair"><div><span>{neutral ? "CHIEN A" : "BOUCLE"}</span><code>{visual}</code></div><div><span>{neutral ? "CHIEN B" : "PUCE RFID"}</span><code>{electronic}</code></div>{!neutral && <strong>INCOHERENCE - CONTROLE NECESSAIRE</strong>}</div>; }
function RecoveredHerd() { return <div className="recovered-herd"><span>ANIMAUX RECHERCHES</span><div>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= 3 ? "found" : ""} />)}</div><strong>3 / 5 verifies</strong></div>; }
function SimulationNotice() { return <div className="simulation-notice"><span>SIMULATION PEDAGOGIQUE</span><strong>Suspicion et piste a verifier</strong><p>Aucun diagnostic medical n'est pose dans ce jeu.</p></div>; }
function TraceCounter({ value }: { value: number }) { return <div className="trace-counter"><span>PISTE DOCUMENTEE</span><strong>{value}/5</strong><div>{[0, 1, 2, 3, 4].map((n) => <i key={n} className={n < value ? "on" : ""} />)}</div></div>; }
function ContactCounter({ selected }: { selected: string[] }) { const total = selected.includes("market") && selected.includes("truck") ? 17 : selected.includes("market") ? 12 : selected.includes("truck") ? 6 : selected.includes("farmC") ? 31 : 247; return <div className="contact-counter"><span>ANIMAUX A CONTROLER</span><strong>{total}</strong><p>247 → 93 → 31 → {total}</p></div>; }
function TargetId() { return <div className="target-id"><span>PATIENT A TRAITER</span><strong>384 250 000 022 781</strong><p>Berger allemand male - rappel fictif</p></div>; }
function PenRegistries() { return <div className="pen-registries"><h3>Registres ouverts</h3><Data label="Lagunes" value="018542 / 018543 / 018544" /><Data label="Traore" value="018601 / 018602 / 018603" /><Data label="Yao" value="018701 / 018702" /></div>; }


