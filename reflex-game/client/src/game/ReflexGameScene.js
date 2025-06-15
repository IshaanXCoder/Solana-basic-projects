import Phaser from 'phaser';

export class ReflexGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReflexGameScene' });
        this.score = 0;
        this.gameTime = 15;
        this.dots = [];
        this.isGameActive = false;
        this.isPaused = false;
        this.dotLifetime = 750; // 0.75 seconds in milliseconds
        this.walletAddress = null;
        this.nextDotTime = 0;
        this.dotInterval = 1000; // Time between dots in milliseconds
    }

    setWalletAddress(address) {
        this.walletAddress = address;
        if (this.walletText) {
            this.walletText.destroy();
        }
        // Create wallet text if game is running
        if (this.scene.isActive()) {
            this.createWalletText();
        }
    }

    createWalletText() {
        if (this.walletAddress) {
            const truncatedAddress = `${this.walletAddress.slice(0, 4)}...${this.walletAddress.slice(-4)}`;
            this.walletText = this.add.text(
                this.cameras.main.width - 20,
                20,
                truncatedAddress,
                {
                    fontSize: '16px',
                    fontFamily: 'Orbitron, Arial, sans-serif',
                    color: '#9945FF',
                    backgroundColor: '#232526',
                    padding: { x: 10, y: 5 },
                }
            )
            .setOrigin(1, 0)
            .setScrollFactor(0)
            .setDepth(1000);
        }
    }

    create() {
        // Set black background
        this.cameras.main.setBackgroundColor('#000000');
        
        // Calculate UI positions based on screen size
        this.calculateUIPositions();
        
        // Create UI elements
        this.createUI();
        
        // Create wallet text if address exists
        this.createWalletText();
        
        // Handle window resize
        this.scale.on('resize', this.resize, this);
    }

    calculateUIPositions() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const spacing = 180;
        this.uiPositions = {
            score: { x: 20, y: 20 },
            timer: { x: 20, y: 70 },
            buttons: {
                start: { x: width / 2 - spacing * 1.5, y: height - 80 },
                pause: { x: width / 2 - spacing / 2, y: height - 80 },
                stop: { x: width / 2 + spacing / 2, y: height - 80 },
                restart: { x: width / 2 + spacing * 1.5, y: height - 80 }
            }
        };
    }

    createUI() {
        // Create score text
        this.scoreText = this.add.text(
            this.uiPositions.score.x,
            this.uiPositions.score.y,
            'Score: 0',
            {
                fontSize: '36px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );

        // Create timer text
        this.timerText = this.add.text(
            this.uiPositions.timer.x,
            this.uiPositions.timer.y,
            'Time: 15',
            {
                fontSize: '36px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }
        );

        this.createControlButtons();
    }

    createControlButtons() {
        const buttonStyle = {
            fontSize: '28px',
            fontFamily: 'Orbitron, Arial, sans-serif',
            color: '#9945FF',
            backgroundColor: '#232526',
            padding: { x: 30, y: 15 },
            fixedWidth: 150,
            align: 'center',
            borderRadius: 16,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: '#232526',
                blur: 8,
                stroke: true,
                fill: true
            }
        };
        const buttonHoverStyle = {
            backgroundColor: '#414345',
            color: '#fff',
        };
        // Start Button
        this.startButton = this.add.text(
            this.uiPositions.buttons.start.x,
            this.uiPositions.buttons.start.y,
            'Start',
            buttonStyle
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.startButton.setStyle(buttonHoverStyle))
        .on('pointerout', () => this.startButton.setStyle(buttonStyle))
        .on('pointerdown', () => {
            if (!this.isGameActive) {
                this.startGame();
            }
        });
        // Pause Button
        this.pauseButton = this.add.text(
            this.uiPositions.buttons.pause.x,
            this.uiPositions.buttons.pause.y,
            'Pause',
            buttonStyle
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.pauseButton.setStyle(buttonHoverStyle))
        .on('pointerout', () => this.pauseButton.setStyle(buttonStyle))
        .on('pointerdown', () => {
            if (this.isGameActive && !this.isPaused) {
                this.pauseGame();
            } else if (this.isGameActive && this.isPaused) {
                this.resumeGame();
            }
        });
        // Stop Button
        this.stopButton = this.add.text(
            this.uiPositions.buttons.stop.x,
            this.uiPositions.buttons.stop.y,
            'Stop',
            buttonStyle
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.stopButton.setStyle(buttonHoverStyle))
        .on('pointerout', () => this.stopButton.setStyle(buttonStyle))
        .on('pointerdown', () => {
            if (this.isGameActive) {
                this.stopGame();
            }
        });
        // Restart Button
        this.restartButton = this.add.text(
            this.uiPositions.buttons.restart.x,
            this.uiPositions.buttons.restart.y,
            'Restart',
            buttonStyle
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.restartButton.setStyle(buttonHoverStyle))
        .on('pointerout', () => this.restartButton.setStyle(buttonStyle))
        .on('pointerdown', () => {
            this.scene.restart();
        });
    }

    startGame() {
        if (this.isGameActive) return;
        
        // Reset game state
        this.score = 0;
        this.gameTime = 15;
        this.isGameActive = true;
        this.isPaused = false;
        this.dots.forEach(dot => dot.destroy());
        this.dots = [];
        
        // Update UI
        this.updateScore();
        this.updateGameTimer();
        
        // Start game loop
        this.nextDotTime = 0;
        
        // Start timer
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    pauseGame() {
        this.isPaused = true;
        if (this.timerEvent) this.timerEvent.paused = true;
        if (this.pauseButton) this.pauseButton.setText('Resume');
        // Optionally, show a paused overlay
        if (!this.pausedText) {
            this.pausedText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                'Paused',
                {
                    fontSize: '48px',
                    fontFamily: 'Orbitron, Arial, sans-serif',
                    color: '#00ffe7',
                    stroke: '#232526',
                    strokeThickness: 6,
                    align: 'center'
                }
            ).setOrigin(0.5);
        }
    }

    resumeGame() {
        this.isPaused = false;
        if (this.timerEvent) this.timerEvent.paused = false;
        if (this.pauseButton) this.pauseButton.setText('Pause');
        if (this.pausedText) {
            this.pausedText.destroy();
            this.pausedText = null;
        }
    }

    stopGame() {
        this.isGameActive = false;
        this.isPaused = false;
        if (this.pauseButton) this.pauseButton.setText('Pause');
        // Stop timers
        if (this.timerEvent) this.timerEvent.remove();
        // Clear all dots
        this.dots.forEach(d => {
            if (d.dot) d.dot.destroy();
            if (d.glow) d.glow.destroy();
        });
        this.dots = [];
        // Remove paused overlay if present
        if (this.pausedText) {
            this.pausedText.destroy();
            this.pausedText = null;
        }
        // Show paused message
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Game Paused',
            {
                fontSize: '48px',
                fontFamily: 'Orbitron, Arial, sans-serif',
                color: '#00ffe7',
                stroke: '#232526',
                strokeThickness: 6,
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    createDot() {
        if (!this.isGameActive || this.isPaused) return;

        const padding = 100; // Padding from edges
        const x = Phaser.Math.Between(padding, this.cameras.main.width - padding);
        const y = Phaser.Math.Between(padding, this.cameras.main.height - padding);
        
        // Create dot graphics
        const dot = this.add.graphics();
        dot.creationTime = this.time.now;
        
        // Draw dot
        dot.lineStyle(2, 0x9945FF);
        dot.fillStyle(0x232526, 1);
        dot.beginPath();
        dot.arc(0, 0, 20, 0, Math.PI * 2);
        dot.closePath();
        dot.strokePath();
        dot.fillPath();
        
        // Position dot
        dot.setPosition(x, y);
        
        // Make interactive
        dot.setInteractive(new Phaser.Geom.Circle(0, 0, 20), Phaser.Geom.Circle.Contains);
        
        // Add click handler
        dot.on('pointerdown', () => {
            if (!this.isGameActive || this.isPaused) return;
            
            this.score++;
            this.updateScore();
            this.createClickEffect(dot.x, dot.y);
            
            // Remove from dots array and destroy
            const index = this.dots.indexOf(dot);
            if (index > -1) {
                this.dots.splice(index, 1);
            }
            dot.destroy();
        });
        
        // Add to dots array
        this.dots.push(dot);
    }

    createClickEffect(x, y) {
        const effect = this.add.graphics();
        effect.lineStyle(2, 0x9945FF);
        effect.beginPath();
        effect.arc(x, y, 20, 0, Math.PI * 2);
        effect.closePath();
        effect.strokePath();

        this.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => effect.destroy()
        });
    }

    createFadeEffect(x, y) {
        const effect = this.add.graphics();
        effect.lineStyle(2, 0xff4545);
        effect.beginPath();
        effect.arc(x, y, 20, 0, Math.PI * 2);
        effect.closePath();
        effect.strokePath();

        this.tweens.add({
            targets: effect,
            alpha: 0,
            duration: 200,
            onComplete: () => effect.destroy()
        });
    }

    updateScore() {
        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.score}`);
        }
    }

    updateGameTimer() {
        if (this.gameTime <= 0) {
            this.endGame();
        }
    }

    updateTimer() {
        if (!this.isGameActive || this.isPaused) return;
        
        this.gameTime--;
        if (this.timerText) {
            this.timerText.setText(`Time: ${this.gameTime}`);
        }
        
        if (this.gameTime <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.isGameActive = false;
        if (this.timerEvent) this.timerEvent.remove();
        
        // Clear all dots
        this.dots.forEach(dot => dot.destroy());
        this.dots = [];
        
        // Show final score
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        const finalScore = this.add.text(centerX, centerY, `Final Score: ${this.score}`, {
            fontSize: '48px',
            fontFamily: 'Orbitron',
            color: '#9945FF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Auto-remove after 3 seconds
        this.time.delayedCall(3000, () => {
            finalScore.destroy();
        });
    }

    resize() {
        this.calculateUIPositions();
        
        // Update UI positions
        if (this.scoreText) {
            this.scoreText.setPosition(this.uiPositions.score.x, this.uiPositions.score.y);
        }
        if (this.timerText) {
            this.timerText.setPosition(this.uiPositions.timer.x, this.uiPositions.timer.y);
        }
        if (this.startButton) {
            this.startButton.setPosition(this.uiPositions.buttons.start.x, this.uiPositions.buttons.start.y);
        }
        if (this.pauseButton) {
            this.pauseButton.setPosition(this.uiPositions.buttons.pause.x, this.uiPositions.buttons.pause.y);
        }
        if (this.stopButton) {
            this.stopButton.setPosition(this.uiPositions.buttons.stop.x, this.uiPositions.buttons.stop.y);
        }
        if (this.restartButton) {
            this.restartButton.setPosition(this.uiPositions.buttons.restart.x, this.uiPositions.buttons.restart.y);
        }
        if (this.walletText) {
            this.walletText.setPosition(this.cameras.main.width - 20, 20);
        }
    }

    update(time) {
        if (!this.isGameActive || this.isPaused) return;

        // Create new dot if it's time
        if (time > this.nextDotTime) {
            this.createDot();
            this.nextDotTime = time + this.dotInterval;
        }

        // Update existing dots
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            const elapsedTime = time - dot.creationTime;
            
            if (elapsedTime >= this.dotLifetime) {
                dot.destroy();
                this.dots.splice(i, 1);
                // this.score = Math.max(0, this.score - 1);
                this.updateScore();
                this.createFadeEffect(dot.x, dot.y);
            }
        }
    }
}