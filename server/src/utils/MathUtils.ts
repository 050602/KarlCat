/**
 * 数学工具
 * @author An
 */

export class MathUtils {
    private static xarr: number[] = [-60, -90, -120, -90];//
    private static yarr: number[] = [0, -90, -180, -270];
    private static zarr: number[] = [0, -30, 0, -30];
    private static roarr: number[] = [0, 90, 180, 270, 360];

    /**
     * Degrees-to-radians conversion constant (Read Only).
     */
    public static readonly Deg2Rad: number = 0.01745329;
    /**
     * Radians-to-degrees conversion constant (Read Only).
     */
    public static readonly Rad2Deg: number = 57.29578;

    /**
     * 弧度制转换为角度值
     * @param radian 弧度制
     * @returns {number}
     */
    public static getAngle(radian: number): number {
        return 180 * radian / Math.PI;

    }

    /**
     * 角度值转换为弧度制
     * @param angle
     */
    public static getRadian(angle: number): number {
        return angle / 180 * Math.PI;
    }

    //计算两点间角度
    public static getAngle2(x1: number, y1: number, x2: number, y2: number): number {
        let r = MathUtils.getRadian2(x1, y1, x2, y2);
        let angle = MathUtils.getAngle(r);
        return angle;
    }

    public static clamp(value: number, min: number, max: number) {
        if (value < min)
            value = min;
        if (value > max)
            value = max;
        return value;
    }

    public static clamp01(value: number) {
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

    public static getRadian2(p1X: number, p1Y: number, p2X: number, p2Y: number): number {
        let xdis: number = p2X - p1X;
        let ydis: number = p2Y - p1Y;
        return Math.atan2(ydis, xdis);
    }

    /**
     * 获取两点间距离
     * @param p1X
     * @param p1Y
     * @param p2X
     * @param p2Y
     * @returns {number} 距离
     */
    public static getDistance(p1X: number, p1Y: number, p2X: number, p2Y: number): number {
        let disX: number = p2X - p1X;
        let disY: number = p2Y - p1Y;
        let disQ: number = disX * disX + disY * disY;
        return disQ;
    }

    /**
     * 计算两点距离
     * @param s 点1
     * @param t 点2
     */
    public static getDistanceByObject(s: { x: number, y: number }, t: { x: number, y: number }): number {
        return this.getDistance(s.x, s.y, t.x, t.y);
    }

    /**
     * 获取一个区间的随机数 [$min,$max)
     * @param $from 最小值
     * @param $end 最大值
     * @returns {number}
     */
    public static random($from: number, $end: number): number {
        $from = Math.min($from, $end);
        $end = Math.max($from, $end);
        let range: number = $end - $from;
        return $from + Math.random() * range;
    }

    /**
     * 获取一个区间的随机整数  [min,max]
     * @param min
     * @param max
     */
    public static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    /**
     * 获取一个区间的随机整数  [nums]
     * @param nums=[min,max]
     */
    public static randomIntFromNums(nums: number[]): number {
        return this.randomInt(nums[0], nums[1]);
    }

    /**
     * 获取一个区间的随机整数  [1,max]
     * @param min
     * @param max
     */
    public static randomNumber(max: number = 10000): number {
        return this.randomInt(1, max);
    }

    /**
     * 命中判定
     * @param rate 成功率 万分比 精度到小数后两位  比如 30.50% 则 传入 3050
     * @return 是否判定成功
     */
    public static scoreAHit(rate: number): boolean {
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
    public static roundTableCrit(rateArr: number[], critMulArr: number[]): number {
        let num = Math.floor(Math.random() * 10000);
        for (let i = 0; i < rateArr.length; i++) {
            let rate = rateArr[i];
            if (rate > num) {
                return critMulArr[i];
            }
        }
        return 1;//普攻是1倍伤害
    }

    /**
     * 在一个数组中随机获取一个元素
     * @param arr 数组
     * @returns {any} 随机出来的结果
     */
    public static randomArray(arr: any[]): any {
        let index: number = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    /**
     * 在一个数组中随机获取一个元素,返回该元素所在的索引
     * @param arr 数组
     * @returns {any} 随机出来的结果
     */
    public static randomArrayGetIndex(arr: any[]): any {
        let index: number = Math.floor(Math.random() * arr.length);
        return index;
    }

    /**
     * 在一个数组中随机获取一个元素,返回该元素所在的索引
     * @param arr 数组
     * @returns {any} 随机出来的结果
     */
    public static randomArrayGetIndexSet(arr: any[], cnt = 1): number[] {
        let indexSet = [];
        for (let i = 0; i < cnt; i++) {
            let index: number = this.randomArrayGetIndex(arr);
            indexSet.push(index);
        }
        return indexSet;
    }

    /**取整 */
    public static toInteger(value: number): number {
        return value >> 0;
    }

    /**
     * 根据弧度和速度获取分量速度
     * @param angle 弧度
     * @param speed 速度
     */
    public static AngleToXYSpeed(angle: number, speed: number): number[] {
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
    public static rotationPoint(x: number, y: number, rotation: number): number[] {
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
    public static inRect(x: number, y: number, width: number, height: number, rotation: number, centerX: number, centerY: number): boolean {
        let hw = width * 0.5;
        let hh = height * 0.5;
        let r = -rotation * (Math.PI / 180)
        if (rotation == 0) {
            //无旋转时，用最简方法，减少运算
            // gzaLog(x, centerX + hw, centerX - hw, y, centerY + hh, centerY - hh);
            if (x < centerX + hw && x > centerX - hw && y < centerY + hh && y > centerY - hh) {
                return true;
            }
        } else {
            let nTempX = centerX + (x - centerX) * Math.cos(r) - (y - centerY) * Math.sin(r);
            let nTempY = centerY + (x - centerX) * Math.sin(r) + (y - centerY) * Math.cos(r);
            if (nTempX > centerX - hw && nTempX < centerX + hw && nTempY > centerY - hh && nTempY < centerY + hh) {
                return true;
            }
        }
        return false
    }


    /**
     * 判断点在圆内
     * @param x 点X
     * @param y 点Y
     * @param centerX 圆心X
     * @param centerY 圆心Y
     * @param r 圆半径
     */
    public static inCircle(x: number, y: number, centerX: number, centerY: number, r: number): boolean {
        let dis = MathUtils.getDistance(x, y, centerX, centerY);
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
    public static vector2Rotate(vec2: number[], euler: number): number[] {
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
    public static getProbResult(rate: number, rateTotal: number = 100) {
        return Math.random() * rateTotal <= rate;
    }

    // 随机生成cnt个不均匀的整数，且这些整数的总和为sum，每个数字>=(sum/(mValue*cnt))
    public static generateRandomIntegers(sum: number, cnt: number, mValue: number): number[] {
        if (sum <= 0 || cnt <= 0 || sum < cnt) {
            throw new Error("Invalid input: sum must be positive, cnt must be positive, and sum >= cnt");
        }

        let base = Math.ceil(sum / (mValue * cnt));
        base = Math.max(base, 1);
        let result: number[] = Array<number>(cnt).fill(base);
        let remaining = sum - cnt * base;
        let maxV = Math.max(Math.ceil(remaining / cnt), 1);

        // 随机调整部分数字以打破均匀性  
        let indexToAdd = 0;
        let addValue = 0;
        let total = 0;
        while (remaining > 0) {
            // 随机选择一个位置来增加  
            addValue = MathUtils.randomInt(1, maxV);
            addValue = Math.min(addValue, remaining);
            result[indexToAdd] += addValue;
            remaining -= addValue;

            if (total < cnt - 1)
                indexToAdd++;
            else
                indexToAdd = MathUtils.randomInt(0, cnt - 1);
            indexToAdd
            total++;
        }

        // 打乱数组顺序，确保结果看起来更随机  
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    public static toFlagNum(value: Boolean): number {
        return value ? 1 : 0;
    }

    // 确保返回值小于等于 nCmpValue
    public static getNum_lessThenOrEqual(nValue: number, nCmpValue: number): number {
        if (nValue > nCmpValue)
            return nCmpValue;
        return nValue;
    }

    // 确保返回值大于等于 nCmpValue
    public static getNum_greatThenOrEqual(nValue: number, nCmpValue: number): number {
        if (nValue < nCmpValue)
            return nCmpValue;
        return nValue;
    }

    // 返回 [nLeft, nRight] 范围内的一个值
    public static safeGetNum(nLeft: number, nRight: number, nValue: number): number {
        if (nValue < nLeft)
            return nLeft;
        if (nValue > nRight)
            return nRight;
        return nValue;
    }

    // 从[nLiftNum, nRightNum]随机抽取cnt个不重复的数，过滤filterNum,返回一个数组
    public static randNumFromList(nLiftNum: number, nRightNum: number, filerNum: number, cnt: number): number[] {
        let numbers: number[] = [];
        for (let i = nLiftNum; i <= nRightNum; i++) {
            if (i == filerNum)
                continue;
            numbers.push(i);
        }
        if (numbers.length <= cnt)
            return numbers;

        let result: number[] = [];
        while (result.length < cnt) {
            let index = this.randomArrayGetIndex(numbers);
            let selNum = numbers.splice(index, 1)[0]; // 从数组中移除并获取该数字
            result.push(selNum);
        }
        return result;
    }
}
