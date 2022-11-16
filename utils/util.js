// 将分类数组转成3维数组
export function changeArray(data) {
  data.forEach((item) => {
    // 所有数据统一加children、value、text
    item.children = [];
    item.value = item._id;
    item.text = item.name;
  })

  data.forEach((item) => {
    data.forEach((item2) => {
      if (item2.parent_id === item._id) {
        item.children.push(item2)
      }
    })
  })

  let res = data.filter(i => i.parent_id === '');
  return res;
}
