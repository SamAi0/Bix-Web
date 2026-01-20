import React, { useState, useEffect, useRef } from 'react';
import '../css/FuturisticCAPTCHA.css';

const FuturisticCAPTCHA = ({ onSuccess, onFailure }) => {
  const [characters, setCharacters] = useState([]);
  const [selectedChars, setSelectedChars] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const containerRef = useRef(null);

  // Generate random characters with positions
  useEffect(() => {
    const generateCharacters = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const newCharacters = [];
      
      for (let i = 0; i < 8; i++) {
        newCharacters.push({
          id: i,
          char: chars[Math.floor(Math.random() * chars.length)],
          x: Math.random() * 80 + 10, // 10-90% of container width
          y: Math.random() * 70 + 15, // 15-85% of container height
          rotation: Math.random() * 360,
          size: Math.random() * 10 + 20, // 20-30px
          speed: Math.random() * 2 + 1, // 1-3
          direction: Math.random() * 360
        });
      }
      
      setCharacters(newCharacters);
    };

    generateCharacters();
    const interval = setInterval(generateCharacters, 15000); // Regenerate every 15s
    return () => clearInterval(interval);
  }, []);

  // Animate floating characters
  useEffect(() => {
    const animate = () => {
      setCharacters(prevChars => 
        prevChars.map(char => ({
          ...char,
          x: (char.x + Math.cos(char.direction * Math.PI / 180) * char.speed * 0.1) % 100,
          y: (char.y + Math.sin(char.direction * Math.PI / 180) * char.speed * 0.1) % 100,
          rotation: (char.rotation + char.speed * 0.5) % 360
        }))
      );
    };

    const animationInterval = setInterval(animate, 50);
    return () => clearInterval(animationInterval);
  }, []);

  // Handle character selection
  const handleCharacterClick = (charId) => {
    setSelectedChars(prev => {
      if (prev.includes(charId)) {
        return prev.filter(id => id !== charId);
      } else if (prev.length < 4) {
        return [...prev, charId];
      }
      return prev;
    });
  };

  // Verify CAPTCHA
  const verifyCAPTCHA = async () => {
    setIsVerifying(true);
    setGlowIntensity(1);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple validation - check if exactly 4 characters selected
    if (selectedChars.length === 4) {
      onSuccess && onSuccess();
    } else {
      onFailure && onFailure();
      setSelectedChars([]);
    }
    
    setIsVerifying(false);
    setGlowIntensity(0);
  };

  // Reset CAPTCHA
  const resetCAPTCHA = () => {
    setSelectedChars([]);
  };

  return (
    <div className="futuristic-captcha-container" ref={containerRef}>
      <div 
        className="captcha-grid"
        style={{ 
          boxShadow: `0 0 ${20 + glowIntensity * 30}px rgba(0, 255, 255, ${0.3 + glowIntensity * 0.4})`,
          border: `1px solid rgba(0, 255, 255, ${0.4 + glowIntensity * 0.3})`
        }}
      >
        {/* Floating Characters */}
        {characters.map((char) => (
          <div
            key={char.id}
            className={`floating-character ${selectedChars.includes(char.id) ? 'selected' : ''}`}
            style={{
              left: `${char.x}%`,
              top: `${char.y}%`,
              transform: `rotate(${char.rotation}deg) scale(${selectedChars.includes(char.id) ? 1.3 : 1})`,
              fontSize: `${char.size}px`,
              transition: 'all 0.3s ease'
            }}
            onClick={() => !isVerifying && handleCharacterClick(char.id)}
          >
            {char.char}
          </div>
        ))}

        {/* Selection Indicator */}
        <div className="selection-indicator">
          Selected: {selectedChars.length}/4
        </div>

        {/* Action Buttons */}
        <div className="captcha-actions">
          <button 
            className={`action-btn verify-btn ${isVerifying ? 'verifying' : ''}`}
            onClick={verifyCAPTCHA}
            disabled={selectedChars.length !== 4 || isVerifying}
            style={{
              boxShadow: `0 0 ${10 + glowIntensity * 20}px rgba(0, 255, 150, ${0.5 + glowIntensity * 0.3})`
            }}
          >
            {isVerifying ? (
              <span className="verifying-animation">VERIFYING...</span>
            ) : (
              'VERIFY'
            )}
          </button>
          
          <button 
            className="action-btn reset-btn"
            onClick={resetCAPTCHA}
            disabled={isVerifying}
          >
            RESET
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="captcha-instructions">
        <p>Select exactly 4 characters to verify you're human</p>
      </div>

      {/* Ambient Particles */}
      <div className="ambient-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3 + Math.random() * 0.4
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FuturisticCAPTCHA;