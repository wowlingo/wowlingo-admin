import React, { useEffect, useState } from 'react';
import { Typography, Input, Select, Button, Space, Table, Tag, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { config } from '../config';

const { Title } = Typography;
const { Option } = Select;

interface Customer {
    key: React.Key;
    workspaceId: any;
    representativeName: string;

    address: string;
    detaileAddress: string;
    zipCode: string;

    taxInvoiceUse: boolean;

    email: any;
}

// Columns for the table
const columns: ColumnsType<Customer> = [
    {
        title: '워크스페이스 ID',
        dataIndex: ['workspaceId', 'value'],
        key: 'workspaceId',
    },
    {
        title: '회사 / 단체명',
        dataIndex: 'companyName',
        key: 'companyName',
    },
    {
        title: '대표자명',
        dataIndex: 'representativeName',
        key: 'representativeName',
    },
    {
        title: '주소',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: '상세 주소',
        dataIndex: 'detailAddress',
        key: 'detailAddress',
    },
    {
        title: '우편번호',
        dataIndex: 'zipCode',
        key: 'zipCode',
    },
    {
        title: '세금 계산서 사용여부',
        dataIndex: 'taxInvoiceUse',
        key: 'taxInvoiceUse',
        render: (taxInvoiceUse: boolean) => (
            <Tag bordered={false}>{taxInvoiceUse ? '예' : '아니오'}</Tag>
        ),
    },
    {
        title: '청구 이메일',
        dataIndex: ['email','value'],
        key: 'email',
        render: (value) => value?.[0]?.value || '-'
    },
];


const CustomerPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [spaceId, setSpaceId] = useState<string>('');
    const [messageApi, contextHolder] = message.useMessage();

    const handleSearch = async () => {
        // if (!spaceId) { return; }

        setLoading(true);
        try {
            const baseUrl = `${config.apiServer}/api/customers`;
            const params = new URLSearchParams();

            if (spaceId) {
                params.append('space_id', spaceId);
            }
            const url = `${baseUrl}${params.toString() ? `?${params}` : ''}`;

            const response = await fetch(url);
            const json = await response.json();

            const jsonArrays = json ?? [];

            const processedData = jsonArrays.map((item: any, index: number) => {
                return {
                    ...item,
                    key: item.workspaceId.value || index,
                };
            });
            setCustomers(processedData);

        } catch (error) {
            console.error('Failed to fetch payments:', error);
            // Handle error state here, e.g., show a notification
        }
        setLoading(false);
    }

    return (
        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {contextHolder}
            <Title level={3}>전체 거래처 조회</Title>
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
                    <Button type="primary" >거래처 정보 추출</Button>
                </Space>
            </div>
            <Table dataSource={customers} columns={columns} loading={loading} />
            {/* <Modal
                title="단건 결제"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="결제"
                cancelText="취소"
            >
                <p>워크스페이스 ID를 입력하세요.</p>
                <Input
                    placeholder="워크스페이스 ID"
                    value={workspaceId}
                    onChange={(e) => setWorkspaceId(e.target.value)}
                />
            </Modal> */}
        </div>
    );
};

export default CustomerPage;