<template>
  <view class="uni-container">
    <view v-if="isLoading && formDataId"></view>
    <uni-forms v-else ref="form" :model="formData" validate-trigger="submit" err-show-type="toast" label-align="right">
      <uni-forms-item name="sort" label="排序" required>
        <uni-easyinput placeholder="类别排序，越大越靠后" type="number" v-model="formData.sort" />
      </uni-forms-item>
      <uni-forms-item name="classify_id" label="导航名称" required>
        <uni-easyinput placeholder="导航名称"  v-model="formData.classify_id" />
      </uni-forms-item>
      <uni-forms-item name="img_url" label="图片地址" required>
        <uni-file-picker file-mediatype='image' limit='1' v-model='imageValue' @success="success" />
      </uni-forms-item>
      <uni-forms-item name="status" label="是否启用">
        <switch @change="binddata('status', $event.detail.value)" :checked="formData.status"
          style="transform:scale(0.8)" />
      </uni-forms-item>
      <uni-forms-item name="open_url" label="跳转地址">
        <uni-easyinput placeholder="跳转地址" type="text" v-model="formData.open_url" />
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
const db = uniCloud.database();
const dbCollectionName = 'classify';

export default {
  data() {
    let formData = {
      "classify_id":'',
      "img_url": '',
      "sort": null,
      "status":false,
      "open_url": ''
    }
    return {
      formData,
      imageValue: [],
      selVal:'',
      formDataId:'',
      isLoading: true
    }
  },
  onLoad(e) {
    if (e.id) {
      const id = e.id
      this.formDataId = id
      this.getDetail(id)
    }
  },
  methods: {
    changePicker(e) {
      console.log("select change=========", e);
      this.formData.classify = e
    },
    success(e) {
      this.formData.img_url = e.tempFilePaths[0]
    },
    /**
     * 验证表单并提交
     */
    submit() {
      console.log('this.form===========', this.$refs.form)
      uni.showLoading({
        mask: true
      })
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
      console.log('value===========', value)
      let par= {...value,sort:parseInt(value.sort)}
      //编辑
      if (this.formDataId) {
        return db.collection(dbCollectionName).doc(this.formDataId).update(par).then((res) => {
          uni.showToast({
            icon: 'none',
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      }

      //新增
      return db.collection(dbCollectionName).add(par).then((res) => {
        uni.showToast({
          icon: 'none',
          title: '新增成功'
        })
        this.getOpenerEventChannel().emit('refreshData')
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
      db.collection(dbCollectionName).doc(id).get().then((res) => {
        const data = res.result.data[0]
        console.log('getDetail============',data)
        if (data) {
          this.formData = data
          this.imageValue.push({ url: data.img_url, extname: 'png', name: '1.png' })
          this.isLoading = false
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
