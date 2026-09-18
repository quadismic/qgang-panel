export const brandTheme = {
  mark: "/brand/qgang-mark.png",
  seal: "/brand/quad-seal.png",
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

/**
 * Brand/theme assets live under public/brand.
 * Missing optional council assets are intentionally not rendered until enabled.
 * Swap paths here to reskin Q-GANG without touching page components.
 */
export const enabledCouncilMembers = [] as const;
