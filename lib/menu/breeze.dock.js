/*
 * Balancebeam Widget Dock 1.0
 *
 * Description : Support  dock
 * Copyright 2012
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
 
 $.widget("ui.dock", {
	options: {
		metadata : {
			id : "id",
			iconURL : "iconURL",
			title : "title"			
		},
		dimension : 90,
		position : "bottom",
		onClick : function(){},
		dataProvider : []		
	},
	_create : function(){		
		var options = this.options,
			metadata = options.metadata,
			container = $("<div class='dock-container'></div>"),
			half = options.dimension/2,			
			html = [];
		this.original = true;
		this.element.addClass("breeze-dock").css(options.position,"0px");		
		this.padding = ("bottom"==options.position ? "paddingTop":"paddingBottom");
		$.each(options.dataProvider,function(index,data){			
			html.push("<img class='dock-shortcut' src='");
			html.push(data[metadata.iconURL]);
			html.push("' title='");
			html.push(data[metadata.title]);
			html.push("' style='");
			html.push("width:");
			html.push(half);
			html.push("px;height:");
			html.push(half);
			html.push("px;");
			html.push("padding-"+(("bottom"==options.position) && "top" || "bottom"));
			html.push(":");
			html.push(half);
			html.push("px;'>");
		});		
		container.html(html.join(""));
		this.element.append(container);
		this.amm = false;
		this._funnelEvents();
	},	
	
	//绑定事件
	_funnelEvents : function(){
		var options = this.options,
			dimension = options.dimension,
			runtimeCss,
			self = this;
		$(document).mousemove(function(e){
			var target = $(e.target);
			if(target.hasClass("dock-shortcut")){
				var dock = target.parents(".breeze-dock");
				if(dock[0]==self.element[0]){ 
					if(null==e.layerX){
						e.layerX = e.offsetX;
					}
					var width = parseInt(target.css("width"),10);
					if(width < dimension){
						width++;
						runtimeCss = {
							width : width+"px",
							height : width+"px"
						};
						runtimeCss[self.padding] = (dimension-width)+"px";
						target.css(runtimeCss);
					}					
					
					var prevElem = target.prev(),
						nextElem = target.next(),
					 	prevElemSize = Math.floor((width*(width- e.layerX))/(2*dimension))+dimension/2,
					 	nextElemSize =  Math.floor((width*e.layerX)/(2*dimension))+dimension/2,
					 	runtimeCss = {
							width : prevElemSize+"px",
							height : prevElemSize+"px"
						};
					runtimeCss[self.padding] = (width-prevElemSize)+"px";
					prevElem.css(runtimeCss);
					runtimeCss = {
						width : nextElemSize+"px",
						height : nextElemSize+"px"
					};
					runtimeCss[self.padding] = (width-nextElemSize)+"px";
					nextElem.css(runtimeCss);					
					self.original = false;
					return;
				}
			}
			self.normal();
		});
		this.element.click(function(e){
			var target = $(e.target);
			if(!target.is("img")){ return};
			var index = $(">div>img",self.element).index(target),
				data = self.options.dataProvider[index];
			if(self.options.onClick(data)){
				self.normal();
			}
		});
	},
	normal : function(){
		if(this.original) return;
		var dimension = this.options.dimension,
			runtimeCss = {
				width : dimension/2+"px",
				height : dimension/2+"px"
			};
		runtimeCss[this.padding] =  dimension/2+"px";
		$(">div>img",this.element).animate(runtimeCss,"fast");
		this.original = true;
	}
});

})(jQuery);