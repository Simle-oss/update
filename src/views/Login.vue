<template>
  <div class="container">
    <div class="images">
      <img class="frame" src="@/assets/login_imgs/Frame.png">
      <br>
      <img class="system_img" src="@/assets/login_imgs/system_title.png">
    </div>
    <el-form ref="form" :model="form" :rules="rules" class="form" @submit.native.prevent>
      <h1 class="title">登 录</h1>
      <el-form-item prop="login_id">
        <el-input class="login_user" v-model="form.login_id" placeholder="请输入用户名，为邮箱或手机号" clearable
          prefix-icon="el-icon-user-solid" autocomplete="off"></el-input>
      </el-form-item>
      <br>
      <el-form-item prop="password">
        <el-input class="login_password" v-model="form.password" placeholder="请输入密码，初始密码为邮箱" clearable show-password
          prefix-icon="el-icon-lock"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button class="login_btn" type="primary" style="width:100%" @click="onSubmit" :loading='loading'>
          登 录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getNotice } from '@/api/login.js';
import tracker from '@/utils/tracker.js';
import { encryptPassword } from '@/utils/crypto';
export default {
  data() {
    return {
      loading: false,
      form: {
        login_id: null,
      },
      rules: {
        login_id: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "change" },
        ],
      },
    };
  },
  async created() {
    window.addEventListener("keypress", this.onEnter);
  },
  beforeDestroy() {
    window.removeEventListener("keypress", this.onEnter);
  },
  methods: {
    onSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            this.loading = true;
            let params = { ...this.form };
            // 把密码加密
            // const { hash: encryptedPassword } = await PasswordEncryptor.encrypt(this.form.password);
            params.password = encryptPassword(params.password); // 直接赋值加密后的哈希值
            tracker.track({ functionName: '用户登录', pageName: "登录页", status: 'processing' });

            this.$store.dispatch("userLogin", params)
              .then(async () => {
                this.loading = false;
                this.$message.success("登录成功！");
                tracker.track({ functionName: '用户登录', pageName: "登录页", status: 'success' });
                // 成功之后需要获取一个通知的接口
                let noticeRes = await getNotice();
                if (noticeRes.show) {
                  this.$notify({
                    title: noticeRes.title,
                    message: noticeRes.message,
                    type: 'warning',
                    duration: 10000
                  });
                }
                setTimeout(() => {
                  this.$router.push({ path: "/" });
                }, 500);
              })
              .catch((err) => {
                tracker.track({ functionName: '用户登录', pageName: "登录页", status: 'failed' });
                this.loading = false;
                this.$message.error(err);
              })
          } catch (error) {
            this.loading = false;
            this.$message.error(error.message);
          }
        }
      });
    },
    // 监听回车事件
    onEnter(e) {
      if (e.key === "Enter") {
        this.onSubmit();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  display: flex;
  min-height: 100vh;
  padding: 0 20px;
  box-sizing: border-box;
  background-image: url('../assets/login_imgs/login_bg.jpg');
  background-size: 100% 100%;

  .images {
    height: 32vh;
    padding-left: 4vw;

    .frame {
      height: 50%;
    }

    .system_img {
      width: 35%;
      margin-left: 14vw;
    }
  }
}

.form {
  color: #fff;
  background-color: #fff;
  width: 25%;
  height: 50vh;
  position: fixed;
  top: 20%;
  right: 15%;
}

.form .title {
  font-size: 36px;
  padding: 12px 0;
  text-align: center;
  color: #000;
  margin: 15px 0;
}
</style>
<style>
.login_user,
.login_password {
  width: 80%;
  height: 45px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);

  .el-input__inner {
    height: 100%;
  }
}

.login_btn {
  width: 80% !important;
  height: 45px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, #6872f9, #6c1ed3);
  border: none;
  font-size: 16px;
  margin-top: 5vh;

  &:hover {
    background: linear-gradient(to bottom, #6c7ffa, #7c2ed3);
  }
}
</style>
