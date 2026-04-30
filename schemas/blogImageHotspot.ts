/** Hotspot + crop tool for blog images (Studio). Editors pick aspect ratio, drag crop, set focal point. */
export const blogImageHotspotOptions = {
  previews: [
    { title: "16:9 (article / hero)", aspectRatio: 16 / 9 },
    { title: "Open Graph / share (1.91:1)", aspectRatio: 1200 / 630 },
    { title: "3:2", aspectRatio: 3 / 2 },
    { title: "1:1 (square)", aspectRatio: 1 },
    { title: "4:5 (portrait)", aspectRatio: 4 / 5 },
    { title: "9:16 (story)", aspectRatio: 9 / 16 },
  ],
} as const;

/** Cast for older `sanity` image field typings; runtime is hotspot config with crop aspect previews. */
export const blogImageHotspotForSchema = blogImageHotspotOptions as unknown as boolean;
