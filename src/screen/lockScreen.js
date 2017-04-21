/**
*社区门禁，打开门禁清单，直接开门
*/
import React, { Component } from 'react';
import {
  View,ListView,Text
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toastX,toast} from '../util/tools';
import accountDao from '../model/accountDao';
import MainStyle from '../style/mainStyle';
import reactBridge from '../bridge/reactBridge';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const LOCK_LIST='lock list';

export default class LockScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      list:ds.cloneWithRows(accountDao.communityLockList)
    };
  }

  /**
  *打开选择的门禁
  */
  openLock(rowID){
    var item=accountDao.communityLockList[rowID];
    reactBridge.sendMainMessage(20033,item.lockKey);  //向原生部分发送消息，打开指定的门禁
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <Text style={MainStyle.label}>{trans(LOCK_LIST)}</Text>
        <List containerStyle={MainStyle.list}>
          <ListView
            enableEmptySections
            dataSource={this.state.list}
            renderRow={(item, sectionID, rowID) =>
                    <ListItem onPress={()=>this.openLock(rowID)} key={rowID}
                      title={item.lockName}>
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
