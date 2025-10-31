import { config } from '../config';
import React, { useEffect, useState } from 'react';
import { Typography, Input, Select, Button, Space, Table, Tag, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

interface Card {
    key: React.Key;
    spaceId: string;
    maskedCardNumber: string;

    cardServiceId: any;
    paymentMethodKey: any;
}

const columns: ColumnsType<Card> = [
    {
        title: '결제 KEY',
        dataIndex: ['paymentMethodKey', 'value'],
        key: 'paymentMethodKey',
    },
    {
        title: '결제 ID',
        dataIndex: ['paymentMethodKey', 'subKey'],
        key: 'invoiceId',
    },
    {
        title: '워크스페이스 ID',
        dataIndex: 'spaceId',
        key: 'spaceId',
    },
    {
        title: '카드 번호',
        dataIndex: 'maskedCardNumber',
        key: 'maskedCardNumber',
    },
    {
        title: '카드사',
        dataIndex: 'cardServiceId',
        key: 'cardServiceId',
        render: (cardServiceId: any) => (
            <p>{cardServiceId.name} ({cardServiceId.code})</p>
        ),
    },

];

const CardPage: React.FC = () => {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [spaceId, setSpaceId] = useState<string>('');
    const [messageApi, contextHolder] = message.useMessage();

    const handleSearch = async () => {
        if (!spaceId) { return; }

        setLoading(true);
        try {
            const response = await fetch(`${config.apiServer}/api/customer/cards?space_id=${spaceId}`);
            const json = await response.json();

            const jsonArrays = json.cards ?? [];

            const processedData = jsonArrays.map((item: any, index: number) => {
                return {
                    ...item,
                    key: item.paymentMethodKey.value || index,
                };
            });
            setCards(processedData);

        } catch (error) {
            console.error('Failed to fetch payments:', error);
            // Handle error state here, e.g., show a notification
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {contextHolder}
            <Title level={3}>거래처 카드 조회</Title>
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
            <Table dataSource={cards} columns={columns} loading={loading} />
        </div>
    );
};

export default CardPage;
