/** Relative paths under `public/demo/seed/` — committed demo assets. */
export const DEMO_SEED_ASSETS = {
  placement: {
    forearm: "/demo/seed/placement-forearm.webp",
    upperArm: "/demo/seed/placement-upper-arm.webp",
    upperBack: "/demo/seed/placement-upper-back.webp",
  },
  references: {
    floralRose: "/demo/seed/ref-floral-rose.webp",
    floralLeaves: "/demo/seed/ref-floral-leaves.webp",
    pantherFlash: "/demo/seed/ref-panther-flash.webp",
    pantherDetail: "/demo/seed/ref-panther-detail.webp",
    koiDesign: "/demo/seed/ref-koi-design.webp",
    koiWaves: "/demo/seed/ref-koi-waves.webp",
  },
  sketches: {
    pantherV1: "/demo/seed/sketch-panther-v1.webp",
    pantherV2: "/demo/seed/sketch-panther-v2.webp",
    koiLine: "/demo/seed/sketch-koi-line.webp",
    koiColor: "/demo/seed/sketch-koi-color.webp",
  },
  flash: {
    moon: "/demo/seed/flash-moon.webp",
    snake: "/demo/seed/flash-snake.webp",
    rose: "/demo/seed/flash-rose.webp",
  },
  healed: {
    koiPreview: "/demo/seed/healed-koi-preview.webp",
  },
} as const;

export function demoAssetUrl(relativePath: string): string {
  return relativePath;
}

export function demoAssetUrls(paths: readonly string[]): string[] {
  return paths.map(demoAssetUrl);
}
