<template>
  <view class="uni-container">
      <uni-forms ref="form" :model="formData" validate-trigger="submit" err-show-type="toast" label-align="right">
        <uni-forms-item name="parent_id" label="所属上级">
          <uni-data-picker v-model="selVal" :localdata="range" 
            :readonly="isRead" @nodeclick="onnodeclick" ref="pickerRef" />
        </uni-forms-item>
        <uni-forms-item name="name" label="类别名称" required>
          <uni-easyinput placeholder="类别名称" v-model="formData.name" trim="both" />
        </uni-forms-item>
        <uni-forms-item name="img" label="图标地址">
          <uni-file-picker file-mediatype='image' limit='1' v-model='imageValue' @success="success" />
        </uni-forms-item>
        <uni-forms-item name="sort" label="排序">
          <uni-easyinput placeholder="类别排序，越大越靠后" type="number" v-model="formData.sort" />
        </uni-forms-item>
        <uni-forms-item name="is_first" label="是否一级分类">
          <switch @change="binddata('is_first', $event.detail.value)" :checked="formData.is_first"
            style="transform:scale(0.8)" :disabled ='isRead' />
        </uni-forms-item>
        <view class="uni-button-group">
          <button type="primary" class="uni-button" @click="submit">提交</button>
          <navigator open-type="navigateBack" style="margin-left: 15px;">
            <button class="uni-button" style="width: 100px;">{{ $t('common.button.back') }}</button>
          </navigator>
        </view>
      </uni-forms>
  </view>
</template>

<script>
import { useStore } from 'vuex';
import { changeArray } from '@/utils/util.js'
const db = uniCloud.database();
const dbCollectionName = 'goods-category';


export default {
  name:'add_category',
  data() {
    let formData = {
      "parent_id": "",
      "name": "",
      "icon": "",
      "sort": null,
      "is_first": false,
    }
    const store = useStore();
    return {
      formData,
      formOptions: {},
      imageValue: [],
      isRead:false,
      selVal: '',
      range: [],
      store
    }
  },
  mounted() {
    this.getList()
    let id = this.$page.options.id
    if (id) {
      this.formDataId = id
      this.isRead = true
      this.getDetail(id)
    }
  },
  methods: {
    handleLoad(data) {
      this.range = changeArray(data);
    },
    getList() {
      //从store里面取值
      let list = this.store.state.goods.list;
      // console.log('store=====list=======',list)
      if (list && list.length > 0) {
        this.range = list;
      } else {
        this.store.dispatch('goods/getCategoryList').then((res) => {
        let list2 = res.data;
        this.handleLoad(list2)
      });
      }
    },
    success(e) {
      this.formData.icon = e.tempFilePaths[0]
      console.log('this==========',e)
    },
    onnodeclick(e) {
      this.formData.parent_id = e.value;
      this.selVal = e.value;
      // console.log('selVal===========',e.value)
    },
    /**
     * 验证表单并提交
     */
    submit() {
      uni.showLoading({
        mask: true
      });
      this.$refs.form.validate().then((res) => {
        return this.submitForm(res)
      }).catch(() => {
      }).finally(() => {
        uni.hideLoading()
      })
    },

    /**
     * 提交表单
     */
    submitForm(value) {
      // 使用 clientDB 提交数据
      console.log('this.formData===========',value, this.formData)
     
      // console.log('store============',this.store)
      //编辑
      if (this.formDataId) {
        return db.collection(dbCollectionName).doc(this.formDataId)
          .update({ ...value, icon: this.formData.icon }).then((res) => {
          uni.showToast({
            icon: 'none',
            title: '修改成功'
          })
          this.store.dispatch('goods/clearCategoryList')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      }

      //新增
      return db.collection(dbCollectionName).add(value).then((res) => {
        uni.showToast({
          icon: 'none',
          title: '新增成功'
        })
        this.store.dispatch('goods/clearCategoryList')
        setTimeout(() => uni.navigateBack(), 500)
      }).catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false
        })
      })


    },

    /**
     * 获取表单数据
     * @param {Object} id
     */
    getDetail(id) {
      uni.showLoading({
        mask: true
      })
      db.collection(dbCollectionName).doc(id).field("parent_id,name,icon,sort,is_first").get().then((res) => {
        const data = res.result.data[0]
        if (data) {
          this.formData = data;
          if (data.icon) {
            this.imageValue = [{
            "url":data.icon
          }]
          }
          this.selVal = data.parent_id
        }
      }).catch((err) => {
        uni.showModal({
          content: err.message || '请求服务失败',
          showCancel: false
        })
      }).finally(() => {
        uni.hideLoading()
      })
    }
  }
}

</script>

<style>
.uni-container {
  padding: 15px;
}

::v-deep .uni-forms-item__label {
  width: 140px !important;
}
</style>
