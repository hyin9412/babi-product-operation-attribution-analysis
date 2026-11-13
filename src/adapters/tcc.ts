const tccAPI = {
  async getStaticConfig({ key }: { key: string; service?: string }): Promise<any> {
    if (key === 'help_center') {
      return {
        helpCenterUrl: 'https://cloud.bytedance.net/docs/product/BABI',
        docs: [
          { name: 'BABI 经营工作台使用指南', url: 'https://cloud.bytedance.net/docs/product/BABI' },
        ],
      };
    }
    return {};
  },
};

export default tccAPI;
