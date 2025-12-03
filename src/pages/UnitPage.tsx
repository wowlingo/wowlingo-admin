import React, { useEffect, useState, useMemo } from 'react';
import {
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Tooltip,
  Input,
  Select,
  Row,
  Col,
  Card,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AudioPlayer } from '../components';
import QuestUnitFormModal from '../components/QuestUnitFormModal';
import { questUnitAPI, hashtagAPI } from '../services/api';
import { QuestUnit, Hashtag } from '../types';

const { Title } = Typography;
const { Search } = Input;

const UnitPage: React.FC = () => {
  const [units, setUnits] = useState<QuestUnit[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUnit, setSelectedUnit] = useState<QuestUnit | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const [searchText, setSearchText] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadUnits();
    loadHashtags();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const data = await questUnitAPI.getAll();
      const dataWithKeys = data.map((item) => ({
        ...item,
        key: item.questItemUnitId,
      }));
      setUnits(dataWithKeys);
    } catch (error) {
      messageApi.error('데이터를 불러오는데 실패했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadHashtags = async () => {
    try {
      const data = await hashtagAPI.getAll();
      setHashtags(data);
    } catch (error) {
      console.error('Failed to load hashtags:', error);
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch = searchText
        ? unit.str.toLowerCase().includes(searchText.toLowerCase()) ||
          unit.questItemUnitId.toString().includes(searchText)
        : true;

      const matchesHashtag = selectedHashtags.length > 0
        ? selectedHashtags.some(tag => unit.hashtags.includes(tag))
        : true;

      const matchesType = selectedType
        ? unit.type === selectedType
        : true;

      return matchesSearch && matchesHashtag && matchesType;
    });
  }, [units, searchText, selectedHashtags, selectedType]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(units.map(unit => unit.type)));
  }, [units]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedUnit(null);
    setModalVisible(true);
  };

  const handleEdit = (unit: QuestUnit) => {
    setModalMode('edit');
    setSelectedUnit(unit);
    setModalVisible(true);
  };

  const handleDelete = (unit: QuestUnit) => {
    Modal.confirm({
      title: 'Quest Unit 삭제',
      content: (
        <div>
          <p>정말로 이 Quest Unit을 삭제하시겠습니까?</p>
          <p style={{ marginTop: 8, fontWeight: 'bold' }}>"{unit.str}"</p>
          <p style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
            이 Unit이 Quest Item에서 사용 중인 경우 삭제할 수 없습니다.
          </p>
        </div>
      ),
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await questUnitAPI.delete(unit.questItemUnitId);
          messageApi.success('Quest Unit이 삭제되었습니다.');
          loadUnits();
        } catch (error) {
          messageApi.error('삭제 실패: ' + (error as Error).message);
        }
      },
    });
  };

  const handleShowUsedQuests = async (unit: QuestUnit) => {
    try {
      const quests = await questUnitAPI.getUsedQuests(unit.questItemUnitId);

      if (quests.length === 0) {
        Modal.info({
          title: '사용 현황',
          content: '이 Unit은 현재 어떤 Quest에서도 사용되지 않고 있습니다.',
        });
      } else {
        Modal.info({
          title: `사용 현황 (${quests.length}개 Quest)`,
          content: (
            <div>
              <p style={{ marginBottom: 12 }}>이 Unit은 다음 Quest들에서 사용되고 있습니다:</p>
              <ul>
                {quests.map(quest => (
                  <li key={quest.questId}>
                    <strong>{quest.title}</strong> (ID: {quest.questId})
                  </li>
                ))}
              </ul>
            </div>
          ),
          width: 600,
        });
      }
    } catch (error) {
      messageApi.error('사용 현황을 불러오는데 실패했습니다.');
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedHashtags([]);
    setSelectedType(undefined);
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
        <div style={{ fontSize: '16px' }}>{text}</div>
      ),
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: '해시태그',
      dataIndex: 'hashtags',
      key: 'hashtags',
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
      width: 300,
      render: (_: any, record: QuestUnit) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <AudioPlayer
            urlNormal={record.urlNormal}
            urlSlow={record.urlSlow}
          />
          <div style={{ fontSize: '9px', color: '#999', wordBreak: 'break-all' }}>
            <div>일반: {record.urlNormal}</div>
            <div>느림: {record.urlSlow}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '비고',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (remark: string) => remark || '-',
    },
    {
      title: '작업',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_: any, record: QuestUnit) => (
        <Space size="small">
          <Tooltip title="사용 현황">
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => handleShowUsedQuests(record)}
            />
          </Tooltip>
          <Tooltip title="수정">
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="삭제">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const hasActiveFilters = searchText || selectedHashtags.length > 0 || selectedType;

  return (
    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
      {contextHolder}

      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          문제 유닛 관리 (Quest Units)
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          새 Unit 생성
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }} size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8}>
            <Search
              placeholder="텍스트 또는 ID로 검색"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="해시태그로 필터링"
              size="large"
              allowClear
              value={selectedHashtags}
              onChange={setSelectedHashtags}
              maxTagCount="responsive"
              suffixIcon={<FilterOutlined />}
            >
              {hashtags.map(tag => (
                <Select.Option key={tag.hashtagId} value={tag.name}>
                  #{tag.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="타입으로 필터링"
              size="large"
              allowClear
              value={selectedType}
              onChange={setSelectedType}
              suffixIcon={<FilterOutlined />}
            >
              {uniqueTypes.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={2}>
            <Tooltip title="필터 초기화">
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                size="large"
                block
              >
                초기화
              </Button>
            </Tooltip>
          </Col>
        </Row>

        {/* Filter summary */}
        {hasActiveFilters && (
          <div style={{ marginTop: 12, fontSize: '14px', color: '#666' }}>
            <Space size="small" wrap>
              <span>필터 적용됨:</span>
              {searchText && <Tag color="blue">검색: {searchText}</Tag>}
              {selectedHashtags.map(tag => (
                <Tag key={tag} color="geekblue" closable onClose={() => {
                  setSelectedHashtags(prev => prev.filter(t => t !== tag));
                }}>
                  #{tag}
                </Tag>
              ))}
              {selectedType && (
                <Tag color="purple" closable onClose={() => setSelectedType(undefined)}>
                  타입: {selectedType}
                </Tag>
              )}
            </Space>
          </div>
        )}
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredUnits}
        loading={loading}
        pagination={{
          pageSize: 20,
          showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 1200 }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={7}>
                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  총 {filteredUnits.length}개의 Unit
                  {hasActiveFilters && ` (전체 ${units.length}개 중 필터링됨)`}
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      {/* Modal */}
      <QuestUnitFormModal
        visible={modalVisible}
        mode={modalMode}
        initialData={selectedUnit}
        onClose={() => {
          setModalVisible(false);
          setSelectedUnit(null);
        }}
        onSuccess={loadUnits}
      />
    </div>
  );
};

export default UnitPage;