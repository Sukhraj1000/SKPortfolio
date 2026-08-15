export const chronicleRoutePhysics = {
  gravity: 1_250,
  runSpeed: 270,
  dashSpeed: 455,
  dashDurationMs: 240,
  dashCooldownMs: 850,
  jumpSpeed: 700,
  dropSpeed: 820,
  coyoteWindowMs: 180,
  jumpBufferWindowMs: 220,
} as const;

export const chronicleFloorY = 664;

export const chronicleUpperRoutes = [
  { start: 2_500, y: 545, tiles: 12, nodeOffsets: [4, 8] },
  { start: 8_150, y: 535, tiles: 15, nodeOffsets: [3, 8, 12] },
  { start: 13_950, y: 525, tiles: 14, nodeOffsets: [4, 10] },
  { start: 19_750, y: 515, tiles: 16, nodeOffsets: [3, 8, 13] },
  { start: 25_800, y: 505, tiles: 16, nodeOffsets: [4, 9, 14] },
] as const;

export const chronicleJumpApex =
  (chronicleRoutePhysics.jumpSpeed ** 2) /
  (2 * chronicleRoutePhysics.gravity);

export const chronicleRouteReachability = chronicleUpperRoutes.map(
  (route) => ({
    start: route.start,
    entryRise: chronicleFloorY - route.y,
    jumpApex: chronicleJumpApex,
    reachRatio: (chronicleFloorY - route.y) / chronicleJumpApex,
  }),
);
