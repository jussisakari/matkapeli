// main.js – starts the game.
// Open index.html#galleria to see all drawings instead.
window.MP = window.MP || {};

MP.load();
MP.start(location.hash === '#galleria' ? MP.scenes.gallery : MP.scenes.start);
