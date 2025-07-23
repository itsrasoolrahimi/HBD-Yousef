document.addEventListener("DOMContentLoaded", () => {
  // --- Config & Data ---
  const KEY_ATTEMPTS    = "attemptsLeft";
  const KEY_MESSAGES    = "funnyMessages";
  const KEY_NEXT_INDEX  = "nextMsgIndex";
  const KEY_CORRECT     = "guessedCorrect";
  const KEY_FORCE_ENTRY = "forceCorrectEntry";

  const defaultFunny = [
    "Think outside the boX!!!!! 🐢",
    "Nope—are you even trying? 🤔",
    "My grandma would do better! 👵",
    "Still wrong, but I like your style. 😎",
    "Try again before I run out of jokes! 🤡",
    "Think outside the box 😂",
    "You miss 100% of the shots you don't take—except this one. 🏀",
    "Wrong-o-rama! 🎉",
    "At least you're consistent! 💪",
    "Keep going! The suspense is killing me… 🕵️"
  ];

  const lyricsData = [
    { t:   0, text: "Happy birthday Yousef" },
    { t:   6, text: "I wish you live until you're 100!!!" },
    { t:  11, text: "I wish you live until you're 100!!!" },
    { t:  16, text: "I wish you health and happiness" },
    { t:  23, text: "I wish you never have any stress :)" },
    { t:  25, text: "Cause you're my friend" },
    { t:  28, text: "And I say it Again 😃" },
    { t:  32, text: "Happy birthday my friend!" },
    { t:  34, text: "Happy birthday" },
    { t:  58, text: "Mouth solo 😂😂😂" },
    { t:  66, text: "I wish ..., I wish we met in person :)" }
  ];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  const guessPage     = document.getElementById("guess-page");
  const musicPage     = document.getElementById("music-page");
  const cardPage      = document.getElementById("card-page");
  const guessInput    = document.getElementById("guess-input");
  const guessButton   = document.getElementById("guess-button");
  const guessFeedback = document.getElementById("guess-feedback");
  const audioEl       = document.getElementById("audio");
  const lyricsEl      = document.getElementById("lyrics");
  const nextBtn       = document.getElementById("next-button");

  let lyricIndex = 0;

  function showGuessPage() {
    guessPage.classList.remove("hidden");
    musicPage.classList.add("hidden");
    cardPage.classList.add("hidden");
  }

  function showMusicPage() {
    lyricIndex = 0;
    lyricsEl.textContent = "";
    lyricsEl.classList.remove("show");
    nextBtn.style.display = "none";

    guessPage.classList.add("hidden");
    musicPage.classList.remove("hidden");
    cardPage.classList.add("hidden");

    // Delay start so DOM updates fully
    setTimeout(() => {
      audioEl.currentTime = 0;

      // Manually show first lyric at t=0
      lyricsEl.textContent = lyricsData[0].text;
      lyricsEl.classList.add("show");
      lyricIndex = 1; // advance to next lyric

      audioEl.play();
    }, 300);
  }

  function showCardPage() {
    guessPage.classList.add("hidden");
    musicPage.classList.add("hidden");
    cardPage.classList.remove("hidden");
  }

  function initialize() {
    if (!localStorage.getItem(KEY_ATTEMPTS)) {
      localStorage.setItem(KEY_ATTEMPTS, "10");
    }
    if (!localStorage.getItem(KEY_MESSAGES)) {
      const msgs = [...defaultFunny];
      shuffle(msgs);
      localStorage.setItem(KEY_MESSAGES, JSON.stringify(msgs));
      localStorage.setItem(KEY_NEXT_INDEX, "0");
    }

    if (parseInt(localStorage.getItem(KEY_ATTEMPTS), 10) > 0) {
      localStorage.removeItem(KEY_FORCE_ENTRY);
    }

    const won      = localStorage.getItem(KEY_CORRECT) === "true";
    const attempts = parseInt(localStorage.getItem(KEY_ATTEMPTS), 10);
    const forced   = localStorage.getItem(KEY_FORCE_ENTRY) === "true";

    if (won || (attempts <= 0 && !forced)) {
      showMusicPage();
    } else {
      showGuessPage();
    }
  }

  function checkGuess() {
    const val    = parseInt(guessInput.value, 10);
    const forced = localStorage.getItem(KEY_FORCE_ENTRY) === "true";

    if (isNaN(val) || val < 0 || val > 100) {
      guessFeedback.textContent = "⚠️ Please enter a number from 0 to 100.";
      return;
    }

    if (forced) {
      if (val === 100) {
        guessFeedback.textContent = "Thanks! let's go to the special gift… 🎶";
        localStorage.setItem(KEY_CORRECT, "true");
        setTimeout(showMusicPage, 1000);
      } else {
        guessFeedback.textContent = "Just enter 100 and click on next🤣 the special gift...";
      }
      return;
    }

    if (val === 100) {
      guessFeedback.textContent = "That's correct, cause that's how long I wish for you to live! 🎉";
      localStorage.setItem(KEY_CORRECT, "true");
      guessInput.disabled = true;
      setTimeout(showMusicPage, 1500);
      return;
    }

    let attemptsLeft = parseInt(localStorage.getItem(KEY_ATTEMPTS), 10) - 1;
    localStorage.setItem(KEY_ATTEMPTS, attemptsLeft.toString());

    let idx  = parseInt(localStorage.getItem(KEY_NEXT_INDEX), 10);
    const msgs = JSON.parse(localStorage.getItem(KEY_MESSAGES));
    const msg  = msgs[idx] || "…still no luck!";
    localStorage.setItem(KEY_NEXT_INDEX, (idx + 1).toString());

    if (attemptsLeft > 0) {
      guessFeedback.textContent = `${msg} Attempts left: ${attemptsLeft}`;
    } else {
      guessFeedback.textContent =
        "😅 The correct answer was 100 cause I wish you live until then :)";
      localStorage.setItem(KEY_FORCE_ENTRY, "true");
      guessInput.value = "";
    }
  }

  audioEl.addEventListener("timeupdate", () => {
    const t = audioEl.currentTime;

    if (lyricIndex < lyricsData.length && t >= lyricsData[lyricIndex].t) {
      lyricsEl.classList.remove("show");
      setTimeout(() => {
        lyricsEl.textContent = lyricsData[lyricIndex].text;
        lyricsEl.classList.add("show");
      }, 600);
      lyricIndex++;
    }

    if (t >= 66) {
      nextBtn.style.display = "inline-block";
    }
  });

  guessButton.addEventListener("click", checkGuess);
  nextBtn.addEventListener("click", showCardPage);
  initialize();
});
