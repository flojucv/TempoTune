const playlist = document.getElementById("playlist");
const lecteur = document.querySelector("#lecteur");
const cover = document.getElementById("cover");
const disque = document.getElementById("disque");
const btnPause = document.getElementById('btnPause');
const btnRandom = document.getElementById('btnRandom');
const imagePause = document.getElementById('pauseImage');
const btnMenu = document.getElementById('menu');
const menuMusic = document.getElementById('menuMusic');
const btnLoop = document.getElementById('btnLoop');
const volume = document.getElementById('volume');
const btnVolume = document.getElementById('btnVolume');

const urlApi = `https://api-jukebox.onrender.com/api/v1`;

let loop = false;
let random = true;
let lastMusicIndex = 0;

const config = {
  urlCover: "uploads/covers/",
  urlSound: "uploads/musics/",
  urlPauseImage: "./assets/pictures/pause.png",
  urlPlayImage: "./assets/pictures/play.png",
};

const startMusic = async (sound) => {
  lastMusicIndex = sound.id-1;
  let musique = await fetch(`http://localhost:3000/api/v1/downloads/sound/${sound.sound}`);
  musique = await musique.blob();
  const urlMusique = URL.createObjectURL(musique);
  lecteur.src = `${urlMusique}`;
  lecteur.play();
  let image = await fetch(`${urlApi}/downloads/cover/${sound.cover}`);
  image = await image.blob();
  const urlImage = URL.createObjectURL(image);
  cover.src = `${urlImage}`;
  if (disque.classList.contains("pause")) {
    disque.classList.remove("pause");
  }
  btnPause.disabled = false;
  imagePause.src = `${config.urlPauseImage}`;

}

const getData = async () => {
  const req = await fetch(`${urlApi}/music`);
  const dbMusics = await req.json();
  const data = dbMusics.result;
  data.forEach(async (music) => {
    let image = await fetch(`${urlApi}/downloads/cover/${music.cover}`);
    image = await image.blob();
    const urlImage = URL.createObjectURL(image);
    playlist.innerHTML += `<div id="${music.id}" class="music"><h2>${music.title}</h2><img src="${urlImage}" alt="${music.title}"/><div></div></div>`;
  });

  const allMusicDiv = document.querySelectorAll(".music");

  allMusicDiv.forEach((div) => {
    div.addEventListener('click', function () {
      const id = parseInt(div.id);
      const searchById = data.find((element) => element.id === id);
      //alert(`Veux-tu écouter le titre : ${searchById.title}`);
      startMusic(searchById);
    })
  });

  volume.value = lecteur.volume;
};
getData();

btnPause.addEventListener('click', () => {
  if (disque.classList.contains("pause")) {
    disque.classList.remove("pause");
    imagePause.src = `${config.urlPauseImage}`;
    lecteur.play();
  } else {
    disque.classList.add("pause");
    imagePause.src = `${config.urlPlayImage}`;
    lecteur.pause();
  }
})

btnMenu.addEventListener('click', () => {
  if (playlist.style.display === "none") {
    playlist.style.display = "block";
    btnMenu.innerText = '<MUSICS<';
  } else {
    playlist.style.display = "none";
    btnMenu.innerText = '>MUSICS>';
  }

})

btnLoop.addEventListener('click', () => {
  if (loop) {
    btnLoop.children[0].src = "./assets/pictures/loop.png";
    loop = false;
  } else {
    btnLoop.children[0].src = "./assets/pictures/loop_black.png";
    loop = true;
  }
})

btnRandom.addEventListener('click', async () => {//A voir
  if(random) {
    btnRandom.children[0].src = "./assets/pictures/random.png";
    random = false;
  } else if(loop) {
    btnRandom.children[0].src = "./assets/pictures/random_black.png";
    random = true;
    let music = await fetch(`${urlApi}/music/random`)
    music = music.json();
    startMusic(music.result);
  } else {
    btnRandom.children[0].src = "./assets/pictures/random.png";
    random = false;
    let music = await fetch(`${urlApi}/music/random`)
    music = await music.json();
    console.log(music)
    startMusic(music.result);
  }
})

lecteur.addEventListener('ended', async () => {
  const req = await fetch(`${urlApi}/music`);
  const dbMusics = await req.json();
  const data = dbMusics.data;
  if (loop && random === false) {
    if (data[lastMusicIndex + 1] === undefined) {
      startMusic(data[0]);
    } else if(loop) {
      startMusic(data[lastMusicIndex + 1]);
    }
  } else if(loop && random === true) {
    let randomId = Math.floor(Math.random() * data.length);
    while(randomId === lastMusicIndex) {
      randomId = Math.floor(Math.random() * data.length);
    }
    startMusic(data[randomId]);
  }
})

lecteur.addEventListener('timeupdate', () => {
  const timer = document.getElementById('timer');
  const soundBar = document.getElementById('soundBar');
  
  const minutes = Math.floor(lecteur.currentTime/60);
  const secondes = Math.floor(lecteur.currentTime - minutes * 60);

  const maxMinutes = Math.floor(lecteur.duration/60);
  const maxSecondes = Math.floor(lecteur.duration - maxMinutes * 60);
  timer.innerText = `${minutes}:${(secondes < 10 ? "0"+secondes : secondes)}/${(maxMinutes.toString() == 'NaN') ? "0" : maxMinutes}:${(maxSecondes.toString() == 'NaN') ? "00" : (maxSecondes < 10) ? "0"+maxSecondes : maxSecondes}`;

  const pourcentage = Math.floor(lecteur.currentTime * 100 / lecteur.duration);
  soundBar.style.width = `${pourcentage}%`
})

btnVolume.addEventListener('click', () => {
  volume.classList.toggle('cache');
})

volume.addEventListener('input', () => {
  lecteur.volume = volume.value;

  if(volume.value == 0) {
    btnVolume.children[0].src = "./assets/pictures/mute.png";
  } else {
    btnVolume.children[0].src = "./assets/pictures/sound.png";
  }
})