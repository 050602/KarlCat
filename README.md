# KalrCat
卡尔猫，基于开源Nodejs服务端框架 Mydog 魔改而成  

使用了Protobuf 作为 协议传输工具

Base Mydog remould , NodeJS Server 

Protobuf is used as a protocol tool

# Mydog Home
https://www.mydog.wiki

https://github.com/ahuangege/mydog

# How to use

need insatll NPM Package : protobufjs  typescript  ws

and run this code  by Terminal
```bash
npm start
```

client is Csharp , In this "Csharp" folder

the  Network.cs , use his Function  "Send"  to  KalrCat   

#需要注意的两个点
1.npm start 实际上是把代码编译到dist, 其中 proto下的文件夹protobuf文件夹的内容并不会跟随tsc 一起编译过去，需要自己手动拖到dist上面

2.另外想体验RPC 或者 穿透前端啥的 ，去protoToServerName.ts处，管理mainKey对应的服务器名称


# Contact the Me
Add QQ : 441829663
