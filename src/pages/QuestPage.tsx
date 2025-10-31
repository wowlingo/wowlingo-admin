import React, { useEffect, useState } from 'react';
import { Typography, Input, Select, Button, Space, Table, Tag, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { config } from '../config';
import { idText } from 'typescript';

const { Title } = Typography;
const { Option } = Select;

const QuestTypeTag = ({ type }: { type: string }) => {
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

interface Quest {
    // key: React.Key;
    questId: number;
    title: string;
    type: string;
    hashtags: string[];
}

const columns: ColumnsType<Quest> = [
    {
        title: 'ID',
        dataIndex: 'questId',
        key: 'questId',
    },
    {
        title: '타이틀',
        dataIndex: 'title',
        key: 'title',
    },
    {
        title: '타입',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => (
            <QuestTypeTag type={type} />
        ),
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

const QuestPage: React.FC = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchQuests = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${config.apiServer}/api/admin/quest`);
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
                    key: item.questId || index,
                }));
                console.log(processedData)


                setQuests(processedData);

                // setQuests([
                //     {
                //         id: 1,
                //         title: '길이가 같은 낱말 변별',
                //         hashtags: ['말소리의 변별', '음향 패턴이 다른', '2-3 음절 낱말'],
                //         type: 'same-different',
                //     },
                //     {
                //         id: 2,
                //         title: '억양 확인',
                //         hashtags: ['말소리의 확인', '의문문', '평서문'],
                //         type: 'statement-question',
                //     },
                //     {
                //         id: 3,
                //         title: '길이가 같은 낱말 확인',
                //         hashtags: ['말소리의 확인', '음향 패턴이 유사한', '2-4 음절 낱말'],
                //         type: 'choice',
                //     },
                //     {
                //         id: 4,
                //         title: '문장 완성',
                //         hashtags: ['말소리의 확인', '길이가 같은', '문장'],
                //         type: 'choice',
                //     },
                // ]);

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

        fetchQuests();
    }, [messageApi]);

    return (
        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {contextHolder}
            <Title level={3}>학습 목록</Title>
            <Table dataSource={quests} columns={columns} loading={loading} />
        </div>
    );
};

export default QuestPage;