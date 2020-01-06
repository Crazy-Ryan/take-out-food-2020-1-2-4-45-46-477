function bestCharge(selectedItems) {
  return /*TODO*/;
}

function listItem(selectedItems) {
  return selectedItems.reduce(function (codeList, itemRead) {
    let itemInfo = itemRead.split('x');
    let itemObj = {};
    itemObj.id = itemInfo[0].trim();
    itemObj.count = itemInfo[1].trim();
    codeList.push(itemObj);
    return codeList;
  }, [])
}

function getItemInfo(codeList) {
  return codeList.reduce(function (itemList, currentItem) {
    let itemInfo = itemQuery(currentItem.id);
    if (itemInfo) {
      itemInfo.count = currentItem.count;
      itemList.push(itemInfo);
    }
    return itemList;
  }, [])
}

function itemQuery(itemId) {
  let itemDict = loadAllItems();
  return itemDict.find(element => (itemId === element.id));
}

function subtotalCal(itemList) {
  return itemList.reduce(function (itemListWithSubtotal, currentItem) {
    let itemSubtotal = currentItem.price * currentItem.count;
    currentItem.subtotal = itemSubtotal;
    itemListWithSubtotal.push(currentItem);
    return itemListWithSubtotal;
  }, [])
}

function readProms(itemListWithSubtotal) {
  let itemListSubtotalProm = [];
  let promChoices = loadPromotions();
  const halfPromDescription = '指定菜品半价';
  const reachPromDescription = '满30减6元';
  promChoices.forEach(function (currentProm) {
    switch (currentProm.type) {
      case halfPromDescription:
        itemListWithSubtotal.forEach(function (currentItem) {
          currentItem.halfPrice = currentProm.items.includes(currentItem.id);
        })
        break;
      case reachPromDescription:
        itemListWithSubtotal.forEach(function (currentItem) {
          currentItem.reachPrice = true;
        })
      default: ;
    }
  })
  return itemListWithSubtotal;
}

let codeList = [
  { id: 'ITEM0001', count: '1' },
  { id: 'ITEM0013', count: '2' },
  { id: 'ITEM0022', count: '1' }
];
console.log(subtotalCal(getItemInfo(codeList)));
console.log(readProms(subtotalCal(getItemInfo(codeList))));

function loadPromotions() {
  return [{
    type: '满30减6元'
  }, {
    type: '指定菜品半价',
    items: ['ITEM0001', 'ITEM0022']
  }];
}

function loadAllItems() {
  return [{
    id: 'ITEM0001',
    name: '黄焖鸡',
    price: 18.00
  }, {
    id: 'ITEM0013',
    name: '肉夹馍',
    price: 6.00
  }, {
    id: 'ITEM0022',
    name: '凉皮',
    price: 8.00
  }, {
    id: 'ITEM0030',
    name: '冰锋',
    price: 2.00
  }];
}
