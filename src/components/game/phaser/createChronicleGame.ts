import * as Phaser from "phaser";
import type { MutableRefObject } from "react";
import {
  chronicleRecords,
  chronicleTutorialSteps,
  type ChronicleChapterId,
  type ChronicleRecordId,
  type ChronicleTutorialStepId,
} from "@/components/game/chronicle-story";
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
const FLOOR_Y = 664;
const RUN_SPEED = 270;
const DASH_SPEED = 455;
const DASH_DURATION = 240;
const DASH_COOLDOWN = 950;
const JUMP_SPEED = 610;
const DROP_SPEED = 820;
const COYOTE_WINDOW = 120;
const JUMP_BUFFER_WINDOW = 140;

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

const upperRoutes: readonly {
  start: number;
  y: number;
  tiles: number;
  nodeOffsets: readonly number[];
}[] = [
  { start: 2_500, y: 535, tiles: 12, nodeOffsets: [4, 8] },
  { start: 8_150, y: 510, tiles: 15, nodeOffsets: [3, 8, 12] },
  { start: 13_950, y: 495, tiles: 14, nodeOffsets: [4, 10] },
  { start: 19_750, y: 480, tiles: 16, nodeOffsets: [3, 8, 13] },
  { start: 25_800, y: 465, tiles: 16, nodeOffsets: [4, 9, 14] },
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
  skipTutorial,
  recoveredRecords: initialRecoveredRecords,
}: {
  parent: HTMLElement;
  controls: MutableRefObject<GameControlsState>;
  callbacks: ChronicleGameCallbacks;
  skipTutorial: boolean;
  recoveredRecords: readonly ChronicleRecordId[];
}): ChronicleGameHandle {
  let pausedRequested = true;
  let tutorialAlreadyCompleted = skipTutorial;
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
        this.runStarted
          ? "Auto-run active. Space jumps, Shift dashes, and S drops."
          : "Quick walkthrough ready. Complete the five displayed actions.",
        "info",
      );
      this.emitSnapshot();
      if (pausedRequested) this.scene.pause();
    }

    update(time: number) {
      if (this.completed) return;
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
        if (dashing) {
          this.playerState = "dashing";
          this.player.play("sk-run-right", true);
        } else if (!grounded) {
          this.playerState = body.velocity.y < 0 ? "jumping" : "falling";
          this.player.play(body.velocity.y < 0 ? "sk-jump" : "sk-fall", true);
        } else {
          this.playerState = "grounded";
          this.player.play("sk-idle", true);
        }

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

      if (dashing) {
        this.playerState = "dashing";
        this.player.play("sk-run-right", true);
      } else if (!grounded) {
        this.playerState = body.velocity.y < 0 ? "jumping" : "falling";
        this.player.play(body.velocity.y < 0 ? "sk-jump" : "sk-fall", true);
      } else {
        this.playerState = "grounded";
        this.player.play("sk-run-right", true);
      }

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
      for (let x = 32; x < WORLD_WIDTH; x += 64) {
        this.addWorldSprite(platforms, x, FLOOR_Y, 0, 0.5).setDepth(8);
      }

      upperRoutes.forEach((route) => {
        for (let index = 0; index < route.tiles; index += 1) {
          if (index === 6 || index === 7) continue;
          const frame = index === 0 || index === route.tiles - 1 ? 1 : 0;
          this.addWorldSprite(
            platforms,
            route.start + index * 64,
            route.y,
            frame,
            0.5,
          ).setDepth(9);
        }
      });

      return platforms;
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

    private createFlowNodes() {
      const nodes = this.physics.add.staticGroup();

      upperRoutes.forEach((route) => {
        route.nodeOffsets.forEach((offset) => {
          const node = this.addWorldSprite(
            nodes,
            route.start + offset * 64,
            route.y - 94,
            11 + (offset % 3),
            0.3,
          );
          node.setDepth(12);
        });
      });

      this.physics.add.overlap(this.player, nodes, (_player, object) => {
        const node = object as Phaser.Physics.Arcade.Sprite;
        if (!node.active) return;
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
        const pickup = this.addWorldSprite(
          pickups,
          storyPickupPositions[index],
          FLOOR_Y - 86,
          10 + (index % 4),
          0.34,
        );
        pickup.setDataEnabled();
        pickup.setData("recordId", record.id);
        pickup.setAlpha(this.recoveredRecordIds.has(record.id) ? 0.56 : 1);
        pickup.setDepth(13);
      });

      this.physics.add.overlap(this.player, pickups, (_player, object) => {
        const pickup = object as Phaser.Physics.Arcade.Sprite;
        if (!pickup.active) return;
        const recordId = pickup.getData("recordId") as ChronicleRecordId;
        const isNew = !this.recoveredRecordIds.has(recordId);
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
          callbacks.onNotice("Story record already stored. Replay score added.", "info");
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

    beginRun(skipTutorialStep = false) {
      if (skipTutorialStep) {
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
      this.dashEndsAt = 0;
      this.dashReadyAt = 0;
      this.lastScoredX = 150;
      callbacks.onNotice(
        skipTutorialStep
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
        multiplier: this.multiplier,
        signal: this.signal,
        checkpoints: [...this.checkpointIds],
        completed: this.completed,
      };
      callbacks.onSnapshot(snapshot);
    }

    setReducedMotion(reduced: boolean) {
      reducedMotion = reduced;
      this.configureCamera();
      this.configureParallax();
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
    beginRun(skipTutorialStep = false) {
      getScene()?.beginRun(skipTutorialStep);
    },
    restart() {
      const scene = getScene();
      if (!scene) return;
      if (scene.scene.isPaused()) scene.scene.resume();
      scene.scene.restart();
    },
    refreshTheme() {
      getScene()?.refreshTheme();
    },
  };
}
