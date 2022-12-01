$(document).on('click','.accord-header',function(e){
	e.preventDefault();
	e.stopImmediatePropagation();
	let tElementHeight = 0;
	
	if($(this).hasClass('active')){
		$(this).closest('.accord-item').find('.accord-content').attr("style","");
		$(this).toggleClass('active');
	}else{
		tElemContent = $(this).closest('.accord-item').find('.accord-content');
		tElemContent.children().each(function(){
			tElementHeight += Math.round($(this).outerHeight());
		})

		$(this).closest('.accord-item').find('.accord-content').css({
			"max-height":tElementHeight,
			"transition": "max-height 0.5s ease-out"
		});
		$(this).toggleClass('active');
		
	}
	
	
	
	
	
	
})