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
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { AudioPlayer } from '../components';
import QuestItemFormModal from '../components/QuestItemFormModal';
import { questItemAPI, questAPI } from '../services/api';
import type { QuestItem, Quest } from '../types';

const { Title } = Typography;
const { Search } = Input;

const ItemPage: React.FC = () => {
  const [items, setItems] = useState<QuestItem[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<QuestItem | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Filters
  const [searchText, setSearchText] = useState('');
  const [selectedQuestId, setSelectedQuestId] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadItems();
    loadQuests();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await questItemAPI.getAll();
      const dataWithKeys = data.map((item) => ({
        ...item,
        key: item.questItemId,
      }));
      setItems(dataWithKeys);
    } catch (error) {
      messageApi.error('데이터를 불러오는데 실패했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadQuests = async () => {
    try {
      const data = await questAPI.getAll();
      setQuests(data);
    } catch (error) {
      console.error('Failed to load quests:', error);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = searchText
        ? item.questItemId.toString().includes(searchText) ||
          item.type.toLowerCase().includes(searchText.toLowerCase()) ||
          (item.quest?.title || '').toLowerCase().includes(searchText.toLowerCase())
        : true;

      const matchesQuest = selectedQuestId
        ? item.questId === selectedQuestId
        : true;

      const matchesType = selectedType
        ? item.type === selectedType
        : true;

      return matchesSearch && matchesQuest && matchesType;
    });
  }, [items, searchText, selectedQuestId, selectedType]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(items.map(item => item.type)));
  }, [items]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setModalVisible(true);
  };

  const handleEdit = (item: QuestItem) => {
    setModalMode('edit');
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleDelete = (item: QuestItem) => {
    Modal.confirm({
      title: 'Quest Item 삭제',
      content: (
        <div>
          <p>정말로 이 Quest Item을 삭제하시겠습니까?</p>
          <p style={{ marginTop: 8, fontWeight: 'bold' }}>
            ID: {item.questItemId} (타입: {item.type})
          </p>
          <p style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
            이 Item이 User Quest에서 사용 중인 경우 삭제할 수 없습니다.
          </p>
        </div>
      ),
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await questItemAPI.delete(item.questItemId);
          messageApi.success('Quest Item이 삭제되었습니다.');
          loadItems();
        } catch (error) {
          messageApi.error('삭제 실패: ' + (error as Error).message);
        }
      },
    });
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedQuestId(undefined);
    setSelectedType(undefined);
  };

  const getTypeTag = (type: string) => {
    const colors: Record<string, string> = {
      'choice': 'blue',
      'statement-question': 'green',
      'same-different': 'orange',
    };
    return <Tag color={colors[type] || 'default'}>{type}</Tag>;
  };

  const getAnswerDisplay = (item: QuestItem) => {
    if (item.type === 'choice') {
      // Find correct answer (intersection of questions and answers)
      const questions = [item.question1, item.question2].filter(q => q != null);
      const answers = [item.answer1, item.answer2].filter(a => a != null);
      const correctAnswer = questions.find(q => answers.includes(q));
      return correctAnswer ? `Unit ID: ${correctAnswer}` : '-';
    } else if (item.type === 'statement-question') {
      return item.answerSq === 'statement' ? '평서문' : '의문문';
    } else if (item.type === 'same-different') {
      return item.answerOx === 'same' ? '같아요 (O)' : '달라요 (X)';
    }
    return '-';
  };

  const columns: ColumnsType<QuestItem> = [
    {
      title: 'ID',
      dataIndex: 'questItemId',
      key: 'questItemId',
      width: 50,
      sorter: (a, b) => a.questItemId - b.questItemId,
    },
    {
      title: 'Quest',
      dataIndex: ['quest', 'title'],
      key: 'quest',
      width: 120,
      ellipsis: true,
      render: (_, record) => (
        <div>
          <span style={{ fontSize: '12px', color: '#999' }}>
            ID: {record.questId}
          </span>
          <div style={{ fontWeight: 500 }}>{record.quest?.title || '-'}</div>
        </div>
      ),
    },
    {
      title: '타입',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => getTypeTag(type),
    },
    {
      title: '문제',
      key: 'questions',
      width: 300,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {record.questUnit1 && (
            <div>
              <Tag color="blue">Q1</Tag>
              <span style={{ marginLeft: 4, fontSize: '14px' }}>
                {record.questUnit1.str}
              </span>
              <span style={{ marginLeft: 4, fontSize: '12px', color: '#999' }}>
                ID: {(record.questUnit1 as any).questItemUnitId || (record.questUnit1 as any).quest_item_unit_id || record.question1}
              </span>
              <div style={{ marginTop: 4 }}>
                <AudioPlayer
                  urlNormal={record.questUnit1.urlNormal}
                  urlSlow={record.questUnit1.urlSlow}
                  size="small"
                />
              </div>
            </div>
          )}
          {record.questUnit2 && (
            <div style={{ marginTop: 8 }}>
              <Tag color="cyan">Q2</Tag>
              <span style={{ marginLeft: 4, fontSize: '14px' }}>
                {record.questUnit2.str}
              </span>
              <span style={{ marginLeft: 4, fontSize: '12px', color: '#999' }}>
                ID: {(record.questUnit2 as any).questItemUnitId || (record.questUnit2 as any).quest_item_unit_id || record.question2}
              </span>
              <div style={{ marginTop: 4 }}>
                <AudioPlayer
                  urlNormal={record.questUnit2.urlNormal}
                  urlSlow={record.questUnit2.urlSlow}
                  size="small"
                />
              </div>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: '선택지/정답',
      key: 'answer',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.type === 'choice' && (
            <>
              {record.answerUnit1 && (
                <div style={{ fontSize: '12px' }}>
                  <Tag color="green">A1</Tag>
                  <span style={{ marginLeft: 4 }}>{record.answerUnit1.str}</span>
                  <span style={{ marginLeft: 4, fontSize: '12px', color: '#999' }}>
                    ID: {(record.answerUnit1 as any).questItemUnitId || (record.answerUnit1 as any).quest_item_unit_id || record.answer1}
                  </span>
                </div>
              )}
              {record.answerUnit2 && (
                <div style={{ fontSize: '12px' }}>
                  <Tag color="green">A2</Tag>
                  <span style={{ marginLeft: 4, }}>{record.answerUnit2.str}</span>
                  <span style={{ marginLeft: 4, fontSize: '12px', color: '#999' }}>
                    ID: {(record.answerUnit2 as any).questItemUnitId || (record.answerUnit2 as any).quest_item_unit_id || record.answer2}
                  </span>
                </div>
              )}
            </>
          )}
          <div style={{ fontWeight: 500, color: '#1890ff' }}>
            정답: {getAnswerDisplay(record)}
          </div>
        </Space>
      ),
    },
    {
      title: '비고',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
      render: (remark: string) => remark || '-',
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
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

  const hasActiveFilters = searchText || selectedQuestId !== undefined || selectedType !== undefined;

  return (
    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
      {contextHolder}

      {/* Header */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>
          문제 관리 (Quest Items)
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          새 Item 생성
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }} size="small">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8}>
            <Search
              placeholder="ID, 타입, Quest 제목으로 검색"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
          </Col>
          <Col xs={24} sm={12} md={7}>
            <Select
              style={{ width: '100%' }}
              placeholder="Quest로 필터링"
              size="large"
              allowClear
              value={selectedQuestId}
              onChange={setSelectedQuestId}
              suffixIcon={<FilterOutlined />}
              showSearch
              optionFilterProp="children"
            >
              {quests.map(quest => (
                <Select.Option key={quest.questId} value={quest.questId}>
                  [{quest.questId}] {quest.title}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={7}>
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
              {selectedQuestId && (
                <Tag color="purple" closable onClose={() => setSelectedQuestId(undefined)}>
                  Quest ID: {selectedQuestId}
                </Tag>
              )}
              {selectedType && (
                <Tag color="green" closable onClose={() => setSelectedType(undefined)}>
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
        dataSource={filteredItems}
        loading={loading}
        pagination={{
          pageSize: 20,
          showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        scroll={{ x: 1400 }}
      />

      {/* Modal */}
      <QuestItemFormModal
        visible={modalVisible}
        mode={modalMode}
        initialData={selectedItem}
        onClose={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
        onSuccess={loadItems}
      />
    </div>
  );
};

export default ItemPage;