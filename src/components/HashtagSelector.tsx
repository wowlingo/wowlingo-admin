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
  placeholder = 'Hashtag를 선택하거나 직접 입력하세요',
}) => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

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

  const handleChange = async (selectedValues: number[], option: any) => {
    // 새로 추가된 값이 있는지 확인 (string 타입이면 새로 입력된 것)
    const lastValue = option[option.length - 1];

    if (lastValue && typeof lastValue.value === 'string') {
      const newName = lastValue.value;

      // 중복 체크
      const existingHashtag = hashtags.find(h => h.name === newName);
      if (existingHashtag) {
        message.warning('이미 존재하는 해시태그입니다.');
        if (onChange) {
          onChange(selectedValues.filter(v => v !== newName as any));
        }
        return;
      }

      setCreating(true);
      try {
        // code 생성 (code1, code2, code3, ...)
        const code = hashtagAPI.generateNextCode(hashtags);

        // 백엔드에 새 해시태그 생성
        const newHashtag = await hashtagAPI.create({ code, name: newName });

        // 해시태그 목록 업데이트
        setHashtags(prev => [...prev, newHashtag]);

        // value 업데이트 (string을 생성된 ID로 교체)
        const updatedValues = selectedValues.map(v =>
          v === newName ? newHashtag.hashtagId : v
        ) as number[];

        if (onChange) {
          onChange(updatedValues);
        }

        message.success(`새 해시태그 "${newName}" (${code})가 추가되었습니다.`);
      } catch (error: any) {
        message.error('해시태그 생성 실패: ' + (error?.response?.data?.message || error.message));
        // 실패한 경우 해당 값 제거
        if (onChange) {
          onChange(selectedValues.filter(v => v !== newName as any));
        }
      } finally {
        setCreating(false);
      }
    } else {
      // 기존 해시태그만 선택한 경우
      if (onChange) {
        onChange(selectedValues);
      }
    }
  };

  return (
    <Select
      mode="tags"
      style={{ width: '100%' }}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      loading={loading || creating}
      notFoundContent={loading ? <Spin size="small" /> : null}
      optionFilterProp="label"
      filterOption={(input, option) =>
        ((option?.label ?? '') as string).toLowerCase().includes(input.toLowerCase())
      }
      options={hashtags.map(tag => ({
        value: tag.hashtagId,
        label: `${tag.name} (${tag.code})`,
      }))}
      tokenSeparators={[',']}
    />
  );
};

export default HashtagSelector;