<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search" :placeholder="$t('common.placeholder.query')" />
				<button class="uni-button hide-on-phone" type="default" size="mini" @click="search">{{$t('common.button.search')}}</button>
				<button class="uni-button" type="primary" size="mini" @click="navigateTo('./addoredit')">{{$t('common.button.add')}}</button>
				<button class="uni-button" type="warn" size="mini" :disabled="!selectedIndexs.length"
					@click="delTable">{{$t('common.button.batchDelete')}}</button>
			</view>
		</view>
		<view class="uni-container">
			<unicloud-db ref="gcdb" collection="goods-category" :where="where"
				page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
				:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error,options}"
				:options="options" loadtime="manual">
				<uni-table ref="table" :loading="loading" 
					:emptyText="error.message || $t('common.empty')" border stripe
					type="selection" @selection-change="selectionChange"
				>
					<uni-tr>
						<uni-th align="center">id</uni-th>
						<uni-th
						  align="center" 
							filter-type="search" 
							@filter-change="filterChange($event, 'name')"
						>
							分类名称
						</uni-th>
						<uni-th align="center">是否一级分类</uni-th>
						<uni-th align="center">上级分类</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">
						<uni-td align="center">{{item._id}}</uni-td>
						<uni-td align="center">{{item.name}}</uni-td>
						<uni-td align="center">{{item.is_first ? '是':"否"}}</uni-td>
						<uni-td align="center">{{item.parent_id ? item.parent_id : '-'}}</uni-td>
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
	import {filterToWhere} from '@/js_sdk/validator/goods-category.js';

	const db = uniCloud.database()
	// 表查询配置
	const dbSearchFields = ['_id', 'name','parent_id'] // 支持模糊搜索的字段列表
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
			},
			filterChange(e, name) {
				this._filter[name] = {
					type: e.filterType,
					value: e.filter
				}
				let newWhere = filterToWhere(this._filter, db.command)
				if (Object.keys(newWhere).length) {
					this.where = newWhere
				} else {
					this.where = ''
				}
				this.$nextTick(() => {
					this.$refs.gcdb.loadData()
				})
			}
		}
	}
</script>

<style>
</style>
