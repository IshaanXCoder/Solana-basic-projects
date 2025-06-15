import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontFamily: 'Orbitron',
            fontSize: '20px',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        // Progress text
        const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
            fontFamily: 'Orbitron',
            fontSize: '18px',
            fill: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);

        // Update progress bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x9945FF, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 20, (width / 2 - 20) * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });
        
        // Clean up on complete
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            this.startGame();
        });

        // Load the Solana logo
        this.load.svg('solanaLogo', '/solanaLogo.svg');
    }

    startGame() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Create container for all elements
        const container = this.add.container(0, 0);

        // Add "gm!" text
        const gmText = this.add.text(centerX, centerY - 100, 'gm!', {
            fontSize: '64px',
            fontFamily: 'Orbitron',
            color: '#9945FF',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        container.add(gmText);

        // Add "Check out your reflexes" text
        const reflexText = this.add.text(centerX, centerY, 'Check out your reflexes.', {
            fontSize: '32px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(reflexText);

        // Add "Built on" text
        const builtText = this.add.text(centerX, centerY + 80, 'Built on', {
            fontSize: '24px',
            fontFamily: 'Orbitron',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(builtText);

        // Add Solana logo
        const logo = this.add.image(centerX, centerY + 140, 'solanaLogo');
        logo.setScale(0.3);
        container.add(logo);

        // Set initial alpha to 0
        container.setAlpha(0);

        // Fade in animation
        this.tweens.add({
            targets: container,
            alpha: 1,
            duration: 750,
            ease: 'Power2',
            onComplete: () => {
                // After fade in, wait a bit then fade out
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: container,
                        alpha: 0,
                        duration: 750,
                        ease: 'Power2',
                        onComplete: () => {
                            // Start the main game scene
                            this.scene.start('ReflexGameScene');
                        }
                    });
                });
            }
        });
    }
} 