# KalrCat
卡尔猫，基于开源Nodejs服务端框架 Mydog 魔改而成  

使用了Protobuf 作为 协议传输工具

使用MongoDB 作为 数据库

使用kL的开源配置工具--目前没有示例在卡尔猫
https://github.com/gh-kL/GameConfig

Base Mydog remould , NodeJS Server 

Protobuf is used as a protocol tool
Used MongonDB
Used kL GameConfig Tools

# Mydog Home
https://www.mydog.wiki

https://github.com/ahuangege/mydog

# How to use

need insatll NPM Package : protobufjs  typescript  ws

you can run :  npm i

and run this code  by Terminal
```bash
npm start
```

client is Csharp , In this "Csharp" folder

the  NetworkManager.cs , use his Function  "Send"  to  KalrCat   

# 需要注意的两个点
1.npm start 实际上是把代码编译到dist, 其中 proto下的文件夹protobuf文件夹的内容并不会跟随tsc 一起编译过去，需要自己手动拖到dist上面

PS:其实这个卡尔猫源码，我自己都没执行过，因为又要装库到文件夹下，嫌麻烦，有问题直接找我

# Contact the Me
Add QQ : 441829663

### QQ Group

* 866134350 [![KalrCat-服务端框架](https://pub.idqqimg.com/wpa/images/group.png)](https://jq.qq.com/?_wv=1027&k=Awf8ZCbt)
