/**
*开门记录数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';

export default class LockHistoryDao extends BaseDao {
  list=[]; //开门记录列表

  constructor() {
    super();
  }

  /**
  *增加开门记录图片
  */
  static appendImage(imageUuid,imageUrl){
    let _this=this;
    ajax.get('/device/appendImage',{imageUuid:imageUuid,imageUrl:imageUrl},function(result){
      if (result.code == 0) {
      }
    });
  }

  /**
  *获取更多开门记录列表
  */
  load(cb){
    let _this=this;
    ajax.get('/unit/retrieveAccessList',{arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          if(result.data[i].imageUrl){
            result.data[i].imageUrl=ajax.convertImageUrl(result.data[i].imageUrl);
          }
          _this.list.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始开门记录数据
  */
  init(cb){
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }
}
