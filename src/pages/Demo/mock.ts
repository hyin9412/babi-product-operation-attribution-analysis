export const mockListData = Array.from({ length: 45 }).map((_, index) => {
  const statusList = ['running', 'stopped', 'failed', 'creating'];
  const envList = ['boe', 'prod', 'test', 'dev'];
  const creatorList = ['zhangsan', 'lisi', 'wangwu', 'zhaoliu'];
  
  return {
    id: `inst-${1000 + index}`,
    name: `测试实例-${index + 1}`,
    status: statusList[index % 4],
    env: envList[index % 4],
    creator: creatorList[index % 4],
    cpu: (index % 8) + 1,
    memory: ((index % 8) + 1) * 2,
    createTime: `2024-04-${(index % 30 + 1).toString().padStart(2, '0')} 12:00:00`,
    description: `这是一个用于测试的实例 ${index + 1}`
  };
});

export const getMockList = async (page: number, size: number, filters?: Record<string, any>) => {
  return new Promise<{ list: any[], total: number }>((resolve) => {
    setTimeout(() => {
      let filteredData = [...mockListData];
      
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] && filters[key] !== '') {
            filteredData = filteredData.filter(item => item[key] === filters[key]);
          }
        });
      }
      
      const start = (page - 1) * size;
      const end = start + size;
      
      resolve({
        list: filteredData.slice(start, end),
        total: filteredData.length
      });
    }, 500); // 模拟网络延迟
  });
};