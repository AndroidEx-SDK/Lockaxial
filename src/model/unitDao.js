/**
*房屋相关数据类
*/
import BaseDao from './baseDao';
import accountDao from './accountDao';
import ajax from '../util/ajax';

export default class UnitDao extends BaseDao {
  item=null;
  unitMemberList=null;
  unitCarList=null;

  constructor() {
    super();
  }

  /**
  *从服务器中获取最新房屋数据
  */
  load(item,cb){
    this.item=item;
    this.retrieveUnitRelatedInfo(item.rid,cb);
  }

  /**
  *从服务器获取最新的房屋人员列表及房屋车辆列表
  */
  retrieveUnitRelatedInfo(unitId,cb){
    var _this=this;
    ajax.get('/unit/retrieveUnitRelatedInfo',{unitId:unitId},function(result){
      if(result.code==0){
        _this.unitMemberList=result.members;
        _this.unitCarList=result.cars;
      }
      if(cb){cb(result.code)}
    });
  }

  /**
  *删除房屋成员
  */
  deleteUnitMember(index,cb){
    let _this=this;
    ajax.get('/unit/deleteUnit',{unitId:this.item.rid,userId:this.unitMemberList[index].rid},function(result){
      if(result.code==0){
        _this.unitMemberList.splice(index,1);
      }
      if(cb){cb(result.code)}
    });
  }

  /**
  *保存房屋的车牌
  */
  saveUnitCar(carNo,cb){
    let _this=this;
    carNo=carNo.toUpperCase();
    var car={carNo:carNo,unitId:this.item.rid,communityId:this.item.communityId,state:"P"};
    ajax.post('/unit/saveUnitCar',{car:car},function(result){
      if(result.code==0){
        car.rid=result.insertId;
        _this.unitCarList.push(car);
      }
      if(cb){cb(result.code)}
    });
  }

  /**
  *删除房屋的车辆
  */
  deleteUnitCar(rowID,cb){
    let _this=this;
    let thisCar=_this.unitCarList[rowID];
    ajax.post('/unit/deleteUnitCar',{car:thisCar},function(result){
      if(result.code==0){
        if(thisCar.state=="P"){
          _this.unitCarList.splice(rowID,1);
        }else{
          thisCar.state="C";
        }
      }
      if(cb){cb(result.code)}
    });
  }

  /**
  *删除当前房屋
  */
  delete(cb){
    ajax.get('/unit/deleteUnit',{unitId:this.item.rid},function(result){
      if(result.code==0){
        accountDao.refreshApplicationData();
      }
      if(cb){cb(result)}
    });
  }
}
