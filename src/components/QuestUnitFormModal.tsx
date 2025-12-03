import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { AudioUploader, HashtagSelector } from './index';
import { questUnitAPI } from '../services/api';
import { QuestUnit, CreateQuestUnitPayload, UpdateQuestUnitPayload } from '../types';

interface QuestUnitFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialData?: QuestUnit | null;
  onClose: () => void;
  onSuccess: () => void;
}

const QuestUnitFormModal: React.FC<QuestUnitFormModalProps> = ({
  visible,
  mode,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && initialData && mode === 'edit') {
      form.setFieldsValue({
        str: initialData.str,
        urlNormal: initialData.urlNormal,
        urlSlow: initialData.urlSlow,
        hashtagIds: [], // TODO: Need to convert hashtag names to IDs
        remark: initialData.remark,
      });
    } else if (visible && mode === 'create') {
      form.resetFields();
    }
  }, [visible, initialData, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!values.str?.trim()) {
        message.error('텍스트를 입력해주세요.');
        return;
      }

      if (!values.urlNormal || !values.urlSlow) {
        message.error('오디오 파일을 모두 업로드해주세요.');
        return;
      }

      if (!values.hashtagIds || values.hashtagIds.length === 0) {
        message.error('최소 1개 이상의 해시태그를 선택해주세요.');
        return;
      }

      setLoading(true);

      if (mode === 'create') {
        const payload: CreateQuestUnitPayload = {
          str: values.str.trim(),
          urlNormal: values.urlNormal,
          urlSlow: values.urlSlow,
          hashtagIds: values.hashtagIds,
          remark: values.remark?.trim() || undefined,
        };
        await questUnitAPI.create(payload);
        message.success('Quest Unit이 성공적으로 생성되었습니다!');
      } else if (mode === 'edit' && initialData) {
        const payload: UpdateQuestUnitPayload = {
          str: values.str.trim(),
          urlNormal: values.urlNormal,
          urlSlow: values.urlSlow,
          hashtagIds: values.hashtagIds,
          remark: values.remark?.trim() || undefined,
        };
        await questUnitAPI.update(initialData.questItemUnitId, payload);
        message.success('Quest Unit이 성공적으로 수정되었습니다!');
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
      title={mode === 'create' ? '새 Quest Unit 생성' : 'Quest Unit 수정'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={mode === 'create' ? '생성' : '수정'}
      cancelText="취소"
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 24 }}
      >
        <Form.Item
          label="텍스트"
          name="str"
          rules={[
            { required: true, message: '텍스트를 입력해주세요' },
            { max: 100, message: '텍스트는 100자 이하로 입력해주세요' },
          ]}
        >
          <Input
            placeholder="예: 감자"
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          label="일반 속도 오디오"
          name="urlNormal"
          rules={[{ required: true, message: '일반 속도 오디오 파일을 업로드해주세요' }]}
        >
          <AudioUploader
            label="일반 속도 오디오를 업로드하세요"
            mode={mode === 'edit' ? 'button' : 'dragger'}
          />
        </Form.Item>

        <Form.Item
          label="느린 속도 오디오"
          name="urlSlow"
          rules={[{ required: true, message: '느린 속도 오디오 파일을 업로드해주세요' }]}
        >
          <AudioUploader
            label="느린 속도 오디오를 업로드하세요"
            mode={mode === 'edit' ? 'button' : 'dragger'}
          />
        </Form.Item>

        <Form.Item
          label="Hashtags"
          name="hashtagIds"
          rules={[{ required: true, message: '최소 1개 이상의 해시태그를 선택해주세요' }]}
        >
          <HashtagSelector placeholder="Hashtag를 선택하세요 (복수 선택 가능)" />
        </Form.Item>

        <Form.Item
          label="비고"
          name="remark"
        >
          <Input.TextArea
            rows={3}
            placeholder="추가 정보나 메모를 입력하세요 (선택사항)"
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuestUnitFormModal;