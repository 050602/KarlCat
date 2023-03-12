# KarlCat
### 18岁亦菲！
version : 2.3.6
卡尔猫，基于开源Nodejs服务端框架 Mydog 魔改而成 

基本使用TypeScript开发，仅有个别类库使用js , dist目录是通过src目录编译出来的js

目前支持使用TCP KCP WebSocket 协议

使用了Protobuf 作为 协议传输工具

使用MongoDB 作为 数据库

使用kL的开源配置工具--目前没有示例在卡尔猫
https://github.com/gh-kL/GameConfig

Base Mydog remould , NodeJS Server 

Protobuf is used as a protocol tool

Used MongonDB

Used kL GameConfig Tools--but not demo in karlCat

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
