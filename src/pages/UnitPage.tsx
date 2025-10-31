import React, { useEffect, useState } from 'react';
import { Typography, Input, Select, Button, Space, Table, Tag, Modal, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { config } from '../config';
import { idText } from 'typescript';

const { Title } = Typography;
const { Option } = Select;

interface Unit {
    // key: React.Key;
    questItemUnitId: number;
    str: string;
    urlNormal: string;
    urlSlow: string;
    hashtags: string[];
}

const columns: ColumnsType<Unit> = [
    {
        title: 'ID',
        dataIndex: 'questItemUnitId',
        key: 'questItemUnitId',
    },
    {
        title: '이름',
        dataIndex: 'str',
        key: 'str',
    },
    {
        title: '보통 속도 파일 위치',
        dataIndex: 'urlNormal',
        key: 'urlNormal',
    },
    {
        title: '보통 듣기',
        dataIndex: 'urlNormal',
        key: 'urlNormal',
        render: (url: string) => {
            console.log(url);
            const audio = new Audio(url);

            const handlePlay = () => {
                audio.play().catch((err) => {
                    console.error('오디오 재생 실패:', err);
                });
            };

            return (
                <Space>
                    <Button
                        type="text"
                        icon={<SoundOutlined />}
                        onClick={handlePlay}
                    />
                </Space>
            );
        }
    },
    {
        title: '느린 속도 파일 위치',
        dataIndex: 'urlSlow',
        key: 'urlSlow',
    },
    {
        title: '느린 듣기',
        dataIndex: 'urlSlow',
        key: 'urlSlow',
        render: (url: string) => {
            const audio = new Audio(url);

            const handlePlay = () => {
                audio.play().catch((err) => {
                    console.error('오디오 재생 실패:', err);
                });
            };

            return (
                <Space>
                    <Button
                        type="text"
                        icon={<SoundOutlined />}
                        onClick={handlePlay}
                    />
                </Space>
            );
        }
    },
    {
        title: '해시태그',
        dataIndex: 'hashtags',
        key: 'hashtags',
        render: (hashtags: string[]) => (
            <>
                {Array.isArray(hashtags) &&
                    hashtags.map((tag) => (
                        <Tag key={tag}>#{tag}</Tag>
                    ))}
            </>
        ),
    },
];

const UnitPage: React.FC = () => {
    const [Units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchUnits = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${config.apiServer}/api/admin/quest/units`);
                if (!response.ok) {
                    throw new Error('데이터를 불러오는데 실패했습니다.');
                }
                const data = await response.json();
                console.log(data)

                const jsonArrays = data.data ?? [];
                console.log(jsonArrays)

                // key 값이 없는 경우, paymentMethodKey.value를 key로 사용
                const processedData = jsonArrays.map((item: any, index: number) => ({
                    ...item,
                    key: item.questItemUnitId || index,
                }));
                console.log(processedData)


                setUnits(processedData);

            } catch (error) {
                if (error instanceof Error) {
                    messageApi.error(error.message);
                } else {
                    messageApi.error('알 수 없는 오류가 발생했습니다.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUnits();
    }, [messageApi]);

    return (
        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {contextHolder}
            <Title level={3}>문제 유닛 목록</Title>
            <Table dataSource={Units} columns={columns} loading={loading} />
        </div>
    );
};

export default UnitPage;