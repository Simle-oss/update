<template>
    <div class="collapse-card" :style="cardStyles">
        <!-- 卡片头部 -->
        <div class="card-header" @click="toggleCollapse" :style="headerStyles">
            <div class="header-left">
                <i :style="{ color: borderColor }" :class="icon" v-if="icon" class="header-icon"></i>
                <span :style="{ color: borderColor }" class="header-title">{{ title }}</span>
            </div>
            <section>
                <el-button type="text" style="margin-right: 12px;" @click="downloadReport">下载查新报告</el-button>
                <!-- 箭头图标 -->
                <i class="el-icon-arrow-down" v-if="!isExpanded"></i>
                <i class="el-icon-arrow-up" v-if="isExpanded"></i>
            </section>
        </div>

        <!-- 内容区域（包含理由+修改意见） -->
        <transition name="content-fade">
            <div class="card-content" v-if="isExpanded" ref="content">
                <el-divider class="line5" v-if="cardData.reason"></el-divider>
                <!-- 理由模块 -->
                <div class="reason-section" v-if="cardData.reason">
                    <h4 class="section-title">理由</h4>
                    <p class="reason-content">{{ cardData.reason }}</p>
                </div>
                <el-divider class="line12" v-if="cardData.suggestions.length"></el-divider>
                <!-- 修改意见模块 -->
                <div class="suggestion-section" v-if="cardData.suggestions.length">
                    <h4 class="section-title">修改意见</h4>
                    <ul class="suggestion-list">
                        <li class="suggestion-item" v-for="(item, index) in cardData.suggestions" :key="index">
                            {{ item }}
                        </li>
                    </ul>
                </div>

                <!-- 保留原插槽（支持额外内容） -->
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
    props: {
        title: { type: String, required: true },
        icon: { type: String, default: 'el-icon-info' },
        defaultExpanded: { type: Boolean, default: false },
        borderColor: { type: String, default: '#e4e7ed' },
        bgColor: { type: String, default: '#ffffff' },
        // 接收理由+修改意见的数据
        cardData: {
            type: Object,
            default: () => ({
                reason: '',
                suggestions: []
            })
        }
    },
    data() {
        return {
            isExpanded: this.defaultExpanded,
            contentHeight: 0
        };
    },
    computed: {
        cardStyles() {
            return {
                border: `1px solid ${this.borderColor}`,
                backgroundColor: this.bgColor
            };
        },
        headerStyles() {
            return {
                backgroundColor: this.bgColor
            };
        }
    },
    methods: {
        toggleCollapse() {
            this.isExpanded = !this.isExpanded;
            this.$emit('change', this.isExpanded);
        },
        downloadReport() {
            this.$emit('download-report');
        }
    },
    watch: {
        isExpanded(val) {
            if (val) {
                this.$nextTick(() => {
                    this.contentHeight = this.$refs.content.offsetHeight || 0;
                });
            } else {
                this.contentHeight = this.$refs.content.offsetHeight || 0;
                this.$nextTick(() => {
                    this.contentHeight = 0;
                });
            }
        }
    },
    mounted() {
        if (this.defaultExpanded) {
            this.$nextTick(() => {
                this.contentHeight = this.$refs.content.offsetHeight || 0;
            });
        }
    }
};
</script>

<style scoped>
.collapse-card {
    width: 100%;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    box-sizing: border-box;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.card-header:hover {
    background-color: #eff2f7;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.header-icon {
    font-size: 18px;
}

.header-title {
    font-size: 14px;
    font-weight: 500;
}

.card-content {
    padding: 0 16px;
    overflow: hidden;
    transition: padding 0.3s ease, height 0.3s ease;
    height: v-bind(contentHeight + 'px');
}

.card-content[style*="height"]:not([style*="0px"]) {
    padding: 16px;
}

/* 理由/意见模块样式 */
.section-title {
    font-size: 13px;
    color: #606266;
    margin: 0 0 8px;
    font-weight: 900;
}

.reason-content {
    font-size: 12px;
    color: #303133;
    line-height: 1.6;
    margin: 0 0 12px;
}

.suggestion-list {
    padding-left: 20px;
    margin: 0 0 8px;
}

.suggestion-item {
    font-size: 12px;
    color: #606266;
    line-height: 1.8;
}

.content-fade-enter-active,
.content-fade-leave-active {
    opacity: 1;
    transition: opacity 0.3s ease;
}

.content-fade-enter,
.content-fade-leave-to {
    opacity: 0;
}
</style>
<style>
.line12 {
    margin: 12px 0;
}

.line5 {
    margin: 5px 0;
}
</style>