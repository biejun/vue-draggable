/*
 *	Vue 拖拽插件
 *
 *	update 2016.08.23
*/

;(function() {
	var draggable = {};
	var dragObj = [];
    draggable.install = function(Vue) {
        Vue.directive('draggable', {
            params: ['name', 'to'],
			twoWay: true,
            deep: true,
            bind: function() {

				this._dragEl = null;
				this._tempEl = null;
				
                var to = this.params.to,
                    name = this.params.name,
                    type = this.arg,
                    isIn = false,
                    moving = false,
                    oldIndex = 0,
                    newIndex = 0,
                    elePos = { left: 0, top: 0, width: 0, height: 0 }, // 记录初始元素位置
					targetPos = null;

                dragObj.push({ vm: this.vm, el: this.el, type: type || '', name: name || '', to: to || '' }); // 记录拖拽分组

                ('put' != type) && this.el.addEventListener('mousedown', function(event) {

                    var e = event || window.event,
                        pageX = e.pageX,
                        pageY = e.pageY;

					e.preventDefault();

					oldIndex = this.getIndex(this.el);

                    if ('copy' == type) {
						this._dragEl = this.el.cloneNode(true);
						this._dragEl.classList.add('drag-copy');
						this._dragEl.style.opacity = '0';
						document.body.appendChild(this._dragEl);
                    } else {
						this._dragEl = this.el;
						this._tempEl = document.createElement(this.el.tagName);
						this._dragEl.parentNode.insertBefore(this._tempEl, this._dragEl);
						this._tempEl.style.display = 'none';
					}
					moving = true;

					elePos.left = pageX - this.el.offsetLeft;
					elePos.top = pageY - this.el.offsetTop;
					
					elePos.width = this.el.offsetWidth;
					elePos.height = this.el.offsetHeight
				
				}.bind(this));

                document.addEventListener('mousemove', function(event) {

					var e = event || window.event, 
                        pageX = e.pageX,
                        pageY = e.pageY;

                    if (this._dragEl != null && moving) {
						//console.log(pageX)
						this._dragEl.style.cssText = "position:absolute;opacity:.95;cursor:move";
                        this._dragEl.style.left = ('copy' == type) ? pageX - (elePos.width / 2) + 'px' : pageX - elePos.left + 'px';
                        this._dragEl.style.top = ('copy' == type) ? pageY - (elePos.height / 2) + 'px' : pageY - elePos.top + 'px';
						this._dragEl.style.width = elePos.width + 'px';
						this._dragEl.style.height = elePos.height + 'px';
						this._dragEl.style.zIndex = '9999';

                        if ('' != to && targetPos == null)
							targetPos = this.getTargetPos(to);

                        if (targetPos != null) {
                            if (pageX > targetPos.left &&
                                pageX < targetPos.left + targetPos.width + elePos.width / 2 &&
								pageY > targetPos.top &&
                                pageY < targetPos.top + targetPos.height + elePos.height / 2) {
								isIn = true;
                            } else {
								isIn = false;
							}
						}
                        if ('copy' == type) {
                            if (isIn && targetPos.type != 'copy' && targetPos.type != 'put') {
                                if (this._tempEl == null) {
									this._tempEl = document.createElement(this._dragEl.tagName);
									this._dragEl.parentNode.insertBefore(this._tempEl, this._dragEl);
									this._tempEl.classList.add('drag-move');
								}
                                this.sort(targetPos.el.parentNode, pageX, pageY);
							}
						}else{
							this._tempEl.removeAttribute("style");
							this._tempEl.classList.add('drag-move');
                            this.sort((isIn && targetPos.type != 'copy' && targetPos.type != 'put') ?
                                targetPos.el.parentNode : this.el.parentNode, pageX, pageY);
						}
					}
				}.bind(this));

                document.addEventListener('mouseup', function(event) {
					var e = event || window.event;

                    if (this._dragEl != null && moving) {
						var collection = this.collection;
						this._dragEl.removeAttribute('style');
                        if (isIn && targetPos.type != 'copy') {
                            if (targetPos.type == 'put') {
                                if (this.el.parentNode.contains(this._tempEl)) {
									this._tempEl.parentNode.removeChild(this._tempEl);
								}
								this._dragEl.parentNode.removeChild(this._dragEl);
								// 在目标实例上触发一个放置事件
                                targetPos.vm.$emit('dragput', e, collection[oldIndex],to);
                            } else {
                                if (targetPos.el.parentNode.contains(this._tempEl)) {
									targetPos.el.parentNode.replaceChild(this._dragEl, this._tempEl);
									newIndex = this.getIndex(this._dragEl);
                                    if ('copy' == type) {
										targetPos.el.parentNode.removeChild(this._dragEl);
										targetPos.vm[to] &&
                                            targetPos.vm[to].splice(newIndex, 0, collection[oldIndex]);
                                    } else {
										this.el.parentNode.removeChild(this._dragEl);
										targetPos.vm[to] &&
                                            targetPos.vm[to].splice(newIndex, 0, collection.splice(oldIndex, 1)[0]);
									}
									// 在目标实例上触发一个新增事件
                                    targetPos.vm.$emit('dragadd', e, this._dragEl, oldIndex, newIndex);
                                } else {
                                    (this._tempEl != null) && this._tempEl.parentNode.removeChild(this._tempEl);
									this._dragEl.parentNode.removeChild(this._dragEl);
								}
							}
                        } else {

                            if ('copy' == type) {
                                (this._tempEl != null) && this._tempEl.parentNode.removeChild(this._tempEl);
								this._dragEl.parentNode.removeChild(this._dragEl);
                            } else {
                                if (this.el.parentNode.contains(this._tempEl)) {
									this.el.parentNode.replaceChild(this._dragEl, this._tempEl);
									newIndex = this.getIndex(this._dragEl);
                                    (newIndex >= 0 && oldIndex != newIndex) &&
									collection.splice(newIndex, 0, collection.splice(oldIndex, 1)[0]);
                                } else {
									this._dragEl.parentNode.removeChild(this._dragEl);
								}
							}						
						}

						// 销毁临时变量
						this._dragEl = null;
						this._tempEl = null;
						targetPos = null;
						moving = false;
						isIn = false;
					}
				}.bind(this));
			},
            update: function(value) {
                if (!!value && Array.isArray(value)) this.collection = value;
			},
			// 获取元素定位
            offsetPos: function(elem) {
                var left = elem.offsetLeft,
                    top = elem.offsetTop,
					parent = elem.offsetParent;
                while (parent != null) {
					left += parent.offsetLeft;
					top += parent.offsetTop;
					parent = parent.offsetParent;
				}
				return {
                    left: left,
                    top: top
				}
			},
			// 排序
            sort: function(parentNode, pageX, pageY) {
                var select = /[uo]l/i.test(parentNode.nodeName) ? 'li' : 'div';
				var element = parentNode.querySelectorAll(select);
				var offsetPos = {};
				var dragELTop = this.offsetPos(this._dragEl).top;

                for (var i = 0; i < element.length; i++) {
                    if (element[i] == this._dragEl) continue;
					offsetPos = this.offsetPos(element[i]);
                    if (pageX > offsetPos.left && pageX < (offsetPos.left + element[i].offsetWidth) &&
                        pageY > offsetPos.top && pageY < (offsetPos.top + element[i].offsetHeight)) {
                        if (dragELTop < offsetPos.top) {
                            parentNode.insertBefore(this._tempEl, element[i]);
							break;
                        } else {
                            if (!element[i].nextSibling) {
								parentNode.appendChild(this._tempEl);
								break;
							} else {
								parentNode.insertBefore(this._tempEl, element[i].nextSibling);
								break;
							}
						}
					}
				}
			},
			// 获取目标元素定位
            getTargetPos: function(name) {
				var targetPos = {};
                dragObj && dragObj.forEach(function(row) {
                    if (name == row.name) {
                        var ele = (row.el.parentNode != null &&
                            row.type != 'put') ? row.el.parentNode : row.el;
						targetPos = {
                            vm: row.vm,
                            el: row.el,
                            type: row.type,
                            left: ele.offsetLeft,
                            top: ele.offsetTop,
                            width: ele.offsetWidth,
                            height: ele.offsetHeight
						}
					}
				})
				return targetPos;
			},
			// 获取当前元素索引位置
            getIndex: function(el) {
				var index = 0;
				if (!el || !el.parentNode) return -1;
				while (el && (el = el.previousElementSibling)) {
					if (el.nodeName.toUpperCase() !== 'TEMPLATE')
						index++;
				}
				return index;
			}
		})
	}
	if (typeof exports == "object") {
		module.exports = draggable
	} else if (typeof define == "function" && define.amd) {
        define([], function() {
            return draggable })
    } else if (window.Vue) {
		window.draggable = draggable;
	    Vue.use(draggable);
	}
})();