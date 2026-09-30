document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // GSAP PLUGINS
  // ============================================================

  if (typeof gsap !== "undefined") {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (typeof ScrollSmoother !== "undefined") {
      gsap.registerPlugin(ScrollSmoother);
    }

    if (typeof SplitText !== "undefined") {
      gsap.registerPlugin(SplitText);
    }
  }


  // ============================================================
  // SCROLL SMOOTHER
  // ============================================================

  let smoother = null;

  if (typeof ScrollSmoother !== "undefined") {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.5,
      effects: true
    });
  }


  // ============================================================
  // 1. CANVAS FRAME SEQUENCE
  // ============================================================

  const canvas = document.getElementById("hero-canvas");

  if (!canvas) {
    console.warn("Canvas #hero-canvas não encontrado.");
    return;
  }

  const ctx = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true
  });

  const frameCount = 59;
  const currentFrame = { index: 0 };
  const images = [];

  let dpr = Math.min(window.devicePixelRatio || 1, 2);


  // ============================================================
  // CAMINHO DOS FRAMES
  // ============================================================

  const currentFramePath = (index) => {
    const padded = String(index + 1).padStart(3, "0");
    return `assets/frames/ezgif-frame-${padded}.jpg`;
  };


  // ============================================================
  // PRELOAD DOS FRAMES
  // ============================================================

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.decoding = "async";
    img.src = currentFramePath(i);
    images.push(img);
  }


  // ============================================================
  // RENDER DO FRAME
  // ============================================================

  function renderFrame() {
    const frameIndex = Math.round(currentFrame.index);
    const img = images[frameIndex];

    if (!img || !img.complete || img.naturalWidth === 0) {
      return;
    }

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    if (!canvasWidth || !canvasHeight) {
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const imageWidth = img.naturalWidth;
    const imageHeight = img.naturalHeight;

    const hRatio = canvasWidth / imageWidth;
    const vRatio = canvasHeight / imageHeight;

    const ratio = Math.max(hRatio, vRatio);

    const drawWidth = imageWidth * ratio;
    const drawHeight = imageHeight * ratio;

    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.drawImage(
      img,
      0,
      0,
      imageWidth,
      imageHeight,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );
  }


  // ============================================================
  // RESIZE DO CANVAS
  // ============================================================

  function resizeCanvas() {
    // Limpa estilos inline para que o canvas ocupe a largura CSS do contêiner pai
    canvas.style.width = "";
    canvas.style.height = "";

    const rect = canvas.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (!width || !height) {
      return;
    }

    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    renderFrame();
  }


  // ============================================================
  // CARREGAMENTO INICIAL
  // ============================================================

  images[0].addEventListener("load", () => {
    resizeCanvas();
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });

  resizeCanvas();


  // ============================================================
  // 2. TEXT SEQUENCE & SPLIT TEXT
  // ============================================================

  const descriptionEl = document.querySelector(".description");

  const textContents = [
    `É um <strong>NOVO DIA</strong> para Peter Parker. Agora, ele combate o crime em tempo integral como HomemAranha em um mundo que não se lembra dele.`,
    `Mas a pressão de ver seus antigos amigos seguirem em frente sem ele começa a desencadear uma mudança em Peter, uma transformação que ele talvez não consiga controlar.`,
    `Só que essa mudança pode ser justamente a única coisa capaz de deter uma nova e chocante ameaça à cidade e às pessoas que ele ama: um vilão poderoso que ninguém consegue ver.`
  ];


  // ============================================================
  // CONSTRÓI O TEXTO DIVIDIDO EM CARACTERES
  // ============================================================

  function buildSplitTextElement(htmlText) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlText;

    const wrapperDiv = document.createElement("div");
    wrapperDiv.className = "text-slide";

    function processNode(node, container) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const words = text.split(" ");

        words.forEach((word, wIdx) => {
          if (word.length > 0) {
            const wordSpan = document.createElement("span");
            wordSpan.className = "split-word";

            for (const char of word) {
              const charSpan = document.createElement("span");
              charSpan.className = "split-char";
              charSpan.textContent = char;
              wordSpan.appendChild(charSpan);
            }
            container.appendChild(wordSpan);
          }

          if (wIdx < words.length - 1) {
            container.appendChild(document.createTextNode(" "));
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const elemSpan = document.createElement(node.tagName.toLowerCase());

        Array.from(node.attributes).forEach(attr => {
          elemSpan.setAttribute(attr.name, attr.value);
        });

        node.childNodes.forEach(child => {
          processNode(child, elemSpan);
        });

        container.appendChild(elemSpan);
      }
    }

    tempDiv.childNodes.forEach(child => {
      processNode(child, wrapperDiv);
    });

    return wrapperDiv;
  }


  // ============================================================
  // CRIA OS TEXTOS
  // ============================================================

  const textContainers = [];

  if (descriptionEl) {
    descriptionEl.innerHTML = "";

    textContents.forEach(html => {
      const slide = buildSplitTextElement(html);
      descriptionEl.appendChild(slide);
      textContainers.push(slide);
    });
  }


  // ============================================================
  // PEGA OS CARACTERES
  // ============================================================

  function getChars(container) {
    return Array.from(container.querySelectorAll(".split-char"));
  }


  // ============================================================
  // ESTADO INICIAL DOS TEXTOS
  // ============================================================

  textContainers.forEach((container, i) => {
    const chars = getChars(container);

    if (i === 0) {
      gsap.set(container, { autoAlpha: 1 });
      gsap.set(chars, { opacity: 1 });
    } else {
      gsap.set(container, { autoAlpha: 0 });
      gsap.set(chars, { opacity: 0 });
    }
  });


  // ============================================================
  // SHUFFLE
  // ============================================================

  function shuffleArray(arr) {
    const array = arr.slice();
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }


  // ============================================================
  // 3. MASTER SCROLLTRIGGER TIMELINE
  // ============================================================

  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero-container",
      start: "top top",
      end: "+=7000",
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });


  // ============================================================
  // ETAPA 1: ANIMAÇÃO DOS FRAMES (t = 0 até 1.0)
  // ============================================================

  heroTl.to(currentFrame, {
    index: frameCount - 1,
    snap: { index: 1 },
    ease: "none",
    duration: 1,
    onUpdate: renderFrame
  }, 0);


  // ============================================================
  // ETAPA 2: ANIMAÇÃO DOS 3 TEXTOS (t = 0 até 1.0)
  // ============================================================

  if (textContainers.length === 3) {
    const chars1 = shuffleArray(getChars(textContainers[0]));
    const chars2 = shuffleArray(getChars(textContainers[1]));
    const chars3 = shuffleArray(getChars(textContainers[2]));

    // --- PHASE 1: TEXTO 1 -> TEXTO 2 ---
    heroTl.to(chars1, { opacity: 0, stagger: 0.002, ease: "power1.inOut", duration: 0.08 }, 0.10);
    heroTl.to(textContainers[0], { autoAlpha: 0, duration: 0.06, ease: "power1.inOut" }, 0.16);
    heroTl.to(textContainers[1], { autoAlpha: 1, duration: 0.06, ease: "power1.inOut" }, 0.18);
    heroTl.to(chars2, { opacity: 1, stagger: 0.002, ease: "power1.inOut", duration: 0.08 }, 0.20);

    // --- PHASE 2: TEXTO 2 -> TEXTO 3 ---
    heroTl.to(chars2, { opacity: 0, stagger: 0.002, ease: "power1.inOut", duration: 0.08 }, 0.70);
    heroTl.to(textContainers[1], { autoAlpha: 0, duration: 0.06, ease: "power1.inOut" }, 0.76);
    heroTl.to(textContainers[2], { autoAlpha: 1, duration: 0.06, ease: "power1.inOut" }, 0.78);

    heroTl.to(".circular-text", { filter: "brightness(1) invert(1)", duration: 0.10, ease: "power1.inOut" }, 0.70);

    heroTl.to(chars3, { opacity: 1, stagger: 0.002, ease: "power1.inOut", duration: 0.08 }, 0.80);
  }


  // ============================================================
  // ETAPA 3: REVELAÇÃO DO VÍDEO & EMPURRÃO DOS ELEMENTOS (t = 1.0 até 1.8)
  // ============================================================

  // 1. A div da máscara (.trailer-mask) se expande no centro de 0% a 100%
  heroTl.to(".trailer-mask", {
    width: "100%",
    height: "100%",
    borderRadius: "0px",
    ease: "power2.inOut",
    duration: 0.7
  }, 1.0);

  // 2. Quando a máscara encosta nos conteúdos da hero, empurra-os para os lados:
  // Logo do Homem-Aranha à esquerda é empurrado para fora da tela
  heroTl.to(".logo-spiderman", {
    xPercent: -150,
    opacity: 0,
    ease: "power2.inOut",
    duration: 0.5
  }, 1.1);

  // Div da descrição à direita é empurrada para fora da tela
  heroTl.to(".description", {
    xPercent: 150,
    opacity: 0,
    ease: "power2.inOut",
    duration: 0.5
  }, 1.1);

  // 3. Quando atinge 100% (t = 1.7), o botão de Play surge no centro
  heroTl.to(".btn-play-trailer", {
    scale: 1,
    opacity: 1,
    ease: "back.out(1.7)",
    duration: 0.25
  }, 1.7);


  // ============================================================
  // 4. INTERATIVIDADE DO TRAILER PLAYER
  // ============================================================

  const btnPlay = document.getElementById("btn-play-trailer");
  const trailerVideo = document.getElementById("hero-trailer-video");
  const trailerOverlay = document.querySelector(".trailer-overlay");
  const customControls = document.getElementById("custom-video-controls");

  const ctrlPlayPause = document.getElementById("ctrl-play-pause");
  const iconPlay = ctrlPlayPause ? ctrlPlayPause.querySelector(".icon-play") : null;
  const iconPause = ctrlPlayPause ? ctrlPlayPause.querySelector(".icon-pause") : null;

  const ctrlMute = document.getElementById("ctrl-mute");
  const iconUnmute = ctrlMute ? ctrlMute.querySelector(".icon-unmute") : null;
  const iconMute = ctrlMute ? ctrlMute.querySelector(".icon-mute") : null;

  const progressBarWrapper = document.getElementById("progress-bar-wrapper");
  const progressBarFill = document.getElementById("progress-bar-fill");

  // Clique no Botão de Play Principal
  if (btnPlay && trailerVideo) {
    btnPlay.addEventListener("click", () => {
      // 1. Esconde botão principal e overlay
      btnPlay.style.transform = "scale(0)";
      btnPlay.style.opacity = "0";
      btnPlay.style.pointerEvents = "none";

      if (trailerOverlay) {
        trailerOverlay.style.opacity = "0";
      }

      // 2. Reinicia o vídeo com som
      trailerVideo.currentTime = 0;
      trailerVideo.muted = false;
      trailerVideo.play();

      // 3. Exibe controles customizados
      if (customControls) {
        customControls.classList.add("active");
      }

      updatePlayPauseIcons(true);
      updateMuteIcons(false);
    });
  }

  // Toggle Play / Pause nos controles
  if (ctrlPlayPause && trailerVideo) {
    ctrlPlayPause.addEventListener("click", () => {
      if (trailerVideo.paused) {
        trailerVideo.play();
        updatePlayPauseIcons(true);
      } else {
        trailerVideo.pause();
        updatePlayPauseIcons(false);
      }
    });
  }

  function updatePlayPauseIcons(isPlaying) {
    if (!iconPlay || !iconPause) return;
    if (isPlaying) {
      iconPlay.style.display = "none";
      iconPause.style.display = "inline-block";
    } else {
      iconPlay.style.display = "inline-block";
      iconPause.style.display = "none";
    }
  }

  // Toggle Som / Mudo nos controles
  if (ctrlMute && trailerVideo) {
    ctrlMute.addEventListener("click", () => {
      trailerVideo.muted = !trailerVideo.muted;
      updateMuteIcons(trailerVideo.muted);
    });
  }

  function updateMuteIcons(isMuted) {
    if (!iconUnmute || !iconMute) return;
    if (isMuted) {
      iconUnmute.style.display = "none";
      iconMute.style.display = "inline-block";
    } else {
      iconUnmute.style.display = "inline-block";
      iconMute.style.display = "none";
    }
  }

  // Barra de Progresso
  if (trailerVideo && progressBarFill) {
    trailerVideo.addEventListener("timeupdate", () => {
      if (trailerVideo.duration) {
        const percent = (trailerVideo.currentTime / trailerVideo.duration) * 100;
        progressBarFill.style.width = `${percent}%`;
      }
    });
  }

  if (progressBarWrapper && trailerVideo) {
    progressBarWrapper.addEventListener("click", (e) => {
      const rect = progressBarWrapper.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      if (width > 0 && trailerVideo.duration) {
        trailerVideo.currentTime = (clickX / width) * trailerVideo.duration;
      }
    });
  }

  // Quando o vídeo termina
  if (trailerVideo) {
    trailerVideo.addEventListener("ended", () => {
      updatePlayPauseIcons(false);
      if (btnPlay) {
        btnPlay.style.transform = "scale(1)";
        btnPlay.style.opacity = "1";
        btnPlay.style.pointerEvents = "auto";
      }
      if (trailerOverlay) {
        trailerOverlay.style.opacity = "1";
      }
      if (customControls) {
        customControls.classList.remove("active");
      }
    });
  }


  // ============================================================
  // 5. SEÇÃO ELENCO – SCROLL + CLICK
  // ============================================================

  const castData = [
    { name: "Tom Holland", role: "PETER PARKER / HOMEM-ARANHA", img: "assets/elenco/img1.webp" },
    { name: "Zendaya", role: 'MICHELLE "MJ" JONES', img: "assets/elenco/img2.webp" },
    { name: "Jacob Batalon", role: "NED LEEDS", img: "assets/elenco/img3.webp" },
    { name: "Michael Mando", role: "ESCORPIÃO", img: "assets/elenco/img4.webp" },
    { name: "Mark Ruffalo", role: "BRUCE BANNER / HULK", img: "assets/elenco/img5.webp" }
  ];

  const scrollItems = document.querySelectorAll(".scroll-item");
  const castActorNameEl = document.getElementById("cast-actor-name");
  const castRoleNameEl = document.getElementById("cast-role-name");
  const castImageEl = document.getElementById("cast-main-image");
  const trackProgressEl = document.getElementById("track-line-progress");
  const spiderIconEl = document.getElementById("spider-track-icon");
  const characterSection = document.querySelector(".character-section");

  let currentCastIndex = 0;

  // Calcula e alinha a aranha e a linha vertical de fundo com o centro do item ativo
  function updateTrackPosition(index, animate = true) {
    const scrollTrack = document.getElementById("scroll-track-container");
    if (!scrollTrack || !scrollItems || scrollItems.length === 0) return;

    const trackRect = scrollTrack.getBoundingClientRect();
    const firstItem = scrollItems[0];
    const lastItem = scrollItems[scrollItems.length - 1];
    const activeItem = scrollItems[index];

    if (!firstItem || !lastItem || !activeItem) return;

    const firstRect = firstItem.getBoundingClientRect();
    const lastRect = lastItem.getBoundingClientRect();
    const activeRect = activeItem.getBoundingClientRect();

    // Centro vertical de cada item em relação à div .scroll-track
    const firstCenterY  = (firstRect.top + firstRect.height / 2) - trackRect.top;
    const lastCenterY   = (lastRect.top + lastRect.height / 2) - trackRect.top;
    const activeCenterY = (activeRect.top + activeRect.height / 2) - trackRect.top;

    // Linha de fundo (.track-line): vai exatamente do centro do 1º ao centro do último item
    const trackLine = scrollTrack.querySelector(".track-line");
    if (trackLine) {
      const lineH = Math.max(0, lastCenterY - firstCenterY);
      trackLine.style.top = `${firstCenterY}px`;
      trackLine.style.height = `${lineH}px`;
    }

    // Linha de progresso branca (.track-line-progress)
    if (trackProgressEl) {
      const progressH = Math.max(0, activeCenterY - firstCenterY);
      gsap.to(trackProgressEl, { height: `${progressH}px`, duration: animate ? 0.35 : 0.1, ease: "power2.out" });
    }

    // Ícone da Aranha: centro vertical alinhado com o centro do item ativo
    if (spiderIconEl) {
      const iconH = spiderIconEl.clientHeight || 24;
      const targetY = activeCenterY - (iconH / 2);
      gsap.to(spiderIconEl, { y: targetY, duration: animate ? 0.5 : 0.1, ease: "power2.out" });
    }
  }

  // animate=true → com fade (click); animate=false → instantâneo (scroll)
  function setActiveCast(index, animate = true) {
    updateTrackPosition(index, animate);

    if (index === currentCastIndex && castImageEl && castImageEl.src.includes(castData[index].img)) return;
    currentCastIndex = index;

    const data = castData[index];

    // Textos: com fade no click, instântaneo no scroll
    if (animate) {
      if (castActorNameEl) {
        gsap.to(castActorNameEl, {
          opacity: 0, y: -8, duration: 0.2, ease: "power2.in", onComplete: () => {
            castActorNameEl.textContent = data.name;
            gsap.to(castActorNameEl, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
          }
        });
      }
      if (castRoleNameEl) {
        gsap.to(castRoleNameEl, {
          opacity: 0, y: -6, duration: 0.2, ease: "power2.in", onComplete: () => {
            castRoleNameEl.textContent = data.role;
            gsap.to(castRoleNameEl, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
          }
        });
      }
    } else {
      if (castActorNameEl) castActorNameEl.textContent = data.name;
      if (castRoleNameEl)  castRoleNameEl.textContent  = data.role;
    }

    // Imagem: com fade no click, instântaneo no scroll
    if (castImageEl) {
      gsap.killTweensOf(castImageEl);
      if (animate) {
        gsap.to(castImageEl, {
          opacity: 0, duration: 0.25, ease: "power1.inOut",
          onComplete: () => {
            castImageEl.src = data.img;
            gsap.fromTo(castImageEl, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.inOut" });
          }
        });
      } else {
        gsap.set(castImageEl, { opacity: 1 });
        castImageEl.src = data.img;
      }
    }

    // Atualiza classes ativas nos itens
    scrollItems.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
  }

  // Click nos itens da lista → com animação
  scrollItems.forEach(item => {
    item.addEventListener("click", () => {
      const idx = parseInt(item.dataset.index, 10);
      if (!isNaN(idx)) setActiveCast(idx, true);
    });
  });

  // ScrollTrigger – apenas PIN da seção (sem onUpdate, sem scrub)
  if (characterSection && typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: characterSection,
      start: "top top",
      end: `+=${castData.length * 150}`,
      pin: true,
    });
  }

  // Listener nativo de scroll (sem delay do ScrollSmoother)
  // Lê window.scrollY diretamente para trocar o ator sem lag
  if (characterSection) {
    const castScrollLength = castData.length * 150;

    // Calcula o offsetTop real da seção após o layout estar pronto
    const getSectionTop = () =>
      characterSection.getBoundingClientRect().top + window.scrollY;

    let sectionTop = getSectionTop();

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.addEventListener("refresh", () => {
        sectionTop = getSectionTop();
        updateTrackPosition(currentCastIndex, false);
      });
    }

    window.addEventListener("scroll", () => {
      const scrolled = window.scrollY - sectionTop;
      if (scrolled < 0 || scrolled > castScrollLength) return;
      const progress = scrolled / castScrollLength;
      const idx = Math.min(castData.length - 1, Math.floor(progress * castData.length));
      setActiveCast(idx, true);
    }, { passive: true });
  }

  // Atualiza posição no resize da janela
  window.addEventListener("resize", () => {
    updateTrackPosition(currentCastIndex, false);
  });

  // Estado inicial
  setTimeout(() => {
    setActiveCast(0, false);
  }, 100);

});