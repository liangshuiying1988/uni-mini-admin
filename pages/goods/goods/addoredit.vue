<template>
  <view class="uni-container">
      <uni-forms ref="form" :model="formData" validate-trigger="submit" err-show-type="toast" label-align="right">
        <uni-forms-item name="category_id" label="所属分类">
          <uni-data-picker v-model="formData.category_id" :localdata="range" 
            :readonly="isRead" @change="onchange" ref="pickerRef" />
        </uni-forms-item>
        <uni-forms-item name="name" label="商品名称" required>
          <uni-easyinput placeholder="商品名称" v-model="formData.name" trim="both" />
        </uni-forms-item>
        <view>
          <span class="sku">商品规格</span>
          <button type="primary" @click="addSku" class="uni-button add-sku-btn">添加商品规格</button>
          <view class="sku-box">
            <view class="sku-item">规格id</view>
            <view class="sku-item">颜色</view>
            <view class="sku-item">尺码</view>
            <view class="sku-item">价格</view>
            <view class="sku-item">库存</view>
          </view>
            <view v-for="item in formData.goods_sku" :key="item.id" class="sku-box">
              <uni-easyinput type="text" v-model="item.sku_id" placeholder="请输入规格id"/>
              <uni-easyinput type="text" v-model="item.color" placeholder="请输入颜色"/>
              <uni-easyinput type="text" v-model="item.size" placeholder="请输入尺码"/>
              <uni-easyinput type="text" v-model="item.price" placeholder="请输入价格"/>
              <uni-easyinput type="number" v-model="item.num" placeholder="请输入库存"/>
            </view>
        </view>
        <uni-forms-item name="goods_desc" label="商品描述">
          <uni-easyinput placeholder="商品描述" v-model="formData.goods_desc" trim="both" />
        </uni-forms-item>
        <uni-forms-item name="goods_thumb" label="商品主图">
          <uni-file-picker file-mediatype='image' limit='1' v-model='imageValue' @success="success" />
        </uni-forms-item>
        <uni-forms-item name="goods_banner_imgs" label="轮播图">
          <uni-file-picker file-mediatype='image' limit='6' v-model='images' @success="bnnerSuccess" />
        </uni-forms-item>
        
        <uni-forms-item name="is_on_sale" label="是否上架">
          <switch @change="binddata('is_on_sale', $event.detail.value)" :checked="formData.is_on_sale"
            style="transform:scale(0.8)" />
        </uni-forms-item>
        <uni-forms-item name="is_hot" label="是否热销">
          <switch @change="binddata('is_hot', $event.detail.value)" :checked="formData.is_hot"
            style="transform:scale(0.8)"/>
        </uni-forms-item>
        <uni-forms-item name="seller_note" label="商家备注">
          <uni-easyinput  type="text" v-model="formData.seller_note" />
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
const dbCollectionName = 'open-goods';


export default {
  name:'add_goods',
  data() {
    let formData = {
      "category_id": "",
      "goods_sku": [{
        id:Math.random().toString(10),
        sku_id: '',
        color: '',
        size: '',
        price: 1,
        num:1
      }], // sku
      "goods_desc":'',
      "name": "",
      "goods_thumb": "",
      "goods_banner_imgs":[],
      "is_on_sale": true,
      "is_hot" :false,
      "seller_note":''
    }
    const store = useStore();
    return {
      formData,
      formOptions: {},
      imageValue: [],
      images:[],
      isRead:false,
      range: [],
      store
    }
  },
  mounted() {
    this.getList();
    let id = this.$page.options.id;
    if (id) {
      this.formDataId = id
      this.isRead = true
      this.getDetail(id)
    }
  },
  methods: {
    addSku() {
      let addArr = JSON.parse(JSON.stringify(this.formData.goods_sku))
      addArr.push({
        id: Math.random().toString(10),
        sku_id: null,
        color: '',
        size: '',
        price: '',
        num: ''})
      this.formData.goods_sku = addArr
    },
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
    bnnerSuccess(e) {
      this.formData.goods_banner_imgs.push( e.tempFilePaths[0]);
      console.log('==bnnerSuccess=====',e,this.formData.goods_banner_imgs)
    },
    success(e) {
      this.formData.goods_thumb = e.tempFilePaths[0]
      console.log('success==========',e,this.formData.goods_thumb)
    },
    onchange(e) {
      this.formData.category_id = e.detail.value[e.detail.value.length - 1].value;
      console.log('selVal===========',e.detail.value[e.detail.value.length - 1].value)
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
          .update({ ...value, goods_sku: this.formData.goods_sku }).then((res) => {
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
      return db.collection(dbCollectionName).add({ ...value, goods_sku: this.formData.goods_sku }).then((res) => {
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
      db.collection(dbCollectionName).doc(id).get().then((res) => {
        const data = res.result.data[0]
        console.log('data============',data)
        if (data) {
          this.formData = data;
          if (data.goods_thumb) {
            this.imageValue = [{
              "url":data.goods_thumb
            }]
          }
          if (data.goods_banner_imgs) {
            let res= []
            data.goods_banner_imgs.map((item) => {
              res.push({
                "url":item
              })
            })
            this.images = res;
          }
          
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
.sku{
  padding-left: 60px;
  font-size: 14px;
  color: #606266;
}
.add-sku-btn{
  display: inline-block;
  width: 126px;
  margin-left: 25px;
}
.sku-box{
  margin: 20px 0;
  /* background-color: #ff8fff; */
  width: 800px;
  display: flex;
  flex-wrap: wrap;
  padding: 0 10px;
}
.sku-item{
  flex:140px;
  margin:10px;
  text-align: center;
}

::v-deep .uni-forms-item__label {
  width: 140px !important;
}
</style>
