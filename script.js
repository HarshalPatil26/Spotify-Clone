async function fetchData() {
  const externalDataUrl = "http://127.0.0.1:5500/playlist.json";
  try {
    const response = await fetch(externalDataUrl);
    if (!response.ok) {
      throw new Error("Network call Failed" + response.statusText);
    }
    return response.json();
  } catch (error) {
    console.error("There was a problem fetching the playlist data:", error);
  }
}

let currentSong = null;
let isPlaying = false;

const globalPlayButton = document.querySelector("#playMusic");

function switchSong(newAudioPlayer, button, songImage) {
  if (currentSong && currentSong !== newAudioPlayer) {
    currentSong.pause();
    currentSong.currentTime = 0;
    updatePlayPauseButton(currentSong.button, false); // Reset previous button to play
  }

  if (currentSong === newAudioPlayer && !currentSong.paused) {
    currentSong.pause();
    updatePlayPauseButton(button, false); // Change to play icon
  } else {
    currentSong = newAudioPlayer;
    currentSong.play();
    updatePlayPauseButton(button, true);// Change to pause icon
    updateCurrentSongImage(songImage); 
  }

  currentSong.button = button; // Keep track of the play/pause button associated with the current song
  handleSeekBarUpdate(currentSong); // Update seek bar for the new song
}

function updatePlayPauseButton(button, isPlaying) {
  if (isPlaying) {
    button.classList.remove("fa-circle-play");
    button.classList.add("fa-circle-pause");
    globalPlayButton.classList.remove("fa-circle-play")
    globalPlayButton.classList.add("fa-circle-pause");
  } else {
    button.classList.remove("fa-circle-pause");
    button.classList.add("fa-circle-play");
    globalPlayButton.classList.add("fa-circle-play")
    globalPlayButton.classList.remove("fa-circle-pause");
  }
}

function handleSeekBarUpdate(audio) {
  const seekBar = document.querySelector(".seekBarCircle");
  const currentTimeDisplay = document.querySelector(".currentTime");
  const durationTimeDisplay = document.querySelector(".durationTime");

  audio.addEventListener("timeupdate", () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    seekBar.style.width = `${progress}%`;
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
    durationTimeDisplay.textContent = formatTime(audio.duration);
  });
}


function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

function updateCurrentSongImage(songImage) {
  const seekBarContainer = document.querySelector(".songImage");
  const songImageElement = document.querySelector(".currentSongImage");
  
  if (!songImageElement) {
    // Create and insert the image element if it doesn't exist
    const img = document.createElement("img");
    img.src = songImage;
    img.classList.add("currentSongImage");
    seekBarContainer.insertBefore(img, seekBarContainer.firstChild);
  } else {
    // Update the existing image's source
    songImageElement.src = songImage;
  }
}


function handleVolumeControl() {
  const volumeButton = document.querySelector("#volumeControl");
  const volumeSlider = document.querySelector("#volumeSlider");

  volumeButton.addEventListener("click", () => {
    if (currentSong.muted) {
      currentSong.muted = false;
      volumeButton.classList.remove("fa-volume-mute");
      volumeButton.classList.add("fa-volume-up");
    } else {
      currentSong.muted = true;
      volumeButton.classList.remove("fa-volume-up");
      volumeButton.classList.add("fa-volume-mute");
    }
  });

  volumeSlider.addEventListener("input", (event) => {
    currentSong.volume = event.target.value / 100;
  });
}

async function main() {
  let data = await fetchData();

  const playListContainer = document.querySelector(".playListContainer");
  const cardContainer = document.querySelector(".cardContainer");
  const globalPlayButton = document.querySelector("#playMusic");

  data.songs.forEach((song) => {
    const songCard = document.createElement("div");
    songCard.classList.add("playListSongCard");

    songCard.innerHTML = `
        <img src="${song.image}" alt="${song.title}">
        <p>${song.title}</p>
        <i class="fa-solid fa-circle-play playlistPlayButton"></i>
        <audio src="${song.mp3}" class="audioPlayer"></audio>`;

    const playButton = songCard.querySelector(".playlistPlayButton");
    const audioElement = songCard.querySelector(".audioPlayer");

    playButton.addEventListener("click", () => {
      switchSong(audioElement, playButton, song.image);
    });

    playListContainer.appendChild(songCard);
  });

  data.songsList.forEach((song) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
     <div class="play">
          <i class="fa-solid fa-circle-play  cardPlayButton"></i>
        </div>
        <img src="${song.image}" alt="${song.title}"/>
        <h2>${song.title}</h2>
        <p>Hits to boost your mood and fill you with happiness!</p>
        <audio src="${song.mp3}" class="audioPlayer"></audio>`;


        const playButton = card.querySelector(".cardPlayButton");
        const audioElement = card.querySelector(".audioPlayer");
    
        playButton.addEventListener("click", () => {
          switchSong(audioElement, playButton , song.image);
        });

    cardContainer.appendChild(card);
  });

  globalPlayButton.addEventListener("click", () => {
    if (!currentSong) return;
    if (currentSong.paused) {
      currentSong.play();
      updatePlayPauseButton(globalPlayButton, true); // Change global play button to pause
      updatePlayPauseButton(currentSong.button, true); // Change the current song's button to pause
    } else {
      currentSong.pause();
      updatePlayPauseButton(globalPlayButton, false); // Change global play button to play
      updatePlayPauseButton(currentSong.button, false); // Change the current song's button to play
    } // No song selected yet
  });

  handleVolumeControl();
}

main();
