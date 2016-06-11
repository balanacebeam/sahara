/*

 */

 (function( $, undefined ) {
	 
 $.widget("ui.combobox",{
	options: {
		required: true,
		arrow: true
	},
	_create: function(){
		this.element.addClass("breeze-textbox");
		var html = ["<div class='wrapper'>"];
		html.push("<input type='text' class='textbox'>");
		html.push("</div>");
		html.push("<div class='arrow'></div>");
		html.push("<div class='required'>*</div>");
		if(this.options.arrow){
			this.element.addClass("arrow");
			
		}
		if(this.options.required){
			this.element.addClass("required");
			
		}	
		this.element.html(html.join(""));
		this._funnelEvents();
	},
	_funnelEvents: function(){
		var self = this,
			element = this.element;
		$(">.wrapper>.textbox",element).focus(function(e){
			element.addClass("focus");
		})
		.blur(function(e){
			element.removeClass("focus");
		});
	}	
});
})(jQuery);
