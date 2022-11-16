<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入商品名称" />
				<button class="uni-button hide-on-phone" type="default" size="mini" @click="search">搜索</button>
				<button class="uni-button" type="primary" size="mini" @click="navigateTo('./addoredit')">新增</button>
				<button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length"
					@click="delTable">批量删除</button>
			</view>
		</view>
		<view class="uni-container">
			<!-- 联表查询 -->
			<unicloud-db ref="gcdb" collection="open-goods,goods-category" :where="where" 
				field="category_id{_id,name},goods_sku,name as goods_name,goods_thumb"
				page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
				:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error,options}"
				:options="options" loadtime="manual" @load="handleLoad">
				<uni-table ref="table" :loading="loading" 
					:emptyText="error.message || $t('common.empty')" border stripe
					type="selection" @selection-change="selectionChange"
				>
					<uni-tr>
						<uni-th align="center">所属分类</uni-th>
						<uni-th align="center">商品名称</uni-th>
						<uni-th align="center">商品主图</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">
						<uni-td align="center">{{item.category_id[0].name}}</uni-td>
						<uni-td align="center" width="500">{{item.goods_name}}</uni-td>
						<uni-td align="center">
							<image :src="item.goods_thumb" class="imgStyle"/>
						</uni-td>
						<uni-td align="center">
							<view class="uni-group">
								<button @click="navigateTo('./addoredit?id='+item._id, false)" class="uni-button" size="mini"
									type="primary">{{$t('common.button.edit')}}</button>
								<button @click="confirmDelete(item._id)" class="uni-button" size="mini"
									type="warn">{{$t('common.button.delete')}}</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon show-page-size :page-size="pagination.size" v-model="pagination.current"
						:total="pagination.count" @change="onPageChanged" @pageSizeChange="changeSize"/>
				</view>
			</unicloud-db>
		</view>
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	// 表查询配置
	const dbSearchFields = ['goods_name'] // 支持模糊搜索的字段列表
	const pageSize = 20
	const pageCurrent = 1

	export default {
		data() {
			return {
				query: '',
				where: '',
				orderByFieldName: "",
				selectedIndexs: [],
				options: {
					pageSize,
					pageCurrent,
					filterData: {}
				},
				imageStyles: {
					width: 64,
					height: 64
				}
			}
		},
		onLoad() {
			this._filter = {}
		},
		onReady() {
			this.$refs.gcdb.loadData()
		},
		methods: {
			changeSize(pageSize) {
				this.options.pageSize = pageSize
				this.options.pageCurrent = 1
				this.$nextTick(() => {
					this.loadData()
				})
			},
			getWhere() {
				const query = this.query.trim()
				if (!query) {
					return ''
				}
				const queryRe = new RegExp(query, 'i')
				return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
			},
			search() {
				const newWhere = this.getWhere()
				console.log('newWhere==========',newWhere)
				this.where = newWhere
				this.$nextTick(() => {
					this.loadData()
				})
			},
			loadData(clear = true) {
				this.$refs.gcdb.loadData({
					clear
				})
			},
			handleLoad(data, ended, pagination) {
				// `data` 当前查询结果
				// `ended` 是否有更多数据
				console.log('data===============',data)
			},
			onPageChanged(e) {
				this.selectedIndexs.length = 0
				this.$refs.table.clearSelection()
				this.$refs.gcdb.loadData({
					current: e.current
				})
			},
			navigateTo(url, clear) {
				// clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
				uni.navigateTo({
					url,
					events: {
						refreshData: () => {
							this.loadData(clear)
						}
					}
				})
			},
			// 多选处理
			selectedItems() {
				var dataList = this.$refs.gcdb.dataList
				return this.selectedIndexs.map(i => dataList[i]._id)
			},
			// 批量删除
			delTable() {
				this.$refs.gcdb.remove(this.selectedItems(), {
					success: (res) => {
						this.$refs.table.clearSelection()
					}
				})
			},
			// 多选
			selectionChange(e) {
				this.selectedIndexs = e.detail.index
			},
			confirmDelete(id) {
				this.$refs.gcdb.remove(id, {
					success: (res) => {
						this.$refs.table.clearSelection()
					}
				})
			}
		}
	}
</script>

<style>
.imgStyle{
	max-height: 60px;
	max-width: 60px;
}
</style>
