import * as Phaser from "phaser";
import type { MutableRefObject } from "react";
import type {
  GameControlsState,
  GamePanelId,
  GameSnapshot,
  GameZoneId,
  SignalCoreId,
  SignalGameCallbacks,
  SignalGameHandle,
} from "@/components/game/game-types";

const WORLD_WIDTH = 5360;
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

const zones: readonly {
  id: GameZoneId;
  label: string;
  start: number;
  end: number;
  tint: number;
}[] = [
  { id: "onboarding", label: "Origin", start: 0, end: 640, tint: 0x315f78 },
  { id: "mission-archive", label: "Live Systems", start: 640, end: 1900, tint: 0xc79b2e },
  { id: "field-log", label: "Secure Engineering", start: 1900, end: 2900, tint: 0x315f78 },
  { id: "loadout", label: "Build Lab", start: 2900, end: 3900, tint: 0xa94743 },
  { id: "comms", label: "Present Day", start: 3900, end: WORLD_WIDTH, tint: 0x5e765f },
] as const;

const terminalDefinitions: readonly {
  id: GamePanelId;
  label: string;
  x: number;
  frame: number;
}[] = [
  { id: "briefing", label: "Open movement briefing", x: 390, frame: 9 },
  { id: "project:tymaura", label: "Inspect Tymaura", x: 790, frame: 5 },
  { id: "project:skaltek", label: "Inspect Skaltek", x: 1040, frame: 5 },
  {
    id: "project:solana-contract-generator",
    label: "Inspect Solana AI Generator",
    x: 1290,
    frame: 5,
  },
  {
    id: "project:crypto-portfolio",
    label: "Inspect Crypto Portfolio",
    x: 1540,
    frame: 5,
  },
  { id: "field-log", label: "Open Field Log", x: 2210, frame: 6 },
  { id: "loadout", label: "Open Loadout Bay", x: 3210, frame: 7 },
  { id: "comms", label: "Open Comms channels", x: 4210, frame: 8 },
] as const;

const coreDefinitions: readonly {
  id: SignalCoreId;
  x: number;
  y: number;
  frame: number;
}[] = [
  { id: "mission-archive", x: 1770, y: 444, frame: 11 },
  { id: "field-log", x: 2740, y: 444, frame: 12 },
  { id: "loadout", x: 3740, y: 444, frame: 13 },
  { id: "comms", x: 4700, y: 444, frame: 10 },
] as const;

const checkpointDefinitions: readonly {
  zone: GameZoneId;
  x: number;
}[] = [
  { zone: "onboarding", x: 150 },
  { zone: "mission-archive", x: 690 },
  { zone: "field-log", x: 1960 },
  { zone: "loadout", x: 2960 },
  { zone: "comms", x: 3960 },
] as const;

function readThemePalette() {
  const styles = window.getComputedStyle(document.documentElement);
  const background = styles.getPropertyValue("--background").trim() || "#142028";
  const foreground = styles.getPropertyValue("--foreground").trim() || "#edf2ef";
  const surface = styles.getPropertyValue("--surface").trim() || "#1c2a33";
  const primary = styles.getPropertyValue("--primary").trim() || "#78b8cf";

  return {
    background: Phaser.Display.Color.HexStringToColor(background).color,
    foreground: Phaser.Display.Color.HexStringToColor(foreground).color,
    surface: Phaser.Display.Color.HexStringToColor(surface).color,
    primary: Phaser.Display.Color.HexStringToColor(primary).color,
  };
}

export function createSignalGame({
  parent,
  controls,
  callbacks,
}: {
  parent: HTMLElement;
  controls: MutableRefObject<GameControlsState>;
  callbacks: SignalGameCallbacks;
}): SignalGameHandle {
  let pausedRequested = true;
  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class SignalScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys!: Record<
      "jump" | "dash" | "dashAlt" | "drop" | "dropAlt",
      Phaser.Input.Keyboard.Key
    >;
    private terminals: Phaser.Physics.Arcade.StaticGroup | null = null;
    private terminalObjects: Phaser.GameObjects.Sprite[] = [];
    private nearbyTerminal: Phaser.GameObjects.Sprite | null = null;
    private finalUplink!: Phaser.GameObjects.Sprite;
    private nearbyUplink = false;
    private coreIds = new Set<SignalCoreId>();
    private discovered = new Set<GamePanelId>();
    private checkpointIds = new Set<GameZoneId>();
    private score = 0;
    private multiplier = 1;
    private signal = 100;
    private completed = false;
    private respawnX = 150;
    private respawnY = 520;
    private lastTouchJump = false;
    private lastTouchDash = false;
    private lastZone: GameZoneId = "onboarding";
    private damageReadyAt = 0;
    private lastGroundedAt = 0;
    private jumpBufferedAt = Number.NEGATIVE_INFINITY;
    private dashEndsAt = 0;
    private dashReadyAt = 0;
    private lastSnapshotAt = 0;
    private playerState: GameSnapshot["playerState"] = "grounded";
    private themedObjects: Phaser.GameObjects.Rectangle[] = [];
    private zoneLabels: Phaser.GameObjects.Text[] = [];

    constructor() {
      super("signal-level");
    }

    preload() {
      this.load.spritesheet("sk-character", "/game/assets/sk-character-sheet.png", {
        frameWidth: 48,
        frameHeight: 64,
      });
      this.load.spritesheet("industrial-world", "/game/assets/industrial-world-atlas.png", {
        frameWidth: 128,
        frameHeight: 128,
      });
    }

    create() {
      this.terminalObjects = [];
      this.nearbyTerminal = null;
      this.nearbyUplink = false;
      this.coreIds.clear();
      this.discovered.clear();
      this.checkpointIds.clear();
      this.score = 0;
      this.multiplier = 1;
      this.signal = 100;
      this.completed = false;
      this.respawnX = 150;
      this.respawnY = 520;
      this.lastTouchJump = false;
      this.lastTouchDash = false;
      this.lastZone = "onboarding";
      this.damageReadyAt = 0;
      this.lastGroundedAt = 0;
      this.jumpBufferedAt = Number.NEGATIVE_INFINITY;
      this.dashEndsAt = 0;
      this.dashReadyAt = 0;
      this.lastSnapshotAt = 0;
      this.playerState = "grounded";
      this.themedObjects = [];
      this.zoneLabels = [];

      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setRoundPixels(true);

      this.createAtmosphere();
      this.createAnimations();

      const platforms = this.physics.add.staticGroup();
      for (let x = 32; x < WORLD_WIDTH; x += 64) {
        this.addWorldSprite(platforms, x, FLOOR_Y, 0, 0.5);
      }

      [
        { x: 1710, y: 525, tiles: 4 },
        { x: 2680, y: 525, tiles: 4 },
        { x: 3680, y: 525, tiles: 4 },
        { x: 4640, y: 525, tiles: 4 },
      ].forEach((platform) => {
        for (let index = 0; index < platform.tiles; index += 1) {
          this.addWorldSprite(
            platforms,
            platform.x + index * 64,
            platform.y,
            index === 0 || index === platform.tiles - 1 ? 1 : 0,
            0.5,
          );
        }
      });

      this.player = this.physics.add.sprite(150, 500, "sk-character", 0);
      this.player.setScale(1.15);
      this.player.setCollideWorldBounds(true);
      this.player.setDepth(12);
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      playerBody.setSize(26, 52);
      playerBody.setOffset(11, 11);
      this.player.setMaxVelocity(DASH_SPEED, DROP_SPEED);
      this.player.setDragX(0);
      this.physics.add.collider(this.player, platforms);

      this.createTerminals();
      this.createCores();
      this.createCheckpoints();
      this.createHazards(platforms);
      this.createFinalUplink();

      this.configureCamera();

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

      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.input.keyboard?.removeAllKeys(true);
      });

      this.refreshTheme();
      callbacks.onNotice("Auto-run active. Space jumps, Shift dashes, and S drops.", "info");
      this.emitSnapshot();
      if (pausedRequested) this.scene.pause();
    }

    update(time: number) {
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
        this.emitSnapshot();
      }

      const dashing = time < this.dashEndsAt;
      this.player.setVelocityX(dashing ? DASH_SPEED : RUN_SPEED);

      if (!grounded && dropHeld && body.velocity.y < DROP_SPEED) {
        this.player.setVelocityY(Math.max(360, body.velocity.y + 90));
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

      if (this.player.y > WORLD_HEIGHT - 20) {
        this.damagePlayer("Signal lost. Restored at the last checkpoint.");
      }

      this.updateZone();
      this.lastTouchJump = controls.current.jump;
      this.lastTouchDash = controls.current.dash;

      if (previousState !== this.playerState || time - this.lastSnapshotAt >= 250) {
        this.lastSnapshotAt = time;
        this.emitSnapshot();
      }
    }

    private configureCamera() {
      const camera = this.cameras.main;
      const cameraLerp = reducedMotion ? 1 : 0.12;
      camera.startFollow(this.player, true, cameraLerp, cameraLerp);
      camera.setDeadzone(Math.min(420, parent.clientWidth * 0.4), 130);
      camera.setFollowOffset(Math.min(250, parent.clientWidth * 0.18), 0);
    }

    private createAtmosphere() {
      zones.forEach((zone, index) => {
        const width = zone.end - zone.start;
        const panel = this.add
          .rectangle(zone.start + width / 2, WORLD_HEIGHT / 2, width, WORLD_HEIGHT, zone.tint, 0.08)
          .setDepth(-20);
        this.themedObjects.push(panel);

        const label = this.add
          .text(zone.start + 44, 108, `${String(index + 1).padStart(2, "0")} // ${zone.label.toUpperCase()}`, {
            fontFamily: "monospace",
            fontSize: "18px",
            color: "#78b8cf",
            letterSpacing: 2,
          })
          .setDepth(1);
        this.zoneLabels.push(label);

        if (index > 0) {
          this.add.rectangle(zone.start, WORLD_HEIGHT / 2, 4, WORLD_HEIGHT, zone.tint, 0.72).setDepth(1);
        }
      });
    }

    private createAnimations() {
      const animations = [
        { key: "sk-idle", frames: [0, 1], frameRate: 2, repeat: -1 },
        { key: "sk-run-right", frames: [2, 3], frameRate: 8, repeat: -1 },
        { key: "sk-run-left", frames: [4, 5], frameRate: 8, repeat: -1 },
        { key: "sk-jump", frames: [6], frameRate: 1, repeat: 0 },
        { key: "sk-fall", frames: [7], frameRate: 1, repeat: 0 },
        { key: "sk-interact", frames: [9, 10], frameRate: 3, repeat: -1 },
        { key: "sk-glitch", frames: [11], frameRate: 1, repeat: 0 },
      ];

      animations.forEach((animation) => {
        if (!this.anims.exists(animation.key)) {
          this.anims.create({
            key: animation.key,
            frames: animation.frames.map((frame) => ({ key: "sk-character", frame })),
            frameRate: animation.frameRate,
            repeat: animation.repeat,
          });
        }
      });
    }

    private addWorldSprite(
      group: Phaser.Physics.Arcade.StaticGroup,
      x: number,
      y: number,
      frame: number,
      scale: number,
    ) {
      const sprite = group.create(x, y, "industrial-world", frame) as Phaser.Physics.Arcade.Sprite;
      sprite.setScale(scale).refreshBody();
      return sprite;
    }

    private createTerminals() {
      this.terminals = this.physics.add.staticGroup();
      terminalDefinitions.forEach((terminal) => {
        const sprite = this.addWorldSprite(this.terminals!, terminal.x, 574, terminal.frame, 0.48);
        sprite.setDataEnabled();
        sprite.setData("panelId", terminal.id);
        sprite.setData("label", terminal.label);
        sprite.setDepth(6);
        this.terminalObjects.push(sprite);
      });
    }

    private createCores() {
      const cores = this.physics.add.staticGroup();
      coreDefinitions.forEach((definition) => {
        const core = this.addWorldSprite(cores, definition.x, definition.y, definition.frame, 0.38);
        core.setDataEnabled();
        core.setData("coreId", definition.id);
        core.setDepth(8);
        if (!reducedMotion) {
          this.tweens.add({
            targets: core,
            y: definition.y - 10,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut",
          });
        }
      });

      this.physics.add.overlap(this.player, cores, (_player, gameObject) => {
        const core = gameObject as Phaser.Physics.Arcade.Sprite;
        const coreId = core.getData("coreId") as SignalCoreId;
        if (this.coreIds.has(coreId)) return;

        this.coreIds.add(coreId);
        this.score += Math.round(250 * this.multiplier);
        this.multiplier = Math.min(4, this.multiplier + 0.5);
        core.disableBody(true, true);
        callbacks.onNotice(`${this.zoneLabel(coreId)} signal core recovered.`, "success");
        this.emitSnapshot();
      });
    }

    private createCheckpoints() {
      const checkpoints = this.physics.add.staticGroup();
      checkpointDefinitions.forEach((definition) => {
        const beacon = this.addWorldSprite(checkpoints, definition.x, 580, 9, 0.34);
        beacon.setDataEnabled();
        beacon.setData("zone", definition.zone);
        beacon.setDepth(5);
      });

      this.physics.add.overlap(this.player, checkpoints, (_player, gameObject) => {
        const beacon = gameObject as Phaser.Physics.Arcade.Sprite;
        const zone = beacon.getData("zone") as GameZoneId;
        const isNewCheckpoint = !this.checkpointIds.has(zone);
        this.checkpointIds.add(zone);

        if (beacon.x > this.respawnX) {
          this.respawnX = beacon.x;
          this.respawnY = 520;
        }

        if (isNewCheckpoint) {
          callbacks.onNotice(`${this.zoneLabel(zone)} checkpoint stored locally.`, "info");
          this.emitSnapshot();
        }
      });
    }

    private createHazards(platforms: Phaser.Physics.Arcade.StaticGroup) {
      const hazards = this.physics.add.staticGroup();
      [1840, 2820, 3820, 4810].forEach((x) => {
        const hazard = this.addWorldSprite(hazards, x, 594, 15, 0.48);
        hazard.setDepth(7);
      });

      [1110, 2360, 3360, 4360].forEach((x) => {
        const corruptBlock = this.addWorldSprite(platforms, x, 594, 16, 0.48);
        corruptBlock.setData("corrupt", true);
        corruptBlock.setDepth(5);
      });

      this.physics.add.overlap(this.player, hazards, () => {
        this.damagePlayer("Firewall contact. Multiplier reset.");
      });
    }

    private createFinalUplink() {
      const uplinkGroup = this.physics.add.staticGroup();
      this.finalUplink = this.addWorldSprite(uplinkGroup, 5150, 560, 8, 0.64);
      this.finalUplink.setDataEnabled();
      this.finalUplink.setData("label", "Activate final Comms uplink");
      this.finalUplink.setDepth(7);
    }

    private updateNearbyTarget() {
      let nearest: Phaser.GameObjects.Sprite | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      this.terminalObjects.forEach((terminal) => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, terminal.x, terminal.y);
        if (distance < 112 && distance < nearestDistance) {
          nearest = terminal;
          nearestDistance = distance;
        }
      });

      const uplinkDistance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.finalUplink.x,
        this.finalUplink.y,
      );
      const nextNearbyUplink = uplinkDistance < 132;

      if (nearest !== this.nearbyTerminal || nextNearbyUplink !== this.nearbyUplink) {
        this.nearbyTerminal = nearest;
        this.nearbyUplink = nextNearbyUplink;
        this.emitSnapshot();
      }
    }

    private activateNearbyTarget() {
      if (this.nearbyTerminal) {
        const panelId = this.nearbyTerminal.getData("panelId") as GamePanelId;
        if (!this.discovered.has(panelId)) {
          this.discovered.add(panelId);
          this.score += Math.round(50 * this.multiplier);
          this.multiplier = Math.min(4, this.multiplier + 0.25);
        }
        this.player.play("sk-interact", true);
        this.emitSnapshot();
        this.scene.pause();
        callbacks.onOpenPanel(panelId);
        return;
      }

      if (this.nearbyUplink) {
        if (this.coreIds.size < coreDefinitions.length) {
          callbacks.onNotice(
            `Uplink locked. Recover ${coreDefinitions.length - this.coreIds.size} remaining core${coreDefinitions.length - this.coreIds.size === 1 ? "" : "s"}.`,
            "warning",
          );
          return;
        }

        if (!this.completed) {
          this.completed = true;
          this.score += Math.round(1000 * this.multiplier);
          this.emitSnapshot();
        }
        this.scene.pause();
        callbacks.onOpenPanel("uplink");
      }
    }

    private damagePlayer(message: string) {
      if (this.time.now < this.damageReadyAt) return;
      this.damageReadyAt = this.time.now + 900;
      this.signal = Math.max(0, this.signal - 25);
      this.multiplier = 1;
      this.score = Math.max(0, this.score - 100);
      this.player.play("sk-glitch", true);
      this.player.setTint(0xa94743);
      this.player.setVelocity(0, 0);
      this.player.setPosition(this.respawnX, this.respawnY);
      this.time.delayedCall(260, () => this.player.clearTint());

      if (this.signal === 0) {
        this.signal = 100;
        this.score = Math.max(0, this.score - 250);
      }

      callbacks.onNotice(message, "warning");
      this.emitSnapshot();
    }

    private updateZone() {
      const zone = zones.find((candidate) => this.player.x >= candidate.start && this.player.x < candidate.end) ?? zones[0];
      if (zone.id === this.lastZone) return;

      this.lastZone = zone.id;
      callbacks.onNotice(`${zone.label} entered.`, "info");
      this.emitSnapshot();
    }

    private zoneLabel(zoneId: GameZoneId) {
      return zones.find((zone) => zone.id === zoneId)?.label ?? "Signal zone";
    }

    private emitSnapshot() {
      const zone = zones.find((candidate) => candidate.id === this.lastZone) ?? zones[0];
      const chapterIndex = Math.max(
        0,
        zones.findIndex((candidate) => candidate.id === zone.id),
      );
      const nearbyLabel = this.nearbyUplink
        ? (this.finalUplink.getData("label") as string)
        : this.nearbyTerminal
          ? (this.nearbyTerminal.getData("label") as string)
          : null;

      const snapshot: GameSnapshot = {
        zone: zone.id,
        zoneLabel: zone.label,
        chapterIndex,
        journeyProgress: Phaser.Math.Clamp(
          Math.round((this.player.x / WORLD_WIDTH) * 100),
          0,
          100,
        ),
        playerState: this.playerState,
        dashReady: this.time.now >= this.dashReadyAt,
        score: this.score,
        multiplier: this.multiplier,
        signal: this.signal,
        cores: [...this.coreIds],
        discovered: [...this.discovered],
        checkpoints: [...this.checkpointIds],
        nearbyLabel,
        completed: this.completed,
      };
      callbacks.onSnapshot(snapshot);
    }

    setReducedMotion(reduced: boolean) {
      reducedMotion = reduced;
      this.configureCamera();
    }

    refreshTheme() {
      const palette = readThemePalette();
      this.cameras.main.setBackgroundColor(palette.background);
      this.themedObjects.forEach((object, index) => {
        object.setFillStyle(zones[index].tint, 0.08);
      });
      this.zoneLabels.forEach((label) => {
        label.setColor(`#${palette.primary.toString(16).padStart(6, "0")}`);
      });
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: parent.clientWidth || 960,
    height: parent.clientHeight || 600,
    backgroundColor: "#142028",
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
    scene: SignalScene,
  });

  const getScene = () => game.scene.getScene("signal-level") as SignalScene | undefined;

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
      if (!paused && scene.scene.isPaused()) scene.scene.resume();
    },
    setReducedMotion(reduced) {
      getScene()?.setReducedMotion(reduced);
    },
    restart() {
      pausedRequested = true;
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
