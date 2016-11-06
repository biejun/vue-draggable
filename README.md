# vue-draggable
基于Vue V1.0.2的拖拽放置插件
### 使用方法
引入插件 vue-draggable.js，只需在需要拖拽的元素上添加 v-draggable指令，并传入拖拽的数据对象即可，另外它还提供两种类型为 copy 或 put的拖拽形式。
```javascript
new Vue({
	el : '#app',
	data : {
		demo1 :[
			{title:'demo1 title'},
			{title:'demo1 title 1'}
		],
		demo2 : [
			{title:'demo2 title'},
			{title:'demo2 title 2'}
		]
	}
})
```
```html
<ul v-draggable="demo1">
	<li v-for="row in demo1" v-text="row.title"></li>
</ul>
```
#### copy 类型
克隆当前对象中被选中数据到一个新的对象中，通过设置参数 :name 和 :to 将被拖拽数据复制到to所设置的新对象中，如下：
```html
<ul v-draggable:copy="demo1" :name="demo1" :to="demo2">
	<li v-for="row in demo1" v-text="row.title"></li>
</ul>
<ul v-draggable="demo2" :name="demo2">
	<li v-for="row in demo1" v-text="row.title"></li>
</ul>
```
    demo1中的数据被复制到了demo2中
#### put 类型
当前对象只允许添加数据，不允许移出数据，如下：
```html
<ul v-draggable="demo1" :name="demo1" :to="demo2">
	<li v-for="row in demo1" v-text="row.title"></li>
</ul>
<ul v-draggable:put="demo2" :name="demo2">
	<li v-for="row in demo1" v-text="row.title"></li>
</ul>
```