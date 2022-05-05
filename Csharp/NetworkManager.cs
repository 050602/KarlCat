using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Text;
using UnityEngine;
using System.Timers;
using Updatable;
using Newtonsoft.Json;

public class NetworkManager  :IFixedUpdatable
{
    private static NetworkManager _instance;

    public static NetworkManager Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new NetworkManager();
            }

            return _instance;
        }
    }
    
    /// <summary>
    /// 当前socket
    /// </summary>
    private NetworkChild nowSocket;

    /// <summary>
    /// 路由数组
    /// </summary>
    private List<string> route = new List<string>();

    /// <summary>
    /// 缓存的消息列表
    /// </summary>
    private List<SocketMsg> msgCache = new List<SocketMsg>();

    private object lockObj = new object();

    /// <summary>
    /// route消息列表的md5
    /// </summary>
    private string md5 = "";

    /// <summary>
    /// 断开socket连接
    /// </summary>
    public void DisConnect()
    {
        if (nowSocket != null)
        {
            nowSocket.DisConnect();
        }

        lock (lockObj)
        {
            msgCache.Clear();
        }
    }

    /// <summary>
    /// 连接服务器
    /// </summary>
    /// <param name="host">ip</param>
    /// <param name="port">端口</param>
    public void Connect(string host, int port)
    {
        DisConnect();
        nowSocket = new NetworkChild();
        nowSocket.Connect(host, port);
    }

    /// <summary>
    /// 发送消息
    /// </summary>
    /// <param name="cmd">路由名称</param>
    /// <param name="data">数据</param>
    public void SendMsg(int mainKey, int sonKey, Puerts.ArrayBuffer data)
    {
        // int cmdIndex = route.IndexOf(cmd);
        // if (cmdIndex == -1)
        // {
        //     Debug.Log("cmd not exists: " + cmd);
        //     return;
        // }
        // if (nowSocket == null)
        // {
        //     Debug.Log("socket is null");
        //     return;
        // }
        // string msg;
        // if (data == null)
        // {
        //     msg = "null";
        // }
        // else
        // {
        //     msg = JsonUtility.ToJson(data);
        // }
        Log.gzaLog("SendMsg", mainKey, sonKey);
        // var msg = JsonConvert.SerializeObject(data);
        nowSocket.Send(mainKey, sonKey, data);
    }

    /// <summary>
    /// 读取消息
    /// </summary>
    public void ReadMsg()
    {
        lock (lockObj)
        {
            if (msgCache.Count > 0)
            {
                SocketMsg msg = msgCache[0];
                Log.gzaLog("ReadMsg", msgCache.Count, msg.mainKey, msg.sonKey);
                msgCache.RemoveAt(0);
                EventCenter.Instance.eventProtobuf(msg.mainKey, msg.sonKey, msg.msg);
            }
        }
    }

    public void FixedUpdate(float deltaTime)
    {
        ReadMsg();
    }

    #region 私有类

    private class NetworkChild
    {
        /// <summary>
        /// 原生socket
        /// </summary>
        private Socket mySocket;

        /// <summary>
        /// 是否已被弃用
        /// </summary>
        private bool isDead;

        /// <summary>
        /// 心跳
        /// </summary>
        private System.Timers.Timer heartbeatTimer;

        /// <summary>
        /// 心跳回应超时
        /// </summary>
        private System.Timers.Timer heartbeatTimeoutTimer;

        enum ReadType
        {
            /// <summary>
            /// 头部
            /// </summary>
            head,

            /// <summary>
            /// 部分关键信息
            /// </summary>
            some,

            /// <summary>
            /// 具体消息
            /// </summary>
            msg,
        }

        public void DisConnect()
        {
            Log.gzaLog("DisConnect");
            if (!isDead)
            {
                Instance.nowSocket = null;
                isDead = true;
                if (heartbeatTimer != null)
                {
                    heartbeatTimer.Enabled = false;
                    heartbeatTimer.Dispose();
                }

                if (heartbeatTimeoutTimer != null)
                {
                    heartbeatTimeoutTimer.Enabled = false;
                    heartbeatTimeoutTimer.Dispose();
                }

                try
                {
                    mySocket.Shutdown(SocketShutdown.Both);
                    mySocket.Close();
                }
                catch (Exception e)
                {
                    Debug.Log(e);
                }
            }
        }

        public void Send(int mainKey, int sonKey, Puerts.ArrayBuffer data)
        {
            Log.gzaLog("Send", mainKey, sonKey);
            var databyte = BufferUtil.ToBytes(data);
            byte[] bytes = Encode(mainKey, sonKey, databyte);
            Log.gzaLog("Send=", mainKey, sonKey, bytes.Length);
            try
            {
                mySocket.BeginSend(bytes, 0, bytes.Length, SocketFlags.None, null, null);
            }
            catch (Exception e)
            {
                Debug.Log(e);
                SocketClose();
            }
        }

        public void Connect(string host, int port)
        {
            try
            {
                mySocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                mySocket.BeginConnect(host, port, AsyncConnectCallback, mySocket);
            }
            catch (Exception e)
            {
                Debug.Log(e);
                SocketClose();
            }
        }

        private void AsyncConnectCallback(IAsyncResult result)
        {
            try
            {
                // 异步写入结束 
                mySocket.EndConnect(result);
                Recive();
                Log.gzaLog(" 握手");
                // 握手
                Proto_Handshake_req msgReq = new Proto_Handshake_req();
                msgReq.md5 = Instance.md5;
                byte[] byteMsg = Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(msgReq));
                byte[] byteEnd = new byte[5 + byteMsg.Length];
                int msgLen = byteMsg.Length + 1;
                int index = 0;
                byteEnd[index++] = (byte) (msgLen >> 24 & 0xff);
                byteEnd[index++] = (byte) (msgLen >> 16 & 0xff);
                byteEnd[index++] = (byte) (msgLen >> 8 & 0xff);
                byteEnd[index++] = (byte) (msgLen & 0xff);
                byteEnd[index++] = 2 & 0xff;
                byteMsg.CopyTo(byteEnd, index);
                Log.gzaLog("握手发送");
                mySocket.BeginSend(byteEnd, 0, byteEnd.Length, SocketFlags.None, null, null);
            }
            catch (Exception e)
            {
                Debug.Log(e);
                SocketClose();
            }
        }

        private byte[] Encode(int mainKey, int sonKey, byte[] byteMsg)
        {
            // byte[] byteMsg = Encoding.UTF8.GetBytes(data);
            if (byteMsg == null)
            {
                byteMsg = new byte[0];
            }

            byte[] byteEnd = new byte[byteMsg.Length + 9];

            int len = byteMsg.Length + 5;
            int index = 0;
            byteEnd[index++] = (byte) (len >> 24 & 0xff);
            byteEnd[index++] = (byte) (len >> 16 & 0xff);
            byteEnd[index++] = (byte) (len >> 8 & 0xff);
            byteEnd[index++] = (byte) (len & 0xff);
            byteEnd[index++] = 1;
            byteEnd[index++] = (byte) (mainKey >> 8 & 0xff);
            byteEnd[index++] = (byte) (mainKey & 0xff);
            byteEnd[index++] = (byte) (sonKey >> 8 & 0xff);
            byteEnd[index++] = (byte) (sonKey & 0xff);

            byteMsg.CopyTo(byteEnd, index);
            return byteEnd;
            // List<byte> byteSource = new List<byte>();
            // byteSource.Add((byte)(len >> 24 & 0xff));
            // byteSource.Add((byte)(len >> 16 & 0xff));
            // byteSource.Add((byte)(len >> 8 & 0xff));
            // byteSource.Add((byte)(len & 0xff));
            // byteSource.Add((byte)(1 & 0xff));
            // byteSource.Add((byte)(mainKey >> 8 & 0xff));
            // byteSource.Add((byte)(mainKey & 0xff));
            // byteSource.Add((byte)(sonKey >> 8 & 0xff));
            // byteSource.Add((byte)(sonKey & 0xff));
            // byteSource.AddRange(byteMsg);
            // return byteSource.ToArray();
        }

        private byte[] data = new byte[2 * 1024]; // socket接收字节流
        private ReadType readType = ReadType.head; // 读取消息阶段
        private int msgType = 0; // 消息类型
        private int byteIndex = 0; // 当前字节流写入到哪个位置了
        private byte[] headBytes = new byte[5]; // 头部字节流，固定为5个字节
        private byte[] someBytes = new byte[4]; // 部分关键信息字节流，目前只有自定义消息用到，且固定为2个字节
        private byte[] msgBytes = new byte[0]; // 具体消息字节流

        private void Recive()
        {
            try
            {
                //开始接收数据  
                mySocket.BeginReceive(data, 0, data.Length, SocketFlags.None,
                    asyncResult =>
                    {
                        int length = mySocket.EndReceive(asyncResult);
                        if (readType == ReadType.head)
                        {
                            // Log.gzaLog("头长度", length, headBytes.Length, someBytes.Length, msgBytes);
                            ReadHead(0, length);
                        }
                        else if (readType == ReadType.some)
                        {
                            // Log.gzaLog("zhong 长度", length);
                            ReadSome(0, length);
                        }
                        else if (readType == ReadType.msg)
                        {
                            // Log.gzaLog("msg长度", length);
                            ReadMsg(0, length);
                        }

                        Recive();
                    }, null);
            }
            catch (Exception e)
            {
                Debug.Log(e);
                SocketClose();
            }
        }

        private void ReadHead(int readLen, int length)
        {
            readType = ReadType.head;
            if (readLen >= length)
            {
                return;
            }

            if (length - readLen < headBytes.Length - byteIndex) // 数据未全部到达
            {
                // Log.gzaLog("xxxx222");
                Array.Copy(data, readLen, headBytes, byteIndex, length - readLen);
                byteIndex += length - readLen;
            }
            else // 数据全到达
            {
                Array.Copy(data, readLen, headBytes, byteIndex, headBytes.Length - byteIndex);
                readLen += headBytes.Length - byteIndex;

                int allLen = (headBytes[0] << 24) | (headBytes[1] << 16) | (headBytes[2] << 8) | headBytes[3];
                msgType = headBytes[4];
                Log.gzaLog("msgType", msgType, allLen);
                if (msgType == 1) // 自定义消息
                {
                    msgBytes = new byte[allLen - 5];
                    byteIndex = 0;
                    ReadSome(readLen, length);
                }
                else
                {
                    msgBytes = new byte[allLen - 1];
                    byteIndex = 0;
                    ReadMsg(readLen, length);
                }
            }
        }

        private void ReadSome(int readLen, int length)
        {
            readType = ReadType.some;
            if (readLen >= length)
            {
                return;
            }

            if (length - readLen < someBytes.Length - byteIndex) // 数据未全部到达
            {
                Array.Copy(data, readLen, someBytes, byteIndex, length - readLen);
                byteIndex += length - readLen;
            }
            else // 数据全到达
            {
                Array.Copy(data, readLen, someBytes, byteIndex, someBytes.Length - byteIndex);
                readLen += someBytes.Length - byteIndex;

                byteIndex = 0;
                ReadMsg(readLen, length);
            }
        }

        private void ReadMsg(int readLen, int length)
        {
            readType = ReadType.msg;
            // Log.gzaLog("读消息。。。===", headBytes.Length, msgBytes.Length, someBytes.Length);
            if (msgBytes.Length == 0) // 具体消息长度就是0
            {
                // Log.gzaLog("读消息。。。", msgBytes.Length, someBytes.Length);
                HandleMsg();
                msgBytes = null;

                byteIndex = 0;
                ReadHead(readLen, length);
                return;
            }

            if (readLen >= length)
            {
                return;
            }

            if (length - readLen < msgBytes.Length - byteIndex) // 数据未全部到达
            {
                Array.Copy(data, readLen, msgBytes, byteIndex, length - readLen);
                byteIndex += length - readLen;
            }
            else // 数据全到达
            {
                Array.Copy(data, readLen, msgBytes, byteIndex, msgBytes.Length - byteIndex);
                readLen += msgBytes.Length - byteIndex;
                // Log.gzaLog("消息已到达", msgBytes.Length, someBytes.Length);
                HandleMsg();

                msgBytes = null;

                byteIndex = 0;
                ReadHead(readLen, length);
            }
        }

        private void HandleMsg()
        {
            // Log.gzaLog("HandleMsg", msgType, msgType == 1, headBytes.Length, someBytes.Length, msgBytes.Length);
            if (msgType == 1) // 自定义消息
            {
                int mainKey = (someBytes[0] << 8) + someBytes[1];
                int sonKey = (someBytes[2] << 8) + someBytes[3];
                SocketMsg msg = new SocketMsg();
                msg.mainKey = mainKey;
                msg.sonKey = sonKey;
                // var blist = new Byte[msgBytes.Length - 4];
                // Array.ConstrainedCopy(msgBytes, 0, blist, 0, blist.Length);
                // msg.msg = blist;
                msg.msg = msgBytes;

                Log.gzaLog("HandleMsg2", mainKey, sonKey, headBytes.Length, someBytes.Length, msgBytes.Length, msg.msg);
                pushMsg(msg);
            }
            else if (msgType == 2) // 握手回调
            {
                string tmpStr = Encoding.UTF8.GetString(msgBytes);
                var nstr = JsonConvert.DeserializeObject<Proto_Handshake_rsp>(tmpStr);
                Proto_Handshake_rsp handshakeMsg = nstr;
                DealHandshake(handshakeMsg);
            }
            else if (msgType == 3) // 心跳回调
            {
                if (heartbeatTimeoutTimer != null)
                {
                    heartbeatTimeoutTimer.Stop();
                }
            }
        }

        private void DealHandshake(Proto_Handshake_rsp msg)
        {
            if (msg.heartbeat > 0)
            {
                heartbeatTimer = new System.Timers.Timer();
                heartbeatTimer.Elapsed += SendHeartbeat;
                heartbeatTimer.Interval = msg.heartbeat * 1000;
                heartbeatTimer.Enabled = true;

                heartbeatTimeoutTimer = new System.Timers.Timer();
                heartbeatTimeoutTimer.Elapsed += HeartbeatTimeout;
                heartbeatTimeoutTimer.AutoReset = false;
                heartbeatTimeoutTimer.Interval = 4 * 1000;
            }

            Instance.md5 = msg.md5;
            // if (msg.route != null)
            // {
            //     route = new List<string>();
            //     for (int i = 0; i < msg.route.Length; i++)
            //     {
            //         route.Add(msg.route[i]);
            //     }
            // }
            Log.gzaLog("SocketOnOpen");
            EventCenter.Instance.eventFunc(TSEvent.SocketOnOpen);
        }

        private void SendHeartbeat(object source, ElapsedEventArgs e)
        {
            Log.gzaLog("SendHeartbeat");
            // 心跳
            byte[] bytes = new byte[5];
            bytes[0] = 1 >> 24 & 0xff;
            bytes[1] = 1 >> 16 & 0xff;
            bytes[2] = 1 >> 8 & 0xff;
            bytes[3] = 1 & 0xff;
            bytes[4] = 3 & 0xff;
            try
            {
                mySocket.BeginSend(bytes, 0, bytes.Length, SocketFlags.None, null, null);
                heartbeatTimeoutTimer.Start();
            }
            catch (Exception e1)
            {
                Debug.Log(e1);
                SocketClose();
            }
        }

        private void HeartbeatTimeout(object source, ElapsedEventArgs e)
        {
            SocketClose();
        }

        private void SocketClose()
        {
            if (!isDead)
            {
                Log.gzaLog("SocketOnClose");
                EventCenter.Instance.eventFunc(TSEvent.SocketOnClose);
                DisConnect();
            }
        }

        private void pushMsg(SocketMsg msg)
        {
            lock (Instance.lockObj)
            {
                Log.gzaLog("pushMsg", msg.mainKey, msg.sonKey);
                Instance.msgCache.Add(msg);
            }
        }
    }

    /// <summary>
    /// 自定义消息
    /// </summary>
    private class SocketMsg
    {
        public int mainKey;
        public int sonKey;
        public byte[] msg;
    }

    /// <summary>
    /// 握手消息
    /// </summary>
    [Serializable]
    private class Proto_Handshake_req
    {
        public string md5 = "";
    }

    /// <summary>
    /// 握手消息
    /// </summary>
    [Serializable]
    private class Proto_Handshake_rsp
    {
        public float heartbeat = 0;

        public string md5 = "";
        // public string[] route = null;
    }

    #endregion
}