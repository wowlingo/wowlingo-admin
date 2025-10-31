import React, { useEffect, useState } from 'react';
import { Typography, Input, Select, Button, Space, Table, Tag, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { config } from '../config';
import { read } from 'fs';
import { setCommentRange } from 'typescript';

const { Title } = Typography;
const { Option } = Select;


const PaymentStatusTag = ({ status }: { status: string }) => {
    const statusMap = {
        Completed: { color: 'blue', text: '결제완료' },
        Canceled: { color: 'gray', text: '취소완료' },
        Requested: { color: 'green', text: '결제요청' },
        Failed: { color: 'volcano', text: '결제실패' }
    };

    let currentStatus = statusMap.Failed;
    switch (status) {
        case 'Completed':
            currentStatus = statusMap.Completed; break;
        case 'Canceled':
            currentStatus = statusMap.Canceled; break;
        case 'Requested':
            currentStatus = statusMap.Requested; break;
        case 'Failed':
            currentStatus = statusMap.Failed; break;
        default:
            currentStatus = statusMap.Failed;
    }

    return (
        <Tag color={currentStatus.color}>
            {currentStatus.text}
        </Tag>
    );
};

interface Payment {
    key: React.Key;
    paymentId: string;
    invoiceId: string;

    workspaceId: string;
    billingDate: string;
    revision: number;

    status: string;

    moment: string;
    approvedAt: string;
    canceledAt: string;

    comment: string;
}


const PaymentPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [spaceId, setSpaceId] = useState<string>('');
    const [messageApi, contextHolder] = message.useMessage();

    const [currentInvoiceId, setCurrentInvoiceId] = useState<string>('');

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [workspaceId, setWorkspaceId] = useState('');

    const [isCompleteModalVisible, setIsCompleteModalVisible] = useState(false);
    const [comment, setComment] = useState('');

    const success = () => {
        messageApi.open({
            type: 'success',
            content: '요청 성공 하였습니다',
        });
    };

    const error = () => {
        messageApi.open({
            type: 'error',
            content: '요청 실패 하였습니다',
        });
    };

    const handleSearch = async () => {
        if (!spaceId) { return; }

        setLoading(true);
        try {
            const response = await fetch(`${config.apiServer}/api/payments?space_id=${spaceId}`);
            const json = await response.json();

            const jsonArrays = json ?? [];

            const processedData = jsonArrays.map((item: any, index: number) => {
                return {
                    ...item,
                    key: item.paymentId || index,
                };
            });
            setPayments(processedData);

        } catch (error) {
            console.error('Failed to fetch payments:', error);
            // Handle error state here, e.g., show a notification
        }
        setLoading(false);
    };

    const handleNewPayments = async () => {
        try {
            // const response = await fetch(`${config.toolboxServer}/payments/new`, {
            //     method: 'GET',
            // });
            // console.log(response);

            // if (!response.ok) throw new Error('실패');

            success();

        } catch (err) {
            console.error(err);
            error();
        }
    };


    const handleIndividualPayments = async () => {
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            // const response = await fetch(`${config.toolboxServer}/pay/individual?space_ids=${workspaceId}`, {
            //     method: 'GET',
            // });
            // console.log(response);

            // if (!response.ok) throw new Error('실패');

            success();
        } catch (err) {
            console.error(err);
            error();
        } finally {
            setIsModalVisible(false);
            setWorkspaceId('');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setWorkspaceId('');

        setIsCompleteModalVisible(false);
        setComment('');
        setCurrentInvoiceId('');
    };

    const showCompleteModal = (invoiceId: string) => {
        setCurrentInvoiceId(invoiceId);
        setIsCompleteModalVisible(true);
    };

    const handleCancelPayment = async (invoiceId: string) => {
        console.log(`Canceling payment with ID: ${invoiceId}`);

        try {
            // const response = await fetch(`${config.toolboxServer}/pay/cancel?invoice_id=${invoiceId}`, {
            //     method: 'GET',
            // });
            // console.log(response);

            // if (!response.ok) throw new Error('실패');

        } catch (err) {
            console.error(err);
        }
    };

    const handleCompleteModalOk = async () => {
        try {
            // 청구서(Invoice) 완납 처리 => workspace_id, paid=0 and invoice_date & revision
            // payment.status = completed & comment += "/계좌이체 처리 진행 https://dkt.agit.in/g/300064469/wall/440613904" 아지트 링크와 함께

            // const response = await fetch(`${config.toolboxServer}/pay/complete?invoice_id=${currentInvoiceId}&comment=${comment}`, {
            //     method: 'GET',
            // });
            // console.log(response);

            // if (!response.ok) throw new Error('실패');

            success();
        } catch (err) {
            console.error(err);
            error();
        } finally {
            setIsCompleteModalVisible(false);
            setComment('');
        }
    };

    const columns: ColumnsType<Payment> = [
        {
            title: '결제 ID',
            dataIndex: 'paymentId',
            key: 'paymentId',
        },
        {
            title: '청구서 ID',
            dataIndex: 'invoiceId',
            key: 'invoiceId',
        },
        {
            title: '워크스페이스 ID',
            dataIndex: 'workspaceId',
            key: 'workspaceId',
        },
        {
            title: '청구 기준일',
            dataIndex: 'billingDate',
            key: 'billingDate',
        },
        {
            title: 'revision',
            dataIndex: 'revision',
            key: 'revision',
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <PaymentStatusTag status={status} />
            ),
        },
        {
            title: '결제 시각',
            dataIndex: 'moment',
            key: 'moment',
        },
        {
            title: '결제 승인 시각',
            dataIndex: 'approvedAt',
            key: 'approvedAt',
        },
        {
            title: '결제 취소 시각',
            dataIndex: 'canceledAt',
            key: 'canceledAt',
        },
        {
            title: '작업',
            key: 'action',
            render: (_, record) => {
                if (record.status === 'Completed') {
                    return (
                        <Button
                            danger
                            size="small"
                            onClick={() => handleCancelPayment(record.invoiceId)}
                        >
                            결제 취소
                        </Button>
                    );
                }
                else if (record.status === 'Canceled' || record.status === 'Failed') { // Failed 만.
                    return (
                        <Button color="purple" variant="outlined"
                            size="small"
                            onClick={() => showCompleteModal(record.invoiceId)}
                        >
                            결제 완납
                        </Button>
                    );
                }
                return null;
            }
        },

    ];

    return (
        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {contextHolder}
            <Title level={3}>전체 결제 내역</Title>
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
                    <Button type="primary" onClick={handleNewPayments} >정기 결제</Button>
                    <Button onClick={handleIndividualPayments}>단건 결제</Button>
                </Space>
            </div>
            <Table dataSource={payments} columns={columns} loading={loading} rowKey="paymentId" />

            <Modal
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
            </Modal>

            <Modal
                title="결제 완납"
                visible={isCompleteModalVisible}
                onOk={handleCompleteModalOk}
                onCancel={handleCancel}
                okText="결제"
                cancelText="취소"
            >
                <p><b>청구서 ID:</b> {currentInvoiceId}</p>
                <p>강제 결제 완납시 comment 가 필수 입니다.</p>
                <p>( 예: comment = "계좌이체" )</p>
                <Input
                    placeholder="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default PaymentPage;


