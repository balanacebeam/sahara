/*

 */

 (function( $, undefined ) {
	 
 $.widget("ui.button",{
	options: {
		title : "",
		disabled: false,
		iconURL : null,
		iconClass: null,
		dropmenu: null
	},
	_create: function(){
		var element = this.element,
			options = this.options,
			html = [];
		element.addClass("breeze-button");
		html.push("<em class='wrapper'>");
		html.push("<button class='button' type='button'>");
		html.push("<img class='icon'></img>");
		html.push("<span class='title'>"+options.title+"</span>");
		html.push("</button>");
		html.push("</em>");
		element.html(html.join(""));
		//�������������ť
		if(null!=options.dropmenu){
			element.addClass("dropArrow");
		}
		//������Ϊ�յ�ʱ��
		if(""==options.title){
			element.addClass("noTitle");
		}
		//����ͼƬ
		if(null!=options.iconClass){
			$(".icon",element).attr("src",breeze.getBlankIcon());
			$(".icon",element).addClass(options.iconClass);
			element.addClass("yesIcon");
		}
		if(null!=options.iconURL){
			$(".icon",element).attr("src",options.iconURL);
			element.addClass("yesIcon");
		}
		if(options.disabled){
			element.addClass("disabled");
		}		
		this._funnelEvents();
	},
	_funnelEvents: function(){
		var self = this;
		this.element.bind("mousedown",function(e){
			if(self.options.disabled) return;
			self.element.addClass("pressed");
			function domouseup(ex){
				self.element.removeClass("pressed");
				$(document).unbind("mouseup",domouseup);
			}
			$(document).bind("mouseup",domouseup);
			if(self.options.dropmenu && self._canOpenMenu(e)){
				self._openMenu();
				breeze.stopEvent(e);
			}
			else{
				var onClick = self.options.onClick;
				onClick && onClick(e);
			}			
		});
	},
	_canOpenMenu: function(e){
		var target = $(e.target);
		if(target.is("em")){			
			return target.width()-(e.layerX || e.offsetX || 0)<14;
		}
		return false;
	},
	_openMenu : function(){		
		this.element.addClass("menu-opened");
		var dropMenu = $(">.dropmenu",this.element);
		if(dropMenu.length){
			dropMenu.show();
			return;
		}		
		var dm = this.options.dropmenu,
			height = this.element.height()+5,
			self = this;
		dropMenu = $("<div class='dropmenu'></div>");		
		dropMenu.menu({
			menuBar : false,
			closableRoot : true,
			dataProvider : dm.dataProvider,
			onClick : function(data){
				dm.onClick && dm.onClick(data);
			},
			onClose : function(e){
				self.element.removeClass("menu-opened");
			}
		});
		dropMenu.css("top",height+"px");
		dropMenu.appendTo(this.element);
	},
	setDisabled : function(disabled){
		this.options.disabled = disabled;
		disabled ? this.element.addClass("disabled") : this.element.removeClass("disabled");
	}
	
});
})(jQuery);
