export const brandTheme = {
  mark: "/brand/qgang-mark.png",
  seal: "/brand/quad-seal.png",
  rooms: {
    codex: "/brand/rooms/codex.webp",
    registry: "/brand/rooms/registry.webp",
    decrees: "/brand/rooms/decrees.webp",
    tribunal: "/brand/rooms/tribunal.webp",
    treasury: "/brand/rooms/treasury.webp",
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
