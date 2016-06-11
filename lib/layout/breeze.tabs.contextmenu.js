/*
 * Balancebeam Widget Grid_Plugin_Lockrow 1.0
 *
 * Description : Support lock row as misc excel
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */


(function( $, undefined ) {
 
$.ui.tabs.contextmenu = function(tabs,params){
	 this.tabs = tabs;
	 this._create(params);
};
$.ui.tabs.contextmenu.prototype = {
	_create : function(params){
		var element = this.tabs.element,
			self = this,
			tabbar = $(">.tabbar",element);
		tabbar.bind("contextmenu",function(e){
			var target = $(e.target),
				tabElement= target.hasClass("tab")?target:target.parents(".tab");
			if(!tabElement[0] || !$(">.withclose",tabElement)[0]){
				return;
			}
			self.currentTabElement = tabElement;
			var popMenu = self.createPopMenu(),
				tabbarOffset = tabbar.offset();
			popMenu.css({
				top : e.clientY-tabbarOffset.top + "px",
				left : e.clientX-tabbarOffset.left + "px",
				display : "block"
			});
			return false;			
		});
	},
	createPopMenu: function(){
		if(!this.popMenu){
			var self =this,
				iconPath=breeze.getBreezeContextPath()+"themes/default/images/"
			this.popMenu=$("<div class='popmenu'></div>").menu({
				menuBar : false,
				dataProvider : [
					{id:"self",title:"关闭"},			
					{id:"others",title:"关闭其他"},
					{id:"all",title:"关闭所有"}					
				],
				onClick : function(data){
					var tabsElement = $(">.tabbar>.tabs>.tab",self.tabs.element);
					switch(data.id){
						case "all":
							var indexs =[];
							jQuery.each(tabsElement,function(i,element){
								if($(">.withclose",element)[0]){
									indexs.push(i);	
								}
							});
							self.tabs.removeTabs(indexs);
							break;
						case "others":							
							var index = tabsElement.index(self.currentTabElement),
								indexs=[];
							jQuery.each(tabsElement,function(i,element){
								if(index!=i && $(">.withclose",element)[0]){
									indexs.push(i);	
								}
							});
							self.tabs.selectTab(index);
							self.tabs.removeTabs(indexs);
							break;
						case "self":
							var index = tabsElement.index(self.currentTabElement);
							self.tabs.removeTab(index);
							break;
					
					}
					self.popMenu.hide();						
				},
				onClose: function(){
					self.popMenu.hide();		
				}
			});
			this.popMenu.appendTo($(">.tabbar",this.tabs.element));
		}
		return this.popMenu;
	},
	destroy : function(){
		
	}
 };
//注入plugin
$.ui.tabs.plugins.register("contextmenu",$.ui.tabs.contextmenu);

})(jQuery);
