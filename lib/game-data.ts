export type Profile = "Eleveur" | "Veterinaire" | "Proprietaire animaux" | "Professionnel animal" | "Institution" | "Etudiant" | "Visiteur";
export type Species = "Bovins" | "Ovins" | "Caprins" | "Porcins" | "Volailles" | "Chiens" | "Chats" | "Chevaux";
export type Mechanic = "scanner" | "investigation" | "assign" | "map" | "market" | "economy" | "veterinary" | "memory" | "micro" | "theft" | "patient";

export type AnimalScenario = {
  id: string;
  species: Species;
  visualTag?: string;
  electronicId?: string;
  owner?: string;
  farm?: string;
  identified: boolean;
  status?: string;
  x: number;
  y: number;
  image: string;
};

export type GameScenario = {
  id: string;
  title: string;
  intro: string;
  mission: string;
  mechanic: Mechanic;
  profiles: Profile[];
  species: Species[];
  duration: number;
  maxScore: number;
  frequency: number;
  difficulty: "facile" | "normal" | "difficile";
  image: string;
  teaching: string;
  warning?: string;
  animals: AnimalScenario[];
  good: string[];
  bad: string[];
  destinations?: string[];
  facts?: string[];
};

export const profiles: Profile[] = ["Eleveur", "Veterinaire", "Proprietaire animaux", "Professionnel animal", "Institution", "Etudiant", "Visiteur"];
export const speciesList: Species[] = ["Bovins", "Ovins", "Caprins", "Porcins", "Volailles", "Chiens", "Chats", "Chevaux"];
export const animalImages: Record<Species, string> = {
  Bovins: "https://commons.wikimedia.org/wiki/Special:FilePath/Holstein%20dairy%20cows.jpg",
  Ovins: "https://commons.wikimedia.org/wiki/Special:FilePath/Flock%20of%20sheep.jpg",
  Caprins: "https://commons.wikimedia.org/wiki/Special:FilePath/Goat.jpg",
  Porcins: "https://commons.wikimedia.org/wiki/Special:FilePath/Pig%20farm%20Vampula%209.jpg",
  Volailles: "https://commons.wikimedia.org/wiki/Special:FilePath/Free%20range%20chicken%20flock.jpg",
  Chiens: "https://commons.wikimedia.org/wiki/Special:FilePath/YellowLabradorLooking_new.jpg",
  Chats: "https://commons.wikimedia.org/wiki/Special:FilePath/Cat%20poster%201.jpg",
  Chevaux: "https://commons.wikimedia.org/wiki/Special:FilePath/Nokota%20Horses.jpg"
};
const allProfiles = profiles;

export const games: GameScenario[] = [
  {
    id: "scanner",
    title: "Mission scanner",
    intro: "Identifiez le plus d'animaux possible avant la fin du chrono.",
    mission: "Touchez la bonne zone de scan. Si l'animal n'a pas d'identifiant, declarez-le seulement apres verification.",
    mechanic: "scanner",
    profiles: allProfiles,
    species: ["Bovins", "Ovins", "Caprins", "Chevaux", "Chiens", "Chats"],
    duration: 70,
    maxScore: 100,
    frequency: 8,
    difficulty: "normal",
    image: animalImages.Bovins,
    teaching: "Sans identification, certains animaux restent impossibles a tracer.",
    animals: [
      { id: "animal_001", species: "Bovins", visualTag: "BV-204", electronicId: "384000000001245", owner: "Koffi N'Guessan", farm: "Bouake", identified: true, x: 58, y: 42, image: animalImages.Bovins },
      { id: "animal_002", species: "Caprins", visualTag: "CP-118", owner: "Awa Kone", farm: "Korhogo", identified: false, x: 28, y: 55, image: animalImages.Caprins },
      { id: "animal_003", species: "Chiens", visualTag: "COL-BLEU", electronicId: "384000000004411", owner: "Mariam Dao", farm: "Abidjan", identified: true, x: 46, y: 36, image: animalImages.Chiens }
    ],
    good: ["scan confirme", "declarer non identifie"],
    bad: ["faux non identifie"]
  },
  {
    id: "lost-owner",
    title: "Retrouve mon proprietaire",
    intro: "Un animal a ete retrouve. Pouvez-vous retrouver son veritable proprietaire ?",
    mission: "Construisez l'enquete : les indices visuels aident, mais seul l'identifiant confirme.",
    mechanic: "investigation",
    profiles: ["Proprietaire animaux", "Veterinaire", "Etudiant", "Visiteur"],
    species: ["Chiens", "Chats"],
    duration: 90,
    maxScore: 100,
    frequency: 9,
    difficulty: "normal",
    image: animalImages.Chiens,
    teaching: "Reconnaitre un animal ne permet pas toujours de prouver son identite.",
    animals: [{ id: "animal_010", species: "Chiens", electronicId: "384000000009900", owner: "Awa Kone", identified: true, x: 47, y: 35, image: animalImages.Chiens }],
    good: ["examiner le collier", "rechercher une identification", "scanner la puce", "consulter le dossier", "choisir Awa Kone"],
    bad: ["choisir sans preuve", "choisir mauvais proprietaire"],
    facts: ["Collier bleu sans nom lisible", "Trois personnes pensent reconnaitre l'animal", "ID 384000000009900", "Proprietaire enregistre : Awa Kone"]
  },
  {
    id: "herd",
    title: "A qui appartient ce troupeau ?",
    intro: "Trois troupeaux se sont melanges. Rendez chaque animal a son veritable proprietaire.",
    mission: "Touchez un animal, scannez si besoin, puis touchez la bonne exploitation.",
    mechanic: "assign",
    profiles: ["Eleveur"],
    species: ["Bovins", "Ovins", "Caprins"],
    duration: 100,
    maxScore: 100,
    frequency: 10,
    difficulty: "normal",
    image: animalImages.Ovins,
    teaching: "Identifier son troupeau, c'est proteger son patrimoine.",
    animals: [
      { id: "animal_020", species: "Bovins", visualTag: "R-14", electronicId: "384000000020014", owner: "Ferme Kouassi", identified: true, status: "identified", x: 25, y: 38, image: animalImages.Bovins },
      { id: "animal_021", species: "Ovins", visualTag: "illisible", electronicId: "384000000020021", owner: "Ferme Yao", identified: true, status: "unreadable_tag", x: 58, y: 44, image: animalImages.Ovins },
      { id: "animal_022", species: "Caprins", visualTag: "absente", identified: false, status: "unidentified", x: 75, y: 52, image: animalImages.Caprins }
    ],
    destinations: ["Ferme Kouassi", "Ferme Yao", "Ferme Traore", "Non certifiable"],
    good: ["Ferme Kouassi", "Ferme Yao", "Non certifiable"],
    bad: ["mauvaise exploitation"]
  },
  {
    id: "epidemic",
    title: "Stop a l'epidemie",
    intro: "Alerte sanitaire fictive : un animal potentiellement concerne vient d'etre detecte.",
    mission: "Touchez les lieux relies au parcours pour reduire le nombre d'animaux a controler.",
    mechanic: "map",
    profiles: ["Eleveur", "Veterinaire", "Institution", "Professionnel animal"],
    species: ["Bovins", "Ovins", "Porcins", "Volailles"],
    duration: 90,
    maxScore: 100,
    frequency: 8,
    difficulty: "normal",
    image: animalImages.Volailles,
    teaching: "L'identification permet d'agir rapidement lors d'une crise sanitaire.",
    animals: [{ id: "animal_030", species: "Bovins", electronicId: "384000000001245", owner: "Ferme A", identified: true, x: 50, y: 40, image: animalImages.Bovins }],
    good: ["Marche central", "Transport camion 14", "Ferme B", "Contacts animaux"],
    bad: ["Point d'eau", "Ferme C"],
    facts: ["247 animaux potentiellement concernes", "88 apres marche", "31 apres transport", "18 contacts precis a controler"]
  },
  {
    id: "market",
    title: "Le marche aux animaux",
    intro: "Vous disposez de 1 000 000 FCFA. Constituez le meilleur lot.",
    mission: "Achetez des animaux en respectant le budget et en verifiant leur tracabilite.",
    mechanic: "market",
    profiles: ["Eleveur", "Professionnel animal"],
    species: ["Bovins", "Ovins", "Caprins", "Porcins"],
    duration: 100,
    maxScore: 100,
    frequency: 7,
    difficulty: "normal",
    image: animalImages.Bovins,
    teaching: "L'identification apporte de la confiance et de la valeur aux transactions.",
    animals: [
      { id: "animal_040", species: "Bovins", electronicId: "384000000040001", owner: "Ferme Nord", identified: true, x: 30, y: 40, image: animalImages.Bovins },
      { id: "animal_041", species: "Ovins", identified: false, x: 60, y: 40, image: animalImages.Ovins },
      { id: "animal_042", species: "Caprins", electronicId: "384000000040003", owner: "Ferme Sud", identified: true, x: 50, y: 52, image: animalImages.Caprins }
    ],
    good: ["verifier identite", "acheter animal trace", "respecter budget"],
    bad: ["achat sans historique", "budget depasse"],
    facts: ["Budget : 1 000 000 FCFA", "Origine connue", "Historique disponible", "Niveau d'information plus faible"]
  },
  {
    id: "farm",
    title: "Sauve ton elevage",
    intro: "Vous gerez un elevage de 20 bovins. Protegez votre patrimoine pendant une annee.",
    mission: "Reagissez a 5 evenements : fuite, melange, vente, alerte sanitaire et vol.",
    mechanic: "economy",
    profiles: ["Eleveur"],
    species: ["Bovins"],
    duration: 100,
    maxScore: 100,
    frequency: 9,
    difficulty: "normal",
    image: animalImages.Bovins,
    teaching: "L'identification protege votre capital.",
    animals: [{ id: "animal_050", species: "Bovins", electronicId: "384000000050001", owner: "Votre elevage", farm: "Bouake", identified: true, x: 48, y: 45, image: animalImages.Bovins }],
    good: ["consulter identification", "retrouver ses animaux", "fournir origine", "retrouver contacts", "prouver propriete"],
    bad: ["chercher seulement visuellement", "ignorer", "vendre sans preuve"],
    facts: ["Patrimoine initial : 5 000 000 FCFA", "Pertes evitees grace a la tracabilite", "Simulation pedagogique"]
  },
  {
    id: "veterinary",
    title: "Mission veterinaire",
    intro: "Vous etes veterinaire. Associez chaque animal au bon dossier.",
    mission: "Scannez avant de choisir le dossier et d'enregistrer l'acte.",
    mechanic: "veterinary",
    profiles: ["Veterinaire", "Etudiant"],
    species: ["Chiens", "Bovins", "Chevaux"],
    duration: 90,
    maxScore: 100,
    frequency: 10,
    difficulty: "normal",
    image: animalImages.Chevaux,
    teaching: "L'identification securise le suivi medical et sanitaire.",
    animals: [
      { id: "animal_060", species: "Chiens", electronicId: "384000000060001", owner: "Dossier A", identified: true, x: 35, y: 38, image: animalImages.Chiens },
      { id: "animal_061", species: "Bovins", electronicId: "384000000060002", owner: "Dossier B", identified: true, x: 55, y: 45, image: animalImages.Bovins },
      { id: "animal_062", species: "Chevaux", electronicId: "384000000060003", owner: "Dossier C", identified: true, x: 50, y: 40, image: animalImages.Chevaux }
    ],
    good: ["scanner patient", "ouvrir dossier", "verifier numero", "associer dossier", "enregistrer acte"],
    bad: ["mauvais dossier"]
  },
  {
    id: "who-am-i",
    title: "Qui suis-je ?",
    intro: "Memorisez bien cet animal, puis retrouvez-le parmi des animaux proches.",
    mission: "Choisissez visuellement, puis confirmez par identification.",
    mechanic: "memory",
    profiles: allProfiles,
    species: ["Bovins", "Chiens", "Ovins"],
    duration: 80,
    maxScore: 100,
    frequency: 7,
    difficulty: "normal",
    image: animalImages.Chiens,
    teaching: "Vous pouvez reconnaitre un animal. Pouvez-vous prouver son identite ?",
    animals: [
      { id: "animal_070", species: "Chiens", electronicId: "384000000070001", owner: "Cible", identified: true, x: 46, y: 42, image: animalImages.Chiens },
      { id: "animal_071", species: "Chiens", electronicId: "384000000070002", owner: "Leurre", identified: true, x: 42, y: 42, image: animalImages.Chiens },
      { id: "animal_072", species: "Ovins", electronicId: "384000000070003", owner: "Leurre", identified: true, x: 42, y: 42, image: animalImages.Ovins }
    ],
    good: ["choisir cible", "utiliser scanner", "confirmer identifiant"],
    bad: ["confirmer visuellement sans preuve"]
  },
  {
    id: "challenge",
    title: "Defi identification",
    intro: "Une suite rapide de micro-epreuves sur la tracabilite animale.",
    mission: "Repondez aux micro-missions : scanner, associer, retrouver un trajet, verifier un dossier.",
    mechanic: "micro",
    profiles: allProfiles,
    species: speciesList,
    duration: 75,
    maxScore: 100,
    frequency: 5,
    difficulty: "normal",
    image: animalImages.Caprins,
    teaching: "Chaque preuve d'identite renforce la chaine de confiance.",
    animals: [{ id: "animal_080", species: "Caprins", electronicId: "384000000080327", owner: "Ferme Traore", identified: true, x: 49, y: 45, image: animalImages.Caprins }],
    good: ["scanner", "associer", "retrouver 327", "bon trajet", "bon dossier"],
    bad: ["mauvaise association"]
  },
  {
    id: "cattle-theft",
    title: "Alerte betail : vol de troupeau",
    intro: "Cinq bovins ont ete voles cette nuit. Retrouvez-les avant qu'ils ne disparaissent.",
    mission: "Explorez les lieux, scannez les animaux suspects et signalez seulement les identites confirmees.",
    mechanic: "theft",
    profiles: ["Eleveur", "Institution", "Professionnel animal", "Veterinaire"],
    species: ["Bovins"],
    duration: 90,
    maxScore: 100,
    frequency: 8,
    difficulty: "normal",
    image: animalImages.Bovins,
    teaching: "Identifier, c'est aussi proteger son troupeau contre le vol.",
    warning: "Simulation pedagogique : une ressemblance n'est pas une preuve formelle.",
    animals: [
      { id: "animal_090", species: "Bovins", visualTag: "384-111", electronicId: "384000000090998", owner: "Kouassi Yao", identified: true, status: "incoherence", x: 35, y: 42, image: animalImages.Bovins },
      { id: "animal_091", species: "Bovins", visualTag: "384-222", electronicId: "384000000090222", owner: "Kouassi Yao", identified: true, status: "vole", x: 62, y: 48, image: animalImages.Bovins }
    ],
    good: ["ouvrir dossier recherches", "scanner electronique", "detecter incoherence", "signaler animal vole"],
    bad: ["signaler leurre", "preuve seulement visuelle"],
    facts: ["Exploitation d'origine", "Point de controle", "Marche A", "Abattoir", "Valeur recuperee fictive : 2 400 000 FCFA"]
  },
  {
    id: "patient-zero",
    title: "Patient zero : enquete Vet'Tronic",
    intro: "Une origine animale est suspectee. Remontez la piste sans poser de diagnostic.",
    mission: "Selectionnez les indices utiles, reconstruisez la chaine, identifiez l'animal et les contacts.",
    mechanic: "patient",
    profiles: ["Veterinaire", "Institution", "Eleveur", "Professionnel animal"],
    species: ["Bovins", "Volailles", "Porcins"],
    duration: 120,
    maxScore: 100,
    frequency: 8,
    difficulty: "normal",
    image: animalImages.Bovins,
    teaching: "L'identification et la tracabilite facilitent les enquetes sanitaires.",
    warning: "Scenario fictif a vocation pedagogique. Il signale une piste, jamais une cause medicale certaine.",
    animals: [{ id: "animal_100", species: "Bovins", electronicId: "384000000100001", owner: "Ferme Bouake", identified: true, status: "anomalie documentaire", x: 50, y: 44, image: animalImages.Bovins }],
    good: ["marche central", "restaurant", "fournisseur", "abattoir", "exploitation", "animal source", "anomalie a verifier", "contacts exposes"],
    bad: ["il pleuvait", "diagnostic medical"],
    facts: ["Patient", "Restaurant", "Fournisseur", "Abattoir", "Marche", "Exploitation", "Animal", "17 contacts potentiels"]
  }
];

export const profilePriority: Record<Profile, string[]> = {
  Eleveur: ["herd", "farm", "cattle-theft", "market", "epidemic", "scanner"],
  Veterinaire: ["veterinary", "patient-zero", "epidemic", "lost-owner", "scanner"],
  "Proprietaire animaux": ["lost-owner", "who-am-i", "scanner"],
  "Professionnel animal": ["market", "epidemic", "cattle-theft", "patient-zero", "scanner"],
  Institution: ["patient-zero", "epidemic", "cattle-theft", "scanner"],
  Etudiant: ["veterinary", "who-am-i", "lost-owner", "challenge"],
  Visiteur: ["who-am-i", "lost-owner", "challenge", "scanner"]
};
export const animalBonus: Record<Species, string[]> = {
  Bovins: ["cattle-theft", "herd", "farm", "market", "patient-zero"],
  Ovins: ["herd", "epidemic", "who-am-i"],
  Caprins: ["herd", "farm", "challenge"],
  Porcins: ["epidemic", "market", "patient-zero"],
  Volailles: ["epidemic", "patient-zero"],
  Chiens: ["lost-owner", "veterinary", "who-am-i"],
  Chats: ["lost-owner", "who-am-i"],
  Chevaux: ["veterinary", "scanner"]
};
