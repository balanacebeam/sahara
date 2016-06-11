/*
 * Balancebeam Widget Grid_Plugin_Draggable 1.0
 *
 * Description : Support drag head for exchange columns
 * Copyright 2011
 * License : MIT
 * Author : yangzz
 * Mail : balancebeam@163.com
 *
 * Depends:
 * 		balancebeam/lib/widget/grid/beam.grid.js
 */

(function( $, undefined ) {
 
$.ui.grid.draggable = function(grid){
	 this.grid = grid;
	 this._create();
};
//draggable原型定义
$.ui.grid.draggable.prototype = {
	//bind event
	_create : function(){
		var self = this,
			grid = this.grid,
			headersNode = grid.headersNode;
		if(grid.options.layout[0].length>1) return;
		headersNode.bind("mousedown.grid-draggable",function(e){
			var oTarget = $(e.target);
			if(null==oTarget.attr("idx")){
				return;
			}
			grid.element.addClass("breeze-noselectable");
			//判断列是否能拖动
			var oColumnMarkup = grid.getColumnMarkup(oTarget);
			if(false==oColumnMarkup.column.draggable 
				|| (oColumnMarkup.view == grid.normalView 
					&& 1==grid.normalView.columns.length)){
				return;
			} 
			var clientX = e.clientX,
				clientY = e.clientY,
				oTargetLeft = oTarget.offset().left,
				oIdx = Number(oTarget.attr("idx")),
				headersNodeOffset = grid.headersNode.offset(),
				oLeft = clientX - headersNodeOffset.left + 13 ,
				oTop =clientY- headersNodeOffset.top + 20,		
				ozIndex = grid.headersNode.css("zIndex"),
				dragNode = self.dragNode =
				$("<span class='drag-proxy'><label></label></span>")
					.css({
						display : "none",
						left : oLeft+ "px",
						top : oTop + "px"
					})
					.appendTo(grid.headersNode);
			$(">label",dragNode).html(oColumnMarkup.column.title);
			//创建定位图标
			self.moveTopNode = $("<div class='move-top'></div>").appendTo(grid.headersNode);
			self.moveBottomNode = $("<div class='move-bottom'></div>").appendTo(grid.headersNode);
			grid.headersNode.css("zIndex",5);
			//document.attachEvent && document.body.setCapture();
			//鼠标移动事件
			function mousemove(e){						
				dragNode.css({
					display : "block",
					left : (oLeft +e.clientX -clientX)+ "px",
					top : (oTop + e.clientY-clientY)+ "px"
				});
				var nTarget = $(e.target);					
				if( null==nTarget.attr("idx")){
					self.dropNo();
					return false;
				} 
				var nIdx = Number(nTarget.attr("idx")),
					nTargetWidth = nTarget.width(),					
					halfWidth = nTargetWidth/2,
					nColumnMarkup = grid.getColumnMarkup(nTarget);
				e.layerX = e.clientX -nTarget.offset().left;
				if(nColumnMarkup.column.noswap 
						|| (oColumnMarkup.view==nColumnMarkup.view && (
						nIdx == oIdx
 						|| 1== nIdx-oIdx && e.layerX < halfWidth
						|| 1== oIdx-nIdx && e.layerX>halfWidth))){
					self.dropNo();
					return false;
				}
				self.dropYes(e);
				breeze.stopEvent(e);
		        return false;
			}
			function mouseup(e){
				grid.element.removeClass("breeze-noselectable");
				grid.headersNode.css("zIndex",ozIndex);						
				if(dragNode.hasClass("on")){
					var target = $(e.target),
						width = target.width(),
						nColumnMarkup = grid.getColumnMarkup(target),
						layerX = e.clientX -target.offset().left,
						newIndex =nColumnMarkup.idx + (layerX > width/2 ? 1 : 0 );
						self.exchangePosition(
								oColumnMarkup.idx,
								oColumnMarkup.layoutIndex,
								newIndex,
								nColumnMarkup.layoutIndex
						);
						self.dragNode.remove();
				}
				else{ //动画销毁
					if("block"==self.dragNode.css("display")){
						self.dragNode.animate({
								left :  (oTargetLeft - headersNodeOffset.left) + "px",
								top :  "0px",
								opacity : 'toggle'
							},300,function(){
							self.dragNode.remove();
						});
					}
					else{
						self.dragNode.remove();
					}
				}
				self.moveTopNode.remove();
				self.moveBottomNode.remove();
				//document.attachEvent && document.body.releaseCapture();
				$(document).unbind("mousemove",mousemove);
				$(document).unbind("mouseup",mouseup);
			}
			$(document).bind("mousemove",mousemove);
			$(document).bind("mouseup",mouseup);
			
			setTimeout(function(){
				dragNode && dragNode.css("display","block");
			},600);
		});
	},
	dropNo : function(){
		var dragNode = this.dragNode,
			moveTopNode = this.moveTopNode,
			moveBottomNode = this.moveBottomNode;
		if(dragNode.hasClass("on")){
			dragNode.removeClass("on");
		}
		moveTopNode.css("display","none");
		moveBottomNode.css("display","none");
	},
	dropYes : function(e){
		var dragNode = this.dragNode,
			moveTopNode = this.moveTopNode,
			moveBottomNode = this.moveBottomNode,
			target = $(e.target),
			width = target.width(),
			left = target.offset().left - this.grid.headersNode.offset().left;
		!dragNode.hasClass("on") && dragNode.addClass("on");

		if(e.layerX > width/2){
			left+=width+1;
		}	
		moveTopNode.css({
			display : "block",
			left : left +"px"
		});
		moveBottomNode.css({
			display : "block",
			left : left + "px"
		});
	},
	/**
	 * 更改列显示位置
	 * @param oIndex 
	 * @param oViewIndex
	 * @param nIndex
	 * @param nViewIndex
	 */
	exchangePosition : function(oIndex,oLayoutIndex,nIndex,nLayoutIndex){
		var grid = this.grid,
			layout = grid.options.layout;
		function getRealPosition(index,columns){
			var vIndex = 0;
			for(var i=0,column;column=columns[i];i++){
				if(column.hidden) continue;
				if(index==vIndex){
					return i;
				}
				vIndex++;
			}
			return columns.length;
		}
		if(oLayoutIndex==nLayoutIndex){
			var columns = layout[nLayoutIndex][0];
			oIndex = getRealPosition(oIndex,columns);
			nIndex = getRealPosition(nIndex,columns);
			var column = columns[oIndex];
			if(oIndex>nIndex){
				columns.splice(oIndex,1);
				columns.splice(nIndex,0,column);
			}
			else{
				columns.splice(nIndex,0,column);
				columns.splice(oIndex,1);
			}
			
		}
		else{
			
			var columns = layout[oLayoutIndex][0];
			oIndex = getRealPosition(oIndex,columns);
			var column = columns[oIndex];
			columns.splice(oIndex,1);
			columns = layout[nLayoutIndex][0]
			nIndex = getRealPosition(nIndex,columns);
			columns.splice(nIndex,0,column);
			if(0==layout[oLayoutIndex][0].length){
				layout.splice(oLayoutIndex,1);
			}
		}
		grid.refresh();
	},
	destroy : function(){
		var headersNode = this.grid.headersNode;
		headersNode.unbind("mousedown.grid-draggable");
	}
 };
//注入plugin
$.ui.grid.plugins.register("draggable",$.ui.grid.draggable);

})(jQuery);
