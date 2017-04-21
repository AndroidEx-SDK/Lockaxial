/**
*房屋明细页面
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import MainStyle from '../style/mainStyle';
import UnitDao from '../model/unitDao';
import Filter from '../util/filter';
import accountDao from '../model/accountDao';

const UNIT_DELETE="delete";
const UNIT_CARS="unit cars";
const MSG_DELETE_CAR="delete car confirm";
const MSG_INPUT_CAR="car NO input";
const MSG_CAR_NO="car NO format";

export default class UnitCarScreen extends NormalScreen {
  unitDao=new UnitDao(); //

  constructor(props) {
    super(props);
    let _this=this;
    this.state={
      unitCarList:[]
    }
    this.unitDao.load(accountDao.currentUnit,function(code){  //从数据库加载详细数据
      if(code==0){
        _this.loadData();
      }
    });
  }

  /**
  *从Dao中获得最新数据，并更新页面
  */
  loadData(){
    this.state.unitCarList=this.unitDao.unitCarList;
    this.setState(this.state);
  }
  /**
  *打开新增车辆的页面
  */
  openNewCarScreen(){
    let _this=this;
    this.openInputScreen(MSG_INPUT_CAR,MSG_CAR_NO,function(carNo){
      if(carNo){
        _this.unitDao.saveUnitCar(carNo,function(code){
          if(code==0){
            _this.loadData();
          }else{
            toastX('system error');
          }
        });
      }
    });
  }

  /**
  *删除车辆
  */
  deleteCar(index){
    let _this=this;
    this.openConfirmDialog(MSG_DELETE_CAR,null,function(){
      _this.unitDao.deleteUnitCar(index,function(code){
        if(code==0){
          _this.loadData();
        }else{
          toastX('system error');
        }
      });
    });
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <View style={{flexDirection: 'row'}}>
          <Text style={MainStyle.label}>{trans(UNIT_CARS)}</Text>
          <TouchableOpacity onPress={()=>this.openNewCarScreen()}><Text style={MainStyle.link}>{trans('add')}</Text></TouchableOpacity>
        </View>
        <List containerStyle={MainStyle.list}>
          {
            this.state.unitCarList.map((l, i) => (
              <ListItem
                key={i}
                hideChevron={true}
                title={l.carNo}
                subtitle={
                  <View style={{flexDirection: 'row'}}>
                    <Text style={MainStyle.innerLabel}>{Filter.carStateFilter(l.state)}</Text>
                    {
                       (l.state=='N'||l.state=='P')?(
                            <TouchableOpacity onPress={()=>this.deleteCar(i)}><Text style={MainStyle.innerLink}>{trans('delete')}</Text></TouchableOpacity>
                        ) : (
                            null
                        )
                    }
                  </View>
                }
              />
            ))
          }
        </List>
      </View>
    );
  }
}
