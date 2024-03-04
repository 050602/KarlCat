// import { gzaLog } from "../LogTS";
// import { IObjectPool } from "../core/IObjectPool";
// import { ObjectPool } from "../core/ObjectPool";
// import { MapData } from "../servers/Fight/map/MapData";
// /**
//  * 可走标识
//  */
// export let PATH_FLAG = true;
// class PathInfo implements IObjectPool {
//     x: number;
//     y: number;
//     /**
//      * 周围节点
//      */
//     links: PathInfo[] = [];
//     parent: PathInfo;
//     // constructor(nowPos: any, parent: PathInfo) {
//     //     this.dataInit(nowPos, parent);
//     // }
//     inPool: boolean;
//     onRecycled(): void {
//         // for (let i = 0; i < this.links.length; i++) {
//         //     ObjectPool.recycle(this.links[i]);
//         // }
//         this.links = [];
//         this.parent = null
//     }
//     // dataInit(nowPos: PathInfo, parent: PathInfo) {
//     //     this.x = nowPos.x;
//     //     this.y = nowPos.y;
//     //     // this.links = [];
//     //     this.parent = parent;
//     // };
// }
// //垂直版本JPSPlus
// export class JPSPlus {
//     // public static mapWidth: number = 0;
//     // public static mapHeight: number = 0;
//     // public static init(mapWidth: number, mapHeight: number) {
//     //     mapHeight = mapHeight;
//     //     mapWidth = mapWidth;
//     // }
//     public static find(mapData: MapData, mapWidth: number, mapHeight: number, map: boolean[], startX: number, startY: number, endX: number, endY: number): number[] {
//         // jumpPointXY.clear();
//         let jumpPointXY: Map<number, number[]> = new Map();
//         let open: PathInfo[] = [];
//         let close: Map<number, boolean> = new Map();
//         let tempMap = map.concat([]);
//         let index1 = mapWidth * startY + startX;
//         tempMap[index1] = true;
//         // tempMap = tempMap;
//         // endX = endX;
//         // endY = endY;
//         // open = [];
//         // close.clear();
//         let index2 = mapWidth * endY + endX;
//         jumpPointXY.set(index2, [endX, endY]);
//         jumpPointXY.set(index1, [startX, startY]);
//         let arr = this.findReal(mapData, mapWidth, mapHeight, map, tempMap, jumpPointXY, open, close, startX, startY, endX, endY, false);
//         for (let i = 0; i < open.length; i++) {
//             ObjectPool.recycle(open[i]);
//         }
//         return arr;
//     }
//     // private static isPassable(mapData: MapData, mapWidth: number, mapHeight: number, map: boolean[], tempMap: boolean[], jumpPointXY: Map<number, number[]>, open: PathInfo[], close: Map<number, boolean>, startX: number, startY: number, endX: number, endY: number): boolean {
//     //     let path = this.findReal(mapData, mapWidth, mapHeight, map, tempMap, jumpPointXY, open, close, startX, startY, endX, endY, true);
//     //     if (path && path.length)
//     //         return true;
//     //     return false;
//     // }
//     // private static jumpPointXY: Map<number, number[]> = new Map();
//     // private static tempMap: boolean[];
//     // private static endX: number = 0;
//     // private static endY: number = 0;
//     // private static startX: number = 0;
//     // private static startY: number = 0;
//     // private static close: Map<number, boolean> = new Map();
//     // private static open: PathInfo[];
//     //从起点开始搜索
//     private static findReal(mapData: MapData, mapWidth: number, mapHeight: number, map: boolean[], tempMap: boolean[], jumpPointXY: Map<number, number[]>, open: PathInfo[], close: Map<number, boolean>, startX: number, startY: number, endX: number, endY: number, isTwo = false): number[] {
//         // let path = new PathInfo({ x: startX, y: startY }, null);
//         let path = ObjectPool.get(PathInfo);
//         path.x = startX;
//         path.y = startY;
//         let index1 = mapWidth * endY + endX;
//         if (!map[index1]) {
//             if (!isTwo) {
//                 if (Math.abs(startX - endX) + Math.abs(startY - endY) <= 1) {
//                     return null;
//                 }
//                 let replace = this.findNearest(mapWidth, mapHeight, map, startX, startY, endX, endY);
//                 if (replace) {
//                     for (let i = 0; i < replace.length; i++) {
//                         let XY = mapData.getXYByIndex(replace[i]);
//                         let newReturn = this.findReal(mapData, mapWidth, mapHeight, map, tempMap, jumpPointXY, open, close, startX, startY, XY[0], XY[1], true);
//                         if (newReturn != null) {
//                             // newReturn = JPSPlus.pruning2(tempMap, newReturn);
//                             return newReturn;
//                         }
//                     }
//                 }
//             }
//             gzaLog("JPSPlus 未找到出口1");
//             return null;
//         }
//         open.push(path);
//         let canRunPath: number[][] = [];
//         let runCount: number = 0;
//         while (true) {
//             runCount++;
//             if (canRunPath.length > 3 || (canRunPath.length > 1 && runCount > 100) || !open.length) {
//                 if (canRunPath.length) {
//                     canRunPath.sort((a: number[], b: number[]) => {
//                         return a.length - b.length
//                     });
//                     // log("JPS运行次数", runCount);
//                     return canRunPath[0];
//                 }
//                 return null;
//             }
//             let nowPath: PathInfo = open[0];
//             // let pppp = "";
//             // for (let i = 0; i < open.length; i++) {
//             //     pppp += open[i].x + "_" + open[i].y + "  ";
//             // }
//             // log("pppp", pppp);
//             open.splice(0, 1); //清除已经走过的格子
//             close.set(nowPath.x * 1000 + nowPath.y, true);
//             if (nowPath.x == endX && nowPath.y == endY) {
//                 let path = JPSPlus.reversePath(nowPath);
//                 JPSPlus.pruning(mapData, tempMap, path);
//                 // path = JPSPlus.pruning(tempMap, path);
//                 let newPath = this.JumpPointToFullPath(mapWidth, mapHeight, path);
//                 if (!map[index1]) {
//                     newPath.splice(newPath.length - 1, 1);
//                 }
//                 // gzaLog("JPSPlus path", newPath);
//                 canRunPath.push(newPath);
//                 continue;
//                 // return newPath;
//             }
//             if (!nowPath.links.length) {
//                 JPSPlus.jumpToFind(mapData, mapWidth, mapHeight, tempMap, jumpPointXY, close, nowPath, endX, endY);
//             }
//             let links = nowPath.links;
//             for (let i = 0; i < links.length; i++) {
//                 let line = links[i];
//                 if (line.x == endX && line.y == endY) {
//                     let path = JPSPlus.reversePath(line);
//                     JPSPlus.pruning(mapData, tempMap, path);
//                     // path = JPSPlus.pruning(tempMap, path);
//                     let newPath = this.JumpPointToFullPath(mapWidth, mapHeight, path);
//                     let index1 = mapWidth * endY + endX;
//                     if (!map[index1]) {
//                         newPath.splice(newPath.length - 1, 1);
//                     }
//                     // return newPath;
//                     // gzaLog("JPSPlus path", newPath);
//                     canRunPath.push(newPath);
//                     continue;
//                 }
//                 if (!JPSPlus.openIndexOf(open, line)) {
//                     //判断是否存在open列表
//                     open.push(line);
//                 }
//             }
//             if (!open.length) {
//                 if (canRunPath.length) {
//                     canRunPath.sort((a: number[], b: number[]) => {
//                         return a.length - b.length
//                     });
//                     // log("JPS运行次数==", runCount);
//                     return canRunPath[0];
//                 }
//                 if (!isTwo) {
//                     let replace = this.findNearest(mapWidth, mapHeight, tempMap, startX, startY, endX, endY);
//                     if (replace) {
//                         for (let i = 0; i < replace.length; i++) {
//                             let XY = mapData.getXYByIndex(replace[i]);
//                             let newReturn = this.findReal(mapData, mapWidth, mapHeight, map, tempMap, jumpPointXY, open, close, startX, startY, XY[0], XY[1], true);
//                             if (newReturn != null) {
//                                 return newReturn;
//                             }
//                         }
//                     }
//                 }
//                 gzaLog("JPSPlus 未找到出口2");
//                 return null;
//             }
//         }
//     }
//     private static pruning(mapData: MapData, tempMap: boolean[], arr: number[][]) {
//         //直线剪枝校验
//         if (arr.length < 3) {
//             return;
//         }
//         for (let i = 0; i < arr.length - 2; i++) {
//             let k = i + 2;
//             if (arr[i + 1][0] == arr[k][0]) {
//                 if (JPSPlus.isStraightLine(mapData, tempMap, arr[i], arr[i + 1], arr[k])) {
//                     arr.splice(i + 1, 1);
//                     i--;
//                 }
//             } else if (arr[i + 1][1] == arr[k][1]) {
//                 if (JPSPlus.isStraightLine(mapData, tempMap, arr[i], arr[i + 1], arr[k])) {
//                     arr.splice(i + 1, 1);
//                     i--;
//                 }
//             }
//         }
//     }
//     //判断是否直线
//     private static isStraightLine(mapData: MapData, tempMap: boolean[], nowPos: number[], pos1: number[], pos2: number[]) {
//         let chaX = Math.abs(pos1[0] - pos2[0]);
//         if (chaX > 1) {
//             if (pos2[0] > pos1[0]) {
//                 for (let i = 1; i <= chaX; i++) {
//                     let index = mapData.getIndexByXY(pos2[0] - i, pos1[1]);
//                     if (!tempMap[index]) {
//                         return false;
//                     }
//                 }
//             } else {
//                 for (let i = 1; i <= chaX; i++) {
//                     let index = mapData.getIndexByXY(pos1[0] - i, pos1[1]);
//                     if (!tempMap[index]) {
//                         return false;
//                     }
//                 }
//             }
//             //判断一下，2-27能否直接不需要 3-27，抵达 3-25
//             if (nowPos[0] == pos2[0] || nowPos[1] == pos2[1]) {
//                 return true;
//             }
//         }
//         let chaY = Math.abs(pos1[1] - pos2[1]);
//         if (chaY > 1) {
//             if (pos2[1] > pos1[1]) {
//                 for (let i = 1; i <= chaY; i++) {
//                     let index = mapData.getIndexByXY(pos2[0], pos2[1] - i);
//                     if (!tempMap[index]) {
//                         return false;
//                     }
//                 }
//             } else {
//                 for (let i = 1; i <= chaY; i++) {
//                     let index = mapData.getIndexByXY(pos1[0], pos1[1] - i);
//                     if (!tempMap[index]) {
//                         return false;
//                     }
//                 }
//             }
//             if (nowPos[0] == pos2[0] || nowPos[1] == pos2[1]) {
//                 return true;
//             }
//         }
//         return false;
//     }
//     /**
//      * 检查open是否存在line
//      * @param open
//      * @param line
//      */
//     private static openIndexOf(open: PathInfo[], line: PathInfo) {
//         for (let i = 0; i < open.length; i++) {
//             let tempLine = open[i];
//             if (tempLine.x == line.x && tempLine.y == line.y) {
//                 return true;
//             }
//         }
//         return false;
//     }
//     /**
//      * 把跳点转换回基本坐标
//      * @param paths 坐标路径
//      * @returns indexArr
//      */
//     private static JumpPointToFullPath(mapWidth: number, mapHeight: number, paths: number[][]): number[] {
//         let newPath = [];
//         for (let i = 0; i < paths.length - 1; i++) {
//             let nowPath = paths[i];
//             let nextPath = paths[i + 1];
//             if (nowPath[0] == nextPath[0]) {
//                 //X相同,Y不同
//                 if (nowPath[1] > nextPath[1]) {
//                     //从下往上
//                     for (let k = nowPath[1]; k > nextPath[1]; k--) {
//                         let index = mapWidth * k + nowPath[0];
//                         newPath.push(index);
//                     }
//                 } else {
//                     // 从上往下
//                     for (let k = nowPath[1]; k < nextPath[1]; k++) {
//                         let index = mapWidth * k + nowPath[0];
//                         newPath.push(index);
//                     }
//                 }
//             } else {
//                 //Y相同 X不同
//                 if (nowPath[0] > nextPath[0]) {
//                     //从右往左
//                     for (let k = nowPath[0]; k > nextPath[0]; k--) {
//                         let index = mapWidth * nowPath[1] + k;
//                         newPath.push(index);
//                     }
//                 } else {
//                     // 从左往右
//                     for (let k = nowPath[0]; k < nextPath[0]; k++) {
//                         let index = mapWidth * nowPath[1] + k;
//                         newPath.push(index);
//                     }
//                 }
//             }
//         }
//         let last = paths[paths.length - 1];
//         let lastIndex = mapWidth * last[1] + last[0];
//         newPath.push(lastIndex);
//         return newPath;
//     }
//     /**
//      * 逆推出口
//      * @param endPath
//      */
//     private static reversePath(endPath: PathInfo) {
//         let paths: number[][] = [];
//         let tempPath = endPath;
//         while (tempPath) {
//             paths.unshift([tempPath.x, tempPath.y]);
//             tempPath = tempPath.parent;
//         }
//         // gzaLog(...paths);
//         return paths;
//     }
//     /**
//      * 寻找最近的一个可走格子 只找当前 前后左右  效率对比更高
//      * @param map 路径
//      * @param startX 起点
//      * @param startY 起点
//      * @param endX 终点
//      * @param endY 终点
//      * @returns 最近的可走格子
//      */
//     private static findNearest(mapWidth: number, mapHeight: number, map: boolean[], startX: number, startY: number, endX: number, endY: number): number[] {
//         let arr: any[] = [];
//         let newx = endX + 1;
//         let newy = endY;
//         let index = mapWidth * newy + newx;
//         if (!map[index] || (newx == startX && newy == startY) || (newx == endX && newy == endY)) {
//         } else {
//             let quan = Math.abs(startX - newx) + Math.abs(startY - newy);
//             arr.push({ quan: quan, index: index, x: newx, y: newy });
//         }
//         newx = endX;
//         newy = endY + 1;
//         index = mapWidth * newy + newx;
//         if (!map[index] || (newx == startX && newy == startY) || (newx == endX && newy == endY)) {
//         } else {
//             let quan = Math.abs(startX - newx) + Math.abs(startY - newy);
//             arr.push({ quan: quan, index: index, x: newx, y: newy });
//         }
//         newx = endX - 1;
//         newy = endY;
//         index = mapWidth * newy + newx;
//         if (!map[index] || (newx == startX && newy == startY) || (newx == endX && newy == endY)) {
//         } else {
//             let quan = Math.abs(startX - newx) + Math.abs(startY - newy);
//             arr.push({ quan: quan, index: index, x: newx, y: newy });
//         }
//         newx = endX;
//         newy = endY - 1;
//         index = mapWidth * newy + newx;
//         if (!map[index] || (newx == startX && newy == startY) || (newx == endX && newy == endY)) {
//         } else {
//             let quan = Math.abs(startX - newx) + Math.abs(startY - newy);
//             arr.push({ quan: quan, index: index, x: newx, y: newy });
//         }
//         arr = arr.sort((a: any, b: any) => {
//             return a.quan - b.quan;
//         });
//         if (arr.length) {
//             let arr2 = [];
//             for (let i = 0; i < arr.length; i++) {
//                 arr2.push(arr[i].index);
//             }
//             return arr2;
//         } else {
//             return null;
//         }
//     }
//     /**
//  * 寻找最近的 往各个位置伸展 效率对比更低
//  * @param map
//  * @param startPos
//  * @param endPos
//  * @param deep
//  */
//     private static findNearest2(mapWidth: number, mapHeight: number, map: boolean[], startX: number, startY: number, endX: number, endY: number): number {
//         let chax = endX - startX;
//         let chay = endY - startY;
//         let xcount = Math.abs(chax);
//         let ycount = Math.abs(chay);
//         let xPlus = 0;
//         if (xcount > 0) xPlus = chax / xcount;
//         let yPlus = 0;
//         if (ycount > 0) yPlus = chay / ycount;
//         let arr: any[] = [];
//         // gzaLog("what===", chax, chay, xcount, ycount, xPlus, yPlus);
//         for (let i = 0; i < xcount + 1; i++) {
//             for (let k = 0; k < ycount + 1; k++) {
//                 let newx = startX + xPlus * i;
//                 let newy = startY + yPlus * k;
//                 let index = mapWidth * newy + newx;
//                 // gzaLog("====", newx, newy, index, i + k, map[index]);
//                 if (!map[index] || (newx == startX && newy == startY) || (newx == endX && newy == endY)) {
//                     continue;
//                 }
//                 // gzaLog("222====", newx, newy, index, i + k, map[index]);
//                 let quan = i + k;
//                 arr.push({ quan: quan, index: index });
//             }
//         }
//         arr = arr.sort((a: any, b: any) => {
//             return a.quan - b.quan;
//         });
//         // let arr2 = [];
//         // for (let k = 0; k < arr.length; k++) {
//         //     // let index = mapHeight * arr[k].index + arr[k].index;
//         //     arr2.push(arr[k].index);
//         // }
//         // gzaLog("寻找替代点", ...arr2);
//         if (arr.length) {
//             return arr[0].index;
//         } else {
//             return null;
//         }
//     }
//     //从当前跳点,上下左右寻找,直到找到了下一个跳点
//     private static jumpToFind(mapData: MapData, mapWidth: number, mapHeight: number, tempMap: boolean[], jumpPointXY: Map<number, number[]>, close: Map<number, boolean>, parent: PathInfo, endX: number, endY: number) {
//         let nowX = parent.x;
//         let nowY = parent.y;
//         if (nowX == endX && nowY == endY) {
//             return;
//         }
//         let tagLeft = true;
//         let tagRight = true;
//         let tagUp = true;
//         let tagDown = true;
//         //判断上下左右是否为强迫邻居
//         if (tagRight) {
//             //往右
//             for (let i = nowX + 1; i < mapWidth; i++) {
//                 if (close.has(i * 1000 + nowY)) {
//                     break;
//                 }
//                 if (i == endX && nowY == endY) {
//                     // let path = new PathInfo({ x: i, y: nowY }, parent);
//                     let path = ObjectPool.get(PathInfo);
//                     path.x = i;
//                     path.y = nowY;
//                     path.parent = parent;
//                     parent.links = [path];
//                     return;
//                 }
//                 let index = mapData.getIndexByXY(i, nowY);
//                 if (!tempMap[index]) {
//                     //碰壁,停止继续检索
//                     break;
//                 }
//                 let isjump = JPSPlus.isJumpPoint(mapData, mapWidth, mapHeight, tempMap, jumpPointXY, i, nowY, endX, endY);
//                 if (isjump) {
//                     // let path = new PathInfo({ x: i, y: nowY }, parent);
//                     let path = ObjectPool.get(PathInfo);
//                     path.x = i;
//                     path.y = nowY;
//                     path.parent = parent;
//                     parent.links.push(path);
//                     jumpPointXY.set(index, [i, nowY]);
//                 }
//             }
//         }
//         if (tagLeft) {
//             //往左
//             for (let i = nowX - 1; i >= 0; i--) {
//                 if (close.has(i * 1000 + nowY)) {
//                     break;
//                 }
//                 if (i == endX && nowY == endY) {
//                     // let path = new PathInfo({ x: i, y: nowY }, parent);
//                     let path = ObjectPool.get(PathInfo);
//                     path.x = i;
//                     path.y = nowY;
//                     path.parent = parent;
//                     parent.links = [path];
//                     return;
//                 }
//                 let index = mapData.getIndexByXY(i, nowY);
//                 if (!tempMap[index]) {
//                     //碰壁,停止继续检索
//                     break;
//                 }
//                 let isjump = JPSPlus.isJumpPoint(mapData, mapWidth, mapHeight, tempMap, jumpPointXY, i, nowY, endX, endY);
//                 if (isjump) {
//                     jumpPointXY.set(index, [i, nowY]);
//                     // let path = new PathInfo({ x: i, y: nowY }, parent);
//                     let path = ObjectPool.get(PathInfo);
//                     path.x = i;
//                     path.y = nowY;
//                     path.parent = parent;
//                     parent.links.push(path);
//                 }
//             }
//         }
//         if (tagUp) {
//             //往上
//             for (let i = nowY - 1; i >= 0; i--) {
//                 if (close.has(nowX * 1000 + i)) {
//                     break;
//                 }
//                 if (nowX == endX && i == endY) {
//                     // let path = new PathInfo({ x: nowX, y: i }, parent);
//                     let path = ObjectPool.get(PathInfo);
//                     path.x = nowX;
//                     path.y = i;
//                     path.parent = parent;
//                     parent.links = [path];
//                     return;
//                 }
//                 let index = mapData.getIndexByXY(nowX, i);
//                 if (!tempMap[index]) {
//                     //碰壁,停止继续检索
//                     break;
//                 }
//                 let isjump = JPSPlus.isJumpPoint(mapData, mapWidth, mapHeight, tempMap, jumpPointXY, nowX, i, endX, endY);
//                 if (isjump) {
//                     jumpPointXY.set(index, [nowX, i]);
//                     // let path = new PathInfo({ x: nowX, y: i }, parent);
//                     let path = ObjectPool.get(PathInfo);
//                     path.x = nowX;
//                     path.y = i;
//                     path.parent = parent;
//                     parent.links.push(path);
//                 }
//             }
//         }
//         if (tagDown) {
//             //往下
//             for (let i = nowY + 1; i < mapHeight; i++) {
//                 if (close.has(nowX * 1000 + i)) {
//                     break;
//                 }
//                 if (nowX == endX && i == endY) {
//                     // let path = new PathInfo({ x: nowX, y: i }, parent);
//                     let path = ObjectPool.get(PathInfo);
//                     path.x = nowX;
//                     path.y = i;
//                     path.parent = parent;
//                     parent.links = [path];
//                     return;
//                 }
//                 let index = mapData.getIndexByXY(nowX, i);
//                 if (!tempMap[index]) {
//                     //碰壁,停止继续检索
//                     break;
//                 }
//                 //下一个格子是墙壁,才进行跳点检测,否则继续前行
//                 let isjump = JPSPlus.isJumpPoint(mapData, mapWidth, mapHeight, tempMap, jumpPointXY, nowX, i, endX, endY);
//                 if (isjump) {
//                     jumpPointXY.set(index, [nowX, i]);
//                     // let path = new PathInfo({ x: nowX, y: i }, parent);
//                     let path = ObjectPool.get(PathInfo);
//                     path.x = nowX;
//                     path.y = i;
//                     path.parent = parent;
//                     parent.links.push(path);
//                 }
//             }
//         }
//         //进行剪枝 如果当前跳点，可以直线抵达下一个跳点，该跳点为中间跳点，在搜索的时候，可以把该跳点移出openset,减少搜索次数，
//         for (let i = 0; i < parent.links.length; i++) {
//             let a = parent.links[i];
//             if (a.x == endX && a.y == endY) {
//                 parent.links = [a];
//                 return;
//             }
//         }
//     }
//     private static isJumpPoint(mapData: MapData, mapWidth: number, mapHeight: number, tempMap: boolean[], jumpPointXY, nowX: number, nowY: number, endX: number, endY: number): boolean {
//         //判断是否为终点
//         if (nowX == endX && nowY == endY) {
//             return true;
//         }
//         {
//             let tagLeft = true;
//             let tagRight = true;
//             let tagUp = true;
//             let tagDown = true;
//             //判断上下左右是否为强迫邻居
//             let upY = nowY - 1;
//             let downY = nowY + 1;
//             let rightX = nowX + 1;
//             let leftX = nowX - 1;
//             //左边界
//             if (tagLeft) {
//                 if (leftX >= 0) {
//                     let nindex = mapData.getIndexByXY(leftX, nowY);
//                     if (!tempMap[nindex]) {
//                         //不能走,是一个强迫邻居
//                         return true;
//                     }
//                 }
//             }
//             //右边界
//             if (tagRight) {
//                 if (rightX < mapWidth) {
//                     let nindex = mapData.getIndexByXY(rightX, nowY);
//                     if (!tempMap[nindex]) {
//                         //不能走,是一个强迫邻居
//                         return true;
//                     }
//                 }
//             }
//             //上边界
//             if (tagUp) {
//                 if (upY >= 0) {
//                     let nindex = mapData.getIndexByXY(nowX, upY);
//                     if (!tempMap[nindex]) {
//                         //不能走,是一个强迫邻居
//                         return true;
//                     }
//                 }
//             }
//             //下边界
//             if (tagDown) {
//                 if (downY < mapHeight) {
//                     let nindex = mapData.getIndexByXY(nowX, downY);
//                     if (!tempMap[nindex]) {
//                         //不能走,是一个强迫邻居
//                         return true;
//                     }
//                 }
//             }
//         }
//         //如果斜向或者直线移动可以抵达跳点，则该格子是跳点
//         for (let key of jumpPointXY.keys()) {
//             let pos = jumpPointXY.get(key);
//             if (pos[0] == nowX || pos[1] == nowY) {
//                 return true;
//             }
//         }
//         return false;
//     }
// }
//# sourceMappingURL=JPSPlus.js.map