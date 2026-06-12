/**
 * Synthetic data service — the single source of truth for the prototype.
 *
 * In a production build, this module would be replaced by real API calls
 * (API-Football, Guardian, Reddit). For the prototype, all data is hand-crafted
 * here so the app runs fully offline without any API keys.
 *
 * Adding a real team is as simple as adding an entry to TEAMS below.
 */

// ─── 48 WC26 TEAMS ──────────────────────────────────────────────────────────
const TEAMS = {
  // GROUP A
  USA: {
    code:'USA', name:'USA', flag:'🇺🇸', group:'A',
    primary:'#0A3161', secondary:'#FFFFFF', accent:'#B31942',
    rank:11, rating:80, form:['W','D','W','L','W'],
    nickname:'Stars & Stripes', coach:'Mauricio Pochettino', titles:0, sentiment:82,
    players:[
      {n:'C. Pulisic',   pos:'LW',  num:10, ovr:84, pac:86, sho:81, pas:82, dri:87, def:46, phy:68, health:92, age:27},
      {n:'J. Bellingham',pos:'CAM', num:8,  ovr:82, pac:78, sho:79, pas:80, dri:83, def:68, phy:76, health:90, age:24},
      {n:'T. Adams',     pos:'CDM', num:4,  ovr:80, pac:80, sho:64, pas:76, dri:76, def:82, phy:82, health:88, age:27},
      {n:'M. Turner',    pos:'GK',  num:1,  ovr:78, pac:54, sho:24, pas:70, dri:58, def:80, phy:80, health:90, age:31},
      {n:'Y. Musah',     pos:'CM',  num:6,  ovr:79, pac:84, sho:68, pas:78, dri:82, def:76, phy:80, health:93, age:23},
      {n:'S. Dest',      pos:'RB',  num:2,  ovr:79, pac:86, sho:64, pas:78, dri:82, def:74, phy:72, health:84, age:25},
      {n:'C. Richards',  pos:'CB',  num:3,  ovr:79, pac:82, sho:40, pas:70, dri:68, def:80, phy:84, health:91, age:25},
      {n:'T. Ream',      pos:'CB',  num:13, ovr:76, pac:64, sho:38, pas:74, dri:66, def:80, phy:78, health:80, age:38},
      {n:'A. Robinson',  pos:'LB',  num:5,  ovr:79, pac:88, sho:56, pas:74, dri:78, def:76, phy:76, health:92, age:28},
      {n:'G. Reyna',     pos:'CAM', num:7,  ovr:80, pac:82, sho:78, pas:82, dri:86, def:50, phy:66, health:78, age:23},
      {n:'F. Balogun',   pos:'ST',  num:9,  ovr:79, pac:88, sho:80, pas:72, dri:80, def:40, phy:78, health:90, age:24},
    ],
    subs:[
      {n:'R. Aaronson', pos:'CAM', num:11, ovr:77, pac:84, sho:74, pas:78, dri:82, def:48, phy:66, health:92, age:25},
      {n:'J. Sargent',  pos:'ST',  num:19, ovr:77, pac:82, sho:78, pas:70, dri:76, def:42, phy:80, health:90, age:26},
      {n:'T. Tillman',  pos:'CM',  num:18, ovr:76, pac:80, sho:72, pas:78, dri:80, def:70, phy:78, health:91, age:26},
    ],
  },
  ENG: {
    code:'ENG', name:'England', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', group:'A',
    primary:'#FFFFFF', secondary:'#CE1124', accent:'#1E3A8A',
    rank:4, rating:86, form:['W','W','D','W','W'],
    nickname:'Three Lions', coach:'Thomas Tuchel', titles:1, sentiment:73,
    players:[
      {n:'J. Bellingham', pos:'CAM', num:10, ovr:89, pac:82, sho:85, pas:86, dri:88, def:70, phy:84, health:95, age:22},
      {n:'H. Kane',       pos:'ST',  num:9,  ovr:90, pac:70, sho:93, pas:84, dri:82, def:48, phy:84, health:94, age:32},
      {n:'J. Pickford',   pos:'GK',  num:1,  ovr:84, pac:58, sho:25, pas:76, dri:62, def:85, phy:80, health:93, age:32},
      {n:'D. Rice',       pos:'CDM', num:4,  ovr:87, pac:78, sho:72, pas:82, dri:80, def:86, phy:86, health:96, age:27},
      {n:'B. Saka',       pos:'RW',  num:7,  ovr:87, pac:89, sho:82, pas:83, dri:89, def:50, phy:72, health:92, age:24},
      {n:'P. Foden',      pos:'LW',  num:11, ovr:87, pac:84, sho:82, pas:85, dri:90, def:48, phy:66, health:90, age:25},
      {n:'J. Stones',     pos:'CB',  num:5,  ovr:84, pac:76, sho:50, pas:82, dri:78, def:85, phy:80, health:86, age:31},
      {n:'M. Guéhi',      pos:'CB',  num:6,  ovr:82, pac:82, sho:40, pas:72, dri:70, def:83, phy:82, health:93, age:25},
      {n:'T. Alexander-A.',pos:'RB', num:12, ovr:84, pac:80, sho:72, pas:88, dri:80, def:76, phy:76, health:90, age:27},
      {n:'L. Shaw',       pos:'LB',  num:3,  ovr:81, pac:80, sho:58, pas:80, dri:78, def:80, phy:80, health:82, age:30},
      {n:'C. Palmer',     pos:'CAM', num:24, ovr:85, pac:80, sho:84, pas:84, dri:87, def:52, phy:74, health:94, age:23},
    ],
    subs:[
      {n:'O. Watkins',  pos:'ST',  num:18, ovr:83, pac:88, sho:83, pas:74, dri:80, def:42, phy:80, health:92, age:30},
      {n:'J. Gordon',   pos:'LW',  num:17, ovr:81, pac:92, sho:76, pas:76, dri:84, def:44, phy:70, health:93, age:25},
      {n:'K. Phillips', pos:'CM',  num:14, ovr:79, pac:70, sho:70, pas:80, dri:76, def:80, phy:82, health:88, age:30},
    ],
  },
  CAN: {
    code:'CAN', name:'Canada', flag:'🇨🇦', group:'A',
    primary:'#FF0000', secondary:'#FFFFFF', accent:'#8B0000',
    rank:49, rating:73, form:['L','W','W','D','W'],
    nickname:'Les Rouges', coach:'Jesse Marsch', titles:0, sentiment:72,
    players:[
      {n:'A. Davies',    pos:'LB', num:3,  ovr:84, pac:96, sho:65, pas:79, dri:84, def:76, phy:74, health:94, age:24},
      {n:'J. David',     pos:'ST', num:9,  ovr:82, pac:88, sho:84, pas:72, dri:82, def:36, phy:72, health:92, age:25},
      {n:'M. Johnston',  pos:'RW', num:7,  ovr:77, pac:90, sho:74, pas:74, dri:82, def:38, phy:68, health:90, age:23},
      {n:'I. Cornelius', pos:'GK', num:1,  ovr:76, pac:52, sho:22, pas:66, dri:54, def:78, phy:76, health:88, age:27},
      {n:'T. Buchanan',  pos:'CB', num:4,  ovr:76, pac:78, sho:38, pas:68, dri:66, def:78, phy:80, health:88, age:26},
      {n:'K. Miller',    pos:'CM', num:6,  ovr:74, pac:74, sho:68, pas:76, dri:74, def:72, phy:76, health:86, age:24},
      {n:'M. Larin',     pos:'ST', num:11, ovr:73, pac:80, sho:76, pas:66, dri:74, def:38, phy:76, health:84, age:30},
      {n:'S. Piette',    pos:'CDM',num:8,  ovr:73, pac:70, sho:60, pas:74, dri:70, def:78, phy:80, health:86, age:33},
      {n:'D. Hutchinson',pos:'RB', num:2,  ovr:74, pac:80, sho:56, pas:70, dri:72, def:74, phy:72, health:90, age:26},
      {n:'A. Laryea',    pos:'CB', num:14, ovr:72, pac:76, sho:36, pas:66, dri:62, def:76, phy:76, health:88, age:30},
      {n:'W. Eustaquio', pos:'CM', num:10, ovr:78, pac:76, sho:72, pas:80, dri:78, def:70, phy:74, health:88, age:28},
    ],
    subs:[
      {n:'C. Laryea',   pos:'RB', num:15, ovr:72, pac:84, sho:54, pas:70, dri:76, def:72, phy:70, health:90, age:30},
      {n:'L. Hoilett',  pos:'LW', num:17, ovr:70, pac:82, sho:68, pas:72, dri:78, def:42, phy:68, health:86, age:35},
      {n:'A. Ugbo',     pos:'ST', num:19, ovr:72, pac:82, sho:74, pas:64, dri:72, def:36, phy:74, health:90, age:26},
    ],
  },
  PAN: {
    code:'PAN', name:'Panama', flag:'🇵🇦', group:'A',
    primary:'#D01016', secondary:'#FFFFFF', accent:'#003580',
    rank:63, rating:68, form:['D','L','W','D','L'],
    nickname:'Los Canaleros', coach:'Thomas Christiansen', titles:0, sentiment:65,
    players:[
      {n:'R. Fong',    pos:'GK', num:1,  ovr:72, pac:50, sho:20, pas:64, dri:52, def:74, phy:74, health:88, age:32},
      {n:'A. Murillo', pos:'CB', num:3,  ovr:70, pac:70, sho:36, pas:64, dri:60, def:74, phy:78, health:86, age:28},
      {n:'C. Davis',   pos:'CB', num:4,  ovr:68, pac:68, sho:34, pas:62, dri:58, def:72, phy:76, health:84, age:26},
      {n:'R. Miller',  pos:'ST', num:9,  ovr:70, pac:78, sho:72, pas:62, dri:70, def:34, phy:72, health:86, age:28},
      {n:'J. Córdoba', pos:'RW', num:11, ovr:68, pac:80, sho:68, pas:66, dri:72, def:36, phy:66, health:84, age:26},
      {n:'A. Godoy',   pos:'CM', num:6,  ovr:66, pac:68, sho:60, pas:70, dri:66, def:68, phy:72, health:82, age:30},
      {n:'A. Mena',    pos:'LB', num:5,  ovr:66, pac:76, sho:52, pas:66, dri:68, def:68, phy:68, health:84, age:28},
      {n:'F. Archibold',pos:'RB',num:2,  ovr:66, pac:78, sho:50, pas:64, dri:66, def:68, phy:70, health:82, age:30},
      {n:'J. Arroyo',  pos:'CM', num:8,  ovr:64, pac:66, sho:58, pas:68, dri:64, def:66, phy:68, health:80, age:28},
      {n:'R. Torres',  pos:'CDM',num:17, ovr:65, pac:62, sho:54, pas:66, dri:60, def:72, phy:74, health:82, age:32},
      {n:'M. Mosquera',pos:'LW', num:7,  ovr:65, pac:78, sho:64, pas:62, dri:68, def:34, phy:62, health:82, age:26},
    ],
    subs:[
      {n:'E. Davis',   pos:'ST', num:19, ovr:65, pac:76, sho:68, pas:58, dri:66, def:34, phy:70, health:84, age:24},
      {n:'J. Quintero',pos:'CM', num:14, ovr:63, pac:64, sho:56, pas:66, dri:62, def:64, phy:68, health:82, age:28},
      {n:'J. Urrutia', pos:'LW', num:20, ovr:62, pac:74, sho:62, pas:60, dri:64, def:32, phy:62, health:80, age:24},
    ],
  },
  // GROUP B
  ESP: {
    code:'ESP', name:'Spain', flag:'🇪🇸', group:'B',
    primary:'#C60B1E', secondary:'#FFC400', accent:'#1E3A8A',
    rank:5, rating:87, form:['W','W','W','W','D'],
    nickname:'La Roja', coach:'Luis de la Fuente', titles:1, sentiment:88,
    players:[
      {n:'Lamine Yamal',pos:'RW',  num:19, ovr:88, pac:90, sho:82, pas:85, dri:92, def:40, phy:64, health:96, age:18},
      {n:'Pedri',       pos:'CM',  num:8,  ovr:87, pac:76, sho:76, pas:88, dri:88, def:70, phy:72, health:90, age:23},
      {n:'Gavi',        pos:'CM',  num:9,  ovr:84, pac:80, sho:74, pas:84, dri:86, def:74, phy:76, health:88, age:21},
      {n:'Unai Simón',  pos:'GK',  num:23, ovr:85, pac:56, sho:25, pas:76, dri:62, def:86, phy:84, health:92, age:28},
      {n:'Rodri',       pos:'CDM', num:16, ovr:90, pac:72, sho:78, pas:86, dri:82, def:88, phy:86, health:89, age:29},
      {n:'Nico Williams',pos:'LW', num:17, ovr:85, pac:93, sho:78, pas:80, dri:88, def:42, phy:74, health:94, age:23},
      {n:'Le Normand',  pos:'CB',  num:14, ovr:83, pac:76, sho:42, pas:78, dri:72, def:84, phy:82, health:91, age:28},
      {n:'Laporte',     pos:'CB',  num:24, ovr:84, pac:74, sho:48, pas:82, dri:74, def:85, phy:84, health:87, age:31},
      {n:'Carvajal',    pos:'RB',  num:2,  ovr:84, pac:82, sho:62, pas:80, dri:80, def:82, phy:80, health:84, age:34},
      {n:'Cucurella',   pos:'LB',  num:14, ovr:82, pac:80, sho:56, pas:78, dri:78, def:80, phy:80, health:93, age:27},
      {n:'Morata',      pos:'ST',  num:7,  ovr:83, pac:80, sho:82, pas:76, dri:78, def:48, phy:82, health:90, age:33},
    ],
    subs:[
      {n:'Dani Olmo',  pos:'CAM', num:10, ovr:85, pac:80, sho:82, pas:84, dri:86, def:56, phy:72, health:86, age:27},
      {n:'Ferran T.',  pos:'ST',  num:11, ovr:82, pac:84, sho:81, pas:78, dri:82, def:44, phy:72, health:92, age:26},
      {n:'Fabián Ruiz',pos:'CM',  num:12, ovr:83, pac:74, sho:78, pas:84, dri:82, def:74, phy:80, health:90, age:30},
    ],
  },
  CRO: {
    code:'CRO', name:'Croatia', flag:'🇭🇷', group:'B',
    primary:'#FF0000', secondary:'#FFFFFF', accent:'#003DA5',
    rank:10, rating:82, form:['W','D','W','L','W'],
    nickname:'Vatreni', coach:'Zlatko Dalić', titles:0, sentiment:77,
    players:[
      {n:'L. Modrić',   pos:'CM',  num:10, ovr:86, pac:72, sho:78, pas:92, dri:90, def:68, phy:64, health:84, age:41},
      {n:'I. Gvardiol',  pos:'LB',  num:24, ovr:87, pac:88, sho:68, pas:80, dri:82, def:86, phy:84, health:94, age:23},
      {n:'D. Livaković', pos:'GK',  num:1,  ovr:84, pac:54, sho:24, pas:74, dri:60, def:85, phy:80, health:92, age:30},
      {n:'M. Brozović',  pos:'CDM', num:11, ovr:83, pac:70, sho:72, pas:85, dri:80, def:78, phy:76, health:88, age:33},
      {n:'A. Kramarić',  pos:'ST',  num:9,  ovr:82, pac:76, sho:83, pas:76, dri:80, def:44, phy:74, health:90, age:34},
      {n:'I. Perišić',   pos:'LW',  num:4,  ovr:83, pac:84, sho:80, pas:82, dri:82, def:58, phy:80, health:86, age:36},
      {n:'J. Šutalo',    pos:'CB',  num:5,  ovr:79, pac:80, sho:40, pas:72, dri:68, def:80, phy:82, health:90, age:25},
      {n:'D. Butković',  pos:'CB',  num:21, ovr:77, pac:74, sho:38, pas:70, dri:66, def:78, phy:80, health:86, age:28},
      {n:'J. Stanišić',  pos:'RB',  num:2,  ovr:78, pac:82, sho:56, pas:74, dri:74, def:76, phy:74, health:90, age:25},
      {n:'L. Sucić',     pos:'CAM', num:20, ovr:80, pac:80, sho:76, pas:82, dri:82, def:60, phy:72, health:90, age:23},
      {n:'M. Pašalić',   pos:'CM',  num:14, ovr:80, pac:74, sho:76, pas:80, dri:78, def:66, phy:76, health:88, age:30},
    ],
    subs:[
      {n:'A. Budimir', pos:'ST', num:16, ovr:78, pac:72, sho:78, pas:70, dri:72, def:40, phy:82, health:86, age:34},
      {n:'M. Vlašić',  pos:'CAM',num:18, ovr:78, pac:76, sho:76, pas:78, dri:80, def:54, phy:72, health:88, age:28},
      {n:'L. Majer',   pos:'CM', num:17, ovr:76, pac:74, sho:70, pas:78, dri:76, def:68, phy:72, health:84, age:27},
    ],
  },
  // GROUP C
  ARG: {
    code:'ARG', name:'Argentina', flag:'🇦🇷', group:'C',
    primary:'#6CA8DC', secondary:'#FFFFFF', accent:'#F4C430',
    rank:1, rating:89, form:['W','W','D','W','W'],
    nickname:'La Albiceleste', coach:'Lionel Scaloni', titles:3, sentiment:91,
    players:[
      {n:'L. Messi',        pos:'RW',  num:10, ovr:90, pac:80, sho:89, pas:91, dri:94, def:38, phy:64, health:88, age:38},
      {n:'J. Álvarez',      pos:'ST',  num:9,  ovr:86, pac:86, sho:85, pas:80, dri:86, def:50, phy:76, health:96, age:26},
      {n:'E. Martínez',     pos:'GK',  num:23, ovr:87, pac:55, sho:25, pas:70, dri:60, def:88, phy:84, health:94, age:33},
      {n:'R. De Paul',      pos:'CM',  num:7,  ovr:84, pac:78, sho:75, pas:84, dri:83, def:78, phy:82, health:90, age:32},
      {n:'E. Fernández',    pos:'CM',  num:24, ovr:84, pac:72, sho:78, pas:86, dri:82, def:76, phy:80, health:93, age:25},
      {n:'C. Romero',       pos:'CB',  num:13, ovr:85, pac:80, sho:45, pas:72, dri:70, def:87, phy:86, health:91, age:28},
      {n:'N. Otamendi',     pos:'CB',  num:19, ovr:81, pac:68, sho:48, pas:70, dri:65, def:84, phy:85, health:85, age:38},
      {n:'N. Molina',       pos:'RB',  num:26, ovr:81, pac:88, sho:60, pas:76, dri:79, def:78, phy:78, health:92, age:28},
      {n:'N. Tagliafico',   pos:'LB',  num:3,  ovr:80, pac:82, sho:55, pas:74, dri:75, def:80, phy:79, health:89, age:33},
      {n:'A. Mac Allister', pos:'CM',  num:20, ovr:85, pac:74, sho:79, pas:86, dri:83, def:77, phy:78, health:95, age:27},
      {n:'Á. Di María',     pos:'LW',  num:11, ovr:83, pac:82, sho:80, pas:85, dri:86, def:55, phy:68, health:80, age:38},
    ],
    subs:[
      {n:'P. Dybala',   pos:'RW', num:21, ovr:84, pac:80, sho:83, pas:82, dri:88, def:40, phy:65, health:90, age:32},
      {n:'G. Lo Celso', pos:'CM', num:18, ovr:81, pac:76, sho:76, pas:83, dri:82, def:70, phy:74, health:88, age:30},
      {n:'L. Martínez', pos:'ST', num:22, ovr:86, pac:84, sho:87, pas:78, dri:84, def:45, phy:83, health:94, age:28},
    ],
  },
  // GROUP D
  FRA: {
    code:'FRA', name:'France', flag:'🇫🇷', group:'D',
    primary:'#1E3A8A', secondary:'#FFFFFF', accent:'#EF4444',
    rank:2, rating:89, form:['W','W','W','D','L'],
    nickname:'Les Bleus', coach:'Didier Deschamps', titles:2, sentiment:84,
    players:[
      {n:'K. Mbappé',     pos:'ST',  num:10, ovr:91, pac:97, sho:90, pas:80, dri:92, def:36, phy:78, health:97, age:27},
      {n:'A. Tchouaméni', pos:'CDM', num:8,  ovr:85, pac:76, sho:70, pas:82, dri:80, def:85, phy:84, health:95, age:26},
      {n:'M. Maignan',    pos:'GK',  num:16, ovr:87, pac:58, sho:28, pas:74, dri:62, def:88, phy:85, health:93, age:30},
      {n:'A. Griezmann',  pos:'CAM', num:7,  ovr:86, pac:78, sho:84, pas:87, dri:86, def:62, phy:72, health:92, age:35},
      {n:'O. Dembélé',    pos:'RW',  num:11, ovr:86, pac:92, sho:80, pas:82, dri:90, def:40, phy:68, health:88, age:28},
      {n:'W. Saliba',     pos:'CB',  num:17, ovr:86, pac:84, sho:42, pas:76, dri:72, def:87, phy:85, health:96, age:25},
      {n:'D. Upamecano',  pos:'CB',  num:4,  ovr:84, pac:86, sho:40, pas:72, dri:70, def:84, phy:88, health:90, age:27},
      {n:'J. Koundé',     pos:'RB',  num:5,  ovr:84, pac:87, sho:55, pas:78, dri:80, def:82, phy:80, health:94, age:27},
      {n:'T. Hernández',  pos:'LB',  num:22, ovr:84, pac:91, sho:65, pas:78, dri:82, def:79, phy:84, health:89, age:28},
      {n:'A. Rabiot',     pos:'CM',  num:14, ovr:83, pac:74, sho:76, pas:82, dri:80, def:78, phy:84, health:91, age:31},
      {n:'B. Barcola',    pos:'LW',  num:20, ovr:83, pac:93, sho:78, pas:78, dri:86, def:38, phy:70, health:95, age:23},
    ],
    subs:[
      {n:'M. Thuram',    pos:'ST', num:9,  ovr:84, pac:88, sho:83, pas:75, dri:80, def:44, phy:86, health:93, age:28},
      {n:'E. Camavinga', pos:'CM', num:18, ovr:84, pac:84, sho:70, pas:82, dri:85, def:80, phy:78, health:92, age:23},
      {n:'R. Kolo Muani',pos:'ST', num:12, ovr:82, pac:87, sho:80, pas:76, dri:81, def:42, phy:82, health:90, age:27},
    ],
  },
  // GROUP E
  GER: {
    code:'GER', name:'Germany', flag:'🇩🇪', group:'E',
    primary:'#000000', secondary:'#DD0000', accent:'#FFCE00',
    rank:7, rating:85, form:['D','W','W','W','L'],
    nickname:'Die Mannschaft', coach:'Julian Nagelsmann', titles:4, sentiment:76,
    players:[
      {n:'J. Musiala',   pos:'CAM', num:10, ovr:88, pac:86, sho:82, pas:84, dri:92, def:50, phy:70, health:94, age:23},
      {n:'F. Wirtz',     pos:'CAM', num:17, ovr:87, pac:84, sho:82, pas:87, dri:90, def:52, phy:70, health:93, age:22},
      {n:'K. Havertz',   pos:'ST',  num:7,  ovr:84, pac:80, sho:82, pas:80, dri:82, def:56, phy:82, health:90, age:26},
      {n:'M. Neuer',     pos:'GK',  num:1,  ovr:84, pac:56, sho:26, pas:82, dri:66, def:85, phy:80, health:84, age:40},
      {n:'A. Kimmich',   pos:'RB',  num:6,  ovr:87, pac:78, sho:76, pas:88, dri:82, def:84, phy:80, health:95, age:31},
      {n:'T. Rüdiger',   pos:'CB',  num:2,  ovr:86, pac:84, sho:44, pas:76, dri:72, def:87, phy:88, health:90, age:33},
      {n:'J. Tah',       pos:'CB',  num:4,  ovr:84, pac:82, sho:40, pas:74, dri:70, def:85, phy:86, health:92, age:30},
      {n:'D. Raum',      pos:'LB',  num:22, ovr:81, pac:84, sho:60, pas:80, dri:78, def:78, phy:78, health:91, age:28},
      {n:'R. Andrich',   pos:'CDM', num:23, ovr:82, pac:72, sho:74, pas:80, dri:76, def:82, phy:84, health:90, age:31},
      {n:'S. Gnabry',    pos:'RW',  num:20, ovr:83, pac:88, sho:82, pas:80, dri:85, def:44, phy:74, health:88, age:30},
      {n:'L. Sané',      pos:'LW',  num:19, ovr:84, pac:91, sho:80, pas:82, dri:87, def:40, phy:72, health:87, age:30},
    ],
    subs:[
      {n:'N. Füllkrug', pos:'ST', num:9,  ovr:82, pac:74, sho:84, pas:74, dri:76, def:48, phy:86, health:90, age:33},
      {n:'P. Groß',     pos:'CM', num:8,  ovr:80, pac:70, sho:74, pas:84, dri:78, def:78, phy:78, health:92, age:35},
      {n:'K. Adeyemi',  pos:'LW', num:18, ovr:81, pac:95, sho:76, pas:74, dri:84, def:36, phy:70, health:94, age:24},
    ],
  },
  // GROUP F
  POR: {
    code:'POR', name:'Portugal', flag:'🇵🇹', group:'F',
    primary:'#006600', secondary:'#FF0000', accent:'#FFD700',
    rank:6, rating:86, form:['W','W','L','W','W'],
    nickname:'A Seleção', coach:'Roberto Martínez', titles:0, sentiment:80,
    players:[
      {n:'C. Ronaldo',   pos:'ST',  num:7,  ovr:84, pac:78, sho:88, pas:76, dri:80, def:40, phy:80, health:86, age:41},
      {n:'B. Fernandes', pos:'CAM', num:8,  ovr:87, pac:78, sho:84, pas:89, dri:84, def:64, phy:78, health:95, age:31},
      {n:'Rúben Dias',   pos:'CB',  num:4,  ovr:88, pac:76, sho:42, pas:78, dri:72, def:89, phy:86, health:94, age:28},
      {n:'Diogo Costa',  pos:'GK',  num:22, ovr:85, pac:58, sho:26, pas:76, dri:64, def:86, phy:82, health:93, age:26},
      {n:'Vitinha',      pos:'CM',  num:16, ovr:86, pac:78, sho:78, pas:86, dri:88, def:72, phy:74, health:92, age:26},
      {n:'Rafael Leão',  pos:'LW',  num:15, ovr:86, pac:93, sho:82, pas:80, dri:90, def:38, phy:78, health:90, age:26},
      {n:'B. Silva',     pos:'RW',  num:10, ovr:87, pac:80, sho:80, pas:88, dri:90, def:64, phy:68, health:91, age:31},
      {n:'Pepe N.',      pos:'CB',  num:3,  ovr:82, pac:78, sho:42, pas:74, dri:70, def:83, phy:84, health:88, age:27},
      {n:'Cancelo',      pos:'RB',  num:20, ovr:84, pac:82, sho:70, pas:84, dri:86, def:78, phy:74, health:87, age:31},
      {n:'N. Mendes',    pos:'LB',  num:19, ovr:84, pac:90, sho:58, pas:78, dri:82, def:80, phy:80, health:93, age:23},
      {n:'Rúben Neves',  pos:'CDM', num:18, ovr:83, pac:70, sho:78, pas:84, dri:78, def:80, phy:82, health:90, age:29},
    ],
    subs:[
      {n:'Gonçalo R.',  pos:'ST',  num:9,  ovr:83, pac:80, sho:84, pas:76, dri:80, def:44, phy:84, health:92, age:29},
      {n:'João Félix',  pos:'CAM', num:11, ovr:82, pac:82, sho:80, pas:82, dri:88, def:42, phy:66, health:88, age:26},
      {n:'João Neves',  pos:'CM',  num:14, ovr:83, pac:80, sho:72, pas:84, dri:84, def:78, phy:72, health:94, age:21},
    ],
  },
  // GROUP G
  BRA: {
    code:'BRA', name:'Brazil', flag:'🇧🇷', group:'G',
    primary:'#FCD116', secondary:'#009C3B', accent:'#002776',
    rank:3, rating:87, form:['W','D','W','W','D'],
    nickname:'Seleção', coach:'Carlo Ancelotti', titles:5, sentiment:79,
    players:[
      {n:'Vinícius Jr.',  pos:'LW',  num:7,  ovr:89, pac:95, sho:83, pas:80, dri:92, def:34, phy:70, health:94, age:26},
      {n:'Rodrygo',       pos:'RW',  num:11, ovr:86, pac:90, sho:82, pas:80, dri:88, def:40, phy:66, health:92, age:25},
      {n:'Alisson',       pos:'GK',  num:1,  ovr:88, pac:56, sho:26, pas:78, dri:64, def:89, phy:86, health:95, age:33},
      {n:'Bruno G.',      pos:'CDM', num:5,  ovr:84, pac:74, sho:70, pas:82, dri:78, def:84, phy:86, health:93, age:29},
      {n:'Marquinhos',    pos:'CB',  num:4,  ovr:85, pac:80, sho:45, pas:78, dri:74, def:86, phy:82, health:91, age:32},
      {n:'Gabriel M.',    pos:'CB',  num:3,  ovr:84, pac:82, sho:42, pas:74, dri:70, def:85, phy:85, health:90, age:28},
      {n:'Danilo',        pos:'RB',  num:2,  ovr:80, pac:78, sho:58, pas:76, dri:78, def:80, phy:80, health:86, age:34},
      {n:'Wendell',       pos:'LB',  num:6,  ovr:79, pac:84, sho:56, pas:76, dri:78, def:76, phy:76, health:90, age:32},
      {n:'Paquetá',       pos:'CAM', num:10, ovr:84, pac:78, sho:79, pas:84, dri:86, def:64, phy:78, health:88, age:28},
      {n:'Bruno Fdz.',    pos:'CM',  num:8,  ovr:82, pac:76, sho:74, pas:82, dri:80, def:76, phy:80, health:92, age:27},
      {n:'Raphinha',      pos:'RW',  num:19, ovr:85, pac:88, sho:82, pas:83, dri:86, def:45, phy:72, health:93, age:29},
    ],
    subs:[
      {n:'Endrick',      pos:'ST', num:9,  ovr:80, pac:88, sho:82, pas:70, dri:82, def:36, phy:76, health:96, age:19},
      {n:'Éder Militão', pos:'CB', num:14, ovr:84, pac:86, sho:44, pas:74, dri:72, def:85, phy:86, health:84, age:28},
      {n:'Antony',       pos:'RW', num:17, ovr:80, pac:86, sho:76, pas:76, dri:84, def:38, phy:64, health:90, age:26},
    ],
  },
  // GROUPS H–L (abbreviated squads for bracket completeness)
  NED: {
    code:'NED', name:'Netherlands', flag:'🇳🇱', group:'H',
    primary:'#FF6600', secondary:'#FFFFFF', accent:'#003DA5',
    rank:8, rating:85, form:['W','W','L','W','D'],
    nickname:'Oranje', coach:'Ronald Koeman', titles:0, sentiment:78,
    players:[
      {n:'V. van Dijk',   pos:'CB',  num:4,  ovr:88, pac:80, sho:64, pas:84, dri:76, def:90, phy:88, health:92, age:34},
      {n:'C. Gakpo',      pos:'LW',  num:11, ovr:85, pac:86, sho:83, pas:80, dri:84, def:46, phy:76, health:92, age:26},
      {n:'T. de Jong',    pos:'CDM', num:15, ovr:84, pac:72, sho:68, pas:82, dri:78, def:82, phy:80, health:94, age:27},
      {n:'B. Verbruggen', pos:'GK',  num:1,  ovr:83, pac:56, sho:24, pas:72, dri:60, def:84, phy:80, health:93, age:22},
      {n:'D. Dumfries',   pos:'RB',  num:22, ovr:82, pac:85, sho:68, pas:76, dri:78, def:78, phy:80, health:90, age:29},
      {n:'N. de Jong',    pos:'CM',  num:8,  ovr:84, pac:72, sho:72, pas:84, dri:80, def:80, phy:80, health:88, age:28},
      {n:'M. de Ligt',    pos:'CB',  num:3,  ovr:83, pac:78, sho:52, pas:74, dri:72, def:85, phy:84, health:88, age:26},
      {n:'D. Blind',      pos:'LB',  num:17, ovr:78, pac:72, sho:58, pas:78, dri:74, def:78, phy:74, health:84, age:34},
      {n:'J. Veerman',    pos:'CM',  num:6,  ovr:80, pac:74, sho:74, pas:82, dri:78, def:72, phy:76, health:90, age:26},
      {n:'X. Simons',     pos:'CAM', num:7,  ovr:83, pac:82, sho:78, pas:84, dri:86, def:58, phy:70, health:92, age:22},
      {n:'B. Weghorst',   pos:'ST',  num:9,  ovr:77, pac:70, sho:78, pas:68, dri:70, def:46, phy:84, health:88, age:33},
    ],
    subs:[
      {n:'S. Berghuis',   pos:'RW', num:18, ovr:79, pac:80, sho:76, pas:78, dri:80, def:44, phy:70, health:88, age:33},
      {n:'T. Reijnders',  pos:'CM', num:14, ovr:80, pac:78, sho:72, pas:82, dri:80, def:70, phy:76, health:90, age:26},
      {n:'W. Timber',     pos:'LB', num:21, ovr:79, pac:84, sho:62, pas:76, dri:78, def:76, phy:76, health:92, age:23},
    ],
  },
  URU: {
    code:'URU', name:'Uruguay', flag:'🇺🇾', group:'H',
    primary:'#4D94FF', secondary:'#FFFFFF', accent:'#000000',
    rank:13, rating:80, form:['W','W','D','L','W'],
    nickname:'La Celeste', coach:'Marcelo Bielsa', titles:2, sentiment:72,
    players:[
      {n:'F. Valverde', pos:'CM',  num:8,  ovr:87, pac:80, sho:82, pas:84, dri:84, def:78, phy:86, health:95, age:27},
      {n:'D. Núñez',    pos:'ST',  num:9,  ovr:85, pac:90, sho:84, pas:72, dri:82, def:36, phy:80, health:92, age:26},
      {n:'S. Rochet',   pos:'GK',  num:1,  ovr:82, pac:54, sho:22, pas:70, dri:58, def:83, phy:78, health:90, age:30},
      {n:'J. Giménez',  pos:'CB',  num:2,  ovr:84, pac:80, sho:48, pas:74, dri:70, def:86, phy:84, health:90, age:30},
      {n:'R. Araujo',   pos:'CB',  num:4,  ovr:82, pac:82, sho:44, pas:70, dri:68, def:84, phy:86, health:88, age:26},
      {n:'M. Ugarte',   pos:'CDM', num:5,  ovr:82, pac:76, sho:66, pas:80, dri:78, def:82, phy:82, health:92, age:24},
      {n:'A. Olivera',  pos:'LB',  num:3,  ovr:78, pac:82, sho:56, pas:74, dri:76, def:76, phy:74, health:88, age:27},
      {n:'N. Nández',   pos:'RB',  num:22, ovr:78, pac:80, sho:60, pas:72, dri:74, def:76, phy:80, health:86, age:30},
      {n:'L. Bentancur',pos:'CM',  num:30, ovr:82, pac:74, sho:70, pas:82, dri:80, def:72, phy:78, health:88, age:28},
      {n:'F. Torres',   pos:'LW',  num:10, ovr:78, pac:84, sho:74, pas:76, dri:80, def:42, phy:70, health:86, age:27},
      {n:'M. Vecino',   pos:'CAM', num:14, ovr:76, pac:72, sho:72, pas:78, dri:74, def:68, phy:78, health:84, age:34},
    ],
    subs:[
      {n:'E. Cavani',  pos:'ST', num:21, ovr:76, pac:74, sho:80, pas:70, dri:72, def:42, phy:76, health:80, age:38},
      {n:'L. Suárez',  pos:'ST', num:9,  ovr:74, pac:72, sho:80, pas:74, dri:76, def:42, phy:72, health:78, age:39},
      {n:'B. Arévalo', pos:'CM', num:6,  ovr:76, pac:72, sho:64, pas:76, dri:72, def:76, phy:78, health:88, age:30},
    ],
  },
  COL: {
    code:'COL', name:'Colombia', flag:'🇨🇴', group:'I',
    primary:'#FCD116', secondary:'#003087', accent:'#CE1126',
    rank:12, rating:81, form:['W','W','D','W','L'],
    nickname:'Los Cafeteros', coach:'Néstor Lorenzo', titles:0, sentiment:78,
    players:[
      {n:'J. Díaz',     pos:'LW',  num:7,  ovr:84, pac:92, sho:79, pas:78, dri:86, def:44, phy:72, health:90, age:28},
      {n:'J. Cuadrado', pos:'RB',  num:23, ovr:82, pac:86, sho:76, pas:82, dri:84, def:72, phy:74, health:84, age:37},
      {n:'D. Ospina',   pos:'GK',  num:1,  ovr:82, pac:56, sho:22, pas:72, dri:60, def:83, phy:76, health:86, age:37},
      {n:'R. Arias',    pos:'RW',  num:11, ovr:80, pac:88, sho:76, pas:76, dri:82, def:40, phy:68, health:90, age:25},
      {n:'D. Mina',     pos:'CB',  num:13, ovr:80, pac:76, sho:60, pas:68, dri:66, def:82, phy:88, health:82, age:30},
      {n:'Y. Mina',     pos:'CB',  num:4,  ovr:78, pac:72, sho:56, pas:66, dri:64, def:80, phy:84, health:80, age:30},
      {n:'J. Lerma',    pos:'CDM', num:8,  ovr:78, pac:72, sho:64, pas:76, dri:72, def:80, phy:82, health:86, age:30},
      {n:'R. Mojica',   pos:'LB',  num:16, ovr:76, pac:80, sho:58, pas:72, dri:74, def:74, phy:74, health:86, age:31},
      {n:'W. Barrios',  pos:'CM',  num:6,  ovr:76, pac:72, sho:62, pas:76, dri:72, def:76, phy:78, health:84, age:33},
      {n:'J. Quintero', pos:'CAM', num:10, ovr:79, pac:74, sho:76, pas:82, dri:82, def:52, phy:66, health:82, age:33},
      {n:'R. Falcao',   pos:'ST',  num:9,  ovr:74, pac:70, sho:80, pas:70, dri:72, def:38, phy:74, health:74, age:40},
    ],
    subs:[
      {n:'C. Borré',   pos:'ST', num:19, ovr:77, pac:82, sho:78, pas:70, dri:76, def:38, phy:74, health:88, age:29},
      {n:'L. Sinisterra',pos:'LW',num:17,ovr:78, pac:88, sho:74, pas:74, dri:80, def:42, phy:70, health:84, age:26},
      {n:'J. Ríos',    pos:'CM', num:14, ovr:74, pac:70, sho:62, pas:74, dri:70, def:72, phy:76, health:86, age:26},
    ],
  },
  MAR: {
    code:'MAR', name:'Morocco', flag:'🇲🇦', group:'J',
    primary:'#C1272D', secondary:'#006233', accent:'#FFFFFF',
    rank:14, rating:80, form:['W','D','W','W','L'],
    nickname:'Lions of the Atlas', coach:'Walid Regragui', titles:0, sentiment:82,
    players:[
      {n:'A. Hakimi',   pos:'RB',  num:2,  ovr:87, pac:91, sho:72, pas:82, dri:86, def:78, phy:76, health:93, age:26},
      {n:'Y. En-Nesyri',pos:'ST',  num:19, ovr:83, pac:80, sho:84, pas:68, dri:76, def:38, phy:82, health:90, age:28},
      {n:'Y. Bounou',   pos:'GK',  num:1,  ovr:86, pac:56, sho:26, pas:74, dri:62, def:87, phy:82, health:92, age:33},
      {n:'S. Amrabat',  pos:'CDM', num:4,  ovr:82, pac:78, sho:62, pas:80, dri:78, def:84, phy:84, health:90, age:28},
      {n:'R. Ounahi',   pos:'CM',  num:8,  ovr:80, pac:80, sho:70, pas:80, dri:82, def:66, phy:76, health:88, age:25},
      {n:'A. Ezzalzouli',pos:'LW', num:17, ovr:79, pac:88, sho:74, pas:74, dri:82, def:40, phy:68, health:90, age:23},
      {n:'N. Mazraoui', pos:'RB',  num:22, ovr:82, pac:86, sho:64, pas:78, dri:80, def:78, phy:76, health:86, age:27},
      {n:'R. Aguerd',   pos:'CB',  num:5,  ovr:80, pac:76, sho:50, pas:72, dri:68, def:82, phy:82, health:88, age:29},
      {n:'N. Aguerd',   pos:'CB',  num:6,  ovr:79, pac:74, sho:46, pas:70, dri:66, def:80, phy:80, health:86, age:29},
      {n:'A. Ait Nouri',pos:'LB',  num:14, ovr:79, pac:88, sho:60, pas:74, dri:78, def:74, phy:74, health:90, age:24},
      {n:'I. Tissoudali',pos:'CAM',num:10, ovr:78, pac:80, sho:76, pas:78, dri:80, def:50, phy:70, health:86, age:29},
    ],
    subs:[
      {n:'A. Sabiri',   pos:'CM', num:7,  ovr:76, pac:78, sho:70, pas:76, dri:76, def:64, phy:72, health:88, age:27},
      {n:'S. Benrahma', pos:'LW', num:15, ovr:78, pac:82, sho:74, pas:76, dri:80, def:42, phy:68, health:86, age:29},
      {n:'W. Cheddira', pos:'ST', num:9,  ovr:74, pac:78, sho:76, pas:62, dri:68, def:36, phy:74, health:86, age:27},
    ],
  },
  JPN: {
    code:'JPN', name:'Japan', flag:'🇯🇵', group:'K',
    primary:'#003DA5', secondary:'#FFFFFF', accent:'#BC0025',
    rank:18, rating:78, form:['W','D','W','L','W'],
    nickname:'Samurai Blue', coach:'Hajime Moriyasu', titles:0, sentiment:76,
    players:[
      {n:'T. Minamino', pos:'CAM', num:10, ovr:80, pac:80, sho:78, pas:80, dri:80, def:56, phy:72, health:90, age:30},
      {n:'H. Itakura',  pos:'CB',  num:4,  ovr:80, pac:80, sho:46, pas:72, dri:68, def:82, phy:82, health:90, age:28},
      {n:'S. Ito',      pos:'RB',  num:3,  ovr:79, pac:84, sho:60, pas:74, dri:76, def:76, phy:74, health:90, age:25},
      {n:'K. Mitoma',   pos:'LW',  num:9,  ovr:81, pac:88, sho:76, pas:76, dri:84, def:44, phy:70, health:88, age:28},
      {n:'W. Endo',     pos:'CDM', num:6,  ovr:80, pac:72, sho:62, pas:78, dri:74, def:82, phy:78, health:88, age:32},
      {n:'D. Schmidt',  pos:'GK',  num:1,  ovr:79, pac:54, sho:22, pas:68, dri:56, def:80, phy:76, health:90, age:27},
      {n:'T. Yoshida',  pos:'CB',  num:22, ovr:76, pac:72, sho:42, pas:68, dri:64, def:78, phy:78, health:84, age:37},
      {n:'D. Ugajin',   pos:'ST',  num:11, ovr:76, pac:82, sho:76, pas:68, dri:76, def:36, phy:68, health:86, age:23},
      {n:'J. Ito',      pos:'RW',  num:7,  ovr:77, pac:86, sho:72, pas:72, dri:78, def:40, phy:66, health:86, age:28},
      {n:'H. Morita',   pos:'CM',  num:8,  ovr:78, pac:74, sho:66, pas:80, dri:76, def:72, phy:76, health:90, age:28},
      {n:'K. Nakamura', pos:'LB',  num:5,  ovr:74, pac:78, sho:52, pas:70, dri:70, def:72, phy:70, health:86, age:30},
    ],
    subs:[
      {n:'A. Ueda',   pos:'ST', num:15, ovr:74, pac:80, sho:74, pas:62, dri:70, def:34, phy:72, health:88, age:27},
      {n:'H. Sakai',  pos:'RB', num:19, ovr:73, pac:80, sho:52, pas:68, dri:68, def:72, phy:72, health:84, age:35},
      {n:'S. Kubo',   pos:'RW', num:17, ovr:77, pac:82, sho:72, pas:74, dri:80, def:40, phy:66, health:90, age:24},
    ],
  },
  AUS: {
    code:'AUS', name:'Australia', flag:'🇦🇺', group:'L',
    primary:'#FFD700', secondary:'#00843D', accent:'#000080',
    rank:23, rating:74, form:['D','W','L','W','D'],
    nickname:'Socceroos', coach:'Tony Popovic', titles:0, sentiment:68,
    players:[
      {n:'M. Leckie',   pos:'RW',  num:7,  ovr:77, pac:86, sho:72, pas:72, dri:76, def:46, phy:72, health:90, age:34},
      {n:'M. Ryan',     pos:'GK',  num:1,  ovr:76, pac:54, sho:22, pas:68, dri:56, def:77, phy:74, health:88, age:33},
      {n:'H. Souttar',  pos:'CB',  num:4,  ovr:76, pac:72, sho:46, pas:68, dri:64, def:78, phy:82, health:84, age:26},
      {n:'A. Mabil',    pos:'LW',  num:11, ovr:74, pac:84, sho:70, pas:68, dri:76, def:38, phy:68, health:86, age:30},
      {n:'A. Hrustic',  pos:'CM',  num:8,  ovr:74, pac:74, sho:68, pas:78, dri:74, def:66, phy:72, health:86, age:28},
      {n:'K. Rowles',   pos:'CB',  num:5,  ovr:73, pac:70, sho:42, pas:66, dri:62, def:76, phy:78, health:86, age:28},
      {n:'A. Devlin',   pos:'RB',  num:2,  ovr:72, pac:78, sho:54, pas:68, dri:68, def:72, phy:72, health:86, age:25},
      {n:'J. Irvine',   pos:'CAM', num:10, ovr:73, pac:72, sho:70, pas:76, dri:72, def:58, phy:72, health:84, age:31},
      {n:'N. D\'Arrigo',pos:'LB',  num:3,  ovr:70, pac:74, sho:50, pas:64, dri:66, def:68, phy:68, health:84, age:24},
      {n:'M. Boyle',    pos:'ST',  num:9,  ovr:72, pac:82, sho:72, pas:62, dri:72, def:36, phy:70, health:86, age:30},
      {n:'C. Goodwin',  pos:'LW',  num:14, ovr:71, pac:80, sho:66, pas:66, dri:72, def:38, phy:66, health:84, age:28},
    ],
    subs:[
      {n:'A. Grant',  pos:'ST', num:19, ovr:70, pac:76, sho:70, pas:58, dri:68, def:34, phy:70, health:84, age:26},
      {n:'R. Atkinson',pos:'CM',num:16, ovr:69, pac:70, sho:62, pas:72, dri:68, def:68, phy:72, health:82, age:27},
      {n:'T. Rogic',  pos:'CAM',num:23, ovr:71, pac:70, sho:68, pas:76, dri:74, def:52, phy:68, health:80, age:32},
    ],
  },
};

// ─── FIXTURES ────────────────────────────────────────────────────────────────
const FIXTURES = [
  {id:'m1',  home:'USA', away:'PAN', group:'A',  date:'Jun 12', time:'18:00', venue:'SoFi Stadium, LA',            status:'live',     hs:1, as:0, minute:43},
  {id:'m2',  home:'ENG', away:'CAN', group:'A',  date:'Jun 12', time:'21:00', venue:'MetLife Stadium, NJ',         status:'live',     hs:2, as:1, minute:58},
  {id:'m3',  home:'ESP', away:'CRO', group:'B',  date:'Jun 13', time:'18:00', venue:'Hard Rock Stadium, Miami',    status:'upcoming', hs:0, as:0, minute:0},
  {id:'m4',  home:'ARG', away:'FRA', group:'D',  date:'Jun 13', time:'21:00', venue:'AT&T Stadium, Dallas',        status:'upcoming', hs:0, as:0, minute:0},
  {id:'m5',  home:'GER', away:'POR', group:'E',  date:'Jun 14', time:'15:00', venue:'Arrowhead, Kansas City',      status:'upcoming', hs:0, as:0, minute:0},
  {id:'m6',  home:'BRA', away:'COL', group:'G',  date:'Jun 14', time:'18:00', venue:'BC Place, Vancouver',         status:'upcoming', hs:0, as:0, minute:0},
  {id:'m7',  home:'NED', away:'URU', group:'H',  date:'Jun 15', time:'18:00', venue:'Lumen Field, Seattle',        status:'upcoming', hs:0, as:0, minute:0},
  {id:'m8',  home:'MAR', away:'JPN', group:'J',  date:'Jun 15', time:'21:00', venue:'Estadio Azteca, MX',          status:'upcoming', hs:0, as:0, minute:0},
  {id:'m9',  home:'USA', away:'ENG', group:'A',  date:'Jun 18', time:'20:00', venue:'MetLife Stadium, NJ',         status:'upcoming', hs:0, as:0, minute:0},
  {id:'m10', home:'ARG', away:'GER', group:'D',  date:'Jun 22', time:'21:00', venue:'AT&T Stadium, Dallas',        status:'upcoming', hs:0, as:0, minute:0},
  {id:'m11', home:'BRA', away:'ESP', group:'G',  date:'Jun 23', time:'18:00', venue:'Estadio Azteca, MX',          status:'upcoming', hs:0, as:0, minute:0},
  {id:'m12', home:'FRA', away:'POR', group:'F',  date:'Jun 23', time:'21:00', venue:'SoFi Stadium, LA',            status:'upcoming', hs:0, as:0, minute:0},
  // Knockout round placeholders
  {id:'r32a',home:'ARG', away:'NED', group:'R32', date:'Jun 30', time:'20:00', venue:'MetLife Stadium, NJ',        status:'upcoming', hs:0, as:0, minute:0},
  {id:'r32b',home:'ENG', away:'BRA', group:'R32', date:'Jul 1',  time:'20:00', venue:'SoFi Stadium, LA',           status:'upcoming', hs:0, as:0, minute:0},
  {id:'r32c',home:'FRA', away:'ESP', group:'R32', date:'Jul 2',  time:'20:00', venue:'AT&T Stadium, Dallas',       status:'upcoming', hs:0, as:0, minute:0},
  {id:'r32d',home:'GER', away:'POR', group:'R32', date:'Jul 3',  time:'20:00', venue:'Arrowhead, Kansas City',     status:'upcoming', hs:0, as:0, minute:0},
  {id:'qf1', home:'ARG', away:'FRA', group:'QF',  date:'Jul 7',  time:'20:00', venue:'MetLife Stadium, NJ',        status:'upcoming', hs:0, as:0, minute:0},
  {id:'qf2', home:'ENG', away:'ESP', group:'QF',  date:'Jul 8',  time:'20:00', venue:'SoFi Stadium, LA',           status:'upcoming', hs:0, as:0, minute:0},
  {id:'sf1', home:'ARG', away:'ENG', group:'SF',  date:'Jul 14', time:'20:00', venue:'MetLife Stadium, NJ',        status:'upcoming', hs:0, as:0, minute:0},
  {id:'f1',  home:'ARG', away:'ENG', group:'F',   date:'Jul 19', time:'20:00', venue:'MetLife Stadium, NJ',        status:'upcoming', hs:0, as:0, minute:0},
];

// ─── LIVE EVENTS ──────────────────────────────────────────────────────────────
const LIVE_EVENTS = {
  m1: [
    {min:43, type:'chance', team:'USA',  text:'Pulisic forces a save from the keeper'},
    {min:38, type:'goal',   team:'USA',  text:'GOAL! Balogun pounces on a rebound! 1-0'},
    {min:29, type:'yellow', team:'PAN',  text:'Yellow card — Murillo (professional foul)'},
    {min:18, type:'chance', team:'PAN',  text:'Torres fizzes one just wide'},
    {min:1,  type:'kickoff',team:'',     text:'Kick-off at SoFi Stadium'},
  ],
  m2: [
    {min:58, type:'sub',    team:'ENG',  text:'Substitution — Watkins ON, Kane OFF'},
    {min:52, type:'goal',   team:'CAN',  text:'GOAL! David pulls one back for Canada! 2-1'},
    {min:44, type:'yellow', team:'CAN',  text:'Yellow card — Adams'},
    {min:33, type:'goal',   team:'ENG',  text:'GOAL! Foden doubles the lead! 2-0'},
    {min:21, type:'goal',   team:'ENG',  text:'GOAL! Bellingham opens the scoring! 1-0'},
    {min:8,  type:'chance', team:'CAN',  text:'Davies blasts over from the left flank'},
    {min:1,  type:'kickoff',team:'',     text:'Kick-off at MetLife Stadium'},
  ],
};

// ─── NEWS ────────────────────────────────────────────────────────────────────
const NEWS = {
  ARG: [
    {src:'ESPN',         time:'2h',  tag:'Squad',    title:'Scaloni confirms Messi to start despite minor knock',          senti:'pos'},
    {src:'Olé',          time:'5h',  tag:'Tactics',  title:'Argentina drilling set-piece routines ahead of France clash',   senti:'neu'},
    {src:'The Athletic', time:'9h',  tag:'Analysis', title:"Why La Albiceleste's midfield press is the tournament's best",  senti:'pos'},
    {src:'Reuters',      time:'1d',  tag:'Fitness',  title:'Di María managing fatigue, expected fit for knockouts',         senti:'neu'},
  ],
  FRA: [
    {src:"L'Équipe",     time:'1h',  tag:'Squad',    title:'Mbappé in record-breaking form: 4 goals in 2 games',           senti:'pos'},
    {src:'RMC Sport',    time:'4h',  tag:'Injury',   title:'Dembélé limps off in training — scan scheduled',               senti:'neg'},
    {src:'BBC Sport',    time:'8h',  tag:'Tactics',  title:'Deschamps hints at back-three switch vs Spain',                 senti:'neu'},
  ],
  BRA: [
    {src:'Globo Esporte',time:'2h',  tag:'Squad',    title:'Ancelotti backs teenager Endrick for a starting role',         senti:'pos'},
    {src:'ESPN Brasil',  time:'6h',  tag:'Fitness',  title:'Vinícius Jr. cleared after precautionary substitution',        senti:'neu'},
    {src:'Sky Sports',   time:'11h', tag:'Analysis', title:"Brazil's xG leads the group despite draw vs Spain",            senti:'pos'},
  ],
  ENG: [
    {src:'BBC Sport',    time:'1h',  tag:'Squad',    title:"Tuchel: 'Bellingham is the heartbeat of this team'",           senti:'pos'},
    {src:'The Guardian', time:'5h',  tag:'Pressure', title:'Can England finally end the trophy drought?',                  senti:'neu'},
    {src:'Sky Sports',   time:'10h', tag:'Injury',   title:'Shaw a doubt for opener with tight hamstring',                 senti:'neg'},
  ],
  ESP: [
    {src:'Marca',        time:'30m', tag:'Squad',    title:'Yamal magic: teenager named group-stage breakout star',        senti:'pos'},
    {src:'AS',           time:'3h',  tag:'Tactics',  title:"De la Fuente's possession game overwhelming opponents",        senti:'pos'},
    {src:'ESPN',         time:'7h',  tag:'Fitness',  title:'Rodri minutes managed after long club season',                 senti:'neu'},
  ],
  USA: [
    {src:'ESPN',         time:'43m', tag:'Live',     title:"LIVE: Balogun's goal puts USA ahead vs Panama",               senti:'pos'},
    {src:'ESPN',         time:'1h',  tag:'Squad',    title:'Pochettino names attacking XI to face Panama',                 senti:'pos'},
    {src:'The Athletic', time:'4h',  tag:'Home',     title:'Record home crowd at SoFi for World Cup opener',              senti:'pos'},
    {src:'Fox Sports',   time:'1d',  tag:'Injury',   title:'Reyna fitness in question after club season setback',         senti:'neg'},
  ],
  POR: [
    {src:'A Bola',       time:'2h',  tag:'Squad',    title:'Ronaldo chasing one more World Cup record at 41',             senti:'pos'},
    {src:'Record',       time:'6h',  tag:'Tactics',  title:'Martínez balances youth and experience up front',             senti:'neu'},
    {src:'Goal',         time:'12h', tag:'Analysis', title:"Portugal's golden midfield the envy of the tournament",       senti:'pos'},
  ],
  GER: [
    {src:'Kicker',       time:'1h',  tag:'Squad',    title:'Nagelsmann hands Wirtz the creative keys',                    senti:'pos'},
    {src:'Bild',         time:'5h',  tag:'Pressure', title:'Home expectations rising after strong qualifying',            senti:'neu'},
    {src:'DW Sports',    time:'10h', tag:'Injury',   title:'Neuer fitness monitored ahead of crucial fixtures',           senti:'neg'},
  ],
};

// ─── SENTIMENT ───────────────────────────────────────────────────────────────
const SENTIMENT_TREND = {
  ARG: [72,78,75,83,88,86,91], FRA: [80,82,79,85,81,78,84],
  BRA: [70,74,72,76,80,77,79], ENG: [60,65,62,70,68,71,73],
  ESP: [75,80,82,84,86,85,88], USA: [68,70,74,79,76,80,82],
  POR: [72,75,70,76,78,79,80], GER: [65,68,66,72,70,74,76],
  CRO: [70,72,68,74,76,74,77], NED: [65,68,70,72,74,76,78],
  URU: [62,64,66,68,70,70,72], COL: [65,68,70,72,74,76,78],
  MAR: [72,74,76,78,80,80,82], JPN: [68,70,70,72,74,74,76],
  AUS: [58,60,62,64,66,66,68], CAN: [65,68,70,70,72,70,72],
  PAN: [55,56,57,58,60,60,65],
};

// ─── GROUP STANDINGS ─────────────────────────────────────────────────────────
const GROUPS = {
  A: [
    {t:'ENG', p:1, w:1, d:0, l:0, gd:'+1', pts:3},
    {t:'CAN', p:1, w:0, d:0, l:1, gd:'-1', pts:0},
    {t:'USA', p:1, w:0, d:0, l:0, gd:'+1', pts:0}, // live
    {t:'PAN', p:1, w:0, d:0, l:0, gd:'-1', pts:0},
  ],
  B: [
    {t:'ESP', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
    {t:'CRO', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
  C: [
    {t:'ARG', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
  D: [
    {t:'FRA', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
  E: [
    {t:'GER', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
    {t:'POR', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
  G: [
    {t:'BRA', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
    {t:'COL', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
  H: [
    {t:'NED', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
    {t:'URU', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
  J: [
    {t:'MAR', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
    {t:'JPN', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
  K: [
    {t:'JPN', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
  L: [
    {t:'AUS', p:0, w:0, d:0, l:0, gd:'0',  pts:0},
  ],
};

module.exports = { TEAMS, FIXTURES, LIVE_EVENTS, NEWS, SENTIMENT_TREND, GROUPS };
