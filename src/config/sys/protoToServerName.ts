
export enum ServerName {
    gate = "gate",
    connector = "connector",

}

//能获取到字符串的 主协议，为RPC通讯  即，如果return回来的是Null 则是
export function getNameByMainKey(mainKey: number): string {
    // if (mainKey <= 100) {
    //     return ServerName.gate;
    // } else 
    
    if (mainKey >= 900) {
        return ServerName.connector; 
    }

    // if (mainKey >= 100) {
    //     return ServerName.connector; 
    // }

    return null;
}