<template>
    <!-- 密码修改弹框，通过passwordLayer控制显示隐藏 -->
    <el-dialog title="修改密码" :visible="passwordLayer" :close-on-click-modal="false" :destroy-on-close="true"
        append-to-body width="500px" @close="$emit('update:passwordLayer', false)">
        <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="120px"
            class="password-form">
            <!-- 旧密码 -->
            <el-form-item label="旧密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码"
                    autocomplete="new-password" clearable></el-input>
            </el-form-item>

            <!-- 新密码 -->
            <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码（至少6位，包含字母和数字）"
                    autocomplete="new-password" clearable @input="checkPasswordStrength"></el-input>
                <!-- 密码强度提示 -->
                <div v-if="passwordForm.newPassword" class="password-strength">
                    <div :class="['strength-bar', getStrengthClass(1)]"></div>
                    <div :class="['strength-bar', getStrengthClass(2)]"></div>
                    <div :class="['strength-bar', getStrengthClass(3)]"></div>
                    <span class="strength-text">{{ strengthText }}</span>
                </div>
            </el-form-item>

            <!-- 重复新密码 -->
            <el-form-item label="重复新密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"
                    autocomplete="new-password" clearable></el-input>
            </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer" style="text-align: right;">
            <el-button @click="$emit('update:passwordLayer', false)">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { Message } from 'element-ui'
import { updatePassword } from '@/api/login' // 假设这是修改密码的API
import cache from '@/plugins/cache' // 假设这是缓存插件
import { removeToken } from "@/utils/auth";
import { PasswordEncryptor } from '@/utils/index';
export default {
    props: {
        // 控制弹框显示/隐藏的绑定值
        passwordLayer: {
            type: Boolean,
            default: false
        }
    },
    data() {
        // 验证两次密码是否一致
        const validateConfirmPassword = (rule, value, callback) => {
            if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的新密码不一致'))
            } else {
                callback()
            }
        }

        // 验证密码强度
        const validatePasswordStrength = (rule, value, callback) => {
            if (value.length < 6) {
                callback(new Error('密码长度不能少于6位'))
            } else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
                callback(new Error('密码必须包含字母和数字'))
            } else {
                callback()
            }
        }

        return {
            // 表单数据
            passwordForm: {},
            // 表单验证规则
            passwordRules: {
                oldPassword: [
                    { required: true, message: '请输入旧密码', trigger: 'blur' }
                ],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    { validator: validatePasswordStrength, trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请再次输入新密码', trigger: 'blur' },
                    { validator: validateConfirmPassword, trigger: 'blur' }
                ]
            },
            // 密码强度相关
            passwordStrength: 0,
            strengthText: null
        }
    },
    methods: {
        // 检查密码强度
        checkPasswordStrength() {
            const password = this.passwordForm.newPassword
            if (!password) {
                this.passwordStrength = 0
                this.strengthText = null
                return
            }

            let strength = 0
            // 长度检查
            if (password.length >= 8) strength++
            // 包含字母和数字
            if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) strength++
            // 包含特殊字符
            if (/[^A-Za-z0-9]/.test(password)) strength++

            this.passwordStrength = strength

            // 设置强度文本
            switch (strength) {
                case 0:
                case 1:
                    this.strengthText = '弱'
                    break
                case 2:
                    this.strengthText = '中'
                    break
                case 3:
                    this.strengthText = '强'
                    break
            }
        },

        // 获取密码强度条样式
        getStrengthClass(level) {
            if (this.passwordStrength >= level) {
                return level === 1 ? 'weak' : level === 2 ? 'medium' : 'strong'
            }
            return 'empty'
        },

        // 提交表单
        handleSubmit() {
            this.$refs.passwordForm.validate((valid) => {
                if (valid) {
                    // 传参的时候不用重复的密码字段
                    const { oldPassword, newPassword } = this.passwordForm;
                    const data = { old_password: oldPassword, new_password: newPassword };
                    data.new_password = PasswordEncryptor.encrypt(newPassword);   // 新密码加密
                    // 表单验证通过，调用修改密码API
                    updatePassword(data)
                        .then(response => {
                            if (response.status === 'success') {
                                Message.success('密码修改成功，请重新登录')
                                cache.clear() // 清除缓存
                                removeToken() // 清除Token
                                this.$emit('update:passwordLayer', false)
                                this.$refs.passwordForm.resetFields()
                                this.$emit('password-updated')
                            } else {
                                Message.error(response.message || '密码修改失败，请重试')
                            }
                        })
                        .catch(error => {
                            Message.error(error.message || '密码修改失败，请重试')
                        })
                } else {
                    // 表单验证失败
                    return false
                }
            })
        }
    },
    watch: {
        // 监听弹框关闭，重置表单
        passwordLayer(newVal) {
            if (!newVal) {
                this.$refs.passwordForm && this.$refs.passwordForm.resetFields()
                this.passwordStrength = 0
                this.strengthText = null
            }
        }
    }
}
</script>

<style scoped>
.password-form {
    margin-top: 15px;
}

.password-strength {
    display: flex;
    align-items: center;
    margin-top: 8px;
    height: 20px;
}

.strength-bar {
    width: 80px;
    height: 6px;
    margin-right: 5px;
    border-radius: 3px;
    background-color: #eee;
}

.strength-bar.weak {
    background-color: #ff4d4f;
}

.strength-bar.medium {
    background-color: #faad14;
}

.strength-bar.strong {
    background-color: #52c41a;
}

.strength-bar.empty {
    background-color: #eee;
}

.strength-text {
    margin-left: 10px;
    font-size: 12px;
    color: #666;
}
</style>