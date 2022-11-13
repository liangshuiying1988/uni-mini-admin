<template>
	<view class="fix-top-window">
		<view class="uni-header">
			<uni-stat-breadcrumb class="uni-stat-breadcrumb-on-phone" />
			<button class="uni-button" type="primary" size="mini" @click="navigateTo('./addoredit')">{{$t('common.button.add')}}</button>
		</view>
		<view class="uni-container">
			<unicloud-db ref="cdb" collection="classify" 
				page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
				:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error,options}"
				:options="options" loadtime="manual">
				<uni-table ref="table" :loading="loading" 
					:emptyText="error.message || $t('common.empty')" border stripe
				>
					<uni-tr>
						<uni-th align="center">排序</uni-th>
						<uni-th align="center">导航名称</uni-th>
						<uni-th align="center">图片</uni-th>
							<uni-th width="100" align="center">是否启用</uni-th>
						<uni-th align="center">跳转地址</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">
						<uni-td align="center">{{item.sort}}</uni-td>
						<uni-td align="center">{{item.classify_name}}</uni-td>
						<uni-td align="center">
							<image :src="item.img_url" class="img_style"/>
						</uni-td>
						<uni-td align="center">{{item.status ? "是": '否'}}</uni-td>
						<uni-td align="center">{{item.open_url}}</uni-td>
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
	const pageSize = 20
	const pageCurrent = 1

	export default {
		data() {
			return {
				options: {
					pageSize,
					pageCurrent,
					filterData: {}
				}
			}
		},
		onReady() {
			this.$refs.cdb.loadData()
		},
		methods: {
			changeSize(pageSize) {
				this.options.pageSize = pageSize
				this.options.pageCurrent = 1
				this.$nextTick(() => {
					this.loadData()
				})
			},
			
			loadData(clear = true) {
				this.$refs.cdb.loadData({
					clear
				})
			},
			onPageChanged(e) {
				this.$refs.table.clearSelection()
				this.$refs.cdb.loadData({
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
			confirmDelete(id) {
				this.$refs.cdb.remove(id, {
					success: (res) => {
						this.$refs.table.clearSelection()
					}
				})
			}
		}
	}
</script>

<style>
.img_style{
	height: 50px;
	width:50px;
}
</style>
