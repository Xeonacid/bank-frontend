import { vcity } from '@/enums/idCardEnum';

// 检查基本输入规则
const isCardNo = (cardId: string) => {
  const reg = /(^\d{17}(\d|X|x)$)/;
  return reg.test(cardId);
};

// 检测前两位是否为省份
const checkProvince = (cardId: string) => {
  const province = cardId.substring(0, 2);
  return Boolean(vcity[province]);
};

// 检测生日是否正确
const checkBirthday = (cardId: string) => {
  const re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
  const arr_data = cardId.match(re_eighteen);
  if(arr_data == null)
    return false;
  const year = arr_data[2];
  const month = arr_data[3];
  const day = arr_data[4];
  const birthday = new Date(`${year}/${month}/${day}`);
  return verifyBirthday(year, month, day, birthday);
};

// 检测日期
const verifyBirthday = (year, month, day, birthday) => {
  const now = new Date();
  const now_year = now.getFullYear();
  // 判断年月日是否合理
  if (
    birthday.getFullYear() == year &&
    birthday.getMonth() + 1 == month &&
    birthday.getDate() == day
  ) {
    // 判断年份的范围（3岁到100岁之间)
    const time = now_year - year;
    return time >= 0;
  }
  return false;
};

// 检测检验位是否正确
const checkParity = (cardId: string) => {
  const arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let cardTemp = 0;
  for (let i = 0; i < 17; i++) {
    cardTemp += +cardId[i] * arrInt[i];
  }
  return arrCh[cardTemp % 11] == cardId[17];
};

/**
 * 验证身份证合法性
 * @param cardId  身份证号码  String类型
 * @returns  boolean true合法,false不合法
 */
const isIdCard = (cardId: string) => {
  // 检测身份证是否合法
  return isCardNo(cardId) && checkProvince(cardId) && checkBirthday(cardId) && checkParity(cardId);
};

export default isIdCard;
