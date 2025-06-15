import Phaser from 'phaser';
import { ReflexGameScene } from './ReflexGameScene';
import { LoadingScene } from './LoadingScene';

export const gameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
        min: {
            width: 375,
            height: 667
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    backgroundColor: '#232526',
    scene: [LoadingScene, ReflexGameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    pixelArt: false,
    roundPixels: true,
    antialias: true,
    transparent: false
};