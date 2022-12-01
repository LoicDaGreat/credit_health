var listContainerMaxHeight = '';
var btnObject = {}
function pageLoader() {
	setTimeout(() => {
		setTimeout(() => {
			$('#loader_container').css({
				"display": "none"
			});
		}, 500)
		$('#loader_container').addClass('done');
	}, 1000)

}

buttonLoadStart = (btn, text) => {
	btn.prop("disabled", true)
	btn.html(`<i class="fas fa-circle-notch fa-spin" style="color:#1EE600 !important"></i>&nbsp;${text}`);
}
buttonLoadStop = (btn, text) => {
	btn.prop("disabled", false);
	btn.html(text);
}

function showPage() {
	document.getElementById("loader").style.display = "none";
	document.getElementById("myDiv").style.display = "block";
}
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
	document.getElementById("mySidenav").classList.toggle("active");
	let btn = document.getElementsByClassName("mobi-btn")
	for (i = 0; i < btn.length; i++) {
		btn[i].classList.toggle("active");
	}

}


function toggle() {
	var el = document.getElementById("lightDarkMode");
	if (el.href.match("css/light.css")) {
		el.href = "css/dark.css";
	}
	else {
		el.href = "css/light.css";
	}

}

$(document).on('click', '.notifications-close', function (e) {
	e.preventDefault();
	$(this).closest('.notifications').removeClass('show');
})

$(document).on('click', '.topModal-button', function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	$(this).closest('.topModal').removeClass('active');
})


topNotifyDisplay = (message) => {
	theNotification = `<div class="topModal">\
							<div>\
								<p class="topModal-text">${message}</p>\
							</div>\
							<div>\
								<button class="roundedCorners blueButton topModal-button">Continue</button>\
							</div>\
						</div>`;
	try {
		$('.topModal').remove();
	} catch (e) {
		//pass
	}
	$('body').prepend(theNotification);
	setTimeout(() => {
		$('.topModal').addClass('active');
	}, 100)

	setTimeout(() => {
		$('.topModal').removeClass('active');
	}, 10000)

}

notifyDisplay = (message) => {
	theNotification = `<div class="blackFooter notifications appParentStyles">\
							<div style="text-align:center;">${message}</div>\
							<div style="flex-grow: 2"> <span class="notifications-close">&times;</span></div>\
							</div>`;
	$('body').append(theNotification)

	setTimeout(() => {
		$('.blackFooter').addClass('show');
	}, 200)

	setTimeout(() => {
		$('.blackFooter').removeClass('show');
		setTimeout(() => {
			$('.blackFooter').remove();
		}, 200);
	}, 3000)
}

errorDisplay = (message) => {
	theNotification = `<div class="redFooter notifications appParentStyles">\
	<div>${message}</div>\
	<div style="flex-grow: 2"> <span class="notifications-close">&times;</span></div>\
	</div>`;
	$('body').append(theNotification)

	setTimeout(() => {
		$('.redFooter').addClass('show');
	}, 200)

	setTimeout(() => {
		$('.redFooter').removeClass('show');
		setTimeout(() => {
			$('.redFooter').remove();
		}, 200);
	}, 3000)
}

successDisplay = (message) => {
	theNotification = `<div class="greenFooter notifications appParentStyles">\
	<div>${message}</div>\
	<div style="flex-grow: 2"> <span class="notifications-close">&times;</span></div>\
	</div>`;
	$('body').append(theNotification)

	setTimeout(() => {
		$('.greenFooter').addClass('show');
	}, 200)

	setTimeout(() => {
		$('.greenFooter').removeClass('show');
		setTimeout(() => {
			$('.greenFooter').remove();
		}, 200);
	}, 3000)
}

$(document).on('click', '.help-me', function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	topNotifyDisplay($('.help-me-text').text());
})


$('document').ready(function () {
	var isScrolling;
	window.onscroll = function (ev) {
		clearTimeout(isScrolling);

		isScrolling = setTimeout(() => {
			$('.grecaptcha-badge').removeClass("scrolling")
		}, 300)


		$('.grecaptcha-badge').addClass("scrolling")
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
			if (window.outerWidth < 350) {
				$('.grecaptcha-badge').addClass("hide")
			}
		} else {
			$('.grecaptcha-badge').removeClass("hide")
		}
	};

});


$(document).on('click', '.articles-more', function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	let theListContainer = $(this).closest('.articles-quick-links').find('.article-list-container');
	let theListHeight = theListContainer.find('.articles-list').outerHeight();
	let theButtonHeight = $(this).outerHeight();

	if (theListContainer.hasClass('show')) {
		theListContainer.css({
			"max-height": listContainerMaxHeight
		});
		theListContainer.removeClass("show");
		$(this).text("Show More")
	} else {
		if (listContainerMaxHeight == '') {
			listContainerMaxHeight = theListContainer.css("max-height");
		}

		theListContainer.css({
			"height": theListHeight + theButtonHeight,
			"transition": "1s",
			"max-height": theListHeight + theButtonHeight
		});
		theListContainer.addClass("show");
		$(this).text("Show Less")
	}
})

$(window).on("orientationchange", function (event) {
	if (listContainerMaxHeight != '') {
		$('.articles-quick-links').find('.article-list-container').css({
			"max-height": listContainerMaxHeight
		});
		$('.articles-quick-links').find('.articles-more').text('Show More');
	}


});


$(document).on("click", "#menu-button", function (e) {
	e.preventDefault();
	let tHeight = 0;
	if ($(this).hasClass("menu-button-active")) {
		$.each($('.menu-items').find('ul').children(), function (k, v) {
			//console.log(k);
			//console.log(v);
			tHeight += $(this).outerHeight();
			console.log(tHeight)
		})
		$('.menu-items').css({
			"height": `${tHeight}px`
		})
		$('.menu-items').removeClass('show');
		$('.menu-items').addClass("collapsing");
		setTimeout(() => {
			$('.menu-items').attr("style", "");
		}, 1)
		setTimeout(() => {
			$('.menu-items').removeClass("collapsing");
		}, 500)
		$(this).removeClass("menu-button-active");
	} else {
		$('.menu-items').addClass("collapsing");
		$.each($('.menu-items').find('ul').children(), function (k, v) {
			//console.log(k);
			//console.log(v);
			tHeight += $(this).outerHeight();
			console.log(tHeight)
		})
		$('.menu-items').css({
			"height": `${tHeight}px`
		})


		setTimeout(() => {
			$('.menu-items').attr("style", "");
			$('.menu-items').removeClass('collapsing');
			$('.menu-items').addClass('show');
		}, 350)

		$(this).addClass("menu-button-active");
	}
})