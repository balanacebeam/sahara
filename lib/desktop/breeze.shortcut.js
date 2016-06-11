
 (function( $, undefined ) {
	 
 $.widget("ui.shortcut",$.ui.container, {
	options: {
		width: "auto",
		height: "auto",
		dataProvider: [],
		onClick: null,
		onClose: null
	},
	size: 110,
	render : function(){
		this.nodebase = []; //节点缓存
		this.database = {}; //数据缓存
		this.element.addClass("breeze-shortcut");
		var dataProvider = this.options.dataProvider,
			fragment = document.createDocumentFragment();
		for(var i=0,data;data=dataProvider[i];i++){
			fragment.appendChild(this.generateShortcut(data));
		}
		this.element.append(fragment);
	},
	//创建快捷方式
	generateShortcut : function(data){
		var html = ["<div class='shortcut unloaded'"];
		html.push("shortcutId='");
		html.push(data.id);
		html.push("'>");
		html.push("<div class='close'></div>");
		html.push("<img ondragstart='return false' border='0' src='");
		var iconURL = data.iconURL || "about:blank";
		if(jQuery.isArray(iconURL)){
			iconURL =iconURL[0] || "about:blank";
		}
		html.push(iconURL);
		html.push("'/>");
		html.push("<a ondragstart='return false' href='javascript:void(0)'>");
		html.push("<span>");
		html.push(data.title);
		html.push("</span>");
		html.push("</a>");
		html.push("</div>");
		var node = $(html.join(""));
		this.nodebase.push(node[0]);
		this.database[data.id] = data;
		return node[0];
	},
	resize : function(){
		this.runtimeHeight = this.element.height();
		this.resize0();
	},
	resize0 : function(){
		var top = 0,
			left = 0,
			distance = this.size,
			flippingNodes = [],
			height = this.runtimeHeight;	
		
		for(var i=0,node;node=this.nodebase[i];i++){
			node = $(node);
			var nLeft = left+"px",
				nTop = top+"px";
			if(node.hasClass("unloaded")){
				flippingNodes.push(node);
			}
			node.css({
				left: nLeft,
				top: nTop
			});
			top+=distance;
			if(top+distance>height){
				top = 0;
				left+=distance;
			}
		}
		//执行初始化动画
		(function(){
			if(0==flippingNodes.length){
				return;
			}
			var func = arguments.callee,
				node = flippingNodes.shift();					
			setTimeout(function(){
				node.addClass("loaded");	
				setTimeout(function(){
					node.removeClass("unloaded");
					node.removeClass("loaded");
				},300);	
				func();
			},50);				
		})();		
	},
	// 删除快捷方式
	removeShortcut : function(node){		
		for(var i=0,n;n=this.nodebase[i];i++){
			if(n==node[0]){
				this.nodebase.splice(i,1);
				this.resize0();
				break;
			}
		}
		var shortcutId = node.attr("shortcutId"),
			data= this.database[shortcutId];
		delete this.database[shortcutId];		
		//执行删除节点操作
		node.fadeOut("normal",function(){			
			node.remove();
		});
		var onClose = this.options.onClose;
		onClose && onClose(data);	
	},
	//增加快捷方式
	addShortcut : function(data){
		var node = this.generateShortcut(data);
		this.element.append(node);
		this.resize0();
	},
	//绑定事件
	funnelEvents : function(){
		var self = this;
		this.element.mousedown(function(e){
			var target = $(e.target),
				shortcut = breeze.parent(target,"shortcut");
			if(target.hasClass("close")){
				breeze.stopEvent(e);				
				self.removeShortcut(shortcut);
				return;
			}
			if(null!=shortcut){			
				self.doWobble(shortcut);
				self.doDrag(shortcut,e);
			}
		});
		this.element.click(function(e){
			var target = $(e.target),
				shortcut = breeze.parent(target,"shortcut");
			if(shortcut!=null && !self.element.hasClass("wobble")){
				var onClick = self.options.onClick,
					shortcutId = shortcut.attr("shortcutId"),
					data = self.database[shortcutId];
				onClick && onClick(data,e);
			}
		});
	},
	doWobble : function(target,e){
		var element = this.element;
		function dobodyclick(ex){
			element.removeClass("wobble");
			$(document.body).unbind("mousedown",dobodyclick);
		}
		var handle = setTimeout(function(){
			element.addClass("wobble");
			$(document.body).bind("mousedown",dobodyclick);
		},750);
		function domousemove(ex){
			clearTimeout(handle);
			$(document.body).unbind("mousemove",domousemove);
		}
		$(document.body).bind("mousemove",domousemove);
		function domouseup(ex){
			clearTimeout(handle);
			element.unbind("mouseup",domouseup);
		}
		element.bind("mouseup",domouseup);
	},
	doDrag : function(target,e){
		var self = this,
			proxy = null,
			size = this.size,
			baseline = null,					
			element = this.element,
			shortcuts = $(">.shortcut",element),
			num=shortcuts.length, //多少个快捷方式
			oIndex = shortcuts.index(target), //当前拖动快捷方式的原始坐标
			yNum = Math.floor(this.runtimeHeight/size) || 1,  //纵向摆放快捷方式的数量
			xNum = Math.ceil(num/yNum),  //横向最多摆放了多少个快捷方式
			lastY = num%yNum || yNum, //确定最后一个快捷方式在纵向上的位置
			clientX = e.clientX,
			clientY = e.clientY,
			oLeft = parseInt(target.css("left"),10),
			oTop = parseInt(target.css("top"),10),
			offset = element.offset(),
			oMouseLeft = clientX - offset.left,
			oMouseTop = clientY - offset.top,
			nMouseLeft,nMouseTop,x,y,half,nIndex;	
			
		document.attachEvent && document.body.setCapture();				
		function mousemoveShortcut(e){
			if(null==proxy){
				proxy = $(target.clone());
				proxy.addClass("proxy");
				element.append(proxy);
				baseline = $("<div class='baseline'></div>");
				element.append(baseline);
			}
			proxy.css({
				left : oLeft+e.clientX-clientX+"px",
				top : oTop+e.clientY-clientY+"px"
			});
			nMouseLeft = oMouseLeft+e.clientX-clientX;
			nMouseTop = oMouseTop+e.clientY-clientY;
			
			//如果在最外层
			if(nMouseLeft<=0 && nMouseTop<=0){
				proxy.hide();
				nIndex = null;
				return;
			}	
			
			x=Math.min(xNum,Math.ceil(nMouseLeft/size)|| 1) ;
			y=Math.min(yNum,Math.ceil(nMouseTop/size)|| 1);
			half = (nMouseTop>=yNum*size) || ((nMouseTop%size)>Math.floor(size/2));
			//当前垂直位置大于最后一个快捷方式位置
			if(x==xNum && lastY<y){
				if(lastY+1==y && !half){
					y--;
					half=true;
				}
				else{
					x--;
				}
			}
			nIndex = (x-1)*yNum+y-1;						
			if(nIndex==oIndex || 
				(nIndex-1==oIndex && !half) || 
				(nIndex+1==oIndex && half)){
				baseline.hide();
				nIndex = null;
			}
			else{
				nIndex =nIndex + (half?1:0);
				baseline.css({
					"display":"block",
					"left" : ((x-1)*size +16)+"px", 
					"top" : ((half?y*size:(y-1)*size))+"px"
				});
			}
		}
		function mouseupShortcut(e){					
			baseline && baseline.remove();
			document.attachEvent && document.body.releaseCapture();
			$(document).unbind("mousemove",mousemoveShortcut);
			$(document).unbind("mouseup",mouseupShortcut);				
			if(null!=nIndex){
				proxy && proxy.remove();				
				var nodebase = self.nodebase;
				if(nIndex>oIndex){							
					nodebase.splice(nIndex,0,nodebase[oIndex]);
					nodebase.splice(oIndex,1);
					$(shortcuts[nIndex-1]).after(target);
				}
				else{
					var d = nodebase.splice(oIndex,1);
					nodebase.splice(nIndex,0,d);
					$(shortcuts[nIndex]).before(target);
				}
				self.resize0();
			}
			else{
				proxy && proxy.animate({"left":oLeft+"px","top":oTop+"px"},
				"fast",function(){
					proxy.remove();
				});
			}					
		}
		$(document).bind("mousemove",mousemoveShortcut);
		$(document).bind("mouseup",mouseupShortcut);	
	}
});
})(jQuery);
