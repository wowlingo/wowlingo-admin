import React from 'react';
import { Button, Space } from 'antd';
import { SoundOutlined } from '@ant-design/icons';

interface AudioPlayerProps {
  urlNormal: string;
  urlSlow: string;
  size?: 'small' | 'middle' | 'large';
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ urlNormal, urlSlow, size = 'small' }) => {
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  };

  return (
    <Space size="small">
      <Button
        size={size}
        icon={<SoundOutlined />}
        onClick={() => playAudio(urlNormal)}
        title="일반 속도로 재생"
      >
        일반
      </Button>
      <Button
        size={size}
        icon={<SoundOutlined />}
        onClick={() => playAudio(urlSlow)}
        title="느린 속도로 재생"
      >
        느리게
      </Button>
    </Space>
  );
};

export default AudioPlayer;