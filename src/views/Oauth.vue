<script>
import { queryTokenByCode } from "@/api/login";
import { setToken } from "@/utils/auth";
import { getParamsFromUrl } from "@/utils";
import tracker from '@/utils/tracker.js';

export default {
  name: "Oauth",

  async created() {
    const codeFlag = location.href.includes("code");
    console.log(codeFlag, "codeFlag");
    // 如果url里面没有参数，表示需要手动重定向
    const client_id = "246a2b33206315tz9f0s";
    // const client_id = '246787357607dfhdjgoy'
    const type = "code";
    const state = "string";
    const redirect_uri = "https://124.127.116.3:9100/%23/oauth";
    const scope = "projectId:12";

    if (!codeFlag) {
      location.href = `https://www.srdcloud.cn/login/oauth/authorize?response_type=${type}&client_id=${client_id}&state=${state}&redirect_uri=${redirect_uri}&scope=${scope}`;
    }
    // 反之就是直接获取code参数 换取token
    else {
      this.redirectUri();
    }
  },
  methods: {
    async redirectUri() {
      try {
        // 获取URL中的oauth参数
        const data = getParamsFromUrl(location.href);
        // 检查参数是否存在
        if (!data.code) {
          console.error("URL中未包含有效的oauth参数");
          // 可以添加跳转至错误页或登录页的逻辑
          return;
        }
        const code = data.code;
        const tokenRes = await queryTokenByCode(code);
        if (tokenRes.status == "success") {
          tracker.track({ functionName: '用户登录', pageName: "研发云", status: 'success' });
          setToken(tokenRes.token);
        }
        await this.$store.commit("SET_USER_INFO", {
          user_id: tokenRes.user_id,
          email: tokenRes.email,
          username: tokenRes.username,
          org: tokenRes.org,
          token: tokenRes.token,
        });
        this.$router.push("/");
      } catch (error) {
        // 集中处理所有可能的错误
        // console.error("认证过程出错:", error.message);
        // 可以根据错误类型进行不同处理
        // 例如：this.$router.push('/login?error=认证失败');
      }
    },
  },
};
</script>
