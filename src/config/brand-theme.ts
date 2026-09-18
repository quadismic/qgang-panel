export const brandTheme = {
  mark: "/brand/qgang-mark.png",
  seal: "/brand/quad-seal.png",
  world: {
    master: "/brand/world/qgang-fortress-master.png",
    views: {
      headquarters: { position: "50% 48%", size: "150%" },
      codex: { position: "8% 43%", size: "245%" },
      registry: { position: "29% 44%", size: "235%" },
      decrees: { position: "39% 72%", size: "250%" },
      tribunal: { position: "82% 43%", size: "240%" },
      treasury: { position: "69% 73%", size: "250%" },
    },
  },
  command: {
    background: "/brand/command/background.webp",
    quad: "/brand/command/quad.webp",
    council: [
      { id: "left-1", src: "/brand/command/council-left-1.webp", side: "left" },
      { id: "left-2", src: "/brand/command/council-left-2.webp", side: "left" },
      { id: "right-1", src: "/brand/command/council-right-1.webp", side: "right" },
      { id: "right-2", src: "/brand/command/council-right-2.webp", side: "right" },
    ],
  },
} as const;
export const enabledCouncilMembers = [] as const;
