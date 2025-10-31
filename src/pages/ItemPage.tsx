import React, { useEffect, useState } from 'react';
import { Typography, Input, Select, Button, Space, Table, Tag, Modal, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { config } from '../config';
import { idText } from 'typescript';

const { Title } = Typography;
const { Option } = Select;

const ItemTypeTag = ({ type }: { type: string }) => {
    const typeMap = {
        SameDifferent: { color: 'blue', text: '같아요/달라요' },
        StatementQuestion: { color: 'purple', text: '의문문/평서문' },
        Choice: { color: 'green', text: '1개 선택' },
        None: { color: 'gray', text: '없음' },
    };

    let currentType = typeMap.None;
    switch (type) {
        case 'same-different':
            currentType = typeMap.SameDifferent; break;
        case 'statement-question':
            currentType = typeMap.StatementQuestion; break;
        case 'choice':
            currentType = typeMap.Choice; break;
        default:
            currentType = typeMap.None;
    }

    return (
        <Tag color={currentType.color}>
            {currentType.text}
        </Tag>
    );
};

const ItemAnswerTag = ({ answer }: { answer: string | null }) => {
    const typeMap = {
        Same: { color: 'blue', text: '같아요' },
        Different: { color: 'geekblue', text: '달라요' },
        Statement: { color: 'purple', text: '평서문' },
        Question: { color: 'magenta', text: '의문문' },
        Choice: { color: 'green', text: '1개 선택' },
        None: { color: 'gray', text: '없음' },
    };

    let currentType = typeMap.None;
    switch (answer) {
        case 'same':
            currentType = typeMap.Same; break;
        case 'different':
            currentType = typeMap.Different; break;
        case 'statement':
            currentType = typeMap.Statement; break;
        case 'question':
            currentType = typeMap.Question; break;
        case 'choice':
            currentType = typeMap.Choice; break;
        default:
            return <Tag closeIcon='null'></Tag>;
    }

    return (
        <Tag bordered={false} color={currentType.color}>
            {currentType.text}
        </Tag>
    );
};

interface Item {
    // key: React.Key;

    questItemId: number;
    questId: number;
    type: string;
    answerOx: string | null;
    answerSq: string | null;
    answer1: string | null;
    answer2: string | null;
    remark: string | null;

    questUnit1: {
        quest_item_unit_id: number;
        type: string;
        str: string;
        url_normal: string;
        url_slow: string;
        remark: string | null;
    };

    questUnit2: {
        quest_item_unit_id: number;
        type: string;
        str: string;
        url_normal: string;
        url_slow: string;
        remark: string | null;
    };
}

const columns: ColumnsType<Item> = [
    {
        title: 'ID',
        dataIndex: 'questItemId',
        key: 'questItemId',
    },
    {
        title: '타입',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => (
            <ItemTypeTag type={type} />
        ),
    },
    {
        title: '문제1',
        dataIndex: ['questUnit1', 'str'],
        key: 'unit1_name',
    },
    {
        title: '문제1 보통',
        dataIndex: ['questUnit1', 'url_normal'],
        key: 'unit1_normal',
        render: (url: string) => {
            const handlePlay = () => {
                const audio = new Audio(url);
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
                        disabled={!url}
                    />
                </Space>
            );
        }
    },
    {
        title: '문제1 느리게',
        dataIndex: ['questUnit1', 'url_slow'],
        key: 'unit1_slow',
        render: (url: string) => {
            const handlePlay = () => {
                const audio = new Audio(url);
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
                        disabled={!url}
                    />
                </Space>
            );
        }
    },
    {
        title: '문제2',
        dataIndex: ['questUnit2', 'str'],
        key: 'unit2_name',
    },
    {
        title: '문제2 보통',
        dataIndex: ['questUnit2', 'url_normal'],
        key: 'unit2_normal',
        render: (url: string) => {
            const handlePlay = () => {
                const audio = new Audio(url);
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
                        disabled={!url}
                    />
                </Space>
            );
        }
    },
    {
        title: '문제2 느리게',
        dataIndex: ['questUnit2', 'url_slow'],
        key: 'unit2_slow',
        render: (url: string) => {
            const handlePlay = () => {
                const audio = new Audio(url);
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
                        disabled={!url}
                    />
                </Space>
            );
        }
    },
    {
        title: '보기 1',
        dataIndex: 'answer1',
        key: 'answer1',
    },
    {
        title: '보기 2',
        dataIndex: 'answer2',
        key: 'answer2',
    },
    {
        title: '정답',
        key: 'answer',
        render: (text: any, record: Item) => {
            if (record.type === 'same-different') {
                return <ItemAnswerTag answer={record.answerOx} />
            }
            else if (record.type === 'statement-question') {
                return <ItemAnswerTag answer={record.answerSq} />
            }

            return '';
        }
    },
];

const ItemPage: React.FC = () => {
    const [Items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${config.apiServer}/api/admin/quest/items`);
                if (!response.ok) {
                    throw new Error('데이터를 불러오는데 실패했습니다.');
                }
                const data = await response.json();
                // console.log(data)

                const jsonArrays = data.data ?? [];
                console.log(jsonArrays)

                // key 값이 없는 경우, paymentMethodKey.value를 key로 사용
                const processedData = jsonArrays.map((item: any, index: number) => ({
                    ...item,
                    key: item.questItemId || index,
                }));
                console.log(processedData)


                setItems(processedData);

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

        fetchItems();
    }, [messageApi]);

    return (
        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {contextHolder}
            <Title level={3}>문제 목록</Title>
            <Table dataSource={Items} columns={columns} loading={loading} />
        </div>
    );
};

export default ItemPage;