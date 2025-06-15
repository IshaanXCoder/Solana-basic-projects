import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../game/config';
import { SolanaWalletProvider } from './WalletProvider';
import { WalletButton } from './WalletButton';

const GameComponent = () => {
    const gameRef = useRef(null);
    const [game, setGame] = useState(null);
    const [error, setError] = useState(null);

    const handleWalletConnect = (address) => {
        try {
            if (game && game.scene.scenes[1]) {
                game.scene.scenes[1].setWalletAddress(address);
            }
        } catch (err) {
            console.error('Error setting wallet address:', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (gameRef.current) {
            try {
                const newGame = new Phaser.Game({
                    ...gameConfig,
                    parent: gameRef.current,
                    scale: {
                        mode: Phaser.Scale.RESIZE,
                        autoCenter: Phaser.Scale.CENTER_BOTH,
                        width: window.innerWidth,
                        height: window.innerHeight
                    }
                });
                setGame(newGame);

                return () => {
                    try {
                        newGame.destroy(true);
                    } catch (err) {
                        console.error('Error destroying game:', err);
                    }
                };
            } catch (err) {
                console.error('Error creating game:', err);
                setError(err.message);
            }
        }
    }, []);

    if (error) {
        return (
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '20px',
                background: 'rgba(35, 37, 38, 0.95)',
                borderRadius: '8px',
                color: '#ff4545',
                fontFamily: 'Orbitron, Arial, sans-serif',
                fontSize: '16px',
                border: '1px solid #ff4545',
                zIndex: 10000
            }}>
                Error: {error}
            </div>
        );
    }

    return (
        <>
            <WalletButton onWalletConnect={handleWalletConnect} />
            <div 
                ref={gameRef}
                className="game-container"
            />
        </>
    );
};

export const ReflexGame = () => (
    <SolanaWalletProvider>
        <GameComponent />
    </SolanaWalletProvider>
);