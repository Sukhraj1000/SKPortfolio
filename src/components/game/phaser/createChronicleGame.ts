import * as Phaser from "phaser";
import type { MutableRefObject } from "react";
import {
  chronicleRecords,
  chronicleTutorialSteps,
  type ChronicleChapterId,
  type ChronicleRecordId,
  type ChronicleTutorialStepId,
} from "@/components/game/chronicle-story";
import {
  chronicleFloorY,
  chronicleRoutePhysics,
  chronicleUpperRoutes,
} from "@/components/game/chronicle-route";
import type {
  ChronicleGameCallbacks,
  ChronicleGameHandle,
  ChroniclePlayerState,
  GameControlsState,
  GameSnapshot,
} from "@/components/game/game-types";

const CHAPTER_WIDTH = 6_000;
const WORLD_WIDTH = CHAPTER_WIDTH * 5;
const WORLD_HEIGHT = 720;
const FLOOR_Y = chronicleFloorY;
const RUN_SPEED = chronicleRoutePhysics.runSpeed;
const DASH_SPEED = chronicleRoutePhysics.dashSpeed;
const DASH_DURATION = chronicleRoutePhysics.dashDurationMs;
const DASH_COOLDOWN = chronicleRoutePhysics.dashCooldownMs;
const JUMP_SPEED = chronicleRoutePhysics.jumpSpeed;
const DROP_SPEED = chronicleRoutePhysics.dropSpeed;
const COYOTE_WINDOW = chronicleRoutePhysics.coyoteWindowMs;
const JUMP_BUFFER_WINDOW = chronicleRoutePhysics.jumpBufferWindowMs;

interface ChapterDefinition {
  id: ChronicleChapterId;
  index: string;
  label: string;
  start: number;
  end: number;
  tint: number;
}

const chapters: readonly ChapterDefinition[] = [
  {
    id: "origin",
    index: "00",
    label: "Origin",
    start: 0,
    end: CHAPTER_WIDTH,
    tint: 0x315f78,
  },
  {
    id: "live-systems",
    index: "01",
    label: "Live Systems",
    start: CHAPTER_WIDTH,
    end: CHAPTER_WIDTH * 2,
    tint: 0xc79b2e,
  },
  {
    id: "secure-engineering",
    index: "02",
    label: "Secure Engineering",
    start: CHAPTER_WIDTH * 2,
    end: CHAPTER_WIDTH * 3,
    tint: 0x315f78,
  },
  {
    id: "build-lab",
    index: "03",
    label: "Build Lab",
    start: CHAPTER_WIDTH * 3,
    end: CHAPTER_WIDTH * 4,
    tint: 0xa94743,
  },
  {
    id: "present-day",
    index: "04",
    label: "Present Day",
    start: CHAPTER_WIDTH * 4,
    end: WORLD_WIDTH,
    tint: 0x5e765f,
  },
] as const;

const hazardPositions = [
  6_850,
  8_950,
  11_150,
  12_900,
  15_180,
  17_250,
  18_820,
  20_780,
  23_020,
  24_950,
  27_080,
  29_020,
] as const;

const storyPickupPositions = [
  3_800,
  7_600,
  13_800,
  19_250,
  20_950,
  22_450,
  23_750,
  25_550,
  29_400,
] as const;

const checkpointDefinitions = [
  ...chapters.map((chapter) => ({
    zone: chapter.id,
    x: chapter.start + 160,
    chapterStart: true,
  })),
  ...hazardPositions.map((x) => ({
    zone:
      chapters.find((chapter) => x >= chapter.start && x < chapter.end)?.id ??
      chapters[0].id,
    x: x - 520,
    chapterStart: false,
  })),
].sort((first, second) => first.x - second.x);

function readThemePalette() {
  const styles = window.getComputedStyle(document.documentElement);
  const color = (property: string, fallback: string) =>
    Phaser.Display.Color.HexStringToColor(
      styles.getPropertyValue(property).trim() || fallback,
    ).color;

  return {
    background: color("--background", "#07101d"),
    foreground: color("--foreground", "#edf2ef"),
    surface: color("--surface", "#111f2b"),
    surfaceHigh: color("--surface-high", "#1c303d"),
    primary: color("--primary", "#78b8cf"),
    yellow: color("--signal-yellow", "#c79b2e"),
    red: color("--signal-red", "#a94743"),
  };
}

export function createChronicleGame({
  parent,
  controls,
  callbacks,
  recoveredRecords: initialRecoveredRecords,
}: {
  parent: HTMLElement;
  controls: MutableRefObject<GameControlsState>;
  callbacks: ChronicleGameCallbacks;
  recoveredRecords: readonly ChronicleRecordId[];
}): ChronicleGameHandle {
  let pausedRequested = true;
  let tutorialAlreadyCompleted = false;
  let storyResetRequested = false;
  let reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  class ChronicleScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys!: Record<
      "jump" | "dash" | "dashAlt" | "drop" | "dropAlt",
      Phaser.Input.Keyboard.Key
    >;
    private lastTouchJump = false;
    private lastTouchDash = false;
    private score = 0;
    private elapsedMs = 0;
    private multiplier = 1;
    private signal = 100;
    private completed = false;
    private checkpointIds = new Set<ChronicleChapterId>();
    private respawnX = 150;
    private respawnY = 510;
    private lastChapter: ChronicleChapterId = "origin";
    private damageReadyAt = 0;
    private lastGroundedAt = 0;
    private jumpBufferedAt = Number.NEGATIVE_INFINITY;
    private dashEndsAt = 0;
    private dashReadyAt = 0;
    private lastSnapshotAt = 0;
    private lastScoredX = 150;
    private playerState: ChroniclePlayerState = "grounded";
    private recoveredRecordIds = new Set<ChronicleRecordId>(
      initialRecoveredRecords,
    );
    private latestUnlockId: ChronicleRecordId | null = null;
    private tutorialStepIndex = tutorialAlreadyCompleted
      ? chronicleTutorialSteps.length - 1
      : 0;
    private runStarted = tutorialAlreadyCompleted;
    private dropPracticePrepared = false;
    private chapterPanels: Phaser.GameObjects.Rectangle[] = [];
    private chapterLabels: Phaser.GameObjects.Text[] = [];
    private parallaxLayers: Phaser.GameObjects.TileSprite[] = [];
    private deckBases: Phaser.GameObjects.Rectangle[] = [];
    private deckInsets: Phaser.GameObjects.Rectangle[] = [];
    private deckEdges: Phaser.GameObjects.Rectangle[] = [];
    private deckDetails: Phaser.GameObjects.TileSprite[] = [];
    private rewardMotions: Array<{
      target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc;
      tween: Phaser.Tweens.Tween;
      baseY: number;
      baseAlpha: number;
      baseScaleX: number;
      baseScaleY: number;
    }> = [];
    private landingEndsAt = 0;
    private lastDashTrailAt = 0;

    constructor() {
      super("chronicle-run");
    }

    preload() {
      this.load.spritesheet(
        "sk-character",
        "/game/assets/sk-character-sheet.png",
        { frameWidth: 48, frameHeight: 64 },
      );
      this.load.spritesheet(
        "industrial-world",
        "/game/assets/industrial-world-atlas.png",
        { frameWidth: 128, frameHeight: 128 },
      );
    }

    create() {
      this.resetRunState();
      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setRoundPixels(true);

      this.createAtmosphere();
      this.createAnimations();
      const platforms = this.createRoute();
      this.createPlayer(platforms);
      this.createHazards();
      this.createFlowNodes();
      this.createStoryPickups();
      this.createCheckpoints();
      this.createFinish();
      this.configureCamera();
      this.createInput();

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.input.keyboard?.removeAllKeys(true);
      });

      this.refreshTheme();
      callbacks.onNotice(
        storyResetRequested
          ? "New story run started. Records reset; best time and high score preserved."
          : this.runStarted
            ? "Auto-run active. Space jumps, Shift dashes, and S drops."
            : "Quick walkthrough ready. Complete the five displayed actions.",
        "info",
      );
      storyResetRequested = false;
      this.emitSnapshot();
      if (pausedRequested) this.scene.pause();
    }

    update(time: number, delta: number) {
      if (this.completed) return;
      if (this.runStarted) {
        this.elapsedMs += Math.min(Math.max(delta, 0), 250);
      }
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const grounded = body.blocked.down || body.touching.down;
      const keyboardJump =
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.keys.jump);
      const touchJump = controls.current.jump && !this.lastTouchJump;
      const keyboardDash =
        Phaser.Input.Keyboard.JustDown(this.keys.dash) ||
        Phaser.Input.Keyboard.JustDown(this.keys.dashAlt);
      const touchDash = controls.current.dash && !this.lastTouchDash;
      const dropHeld =
        this.cursors.down.isDown ||
        this.keys.drop.isDown ||
        this.keys.dropAlt.isDown ||
        controls.current.drop;
      const previousState = this.playerState;

      if (grounded) this.lastGroundedAt = time;
      if (keyboardJump || touchJump) this.jumpBufferedAt = time;

      if (!this.runStarted) {
        this.player.setVelocityX(0);
        const tutorialStep = this.currentTutorialStep();

        if (
          tutorialStep === "jump" &&
          time - this.jumpBufferedAt <= JUMP_BUFFER_WINDOW &&
          time - this.lastGroundedAt <= COYOTE_WINDOW
        ) {
          this.player.setVelocityY(-JUMP_SPEED);
          this.jumpBufferedAt = Number.NEGATIVE_INFINITY;
          this.lastGroundedAt = Number.NEGATIVE_INFINITY;
          this.advanceTutorial("jump");
        }

        if (
          tutorialStep === "dash" &&
          (keyboardDash || touchDash) &&
          time >= this.dashReadyAt
        ) {
          this.dashEndsAt = time + DASH_DURATION;
          this.dashReadyAt = time + DASH_COOLDOWN;
          this.advanceTutorial("dash");
        }

        if (
          tutorialStep === "drop" &&
          grounded &&
          !this.dropPracticePrepared
        ) {
          this.dropPracticePrepared = true;
          this.player.setVelocityY(-420);
        }

        if (tutorialStep === "drop" && !grounded && dropHeld) {
          this.player.setVelocityY(Math.max(520, body.velocity.y + 140));
          this.advanceTutorial("drop");
        }

        const dashing = time < this.dashEndsAt;
        this.updatePlayerPresentation(
          time,
          grounded,
          dashing,
          dropHeld,
          previousState,
        );

        this.lastTouchJump = controls.current.jump;
        this.lastTouchDash = controls.current.dash;
        if (
          previousState !== this.playerState ||
          time - this.lastSnapshotAt >= 250
        ) {
          this.lastSnapshotAt = time;
          this.emitSnapshot();
        }
        return;
      }

      if (
        time - this.jumpBufferedAt <= JUMP_BUFFER_WINDOW &&
        time - this.lastGroundedAt <= COYOTE_WINDOW
      ) {
        this.player.setVelocityY(-JUMP_SPEED);
        this.jumpBufferedAt = Number.NEGATIVE_INFINITY;
        this.lastGroundedAt = Number.NEGATIVE_INFINITY;
      }

      if ((keyboardDash || touchDash) && time >= this.dashReadyAt) {
        this.dashEndsAt = time + DASH_DURATION;
        this.dashReadyAt = time + DASH_COOLDOWN;
        this.score += Math.round(30 * this.multiplier);
      }

      const dashing = time < this.dashEndsAt;
      this.player.setVelocityX(dashing ? DASH_SPEED : RUN_SPEED);

      if (!grounded && dropHeld && body.velocity.y < DROP_SPEED) {
        this.player.setVelocityY(Math.max(380, body.velocity.y + 100));
      }

      this.updatePlayerPresentation(
        time,
        grounded,
        dashing,
        dropHeld,
        previousState,
      );

      this.addDistanceScore();
      if (this.player.y > WORLD_HEIGHT + 48) {
        this.damagePlayer("Route lost. Restored at the latest chapter checkpoint.");
      }
      this.updateChapter();
      this.lastTouchJump = controls.current.jump;
      this.lastTouchDash = controls.current.dash;

      if (
        previousState !== this.playerState ||
        time - this.lastSnapshotAt >= 250
      ) {
        this.lastSnapshotAt = time;
        this.emitSnapshot();
      }
    }

    private resetRunState() {
      this.lastTouchJump = false;
      this.lastTouchDash = false;
      this.score = 0;
      this.elapsedMs = 0;
      this.multiplier = 1;
      this.signal = 100;
      this.completed = false;
      this.checkpointIds.clear();
      this.checkpointIds.add("origin");
      this.respawnX = 150;
      this.respawnY = 510;
      this.lastChapter = "origin";
      this.damageReadyAt = 0;
      this.lastGroundedAt = 0;
      this.jumpBufferedAt = Number.NEGATIVE_INFINITY;
      this.dashEndsAt = 0;
      this.dashReadyAt = 0;
      this.lastSnapshotAt = 0;
      this.lastScoredX = 150;
      this.playerState = "grounded";
      this.latestUnlockId = null;
      this.tutorialStepIndex = tutorialAlreadyCompleted
        ? chronicleTutorialSteps.length - 1
        : 0;
      this.runStarted = tutorialAlreadyCompleted;
      this.dropPracticePrepared = false;
      this.chapterPanels = [];
      this.chapterLabels = [];
      this.parallaxLayers = [];
      this.deckBases = [];
      this.deckInsets = [];
      this.deckEdges = [];
      this.deckDetails = [];
      this.rewardMotions = [];
      this.landingEndsAt = 0;
      this.lastDashTrailAt = 0;
    }

    private createAtmosphereTextures() {
      if (!this.textures.exists("chronicle-far-city")) {
        const far = this.make.graphics({ x: 0, y: 0 }, false);
        far.fillStyle(0x13283d, 1);
        [
          [0, 90, 70, 190],
          [92, 45, 96, 235],
          [212, 112, 82, 168],
          [318, 20, 112, 260],
          [454, 78, 58, 202],
        ].forEach(([x, y, width, height]) => far.fillRect(x, y, width, height));
        far.fillStyle(0x78b8cf, 0.24);
        for (let x = 18; x < 512; x += 42) {
          for (let y = 82; y < 260; y += 46) far.fillRect(x, y, 3, 8);
        }
        far.generateTexture("chronicle-far-city", 512, 280);
        far.destroy();
      }

      if (!this.textures.exists("chronicle-near-city")) {
        const near = this.make.graphics({ x: 0, y: 0 }, false);
        near.fillStyle(0x091522, 1);
        [
          [0, 100, 110, 180],
          [142, 38, 122, 242],
          [296, 82, 96, 198],
          [426, 18, 86, 262],
        ].forEach(([x, y, width, height]) => near.fillRect(x, y, width, height));
        near.lineStyle(2, 0xa94743, 0.22);
        for (let x = 24; x < 512; x += 64) near.lineBetween(x, 60, x, 280);
        near.generateTexture("chronicle-near-city", 512, 280);
        near.destroy();
      }

      if (!this.textures.exists("chronicle-deck-detail")) {
        const deck = this.make.graphics({ x: 0, y: 0 }, false);
        deck.fillStyle(0xffffff, 0.72);
        deck.fillRect(0, 0, 512, 3);
        deck.fillStyle(0xffffff, 0.22);
        deck.fillRect(0, 9, 512, 2);
        deck.fillRect(0, 46, 512, 2);
        deck.lineStyle(2, 0xffffff, 0.2);
        deck.lineBetween(0, 10, 0, 88);
        deck.lineBetween(256, 10, 256, 88);
        for (let x = 24; x < 512; x += 64) {
          deck.fillStyle(0xffffff, 0.34);
          deck.fillCircle(x, 18, 2);
        }
        deck.lineStyle(2, 0xffffff, 0.15);
        for (let x = 104; x < 488; x += 256) {
          for (let offset = 0; offset < 44; offset += 11) {
            deck.lineBetween(x + offset, 56, x + offset + 18, 74);
          }
        }
        deck.generateTexture("chronicle-deck-detail", 512, 88);
        deck.destroy();
      }
    }

    private createAtmosphere() {
      this.createAtmosphereTextures();
      const skyBands = [
        { y: 90, height: 180, color: 0x08111f },
        { y: 280, height: 210, color: 0x102844 },
        { y: 505, height: 170, color: 0x7c4545 },
      ];
      skyBands.forEach((band) => {
        const layer = this.add
          .rectangle(
            WORLD_WIDTH / 2,
            band.y,
            WORLD_WIDTH,
            band.height,
            band.color,
            1,
          )
          .setDepth(-40);
        this.chapterPanels.push(layer);
      });

      this.add
        .circle(920, 215, 108, 0xffd58a, 0.84)
        .setScrollFactor(0.04)
        .setDepth(-35);

      const farCity = this.add
        .tileSprite(WORLD_WIDTH / 2, 420, WORLD_WIDTH, 280, "chronicle-far-city")
        .setScrollFactor(0.1)
        .setDepth(-30);
      const nearCity = this.add
        .tileSprite(WORLD_WIDTH / 2, 500, WORLD_WIDTH, 280, "chronicle-near-city")
        .setScrollFactor(0.28)
        .setDepth(-20);
      this.parallaxLayers.push(farCity, nearCity);

      chapters.forEach((chapter) => {
        const width = chapter.end - chapter.start;
        const panel = this.add
          .rectangle(
            chapter.start + width / 2,
            WORLD_HEIGHT / 2,
            width,
            WORLD_HEIGHT,
            chapter.tint,
            0.08,
          )
          .setDepth(-15);
        this.chapterPanels.push(panel);

        const label = this.add
          .text(
            chapter.start + 54,
            112,
            `${chapter.index} // ${chapter.label.toUpperCase()}`,
            {
              fontFamily: "monospace",
              fontSize: "20px",
              color: "#78b8cf",
              letterSpacing: 2,
            },
          )
          .setDepth(1);
        this.chapterLabels.push(label);

        if (chapter.start > 0) {
          this.add
            .rectangle(
              chapter.start,
              WORLD_HEIGHT / 2,
              5,
              WORLD_HEIGHT,
              chapter.tint,
              0.82,
            )
            .setDepth(2);
        }
      });

      this.configureParallax();
    }

    private createAnimations() {
      const animations = [
        { key: "sk-idle", frames: [0, 1], frameRate: 2, repeat: -1 },
        { key: "sk-run-right", frames: [2, 3], frameRate: 9, repeat: -1 },
        { key: "sk-jump", frames: [6], frameRate: 1, repeat: 0 },
        { key: "sk-fall", frames: [7], frameRate: 1, repeat: 0 },
        { key: "sk-land", frames: [8], frameRate: 1, repeat: 0 },
        { key: "sk-drop", frames: [12], frameRate: 1, repeat: 0 },
        { key: "sk-glitch", frames: [11], frameRate: 1, repeat: 0 },
      ];

      animations.forEach((animation) => {
        if (this.anims.exists(animation.key)) return;
        this.anims.create({
          key: animation.key,
          frames: animation.frames.map((frame) => ({
            key: "sk-character",
            frame,
          })),
          frameRate: animation.frameRate,
          repeat: animation.repeat,
        });
      });
    }

    private createRoute() {
      const platforms = this.physics.add.staticGroup();
      const floorTop = FLOOR_Y - 32;
      this.addDeckSurface(0, WORLD_WIDTH, floorTop, WORLD_HEIGHT - floorTop, 8);
      for (let x = 32; x < WORLD_WIDTH; x += 64) {
        this.addWorldSprite(platforms, x, FLOOR_Y, 0, 0.5).setVisible(false);
      }

      chronicleUpperRoutes.forEach((route) => {
        let segmentStart: number | null = null;
        for (let index = 0; index <= route.tiles; index += 1) {
          const tileExists =
            index < route.tiles && index !== 6 && index !== 7;
          if (tileExists && segmentStart === null) segmentStart = index;
          if (!tileExists && segmentStart !== null) {
            const lastIndex = index - 1;
            this.addDeckSurface(
              route.start + segmentStart * 64 - 32,
              route.start + lastIndex * 64 + 32,
              route.y - 32,
              30,
              9,
            );
            segmentStart = null;
          }
          if (!tileExists) continue;

          const platform = this.addWorldSprite(
            platforms,
            route.start + index * 64,
            route.y,
            0,
            0.5,
          ).setVisible(false);
          const body = platform.body as Phaser.Physics.Arcade.StaticBody;
          body.checkCollision.left = false;
          body.checkCollision.right = false;
          body.checkCollision.down = false;
        }
      });

      return platforms;
    }

    private addDeckSurface(
      left: number,
      right: number,
      top: number,
      height: number,
      depth: number,
    ) {
      const width = right - left;
      const palette = readThemePalette();
      const centerX = left + width / 2;
      const base = this.add
        .rectangle(centerX, top + height / 2, width, height, palette.surface, 1)
        .setDepth(depth - 0.2);
      const insetHeight = Math.max(8, height - 13);
      const inset = this.add
        .rectangle(
          centerX,
          top + 13 + insetHeight / 2,
          width,
          insetHeight,
          palette.surfaceHigh,
          0.94,
        )
        .setDepth(depth - 0.1);
      const edge = this.add
        .rectangle(centerX, top + 2, width, 4, palette.primary, 0.76)
        .setDepth(depth + 0.1);
      const detail = this.add
        .tileSprite(
          centerX,
          top + height / 2,
          width,
          height,
          "chronicle-deck-detail",
        )
        .setTint(palette.foreground)
        .setAlpha(0.34)
        .setDepth(depth);

      this.deckBases.push(base);
      this.deckInsets.push(inset);
      this.deckEdges.push(edge);
      this.deckDetails.push(detail);
    }

    private addWorldSprite(
      group: Phaser.Physics.Arcade.StaticGroup,
      x: number,
      y: number,
      frame: number,
      scale: number,
    ) {
      const sprite = group.create(
        x,
        y,
        "industrial-world",
        frame,
      ) as Phaser.Physics.Arcade.Sprite;
      sprite.setScale(scale).refreshBody();
      return sprite;
    }

    private createPlayer(platforms: Phaser.Physics.Arcade.StaticGroup) {
      this.player = this.physics.add.sprite(150, 510, "sk-character", 0);
      this.player.setScale(1.15);
      this.player.setDepth(14);
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setSize(26, 52);
      body.setOffset(11, 11);
      this.player.setMaxVelocity(DASH_SPEED, DROP_SPEED);
      this.player.setDragX(0);
      this.physics.add.collider(this.player, platforms);
    }

    private createHazards() {
      const hazards = this.physics.add.staticGroup();
      hazardPositions.forEach((x, index) => {
        const hazard = this.addWorldSprite(
          hazards,
          x,
          FLOOR_Y - 70,
          index % 3 === 1 ? 16 : 15,
          index % 3 === 1 ? 0.38 : 0.44,
        );
        hazard.setDataEnabled();
        hazard.setData("cleared", false);
        hazard.setDepth(11);
      });

      this.physics.add.overlap(this.player, hazards, (_player, object) => {
        const hazard = object as Phaser.Physics.Arcade.Sprite;
        if (hazard.getData("cleared")) return;
        if (this.time.now < this.dashEndsAt) {
          hazard.setData("cleared", true);
          hazard.disableBody(true, true);
          this.score += Math.round(180 * this.multiplier);
          this.multiplier = Math.min(5, this.multiplier + 0.35);
          callbacks.onNotice("Timing gate cleared. Momentum increased.", "success");
          if (!reducedMotion) this.cameras.main.flash(90, 120, 216, 231, false);
          this.emitSnapshot();
          return;
        }
        hazard.setData("cleared", true);
        hazard.disableBody(true, true);
        this.damagePlayer("Route impact. Momentum reset at the latest checkpoint.");
      });
    }

    private registerRewardMotion(
      target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc,
      yOffset: number,
      scaleBoost: number,
      duration: number,
    ) {
      const motion = {
        target,
        baseY: target.y,
        baseAlpha: target.alpha,
        baseScaleX: target.scaleX,
        baseScaleY: target.scaleY,
        tween: this.tweens.add({
          targets: target,
          y: target.y - yOffset,
          scaleX: target.scaleX * scaleBoost,
          scaleY: target.scaleY * scaleBoost,
          alpha: Math.min(1, target.alpha + 0.2),
          duration,
          ease: "Sine.InOut",
          yoyo: true,
          repeat: -1,
          paused: reducedMotion,
        }),
      };
      if (reducedMotion) {
        target.setY(motion.baseY);
        target.setScale(motion.baseScaleX, motion.baseScaleY);
        target.setAlpha(motion.baseAlpha);
      }
      this.rewardMotions.push(motion);
    }

    private stopRewardMotion(
      target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc,
    ) {
      this.rewardMotions
        .filter((motion) => motion.target === target)
        .forEach((motion) => motion.tween.stop());
    }

    private createCatchEffect(x: number, y: number, color: number) {
      const ring = this.add
        .circle(x, y, 26)
        .setStrokeStyle(4, color, 0.9)
        .setDepth(15);
      if (reducedMotion) {
        this.time.delayedCall(140, () => ring.destroy());
        return;
      }
      this.tweens.add({
        targets: ring,
        scale: 2.1,
        alpha: 0,
        duration: 260,
        ease: "Quad.Out",
        onComplete: () => ring.destroy(),
      });
    }

    private createFlowNodes() {
      const nodes = this.physics.add.staticGroup();

      chronicleUpperRoutes.forEach((route) => {
        route.nodeOffsets.forEach((offset) => {
          const x = route.start + offset * 64;
          const y = route.y - 96;
          const halo = this.add
            .circle(x, y, 31)
            .setStrokeStyle(3, 0x78b8cf, 0.72)
            .setDepth(11);
          const node = this.addWorldSprite(
            nodes,
            x,
            y,
            11 + (offset % 3),
            0.42,
          );
          node.setDataEnabled();
          node.setData("halo", halo);
          node.setTint(0x9bd9ea);
          node.setDepth(12);
          this.registerRewardMotion(node, 7, 1.05, 720 + offset * 18);
          this.registerRewardMotion(halo, 7, 1.16, 720 + offset * 18);
        });
      });

      this.physics.add.overlap(this.player, nodes, (_player, object) => {
        const node = object as Phaser.Physics.Arcade.Sprite;
        if (!node.active) return;
        const halo = node.getData("halo") as Phaser.GameObjects.Arc | undefined;
        this.stopRewardMotion(node);
        if (halo) {
          this.stopRewardMotion(halo);
          halo.destroy();
        }
        this.createCatchEffect(node.x, node.y, 0x78b8cf);
        node.disableBody(true, true);
        if (this.runStarted) {
          this.score += Math.round(125 * this.multiplier);
          this.multiplier = Math.min(5, this.multiplier + 0.25);
        }
        callbacks.onNotice("High route flow node recovered.", "success");
        this.emitSnapshot();
      });
    }

    private createStoryPickups() {
      const pickups = this.physics.add.staticGroup();
      chronicleRecords.forEach((record, index) => {
        const x = storyPickupPositions[index];
        const y = FLOOR_Y - 94;
        const color =
          record.kind === "education"
            ? 0xc79b2e
            : record.kind === "experience"
              ? 0x78b8cf
              : 0xa94743;
        const halo = this.add
          .circle(x, y, 43)
          .setStrokeStyle(4, color, 0.82)
          .setDepth(11);
        const pickup = this.addWorldSprite(
          pickups,
          x,
          y,
          10 + (index % 4),
          0.52,
        );
        pickup.setDataEnabled();
        pickup.setData("recordId", record.id);
        pickup.setData("halo", halo);
        pickup.setData("rewardColor", color);
        pickup.setTint(color);
        pickup.setAlpha(this.recoveredRecordIds.has(record.id) ? 0.66 : 1);
        pickup.setDepth(13);
        this.registerRewardMotion(pickup, 9, 1.06, 820 + index * 24);
        this.registerRewardMotion(halo, 9, 1.18, 820 + index * 24);
      });

      this.physics.add.overlap(this.player, pickups, (_player, object) => {
        const pickup = object as Phaser.Physics.Arcade.Sprite;
        if (!pickup.active) return;
        const recordId = pickup.getData("recordId") as ChronicleRecordId;
        const isNew = !this.recoveredRecordIds.has(recordId);
        const halo = pickup.getData("halo") as Phaser.GameObjects.Arc | undefined;
        const color = pickup.getData("rewardColor") as number;
        this.stopRewardMotion(pickup);
        if (halo) {
          this.stopRewardMotion(halo);
          halo.destroy();
        }
        this.createCatchEffect(pickup.x, pickup.y, color);
        pickup.disableBody(true, true);

        if (this.runStarted) {
          this.score += Math.round((isNew ? 300 : 90) * this.multiplier);
          this.multiplier = Math.min(5, this.multiplier + (isNew ? 0.4 : 0.1));
        }

        if (isNew) {
          this.recoveredRecordIds.add(recordId);
          this.latestUnlockId = recordId;
          callbacks.onUnlock(recordId);
          callbacks.onNotice("New story record saved to the Story Log.", "success");
        } else {
          this.latestUnlockId = recordId;
          callbacks.onUnlock(recordId);
          callbacks.onNotice("Story record recovered for this run.", "success");
        }
        this.emitSnapshot();
      });
    }

    private createCheckpoints() {
      const checkpoints = this.physics.add.staticGroup();
      checkpointDefinitions.forEach((definition) => {
        const beacon = this.addWorldSprite(
          checkpoints,
          definition.x,
          FLOOR_Y - 72,
          definition.chapterStart ? 9 : 4,
          definition.chapterStart ? 0.31 : 0.2,
        );
        beacon.setDataEnabled();
        beacon.setData("zone", definition.zone);
        beacon.setData("chapterStart", definition.chapterStart);
        beacon.setAlpha(definition.chapterStart ? 1 : 0.62);
        beacon.setDepth(10);
      });

      this.physics.add.overlap(this.player, checkpoints, (_player, object) => {
        const beacon = object as Phaser.Physics.Arcade.Sprite;
        const zone = beacon.getData("zone") as ChronicleChapterId;
        const isNew = !this.checkpointIds.has(zone);
        this.checkpointIds.add(zone);
        if (beacon.x >= this.respawnX) {
          this.respawnX = beacon.x + 70;
          this.respawnY = 510;
        }
        if (isNew && beacon.getData("chapterStart")) {
          callbacks.onNotice(`${this.chapterLabel(zone)} checkpoint stored locally.`, "info");
          this.emitSnapshot();
        }
      });
    }

    private createFinish() {
      const finishGroup = this.physics.add.staticGroup();
      const finish = this.addWorldSprite(
        finishGroup,
        WORLD_WIDTH - 240,
        FLOOR_Y - 86,
        14,
        0.48,
      );
      finish.setDepth(12);

      this.physics.add.overlap(this.player, finish, () => {
        if (this.completed) return;
        this.completed = true;
        this.score += Math.round(2_000 * this.multiplier);
        this.checkpointIds.add("present-day");
        this.emitSnapshot();
        callbacks.onNotice("Present Day reached. Chronicle Run complete.", "success");
        this.scene.pause();
      });
    }

    private createInput() {
      this.cursors = this.input.keyboard!.createCursorKeys();
      this.keys = this.input.keyboard!.addKeys({
        jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
        dash: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        dashAlt: Phaser.Input.Keyboard.KeyCodes.D,
        drop: Phaser.Input.Keyboard.KeyCodes.S,
        dropAlt: Phaser.Input.Keyboard.KeyCodes.DOWN,
      }) as Record<
        "jump" | "dash" | "dashAlt" | "drop" | "dropAlt",
        Phaser.Input.Keyboard.Key
      >;
    }

    private configureCamera() {
      const camera = this.cameras.main;
      const cameraLerp = reducedMotion ? 1 : 0.12;
      camera.startFollow(this.player, true, cameraLerp, cameraLerp);
      camera.setDeadzone(Math.min(420, parent.clientWidth * 0.4), 130);
      camera.setFollowOffset(-Math.min(460, parent.clientWidth * 0.32), 0);
    }

    private configureParallax() {
      this.parallaxLayers.forEach((layer, index) => {
        layer.setScrollFactor(reducedMotion ? 1 : index === 0 ? 0.1 : 0.28);
      });
    }

    private updatePlayerPresentation(
      time: number,
      grounded: boolean,
      dashing: boolean,
      dropHeld: boolean,
      previousState: ChroniclePlayerState,
    ) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      const landed =
        grounded &&
        (previousState === "jumping" || previousState === "falling");
      if (landed) {
        this.landingEndsAt = time + 150;
        this.createLandingDust();
      }

      this.player.anims.timeScale = dashing && !reducedMotion ? 1.65 : 1;
      if (dashing) {
        this.playerState = "dashing";
        this.player.play("sk-run-right", true);
        this.player.setAngle(reducedMotion ? 0 : -4);
        if (!reducedMotion && time - this.lastDashTrailAt >= 80) {
          this.lastDashTrailAt = time;
          this.createDashTrail();
        }
      } else if (!grounded) {
        this.playerState = body.velocity.y < 0 ? "jumping" : "falling";
        const fastDropping = dropHeld || body.velocity.y > 500;
        this.player.play(
          fastDropping
            ? "sk-drop"
            : body.velocity.y < 0
              ? "sk-jump"
              : "sk-fall",
          true,
        );
        this.player.setAngle(
          reducedMotion ? 0 : fastDropping ? 0 : body.velocity.y < 0 ? -5 : 4,
        );
      } else {
        this.playerState = "grounded";
        this.player.setAngle(0);
        this.player.play(
          time < this.landingEndsAt
            ? "sk-land"
            : this.runStarted
              ? "sk-run-right"
              : "sk-idle",
          true,
        );
      }
    }

    private createDashTrail() {
      const trail = this.add
        .sprite(
          this.player.x - 14,
          this.player.y,
          "sk-character",
          this.player.frame.name,
        )
        .setScale(1.15)
        .setDepth(13)
        .setAlpha(0.34)
        .setTint(0x78b8cf);
      this.tweens.add({
        targets: trail,
        x: trail.x - 24,
        alpha: 0,
        duration: 170,
        onComplete: () => trail.destroy(),
      });
    }

    private createLandingDust() {
      if (reducedMotion) return;
      [-1, 1].forEach((direction) => {
        const dust = this.add
          .circle(
            this.player.x + direction * 10,
            this.player.y + 28,
            4,
            0xc79b2e,
            0.46,
          )
          .setDepth(13);
        this.tweens.add({
          targets: dust,
          x: dust.x + direction * 24,
          y: dust.y - 9,
          scale: 0.35,
          alpha: 0,
          duration: 220,
          onComplete: () => dust.destroy(),
        });
      });
    }

    private currentTutorialStep(): ChronicleTutorialStepId {
      return (
        chronicleTutorialSteps[this.tutorialStepIndex]?.id ?? "complete"
      );
    }

    private tutorialCompleted() {
      return this.currentTutorialStep() === "complete";
    }

    private advanceTutorial(expected: ChronicleTutorialStepId) {
      if (this.currentTutorialStep() !== expected || expected === "complete") {
        return;
      }
      this.tutorialStepIndex = Math.min(
        chronicleTutorialSteps.length - 1,
        this.tutorialStepIndex + 1,
      );
      const nextStep = chronicleTutorialSteps[this.tutorialStepIndex];
      if (nextStep.id === "drop") {
        this.dropPracticePrepared = true;
        this.player.setVelocityY(-420);
        this.playerState = "jumping";
        this.lastGroundedAt = Number.NEGATIVE_INFINITY;
      }
      callbacks.onNotice(
        nextStep.id === "complete"
          ? "Five actions complete. Resume from the Story Log when ready."
          : nextStep.title,
        nextStep.id === "complete" ? "success" : "info",
      );
      this.lastScoredX = this.player.x;
      this.emitSnapshot();
    }

    performTutorialAction(action: "jump" | "dash" | "drop") {
      if (this.runStarted || this.currentTutorialStep() !== action) return;
      if (action === "jump") {
        this.player.setVelocityY(-JUMP_SPEED);
        this.lastGroundedAt = Number.NEGATIVE_INFINITY;
        this.jumpBufferedAt = Number.NEGATIVE_INFINITY;
      } else if (action === "dash") {
        this.dashEndsAt = this.time.now + DASH_DURATION;
        this.dashReadyAt = this.time.now + DASH_COOLDOWN;
      } else {
        this.dropPracticePrepared = true;
        this.player.setVelocityY(560);
      }
      this.advanceTutorial(action);
    }

    completeTutorialAction(action: "pause" | "story-log") {
      this.advanceTutorial(action);
    }

    beginRun(skipWalkthrough = false) {
      if (skipWalkthrough) {
        this.tutorialStepIndex = chronicleTutorialSteps.length - 1;
      }
      if (!this.tutorialCompleted()) return;

      tutorialAlreadyCompleted = true;
      this.runStarted = true;
      this.dropPracticePrepared = false;
      this.player.setPosition(150, 510);
      this.player.setVelocity(0, 0);
      this.player.clearTint();
      this.playerState = "grounded";
      this.elapsedMs = 0;
      this.dashEndsAt = 0;
      this.dashReadyAt = 0;
      this.lastScoredX = 150;
      callbacks.onNotice(
        skipWalkthrough
          ? "Walkthrough skipped. Auto-run active."
          : "Ready. Chronicle Run starts now.",
        "success",
      );
      this.emitSnapshot();
    }

    private addDistanceScore() {
      if (!this.runStarted || this.player.x <= this.lastScoredX + 24) {
        return;
      }
      const distance = this.player.x - this.lastScoredX;
      this.score += Math.max(1, Math.floor((distance / 24) * this.multiplier));
      this.lastScoredX = this.player.x;
    }

    private damagePlayer(message: string) {
      if (this.time.now < this.damageReadyAt || this.completed) return;
      this.damageReadyAt = this.time.now + 900;
      this.signal = Math.max(0, this.signal - 25);
      this.multiplier = 1;
      this.score = Math.max(0, this.score - 125);
      this.player.play("sk-glitch", true);
      this.player.setTint(0xa94743);
      this.player.setVelocity(0, 0);
      this.player.setPosition(this.respawnX, this.respawnY);
      this.lastScoredX = this.respawnX;
      this.lastChapter = this.chapterAt(this.respawnX).id;
      this.time.delayedCall(260, () => this.player.clearTint());
      if (!reducedMotion) this.cameras.main.shake(130, 0.007);

      if (this.signal === 0) {
        this.signal = 100;
        this.score = Math.max(0, this.score - 300);
      }

      callbacks.onNotice(message, "warning");
      this.emitSnapshot();
    }

    private updateChapter() {
      const chapter = this.chapterAt(this.player.x);
      if (chapter.id === this.lastChapter) return;
      this.lastChapter = chapter.id;
      this.checkpointIds.add(chapter.id);
      this.respawnX = chapter.start + 180;
      this.respawnY = 510;
      this.multiplier = Math.min(5, this.multiplier + 0.25);
      callbacks.onNotice(`${chapter.label} checkpoint stored locally.`, "info");
      this.emitSnapshot();
    }

    private chapterAt(x: number) {
      return (
        chapters.find(
          (chapter) => x >= chapter.start && x < chapter.end,
        ) ?? chapters[chapters.length - 1]
      );
    }

    private chapterLabel(zoneId: ChronicleChapterId) {
      return chapters.find((chapter) => chapter.id === zoneId)?.label ?? "Chapter";
    }

    private emitSnapshot() {
      const chapter = this.chapterAt(this.player.x);
      const chapterIndex = Math.max(
        0,
        chapters.findIndex((candidate) => candidate.id === chapter.id),
      );
      const snapshot: GameSnapshot = {
        zone: chapter.id,
        zoneLabel: chapter.label,
        chapterIndex,
        journeyProgress: Phaser.Math.Clamp(
          Math.round((this.player.x / WORLD_WIDTH) * 100),
          0,
          100,
        ),
        playerState: this.playerState,
        dashReady: this.time.now >= this.dashReadyAt,
        tutorialStep: this.currentTutorialStep(),
        tutorialCompleted: this.tutorialCompleted(),
        runStarted: this.runStarted,
        recoveredRecords: chronicleRecords
          .map((record) => record.id)
          .filter((recordId) => this.recoveredRecordIds.has(recordId)),
        latestUnlockId: this.latestUnlockId,
        score: this.score,
        elapsedMs: Math.round(this.elapsedMs),
        multiplier: this.multiplier,
        signal: this.signal,
        checkpoints: [...this.checkpointIds],
        completed: this.completed,
      };
      callbacks.onSnapshot(snapshot);
    }

    clearRecoveredStories() {
      this.recoveredRecordIds.clear();
      this.latestUnlockId = null;
    }

    setReducedMotion(reduced: boolean) {
      reducedMotion = reduced;
      this.configureCamera();
      this.configureParallax();
      this.rewardMotions.forEach((motion) => {
        if (!motion.target.active) return;
        if (reduced) {
          motion.tween.pause();
          motion.target.setY(motion.baseY);
          motion.target.setScale(motion.baseScaleX, motion.baseScaleY);
          motion.target.setAlpha(motion.baseAlpha);
        } else {
          motion.tween.restart();
        }
      });
      if (reduced) {
        this.player?.setAngle(0);
        if (this.player) this.player.anims.timeScale = 1;
      }
    }

    refreshTheme() {
      const palette = readThemePalette();
      this.cameras.main.setBackgroundColor(palette.background);
      this.chapterLabels.forEach((label) => {
        label.setColor(`#${palette.primary.toString(16).padStart(6, "0")}`);
      });
      this.chapterPanels.slice(0, 3).forEach((panel, index) => {
        const colors = [palette.background, palette.surface, palette.surfaceHigh];
        panel.setFillStyle(colors[index], 1);
      });
      this.deckBases.forEach((surface) => surface.setFillStyle(palette.surface, 1));
      this.deckInsets.forEach((surface) =>
        surface.setFillStyle(palette.surfaceHigh, 0.94),
      );
      this.deckEdges.forEach((edge) =>
        edge.setFillStyle(palette.primary, 0.76),
      );
      this.deckDetails.forEach((detail) =>
        detail.setTint(palette.foreground).setAlpha(0.34),
      );
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: parent.clientWidth || 960,
    height: parent.clientHeight || 600,
    backgroundColor: "#07101d",
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 1250 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      keyboard: true,
      touch: true,
      mouse: true,
    },
    scene: ChronicleScene,
  });

  const getScene = () =>
    game.scene.getScene("chronicle-run") as ChronicleScene | undefined;

  return {
    destroy() {
      game.destroy(true);
      parent.replaceChildren();
    },
    setPaused(paused) {
      pausedRequested = paused;
      const scene = getScene();
      if (!scene) return;
      if (paused && scene.scene.isActive()) scene.scene.pause();
      if (!paused && scene.scene.isPaused() && !scene.scene.isSleeping()) {
        scene.scene.resume();
      }
    },
    setReducedMotion(reduced) {
      getScene()?.setReducedMotion(reduced);
    },
    performTutorialAction(action) {
      getScene()?.performTutorialAction(action);
    },
    completeTutorialAction(action) {
      getScene()?.completeTutorialAction(action);
    },
    beginRun(skipWalkthrough = false) {
      getScene()?.beginRun(skipWalkthrough);
    },
    restart() {
      const scene = getScene();
      if (!scene) return;
      scene.clearRecoveredStories();
      storyResetRequested = true;
      if (scene.scene.isPaused()) scene.scene.resume();
      scene.scene.restart();
    },
    refreshTheme() {
      getScene()?.refreshTheme();
    },
  };
}
