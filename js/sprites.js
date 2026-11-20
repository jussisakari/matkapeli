// sprites.js – colors, pixel font, characters, clothes and all pixel pictures.
//
// Every picture is a list of text rows. Each letter is one pixel.
// A dot "." means an empty (see-through) pixel.
// Change a color in PALETTE and every picture using that letter changes!
window.MP = window.MP || {};

// ---------------------------------------------------------------------------
// PALETTE: which color each letter means
// ---------------------------------------------------------------------------
MP.PALETTE = {
  'K': '#1a1a2e', // black outline
  'W': '#ffffff', // white
  'w': '#d8dde6', // light gray (white in shadow)
  'g': '#8a93a6', // metal gray
  'S': '#f2c9a0', // skin
  'M': '#f08a8a', // pink cheeks
  'O': '#6b3e26', // shoes
  'B': '#a0643c', // wood
  'b': '#6e4226', // dark wood
  'D': '#c98a55', // light wood
  'R': '#e04848', // red
  'r': '#a83232', // dark red
  'Y': '#ffd23f', // yellow
  'y': '#f0a020', // orange
  'L': '#bfe6ff', // mirror / door glass
  'l': '#eef9ff', // shine on glass
  'N': '#4a78c8', // blue
  'n': '#2f4a8a', // dark blue
  'I': '#ff8fc0', // pink
  'C': '#fff4c2', // moon
  'c': '#e8d68a', // moon shadow
  'E': '#4caf50', // green
  'e': '#2e7d32', // dark green
};

// ---------------------------------------------------------------------------
// CHARACTERS: the girl and the boy. Letters A/a are the hair colors.
// ---------------------------------------------------------------------------
MP.CHARACTERS = {
  girl: { name: 'Tyttö', hair: 'hairGirl', colors: { A: '#8b4a2b', a: '#5e2f18' } },
  boy:  { name: 'Poika', hair: 'hairBoy',  colors: { A: '#e3b04b', a: '#b07d24' } },
};

// ---------------------------------------------------------------------------
// CLOTHES. Letters: shirt T/t, pants or skirt P/p, hat H/h.
// "stripe" paints every other row of the shirt with another color.
// "hidden" items (pyjamas) are worn at the start but not shown in the wardrobe.
// ---------------------------------------------------------------------------
MP.CLOTHES = {
  shirt: [
    { id: 'pyjama', name: 'Pyjama',   hidden: true, T: '#9fc8ff', t: '#6f9fe0', stripe: '#e6f2ff' },
    { id: 'red',    name: 'Punainen', T: '#e04848', t: '#a83232' },
    { id: 'yellow', name: 'Keltainen', T: '#ffd23f', t: '#d9a400' },
    { id: 'green',  name: 'Vihreä',   T: '#4caf50', t: '#2e7d32' },
    { id: 'sailor', name: 'Raita',    T: '#ffffff', t: '#c9d3e6', stripe: '#2f4a8a' },
  ],
  bottom: [
    { id: 'pyjama',      name: 'Pyjama',   hidden: true, layer: 'pants', P: '#9fc8ff', p: '#6f9fe0' },
    { id: 'jeans',       name: 'Farkut',   layer: 'pants', P: '#3f6fb5', p: '#2a4d85' },
    { id: 'brown',       name: 'Ruskeat',  layer: 'pants', P: '#8b5a2b', p: '#5e3a18' },
    { id: 'skirtPink',   name: 'Pinkki hame', layer: 'skirt', P: '#ff8fc0', p: '#d9659a' },
    { id: 'skirtPurple', name: 'Violetti hame', layer: 'skirt', P: '#9b6bd6', p: '#6e45a8' },
  ],
  hat: [
    { id: 'none',   name: 'Ei hattua' },
    { id: 'cap',    name: 'Lippis',    layer: 'cap',    H: '#e04848', h: '#a83232' },
    { id: 'beanie', name: 'Pipo',      layer: 'beanie', H: '#4a78c8', h: '#2f4a8a' },
    { id: 'sunhat', name: 'Aurinkohattu', layer: 'sunhat', H: '#ffe08a', h: '#e04848' },
  ],
};

// ---------------------------------------------------------------------------
// CHARACTER LAYERS (16 pixels wide, 28 tall). "y" = the row where the layer starts.
// They are drawn in this order: body → feet → pants/skirt → shirt → hair → hat.
// ---------------------------------------------------------------------------
MP.LAYERS = {
  body: { y: 0, rows: [
    '................',
    '................',
    '....KKKKKKKK....',
    '...KSSSSSSSSK...',
    '...KSSSSSSSSK...',
    '...KSSSSSSSSK...',
    '...KSSKSSSKSK...',
    '...KSSKSSSKSK...',
    '...KSMSSSSMSK...',
    '...KSSSSKKSSK...',
    '....KSSSSSSK....',
    '.....KKSSKK.....',
    '...KKSSSSSSKK...',
    '..KSSSSSSSSSSK..',
    '.KSSKSSSSSSKSSK.',
    '.KSSKSSSSSSKSSK.',
    '.KSSKSSSSSSKSSK.',
    '.KSSKSSSSSSKSSK.',
    '.KKKKSSSSSSKKKK.',
    '....KSSSSSSK....',
    '....KSSSSSSK....',
    '....KSSKKSSK....',
    '....KSSKKSSK....',
    '....KSSKKSSK....',
  ] },
  // Two walking frames for the feet: standing and stepping
  feet0: { y: 24, rows: [
    '....KSSKKSSK....',
    '....KOOKKOOK....',
    '...KOOOKKOOOK...',
    '...KKKKKKKKKK...',
  ] },
  feet1: { y: 24, rows: [
    '...KSSK..KSSK...',
    '...KOOK..KOOK...',
    '..KOOOK..KOOOK..',
    '..KKKKK..KKKKK..',
  ] },
  shirt: { y: 12, rows: [
    '...KKTTTTTTKK...',
    '..KTTTTTTTTTTK..',
    '.KTTKTTTTTTKTTK.',
    '.KTTKTTTTTTKTTK.',
    '.KttKTTTTTTKttK.',
    '.....TTTTTT.....',
    '.....tttttt.....',
  ] },
  pants: { y: 19, rows: [
    '....KPPPPPPK....',
    '....KPPPPPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '....KppKKppK....',
  ] },
  skirt: { y: 19, rows: [
    '....KPPPPPPK....',
    '...KPPPPPPPPK...',
    '..KPPPPPPPPPPK..',
    '..KppppppppppK..',
    '..KKKKKKKKKKKK..',
  ] },
  hairGirl: { y: 1, rows: [
    '....KKKKKKKK.KK.',
    '...KAAAAAAAAKIIK',
    '..KAAAAAAAAAAKK.',
    '..KAaAAaAAaAAK..',
    '..KAK......KAK..',
    '..KAK......KAK..',
    '..KAK......KAK..',
    '..KAK......KAK..',
    '..KAK......KAK..',
    '..KAAK....KAAK..',
    '..KAAK....KAAK..',
    '..KaaK....KaaK..',
    '...KK......KK...',
  ] },
  hairBoy: { y: 1, rows: [
    '....KKKKKKKK....',
    '...KAAAAAAAAK...',
    '..KAAAAAAAAAAK..',
    '..KAAaAAAaAAAK..',
    '...KA......AK...',
  ] },
  cap: { y: 0, rows: [
    '.....KKKKKK.....',
    '....KHHHHHHK....',
    '...KHHHHHHHHK...',
    '...KhhhhhhhhhhK.',
  ] },
  beanie: { y: 0, rows: [
    '......KWWK......',
    '....KKHHHHKK....',
    '...KHHHHHHHHK...',
    '...KHhHhHhHhK...',
    '...KhhhhhhhhK...',
  ] },
  sunhat: { y: 0, rows: [
    '................',
    '.....KKKKKK.....',
    '....KHHHHHHK....',
    '...KhhhhhhhhK...',
    'KHHHHHHHHHHHHHHK',
    '.KKKKKKKKKKKKKK.',
  ] },
};

// ---------------------------------------------------------------------------
// SPRITES: all other pictures
// ---------------------------------------------------------------------------
MP.SPRITES = {
  sun: [
    '.....Y.....',
    '.Y...Y...Y.',
    '..Y.yyy.Y..',
    '...yYYYy...',
    '..yYYYYYy..',
    'YYyYYYYYyYY',
    '..yYYYYYy..',
    '...yYYYy...',
    '..Y.yyy.Y..',
    '.Y...Y...Y.',
    '.....Y.....',
  ],
  moon: [
    '...CCCC...',
    '.CCCCCCCC.',
    '.CCcCCCCC.',
    'CCCCCCcCCC',
    'CCCCCCCCCC',
    'CCcCCCCCCC',
    'CCCCCcCCCC',
    '.CCCCCCCC.',
    '.CCCCCcCC.',
    '...CCCC...',
  ],
  star: [
    '..Y..',
    '.YWY.',
    'YWWWY',
    '.YWY.',
    '..Y..',
  ],
  sparkle: [
    '...W...',
    '...W...',
    '..WYW..',
    'WWYYYWW',
    '..WYW..',
    '...W...',
    '...W...',
  ],
  arrow: [
    '..KKKKK..',
    '..KYYYK..',
    '..KYYYK..',
    '..KYYYK..',
    'KKKYYYKKK',
    '.KYYYYYK.',
    '..KYYYK..',
    '...KYK...',
    '....K....',
  ],
  bird: [
    '...RR.....',
    '..KRRK....',
    '.KWWWWK...',
    'YKWKWWWK..',
    '.KWWWWWWKK',
    '..KWWWWWWK',
    '...KKKKKK.',
    '....Y..Y..',
  ],
  ball: [
    '..KKKK..',
    '.KRRWWK.',
    'KRRRWWWK',
    'KWWWRRRK',
    'KWWWRRRK',
    'KRRRWWWK',
    '.KRRWWK.',
    '..KKKK..',
  ],
  teddy: [
    '.KK......KK.',
    'KBBK....KBBK',
    'KBDKKKKKKDBK',
    '.KBBBBBBBBK.',
    '.KBKBBBBKBK.',
    '.KBBBDDBBBK.',
    '.KBBDKKDBBK.',
    '..KBBDDBBK..',
    '.KKBBBBBBKK.',
    'KBBKDDDDKBBK',
    'KBBKDDDDKBBK',
    '.KKBBBBBBKK.',
    '..KBBKKBBK..',
    '..KKK..KKK..',
  ],
  bed: [
    'KKKK....................................',
    'KDBK....................................',
    'KDBK....................................',
    'KDBK....................................',
    'KDBK.KKKKKKKK...........................',
    'KDBKKWWWWWWWWK..........................',
    'KDBKKWWWWWWWwKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KDBKKwwwwwwwwKNNNNNNNNNNNNNNNNNNNNNNKDBK',
    'KDBKKKKKKKKKKKNnNNNnNNNnNNNnNNNnNNNNKDBK',
    'KDBKNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNKDBK',
    'KDBKnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnKDBK',
    'KDBKWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWKDBK',
    'KDBKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKDBK',
    'KDBKBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBKDBK',
    'KDBKbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbKDBK',
    'KDBKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKDBK',
    'KDBK................................KDBK',
    'KKKK................................KKKK',
  ],
  // The glass is see-through: the scene draws the sky behind the window.
  window: [
    'KKKKKKKKKKKKKKKKKKKKKKKK',
    'KDDDDDDDDDDDDDDDDDDDDDDK',
    'KDKKKKKKKKKKKKKKKKKKKKDK',
    'KDKl.......KKl.......KDK',
    'KDK.l......KK.l......KDK',
    'KDK........KK........KDK',
    'KDK........KK........KDK',
    'KDK........KK........KDK',
    'KDK........KK........KDK',
    'KDKKKKKKKKKKKKKKKKKKKKDK',
    'KDKl.......KKl.......KDK',
    'KDK........KK........KDK',
    'KDK........KK........KDK',
    'KDK........KK........KDK',
    'KDK........KK........KDK',
    'KDK........KK........KDK',
    'KDKKKKKKKKKKKKKKKKKKKKDK',
    'KDDDDDDDDDDDDDDDDDDDDDDK',
    'KBBBBBBBBBBBBBBBBBBBBBBK',
    'KKKKKKKKKKKKKKKKKKKKKKKK',
  ],
  toilet: [
    'KKKKK.........',
    'KWWWK.........',
    'KWWWK.........',
    'KWWWK.........',
    'KWWWK.........',
    'KWWWK.........',
    'KWWWK.........',
    'KWWWKKKKKKKKK.',
    'KWWWwwwwwwwwwK',
    'KWWWKKKKKKKKKK',
    'KWWWWWWWWWWWK.',
    'KWWWWWWWWWWK..',
    '.KWWWWWWWWWK..',
    '..KWWWWWWWK...',
    '...KwWWWWK....',
    '...KwWWWWK....',
    '...KwWWWWK....',
    '..KwwWWWWWK...',
    '..KKKKKKKKK...',
  ],
  sink: [
    '.......KKK........',
    '.......KgK........',
    '.......KgKKKK.....',
    '.......KggggK.....',
    '.......KKKKgK.....',
    'KKKKKKKKKKKKKKKKKK',
    'KwwwwwwwwwwwwwwwwK',
    'KWWWWWWWWWWWWWWWWK',
    '.KWWWWWWWWWWWWWWK.',
    '..KWWWWWWWWWWWWK..',
    '...KKKKKKKKKKKK...',
    '......KWWWWK......',
    '......KwWWWK......',
    '......KwWWWK......',
    '......KwWWWK......',
    '......KwWWWK......',
    '......KwWWWK......',
    '......KwWWWK......',
    '......KwWWWK......',
    '......KwWWWK......',
    '......KwWWWK......',
    '.....KwWWWWWK.....',
    '....KKKKKKKKKK....',
  ],
  mirror: [
    '...KKKKKKKK...',
    '..KYYYYYYYYK..',
    '.KYlLLLLLLLYK.',
    'KYlLLLLLLLLLYK',
    'KYLlLLLLLLLLYK',
    'KYLLLLLLLLLLYK',
    'KYLLLLLLLLLLYK',
    'KYLLLLLLLLLLYK',
    'KYLLLLLLLLLLYK',
    'KYLLLLLLLLLLYK',
    'KYLLLLLLLLLLYK',
    'KYLLLLLLLLLLYK',
    '.KYLLLLLLLLYK.',
    '..KYYYYYYYYK..',
    '...KKKKKKKK...',
  ],
  // Toothbrush in a cup (on the sink)
  cup: [
    '...WW..',
    '...II..',
    '...I...',
    '...I...',
    '...I...',
    'KKKKKKK',
    'KnnnnnK',
    'KnnnnnK',
    'KnnnnnK',
    '.KnnnK.',
    '.KKKKK.',
  ],
  // Big toothbrush for the brushing game
  toothbrush: [
    '.WWWWWW.................',
    '.WwWwWw.................',
    'KKKKKKKKKKKKKKKKKKKKKK..',
    'KIIIIIIIIIIIIIIIIIIIIIK.',
    'KKKKKKKKKKKKKKKKKKKKKK..',
  ],
  wardrobe: [
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KDDDDDDDDDDDDDDDDDDDDDDDDDDK',
    'KBBBBBBBBBBBBBBBBBBBBBBBBBBK',
    'KBKKKKKKKKKKKKKKKKKKKKKKKKBK',
    'KBKBBBBBBBBBBKKBBBBBBBBBBKBK',
    'KBKBbbbbbbbbBKKBbbbbbbbbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbbbbbbbbBKKBbbbbbbbbBKBK',
    'KBKBBBBBBBBBBKKBBBBBBBBBBKBK',
    'KBKBBBBBBBBBBKKBBBBBBBBBBKBK',
    'KBKBBBBBBBBBYKKYBBBBBBBBBKBK',
    'KBKBBBBBBBBBBKKBBBBBBBBBBKBK',
    'KBKBBBBBBBBBBKKBBBBBBBBBBKBK',
    'KBKBbbbbbbbbBKKBbbbbbbbbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbDDDDDDbBKKBbDDDDDDbBKBK',
    'KBKBbbbbbbbbBKKBbbbbbbbbBKBK',
    'KBKBBBBBBBBBBKKBBBBBBBBBBKBK',
    'KBKBBBBBBBBBBKKBBBBBBBBBBKBK',
    'KBKKKKKKKKKKKKKKKKKKKKKKKKBK',
    'KBBBBBBBBBBBBBBBBBBBBBBBBBBK',
    'KbbbbbbbbbbbbbbbbbbbbbbbbbbK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKK......................KKK',
    'KKK......................KKK',
  ],
  door: [
    'KKKKKKKKKKKKKKKKKKKKKKKK',
    'KbbbbbbbbbbbbbbbbbbbbbbK',
    'KbKKKKKKKKKKKKKKKKKKKKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRRRRRKKKKKKKKRRRRRKbK',
    'KbKRRRRRKlLLLLLKRRRRRKbK',
    'KbKRRRRRKLlLLLLKRRRRRKbK',
    'KbKRRRRRKLLLLLLKRRRRRKbK',
    'KbKRRRRRKLLLLLLKRRRRRKbK',
    'KbKRRRRRKLLLLLLKRRRRRKbK',
    'KbKRRRRRKLLLLLLKRRRRRKbK',
    'KbKRRRRRKKKKKKKKRRRRRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRrrrrrrRRRRrrrrrrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrrrrrrRRRRrrrrrrRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRRRRRRRRRRRRRRRYYRKbK',
    'KbKRRRRRRRRRRRRRRRYYRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRrrrrrrRRRRrrrrrrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrRRRRrRRRRrRRRRrRKbK',
    'KbKRrrrrrrRRRRrrrrrrRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKRRRRRRRRRRRRRRRRRRKbK',
    'KbKrrrrrrrrrrrrrrrrrrKbK',
    'KbKKKKKKKKKKKKKKKKKKKKbK',
    'KbbbbbbbbbbbbbbbbbbbbbbK',
    'KKKKKKKKKKKKKKKKKKKKKKKK',
  ],
  // Pointing hand for the brushing tutorial
  hand: [
    '....KK......',
    '...KSSK.....',
    '...KSSK.....',
    '...KSSK.....',
    '...KSSKKK...',
    '.KKKSSKSSKK.',
    'KSSKSSKSSKSK',
    'KSSSSSSSSSSK',
    'KSSSSSSSSSSK',
    '.KSSSSSSSSK.',
    '.KSSSSSSSSK.',
    '..KKKKKKKK..',
  ],
};

// ---------------------------------------------------------------------------
// FONT: pixel letters, 7 rows tall. "X" = pixel, "." = empty.
// You can draw your own letters! Every row of one letter must be the same width.
// ---------------------------------------------------------------------------
MP.FONT = {
  'A': ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  'B': ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.'],
  'C': ['.XXX.', 'X...X', 'X....', 'X....', 'X....', 'X...X', '.XXX.'],
  'D': ['XXXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'XXXX.'],
  'E': ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  'F': ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'X....'],
  'G': ['.XXX.', 'X...X', 'X....', 'X.XXX', 'X...X', 'X...X', '.XXXX'],
  'H': ['X...X', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  'I': ['XXX', '.X.', '.X.', '.X.', '.X.', '.X.', 'XXX'],
  'J': ['..XXX', '...X.', '...X.', '...X.', 'X..X.', 'X..X.', '.XX..'],
  'K': ['X...X', 'X..X.', 'X.X..', 'XX...', 'X.X..', 'X..X.', 'X...X'],
  'L': ['X....', 'X....', 'X....', 'X....', 'X....', 'X....', 'XXXXX'],
  'M': ['X...X', 'XX.XX', 'X.X.X', 'X.X.X', 'X...X', 'X...X', 'X...X'],
  'N': ['X...X', 'X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X', 'X...X'],
  'O': ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  'P': ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X....', 'X....', 'X....'],
  'Q': ['.XXX.', 'X...X', 'X...X', 'X...X', 'X.X.X', 'X..X.', '.XX.X'],
  'R': ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X.X..', 'X..X.', 'X...X'],
  'S': ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  'T': ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', '..X..'],
  'U': ['X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  'V': ['X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.X.X.', '..X..'],
  'W': ['X...X', 'X...X', 'X...X', 'X.X.X', 'X.X.X', 'XX.XX', 'X...X'],
  'X': ['X...X', 'X...X', '.X.X.', '..X..', '.X.X.', 'X...X', 'X...X'],
  'Y': ['X...X', 'X...X', '.X.X.', '..X..', '..X..', '..X..', '..X..'],
  'Z': ['XXXXX', '....X', '...X.', '..X..', '.X...', 'X....', 'XXXXX'],
  'Å': ['..X..', '.....', '.XXX.', 'X...X', 'XXXXX', 'X...X', 'X...X'],
  'Ä': ['.X.X.', '.....', '.XXX.', 'X...X', 'XXXXX', 'X...X', 'X...X'],
  'Ö': ['.X.X.', '.....', '.XXX.', 'X...X', 'X...X', 'X...X', '.XXX.'],
  '0': ['.XXX.', 'X...X', 'X..XX', 'X.X.X', 'XX..X', 'X...X', '.XXX.'],
  '1': ['.X.', 'XX.', '.X.', '.X.', '.X.', '.X.', 'XXX'],
  '2': ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.X...', 'XXXXX'],
  '3': ['XXXX.', '....X', '....X', '.XXX.', '....X', '....X', 'XXXX.'],
  '4': ['...X.', '..XX.', '.X.X.', 'X..X.', 'XXXXX', '...X.', '...X.'],
  '5': ['XXXXX', 'X....', 'XXXX.', '....X', '....X', 'X...X', '.XXX.'],
  '6': ['.XXX.', 'X....', 'X....', 'XXXX.', 'X...X', 'X...X', '.XXX.'],
  '7': ['XXXXX', '....X', '...X.', '..X..', '.X...', '.X...', '.X...'],
  '8': ['.XXX.', 'X...X', 'X...X', '.XXX.', 'X...X', 'X...X', '.XXX.'],
  '9': ['.XXX.', 'X...X', 'X...X', '.XXXX', '....X', '....X', '.XXX.'],
  '!': ['X', 'X', 'X', 'X', 'X', '.', 'X'],
  '?': ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.....', '..X..'],
  '.': ['.', '.', '.', '.', '.', '.', 'X'],
  ',': ['..', '..', '..', '..', '..', '.X', 'X.'],
  ':': ['.', 'X', '.', '.', '.', 'X', '.'],
  '-': ['...', '...', '...', 'XXX', '...', '...', '...'],
  '/': ['....X', '...X.', '...X.', '..X..', '.X...', '.X...', 'X....'],
  "'": ['X', 'X', '.', '.', '.', '.', '.'],
  '…': ['.....', '.....', '.....', '.....', '.....', '.....', 'X.X.X'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
};

// ===========================================================================
// Drawing code (you don't need to change anything below this line)
// ===========================================================================
(function () {
  const spriteCache = {};
  const charCache = {};

  // Turns text rows into a small canvas. colorOf(letter, x, y) gives the color.
  function gridToCanvas(rows, colorOf, w, h, offsetY) {
    const c = document.createElement('canvas');
    c.width = w || rows[0].length;
    c.height = h || rows.length;
    paintRows(c.getContext('2d'), rows, colorOf, offsetY || 0);
    return c;
  }

  function paintRows(g, rows, colorOf, offsetY) {
    rows.forEach((row, ry) => {
      const y = ry + offsetY;
      for (let x = 0; x < row.length; x++) {
        const ch = row[x];
        if (ch === '.') continue;
        const color = colorOf(ch, x, y);
        if (!color) continue;
        g.fillStyle = color;
        g.fillRect(x, y, 1, 1);
      }
    });
  }

  function flipped(src) {
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const g = c.getContext('2d');
    g.translate(src.width, 0);
    g.scale(-1, 1);
    g.drawImage(src, 0, 0);
    return c;
  }

  // MP.sprite('sun') → a canvas (made once, then reused)
  MP.sprite = function (name, flip) {
    const key = name + (flip ? '|f' : '');
    if (spriteCache[key]) return spriteCache[key];
    let c;
    if (flip) {
      c = flipped(MP.sprite(name));
    } else {
      const rows = MP.SPRITES[name];
      if (!rows) throw new Error('No sprite called "' + name + '"');
      c = gridToCanvas(rows, (ch) => MP.PALETTE[ch]);
    }
    spriteCache[key] = c;
    return c;
  };

  // MP.drawSprite(ctx, 'sun', x, y, { flip, scale }) – x, y = top-left corner
  MP.drawSprite = function (ctx, name, x, y, opts) {
    opts = opts || {};
    const c = MP.sprite(name, opts.flip);
    const s = opts.scale || 1;
    ctx.drawImage(c, Math.round(x), Math.round(y), c.width * s, c.height * s);
  };

  // Finds a clothing item by id. Unknown ids give the first item (pyjamas / no hat).
  MP.findItem = function (slot, id) {
    const list = MP.CLOTHES[slot];
    return list.find((it) => it.id === id) || list[0];
  };

  MP.CHAR_W = 16;
  MP.CHAR_H = 28;

  // Builds the character picture: body + feet + clothes + hair + hat.
  MP.characterCanvas = function (charId, outfit, frame, flip) {
    charId = MP.CHARACTERS[charId] ? charId : 'girl';
    outfit = outfit || {};
    frame = frame ? 1 : 0;
    const shirt = MP.findItem('shirt', outfit.shirt);
    const bottom = MP.findItem('bottom', outfit.bottom);
    const hat = MP.findItem('hat', outfit.hat);
    const key = [charId, shirt.id, bottom.id, hat.id, frame, flip ? 'f' : ''].join('|');
    if (charCache[key]) return charCache[key];

    if (flip) {
      charCache[key] = flipped(MP.characterCanvas(charId, outfit, frame, false));
      return charCache[key];
    }

    const ch = MP.CHARACTERS[charId];
    const base = Object.assign({}, MP.PALETTE, ch.colors);
    const c = document.createElement('canvas');
    c.width = MP.CHAR_W;
    c.height = MP.CHAR_H;
    const g = c.getContext('2d');

    function layer(name, colors, special) {
      const L = MP.LAYERS[name];
      if (!L) return;
      const pal = Object.assign({}, base, colors);
      paintRows(g, L.rows, (letter, x, y) => (special && special(letter, x, y)) || pal[letter], L.y);
    }

    layer('body');
    layer(frame ? 'feet1' : 'feet0');
    layer(bottom.layer || 'pants', { P: bottom.P, p: bottom.p });
    layer('shirt', { T: shirt.T, t: shirt.t }, (letter, x, y) =>
      (letter === 'T' && shirt.stripe && y % 2 === 0) ? shirt.stripe : null);
    layer(ch.hair);
    if (hat.layer) layer(hat.layer, { H: hat.H, h: hat.h });

    charCache[key] = c;
    return c;
  };

  // Draws the character so that (x, y) is the middle of the feet.
  // opts: { character, outfit, frame, flip, scale } (defaults come from MP.state)
  MP.drawCharacter = function (ctx, x, y, opts) {
    opts = opts || {};
    const st = MP.state || {};
    const c = MP.characterCanvas(
      opts.character || st.character || 'girl',
      opts.outfit || st.outfit,
      opts.frame || 0,
      !!opts.flip
    );
    const s = opts.scale || 1;
    ctx.drawImage(c, Math.round(x - (c.width * s) / 2), Math.round(y - c.height * s), c.width * s, c.height * s);
  };
})();
