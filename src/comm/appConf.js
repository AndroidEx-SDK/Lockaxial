/**
*APP端的配置信息
*/
import Auth from '../auth/baseAuth';
//import Auth from '../auth/skyworthAuth';

export default AppConf={
  //APPLICATION_SERVER:'http://192.168.0.6:3000', //服务器连接地址
  //APPLICATION_SERVER:'https://zhsq00.sz.doubimeizhi.com', //创维服务器服务器连接地址
  //APPLICATION_SERVER:'http://residential.nodepointech.com', //测试服务器连接地址
  //APPLICATION_SERVER:'http://changbo.nodepointech.com', //测试服务器连接地址
  APPLICATION_SERVER:'https://production.nodepointech.com', //测试服务器连接地址

  APPLICATION_ADS_DATA:{ //默认APP广告数据
    main: [{img:require('../image/bannerFirst.jpg'),url:'www.nodepoint.cn'},{img:require('../image/bannerSecond.jpg'),url:'www.nodepoint.cn'}]
  }
}

const auth=new Auth();
export {auth};
