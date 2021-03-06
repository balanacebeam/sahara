/*
 * Balancebeam Widget Menu 1.0
 *
 * Description : Support horizontal and vertical drop down menu
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/jquery/jquery.ui.core.js
 *		balancebeam/lib/jquery/jquery.ui.widget.js
 *		balancebeam/lib/widget/beam.toolkit.js
 */
 
 (function( $, undefined ) {
 
 $.widget("ui.menu", {
	options: {
		metadata : {
			id : "id",
			iconURL : "iconURL",
			title : "title",
			children : "children",
			disabled : "disabled"
		},
		dataProvider : [],
		menuBar : {
			width : "auto",
			itemWidth : 70
		},
		closableRoot : false,
		onClick : function(data){},
		onClose : function(e){}
	},
	_create : function(){		
		var options = this.options;
		this.menuBoxs = {};
		this.menuItems = {};				
		this.rootMenuBox = options.menuBar ?
			this.createBarMenuBox(options.dataProvider) :  
			this.createPopMenuBox(options.dataProvider) ;
		this.rootMenuBox.addClass("root-menu");
		this.element
			.addClass("breeze-menu")
			.append(this.rootMenuBox);
		this._funnelEvents();
	},	
	//创建一级导航菜单
	createBarMenuBox : function(dataProvider){
		var html = [],id,
			metadata = this.options.metadata;
		html.push("<div class='menu-bar'>");
		html.push("<div class='lholder'></div>");
		html.push("<div class='rholder'></div>");
		html.push("<div class='inner'>");
		for(var i=0,item;item = dataProvider[i];i++){
			if(item.seperator){
				continue;
			}
			id = item[metadata.id];
			this.menuItems[id] = item;			
			html.push("<div class='menu-item");
			html.push(item[metadata.disabled]?" disabled' ":"'");
			html.push(" menuItemId='");
			html.push(id);
			html.push("'>");
			html.push("<a class='menu-item-link' href='#' unselectable='on'>");
			html.push("<img class='menu-item-icon ");
			var iconURL = item[metadata.iconURL];
			if(jQuery.isArray(iconURL)){
				iconURL = iconURL[0];
			}
			html.push(!iconURL?"hidden":"");
			html.push("' src='");
			html.push(iconURL || breeze.getBlankIcon());
			html.push("'></img>");
			html.push("<span class='menu-item-text'>");
			html.push(item[metadata.title]);
			html.push("</span>");
			if((item[metadata.children] || []).length){
				html.push("<span class='menu-item-submenu'></span>");
				this.menuBoxs[id] = item[metadata.children];
			}
			else{
				html.push("<span class='menu-item-rblank'></span>");
			}
			html.push("</a>");
			html.push("</div>");
		}
		html.push("</div>");
		html.push("</div>");
		var menuBox = $(html.join("")),
			menuBar = this.options.menuBar;
		if(!isNaN(Number(menuBar.width))){
			var width =Number(menuBar.width)-40;
			if(width <=0){ width = 70;}
			menuBox.width(width);
		}		
		return menuBox;
	},
	//创建弹出子菜单容器
	createPopMenuBox : function(dataProvider,menuBoxId){
		var html = [],
			metadata = this.options.metadata,
			id,height = 0;
		html.push("<div class='menu-box'>");
		html.push("<div class='menu-separator-y'></div>");
		for(var i=0,item;item = dataProvider[i];i++){
			if(item.seperator){
				html.push("<div class='menu-separator-x'></div>");
				height+=3;
				continue;
			}
			id = item[metadata.id];
			if(this.menuItems[id]){
				$.extend(item,this.menuItems[id]);
			}			
			this.menuItems[id] = item;						
			height+=26;
			html.push("<div class='menu-item");
			html.push(item[metadata.disabled]?" disabled' ":"'");
			html.push(" menuItemId='");
			html.push(id);
			html.push("'>");
			html.push("<a ondragstart='return false' class='menu-item-link' href='#' unselectable='on'>");
			html.push("<img class='menu-item-icon' src='");
			var iconURL = item[metadata.iconURL];
			if(jQuery.isArray(iconURL)){
				iconURL = iconURL[0];
			}
			html.push(iconURL || breeze.getBlankIcon());
			html.push("'></img>");
			html.push("<span class='menu-item-text'>");
			html.push(item.title);
			html.push("</span>");
			if((item[metadata.children] || []).length){
				html.push("<div class='menu-item-submenu'></div>");
				this.menuBoxs[id] = item[metadata.children];
			}
			html.push("</a>");
			html.push("</div>");
		}
		html.push("</div>");
		var menuBox = $(html.join(""));
		$(".menu-separator-y",menuBox).height(height);
		
		//设置属性和绑定事件
		menuBoxId && menuBox.attr("menuBoxId",menuBoxId);
		return menuBox;
	},	
	//关闭相关联的子所有菜单
	hideSubMenuBox : function(menuBox){
		var hoverItem = $("div.hover",menuBox);
		hoverItem.removeClass("hover");
		if(0==hoverItem.length || 0==$(".menu-item-submenu",hoverItem).length) return;
		var menuItemId = hoverItem.attr("menuItemId"),
			subMenuBox =  $(">[menuBoxId="+menuItemId+"]",this.element);
		if("visible"==subMenuBox.css("visibility")){
			this.hideSubMenuBox(subMenuBox);
			subMenuBox.css("visibility","hidden");
		}
	},
	//关闭弹出菜单
	close : function(){
		this.hideSubMenuBox(this.rootMenuBox);
		var options = this.options;
		if(!options.menuBar && options.closableRoot){
			this.element.hide();
		}
		var onClose = this.options.onClose;
		onClose && onClose.apply(null,arguments);
	},
	//设置某个菜单节点不可用
	setDisabled : function(menuItemId,disabled){
		if(!this.menuItems[menuItemId]){
			var obj = {};
			obj[this.options.metadata.disabled] = disabled;
			this.menuItems[menuItemId] = obj;
			return;
		}		
		var menuItem =  $("[menuItemId="+menuItemId+"]",this.element);		
		var data = this.menuItems[menuItemId];
		if(disabled){
			menuItem.addClass("disabled");
		}
		else{
			menuItem.removeClass("disabled");
		}
	},
	//绑定事件
	_funnelEvents : function(){
		function getMenuItem(element){
			var menuItem = element.parents(".menu-item");
			return menuItem.length ? menuItem : null;
		}	
		var self = this,
			selectedMenuItem = null;
		this.element.mousedown(function(e){
			self.runtimeXY= (e.clientX+":"+e.clientY);
			breeze.stopEvent(e);
			var menuItem = getMenuItem($(e.target));
			if(null==menuItem){ 
				return;
			}
			var menuItemId = menuItem.attr("menuItemId"),
				data = self.menuItems[menuItemId];
			//菜单节点不可用或者有孩子结点时执行点击操作
			if(menuItem.hasClass("disabled") || $(".menu-item-submenu",menuItem).length){
				return;
			}
			selectedMenuItem = menuItem;
			var mousedown = self.options.onMousedown;
			mousedown && mousedown(menuItem,data,e);
		})
		.click(function(e){
			var menuItem = getMenuItem($(e.target)),
				runtimeXY= (e.clientX+":"+e.clientY);
			if(null==menuItem){ 
				return;
			}
			var menuItemId = menuItem.attr("menuItemId"),
				data = self.menuItems[menuItemId];
			//菜单节点不可用或者有孩子结点时执行点击操作
			if(menuItem.hasClass("disabled") || $(".menu-item-submenu",menuItem).length){
				return;
			}
			if(!selectedMenuItem || menuItem[0]!=selectedMenuItem[0] || runtimeXY!=self.runtimeXY){
				return;
			}
			if(data.onClick){
				if(false==data.onClick(data,menuItem)){
					return;
				}
			}
			else if(self.options.onClick){
				if(false==self.options.onClick(data,menuItem)){
					return;
				}
			}
			//关闭所有的菜单
			self.close(e);
		})
		.mouseover(function(e){
			breeze.stopEvent(e);
			var menuItem = getMenuItem($(e.target));
			if(null==menuItem){
				return;
			}			
			var menuBox = menuItem.parent(),
				hoverItem = $(".hover",menuBox);			
			if(hoverItem[0]!=menuItem[0]){				
				self.hideSubMenuBox(menuItem.parent());		
			}
			else{
				return;
			}
			if(menuItem.hasClass("disabled")){
				return;
			}
			//获取menu的唯一标识
			var menuItemId = menuItem.attr("menuItemId");
			if($(".menu-item-submenu",menuItem).length){
				menuItem.addClass("hover");
				//获取对应的子菜单容器
				var subMenuBox = $(">[menuBoxId="+menuItemId+"]",self.element);
				//如果没有则创建子菜单容器
				if(0==subMenuBox.length){ 
					var children = self.menuBoxs[menuItemId];
					self.element.append(subMenuBox=self.createPopMenuBox(children,menuItemId));
				}
				//定义菜单的位置
				var	itemoffset = menuItem.offset(),
					elementoffset = self.element.offset(),
					left = itemoffset.left - elementoffset.left +  menuItem.width() +1,
					top = itemoffset.top - elementoffset.top,
					subMenuBoxHeight = subMenuBox.height(),
					subMenuBoxWidth = subMenuBox.width(),
					screenTop = document.body.offsetHeight + document.body.scrollTop,
					screenLeft = document.body.offsetWidth  + document.body.scrollLeft;
				if(!menuBox.hasClass("menu-box")){
					left = itemoffset.left - elementoffset.left;
					top = itemoffset.top + menuItem.height() - elementoffset.top -1;
				}
				else{
					//判断弹出的菜单位置是否在浏览器显示区域内
					if(itemoffset.left + menuItem.width() + subMenuBoxWidth + 10>screenLeft){
						left = itemoffset.left - elementoffset.left - subMenuBoxWidth -7;
					}
					if(itemoffset.top + subMenuBoxHeight + 10>screenTop){
						top = itemoffset.top + menuItem.height()  - elementoffset.top -subMenuBoxHeight -5;
					}
				}				
				subMenuBox.css({
					left : left + "px",
					top : top + "px",
					visibility : "visible"
				});
			}
		});
		
		function domousedown(e){
			if($(">.root-menu",self.element).width()){				
				self.close(e);
			}
		}
		$(document).bind("mousedown",domousedown);
		//销毁菜单
		this.destroy = function(){
			this.element.empty();
			$(document).unbind("mousedown",domousedown);
		}
	}
});

})(jQuery);
