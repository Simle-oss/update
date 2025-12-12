<template>
    <div class="patent-card">
        <!-- 专利头部信息 -->
        <div class="patent-header">
            <!-- 相似度标签：优先用传入的similarity，默认90% -->
            <span class="similarity-tag" :style="percentStyle">{{ patentData.similarity}}</span>
            <!-- 专利名称：优先用传入的name，默认"专利名称一种xx的xxx" -->
            <span class="patent-name">{{ patentData.name }}</span>
            <div class="patent-meta">
                <!-- 专利号：优先用传入的number，默认"CN38695798227" -->
                <span class="patent-number">{{ patentData.number }}</span>
                <!-- 专利状态：优先用传入的status，默认"有效" -->
                <span class="patent-status">{{ patentData.status }}</span>
            </div>
        </div>

        <!-- 相似技术模块 -->
        <div class="section">
            <h4 class="section-title">相似技术</h4>
            <p class="effect-content">
                {{ patentData.techList }}
            </p>
        </div>

        <!-- 相似效果模块 -->
        <div class="section">
            <h4 class="section-title">相似效果</h4>
            <!-- 相似效果内容：优先用传入的effectContent，默认示例文本 -->
            <p class="effect-content">
                {{ patentData.effectContent }}
            </p>
        </div>

        <!-- 公开信息 + 查看详情 -->
        <div class="footer">
            <!-- 公开日：优先用传入的publishDate，默认"2021-10-31" -->
            <span class="publish-date">公开日: {{ patentData.publishDate }}</span>
            <span>{{ patentData.company }}</span>
            <button class="detail-btn" @click="handleViewDetail">查看详情 ></button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        patentData: {
            type: Object,
            default: () => ({
                // 所有字段均设置默认值，确保无传入时正常显示
                similarity: "90%",
                name: "专利名称一种xx的xxx",
                number: "CN38695798227",
                status: "有效",
                techList: ["相似技术A，文本文本", "相似技术B，文本文本"],
                effectContent: "Data Processing: Advanced AI systems, like neural networks, can engage in processes that might resemble dreaming in a metaphorical sense. For example, during periods of inactivity, an AI might process data, update models, or run simulations to improve its performance.",
                publishDate: "2021-10-31",
                company:""
            })
        }
    },
    computed: {
        // 颜色样式：优先用传入的color和bgColor，默认绿色系
        percentStyle() {
            const similarity = parseInt(this.patentData.similarity) || 0; // 确保是数字类型
            let [color, bgColor] = [undefined, undefined];
            if (similarity > 75) {
                // 红色系（主色+背景色）
                color = 'rgb(235, 87, 87)'; // 红色文本
                bgColor = 'rgb(254, 226, 226)'; // 浅红背景
            } else if (similarity >= 50) {
                // 橙黄色系（50-75）
                color = 'rgb(245, 158, 11)'; // 橙色文本
                bgColor = 'rgb(255, 248, 225)'; // 浅橙背景
            } else {
                // 绿色系（<50）
                color = 'rgb(78, 181, 119)'; // 绿色文本
                bgColor = 'rgb(229, 243, 235)'; // 浅绿背景
            }

            return { color, backgroundColor: bgColor };
        }
    },
    methods: {
        handleViewDetail() {
            this.$emit("view-detail", this.patentData.number);
        }
    }
};
</script>

<style scoped>
/* 样式保持不变 */
.patent-card {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 12px 16px;
    background-color: #fff;
    margin: 8px 0;
}

.patent-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.similarity-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
}

.patent-name {
    flex: 1;
    font-size: 14px;
    color: #303133;
}

.patent-meta {
    display: flex;
    gap: 10px;
    font-size: 12px;
    color: #909399;
    align-items: baseline;
}

.section {
    margin-bottom: 12px;
}

.section-title {
    font-size: 13px;
    color: #606266;
    margin-bottom: 6px;
    font-weight: 500;
}

.effect-content {
    font-size: 12px;
    color: #606266;
    line-height: 1.6;
    margin: 0;
}

.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #909399;
}

.detail-btn {
    background: none;
    border: none;
    color: #409eff;
    cursor: pointer;
    padding: 0;
    font-size: 12px;
}

.detail-btn:hover {
    color: #66b1ff;
}
</style>