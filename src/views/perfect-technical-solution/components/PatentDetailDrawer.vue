<template>
    <div class="patent-detail-card">
        <!-- 1. 基础信息 -->
        <section class="detail-section">
            <h3 class="section-title">基础信息</h3>
            <div class="basic-info-grid">
                <div class="info-item">
                    <span class="info-label">相似度:</span>
                    <span class="info-value similarity-value" :style="percentStyle">{{ patentData.relevancy }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">公开号:</span>
                    <span class="info-value">{{ patentData.pn }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">标题:</span>
                    <span class="info-value">{{ patentData.title }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">法律状态:</span>
                    <span class="info-value">{{ patentData.legal_status }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">申请日:</span>
                    <span class="info-value">{{ formatDate(patentData.apdt) }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">公司:</span>
                    <span class="info-value">{{ patentData.company }}</span>
                </div>
            </div>
        </section>

        <!-- 2. 总结信息 -->
        <section class="detail-section">
            <h3 class="section-title">总结信息</h3>
            <div class="summary-info">
                <div class="summary-item">
                    <span class="info-label block-label">技术问题:</span>
                    <p class="summary-content">{{ patentData.technical_problem }}</p>
                </div>
                <div class="summary-item">
                    <span class="info-label block-label">技术手段:</span>
                    <p class="summary-content">{{ patentData.technical_solution }}</p>
                </div>
                <div class="summary-item">
                    <span class="info-label block-label">技术效果:</span>
                    <p class="summary-content">{{ patentData.technical_effect }}</p>
                </div>
            </div>
        </section>

        <!-- 3. 对比信息 -->
        <section class="detail-section">
            <h3 class="section-title">对比信息</h3>
            <div class="comparison-info">
                <div class="comparison-item">
                    <span class="info-label block-label">相似技术:</span>
                    <p class="comparison-content">{{ patentData.similar_features }}</p>
                </div>
                <div class="comparison-item">
                    <span class="info-label block-label">相似手段:</span>
                    <p class="comparison-content">{{ patentData.similar_effects }}</p>
                </div>
                <div class="comparison-item">
                    <span class="info-label block-label">相似文本:</span>
                    <div class="similar-text-table-container">
                        <el-table :data="patentData.similar_evidence" border style="width: 100%;">
                            <el-table-column label="章节" prop="section" align="center" width="120" />
                            <el-table-column label="文本内容" prop="text" align="left">
                                <template #default="scope">
                                    <div class="table-text-content">{{ scope.row.text }}</div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. 原文信息 -->
        <section class="detail-section">
            <h3 class="section-title">原文信息</h3>
            <div class="original-info">
                <div class="original-item">
                    <span class="info-label block-label">摘要:</span>
                    <p class="original-content">{{ patentData.abstracts }}</p>
                </div>
                <div class="original-item">
                    <span class="info-label block-label">权利要求:</span>
                    <p class="original-content">{{ patentData.claims }}</p>
                </div>
            </div>
        </section>
    </div>
</template>
<script>
import { legalStatusData } from '@/utils/dict'
import { deepClone as _deepClone } from '@/utils/index';
export default {
    props: {
        patentOption: {
            type: Object,
            default: () => { }
        }
    },
    data() {
        return {
            drawer: false,
            // 将你的专利数据对象赋值给 patentData
            patentData: {
                "relevancy": "95",
                "title": "网元异常检测方法、装置、设备及介质",
                "pn": "CN116634483A",
                "legal_status": "1",
                "apdt": 20230511,
                "company": "中国电信股份有限公司北京研究院",
                "technical_problem": "无线通信中的网元异常检测问题",
                "technical_solution": "获取网元的多种关键性能指标KPI对应的原始KPI数据组（包含时间维度、网元维度和KPI维度的三维数据），通过对原始KPI数据组进行统计分析转换为目标KPI数据组（包含网元维度和KPI维度的二维数据），计算网元的统计值与对应均值之间的距离值（如曼哈顿距离），得到距离值集合，针对每个距离值集合做四分位数异常检测得到异常距离值个数，基于距离值集合统计总距离值，基于异常距离值个数和总距离值判断网元是否异常（包括具体逻辑如预设阈值比较）",
                "technical_effect": "实现网元异常检测",
                "similar_features": "完全相同：获取三维KPI数据（时间、网元、KPI维度）、转换为二维数据（网元、KPI维度）、计算距离值（统计值与均值距离）、做四分位数异常检测得到异常距离值个数、统计总距离值、基于异常个数和总距离值判断网元是否异常",
                "similar_effects": "完全相同：自动识别网元性能异常",
                "similar_evidence": [
                    {
                        "section": "权利要求第1段",
                        "text": "获取网元的多种关键性能指标KPI对应的原始KPI数据组，每个原始KPI数据组是包含时间维度、网元维度和KPI维度的三维数据；通过对原始KPI数据组中的多个原始KPI数据进行统计分析，将原始KPI数据组转换为目标KPI数据组，目标KPI数据组是包含网元维度和KPI维度的二维数据；计算网元的统计值，与所述统计值对应的均值之间的距离值，得到所述网元的距离值集合；针对每个网元的距离值集合，做四分位数异常检测，得到所述网元的异常距离值的个数；基于所述网元的距离值集合，统计得到网元的总距离值；基于每个网元对应的异常距离值个数和总距离值，判断网元是否异常"
                    }
                ],
                "abstracts": "本公开提供了一种网元异常检测方法、装置、设备及介质，涉及无线通信的异常检测技术领域。该方法包括：获取网元的多种关键性能指标KPI对应的原始KPI数据组，每个原始KPI数据组是包含时间维度、网元维度和KPI维度的三维数据；通过对原始KPI数据组中的多个原始KPI数据进行统计分析，将原始KPI数据组转换为目标KPI数据组，目标KPI数据组是包含网元维度和KPI维度的二维数据；计算网元的统计值，与统计值对应的均值之间的距离值，得到网元的距离值集合；针对每个网元的距离值集合，做四分位数异常检测，得到网元的异常距离值的个数；基于网元的距离值集合，统计得到网元的总距离值；基于每个网元对应的异常距离值个数和总距离值，判断网元是否异常。",
                "claims": "1.一种网元异常检测方法，\n其特征在于，\n包括：\n获取网元的多种关键性能指标KPI对应的原始KPI数据组，每个原始KPI数据组是包含时间维度、网元维度和KPI维度的三维数据，原始KPI数据组中的原始KPI数据用于表示网元在第一时间段中每个周期内的第一度量区间的KPI；\n通过对原始KPI数据组中的多个原始KPI数据进行统计分析，将原始KPI数据组转换为目标KPI数据组，目标KPI数据组是包含网元维度和KPI维度的二维数据，目标KPI数据组中的目标KPI数据用于表示网元在第一时间段中每个周期内的第二度量区间的统计值，其中，每个周期包括多个第二度量区间，所述第二度量区间的时长大于所述第一度量区间的时长；\n计算网元的统计值，与所述统计值对应的均值之间的距离值，得到所述网元的距离值集合；\n针对每个网元的距离值集合，做四分位数异常检测，得到所述网元的异常距离值的个数；\n基于所述网元的距离值集合，统计得到网元的总距离值；\n基于每个网元对应的异常距离值个数和总距离值，判断网元是否异常。\n2.根据权利要求1所述的方法，\n其特征在于，\n针对每个网元的距离值集合，做四分位数异常检测，得到所述网元的异常距离值的个数，包括针对每个网元的距离值集合做如下处理：\n将所述网元的距离值集合中的所有距离值，从小到大进行排列后，确定第一四分位数Q1和第三四分位数Q3；\n根据所述第一四分位数Q1和所述第三四分位数Q3，计算得到四分位距IQR；\n基于所述第一四分位数Q1、所述第三四分位数Q3、所述四分位距IQR和所述网元的距离值集合中的最小距离值，确定距离阈值；\n基于所述网元的距离值集合和所述距离阈值，确定所述网元的异常距离值的个数，所述异常距离是所述网元的距离值集合中大于所述距离阈值的距离值。\n3.根据权利要求2所述的方法，\n其特征在于，\n基于所述第一四分位数Q1、所述第三四分位数Q3、所述四分位距IQR和所述网元的距离值集合中的最小距离值，确定距离阈值，包括通过如下公式确定距离阈值：\nDt＝Q3+Q1-Dmin\n其中，Dt表示距离阈值，Dmin表示所述网元的距离值集合中的最小距离值。\n4.根据权利要求1所述的方法，\n其特征在于，\n第二度量区间的统计值，包括如下类型的统计值中的一种或多种：\n最大值、最小值、均值、标准差与样本数的比值、峰度、偏度；\n其中，峰度为总体中所有取值分布形态陡缓程度的统计量，偏度为总体取值分布的对称性。\n5.根据权利要求1所述的方法，\n其特征在于，\n所述多种关键性能指标KPI，包括如下KPI中的一种或多种：\nPDCP流量、RRC连接次数、无线初始连接成功率、S1信令连接建立失败次数、RRC连接建立失败次数、E-RAB建立失败次数、UE上下文异常释放次数、UE上下文掉线率、E-RAB异常释放次数、E-RAB掉线率、RRC连接重建比例、RRC重建请求次数、同频切换成功率、同频切换失败次数、异频切换成功率、异频切换失败次数、CQI优良比、空口上行用户面丢包数、空口上行用户面丢包率、空口下行用户面丢包数、空口下行用户面丢包率。\n6.根据权利要求1所述的方法，\n其特征在于，\n所述第一时间段的时长为一周，所述周期为一天，所述第一度量区间为1小时，所述第二度量区间为6小时。\n7.根据权利要求1所述的方法，\n其特征在于，\n计算网元的统计值，与所述统计值对应的均值之间的距离值，得到所述网元的距离值集合，包括：\n计算网元的统计值，与所述统计值对应的均值之间的曼哈顿距离值，得到所述网元的距离值集合。\n8.根据权利要求1-7任一所述的方法，\n其特征在于，\n基于每个网元对应的异常距离值个数和总距离值，判断网元是否异常，包括：\n在网元的异常距离值个数大于预设数量阈值，总距离值小于或等于预设距离阈值的情况下，将所述网元确定为潜在故障网元；\n在网元的异常距离值个数大于预设数量阈值，总距离值大于预设距离阈值的情况下，将所述网元确定为故障网元；\n在网元的异常距离值个数小于或等于预设数量阈值，总距离值大于预设距离阈值的情况下，将所述网元的相关信息发送至人工审核处。\n9.一种网元异常检测装置，\n其特征在于，\n包括：\n数据获取模块，用于获取网元的多种关键性能指标KPI对应的原始KPI数据组，每个原始KPI数据组是包含时间维度、网元维度和KPI维度的三维数据，原始KPI数据组中的原始KPI数据用于表示网元在第一时间段中每个周期内的第一度量区间的KPI；\n数据处理模块，用于通过对原始KPI数据组中的多个原始KPI数据进行统计分析，将原始KPI数据组转换为目标KPI数据组，目标KPI数据组是包含网元维度和KPI维度的二维数据，目标KPI数据组中的目标KPI数据用于表示网元在第一时间段中每个周期内的第二度量区间的统计值，其中，每个周期包括多个第二度量区间，所述第二度量区间的时长大于所述第一度量区间的时长；\n距离计算模块，用于计算网元的统计值，与所述统计值对应的均值之间的距离值，得到所述网元的距离值集合；\n第一检测模块，用于针对每个网元的距离值集合，做四分位数异常检测，得到所述网元的异常距离值的个数；\n距离统计模块，用于基于所述网元的距离值集合，统计得到网元的总距离值；\n第二检测模块，用于每个网元对应的异常距离值个数和总距离值，判断网元是否异常。\n10.一种电子设备，\n其特征在于，\n包括：\n存储器，用于存储指令；\n处理器，用于调用所述存储器中存储的指令，实现如权利要求1-8任一项所述的网元异常检测方法。\n11.一种计算机可读存储介质，其上存储有计算机指令，\n其特征在于，\n所述计算机指令被处理器执行时实现权利要求1-8中任意一项所述的网元异常检测方法。"
            }
        };
    },
    watch: {
        patentOption: {
            deep: true,
            immediate: true,
            handler(newVal) {
                // 增加一个判断，确保 newVal 是一个非 null 的对象
                if (newVal && typeof newVal === 'object') {
                    this.patentData = _deepClone(newVal);
                } else {
                    // 这里选择清空，你可以根据业务需求调整
                    this.patentData = {};
                }
            }
        }
    },
    computed: {
        // 颜色样式：优先用传入的color
        percentStyle() {
            const similarity = parseInt(this.patentData.relevancy) || 0; // 确保是数字类型
            let [color] = [undefined];
            if (similarity > 75) {
                // 红色系（主色+背景色）
                color = 'rgb(235, 87, 87)'; // 红色文本
            } else if (similarity >= 50) {
                // 橙黄色系（50-75）
                color = 'rgb(245, 158, 11)'; // 橙色文本
            } else {
                // 绿色系（<50）
                color = 'rgb(78, 181, 119)'; // 绿色文本
            }

            return { color };
        }
    },
    methods: {
        // 格式化日期，将 '20230511' 转为 '2023-05-11'
        formatDate(dateNum) {
            if (!dateNum) return '';
            const dateStr = String(dateNum);
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return `${year}-${month}-${day}`;
        },
        // 格式化法律状态，你可以根据实际的编码规则进行扩展
        // formatLegalStatus(statusCode) {
        //     if (!this.patentData || !this.patentData.legal_status) return '';
        //     let legal = legalStatusData.find(item => item.value == statusCode)
        //     return legal.label || `未找到法律状态`;
        // }
    }
}
</script>
<style scoped lang="scss">
/* 卡片样式 */
.patent-detail-card {
    background: #fff;
    padding: 24px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 每个 section 的标题 */
.section-title {
    font-size: 16px;
    font-weight: 500;
    color: #1f2329;
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
}

/* 基础信息采用网格布局 */
.basic-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px 24px;
    margin-bottom: 24px;
}

.info-item {
    display: flex;
    flex-direction: column;
}

/* 标签样式 */
.info-label {
    font-size: 12px;
    color: #6b7785;
    margin-bottom: 4px;
    font-weight: 500;
}

/* 块级标签，用于垂直排列的内容 */
.block-label {
    display: block;
    margin-bottom: 8px;
}

/* 值的样式 */
.info-value,
.summary-content,
.comparison-content,
.original-content {
    font-size: 14px;
    line-height: 1.5;
}

/* 相似度值的特殊样式 */
.similarity-value {
    font-weight: 600;
    font-size: 16px;
}

/* 总结、对比、原文信息的通用容器样式 */
.summary-info,
.comparison-info,
.original-info {
    margin-bottom: 24px;
}

.summary-item,
.comparison-item,
.original-item {
    margin-bottom: 16px;
}

/* 长文本内容样式优化 */
.summary-content,
.comparison-content,
.original-content {
    white-space: pre-wrap;
    /* 保留换行和空格 */
    word-break: break-word;
    /* 防止长单词溢出 */
    // background: #f7f8fa;
    padding: 12px;
    border-radius: 4px;
    // border: 1px solid #ebeef5;
    max-height: 200px;
    /* 限制最大高度 */
    overflow-y: auto;
    /* 内容超出时显示滚动条 */
}

/* 相似文本表格容器 */
.similar-text-table-container {
    background: #f7f8fa;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid #ebeef5;
}

/* 表格内文本内容样式，防止内容过长 */
.table-text-content {
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.4;
}

/* 每个 section 之间的间距 */
.detail-section {
    margin-bottom: 24px;
}
</style>