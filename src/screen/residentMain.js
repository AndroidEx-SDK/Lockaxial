/**
 *物业子页面，也是整个APP的首页
 */
import React, { Component } from 'react';
import {
    ScrollView,View,Text,Dimensions,DeviceEventEmitter
    } from 'react-native';
const _  = require("underscore");
import JPushModule from 'jpush-react-native';
import SubScreen from './subScreen.js';
import MainStyle from '../style/mainStyle';
import AdsBanner from '../component/adsBanner';
import MenuButton from '../component/menuButton';
import NoticeBar from '../component/noticeBar';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import accountDao from '../model/accountDao';
import deviceDao from '../model/deviceDao';
import LockHistoryDao from '../model/lockHistoryDao';
import billDao from '../model/billDao';
import reactBridge from '../bridge/reactBridge';
import UDPClientBridge from '../bridge/UDPClientBridge';

const windowSize = Dimensions.get('window');
const menuWidth = windowSize.width / 4;
const menuHeight = windowSize.width / 4;
const MSG_NO_RTC = 'no rtc';
const MSG_NO_LIFT = 'no lift';
const MSG_MORE_FUNCTION='more function';
const MSG_LIFT_IN='lift in';
const MSG_LIFT_OUT='lift out';
const MSG_CALL_FAILED='on call failed';
const MSG_TALK_FAILED='on talk failed';

function supplement(prefix,val,len){
    val = val+"";
    var offset = len - val.length;
    if (offset > 0) {
        for (var i = 0; i < offset; i++) {
            val = "0" + val;
        }
    }
    return prefix + val;
}

function  lowhighRevert(value,len){
    // 十六进制
    value = parseInt(value).toString(16);
    //
    var offset = 0;
    if(value.length<len){
        offset = len - value.length;
    }
    for(var i=0;i<offset;i++){
        value = "0"+value;
    }

    // 将值截取为数组
    var list = [];
    var pos = 0;
    for(var i = 0;i<len/2;i++){
        list.unshift(value.substr(pos,2));
        pos = pos+2;
    }
    value = list.join("");
    return value;
}

// 将4，6，10的字符串转换位040610的编码
function resolveFloors(floors){
    floors = floors.split(",");
    floors = _.map(floors,function(floor){
        return supplement("",floor,2);
    });
    return floors.join("");
}

function sumFloor (floors){
    let sum = 0;
    floors = floors.split(",");
    floors.forEach(function(val){
        val = parseInt(val);
        sum = sum + val;
    });
    return sum;
}


// 计算如012045的和
function sumCode(code){
    var code1 = code.substr(0,3);
    var code2 = code.substr(3,3);
    return parseInt(code1)+parseInt(code2);
}

export default class ResidentMain extends SubScreen {
    constructor(props) {
        super(props);
        this.state = {
            rtcStatus: 0,
            liftStatus: 0,
            billNumber: billDao.unpaiedBillNumber
        }
    }

    checkRtcStatus() {
        reactBridge.sendMainMessage(40001, null);
    }

    changeRtcStatus(data) {
        if(this.state.rtcStatus!=data.rtcStatus){
          this.state.rtcStatus = data.rtcStatus;
          this.setState(this.state);
        }
    }

    appendCallImage(data){
      LockHistoryDao.appendImage(data.imageUuid,data.imageUrl);
    }

    changeLiftStatus(data) {
      if(this.state.liftStatus != data.liftStatus){
        this.state.liftStatus = data.liftStatus;
        this.setState(this.state);
        if(data.liftStatus==10){
          //toastX(MSG_LIFT_IN);
          this.openLiftSwitchDirectly();
        }else{
          toastX(MSG_LIFT_OUT);
        }
      }
    }

    changeBillProfile(data) {
        this.state.billNumber = billDao.unpaiedBillNumber;
        this.setState(this.state);
    }

    /**
     *当此组件中显示完成后，注册事件侦听，当公告信息产生变化时，更新显示
     */
    componentDidMount() {
        let _this = this;
        this.subscription1 = DeviceEventEmitter.addListener('reactSendImSuccess', (data)=>toastX('send im success')); //注册一个reactSendImSuccess消息，触发该消息时提示
        this.subscription2 = DeviceEventEmitter.addListener('reactSendImFailed', (data)=>toastX('send im failed')); //注册一个reactSendImSuccess消息，触发该消息时提示
        this.subscription3 = DeviceEventEmitter.addListener('changeRtcStatus', (data)=>this.changeRtcStatus(data)); //注册一个changeRtcStatus消息，触发该消息时提示
        this.subscription4 = DeviceEventEmitter.addListener('changeLiftStatus', (data)=>this.changeLiftStatus(data)); //注册一个changeLiftStatus消息，触发该消息时提示
        this.subscription5 = DeviceEventEmitter.addListener('changeBillProfile', (data)=>this.changeBillProfile(data)); //注册一个changeBillProfile消息，触发该消息时提示
        this.subscription6 = DeviceEventEmitter.addListener('onCallFailed', (data)=>this.onCallFailed(data)); //呼叫门禁设备失败
        this.subscription7 = DeviceEventEmitter.addListener('onTalkFailed', (data)=>this.onTalkFailed(data)); //呼叫室内机设备失败

        JPushModule.addReceiveCustomMsgListener((message) => {
            _this.pushMessageHandle(message);
        });
        JPushModule.addReceiveNotificationListener((message) => {
            _this.pushMessageHandle(message);
        });
        this.checkRtcStatus();
    }

    /**
     *组件删除后，一并删除事件侦听
     */
    componentWillUnmount() {
        this.subscription1.remove(); //页面销毁时注销消息事件
        this.subscription2.remove(); //页面销毁时注销消息事件
        this.subscription3.remove(); //页面销毁时注销消息事件
        this.subscription4.remove(); //页面销毁时注销消息事件
        this.subscription5.remove(); //页面销毁时注销消息事件
        this.subscription6.remove();
        this.subscription7.remove();
        JPushModule.removeReceiveCustomMsgListener();
        JPushModule.removeReceiveNotificationListener();
    }

    pushMessageHandle(message) {
        let parameter = message;
        message = message.extras;
        if (Object.prototype.toString.call(message) === "[object String]") {
            message = JSON.parse(message);
        }
        if (message) {
            if (message.command == "bill") {
                accountDao.initBillData();
            } else if (message.command == "notice") {
                accountDao.initNoticeData();
            } else if (message.command == "unitVerify") {
                accountDao.refreshApplicationData();
            } else if (message.command == "useCoupon") {
                DeviceEventEmitter.emit('useCoupon',message);
            } else {
            }
        }
    }

    /**
     * 呼叫门禁机连接失败
     */
    onCallFailed(){
        toastX(MSG_CALL_FAILED);
    }

    /**
     * 呼叫室内机连接失败
     */
    onTalkFailed(){
        toastX(MSG_TALK_FAILED);
    }

    /**
     *打开门禁列表，直接开门
     */
    openLockScreen() {
        if (this.state.rtcStatus == 10) {
            this.openScreenWithAuth('LockScreen');
        } else {
            toastX(MSG_NO_RTC);
        }
    }

    /**
     *打开访客通行页面
     */
    openVisitorAccessScreen() {
        this.openScreenWithUnit('VisitorAccessScreen');
    }

    /**
     *打开开门记录页面
     */
    openLockHistoryScreen() {
        this.openScreenWithUnit('LockHistoryScreen');
    }

    /**
     *打开物业公告页面
     */
    openNoticeScreen() {
        this.openScreenWithUnit('NoticeScreen');
    }

    /**
     *打开物业费用页面
     */
    openBillScreen() {
        this.openScreenWithUnit('BillScreen');
    }

    /**
     *打开房屋选择页面
     */
    openUnitSwitchScreen() {
        this.openScreenWithUnit('UnitSwitchScreen');
    }

    /**
     *打开房屋申请页面
     */
    openUnitApplicationScreen() {
        this.openScreenWithAuth('UnitApplicationScreen');
    }

    /**
     *打开房屋列表页面，自己所有的房屋
     */
    openUnitScreen() {
        this.openScreenWithAuth('UnitScreen');
    }

    /**
     *打开房屋车辆页面
     */
    openUnitCarScreen() {
        this.openScreenWithUnit('UnitCarScreen');
    }

    /**
     *打开房屋选择列表
     */
    openNoticeScreen() {
        this.openScreenWithUnit('NoticeScreen');
    }

    /**
     *打开投诉建议列表
     */
    openAdviceScreen() {
        this.openScreenWithUnit('AdviceScreen');
    }

    /**
     *打开维修申报列表
     */
    openTroubleScreen() {
        this.openScreenWithUnit('TroubleScreen');
    }

    /**
     *打开联系物业列表
     */
    openContactScreen() {
        this.openScreenWithUnit('ContactScreen');
    }

    /**
     *打开登录页面
     */
    openLoginScreen() {
        this.openScreenWithUnit('LoginScreen');
    }

    /**
     *打开登录页面
     */
    openLoginScreen() {
        this.openScreenWithUnit('LoginScreen');
    }

    /**
     *打开社区论坛页面
     */
    openForumScreen() {
        this.openScreenWithUnit('ForumScreen');
    }

    openMoreScreen() {
      toastX(MSG_MORE_FUNCTION);
    }

    openFamilyDeviceScreen(){
      if (this.state.rtcStatus == 10) {
          if(accountDao.userInfo.rid>0){
              if(accountDao.currentUnit){
                  this.openFamilyDeviceScreenDirectly();
              }else{
                  if(accountDao.unitList.length>0){
                      this.openScreen('UnitSwitchScreen');
                  }else{
                      this.openScreen('UnitApplicationScreen');
                  }
              }
          }else{
              this.openScreen('LoginScreen');
          }
      } else {
          toastX(MSG_NO_RTC);
      }
    }

    openFamilyDeviceScreenDirectly(){
      let _this=this;
      deviceDao.init(function(result){
        if(deviceDao.list.length==0){
          toastX('no device');
        }else if(deviceDao.list.length==1){
          let deviceMac=deviceDao.list[0].deviceMac;
          deviceMac=deviceMac.replace(/\:/g,'');
          reactBridge.sendMainMessage(50001, deviceMac);
        }else{
          _this.openScreen('DeviceScreen',{
            type:'F'
          });
        }
      });
    }

    /*openLiftSwitchIOS(){
        UDPClientBridge.write("测试测试",function(){
            let err = arguments[0];
            let result = arguments[1];
            toast("获得返回结果：err:"+err+",result："+result);
        });
    }*/

    openLiftSwitch(){
      if (this.state.liftStatus == 10) {
          this.openLiftSwitchDirectly();
      } else {
          toastX(MSG_NO_LIFT);
      }
    }
    /**
     *
     * 电梯开关
     */
    openLiftSwitchDirectly() {
        Promise.resolve()
            .then(function(){
                return new Promise(function(resolve,reject){
                    // let privilege = {rid:"123",lifts:[{sn:1,floors:"2,3,4"}],directArrival:0};
                    // 获取用户电梯权限
                    accountDao.loadLiftPrivilege(function(err,privilege){
                        if(err){
                            return reject(err.message);
                        }
                        if(!privilege){
                            return reject("对不起，未获得电梯权限");
                        }
                        resolve(privilege);
                    });
                });
            })
            .then(function (privilege) {
                // 读取电梯SN
                return new Promise(function (resolve, reject) {
                    UDPClientBridge.write("A002SNB", function(err, data) {
                        if (err) {
                            return reject(err);
                        }
                        // 返回数据长度
                        let len = parseInt(data.substring(1, 4));
                        let content = data.substring(4, len + 4);
                        // sn码
                        let sn = content.substring(2, content.length - 6);
                        sn = parseInt(sn)+"";
                        // 校验码
                        let code = content.substring(content.length - 6, content.length);
                        resolve([privilege,sn,code]);
                    });
                })
            })
            .then(function (data) {
                let privilege = data[0];
                let sn = data[1];
                let code = data[2];
                // 开启电梯
                // 发送获取SN、以及读取的用户权限请求电梯授权
                let lift = _.findWhere(privilege.lifts, {sn: sn});
                if (!lift) {
                    return Promise.reject("未设置电梯权限");
                }
                let uid = privilege.rid;
                // 10位用户编码
                let userCode = supplement("",uid,10);
                // 是否直达
                let directArival = privilege.directArrival;
                // 楼层
                let floors = lift.floors;

                if(!floors){
                    return Promise.reject("未设置电梯权限");
                }
                let sumFloors = sumFloor(floors);
                floors = resolveFloors(floors);
                // 将权限解析为指令
                let cmd = "";
                // 发送内容
                let content = "";
                // 乘梯指令
                content = content+"IN";
                // 直达
                content = content + directArival;
                content = content + userCode;
                // 可用电梯
                content = content + floors;
                // 校验码
                content = content + ""+supplement("",sumFloors+sumCode(code),3);

                let contentLen = supplement("",content.length,3);
                // 起始位
                cmd = cmd + "A";
                // content长度
                cmd = cmd + contentLen;
                // content
                cmd = cmd + content;
                // 结束位
                cmd = cmd + "B";
                return new Promise(function(res,rej){
                    UDPClientBridge.write(cmd, function(err, data) {
                        if(err){
                            return rej(err);
                        }
                        res(data);
                    });
                });
            })
            .then(function(data){
                // 解析返回结果 A004INOKB
                let len = parseInt(data.substr(1,3));
                // 取内容
                data = data.substr(4,len);
                // 取OK
                let result = data.substr(2,data.length-2).toUpperCase();
                if("OK" == result){
                   toast("电梯开启成功");
                }else{
                    Promise.reject("电梯响应失败："+result);
                }
            })
            .catch(function (err) {
              toast("电梯开启失败："+err);
            });
    }

    render() {
        return (
            <View style={MainStyle.subScreen}>
                <ScrollView>
                    <AdsBanner name='main' size={{width:200,height:100}} startRefresh delay={5}
                               onSubComponentPress={()=>this.openUnitSwitchScreen()}>
                    </AdsBanner>
                    <NoticeBar onPress={()=>this.openNoticeScreen()}/>
                    <View style={{paddingTop:16,justifyContent:'flex-start'}}>
                        <View
                            style={{flexDirection:'row',alignItems:'center',borderBottomColor:'#F2F2F2',borderBottomWidth:1}}>
                            <MenuButton
                                style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}}
                                title={'LockScreen'} icon="menjinguan"
                                iconColor={this.state.rtcStatus==10?'#45c962':'#cacaca'}
                                onPress={()=>this.openLockScreen()}/>
                            <MenuButton
                                style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}}
                                title={'lift switch'} icon="icon_lift" iconColor={this.state.liftStatus==10?'#43b5ff':'#cacaca'}
                                onPress={()=>this.openLiftSwitch()}/>
                            <MenuButton
                                style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}}
                                title={'VisitorAccessScreen'} icon="fangketongxing" iconColor="#ffc522"
                                onPress={()=>this.openVisitorAccessScreen()}/>
                            <MenuButton style={{flex:1,height:menuHeight,width:menuWidth}} title={'LockHistoryScreen'}
                                        icon="lishijilu" iconColor="#ff7967"
                                        onPress={()=>this.openLockHistoryScreen()}/>
                        </View>
                        <View
                            style={{flexDirection:'row',alignItems:'center',borderBottomColor:'#F2F2F2',borderBottomWidth:1}}>
                            <MenuButton
                                style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}}
                                title={'BillScreen'} badge={this.state.billNumber} icon="jiaofei"
                                iconColor="#ffc522" onPress={()=>this.openBillScreen()}/>
                            <MenuButton
                                style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}}
                                title={'UnitScreen'} icon="icon-test" iconColor="#43b5ff"
                                onPress={()=>this.openUnitScreen()}/>
                            <MenuButton
                                style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}}
                                title={'UnitCarScreen'} icon="cheliangxinxi" iconColor="#45c962"
                                onPress={()=>this.openUnitCarScreen()}/>
                            <MenuButton style={{flex:1,height:menuHeight,width:menuWidth}}
                                title={'AdviceScreen'}
                                        icon="yishengjianyi" iconColor="#ffc522"
                                        onPress={()=>this.openAdviceScreen()}/>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                          <MenuButton
                              style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}}
                              title={'TroubleScreen'} icon="zhuanyeweixiu" iconColor="#ff7967"
                              onPress={()=>this.openTroubleScreen()}/>
                            <MenuButton
                                style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}}
                                title={'ContactScreen'} icon="iconfontzhizuobiaozhun0258" iconColor="#45c962"
                                onPress={()=>this.openContactScreen()}/>
                            <MenuButton style={{flex:1,height:menuHeight,width:menuWidth,borderRightColor:'#F2F2F2',borderRightWidth:1}} title={'ForumScreen'}
                                        icon="luntan" iconColor="#ff7967" onPress={()=>this.openForumScreen()}/>
                            {/* <MenuButton style={{flex:1,height:menuHeight,width:menuWidth}} title={'more'}
                                        icon="gengduo" iconColor="#cacaca" onPress={()=>this.openMoreScreen()}/> */}
                            <MenuButton style={{flex:1,height:menuHeight,width:menuWidth}} title={'family intercom'}
                                        icon="duijiangjiankong" iconColor={this.state.rtcStatus==10?'#43b5ff':'#cacaca'} onPress={()=>this.openFamilyDeviceScreen()}/>
                        </View>
                    </View>
                </ScrollView>

            </View>
        );
    }
}
