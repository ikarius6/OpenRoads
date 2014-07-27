﻿module VR {
    export interface VRProvider {
        enable(): boolean;
        getTargetResolution(): TSM.vec2;
        getTargetFboId(gl: WebGLRenderingContext): number;
        getHeadCameraState(eyeNum: number): Engine.CameraState;
        getEyeViewport(eyeNum: number): TSM.vec4;
        isVRSafetyWarningVisible(): boolean;

        startEye(eyeNum: number): void;
        endEye(eyeNum: number): void;

        resetOrientation(): void;

        exit(): void;
    }
} 