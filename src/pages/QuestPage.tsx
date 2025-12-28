import React, { useEffect, useState, useMemo } from 'react';
import {
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
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
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { QuestFormModal } from '../components';
import { questAPI } from '../services/api/quests';
import { Quest } from '../types';

const { Title } = Typography;
const { Search } = Input;

const QuestTypeTag = ({ type }: { type: string }) => {
  const typeMap = {
    'same-different': { color: 'blue', text: '같아요/달라요' },
    'statement-question': { color: 'purple', text: '의문문/평서문' },
    'choice': { color: 'green', text: '1개 선택' },
  };

  const currentType = typeMap[type as keyof typeof typeMap] || { color: 'gray', text: '없음' };

  return (
    <Tag color={currentType.color}>
      {currentType.text}
    </Tag>
  );
};

const QuestPage: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    setLoading(true);
    try {
      const data = await questAPI.getAll();
      setQuests(data);
    } catch (error) {
      messageApi.error('데이터를 불러오는데 실패했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuests = useMemo(() => {
    return quests.filter((quest) => {
      const matchesSearch = searchText
        ? quest.title.toLowerCase().includes(searchText.toLowerCase()) ||
          quest.questId.toString().includes(searchText)
        : true;

      const matchesType = selectedType ? quest.type === selectedType : true;

      return matchesSearch && matchesType;
    });
  }, [quests, searchText, selectedType]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedQuest(null);
    setModalVisible(true);
  };

  const handleEdit = (quest: Quest) => {
    setModalMode('edit');
    setSelectedQuest(quest);
    setModalVisible(true);
  };

  const handleDelete = (quest: Quest) => {
    const hasItems = quest.actualItemCount && quest.actualItemCount > 0;

    Modal.confirm({
      title: 'Quest 삭제',
      content: (
        <div>
          <p>정말로 이 Quest를 삭제하시겠습니까?</p>
          <p style={{ marginTop: 8, fontWeight: 'bold' }}>"{quest.title}"</p>
          {hasItems && (
            <p style={{ marginTop: 8, fontSize: '12px', color: '#ff4d4f' }}>
              ⚠️ 이 Quest에는 {quest.actualItemCount}개의 Quest Item이 등록되어 있습니다.
              <br />
              Quest를 삭제하려면 먼저 '문제 관리'에서 모든 Quest Item을 삭제해주세요.
            </p>
          )}
          {!hasItems && (
            <p style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
              이 Quest에는 등록된 Quest Item이 없습니다.
            </p>
          )}
        </div>
      ),
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await questAPI.delete(quest.questId);
          messageApi.success('Quest가 삭제되었습니다.');
          loadQuests();
        } catch (error) {
          messageApi.error('삭제 실패: ' + (error as Error).message);
        }
      },
    });
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedType(undefined);
  };

  const columns: ColumnsType<Quest> = [
    {
      title: 'ID',
      dataIndex: 'questId',
      key: 'questId',
      width: 70,
      sorter: (a, b) => a.questId - b.questId,
    },
    {
      title: '순서',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div style={{ fontSize: '16px', fontWeight: 400 }}>{text}</div>
      ),
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (type: string) => <QuestTypeTag type={type} />,
    },
    {
      title: '문제 개수',
      key: 'questItemCount',
      width: 170,
      align: 'left',
      render: (_: any, record: Quest) => {
        const isInsufficient = !record.actualItemCount || record.actualItemCount < record.questItemCount;
        return (
          <div style={{ fontSize: '14px' }}>
            <div>출제(한 묶음당): {record.questItemCount}개</div>
            <div style={{
              marginTop: 4,
              color: isInsufficient ? '#ff4d4f' : '#52c41a',
              fontWeight: isInsufficient ? 'bold' : 'normal'
            }}>
              등록: {record.actualItemCount || 0}개
              {isInsufficient && ' ⚠️'}
            </div>
          </div>
        );
      },
    },
    {
      title: '해시태그',
      dataIndex: 'hashtags',
      key: 'hashtags',
      render: (hashtags: string[]) => (
        <Space size={[0, 4]} wrap>
          {Array.isArray(hashtags) &&
            hashtags.map((tag, index) => (
              <Tag key={index} color="geekblue">
                #{tag}
              </Tag>
            ))}
        </Space>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: any, record: Quest) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const hasActiveFilters = searchText || selectedType;

  return (
    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
      {contextHolder}

      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          학습 목록 (Quests)
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          새 Quest 생성
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }} size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12}>
            <Search
              placeholder="제목 또는 ID로 검색"
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
              style={{ width: '100%' }}
              placeholder="타입으로 필터링"
              size="large"
              allowClear
              value={selectedType}
              onChange={setSelectedType}
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="choice">Choice (선택형)</Select.Option>
              <Select.Option value="statement-question">Statement-Question (평서문/의문문)</Select.Option>
              <Select.Option value="same-different">Same-Different (같은/다른)</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              size="large"
              block
            >
              초기화
            </Button>
          </Col>
        </Row>

        {/* Filter summary */}
        {hasActiveFilters && (
          <div style={{ marginTop: 12, fontSize: '14px', color: '#666' }}>
            <Space size="small" wrap>
              <span>필터 적용됨:</span>
              {searchText && <Tag color="blue">검색: {searchText}</Tag>}
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
        dataSource={filteredQuests}
        loading={loading}
        rowKey="questId"
        pagination={{
          pageSize: 20,
          showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 1000 }}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={7}>
                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  총 {filteredQuests.length}개의 Quest
                  {hasActiveFilters && ` (전체 ${quests.length}개 중 필터링됨)`}
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />

      {/* Modal */}
      <QuestFormModal
        visible={modalVisible}
        mode={modalMode}
        initialData={selectedQuest}
        onClose={() => {
          setModalVisible(false);
          setSelectedQuest(null);
        }}
        onSuccess={loadQuests}
      />
    </div>
  );
};

export default QuestPage;
