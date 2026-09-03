import {
  initCube,
  mountCubeComponent,
} from "./components/cube/cube.js";

const LANG_STORAGE_KEY = "portfolio-language";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "pt-BR"];
const FLAG_BR = "\uD83C\uDDE7\uD83C\uDDF7";
const FLAG_US = "\uD83C\uDDFA\uD83C\uDDF8";

const langToggle = document.querySelector("#lang-toggle");
const langToggleFlag = document.querySelector(".lang-toggle__flag");
const pageTitleKey = document.body.dataset.pageTitleKey;
const cubeRoot = document.querySelector("#cube-component-root");
const carouselTrack = document.querySelector("#professional-carousel-track");
const carouselPrev = document.querySelector("#professional-carousel-prev");
const carouselNext = document.querySelector("#professional-carousel-next");
const carouselDots = document.querySelector("#professional-carousel-dots");
const modalTriggers = document.querySelectorAll("[data-modal-target]");

const translations = {
  en: {
    "meta.title.home": "Portfolio",
    "meta.title.professional": "Professional",
    "meta.title.projects": "Projects",
    "meta.title.contact": "Contact",
    "nav.home": "Home",
    "nav.professional": "Professional",
    "nav.projects": "Projects",
    "nav.contact": "Contact",
    "lang.toggleLabel": "PT-BR",
    "lang.toggleAria": "Switch to Brazilian Portuguese",
    "home.heroTitleLine1": "Hello,",
    "home.heroTitleLine2": "welcome to My Portfolio!",
    "home.heroDescription":
      "I'm Hernandes, a Software Engineering student at Universidade do Estado da Bahia",
    "home.heroText": "Learn more about me here and feel free to contact me.",
    "home.contactButton": "Contact",
    "home.portraitAlt": "Portrait of Hernandes Santos Pereira",
    "cube.invite": "Want a quick challenge? Try solving the cube.",
    "cube.guideToggleAria": "Show cube guide",
    "cube.guideTitle": "How to play",
    "cube.guideLine1": "Drag outside the cube to orbit the camera.",
    "cube.guideLine2": "Swipe across a face to rotate that layer.",
    "cube.guideLine3": "Use Scramble to mix it and Reset to return to the start.",
    "cube.canvasAria": "Interactive 3D Rubik's cube",
    "cube.scramble": "Scramble",
    "cube.solve": "Solve",
    "cube.reset": "Reset",
    "cube.solved": "Solved. Want to scramble and try again?",
    "professional.title": "Professional",
    "professional.copy":
      "My professional experiences and administrative support background.",
    "professional.download": "Download PDF Resume",
    "professional.job1.title": "IT Support",
    "professional.job1.company": "UNEB Campus II - Alagoinhas",
    "professional.job1.period": "July 2024 - Present",
    "professional.job1.description":
      "Based at Campus II of the State University of Bahia in Alagoinhas, working in IT support with technical solutions for computers and networks, preventive and corrective computer maintenance, computer assembly, and user support.",
    "professional.job2.title": "Enumerator",
    "professional.job2.company": "2022 Demographic Census | IBGE",
    "professional.job2.period": "July 2022 - December 2022",
    "professional.job2.description":
      "Interviewed residents in their homes, confirmed and corrected street information, and registered new households and establishments in the census system.",
    "professional.job3.title": "Espro Apprentice",
    "professional.job3.company": "Partner Company: Cinemark Brasil S.A.",
    "professional.job3.period": "December 17, 2018 - March 16, 2020",
    "professional.job3.description":
      "Supported uniform control and distribution for national units, admission and termination processes, and general administrative routines.",
    "projects.title": "Projects",
    "projects.copy":
      "A quick look at some project snapshots. Each slide can open a dedicated project link.",
    "projects.carouselAria": "Professional projects carousel",
    "projects.azErpAria": "Open AZ-ERP project",
    "projects.azErpAlt": "AZ-ERP project home screen",
    "projects.tomagoshiAria": "Open Tomagoshi ESP32 project",
    "projects.tomagoshiAlt": "Tomagoshi ESP32 project preview",
    "projects.rewardHunterAria": "Open Reward Hunter project",
    "projects.rewardHunterAlt": "Reward Hunter project preview",
    "projects.brinqueAria": "Open Projeto BrinqueAprenda",
    "projects.brinqueAlt": "Projeto BrinqueAprenda project preview",
    "projects.triagemAria": "Open Triagem Inteligente project",
    "projects.triagemAlt": "Triagem Inteligente project preview",
    "projects.umbrelButtonAria": "Open Umbrel project details",
    "projects.umbrelAlt": "Umbrel self-hosting server preview",
    "projects.umbrelCaption": "Self-hosting server Umbrel",
    "projects.prev": "Prev",
    "projects.prevAria": "Previous slide",
    "projects.next": "Next",
    "projects.nextAria": "Next slide",
    "projects.dotsAria": "Carousel navigation",
    "projects.modalClose": "Close",
    "projects.modalCloseAria": "Close project details",
    "projects.umbrelTitle": "Umbrel",
    "projects.umbrelDescription":
      "This is my own server built with the Umbrel Linux distribution, which turns a computer into a server capable of hosting services such as music, movie, and TV streaming, as well as file storage similar to Google Drive. This was a very interesting project in many ways, and I applied a wide range of knowledge I had acquired.<br><br>I started by refurbishing an old notebook used by my family, a Samsung RF511, and it was truly old. It had a problem with the DC power jack connector. After removing it and replacing it with a new one, I ran into another issue, a known chronic problem with this model: the Nec Tokin capacitor. I replaced it with tantalum capacitors. At this stage, I used my technical knowledge from start to finish, from diagnosing the problems and identifying replacement components to carrying out the necessary soldering work.<br><br>After this first stage, I installed and configured Umbrel. The services currently hosted are:<br>- Jellyfin: a streaming application that already includes several movies and TV shows<br>- Nextcloud: a cloud storage service for files<br><br>I can also remotely access both the hosted services and the server itself through the Tailscale VPN.<br><br>This is a personal project that required a great deal of dedication and taught me a lot about how the internet and digital services work. Managing my own platform and services is a major challenge, but it has definitely been, and still is, a lot of fun.",
    "contact.title": "Contact",
    "contact.copy":
      "Choose a channel below. You can replace each placeholder link with your real profile later.",
    "contact.linksAria": "Contact links",
    "contact.whatsappAria": "Open WhatsApp",
    "contact.linkedinAria": "Open LinkedIn",
    "contact.githubAria": "Open GitHub",
    "contact.emailAria": "Send email",
  },
  "pt-BR": {
    "meta.title.home": "Portf\u00F3lio",
    "meta.title.professional": "Profissional",
    "meta.title.projects": "Projetos",
    "meta.title.contact": "Contato",
    "nav.home": "Home",
    "nav.professional": "Profissional",
    "nav.projects": "Projetos",
    "nav.contact": "Contato",
    "lang.toggleLabel": "EN",
    "lang.toggleAria": "Mudar para ingl\u00EAs",
    "home.heroTitleLine1": "Ol\u00E1,",
    "home.heroTitleLine2": "bem-vindo ao meu portf\u00F3lio!",
    "home.heroDescription":
      "Sou Hernandes, estudante de Engenharia de Software da Universidade do Estado da Bahia",
    "home.heroText": "Saiba mais sobre mim aqui e sinta-se \u00E0 vontade para entrar em contato.",
    "home.contactButton": "Contato",
    "home.portraitAlt": "Retrato de Hernandes Santos Pereira",
    "cube.invite": "Quer um desafio r\u00E1pido? Tente resolver o cubo.",
    "cube.guideToggleAria": "Mostrar guia do cubo",
    "cube.guideTitle": "Como jogar",
    "cube.guideLine1": "Arraste fora do cubo para orbitar a c\u00E2mera.",
    "cube.guideLine2": "Deslize sobre uma face para girar aquela camada.",
    "cube.guideLine3": "Use Embaralhar para misturar e Resetar para voltar ao in\u00EDcio.",
    "cube.canvasAria": "Cubo m\u00E1gico 3D interativo",
    "cube.scramble": "Embaralhar",
    "cube.solve": "Resolver",
    "cube.reset": "Resetar",
    "cube.solved": "Resolvido. Quer embaralhar e tentar novamente?",
    "professional.title": "Profissional",
    "professional.copy":
      "Minhas experi\u00EAncias profissionais e minha atua\u00E7\u00E3o com suporte administrativo.",
    "professional.download": "Baixar curr\u00EDculo em PDF",
    "professional.job1.title": "Suporte de TI",
    "professional.job1.company": "UNEB Campus II - Alagoinhas",
    "professional.job1.period": "Julho de 2024 - Atualmente",
    "professional.job1.description":
      "Lotado no Campus II da Universidade do Estado da Bahia, em Alagoinhas, atuando em suporte de TI com solu\u00E7\u00F5es t\u00E9cnicas para computadores e redes, manuten\u00E7\u00E3o preventiva e corretiva de computadores, montagem de computadores e suporte aos usu\u00E1rios.",
    "professional.job2.title": "Recenseador",
    "professional.job2.company": "Censo Demogr\u00E1fico 2022 | IBGE",
    "professional.job2.period": "Julho de 2022 - Dezembro de 2022",
    "professional.job2.description":
      "Entrevista com moradores em suas resid\u00EAncias, confirma\u00E7\u00E3o e corre\u00E7\u00E3o de informa\u00E7\u00F5es sobre logradouros e cadastro de novos domic\u00EDlios e estabelecimentos no sistema do censo.",
    "professional.job3.title": "Aprendiz Espro",
    "professional.job3.company": "Empresa Parceira: Cinemark Brasil S.A.",
    "professional.job3.period": "17 de dezembro de 2018 - 16 de mar\u00E7o de 2020",
    "professional.job3.description":
      "Atua\u00E7\u00E3o no controle e envio de uniformes para unidades nacionais, processos de admiss\u00E3o e rescis\u00E3o e rotinas administrativas em geral.",
    "projects.title": "Projetos",
    "projects.copy":
      "Uma vis\u00E3o r\u00E1pida de alguns projetos. Cada slide pode abrir um link dedicado do projeto.",
    "projects.carouselAria": "Carrossel de projetos profissionais",
    "projects.azErpAria": "Abrir projeto AZ-ERP",
    "projects.azErpAlt": "Tela inicial do projeto AZ-ERP",
    "projects.tomagoshiAria": "Abrir projeto Tomagoshi ESP32",
    "projects.tomagoshiAlt": "Pr\u00E9via do projeto Tomagoshi ESP32",
    "projects.rewardHunterAria": "Abrir projeto Reward Hunter",
    "projects.rewardHunterAlt": "Pr\u00E9via do projeto Reward Hunter",
    "projects.brinqueAria": "Abrir projeto BrinqueAprenda",
    "projects.brinqueAlt": "Pr\u00E9via do projeto BrinqueAprenda",
    "projects.triagemAria": "Abrir projeto Triagem Inteligente",
    "projects.triagemAlt": "Pr\u00E9via do projeto Triagem Inteligente",
    "projects.umbrelButtonAria": "Abrir detalhes do projeto Umbrel",
    "projects.umbrelAlt": "Pr\u00E9via do servidor Umbrel self-hosting",
    "projects.umbrelCaption": "Servidor Umbrel self-hosting",
    "projects.prev": "Anterior",
    "projects.prevAria": "Slide anterior",
    "projects.next": "Pr\u00F3ximo",
    "projects.nextAria": "Pr\u00F3ximo slide",
    "projects.dotsAria": "Navega\u00E7\u00E3o do carrossel",
    "projects.modalClose": "Fechar",
    "projects.modalCloseAria": "Fechar detalhes do projeto",
    "projects.umbrelTitle": "Umbrel",
    "projects.umbrelDescription":
      "Este \u00E9 meu pr\u00F3prio servidor utilizando a distribui\u00E7\u00E3o Linux Umbrel, que transforma um computador em um servidor capaz de hospedar servi\u00E7os como streaming de m\u00FAsica, filmes e s\u00E9ries, al\u00E9m de armazenamento de arquivos semelhante ao Google Drive. Este foi um projeto muito interessante em diversos aspectos, e nele apliquei uma ampla gama de conhecimentos que adquiri.<br><br>Comecei recondicionando um notebook antigo da minha fam\u00EDlia, um Samsung RF511, e antigo mesmo. Ele tinha um problema no conector jack de alimenta\u00E7\u00E3o. Ap\u00F3s remov\u00EA-lo e substitu\u00ED-lo por um novo, encontrei outro problema, um defeito cr\u00F4nico conhecido desse modelo: o capacitor Nec Tokin. Substitu\u00ED por capacitores de t\u00E2ntalo. Nessa etapa, utilizei meus conhecimentos t\u00E9cnicos do in\u00EDcio ao fim, desde o diagn\u00F3stico dos problemas e identifica\u00E7\u00E3o dos componentes de substitui\u00E7\u00E3o at\u00E9 a soldagem necess\u00E1ria.<br><br>Ap\u00F3s essa primeira etapa, instalei e configurei o Umbrel. Os servi\u00E7os hospedados atualmente s\u00E3o:<br>- Jellyfin: um aplicativo de streaming que j\u00E1 possui diversos filmes e s\u00E9ries<br>- Nextcloud: um servi\u00E7o de nuvem para arquivos<br><br>Tamb\u00E9m consigo acessar remotamente tanto os servi\u00E7os hospedados quanto o pr\u00F3prio servidor atrav\u00E9s da VPN Tailscale.<br><br>Esse \u00E9 um projeto pessoal que demandou muita dedica\u00E7\u00E3o e me ensinou muito sobre como a internet e os servi\u00E7os digitais funcionam. Administrar minha pr\u00F3pria plataforma e servi\u00E7os \u00E9 um grande desafio, mas sem d\u00FAvidas foi, e continua sendo, muito divertido.",
    "contact.title": "Contato",
    "contact.copy":
      "Escolha um canal abaixo. Depois voc\u00EA pode substituir cada link provis\u00F3rio pelo seu perfil real.",
    "contact.linksAria": "Links de contato",
    "contact.whatsappAria": "Abrir WhatsApp",
    "contact.linkedinAria": "Abrir LinkedIn",
    "contact.githubAria": "Abrir GitHub",
    "contact.emailAria": "Enviar e-mail",
  },
};

let currentLanguage = getStoredLanguage();
let cubeStatusLabel = null;

function getStoredLanguage() {
  const storedLanguage = window.localStorage.getItem(LANG_STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(storedLanguage)
    ? storedLanguage
    : DEFAULT_LANGUAGE;
}

function getTranslation(key, language = currentLanguage) {
  return translations[language]?.[key]
    ?? translations[DEFAULT_LANGUAGE]?.[key]
    ?? key;
}

function getCarouselDotLabel(index) {
  return currentLanguage === "pt-BR"
    ? `Ir para o slide ${index + 1}`
    : `Go to slide ${index + 1}`;
}

function applyTranslations(language = currentLanguage) {
  currentLanguage = SUPPORTED_LANGUAGES.includes(language)
    ? language
    : DEFAULT_LANGUAGE;
  document.documentElement.lang = currentLanguage;
  window.localStorage.setItem(LANG_STORAGE_KEY, currentLanguage);

  if (pageTitleKey) {
    document.title = getTranslation(pageTitleKey, currentLanguage);
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getTranslation(element.dataset.i18n, currentLanguage);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = getTranslation(element.dataset.i18nHtml, currentLanguage);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute(
      "aria-label",
      getTranslation(element.dataset.i18nAriaLabel, currentLanguage),
    );
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute(
      "alt",
      getTranslation(element.dataset.i18nAlt, currentLanguage),
    );
  });

  if (langToggleFlag) {
    langToggleFlag.textContent = currentLanguage === "pt-BR" ? FLAG_US : FLAG_BR;
  }

  if (cubeStatusLabel?.dataset.statusKey) {
    cubeStatusLabel.textContent = getTranslation(
      cubeStatusLabel.dataset.statusKey,
      currentLanguage,
    );
  }

  document.querySelectorAll(".carousel__dot").forEach((dot, index) => {
    dot.setAttribute("aria-label", getCarouselDotLabel(index));
  });
}

function initCarousel() {
  if (!carouselTrack || !carouselDots) {
    return;
  }

  const slides = Array.from(carouselTrack.querySelectorAll(".carousel__slide"));
  const AUTOPLAY_MS = 5000;
  let currentSlide = 0;
  let autoplayId = null;

  function renderCarousel() {
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    Array.from(carouselDots.children).forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentSlide);
      dot.setAttribute("aria-current", index === currentSlide ? "true" : "false");
    });
  }

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    renderCarousel();
  }

  function restartAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
    }

    autoplayId = window.setInterval(() => {
      goToSlide(currentSlide + 1);
    }, AUTOPLAY_MS);
  }

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel__dot";
    dot.setAttribute("aria-label", getCarouselDotLabel(index));
    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoplay();
    });
    carouselDots.appendChild(dot);
  });

  carouselPrev?.addEventListener("click", () => {
    goToSlide(currentSlide - 1);
    restartAutoplay();
  });

  carouselNext?.addEventListener("click", () => {
    goToSlide(currentSlide + 1);
    restartAutoplay();
  });

  carouselTrack.addEventListener("pointerenter", () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  });

  carouselTrack.addEventListener("pointerleave", restartAutoplay);

  renderCarousel();
  restartAutoplay();
}

function initModals() {
  if (modalTriggers.length === 0) {
    return;
  }

  let activeModal = null;

  function setModalOpen(modal, isOpen) {
    modal.hidden = !isOpen;
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
    activeModal = isOpen ? modal : null;
  }

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const targetId = trigger.getAttribute("data-modal-target");
      const modal = document.getElementById(targetId);
      if (!modal) {
        return;
      }
      setModalOpen(modal, true);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((closer) => {
    closer.addEventListener("click", () => {
      const modal = closer.closest(".project-modal");
      if (!modal) {
        return;
      }
      setModalOpen(modal, false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeModal) {
      setModalOpen(activeModal, false);
    }
  });
}

if (cubeRoot) {
  mountCubeComponent(cubeRoot);
  const cubeApi = initCube({ getTranslation });
  cubeStatusLabel = cubeApi.statusLabel;
}

langToggle?.addEventListener("click", () => {
  const nextLanguage = currentLanguage === "pt-BR" ? "en" : "pt-BR";
  applyTranslations(nextLanguage);
});

initCarousel();
initModals();
applyTranslations(currentLanguage);
