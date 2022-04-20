
let isDebug = true;

export let gzaLog = (...data: any[]) => {
  // return;
  if (!isDebug) {
    return;
  }
  console.log(...data, "\n", getTrack());
  // console.trace(...data)
};

export let warningLog = (...data: any[]) => {
  if (!isDebug) {
    return;
  }
  console.warn(...data, "\n", new Error().stack);
};
export let errLog = (...data: any[]) => {
  if (!isDebug) {
    return;
  }
  console.error(...data, "\n", new Error().stack);
};


const ENABLE_HYPERLINK = true;

function getTrack() {
  //捕获当前输出的堆栈信息(前三行为此处代码调用的堆栈, 去除后输出)
  let trackInfos = new Error().stack?.replace(/\r\n/g, "\n").split("\n").slice(3);
  if (trackInfos && trackInfos.length > 0) {
    if (ENABLE_HYPERLINK) {
      //1.匹配函数名(可选)    /**([a-zA-z0-9#$._ ]+ \()? */
      //2.匹配文件路径        /**([a-zA-Z0-9:/\\._ ]+(.js|.ts))\:([0-9]+)\:([0-9]+) */
      let regex = /at ([a-zA-z0-9#$._ ]+ \()?([a-zA-Z0-9:/\\._ ]+(.js|.ts))\:([0-9]+)\:([0-9]+)\)?/g;

      for (let i = 0; i < trackInfos.length; i++) {
        regex.lastIndex = 0;

        let match = regex.exec(trackInfos[i]);
        if (!match)
          continue;

        let path = match[2], line = match[4] ?? "0", column = match[5] ?? "0";
        let search = `${path}:${line}:${column}`;

        trackInfos[i] = trackInfos[i].replace(search, `<a href="${path.replace(/\\/g, "/")}" line="${line}" column="${column}">${search}</a>`);
      }
    }
    return trackInfos.join("\n");
  }
  return "";
};


