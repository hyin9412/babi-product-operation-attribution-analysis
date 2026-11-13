export enum CanaryType {
  Test = 1, // 测试类型小流量
  Prod = 2, // 正式类型小流量
  Gray = 3, // 百分比灰度发布
  UnKnown = 0, // 百分比灰度发布
}
