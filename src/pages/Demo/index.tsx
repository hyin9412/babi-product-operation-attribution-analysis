import React, { useCallback, useRef } from 'react';
import { 
  PageLayout, 
  TableBlock, 
  Form, 
  SelectBlock, 
  Button,
  Input
} from '@byted-babi/babi-design';
import { getMockList } from './mock';

const { Table } = TableBlock;
const { Item } = Form;

export const ListPage = () => {
  const [form] = Form.useForm();
  // 使用 useRef 避免频繁触发渲染，或者在 dataSource 函数内部读取当前 form 值
  const formValuesRef = useRef<any>({});

  const handleSearch = () => {
    formValuesRef.current = form.getFieldsValue();
    // 触发表格刷新，我们可以通过一些手段，比如使用一个状态或者直接让 Table 内部依赖这个刷新
    // 但是在 TableBlock 中通常只要触发重新查询即可
    // 为了简单，我们使用一个 key 或者 state 触发重新渲染
    setRefreshKey(prev => prev + 1);
  };

  const handleReset = () => {
    form.resetFields();
    formValuesRef.current = {};
    setRefreshKey(prev => prev + 1);
  };

  const [refreshKey, setRefreshKey] = React.useState(0);

  const getTableData = useCallback(
    async ({ limit, offset }: { limit: number; offset: number }) => {
      const filters = formValuesRef.current;
      const page = offset / limit + 1;
      
      const res = await getMockList(page, limit, filters);
      
      return {
        List: res.list,
        Total: res.total,
        Limit: limit,
      };
    },
    [refreshKey] // 依赖 refreshKey 以支持主动刷新
  );

  const columns = [
    {
      title: '实例ID',
      dataIndex: 'id',
      width: 150,
    },
    {
      title: '实例名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
    },
    {
      title: '环境',
      dataIndex: 'env',
      width: 100,
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      width: 100,
      render: (val: number) => `${val} 核`
    },
    {
      title: '内存',
      dataIndex: 'memory',
      width: 100,
      render: (val: number) => `${val} GB`
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 150,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 150,
      fixed: 'right' as const,
      render: () => (
        <div className="flex gap-2">
          <Button type="text" size="small" className="px-0">查看</Button>
          <Button type="text" size="small" className="px-0">编辑</Button>
        </div>
      )
    }
  ];

  return (
    <PageLayout title="实例列表" style={{ margin: 0 }} contentStyle={{ padding: 0 }} showBorder="always">
      <div className="px-[32px] py-4 bg-white shadow-sm">
        <Form 
          form={form} 
          layout="inline" 
          className="mb-4"
        >
          <Item field="name" label="实例名称">
            <Input placeholder="请输入" allowClear style={{ width: 200 }} />
          </Item>
          <Item field="status" label="状态">
            <SelectBlock 
              placeholder="请选择" 
              allowClear 
              style={{ width: 200 }}
              options={[
                { label: '运行中', value: 'running' },
                { label: '已停止', value: 'stopped' },
                { label: '失败', value: 'failed' },
                { label: '创建中', value: 'creating' },
              ]}
            />
          </Item>
          <Item field="env" label="环境">
            <SelectBlock 
              placeholder="请选择" 
              allowClear 
              style={{ width: 200 }}
              options={[
                { label: 'BOE', value: 'boe' },
                { label: 'PROD', value: 'prod' },
                { label: 'TEST', value: 'test' },
                { label: 'DEV', value: 'dev' },
              ]}
            />
          </Item>
          <Item>
            <div className="flex gap-2">
              <Button type="primary" onClick={handleSearch}>查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </Item>
        </Form>

        <Table
          dataSource={getTableData}
          columns={columns}
          rowKey="id"
        />
      </div>
    </PageLayout>
  );
};