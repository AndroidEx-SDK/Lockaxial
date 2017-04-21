/**
*创建访客密码页面
*/
import React, { Component } from 'react';
import {
  TouchableOpacity,View,Picker,Text
} from 'react-native';
import {FormInput,Button,FormLabel } from 'react-native-elements';
import DatetimeWidget from '../component/datetimeWidget';

import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import Format from '../util/format';
import accountDao from '../model/accountDao';
import visitorAccessDao from '../model/visitorAccessDao';

const LABELCHOOSE_LOCK='choose lock';
const LABEL_PEROID_TO='peroid to';
const LABEL_CONFIRM='confirm';
const LABEL_CANCEL='cancel';

export default class VisitorCreateScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      lockId:0,
      endDate:new Date(new Date().getTime()+7*24*60*60*1000)
    }
    if(accountDao.communityLockList.length>0){
      this.state.lockId=accountDao.communityLockList[0].rid;
    }
  }

  /**
  *保存一个访客密码
  */
  saveTemppKey(){
    let _this=this;
    if((_this.state.endDate.getTime()-new Date().getTime())>1000*60*60*24*7){
        _this.openInfoDialog(null,"结束时间必须在7天内");
        return;
    }

    function findLockById(lockId){
        for(var i=0;i<accountDao.communityLockList.length;i++){
            if(accountDao.communityLockList[i].rid==lockId){
                return accountDao.communityLockList[i];
            }
        }
    }
    var choosedLock=findLockById(_this.state.lockId);
    if(!choosedLock){
        _this.openInfoDialog(null,"请选择门禁");
        return;
    }
    var newKey={
        communityId:accountDao.currentUnit.communityId,
        userId:accountDao.userInfo.rid,
        state:"N",
        lockId:_this.state.lockId,
        lockName:choosedLock.lockName,
        lockSN:choosedLock.lockSN,
        lockType:choosedLock.lockType,
        endDate:Format.fromDateToStr(_this.state.endDate,"yyyy-MM-dd hh:mm:ss")
    };
    visitorAccessDao.save(newKey,function(result){
      if (result.code == 0) {
          let newKey=result.newKey;
          if(_this.props.afterCreated){
            _this.props.afterCreated(newKey);
          };
          _this.back();
      }
    });
  }

  chooseLock(lockId){
    this.state.lockId=lockId;
    this.setState(this.state);
  }

  chooseDatetime(date){
    this.state.endDate=date;
    this.setState(this.state);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <Picker style={MainStyle.selection}
          selectedValue={this.state.lockId}
          onValueChange={(lockId)=>this.chooseLock(lockId)}>
          {
            accountDao.communityLockList.map((item,i)=>
              <Picker.Item label={item.lockName} key={i} value={item.rid}/>
            )
          }
        </Picker>
        <DatetimeWidget date={this.state.endDate} mode="datetime" onChange={(date)=>this.chooseDatetime(date)}/>
        <View style={{padding:10}}><Button buttonStyle={{borderRadius:8,backgroundColor:'#006DCC'}} onPress={()=>this.saveTemppKey()} title={trans(LABEL_CONFIRM)}/></View>
        <View style={{padding:10}}><Button buttonStyle={{borderRadius:8}} onPress={()=>this.back()} title={trans(LABEL_CANCEL)}/></View>
      </View>
    );
  }
}
