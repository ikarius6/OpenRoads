﻿/* INTRO TODO:
 * Music
 * Demo level sequence
 */
module States {
    export class Intro extends Engine.State2D implements Engine.GameState {
        private myManagers: Managers.ManagerSet;
        private background: Drawing.Sprite;
        private titleLeft: Drawing.Sprite;
        private titleRight: Drawing.Sprite;
        private frames: Drawing.Sprite[];
        private anim: Drawing.Sprite[][];
        private animFrame: Drawing.Sprite[];
        private creditFrame: Drawing.Sprite;
        private totalTime: number;
        private introSound: Sounds.SoundEffect;
        private frame: number
        private titleProgress: number;
        private enabled: boolean;
        private hasPlayedSong: boolean = false;
        private introText: Drawing.Sprite;

        constructor(managers: Managers.ManagerSet) {
            super(managers);
            this.myManagers = managers;
            this.totalTime = 0.0;
            this.frame = 0;
            this.titleProgress = 0.0;
        }

        load(gl: WebGLRenderingContext): void {
            super.load(gl);
            var managers = this.myManagers;
            var introParts = managers.Textures.getTextures(gl, "INTRO.LZS");
            var intro = introParts.map((tf) => new Drawing.Sprite(gl, managers, tf));
            this.anim = managers.Textures.getAnim(gl, "ANIM.LZS").map((f) => f.map((tf) => new Drawing.Sprite(gl, managers, tf)));
            this.background = intro[0];
            
            var titleShader = managers.Shaders.getShader(gl, managers.Shaders.Shaders.TitleEffect2D);
            this.titleLeft = new Drawing.Sprite(gl, managers, introParts[1], titleShader);
            this.titleLeft.Brightness = -1;
            this.titleRight = new Drawing.Sprite(gl, managers, introParts[1], titleShader);
            this.titleRight.Brightness = 1;

            this.introSound = managers.Sounds.getSound(managers.Sounds.Sounds.Intro);
            this.introText = new Drawing.TextHelper(managers).getSpriteFromText(gl, managers, "Press Space to Continue", "11pt Arial", 20, true);
            this.introText.Position.x = 320 / 2 - this.introText.Size.x / 2;
            this.introText.Position.y = 2;

            this.frames = intro.slice(2);
            this.animFrame = null;
            this.creditFrame = null;
        }

        unload(): void {
        }

        updatePhysics(frameManager: Engine.FrameManager, frameTimeInfo: Engine.FrameTimeInfo): void {
            var managers = this.myManagers;

            var fps = frameTimeInfo.getFPS();
            this.enabled = this.myManagers.VR === null || !this.myManagers.VR.isVRSafetyWarningVisible();

            if (this.enabled && !this.hasPlayedSong) {
                managers.Audio.playSong(0);
                this.hasPlayedSong = true;
            }

            if (this.enabled && this.frame >= fps / 2 && (managers.Controls.getEnter() || managers.Controls.getExit())) {
                var menuState = new MainMenu(managers);
                managers.Frames.addState(menuState);
            }

            if (this.frame == fps / 2) {
                this.introSound.play();
            }

            if (this.enabled) {
                this.frame++;
            }

            this.background.Brightness = this.frame < fps ? this.frame / fps : 1.0;
            this.introText.Brightness = this.frame < fps ? this.frame / fps : 1.0;

            var animStartFrame = fps * 2, titleStartFrame = animStartFrame + this.anim.length,
                creditsStartFrame = titleStartFrame + fps * 4;

            var animFrame = this.frame - animStartFrame;
            this.animFrame = animFrame >= 0 && animFrame < this.anim.length ? this.anim[animFrame] : null;

            var titleFrame = this.frame - titleStartFrame;
            if (titleFrame < 0) {
                this.titleRight.Alpha = this.titleLeft.Alpha = 0;
                this.titleProgress = 0.0;
            } else if (titleFrame < fps * 3.5) {
                this.titleProgress = this.titleRight.Alpha = this.titleLeft.Alpha = titleFrame / (fps * 3.5);
            } else {
                this.titleRight.Alpha = this.titleLeft.Alpha = 1.0;
                this.titleProgress = 1.0;
            }

            var creditFrame = this.frame - creditsStartFrame;
            if (creditFrame > 0) {
                var creditIdx = (2 + Math.floor(creditFrame / (fps * 4))) % this.frames.length;
                this.creditFrame = this.frames[creditIdx];
                var seq = creditFrame % (fps * 4);
                if (seq < fps) {
                    this.creditFrame.Alpha = seq / fps;
                } else if (seq > fps * 3) {
                    this.creditFrame.Alpha = (fps * 4 - seq) / fps;
                    if (this.creditFrame.Alpha < 0.1 && creditIdx == this.frames.length - 1) {
                        var demoState = new GameState(managers, 0, new Game.DemoController(managers.Streams.getRawArray('DEMO.REC')));
                        managers.Frames.addState(new Fade2D(managers, 0.0, this, false));
                        managers.Frames.addState(demoState);
                        managers.Frames.addState(new Fade3D(managers, 0.0, demoState, true));
                        managers.Frames.addState(new Fade2D(managers, 1.0, this, false));
                        this.frame = 0;
                        this.creditFrame.Alpha = 0.0;
                        this.updatePhysics(frameManager, frameTimeInfo);
                    }
                } else {
                    this.creditFrame.Alpha = 1.0;
                }
            }
        }

        drawFrame2D(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, frameManager: Engine.FrameManager, frameTimeInfo: Engine.FrameTimeInfo): void {
            this.background.draw();

            if (this.animFrame != null) {
                for (var i = 0; i < this.animFrame.length; i++) {
                    this.animFrame[i].draw();
                }
            }

            if (this.creditFrame != null) {
                this.creditFrame.draw();
            }

            if (this.titleProgress > 0.0) {
                this.titleLeft.draw();
                if (this.titleProgress < 1.0) {
                    this.titleRight.draw();
                }
            }

            this.introText.draw();
        }
    }
} 