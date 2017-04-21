/**
*联系物业
*/
import React, { Component } from 'react';
import {
  View,ListView,Text
} from 'react-native';
import {List,ListItem} from 'react-native-elements';
import Communications from 'react-native-communications';

import NormalListScreen from './normalListScreen';
import trans from '../i18/trans';
import {toastX,toast} from '../util/tools';
import MainStyle from '../style/mainStyle';
import contactDao from '../model/contactDao';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源

export default class ContactScreen extends NormalListScreen {
  constructor(props) {
    super(props);
    let _this=this;
    this.state={
      list:ds.cloneWithRows(contactDao.list)
    };
    contactDao.init(function(result){
      if(result){
        _this.changeList();
      }
    });
  }

  /**
  *更新列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(contactDao.list);
    this.setState(this.state);
  }

  /**
  *相应列表更新后的事件
  */
  onPageRefresh(){
    if(this.beforeListRefresh()){
      return;
    }
    var _this=this;
    contactDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  /**
  *拨打联系电话
  */
  openContactDial(rowID){
    let item=contactDao.list[rowID];
    Communications.phonecall(item.tel,true);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <List containerStyle={MainStyle.list}>
          <ListView
            enableEmptySections
            dataSource={this.state.list}
            onEndReached={()=>this.onPageRefresh()}
            onEndReachedThreshold={10}
            renderFooter={()=>this.renderRooter()}
            renderRow={(item, sectionID, rowID) =>
                    <ListItem onPress={()=>this.openContactDial(rowID)} key={rowID}
                      title={item.department}
                      rightIcon={{name:'dianhua',type:'iconfont',color:'#007aff'}}
                      subtitle={item.tel}>
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
