// maskedsinger.js – all the Masked Singer Suomi characters for the evening TV.
// Our own simple cartoons of this season's costumes. Each evening the TV shows
// three of them (tvshow.js picks them), each with its own tune and dance, and
// after every song Janne Kataja says something funny about the character.
//   draw(c, lt, sing): drawn in the TV picture (160 × 100), the feet at y = 82.
window.MP = window.MP || {};

(function () {
  const MP = window.MP;
  const O = '#2b2340';
  const ell = (c, x, y, rx, ry, rot, fill) => {
    c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    c.fillStyle = fill; c.fill(); c.stroke();
  };
  const mouthOpen = (lt, sing) => (sing ? 1 + Math.abs(Math.sin(lt * 8)) * 2.2 : 0.6);
  const eyes = (c, x1, x2, y, r, pupil, look) => {
    ell(c, x1, y, r, r * 1.1, 0, '#ffffff');
    ell(c, x2, y, r, r * 1.1, 0, '#ffffff');
    c.fillStyle = pupil || O;
    c.beginPath(); c.arc(x1 + (look || 0), y + 0.5, r * 0.5, 0, Math.PI * 2); c.arc(x2 + (look || 0), y + 0.5, r * 0.5, 0, Math.PI * 2); c.fill();
  };
  const legs = (c, color, shoe) => {
    c.fillStyle = color;
    c.fillRect(72, 68, 5, 14); c.strokeRect(72, 68, 5, 14);
    c.fillRect(83, 68, 5, 14); c.strokeRect(83, 68, 5, 14);
    ell(c, 74.5, 82, 4, 1.8, 0, shoe || O);
    ell(c, 85.5, 82, 4, 1.8, 0, shoe || O);
  };
  const mic = (c, lt) => {
    c.fillStyle = '#2b2b33'; c.fillRect(99, 40 + Math.sin(lt * 2) * 2, 3, 7);
    ell(c, 100.5, 39 + Math.sin(lt * 2) * 2, 2.6, 2.6, 0, '#8a93a6');
  };

  const SINGERS = [
    {
      id: 'vappu', name: 'VAPPU', step: 0.25, wave: 'triangle',
      tune: [72, 74, 76, 77, 79, 77, 76, 74, 72, 79, 76, 72],
      jokes: ['Jos tuo nauraa vielä kerran, ilmapallot vievät hänet kattoon!', 'Vappu! Nyt tekee mieli munkkia ja simaa!'],
      draw(c, lt, sing) {
        legs(c, '#ff9fe0', '#ffd23f');
        // the dress of balloons (they bounce)
        const cols = ['#ff5d8f', '#ffd23f'];
        for (let i = 0; i < 14; i++) {
          const bx = 64 + (i % 5) * 8 + (Math.floor(i / 5) % 2) * 4, by = 52 + Math.floor(i / 5) * 7 + Math.sin(lt * 8 + i) * 1.2;
          ell(c, bx, by, 4.2, 4.6, 0, cols[i % 2]);
        }
        // rainbow hair and a sparkly mask
        const rb = ['#ff5d5d', '#ffb02e', '#ffe14a', '#5dd65d', '#4cc9f0', '#b388ff'];
        rb.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.ellipse(80, 30 - i * 0.5, 15 - i * 1.4, 18 - i * 1.2, 0, Math.PI, 0); c.fill(); });
        ell(c, 80, 32, 9, 11, 0, '#f6cfa8');
        ell(c, 80, 29, 9, 3.5, 0, '#ff5fd0');
        for (let i = 0; i < 5; i++) { c.fillStyle = '#ffffff'; c.fillRect(73 + i * 3.4, 28 + (i % 2), 1, 1); }
        ell(c, 80, 37, 2.5, mouthOpen(lt, sing), 0, '#b0203a');
        // a balloon on a string in the hand
        c.beginPath(); c.moveTo(63, 52); c.lineTo(52, 30 + Math.sin(lt * 2) * 2); c.stroke();
        ell(c, 52, 24 + Math.sin(lt * 2) * 2, 6, 7, 0, '#ff5d8f');
        mic(c, lt);
      },
    },
    {
      id: 'kuoriainen', name: 'KUORIAINEN', step: 0.3, wave: 'square',
      tune: [60, 64, 67, 72, 67, 64, 62, 65, 69, 74, 69, 65],
      jokes: ['Tuntosarvet heiluvat tahdissa – parempi rytmi kuin minulla!', 'Kuoriainen! Minä etsin sinut puutarhasta seuraavaksi!'],
      draw(c, lt, sing) {
        legs(c, '#2bb3a3', '#2bb3a3');
        // the pink beetle body
        ell(c, 80, 54, 18, 17, 0, '#ff9fd0');
        c.beginPath(); c.moveTo(80, 38); c.lineTo(80, 70); c.stroke();
        ell(c, 72, 50, 3, 3, 0, '#ff6fb0'); ell(c, 88, 58, 3, 3, 0, '#ff6fb0');
        // the head with big round blue eyes
        ell(c, 80, 28, 11, 10, 0, '#ff9fd0');
        eyes(c, 75, 85, 27, 4.2, '#2f6fb8');
        ell(c, 80, 34, 2.4, mouthOpen(lt, sing), 0, '#b0203a');
        // the long antenna loop (it wiggles to the music)
        c.save(); c.strokeStyle = '#ff6fb0'; c.lineWidth = 1.6;
        c.beginPath(); c.moveTo(80, 18); c.bezierCurveTo(70 + Math.sin(lt * 6) * 4, -4, 104, -6, 98 + Math.sin(lt * 6) * 3, 20); c.stroke();
        c.restore();
        // teal arms
        c.save(); c.strokeStyle = '#2bb3a3'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(64, 50); c.lineTo(56, 42 + Math.sin(lt * 6) * 4); c.moveTo(96, 50); c.lineTo(100, 44); c.stroke();
        c.restore();
        mic(c, lt);
      },
    },
    {
      id: 'ai', name: 'AI', step: 0.22, wave: 'sawtooth',
      tune: [69, 76, 69, 74, 69, 72, 71, 69, 76, 81, 76, 69],
      jokes: ['Robotti joka tanssii balettia? Minä en osaa edes kävellä suoraan!', 'AI! Osaatko laskea, montako paljettia minun takissani on?'],
      draw(c, lt, sing) {
        // spins on one toe
        c.save();
        c.translate(80, 0); c.scale(Math.cos(lt * 3) > -0.2 ? 1 : -1, 1); c.translate(-80, 0);
        c.fillStyle = '#d8dde6';
        c.fillRect(78, 66, 4, 16); c.strokeRect(78, 66, 4, 16);
        // the silver tutu
        c.beginPath(); c.moveTo(60, 64); c.lineTo(100, 64); c.lineTo(92, 58); c.lineTo(68, 58); c.closePath(); c.fillStyle = '#eef2f8'; c.fill(); c.stroke();
        ell(c, 80, 48, 9, 12, 0, '#c9d1db');
        // the round silver head with one big purple eye
        ell(c, 80, 26, 11, 11, 0, '#d8dde6');
        ell(c, 80, 25, 6, 6, 0, '#ffffff');
        ell(c, 80, 25, 4, 4, 0, '#8a3fd0');
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(78.5, 23.5, 1.2, 0, Math.PI * 2); c.fill();
        ell(c, 80, 33, 3, mouthOpen(lt, sing) * 0.6, 0, '#5a5a73');
        c.save(); c.strokeStyle = '#c9d1db'; c.lineWidth = 2.4;
        c.beginPath(); c.moveTo(71, 42); c.lineTo(62, 30); c.moveTo(89, 42); c.lineTo(98, 30); c.stroke();
        c.restore();
        c.restore();
      },
    },
    {
      id: 'opossumi', name: 'OPOSSUMI', step: 0.34, wave: 'triangle',
      tune: [62, 62, 66, 69, 66, 62, 64, 64, 67, 71, 67, 64],
      jokes: ['Haalarit ja hyvä ääni – minä otan kaksi!', 'Opossumi! Sinulla on söpömpi nenä kuin minulla!'],
      draw(c, lt, sing) {
        legs(c, '#3f6fb5', '#5a5a73');
        // blue overalls
        c.fillStyle = '#3f6fb5';
        MP.roundRect(c, 66, 42, 28, 28, 4); c.fill(); c.stroke();
        c.fillRect(70, 36, 3, 8); c.fillRect(87, 36, 3, 8);
        ell(c, 80, 40, 12, 6, 0, '#c9c9d0');
        // grey-white head with a pink nose
        ell(c, 80, 26, 12, 11, 0, '#ffffff');
        ell(c, 69, 16, 4, 4, 0, '#c9c9d0'); ell(c, 91, 16, 4, 4, 0, '#c9c9d0');
        eyes(c, 75, 85, 24, 2.6);
        ell(c, 80, 31, 3, 2, 0, '#ff8fc0');
        ell(c, 80, 35, 2, mouthOpen(lt, sing) * 0.7, 0, '#b0203a');
        // the long tail swishing
        c.save(); c.strokeStyle = '#ff9fc0'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(66, 66); c.quadraticCurveTo(50, 70 + Math.sin(lt * 4) * 4, 48, 56); c.stroke();
        c.restore();
        mic(c, lt);
      },
    },
    {
      id: 'mangusti', name: 'HURJA MANGUSTI', step: 0.2, wave: 'square',
      tune: [64, 67, 69, 67, 64, 62, 64, 67, 72, 71, 69, 67],
      jokes: ['Kieli pitkällä – minä teen noin, kun näen pullaa!', 'Hurja mangusti! Hurjin tanssi koko kaudella!'],
      draw(c, lt, sing) {
        legs(c, '#8a5a32', '#2b2b33');
        // a red jacket and a white shirt
        c.fillStyle = '#d33a3a'; MP.roundRect(c, 64, 40, 32, 30, 5); c.fill(); c.stroke();
        c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(74, 40); c.lineTo(80, 60); c.lineTo(86, 40); c.closePath(); c.fill();
        // the furry brown head
        ell(c, 80, 26, 13, 12, 0, '#a07048');
        for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(68 + i * 4, 16); c.lineTo(69 + i * 4, 10 + (i % 2) * 2); c.lineTo(71 + i * 4, 16); c.fillStyle = '#a07048'; c.fill(); }
        // the red round glasses
        c.save(); c.strokeStyle = '#e04848'; c.lineWidth = 1.6;
        c.beginPath(); c.arc(75, 24, 4, 0, Math.PI * 2); c.moveTo(89, 24); c.arc(85, 24, 4, 0, Math.PI * 2); c.stroke();
        c.restore();
        c.fillStyle = O; c.beginPath(); c.arc(75, 24, 1.4, 0, Math.PI * 2); c.arc(85, 24, 1.4, 0, Math.PI * 2); c.fill();
        // the tongue out!
        ell(c, 80, 33, 3, 1.6, 0, '#5a2a1a');
        ell(c, 81, 37 + Math.sin(lt * 10) * 0.6, 2, 3, 0.2, '#ff6f8f');
        mic(c, lt);
      },
    },
    {
      id: 'molli', name: 'MOLLI', step: 0.4, wave: 'sine',
      tune: [67, 71, 74, 71, 67, 64, 66, 69, 72, 69, 66, 62],
      jokes: ['Niin pehmeä, että haluan halata televisiota!', 'Molli! Saanko lainata tuota sydäntä?'],
      draw(c, lt, sing) {
        legs(c, '#ffb7d0', '#ff8fc0');
        // the pink dress with a heart
        c.beginPath(); c.moveTo(66, 44); c.lineTo(94, 44); c.lineTo(100, 70); c.lineTo(60, 70); c.closePath(); c.fillStyle = '#ff8fc0'; c.fill(); c.stroke();
        c.fillStyle = '#e0306a';
        c.beginPath(); c.moveTo(80, 60); c.bezierCurveTo(72, 54, 74, 46, 80, 51); c.bezierCurveTo(86, 46, 88, 54, 80, 60); c.fill();
        // the soft fluffy pink head
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; ell(c, 80 + Math.cos(a) * 10, 26 + Math.sin(a) * 10, 5, 5, 0, '#ffc6dc'); }
        ell(c, 80, 26, 11, 11, 0, '#ffc6dc');
        eyes(c, 75, 85, 25, 2.8);
        c.save(); c.lineWidth = 0.8;
        for (const ex of [75, 85]) for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(ex + k * 1.6, 22); c.lineTo(ex + k * 2.4, 19.5); c.stroke(); }   // long eyelashes
        c.restore();
        ell(c, 80, 31, 1.4, 1, 0, '#e0306a');
        ell(c, 80, 34.5, 2, mouthOpen(lt, sing) * 0.7, 0, '#b0203a');
        mic(c, lt);
      },
    },
    {
      id: 'etsiva', name: 'ETSIVÄ', step: 0.3, wave: 'triangle',
      tune: [57, 60, 64, 63, 62, 60, 57, 59, 60, 62, 64, 57],
      jokes: ['Etsivä! Etsi minulle kadonneet autonavaimet!', 'Kuka on maskin takana? Etsivä varmaan tietää!'],
      draw(c, lt, sing) {
        legs(c, '#6b4a2a', '#3a2a1a');
        // the brown checked coat
        c.fillStyle = '#9a7a52'; MP.roundRect(c, 64, 38, 32, 34, 4); c.fill(); c.stroke();
        c.save(); c.strokeStyle = 'rgba(80,50,20,0.5)'; c.lineWidth = 0.7;
        for (let x = 66; x < 96; x += 5) { c.beginPath(); c.moveTo(x, 38); c.lineTo(x, 72); c.stroke(); }
        for (let y = 42; y < 72; y += 5) { c.beginPath(); c.moveTo(64, y); c.lineTo(96, y); c.stroke(); }
        c.restore();
        // curly hair, the face, a moustache
        for (let i = 0; i < 6; i++) ell(c, 70 + i * 4, 22 + (i % 2) * 2, 4, 4, 0, '#d8a050');
        ell(c, 80, 28, 10, 10, 0, '#f6e6d8');
        eyes(c, 76, 84, 27, 2.6, '#4a78c8');
        ell(c, 80, 34, 6, 1.8, 0, '#8a5a32');
        ell(c, 80, 36.5, 1.8, mouthOpen(lt, sing) * 0.6, 0, '#b0203a');
        // the checked cap
        c.fillStyle = '#9a7a52'; c.beginPath(); c.ellipse(80, 19, 12, 5, 0, Math.PI, 0); c.fill(); c.stroke();
        c.fillRect(66, 18, 28, 2.5); c.strokeRect(66, 18, 28, 2.5);
        // the magnifying glass, looking around
        const lx = 56 + Math.sin(lt * 2) * 4;
        c.save(); c.lineWidth = 2; c.strokeStyle = '#6b4a2a'; c.beginPath(); c.moveTo(64, 52); c.lineTo(lx + 3, 46); c.stroke(); c.restore();
        ell(c, lx, 42, 5, 5, 0, 'rgba(191,230,255,0.7)');
      },
    },
    {
      id: 'myrkky', name: 'MYRKKY', step: 0.45, wave: 'sine',
      tune: [57, 60, 63, 62, 60, 58, 57, 55, 57, 60, 63, 57],
      jokes: ['Hatussa on enemmän tilaa kuin minun asunnossani!', 'Myrkky! Mysteerinen, mutta niin hieno laulu!'],
      draw(c, lt, sing) {
        legs(c, '#2b2b33', '#111116');
        // the black feathery coat
        c.fillStyle = '#26262e';
        c.beginPath(); c.moveTo(66, 40); c.lineTo(94, 40); c.lineTo(102, 74); c.lineTo(58, 74); c.closePath(); c.fill(); c.stroke();
        for (let i = 0; i < 8; i++) { c.fillStyle = '#3a3a46'; c.beginPath(); c.ellipse(60 + i * 6, 72, 3, 6, 0.3, 0, Math.PI * 2); c.fill(); }
        // a pale friendly face
        ell(c, 80, 28, 10, 11, 0, '#ece6f2');
        c.fillStyle = '#6a3fb5'; c.beginPath(); c.ellipse(76, 27, 2.4, 2, 0, 0, Math.PI * 2); c.ellipse(84, 27, 2.4, 2, 0, 0, Math.PI * 2); c.fill();
        ell(c, 80, 34, 2.2, mouthOpen(lt, sing) * 0.7, 0, '#6a1a3a');
        // the tall top hat with roses
        c.fillStyle = '#111116'; c.fillRect(70, 2, 20, 16); c.strokeRect(70, 2, 20, 16);
        c.fillRect(64, 17, 32, 3); c.strokeRect(64, 17, 32, 3);
        ell(c, 74, 15, 2.6, 2.6, 0, '#d33a3a'); ell(c, 79, 14, 2.4, 2.4, 0, '#d33a3a');
        mic(c, lt);
      },
    },
    {
      id: 'keiju', name: 'KEIJU', step: 0.26, wave: 'sine',
      tune: [76, 79, 83, 81, 79, 76, 74, 77, 81, 79, 77, 74],
      jokes: ['Toivon että keiju toteuttaa toiveen: lisää lauluja!', 'Keiju! Lennätkö minut kotiin laulamaan?'],
      draw(c, lt, sing) {
        // see-through wings (they flutter)
        const fl = Math.abs(Math.sin(lt * 10));
        c.save(); c.globalAlpha = 0.6;
        ell(c, 66 - fl * 3, 40, 9, 14, -0.4, '#dcd0ff');
        ell(c, 94 + fl * 3, 40, 9, 14, 0.4, '#dcd0ff');
        c.restore();
        legs(c, '#c9b8e8', '#b388ff');
        c.beginPath(); c.moveTo(70, 42); c.lineTo(90, 42); c.lineTo(98, 70); c.lineTo(62, 70); c.closePath(); c.fillStyle = '#b388ff'; c.fill(); c.stroke();
        for (let i = 0; i < 6; i++) { c.fillStyle = '#ffffff'; c.fillRect(66 + i * 5, 52 + (i % 2) * 8, 1.2, 1.2); }
        ell(c, 80, 27, 11, 11, 0, '#d8c8f8');
        eyes(c, 75, 85, 26, 3.6, '#3cb371');
        ell(c, 80, 33, 2, mouthOpen(lt, sing) * 0.7, 0, '#b0203a');
        // the flower crown
        for (let i = 0; i < 5; i++) ell(c, 71 + i * 4.5, 17 - Math.abs(i - 2) * -0.6, 2.4, 2.4, 0, ['#ff8fc0', '#ffd23f', '#ffffff', '#ffd23f', '#ff8fc0'][i]);
        // a little wand with a star
        c.beginPath(); c.moveTo(96, 50); c.lineTo(104, 36); c.stroke();
        MP.drawText(c, '★', 104, 30 + Math.sin(lt * 4), { size: 0.7, color: '#ffe680', align: 'center' });
      },
    },
    {
      id: 'rasynukke', name: 'RÄSYNUKKE', step: 0.32, wave: 'triangle',
      tune: [60, 62, 64, 65, 67, 67, 69, 67, 65, 64, 62, 60],
      jokes: ['Lankatukka! Minä haluan samanlaisen!', 'Räsynukke! Niin söpö, että tekee mieli leikkiä nukkekotia!'],
      draw(c, lt, sing) {
        legs(c, '#ffffff', '#4cc9f0');
        // the flowery blue dress
        c.beginPath(); c.moveTo(68, 42); c.lineTo(92, 42); c.lineTo(100, 70); c.lineTo(60, 70); c.closePath(); c.fillStyle = '#bfe6ff'; c.fill(); c.stroke();
        for (let i = 0; i < 7; i++) ell(c, 66 + i * 5, 56 + (i % 2) * 6, 2, 2, 0, '#ffd23f');
        c.fillStyle = '#4cc9f0'; c.fillRect(70, 46, 20, 3);
        // orange yarn hair (swinging)
        c.save(); c.strokeStyle = '#ff9a3a'; c.lineWidth = 2;
        for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(68 + i * 3, 18); c.lineTo(64 + i * 4 + Math.sin(lt * 5 + i) * 2, 44); c.stroke(); }
        c.restore();
        ell(c, 80, 28, 10, 10, 0, '#f6cfa8');
        eyes(c, 75, 85, 27, 3.6);
        c.save(); c.lineWidth = 0.6; c.beginPath(); c.moveTo(70, 33); c.lineTo(73, 33); c.moveTo(87, 33); c.lineTo(90, 33); c.stroke(); c.restore();   // stitched cheeks
        ell(c, 80, 34, 2, mouthOpen(lt, sing) * 0.6, 0, '#b0203a');
        mic(c, lt);
      },
    },
    {
      id: 'dingo', name: 'DINGO', step: 0.24, wave: 'square',
      tune: [55, 59, 62, 59, 55, 62, 64, 62, 59, 57, 55, 50],
      jokes: ['Vihreä ja hampaat – onko se kurkku, joka laulaa?', 'Dingo! Pelottavin hymy, mutta kiltein laulu!'],
      draw(c, lt, sing) {
        legs(c, '#8a3fd0', '#a8e04a');
        // a lime-green blob (it wobbles)
        const wob = Math.sin(lt * 6) * 2;
        c.beginPath();
        c.moveTo(60, 70);
        c.bezierCurveTo(52, 50, 60 + wob, 16, 80, 18);
        c.bezierCurveTo(100 - wob, 16, 108, 50, 100, 70);
        c.closePath();
        c.fillStyle = '#b6e83a'; c.fill(); c.stroke();
        for (const [px, py] of [[66, 30], [96, 34], [70, 58], [94, 60]]) ell(c, px, py, 4, 3, 0, '#a050d0');
        eyes(c, 74, 86, 36, 4, '#8a3fd0');
        // the big toothy smile
        c.beginPath(); c.moveTo(68, 48); c.quadraticCurveTo(80, 58 + mouthOpen(lt, sing) * 2, 92, 48); c.closePath(); c.fillStyle = '#5a1a6a'; c.fill(); c.stroke();
        c.fillStyle = '#ffffff';
        for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(70 + i * 4, 49); c.lineTo(72 + i * 4, 53); c.lineTo(74 + i * 4, 49); c.fill(); }
      },
    },
    {
      id: 'talkkari', name: 'TALKKARI', step: 0.3, wave: 'triangle',
      tune: [65, 65, 69, 72, 69, 65, 67, 67, 70, 74, 70, 67],
      jokes: ['Ensimmäinen kerrostalo, joka laulaa! Onko hissi mukana?', 'Talkkari! Sinulla on enemmän ikkunoita kuin minulla takissa paljetteja!'],
      draw(c, lt, sing) {
        legs(c, '#2b2b33', '#111116');
        // a yellow apartment house
        c.fillStyle = '#ffd25a';
        c.beginPath(); c.moveTo(62, 70); c.lineTo(62, 22); c.lineTo(80, 8); c.lineTo(98, 22); c.lineTo(98, 70); c.closePath(); c.fill(); c.stroke();
        ell(c, 80, 20, 4, 3, 0, '#bfe6ff');
        // the windows blink on and off to the music
        for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) {
          const on = Math.sin(lt * 5 + r * 1.3 + k * 2.1) > 0;
          c.fillStyle = on ? '#fff3a0' : '#5a7fa8';
          c.fillRect(67 + k * 16, 28 + r * 12, 9, 8); c.strokeRect(67 + k * 16, 28 + r * 12, 9, 8);
        }
        // the door is the mouth
        c.fillStyle = '#5a3a1e';
        c.fillRect(76, 64 - mouthOpen(lt, sing) * 1.5, 8, 6 + mouthOpen(lt, sing) * 1.5); c.strokeRect(76, 64 - mouthOpen(lt, sing) * 1.5, 8, 6 + mouthOpen(lt, sing) * 1.5);
      },
    },
  ];

  if (MP.MASKED) {
    for (const s of SINGERS) {
      MP.MASKED.singers.push({ id: s.id, name: s.name, step: s.step, wave: s.wave, tune: s.tune, jokes: s.jokes });
      MP.MASKED_DRAW[s.id] = s.draw;
    }
  }
})();
