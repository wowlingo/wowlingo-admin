import React, { useEffect, useState } from 'react';
import { Select, message, Spin } from 'antd';
import { hashtagAPI } from '../services/api';
import { Hashtag } from '../types';

interface HashtagSelectorProps {
  value?: number[];
  onChange?: (hashtagIds: number[]) => void;
  placeholder?: string;
}

const HashtagSelector: React.FC<HashtagSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Hashtag를 선택하세요',
}) => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHashtags();
  }, []);

  const loadHashtags = async () => {
    setLoading(true);
    try {
      const data = await hashtagAPI.getAll();
      setHashtags(data);
    } catch (error) {
      message.error('Hashtag 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      mode="multiple"
      style={{ width: '100%' }}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      loading={loading}
      notFoundContent={loading ? <Spin size="small" /> : '데이터가 없습니다'}
      optionFilterProp="children"
      filterOption={(input, option) =>
        ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
      }
      options={hashtags.map(tag => ({
        value: tag.hashtagId,
        label: `${tag.name} (${tag.code})`,
      }))}
    />
  );
};

export default HashtagSelector;