import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Table, Input, Space, Tag, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AudioPlayer } from './index';
import { questUnitAPI } from '../services/api';
import type { QuestUnit } from '../types';

interface UnitSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (unit: QuestUnit) => void;
  title?: string;
  excludeIds?: number[];
}

const { Search } = Input;

const UnitSelectorModal: React.FC<UnitSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  title = 'Quest Unit 선택',
  excludeIds = [],
}) => {
  const [units, setUnits] = useState<QuestUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (visible) {
      loadUnits();
    }
  }, [visible]);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const data = await questUnitAPI.getAll();
      setUnits(data);
    } catch (error) {
      messageApi.error('Unit 목록을 불러오는데 실패했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      if (excludeIds.includes(unit.questItemUnitId)) {
        return false;
      }

      if (searchText) {
        const searchLower = searchText.toLowerCase();
        return (
          unit.str.toLowerCase().includes(searchLower) ||
          unit.questItemUnitId.toString().includes(searchLower) ||
          unit.type.toLowerCase().includes(searchLower) ||
          unit.hashtags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [units, searchText, excludeIds]);

  const handleSelect = (unit: QuestUnit) => {
    onSelect(unit);
    onClose();
    setSearchText('');
  };

  const columns: ColumnsType<QuestUnit> = [
    {
      title: 'ID',
      dataIndex: 'questItemUnitId',
      key: 'questItemUnitId',
      width: 70,
      sorter: (a, b) => a.questItemUnitId - b.questItemUnitId,
    },
    {
      title: '텍스트',
      dataIndex: 'str',
      key: 'str',
      width: 200,
      render: (text: string) => (
        <div style={{ fontSize: '16px', fontWeight: 500 }}>{text}</div>
      ),
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '해시태그',
      dataIndex: 'hashtags',
      key: 'hashtags',
      width: 200,
      render: (hashtags: string[]) => (
        <Space size={[0, 4]} wrap>
          {hashtags.map((tag, index) => (
            <Tag key={index} color="geekblue">
              #{tag}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '오디오',
      key: 'audio',
      width: 180,
      render: (_: any, record: QuestUnit) => (
        <AudioPlayer
          urlNormal={record.urlNormal}
          urlSlow={record.urlSlow}
          size="small"
        />
      ),
    },
  ];

  const handleCancel = () => {
    onClose();
    setSearchText('');
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={title}
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        destroyOnClose
      >
        {/* Search Bar */}
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="텍스트, ID, 타입, 해시태그로 검색"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => setSearchText(value)}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredUnits}
          loading={loading}
          rowKey="questItemUnitId"
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
            showSizeChanger: false,
          }}
          scroll={{ y: 400 }}
          onRow={(record) => ({
            onClick: () => handleSelect(record),
            style: { cursor: 'pointer' },
            onMouseEnter: (e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.backgroundColor = '';
            },
          })}
        />

        <div style={{ marginTop: 12, fontSize: '12px', color: '#666' }}>
          💡 행을 클릭하여 선택하세요
        </div>
      </Modal>
    </>
  );
};

export default UnitSelectorModal;