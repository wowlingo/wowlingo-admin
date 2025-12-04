import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, Button, Space, Tag, message, Divider } from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { UnitSelectorModal } from './index';
import { questItemAPI, questAPI } from '../services/api';
import type {
  QuestItem,
  QuestItemType,
  CreateQuestItemPayload,
  UpdateQuestItemPayload,
  QuestUnit,
  Quest,
} from '../types';

interface QuestItemFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialData?: QuestItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const QuestItemFormModal: React.FC<QuestItemFormModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);

  // Unit selector modals
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [currentUnitField, setCurrentUnitField] = useState<'question1' | 'question2' | 'answer1' | 'answer2' | null>(null);

  // Selected units (for display)
  const [selectedUnits, setSelectedUnits] = useState<{
    question1?: QuestUnit;
    question2?: QuestUnit;
    answer1?: QuestUnit;
    answer2?: QuestUnit;
  }>({});

  // Current form type
  const [currentType, setCurrentType] = useState<QuestItemType>('choice');

  useEffect(() => {
    if (visible) {
      loadQuests();
      if (mode === 'edit' && initialData) {
        setCurrentType(initialData.type);
        form.setFieldsValue({
          questId: initialData.questId,
          type: initialData.type,
          answerOx: initialData.answerOx,
          answerSq: initialData.answerSq,
          remark: initialData.remark,
        });

        // Set selected units (IDs only, we'll display from initialData)
        const units: any = {};
        if (initialData.questUnit1) units.question1 = initialData.questUnit1;
        if (initialData.questUnit2) units.question2 = initialData.questUnit2;
        if (initialData.answerUnit1) units.answer1 = initialData.answerUnit1;
        if (initialData.answerUnit2) units.answer2 = initialData.answerUnit2;
        setSelectedUnits(units);
      } else {
        form.resetFields();
        setSelectedUnits({});
        setCurrentType('choice');
      }
    }
  }, [visible, mode, initialData, form]);

  const loadQuests = async () => {
    try {
      const data = await questAPI.getAll();
      setQuests(data);
    } catch (error) {
      message.error('Quest 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleTypeChange = (type: QuestItemType) => {
    setCurrentType(type);
    // Clear irrelevant fields when type changes
    if (type === 'choice') {
      form.setFieldsValue({ answerOx: undefined, answerSq: undefined });
      setSelectedUnits(prev => ({ ...prev, question2: undefined }));
    } else if (type === 'statement-question') {
      form.setFieldsValue({ answerOx: undefined });
      setSelectedUnits(prev => ({ ...prev, answer1: undefined, answer2: undefined }));
    } else if (type === 'same-different') {
      form.setFieldsValue({ answerSq: undefined });
      setSelectedUnits(prev => ({ ...prev, answer1: undefined, answer2: undefined }));
    }
  };

  const openUnitSelector = (field: 'question1' | 'question2' | 'answer1' | 'answer2') => {
    setCurrentUnitField(field);
    setUnitModalVisible(true);
  };

  const handleUnitSelect = (unit: QuestUnit) => {
    if (currentUnitField) {
      setSelectedUnits(prev => ({
        ...prev,
        [currentUnitField]: unit,
      }));
    }
  };

  const removeUnit = (field: 'question1' | 'question2' | 'answer1' | 'answer2') => {
    setSelectedUnits(prev => {
      const newUnits = { ...prev };
      delete newUnits[field];
      return newUnits;
    });
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      const values = form.getFieldsValue();

      if (currentType === 'choice') {
        if (!selectedUnits.question1) {
          message.error('Question 1을 선택해주세요.');
          return;
        }
        if (!selectedUnits.answer1 || !selectedUnits.answer2) {
          message.error('Answer 1과 Answer 2를 모두 선택해주세요.');
          return;
        }
      } else if (currentType === 'statement-question') {
        if (!selectedUnits.question1) {
          message.error('Question 1을 선택해주세요.');
          return;
        }
        if (!values.answerSq) {
          message.error('정답을 선택해주세요.');
          return;
        }
      } else if (currentType === 'same-different') {
        if (!selectedUnits.question1 || !selectedUnits.question2) {
          message.error('Question 1과 Question 2를 모두 선택해주세요.');
          return;
        }
        if (!values.answerOx) {
          message.error('정답을 선택해주세요.');
          return;
        }
      }

      setLoading(true);

      if (mode === 'create') {
        const payload: CreateQuestItemPayload = {
          questId: values.questId,
          type: currentType,
          question1: selectedUnits.question1!.questItemUnitId,
          question2: selectedUnits.question2?.questItemUnitId,
          answer1: selectedUnits.answer1?.questItemUnitId,
          answer2: selectedUnits.answer2?.questItemUnitId,
          answerOx: values.answerOx,
          answerSq: values.answerSq,
          remark: values.remark?.trim() || undefined,
        };
        await questItemAPI.create(payload);
        message.success('Quest Item이 성공적으로 생성되었습니다!');
      } else if (mode === 'edit' && initialData) {
        const payload: UpdateQuestItemPayload = {
          questId: values.questId,
          type: currentType,
          question1: selectedUnits.question1?.questItemUnitId,
          question2: selectedUnits.question2?.questItemUnitId,
          answer1: selectedUnits.answer1?.questItemUnitId,
          answer2: selectedUnits.answer2?.questItemUnitId,
          answerOx: values.answerOx,
          answerSq: values.answerSq,
          remark: values.remark?.trim() || undefined,
        };
        await questItemAPI.update(initialData.questItemId, payload);
        message.success('Quest Item이 성공적으로 수정되었습니다!');
      }

      form.resetFields();
      setSelectedUnits({});
      onSuccess();
      onClose();
    } catch (error) {
      message.error('저장 실패: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedUnits({});
    onClose();
  };

  const renderUnitField = (
    label: string,
    field: 'question1' | 'question2' | 'answer1' | 'answer2',
    required: boolean = false
  ) => {
    const unit = selectedUnits[field];

    return (
      <Form.Item
        label={label}
        required={required}
        help={required && !unit ? `${label}을(를) 선택해주세요` : undefined}
        validateStatus={required && !unit ? 'error' : ''}
      >
        {unit ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div
              style={{
                padding: '12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                background: '#fafafa',
              }}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Tag color="blue">ID: {unit.questItemUnitId}</Tag>
                  <Tag color="green">{unit.type}</Tag>
                  <span style={{ fontSize: '16px', fontWeight: 500 }}>{unit.str}</span>
                </Space>
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => removeUnit(field)}
                >
                  제거
                </Button>
              </Space>
            </div>
          </Space>
        ) : (
          <Button
            icon={<PlusOutlined />}
            onClick={() => openUnitSelector(field)}
            block
          >
            {label} 선택
          </Button>
        )}
      </Form.Item>
    );
  };

  const getExcludeIds = (): number[] => {
    const ids: number[] = [];
    Object.values(selectedUnits).forEach(unit => {
      if (unit) ids.push(unit.questItemUnitId);
    });
    return ids;
  };

  return (
    <>
      <Modal
        title={mode === 'create' ? '새 Quest Item 생성' : 'Quest Item 수정'}
        open={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText={mode === 'create' ? '생성' : '수정'}
        cancelText="취소"
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Quest"
            name="questId"
            rules={[{ required: true, message: 'Quest를 선택해주세요' }]}
          >
            <Select
              placeholder="Quest를 선택하세요"
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {quests.map(quest => (
                <Select.Option key={quest.questId} value={quest.questId}>
                  [{quest.questId}] {quest.title} ({quest.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="타입"
            name="type"
            rules={[{ required: true, message: '타입을 선택해주세요' }]}
            initialValue="choice"
          >
            <Select
              placeholder="타입을 선택하세요"
              size="large"
              onChange={handleTypeChange}
            >
              <Select.Option value="choice">Choice (선택형)</Select.Option>
              <Select.Option value="statement-question">Statement-Question (평서문/의문문)</Select.Option>
              <Select.Option value="same-different">Same-Different (같은/다른)</Select.Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">문제 Units</Divider>

          {renderUnitField('Question 1', 'question1', true)}

          {(currentType === 'same-different') && renderUnitField('Question 2', 'question2', true)}
          {(currentType === 'choice' || currentType === 'statement-question') && renderUnitField('Question 2 (선택사항)', 'question2', false)}

          <Divider orientation="left">정답</Divider>

          {currentType === 'choice' && (
            <>
              {renderUnitField('Answer 1 (선택지)', 'answer1', true)}
              {renderUnitField('Answer 2 (선택지)', 'answer2', true)}
              <div style={{ marginTop: 8, marginBottom: 16, fontSize: '12px', color: '#999' }}>
                💡 Choice 타입: Question과 Answer의 교집합이 정답이 됩니다.
              </div>
            </>
          )}

          {currentType === 'statement-question' && (
            <Form.Item
              label="정답"
              name="answerSq"
              rules={[{ required: true, message: '정답을 선택해주세요' }]}
            >
              <Select placeholder="정답을 선택하세요" size="large">
                <Select.Option value="statement">Statement (평서문)</Select.Option>
                <Select.Option value="question">Question (의문문)</Select.Option>
              </Select>
            </Form.Item>
          )}

          {currentType === 'same-different' && (
            <Form.Item
              label="정답"
              name="answerOx"
              rules={[{ required: true, message: '정답을 선택해주세요' }]}
            >
              <Select placeholder="정답을 선택하세요" size="large">
                <Select.Option value="same">Same (같아요)</Select.Option>
                <Select.Option value="different">Different (달라요)</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Divider />

          <Form.Item label="비고" name="remark">
            <Input.TextArea
              rows={3}
              placeholder="추가 정보나 메모를 입력하세요 (선택사항)"
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Unit Selector Modal */}
      <UnitSelectorModal
        visible={unitModalVisible}
        onClose={() => {
          setUnitModalVisible(false);
          setCurrentUnitField(null);
        }}
        onSelect={handleUnitSelect}
        title={`${currentUnitField === 'question1' ? 'Question 1' :
                currentUnitField === 'question2' ? 'Question 2' :
                currentUnitField === 'answer1' ? 'Answer 1' : 'Answer 2'} 선택`}
        excludeIds={getExcludeIds()}
      />
    </>
  );
};

export default QuestItemFormModal;