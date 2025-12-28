import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { questAPI, CreateQuestPayload, UpdateQuestPayload } from '../services/api/quests';
import { Quest } from '../types';
import { HashtagSelector } from '.';

interface QuestFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialData?: Quest | null;
  onClose: () => void;
  onSuccess: () => void;
}

const QuestFormModal: React.FC<QuestFormModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (visible && initialData && mode === 'edit') {
      // Convert hashtag names to IDs - we'll need to fetch hashtags to get IDs
      // For now, we'll just clear the hashtag field in edit mode
      form.setFieldsValue({
        title: initialData.title,
        type: initialData.type,
        questItemCount: initialData.questItemCount,
        order: initialData.order,
        hashtagIds: [], // Will be populated once we have hashtag data
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
    }
  }, [visible, initialData, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      if (mode === 'create') {
        const payload: CreateQuestPayload = {
          title: values.title.trim(),
          type: values.type,
          questItemCount: values.questItemCount,
          order: values.order,
          hashtagIds: values.hashtagIds || [],
        };
        const createdQuest = await questAPI.create(payload);
        message.success(
          `Quest가 성공적으로 생성되었습니다! 이제 '문제 관리' 메뉴에서 이 Quest(ID: ${createdQuest.questId})에 대한 문제를 등록할 수 있습니다.`,
          6
        );
      } else if (mode === 'edit' && initialData) {
        const payload: UpdateQuestPayload = {
          title: values.title.trim(),
          type: values.type,
          questItemCount: values.questItemCount,
          order: values.order,
          hashtagIds: values.hashtagIds || [],
        };
        await questAPI.update(initialData.questId, payload);
        message.success('Quest가 성공적으로 수정되었습니다!');
      }

      form.resetFields();
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
    onClose();
  };

  return (
    <Modal
      title={mode === 'create' ? '새 Quest 생성' : 'Quest 수정'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={mode === 'create' ? '생성' : '수정'}
      cancelText="취소"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
      >
        <Form.Item
          label="제목"
          name="title"
          rules={[{ required: true, message: '제목을 입력해주세요' }]}
        >
          <Input placeholder="예: 길이가 같은 낱말 변별" />
        </Form.Item>

        <Form.Item
          label="타입"
          name="type"
          rules={[{ required: true, message: '타입을 선택해주세요' }]}
        >
          <Select placeholder="Quest 타입 선택">
            <Select.Option value="choice">Choice (선택형)</Select.Option>
            <Select.Option value="statement-question">Statement-Question (평서문/의문문)</Select.Option>
            <Select.Option value="same-different">Same-Different (같은/다른)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="한 번에 보여줄 문제 개수"
          name="questItemCount"
          rules={[{ required: true, message: '문제 개수를 입력해주세요' }]}
          tooltip="사용자가 학습할 때 한 번에 보여줄 Quest Item의 개수입니다. 실제 등록된 문제 중에서 이 개수만큼 랜덤으로 출제됩니다."
          extra="실제 문제는 '문제 관리' 메뉴에서 등록할 수 있습니다."
        >
          <InputNumber
            min={1}
            max={100}
            style={{ width: '100%' }}
            placeholder="예: 10"
          />
        </Form.Item>

        <Form.Item
          label="순서"
          name="order"
          rules={[{ required: true, message: '순서를 입력해주세요' }]}
          tooltip="Quest 목록에서의 표시 순서"
        >
          <InputNumber
            min={1}
            max={999}
            style={{ width: '100%' }}
            placeholder="예: 1"
          />
        </Form.Item>

        <Form.Item
          label="해시태그"
          name="hashtagIds"
          tooltip="이 Quest와 연관된 해시태그를 선택하세요 (선택사항)"
        >
          <HashtagSelector placeholder="해시태그를 선택하세요 (선택사항)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuestFormModal;
