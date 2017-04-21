import Toast from 'react-native-root-toast';
import trans from '../i18/trans'

/**
 *封装了Toast显示的方法，供界面直接调用
 */
export function toast(message){
  Toast.show(message, {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0
  });
}

/**
 *封装了Toast显示的方法，并且自动根据消息进行本地化翻译
 */
export function toastX(message){
  toast(trans(message));
}

/**
*判断两个JSON对象是否相等
*/
export function compareJson(a, b) {
  if(a&&b){
    let stringA=JSON.stringify(a);
    let stringB=JSON.stringify(b);
    return stringA==stringB;
  }else{
    if(a || b){
      return false;
    }else{
      return true;
    }
  }
}

/**
*判断是否为字符串
*/
export function isString(str){
  return (typeof str=='string')&&str.constructor==String;
}

/**
*从数组中拷贝一份
*/
export function cloneArray(list){
  let newList=[];
  if(list){
    for(let i=0;i<list.length;i++){
      newList.push(list[i]);
    }
  }
  return newList;
}
