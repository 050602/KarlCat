"use strict";
/**
 * 数学工具
 * @author An
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathUtils = void 0;
class MathUtils {
    /**
     * 弧度制转换为角度值
     * @param radian 弧度制
     * @returns {number}
     */
    static getAngle(radian) {
        return 180 * radian / Math.PI;
    }
    /**
     * 角度值转换为弧度制
     * @param angle
     */
    static getRadian(angle) {
        return angle / 180 * Math.PI;
    }
    //计算两点间角度
    static getAngle2(x1, y1, x2, y2) {
        let r = MathUtils.getRadian2(x1, y1, x2, y2);
        let angle = MathUtils.getAngle(r);
        return angle;
    }
    static clamp(value, min, max) {
        if (value < min)
            value = min;
        if (value > max)
            value = max;
        return value;
    }
    static clamp01(value) {
        if (value < 0)
            value = 0;
        if (value > 1)
            value = 1;
        return value;
    }
    /**
     * 获取两点间弧度
     * @param p1X
     * @param p1Y
     * @param p2X
     * @param p2Y
     * @returns {number} 弧度
     */
    static getRadian2(p1X, p1Y, p2X, p2Y) {
        let xdis = p2X - p1X;
        let ydis = p2Y - p1Y;
        return Math.atan2(ydis, xdis);
    }
    /**
     *  获取两个点的欧式距离的平方
     * @param p1X
     * @param p1Y
     * @param p2X
     * @param p2Y
     * @returns {number} 距离
     */
    static getSquareOfEuclideanDistance(p1X, p1Y, p2X, p2Y) {
        let disX = p2X - p1X;
        let disY = p2Y - p1Y;
        let disQ = disX * disX + disY * disY;
        return disQ;
    }
    //获取两个点的欧氏距离
    static getEuclideanDistance(p1X, p1Y, p2X, p2Y) {
        let disX = p2X - p1X;
        let disY = p2Y - p1Y;
        let disQ = Math.sqrt(disX * disX + disY * disY);
        return disQ;
    }
    /**
     * 获取两个点的欧式距离的平方
     * @param s 点1
     * @param t 点2
     */
    static getSquareOfEuclideanDistanceByObject(s, t) {
        return this.getSquareOfEuclideanDistance(s.x, s.y, t.x, t.y);
    }
    //曼哈顿距离
    static getManhattanDistanceByXY(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    /**
     * 获取一个区间的随机数 [$min,$max)
     * @param $from 最小值
     * @param $end 最大值
     * @returns {number}
     */
    static random($from, $end) {
        $from = Math.min($from, $end);
        $end = Math.max($from, $end);
        let range = $end - $from;
        return $from + Math.random() * range;
    }
    /**
     * 获取一个区间的随机整数  [min,max]
     * @param min
     * @param max
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * 命中判定
     * @param rate 成功率 万分比 精度到小数后两位  比如 30.50% 则 传入 3050
     * @return 是否判定成功
     */
    static scoreAHit(rate) {
        let num = Math.floor(Math.random() * 10000);
        if (rate < num) {
            return false;
        }
        return true;
    }
    /**
     * 圆桌判定暴击
     * @param rateArr 暴击率数组 万分比
     * @param critMulArr 暴击倍数数组
     * @return 伤害倍数
     */
    static roundTableCrit(rateArr, critMulArr) {
        let num = Math.floor(Math.random() * 10000);
        for (let i = 0; i < rateArr.length; i++) {
            let rate = rateArr[i];
            if (rate > num) {
                return critMulArr[i];
            }
        }
        return 1; //普攻是1倍伤害
    }
    /**
     * 在一个数组中随机获取一个元素
     * @param arr 数组
     * @returns {any} 随机出来的结果
     */
    static randomArray(arr) {
        let index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }
    /**
     * 在一个数组中随机获取一个元素,返回该元素所在的索引
     * @param arr 数组
     * @returns {any} 随机出来的结果
     */
    static randomArrayGetIndex(arr) {
        let index = Math.floor(Math.random() * arr.length);
        return index;
    }
    /**取整 */
    static toInteger(value) {
        return value >> 0;
    }
    /**
     * 根据弧度和速度获取分量速度
     * @param angle 弧度
     * @param speed 速度
     */
    static AngleToXYSpeed(angle, speed) {
        if (!speed) {
            return [0, 0];
        }
        let vx = (Math.sin(angle) * -speed);
        let vy = (Math.cos(angle) * -speed);
        return [vx, vy];
    }
    /**
     * 把指定点进行旋转变换
     * @param x 点X
     * @param y 点Y
     * @param rotation 角度 360
     */
    static rotationPoint(x, y, rotation) {
        let radian = MathUtils.getRadian(rotation);
        let nx = x * Math.cos(radian) - y * Math.sin(radian);
        let ny = x * Math.sin(radian) + y * Math.cos(radian);
        //unity左手坐标，要把X取负数
        return [-nx, ny];
    }
    /**
     * 判断点是否在矩形内
     * @param x 点X
     * @param y 点Y
     * @param width 矩形宽
     * @param height 矩形长
     * @param rotation 矩形旋转角度
     * @param centerX 矩形中心点
     * @param centerY 矩形中心点
     */
    static inRect(x, y, width, height, rotation, centerX, centerY) {
        let hw = width * 0.5;
        let hh = height * 0.5;
        if (rotation == 0) {
            //无旋转时，用最简方法，减少运算
            // gzaLog(x, centerX + hw, centerX - hw, y, centerY + hh, centerY - hh);
            if (x < centerX + hw && x > centerX - hw && y < centerY + hh && y > centerY - hh) {
                return true;
            }
        }
        else {
            let r = -rotation * (Math.PI / 180);
            let nTempX = centerX + (x - centerX) * Math.cos(r) - (y - centerY) * Math.sin(r);
            let nTempY = centerY + (x - centerX) * Math.sin(r) + (y - centerY) * Math.cos(r);
            if (nTempX > centerX - hw && nTempX < centerX + hw && nTempY > centerY - hh && nTempY < centerY + hh) {
                return true;
            }
        }
        return false;
    }
    /**
     * 判断点是否在矩形内 当前战斗专用,性能优化版本，起点是矩形的中心点
     * @param x 点X
     * @param y 点Y
     * @param width 矩形宽
     * @param height 矩形长
     * @param rotation 矩形旋转角度
     * @param centerX 矩形中心点
     * @param centerY 矩形中心点
     */
    // public static inRectByNowFight(x: number, y: number, width: number, height: number, centerX: number, centerY: number, isFlip: boolean): boolean {
    //     let hh = height * 0.5;
    //     if (y < centerY + hh && y > centerY - hh) {
    //         let hw = width * 0.5;
    //         if (isFlip) {
    //             if (x < centerX - hw && x > centerX + hw) {
    //                 return true;
    //             }
    //         } else {
    //             if (x < centerX + hw && x > centerX - hw) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }
    //已知矩形的四个点，求点是否在矩形内
    static inRectBy4Point(x, y, x1, y1, x2, y2, x3, y3, x4, y4) {
        // 判断点是否在矩形的边界上
        if ((x >= x1 && x <= x2 && y >= y1 && y <= y2) || (x >= x2 && x <= x1 && y >= y2 && y <= y1)) {
            return true;
        }
        // 统计射线与矩形边界的交点个数
        let count = 0;
        // 用辅助函数判断射线与边的交点个数
        function checkIntersection(x1, y1, x2, y2, px, py) {
            if ((py < y1 && py < y2) || (py > y1 && py > y2)) {
                return false; // 不相交，返回 false
            }
            if (py === y1 && py === y2) {
                if ((px >= x1 && px <= x2) || (px >= x2 && px <= x1)) {
                    return true; // 在边界上，返回 true
                }
                else {
                    return false;
                }
            }
            let x = (py - y1) * (x2 - x1) / (y2 - y1) + x1; // 计算交点的横坐标
            if (x <= px) {
                count++;
            }
            return false;
        }
        // 判断点与每条边的关系
        checkIntersection(x1, y1, x2, y2, x, y);
        checkIntersection(x2, y2, x3, y3, x, y);
        checkIntersection(x3, y3, x4, y4, x, y);
        checkIntersection(x4, y4, x1, y1, x, y);
        // 判断交点的个数
        if (count % 2 === 1) {
            return true; // 奇数个交点，点在矩形内部
        }
        else {
            return false; // 偶数个交点，点在矩形外部
        }
    }
    /**
     * 判断点是否在等斜边梯形上
     * @param x
     * @param y
     * @param upLineLeftX
     * @param upLineLeftY
     * @param upLineRightX
     * @param upLineRightY
     * @param downLineLeftX
     * @param downLineLeftY
     * @param downLineRightX
     * @param downLineRightY
     * @returns
     */
    static ponitInTrapezoid(x, y, upLineLeftX, upLineLeftY, upLineRightX, upLineRightY, downLineLeftX, downLineLeftY, downLineRightX, downLineRightY, upLineLength, downLineLength, height) {
        //如果长边在底边
        if (downLineLength > upLineLength) {
            let sanjiaoLength = (downLineLength - upLineLength) * 0.5;
            //三角形的三个点分别是，downLineLeft upLineLeft,以及downLineLeft+sanjiaoLength
            //计算梯形左侧三角形
            let pointXY1 = this.getPointOnLine(downLineLeftX, downLineLeftY, downLineRightX, downLineRightY, sanjiaoLength);
            // console.log("aa", sanjiaoLength, pointXY1);
            // console.log("aa1", x, y, downLineLeftX, downLineLeftY, upLineLeftX, upLineLeftY, pointXY1.x, pointXY1.y);
            let inSanjiao = this.pointInTriangle(x, y, downLineLeftX, downLineLeftY, upLineLeftX, upLineLeftY, pointXY1.x, pointXY1.y);
            if (inSanjiao) {
                return true;
            }
            //计算梯形右侧三角形
            let pointXY2 = this.getPointOnLine(downLineRightX, downLineRightY, downLineLeftX, downLineLeftY, sanjiaoLength);
            // console.log("bb", sanjiaoLength, pointXY2);
            // console.log("bb1", x, y, downLineRightX, downLineRightY, upLineRightX, upLineRightY, pointXY2.x, pointXY2.y);
            inSanjiao = this.pointInTriangle(x, y, downLineRightX, downLineRightY, upLineRightX, upLineRightY, pointXY2.x, pointXY2.y);
            if (inSanjiao) {
                return true;
            }
            //计算梯形中间正方形
            // console.log("dd", x, y, upLineLeftX, upLineLeftY, upLineRightX, upLineRightY, pointXY2.x, pointXY2.y, pointXY1.x, pointXY1.y);
            let inRect = this.inRectBy4Point(x, y, upLineLeftX, upLineLeftY, upLineRightX, upLineRightY, pointXY2.x, pointXY2.y, pointXY1.x, pointXY1.y);
            if (inRect) {
                return true;
            }
        }
        else {
            let sanjiaoLength = (upLineLength - downLineLength) * 0.5;
            //三角形的三个点分别是，downLineLeft upLineLeft,以及downLineLeft+sanjiaoLength
            //计算梯形左侧三角形
            let pointXY1 = this.getPointOnLine(upLineLeftX, upLineLeftY, upLineRightX, upLineRightY, sanjiaoLength);
            let inSanjiao = this.pointInTriangle(x, y, upLineLeftX, upLineLeftY, downLineLeftX, downLineLeftY, pointXY1.x, pointXY1.y);
            if (inSanjiao) {
                return true;
            }
            //计算梯形右侧三角形
            let pointXY2 = this.getPointOnLine(upLineRightX, upLineRightY, upLineLeftX, upLineLeftY, sanjiaoLength);
            inSanjiao = this.pointInTriangle(x, y, downLineRightX, downLineRightY, upLineRightX, upLineRightY, pointXY2.x, pointXY2.y);
            if (inSanjiao) {
                return true;
            }
            //计算梯形中间正方形
            let inRect = this.inRectBy4Point(x, y, downLineLeftX, downLineLeftY, downLineRightX, downLineRightY, pointXY1.x, pointXY1.y, pointXY2.x, pointXY2.y);
            if (inRect) {
                return true;
            }
        }
        return false;
    }
    //从点1到点2的线上，从点1延长指定距离，获得移动该距离后的点
    static getPointOnLine(x1, y1, x2, y2, length) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        // 计算角度
        let angle = Math.atan2(dy, dx);
        // 计算长度L的向量
        let lengthVector = { x: Math.cos(angle) * length, y: Math.sin(angle) * length };
        // 计算终点坐标
        let endPoint = { x: x1 + lengthVector.x, y: y1 + lengthVector.y };
        return endPoint;
    }
    //点乘
    static dotProduct(x1, y1, x2, y2) {
        return x1 * x2 + y1 * y2;
    }
    //判断点是否在三角形内
    static pointInTriangle(x, y, x1, y1, x2, y2, x3, y3) {
        //判断4点共面，但是我们是2D的不需要
        // if (this.pointInTrianglePlane(p, a, b, c) == false)
        //     return false;
        let xAC = x3 - x1;
        let yAC = y3 - y1;
        let xAB = x2 - x1;
        let yAB = y2 - y1;
        let xAP = x - x1;
        let yAP = y - y1;
        let f_i = this.dotProduct(xAP, yAP, xAC, yAC) * this.dotProduct(xAB, yAB, xAB, yAB) - this.dotProduct(xAP, yAP, xAB, yAB) * this.dotProduct(xAC, yAC, xAB, yAB);
        let f_j = this.dotProduct(xAP, yAP, xAB, yAB) * this.dotProduct(xAC, yAC, xAC, yAC) - this.dotProduct(xAP, yAP, xAC, yAC) * this.dotProduct(xAB, yAB, xAC, yAC);
        let f_d = this.dotProduct(xAC, yAC, xAC, yAC) * this.dotProduct(xAB, yAB, xAB, yAB) - this.dotProduct(xAC, yAC, xAB, yAB) * this.dotProduct(xAC, yAC, xAB, yAB);
        if (f_d < 0) {
            console.error("异常的三角形数据", x1, y1, x2, y2, x3, y3, x, y);
        }
        if (f_i >= 0 && f_j >= 0 && f_i + f_j - f_d <= 0)
            return true;
        else
            return false;
    }
    //判断4点共面，3D才会用到
    // static public bool pointInTrianglePlane(Vector3 p, Vector3 a, Vector3 b, Vector3 c) {
    //        Vector3 pa = a - p;
    //       Vector3 pb = b - p;
    //        Vector3 pc = c - p;
    //        Vector3 normal1 = Vector3.Cross(pa, pb);
    //       Vector3 normal2 = Vector3.Cross(pa, pc);
    //        Vector3 result = Vector3.Cross(normal1, normal2);
    //     //证明：若pab平面的法向量平行于pac平面的法向量，则说明平面pab和pac平行或重合，
    //     //且p点为两平面公共点，所以pab、pac平面重合，pabc四点共面。
    //     if (result == Vector3.zero) {
    //         Debug.Log(result);
    //         return true;
    //     }
    //     else
    //         return false;
    // }
    /**
     * 判断点在圆内
     * @param x 点X
     * @param y 点Y
     * @param centerX 圆心X
     * @param centerY 圆心Y
     * @param r 圆半径
     */
    static inCircle(x, y, centerX, centerY, r) {
        let dis = MathUtils.getSquareOfEuclideanDistance(x, y, centerX, centerY);
        // gzaLog("判断圆位置");
        if (dis <= r * r) {
            return true;
        }
        return false;
    }
    // public static runOffset(hitArea: HitArea, seachX: number, seachZ: number, direction: number): number[] {
    //     let newSeachZ = seachZ;
    //     let newSeachX = seachX;
    //     switch (hitArea.shape) {
    //         case 1:
    //             if (direction && hitArea.rangeAngle == 2) {
    //                 let ro = MathUtils.rotationPoint(hitArea.xoffset, hitArea.zoffset, direction);
    //                 newSeachX += ro[0];
    //                 newSeachZ += ro[1];
    //             } else {
    //                 let ro = MathUtils.rotationPoint(hitArea.xoffset, hitArea.zoffset, hitArea.rotation);
    //                 newSeachX += ro[0];
    //                 newSeachZ += ro[1];
    //             }
    //     }
    //     return [newSeachX, newSeachZ];
    // }
    // /**
    //  * 向量旋转
    //  * @param vec2
    //  * @param euler
    //  */
    // public static vector2Rotate(vec2: UnityEngine.Vector2, euler: number) {
    //     let r = euler * 0.01745329;
    //     return new UnityEngine.Vector2(
    //         vec2.x * Math.cos(r) - vec2.y * Math.sin(r),
    //         vec2.x * Math.sin(r) + vec2.y * Math.cos(r)
    //     );
    // }
    /**
  * 向量旋转
  * @param vec2
  * @param euler
  */
    static vector2Rotate(vec2, euler) {
        let r = euler * this.Deg2Rad;
        return [vec2[0] * Math.cos(r) - vec2[1] * Math.sin(r),
            vec2[0] * Math.sin(r) + vec2[1] * Math.cos(r)];
        // );
    }
    /**
     * 获取概率
     * @param rate 命中占比
     * @param rateTotal 总数
     */
    static getProbResult(rate, rateTotal = 100) {
        return Math.random() * rateTotal <= rate;
    }
    //
    /**
     * 不重复抽取数组内指定数量的元素 请注意:此方法不会自动去重，
     * @param arr
     * @param num
     * @returns
     */
    static getArrayItems(arr, num) {
        //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
        let temp_array = [];
        for (let index in arr) {
            temp_array.push(arr[index]);
        }
        //取出的数值项,保存在此数组
        let return_array = [];
        for (let i = 0; i < num; i++) {
            //判断如果数组还有可以取出的元素,以防下标越界
            if (temp_array.length > 0) {
                //在数组中产生一个随机索引
                let arrIndex = Math.floor(Math.random() * temp_array.length);
                //将此随机索引的对应的数组元素值复制出来
                return_array[i] = temp_array[arrIndex];
                //然后删掉此索引的数组元素,这时候temp_array变为新的数组
                temp_array.splice(arrIndex, 1);
            }
            else {
                //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
                break;
            }
        }
        return return_array;
    }
}
exports.MathUtils = MathUtils;
/**
 * Degrees-to-radians conversion constant (Read Only).
 */
MathUtils.Deg2Rad = 0.01745329;
/**
 * Radians-to-degrees conversion constant (Read Only).
 */
MathUtils.Rad2Deg = 57.29578;
//# sourceMappingURL=MathUtils.js.map