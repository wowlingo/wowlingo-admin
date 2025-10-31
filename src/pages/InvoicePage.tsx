
import React, { useEffect, useState } from 'react';
import { Typography, Input, Select, Button, Space, Table, Tag, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { config } from '../config';

const { Title } = Typography;
const { Option } = Select;

dayjs.extend(utc)
dayjs.extend(timezone)

interface Invoice {
  key: React.Key;
  spaceId: string;
  invoiceId: string;
  billingDate: string;
  supplyValue: string;
  vatAmount: string;
  totalAmount: string;
  paid: boolean;
  revision: number;
}

const InvoicePage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [spaceId, setSpaceId] = useState<string>('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string>('');
  const [correctionAmount, setCorrectionAmount] = useState<string>('');


  const handleSearch = async () => {
    if (!spaceId) { return; }

    setLoading(true);
    try {
      const response = await fetch(`${config.apiServer}/api/invoices?space_id=${spaceId}`);
      const json = await response.json();

      const invoices = json.invoices ?? [];

      const processedData = invoices.map((item: any, index: number) => {
        const billingDate = dayjs.tz(1759158000 * 1000, 'Asia/Seoul');
        const formattedDate = billingDate.format('YYYY-MM-DD');
        const invoiceIdDate = billingDate.format('YYYYMMDD');

        console.log(billingDate)
        console.log(formattedDate)
        console.log(invoiceIdDate)
        // val name get() = "KW-${billingDate.format(DateTimeFormatter.BASIC_ISO_DATE)}-$workspaceId-$revision"
        // ex) KW-20211130-175068-1
        const invoiceId = 'KW-' + invoiceIdDate + '-' + item.spaceId + '-' + item.revision

        return {
          ...item,
          key: item.spaceId + item.billingDate || index,
          billingDate: formattedDate,
          invoiceId: invoiceId
        };
      });
      setInvoices(processedData);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      // Handle error state here, e.g., show a notification
    }
    setLoading(false);
  };

  const handleDraftInvoice = async () => {
    try {
      // const response = await fetch(`${config.toolboxServer}/invoices`, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'text/csv',
      //   },
      // });

      // if (!response.ok) throw new Error('파일 다운로드 실패');

      // // blob으로 변환
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);

      // // 임시 a 태그로 다운로드 트리거
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
      // a.click();

      // // 리소스 해제
      // window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('청구서 가발행 중 오류가 발생했습니다.');
    }
  };

  const handleInvoiceAction = async () => {
    try {
      // const response = await fetch(`${config.toolboxServer}/invoices/action`, {
      //   method: 'GET',
      // });
      // console.log(response);

      // if (!response.ok) throw new Error('실패');

    } catch (err) {
      console.error(err);
      alert('청구서 발행 중 오류가 발생했습니다.');
    }
  };

  const showModal = (invoiceId: string) => {
    setCurrentInvoiceId(invoiceId);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    handleUpdateInvoice(currentInvoiceId, correctionAmount);
    setIsModalVisible(false);
    setCorrectionAmount(''); // 입력 필드 초기화
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCorrectionAmount(''); // 입력 필드 초기화
  };

  const columns: ColumnsType<Invoice> = [
    {
      title: '워크스페이스 ID',
      dataIndex: 'spaceId',
      key: 'spaceId',
    },
    {
      title: '인보이스 ID',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
    },
    {
      title: '청구 기준일',
      dataIndex: 'billingDate',
      key: 'billingDate',
    },
    {
      title: '공급가액',
      dataIndex: 'supplyValue',
      key: 'supplyValue',
      render: (amount: number) => `${amount.toLocaleString()}`,
    },
    {
      title: '부가세',
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      render: (amount: number) => `${amount.toLocaleString()}`,
    },
    {
      title: '청구 금액',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString()}`,
    },
    {
      title: '완납 여부',
      dataIndex: 'paid',
      key: 'paid',
      render: (paid: boolean) => (
        <Tag color={paid ? 'green' : 'volcano'}>
          {paid ? '완납' : '미납'}
        </Tag>
      ),
    },
    {
      title: 'revision',
      dataIndex: 'revision',
      key: 'revision',
    },
    {
      title: '작업',
      dataIndex: '',
      key: 'action',
      render: (_, record) => {
        console.log(record.paid)
        if (record.paid == null || record.paid === false) {
          return (
            <Button
              danger
              size="small"
              onClick={() => showModal(record.invoiceId)}
            >
              금액 보정
            </Button>
          );
        }
        return null;
      }
    }
  ];

  const handleUpdateInvoice = async (invoiceId: string, amount: string) => {
    // 금액 보정 금액은 필수값입니다. (KW-청구서번호-workspace_id-revision,보정금액) ex) KW-20211130-175068-1,-5200
    // console.log(`update invoice with invoice ID: ${invoiceId}`);
    console.log(`update invoice with invoice ID: ${invoiceId} , amount: ${amount}`);

    try {
      // const response = await fetch(`${config.toolboxServer}/invoice/update?invoice_id=${invoiceId}&amount=${amount}`, {
      //   method: 'GET',
      // });
      // console.log(response);

      // if (!response.ok) throw new Error('실패');

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
      <Title level={3}>전체 청구서 내역</Title>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="워크스페이스 ID"
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)} />
          {/* <Select defaultValue="전체" style={{ width: 120 }}>
            <Option value="전체">전체</Option>
            <Option value="완납">완납</Option>
            <Option value="미납">미납</Option>
          </Select> */}
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>검색</Button>
        </Space>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button onClick={handleDraftInvoice} >청구서 가발행</Button>
          <Button type="primary" onClick={handleInvoiceAction}>청구서 발행</Button>
        </Space>
      </div>
      <Table dataSource={invoices} columns={columns} loading={loading} />
      <Modal
        title="청구서 수정 (금액 보정)"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="수정"
        cancelText="취소"
      >
        <p><b>청구서 ID:</b> {currentInvoiceId}</p>
        <p>보정 금액을 입력하세요. (감액은 `-` 사용. 예: -5200)</p>
        <Input
          placeholder="보정 금액 입력"
          value={correctionAmount}
          onChange={(e) => setCorrectionAmount(e.target.value)}
          type="number"
        />
      </Modal>
    </div>
  );
};

export default InvoicePage;
