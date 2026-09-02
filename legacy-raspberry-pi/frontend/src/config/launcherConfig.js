// Atalhos do launcher. Edite este arquivo para adicionar/remover botoes da
// tela inicial fixada na parede - nao precisa mexer em nenhum componente.
export const launcherShortcuts = [
  {
    id: "despensa",
    label: "Despensa",
    icon: "🧺",
    tileClass: "tile-despensa",
    type: "internal",
    to: "/despensa",
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: "▶️",
    tileClass: "tile-youtube",
    type: "external",
    url: "https://www.youtube.com/tv",
  },
  {
    id: "streams",
    label: "Streams",
    icon: "📺",
    tileClass: "tile-streams",
    type: "internal",
    to: "/streams",
  },
  // Exemplo de atalho extra:
  // { id: "receitas", label: "Receitas", icon: "🍲", tileClass: "tile-outro", type: "external", url: "https://..." },
];

// Links usados na tela de Streams. YouTube abre em tela cheia via /tv (feito
// para controle remoto/touch); os demais abrem em nova aba pois a maioria dos
// serviços de streaming bloqueia ser embutido num iframe.
export const streamLinks = [
  { id: "youtube", label: "YouTube", icon: "▶️", url: "https://www.youtube.com/tv" },
  { id: "netflix", label: "Netflix", icon: "🎬", url: "https://www.netflix.com" },
  { id: "globoplay", label: "Globoplay", icon: "📡", url: "https://globoplay.globo.com" },
  { id: "spotify", label: "Spotify", icon: "🎵", url: "https://open.spotify.com" },
];
