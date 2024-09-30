import React, { useState } from 'react';
import { EyeOff, Eye, Copy } from 'lucide-react';

const RoomCodeDisplay = ({ roomCode }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const toggleReveal = () => setIsRevealed(!isRevealed);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode);
    alert('Room code copied to clipboard!');
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded">
      <span className="font-mono">
        {isRevealed ? roomCode : '******'}
      </span>
      <button onClick={toggleReveal} className="p-1 hover:bg-gray-200 rounded">
        {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      <button onClick={copyToClipboard} className="p-1 hover:bg-gray-200 rounded">
        <Copy size={16} />
      </button>
    </div>
  );
};

export default RoomCodeDisplay;