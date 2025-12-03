import React, { useState, useRef } from 'react';
import { Upload, message, Button, Space, Card } from 'antd';
import {
  InboxOutlined,
  DeleteOutlined,
  SoundOutlined,
  UploadOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { uploadAPI } from '../services/api';

const { Dragger } = Upload;

interface AudioUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  label: string;
  mode?: 'dragger' | 'button';
}

const AudioUploader: React.FC<AudioUploaderProps> = ({
  value,
  onChange,
  label,
  mode = 'dragger'
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | undefined>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    const isAudio = file.type.startsWith('audio/');
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.webm'];
    const hasAudioExtension = audioExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isAudio && !hasAudioExtension) {
      message.error('오디오 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadAPI.uploadAudio(file);
      setFileUrl(url);
      onChange?.(url);
      message.success(`${file.name} 업로드 성공!`);
    } catch (error) {
      message.error('파일 업로드 실패: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'audio/*,.mp3,.wav,.ogg,.webm',
    showUploadList: false,
    beforeUpload: (file) => {
      handleFileSelect(file);
      return false;
    },
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = '';
  };

  const handleDelete = () => {
    setFileUrl(undefined);
    onChange?.('');
    message.info('파일이 제거되었습니다.');
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const playAudio = () => {
    if (fileUrl) {
      const audio = new Audio(fileUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        message.error('오디오 재생 실패');
      });
    }
  };

  if (mode === 'button') {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.webm"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        {!fileUrl ? (
          <Button
            icon={<UploadOutlined />}
            onClick={handleButtonClick}
            loading={uploading}
            block
          >
            {label}
          </Button>
        ) : (
          <Card
            size="small"
            style={{
              background: '#f0f5ff',
              borderColor: '#d6e4ff'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div>
                <strong style={{ color: '#1890ff' }}>{label}</strong>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                wordBreak: 'break-all'
              }}>
                {fileUrl}
              </div>
              <Space>
                <Button
                  size="small"
                  icon={<SoundOutlined />}
                  onClick={playAudio}
                >
                  재생
                </Button>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={handleReplace}
                  loading={uploading}
                >
                  변경
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  삭제
                </Button>
              </Space>
            </Space>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      {!fileUrl ? (
        <Dragger {...uploadProps} disabled={uploading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{label}</p>
          <p className="ant-upload-hint">
            클릭하거나 파일을 드래그하여 업로드하세요
          </p>
          <p className="ant-upload-hint" style={{ fontSize: '12px', color: '#999' }}>
            최대 10MB, mp3/wav/ogg/webm
          </p>
        </Dragger>
      ) : (
        <Card
          size="small"
          style={{
            background: '#f6ffed',
            borderColor: '#b7eb8f'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div>
              <strong style={{ color: '#52c41a' }}>✓ {label}</strong>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#666',
              wordBreak: 'break-all'
            }}>
              {fileUrl}
            </div>
            <Space>
              <Button
                size="small"
                icon={<SoundOutlined />}
                onClick={playAudio}
              >
                재생
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                삭제
              </Button>
            </Space>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default AudioUploader;