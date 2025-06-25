export const filtrationTime = (time) => {
  const date = new Date(time);
  const now = new Date();
  const isThisYear = date.getFullYear() === now.getFullYear();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // 构建时间字符串
  const dateStr = isThisYear
    ? `${month}月${day}日`
    : `${year}年${month}月${day}日`;

  return `${dateStr} ${hours}:${minutes}:${seconds}`;
}
export const groupByMonth = (arr) => {
  if (!arr || arr.length === 0) return {};

  // 提取所有年份
  const years = new Set(arr.map(item => new Date(item.sendTime).getFullYear()));
  const sameYear = years.size === 1;

  return arr.reduce((acc, item) => {
    const date = new Date(item.sendTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 注意：这里直接用数字，不 padStart

    // key 的显示形式
    const key = sameYear ? `${month}月` : `${year}年${month}月`;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
}