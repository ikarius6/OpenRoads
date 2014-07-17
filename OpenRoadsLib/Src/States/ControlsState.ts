﻿module States {
    export class ControlsMenu extends Engine.State2D implements Engine.GameState {
        private myManagers: Managers.ManagerSet;
        private menu: Drawing.Sprite[];
        private watchers: Engine.KeyWatcher[] = [];

        constructor(managers: Managers.ManagerSet) {
            super(managers);
            this.myManagers = managers;
        }

        load(gl: WebGLRenderingContext): void {
            super.load(gl);
            var managers = this.myManagers;            
            this.menu = managers.Textures.getTextures(gl, "SETMENU.LZS").map((tf) => new Drawing.Sprite(gl, managers, tf));
            this.watchers.push(new Engine.KeyWatcher(managers.Keyboard, 37, () => this.updateMenu(false)));
            this.watchers.push(new Engine.KeyWatcher(managers.Keyboard, 39, () => this.updateMenu(true)));
            this.watchers.push(new Engine.KeyWatcher(managers.Keyboard, 27, () => this.exitMenu()));
            this.myManagers.Player.loadSong(1);
        }

        unload(): void {
        }

        private updateMenu(mute: boolean) {
            this.myManagers.Settings.setMuted(mute);
        }

        private exitMenu(): void {
            this.myManagers.Frames.popState();
        }

        updatePhysics(frameManager: Engine.FrameManager, frameTimeInfo: Engine.FrameTimeInfo): void {
            var kbd = this.myManagers.Keyboard;
            for (var i = 0; i < this.watchers.length; i++) {
                this.watchers[i].update(frameTimeInfo);
            }
        }

        drawFrame2D(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, frameManager: Engine.FrameManager, frameTimeInfo: Engine.FrameTimeInfo): void {
            this.menu[0].draw();
            this.menu[this.myManagers.Settings.getMuted() ? 5 : 4].draw();
        }
    }
}  