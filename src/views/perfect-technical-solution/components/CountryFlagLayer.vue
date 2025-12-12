<template>
    <div class="country-tree-select">
        <!-- 只读输入框：回显国旗+名称 -->
        <div class="tree-input" @click.stop="showDialog = true">
            <div v-if="value.length > 0" class="selected-tags">
                <!-- 输入框内显示：国旗+名称 -->
                <span v-for="item in selectedItems" :key="item.value" class="tag-item">
                    <img :src="getFlagUrl(item.value)" class="flag-icon" :alt="item.label">
                    <span>{{ item.label }}</span>
                </span>
                <span class="selected-tags-num">{{ selectedItems.length + '/' + 174 }}</span>
            </div>
            <input v-else type="text" :value="displayText" readonly class="hidden-input" placeholder="请选择国家/地区">
        </div>

        <el-dialog title="选择国家/地区" :visible.sync="showDialog" width="500px" :before-close="handleCancel">
            <div class="tree-content">
                <ul class="country-tree">
                    <li v-for="region in countryData" :key="region.value" class="region-item">
                        <label class="region-label">
                            <input type="checkbox" :checked="isRegionChecked(region)"
                                @change="handleRegionChange(region, $event.target.checked)" @click.stop />
                            {{ region.label }}
                        </label>
                        <ul class="country-list">
                            <li v-for="country in region.children" :key="country.value" class="country-item">
                                <label class="country-label">
                                    <input type="checkbox" :checked="tempSelectedValues.includes(country.value)"
                                        @change="handleCountryChange(country.value, $event.target.checked)"
                                        @click.stop />
                                    <!-- 树形内显示国旗+名称 -->
                                    <img :src="getFlagUrl(country.value)" class="flag-icon" :alt="country.label">
                                    <span>{{ country.label }}</span>
                                </label>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click.prevent="handleConfirm">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { countryData as countryList } from '@/utils/dict';
export default {
    model: {
        prop: 'value',
        event: 'input'
    },
    props: {
        value: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            showDialog: false,
            tempSelectedValues: []
        };
    },
    computed: {
        countryData() {
            return countryList
        },
        // 输入框显示的纯文本（用于input的fallback）
        displayText() {
            return this.selectedItems.map(item => item.label).join('; ') || '';
        },
        // 选中的国家对象集合（包含label和value）
        selectedItems() {
            const items = [];
            this.countryData.forEach(region => {
                region.children.forEach(country => {
                    if (this.value.includes(country.value)) {
                        items.push(country);
                    }
                });
            });
            return items;
        }
    },
    methods: {
        // 获取国旗图片路径（假设图片放在src/assets/flags目录下）
        getFlagUrl(code) {
            // 转换为小写（如CN -> cn），与图片文件名对应
            return require(`@/assets/flags/${code.toLowerCase()}.png`);
        },
        isRegionChecked(region) {
            const countryValues = region.children.map(c => c.value);
            return countryValues.every(value => this.tempSelectedValues.includes(value));
        },
        handleRegionChange(region, checked) {
            const countryValues = region.children.map(c => c.value);
            if (checked) {
                countryValues.forEach(value => {
                    if (!this.tempSelectedValues.includes(value)) {
                        this.tempSelectedValues.push(value);
                    }
                });
            } else {
                this.tempSelectedValues = this.tempSelectedValues.filter(
                    value => !countryValues.includes(value)
                );
            }
        },
        handleCountryChange(value, checked) {
            if (checked && !this.tempSelectedValues.includes(value)) {
                this.tempSelectedValues.push(value);
            } else if (!checked && this.tempSelectedValues.includes(value)) {
                this.tempSelectedValues = this.tempSelectedValues.filter(v => v !== value);
            }
        },
        handleConfirm() {
            this.$emit('input', [...this.tempSelectedValues]);
            this.showDialog = false;
        },
        handleCancel() {
            this.showDialog = false;
        }
    },
    watch: {
        showDialog(val) {
            if (val) {
                this.tempSelectedValues = [...this.value];
            }
        },
        value(newVal) {
            this.tempSelectedValues = [...newVal];
        }
    }
};
</script>

<style scoped lang="scss">
.country-tree-select {
    width: 736px;
}

/* 缩放110%时（1920px下目标655px） */
@media (max-width: 1745px) {
    .country-tree-select {
        width: 655px;
    }
}

/* 缩放125%时（1920px下目标564px） */
@media (max-width: 1536px) {
    .country-tree-select {
        width: 564px;
    }
}

/* 缩放150%时（1920px下目标447px） */
@media (max-width: 1280px) {
    .country-tree-select {
        width: 447px;
    }
}

@media (max-width: 960px) {
    .country-tree-select {
        width: 368px;
    }
}

/* 输入框样式改造 */
.tree-input {
    width: 100%;
    min-height: 36px;
    max-height: 100px;
    overflow-y: scroll;
    padding: 4px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    background-color: #fff;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

/* 隐藏原生input，仅用于占位符和表单兼容 */
.hidden-input {
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    flex: 1;
    min-width: 100px;
    height: 24px;
    cursor: pointer;
}

/* 选中项标签样式 */
.selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    &-num {
        margin-left: auto;
        font-size: 12px;
        color: #999;
    }
}

.tag-item {
    display: flex;
    align-items: center;
    padding: 0 8px;
    background-color: #f0f2f5;
    border-radius: 8px;
    font-size: 12px;
}

/* 国旗图标样式 */
.flag-icon {
    width: 16px;
    height: 12px;
    object-fit: cover;
    border-radius: 2px;
}

/* 树形内国家标签样式 */
.country-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.tree-content {
    max-height: 300px;
    overflow-y: auto;
    padding: 5px 0;
}

.country-tree {
    list-style: none;
    padding: 0;
    margin: 0;
}

.region-item {
    margin-bottom: 15px;
}

.region-label {
    font-weight: bold;
    display: block;
    margin-bottom: 8px;
    color: #333;
    cursor: pointer;
}

.country-list {
    list-style: none;
    padding: 0 0 0 20px;
    margin: 0;
}

.country-item {
    margin-bottom: 6px;
    color: #666;
}

::v-deep .dialog-footer {
    padding: 10px 20px 10px;
}
</style>