/*
 * Balancebeam Widget Tab 1.0
 *
 * Description : Support Tabbing navigator
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 *		balancebeam/lib/jquery/jquery.ui.core.js
 *		balancebeam/lib/jquery/jquery.ui.widget.js
 *		balancebeam/lib/widget/beam.toolkit.js
 * 		balancebeam/lib/widget/layout/beam.container.js
 */

(function( $, undefined ) {
 
 $.widget("ui.tabs", $.ui.container,{
	options: {
		//定义元数据
		metadata : {
			//标题字段
			title : "title", 
			//选择字段
			selected : "selected", 
			 //参数字段
			parameters : "parameters",
			//图标字段
			iconURL : "iconURL",
			//是否关闭
			closable : "closable",
			//指定html片段
			html : "html",
			//回调方法
			get : "get",
			//连接地址			
			url : "url",			
			//加载方式
			pattern : "pattern" 
		},
		//是否有边框
		noborder : false,
		//高度为
		height : 500,
		//定义数据源
		dataProvider : [],
		//插件
		plugins : {}		
	},
	render : function() {
		this.pluginInstances = {};
		var element = this.element,
			options = this.options,
			metadata = options.metadata,
			dataProvider = options.dataProvider,
			self = this;
		this.boxs = new Array(dataProvider.length);
		element.addClass("breeze-tabs");
		options.noborder && element.addClass("tabs-noboder");
		var tabbar = $("<div class='tabbar'><div class='tabs-scroller-left'></div><div class='tabs'></div><div class='tabs-scroller-right'></div></div>"),
			tabboxs = $("<div class='tabboxs'></div>"),
			tabs = $(">.tabs",tabbar),
			selectedTabIndex = 0,
			fragment = document.createDocumentFragment();
		
		$.each(dataProvider,function(index,data){
			var tab = self.createTab(data);		
			if(data[metadata.selected]){
				selectedTabIndex = index;
			}
			tabs.append(tab);
		});
		
		fragment.appendChild(tabbar[0]);
		fragment.appendChild(tabboxs[0]);
		element.append(fragment);
		if(dataProvider.length){
			$($(">.tabbar>.tabs>.tab",this.element).get(selectedTabIndex)).addClass("selected");
			this.load(selectedTabIndex);
		}
		var classes = $.ui.tabs.plugins.classes,
			plugins = this.options.plugins;
		for(var name in classes){
			if(!plugins[name]){
				continue;
			}
			var clazz = classes[name]; 			
			this.pluginInstances[name] = new clazz(this,plugins[name]);
		 };
	},
	//获取插件实例
	getPlugin : function(name){
		return this.pluginInstances[name];
	},
	//创建Tab
	createTab : function(data){
		var metadata = this.options.metadata,
			tab = $("<div class='tab'><div class='inner'></div></div>"),
			inner = $(">.inner",tab);
		if(data[metadata.iconURL]){
			inner.append($("<img class='icon' src='"+data[metadata.iconURL]+"'></img>"));
			inner.addClass("withicon");
		}
		inner.append($("<span class='title'>"+data[metadata.title]+"</span>"));
		if(data[metadata.closable]){
			inner.append($("<div class='close'></div>"));
			inner.addClass("withclose");
		}
		return tab;		
	},
	//调整展现区域的高度大小
	resize : function(){
		var element = this.element,
			noborder = this.options.noborder;
		this.runtimeWidth = element.width() -(noborder?0:2);	
		this.resize0();
		this.resize1();
	},
	resize0 : function(revise){
		var element = this.element,			
			width = this.runtimeWidth,
			scrollerLeft = $(">.tabbar>.tabs-scroller-left",element),
			scrollerRight = $(">.tabbar>.tabs-scroller-right",element);	
		
		var tabs = $(">.tabbar>.tabs>.tab",element);
		if(tabs.length){
			var lastTab = tabs.last()[0],			
				lastTabOffsetRight = lastTab.offsetWidth+2+lastTab.offsetLeft,
				tabsrollLeft = $(">.tabbar>.tabs",element).scrollLeft();
			if(tabsrollLeft+lastTabOffsetRight>width){
				$(">.tabbar>.tabs",element).width(width-=18*2);			
				if(revise){
					var selectedTab = $(">.tabbar>.tabs>.selected",element)[0],
						selectedTabOffsetLeft = selectedTab.offsetLeft,
						selectedTabWidth = selectedTab.offsetWidth+2;
					if(selectedTabOffsetLeft<tabsrollLeft){
						$(">.tabbar>.tabs",element).scrollLeft(selectedTabOffsetLeft-2);
					}
					else if(tabsrollLeft+ width<selectedTabWidth+selectedTabOffsetLeft){			
						$(">.tabbar>.tabs",element).scrollLeft(selectedTabWidth+selectedTabOffsetLeft-width);
					}			
					tabsrollLeft = $(">.tabbar>.tabs",element).scrollLeft();
				}
				//设置left按钮的状态
				scrollerLeft.css("display","block");			
				0==tabsrollLeft && scrollerLeft.addClass("disabled") || scrollerLeft.removeClass("disabled");		
				//设置right按钮的状态
				scrollerRight.css("display","block");
				tabsrollLeft+width>=lastTabOffsetRight && scrollerRight.addClass("disabled") || scrollerRight.removeClass("disabled");
				return;
			}
		}		
		$(">.tabbar>.tabs",element).width(width);
		scrollerLeft.css("display","none");
		scrollerRight.css("display","none");
	},
	resize1 : function(){
		var selectedTab = $(">.tabbar>.tabs>.selected",this.element);
		if(selectedTab.length){
			var selectedTabIndex = $(">.tabbar>.tabs>.tab",this.element).index(selectedTab);
			$.each(this.getChildren(this.boxs[selectedTabIndex]),function(index,child){
				child.resize();
			});
		}			
	},
	//选择Tab
	selectTab : function(index){
		var element = $($(">.tabbar>.tabs>.tab",this.element).get(index));
		if(!element.hasClass("selected")){
			var selectedTab = $(">.tabbar>.tabs>.selected",this.element);
			if(selectedTab.length){
				selectedTab.removeClass("selected");
				var selectedTabIndex = $(">.tabbar>.tabs>.tab",this.element).index(selectedTab);
				this.boxs[selectedTabIndex].css("display","none");
			}
			element.addClass("selected");
			this.resize0(true);
			this.load(index);
		}		
	},
	//删除Tab
	removeTab : function(index){
		var element = $($(">.tabbar>.tabs>.tab",this.element).get(index)),
			self =this,
			oIndex =index,
			dataProvider = this.options.dataProvider;
		dataProvider.splice(index,1);		
		if(element.hasClass("selected") && 
			(dataProvider[index] || dataProvider[--index])){
			self.boxs.splice(oIndex,1)[0].remove();	
			element.remove();				
			self.selectTab(index);			
		}
		else{			
			self.boxs.splice(oIndex,1)[0].remove();	
			element.remove();				
			self.resize0(false);				
		}
	},
	removeTabs: function(indexs){
		if(indexs.length==0) return;
		var tabsElement = $(">.tabbar>.tabs>.tab",this.element),
			dataProvider = this.options.dataProvider;
		for(var i=indexs.length-1;i>=0;i--){
			$(tabsElement.get(indexs[i])).remove();
			dataProvider.splice(indexs[i],1);
			this.boxs.splice(indexs[i],1)[0].remove()
		}
		if($(">.tabbar>.tabs>.selected",this.element)[0] || !$(">.tabbar>.tabs>.tab",this.element).length){
			this.resize0(false);
		}
		else{
			this.selectTab(0);
		}
	},
	//禁用Tab
	disableTab : function(index){
	},
	//增加Tab
	addTab : function(data){
		var index = this.options.dataProvider.length;
		this.options.dataProvider.push(data);
		$(">.tabbar>.tabs",this.element).append(this.createTab(data));
		this.selectTab(index);
	},
	load : function(index){
		if(!this.boxs[index]){
			var box = $("<div class='tabbox'></div>"),
				data = this.options.dataProvider[index],
				self = this;
			$(">.tabboxs",this.element).append(box);
			this.boxs[index] = box;
			this.loadContext({
				context : box,
				html : data.html,
				node : data.node,
				get : data.get,			
				url : data.url,
				pattern : data.pattern,
				parameters : data.parameters,
				complete : function(){data.onload && data.onload();self.resize1();}
			});
		}
		else{
			this.boxs[index].css("display","block");
			this.resize1();
		}		
	},
	//绑定事件
	funnelEvents : function(){
		var self = this;
		$(">.tabbar",this.element).click(function(e){
			breeze.stopEvent(e);
			var target = $(e.target);
			if(target.hasClass("tabs-scroller-left") && !target.hasClass("disabled")){
				var tabs = $(">.tabbar>.tabs",self.element);
				tabs.scrollLeft(tabs.scrollLeft()-100);
				self.resize0(false);
				return;
			}
			if(target.hasClass("tabs-scroller-right") && !target.hasClass("disabled")){
				var tabs = $(">.tabbar>.tabs",self.element);
				tabs.scrollLeft(tabs.scrollLeft()+100);
				self.resize0(false);
				return;
			}
			if(target.hasClass("close")){
				target = target.parents(".tab");
				var index = $(">.tabbar>.tabs>.tab",self.element).index(target);
				self.removeTab(index);
				return;
			}
			var elems = [];			
			while(this!=target[0]){
				elems.unshift(target);
				target = target.parent();
			}
			if(target = elems[1]){
				var index = $(">.tabs>.tab",this).index(target);
				self.selectTab(index);
			}		
		});
	},
	getDataProvider : function(){
		return this.options.dataProvider;
	}
 });
  /**
  * 定义Tabs扩展插件
  * @author yangzz
  * @version 1.0
  */
 $.ui.tabs.plugins = new function(){
	 this.classes = {};
	 this.register = function(name,clazz){
		 this.classes[name] = clazz;
	 };
 }();
})(jQuery);
