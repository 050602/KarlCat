# KarlCat
### 18岁亦菲！
version : 2.4.1
卡尔猫，基于开源Nodejs服务端框架 Mydog 魔改而成 

nodejs一把梭，当你还在苦苦为其他语言的各种特性考虑时，用NodeJs早已上线验证了
想要学习后端思维，可以先用Nodejs这个较低技术学习成本的东西跑一遍，游戏后端的思想是相似的，只要学会了KarlCat，转换到其他语言框架，经验也能用得上，懂我意思吧？听懂掌声，来给star谢谢


基本使用TypeScript开发，仅有个别类库使用js , dist目录是通过src目录编译出来的js

目前支持使用TCP KCP WebSocket 协议

使用了Protobuf 作为 协议传输工具

使用MongoDB 作为 数据库

使用kL的开源配置工具--目前没有示例在卡尔猫
https://github.com/gh-kL/GameConfig

nodejs---> pomelo ---> pinus ---> mydog ---> karlcat

Base Mydog remould , NodeJS Server 

Protobuf is used as a protocol tool

Used MongonDB

Used kL GameConfig Tools--but not demo in karlCat

# Update
2024/3/4
this update is very more
1.add protobuf SnowDrifting tool
2.change double proto key to  one key
3.migrate ts server config to json server config
4.add some example, database and model,modelLogic
5.add js HotReload , use: HotReload.loadHandler
6.migrate session bind in gate to login server

# Mydog Home
https://www.mydog.wiki

https://github.com/ahuangege/mydog

# How to use
need insatll NPM Package

you can run :  
```bash
npm i
```

and run this code  by Terminal
```bash
npm start
```

client is Csharp , In this "Csharp" folder

the  NetworkManager.cs , use his Function  "Send"  to  KalrCat   

# 需要注意的点
1.npm start 实际上是把代码编译到dist, 其中 proto下的文件夹protobuf文件夹的内容并不会跟随tsc 一起编译过去，需要自己手动拖到dist上面

2.我完全没有使用过ahuang giegie 的cli工具，因此，命令行相关代码，可能存在问题，请自行调试

# Contact the Me
Add QQ : 441829663

### QQ Group

* 866134350 [![KarlCat-服务端框架](https://pub.idqqimg.com/wpa/images/group.png)](https://jq.qq.com/?_wv=1027&k=Awf8ZCbt)
