<template>
  <el-container class="out-container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="logo" />
        <span>后台管理系统</span>
      </div>
      <el-button class="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isToggle? '64px' :'200px' ">
        <div class="toggleMenu" @click="toggleMenu">||||</div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="rgb(57,132,225)"
          unique-opened
          :collapse="isToggle"
          :collapse-transition="false"
          router
          :default-active='activePath'
        >
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item
              :index="'/'+childitem.path"
              v-for="childitem in item.children"
              :key="childitem.id"
              @click="getActivePath('/'+childitem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{childitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      isToggle: false,
      activePath: '',
      menuList: [],
      iconObj: {
        '125': 'el-icon-s-custom',
        '103': 'el-icon-s-tools',
        '101': 'el-icon-s-goods',
        '102': 'el-icon-s-order',
        '145': 'el-icon-s-data'
      }
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    toggleMenu() {
      this.isToggle = !this.isToggle
    },
    getActivePath(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;

    },
    // 发送菜单栏请求的方法
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      this.menuList = res.data
  
    }
  }
}
</script>

<style lang="less" scoped >
.out-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    border-radius: 50%;
    display: flex;
    align-items: center;
  }
  span {
    font-size: 20px;
    font-weight: 700;
    padding: 0px 20px;
    color: #fff;
  }
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #fff;
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.el-menu {
  border-right: none;
}
.toggleMenu {
  background-color: rgb(175, 166, 166);
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  text-align: center;
  letter-spacing: 0.8px;
  cursor: pointer;
}
</style>