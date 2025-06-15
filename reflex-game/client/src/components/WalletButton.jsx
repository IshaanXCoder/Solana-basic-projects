import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export const WalletButton = ({ onWalletConnect }) => {
    const { connected, publicKey, connecting } = useWallet();
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            if (connected && publicKey) {
                onWalletConnect(publicKey.toString());
            }
        } catch (err) {
            console.error('Wallet connection error:', err);
            setError(err.message);
        }
    }, [connected, publicKey, onWalletConnect]);

    // Show loading state
    if (connecting) {
        return (
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                background: 'rgba(35, 37, 38, 0.95)',
                borderRadius: '8px',
                color: '#9945FF',
                fontFamily: 'Orbitron, Arial, sans-serif',
                fontSize: '14px',
                border: '1px solid #9945FF',
                zIndex: 10000
            }}>
                Connecting...
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                background: 'rgba(35, 37, 38, 0.95)',
                borderRadius: '8px',
                color: '#ff4545',
                fontFamily: 'Orbitron, Arial, sans-serif',
                fontSize: '14px',
                border: '1px solid #ff4545',
                zIndex: 10000
            }}>
                Error: {error}
            </div>
        );
    }

    if (!connected) {
        return (
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 10000
            }}>
                <WalletMultiButton />
            </div>
        );
    }

    // Truncate the wallet address
    const truncatedAddress = publicKey ? 
        `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}` : '';

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            background: 'rgba(35, 37, 38, 0.95)',
            borderRadius: '8px',
            color: '#9945FF',
            fontFamily: 'Orbitron, Arial, sans-serif',
            fontSize: '14px',
            border: '1px solid #9945FF',
            zIndex: 10000
        }}>
            {truncatedAddress}
        </div>
    );
}; 