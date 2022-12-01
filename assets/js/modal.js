var modalObject = {};
$(document).on('click', '.showmodal', function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	let modalTarget = $(this).attr('modal-target');
	$(modalTarget).parent().siblings().removeClass('is-invalid');
	//$(modalTarget).toggleClass('show')
	//THIS IS FOR ERROR MESSAGE ON BULK REPORTS
	if (modalTarget == '#status-modal') {
		console.log($(this).attr("status-description"));
		$(modalTarget).find('.status-modal-heading').html("Report Failure")
		$(modalTarget).find('.status-modal-content').empty().html($(this).attr("status-description"))
	}
	displayModal(modalTarget);
})

$(document).on('click', '.topModal-button', function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	$(this).closest('topModal').removeClass('active');
})


$(document).on('click', '.modal-close', function (e) {
	e.preventDefault();

	let modalTarget = $(this).closest('.flex-container-modal');
	closeModal(modalTarget);
})

closeModal = (target) => {
	$('body').removeClass('noscroll');
	$(target).removeClass('show');
}

displayModal = (target) => {
	if (target != '#status-modal') {
		if (target in modalObject) {
			$(target).html(modalObject[target]);
		} else {
			modalObject[target] = $(target).html();
		}
	}

	try {
		$(target).parent().siblings().removeClass('is-invalid');
	} catch (e) {
		//pass
	}

	$(target).find('.modalBody').removeClass('show');
	if ($(target).find('.dateSelector').length) {
		$(target).find('.dateSelector').datepicker({
			dateFormat: "dd-mm-yy",
			changeMonth: true,
			changeYear: true,
			yearRange: "-59:+00"
		});
	}

	setTimeout(() => {
		$('#myDiv').addClass('blurred')
		$('body').addClass('noscroll');
		$(target).addClass('show');
		$(target).removeClass('showing');
	}, 100)
	$(target).addClass('showing');
}


