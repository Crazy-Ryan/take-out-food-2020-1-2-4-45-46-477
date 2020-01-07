const halfPromDescription = '指定菜品半价';
const reachPromDescription = '满30减6元';
const noPromDescription = '不使用优惠';
function bestCharge(selectedItems) {
  let itemListSubtotal = subtotalCal(getItemInfo(listItem(selectedItems)));
  let totalNoProm = totalCal(itemListSubtotal);
  let itemListSubtotalProm;
  let promList;
  [itemListSubtotalProm, promList] = readProms(itemListSubtotal, totalNoProm);
  let promSelectedIndex = promSelect(promList);
  return printShoppingDetail(itemListSubtotalProm, promList, promSelectedIndex);
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

function totalCal(itemListWithSubtotal) {
  return itemListWithSubtotal.reduce((totalCost, currentItem) => totalCost + currentItem.subtotal, 0);
}

function readProms(itemListWithSubtotal, totalCost) {
  let promChoices = loadPromotions();
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
        break;
    }
  })
  promChoices.forEach(function (currentProm) {
    switch (currentProm.type) {
      case halfPromDescription:
        [currentProm.total, currentProm.msg] = halfPromCal(itemListWithSubtotal, totalCost);
        break;
      case reachPromDescription:
        [currentProm.total, currentProm.msg] = reachPromCal(totalCost);
        break;
    }
  })
  let noPromObj = [{
    type: noPromDescription,
    total: totalCost
  }];
  return [itemListWithSubtotal, noPromObj.concat(promChoices)];
}

function halfPromCal(itemListSubtotalProm, totalCost) {
  let halfPriceItem = [];
  let halfPromTotal = itemListSubtotalProm.reduce(function (totalPrice, currentItem) {
    if (currentItem.halfPrice) {
      halfPriceItem.push(currentItem.name)
      return totalPrice + currentItem.subtotal * 0.5;
    }
    else {
      return totalPrice + currentItem.subtotal;
    }
  }, 0);
  let halfPromMsg = `指定菜品半价(${halfPriceItem.join('，')})，省${totalCost - halfPromTotal}元\n`;
  return [halfPromTotal, halfPromMsg];
}

function reachPromCal(totalCost) {
  let reachPromTotal;
  if (totalCost > 30) {
    reachPromTotal = totalCost - 6;
  }
  else {
    reachPromTotal = totalCost;
  }
  let reachPromMsg = `满30减6元，省${totalCost - reachPromTotal}元\n`;
  return [reachPromTotal, reachPromMsg];
}

function promSelect(promList) {
  let promSelectedIndex = 0;
  let minCost = promList[0].total;
  promList.forEach(function (promChoice, index) {
    if (promChoice.total < minCost) {
      minCost = promChoice.total;
      promSelectedIndex = index;
    }
  })
  return promSelectedIndex;
}

function printShoppingDetail(itemListSubtotalProm, promList, promSelectedIndex) {
  let header = '============= 订餐明细 =============\n';
  let items = '';
  itemListSubtotalProm.forEach(function (currentItem) {
    let singleItem = `${currentItem.name} x ${currentItem.count} = ${currentItem.subtotal}元\n`;
    items += singleItem;
  })
  let prom = '';
  if (noPromDescription !== promList[promSelectedIndex].type) {
    prom += '-----------------------------------\n使用优惠:\n';
    prom += promList[promSelectedIndex].msg;
  }
  let sum = '-----------------------------------\n';
  sum += `总计：${promList[promSelectedIndex].total}元\n`;
  sum += '===================================';
  return header + items + prom + sum;
}