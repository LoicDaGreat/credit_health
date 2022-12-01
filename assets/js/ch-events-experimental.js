var Handler = {};
var _chartMyScoreBandPercentage;
var _chartCreditScoreBands;
var _nextStep;
var _loadedTemplates;
var _actualColor;
var _env = '';
var templateBaseUrl = '';
var baseUrl = '';
var otpCount = 0;
var otpMethod;
var bundledReport;

setEnv = (data) => {
	if (_env == '') {
		_env = data;
		switch (_env) {
			case "dev":
				templateBaseUrl = `https://static.nutun.com/static/${_env}/js/credit_health/templates/`;
				baseUrl = `https://static.nutun.com/static/${_env}`;
				break;
			case "int":
				templateBaseUrl = `https://nutuncdn.azureedge.net/int/js/credit_health/templates/`;
				baseUrl = `https://nutuncdn.azureedge.net/int`;
				break;
			case "prod":
				templateBaseUrl = `https://nutuncdn.azureedge.net/prod/js/credit_health/templates/`;
				baseUrl = `https://nutuncdn.azureedge.net/prod`;
				break;
		}

	}
}

const utils = {
	round: (val) => { return Math.round(val) },
	lower: (val) => { return val.toLowerCase() },
	len: (val) => { return val.length },
	replace: (val) => { return new Date(val).toISOString().split('T')[0]; },
	bestSellerRank: (val) => {
		let ranking;
		switch (val) {
			case "1":
				ranking = "firstBestSeller";
				break;
			case "2":
				ranking = "secondBestSeller";
				break;
			case "3":
				ranking = "thirdBestSeller";
				break;
			default:
				ranking = "default";
		}
		return ranking;
	},
	hasKey: (object, key) => { return Object.hasOwnProperty(object, key) },
	setUrl: () => {
		return baseUrl;
	}
}

setHelperText = (data) => {
	$('.help-me-text').text(data);
}


Handler.KBV = (data) => {
	try {
		$('#registration-form').empty();
		$('#registration-form').prepend(`
		<div class="progressBar">
		<div>
			<div class="progressBlip blueBlip done" step="person-details"></div>
		</div>
		<div>
			<div class="progressBlip whiteBlip current" step="{{:next_step}}"></div>
		</div>
		<div>
			<div class="progressBlip whiteBlip" step="person-otp"></div>
		</div>
		<div>
		<div class="progressBlip whiteBlip" step="person-dash"></div>
	</div>
	</div>`)
		let templates = [{ name: "#kbvTemplate", data: data.data }];
		loadTemplateAppend('kbv.html', templates, '#registration-form');
		$('#registration-form').attr('data-form', data['next_step']);
		$('#registration-form').attr('data-action', data['next_recap']);
		setHelperText("We could not verify your details. The KBV questionare will assist us to verify your details.")
	} catch (e) {
		errorDisplay(data.message);
	}

}

Handler.OTP = (data) => {
	console.log(data);
	otpCount += 1;
	otpMethod = data["otp_method"];
	setHelperText(data.message);
	updateProgress(data['next_step']);
	$('.appContainer').empty();



	$('.appContainer').addClass('minHeightVH80');
	let templates = [{ name: "#otpCaptureTemplate", data: data }]
	loadTemplateAppend('otp.html', templates, '.appContainer');

	$('#registration-form').attr('data-form', data['next_step']);
	$('#registration-form').attr('data-action', data['next_recap']);


	/*  This is a temporary solution. Renderjs is creating 3 of each otp field for some retarded reason.
	Considering actually switching back to the previous method.
*/
	setTimeout(() => {
		for (let i = 0; i < 6; i++) {
			let duplicates = Array.prototype.slice.call(document.getElementsByName(`otp_${i}`));
			duplicates.forEach((elem, index) => {
				index > 0 ? elem.remove() : null;
			})
		}

	}, 500)

	setTimeout(() => {
		$('#resend-otp').removeClass("disabled");
		$('#resend-otp').prop("disabled", false);
	}, 30000)
}

Handler.CBSELECTION = (data) => {
	try {
		$(".appContainer").remove();
		menuOptions(data.sub_url, data.user_opt_in, data.authed)
		$('#myHeader').after(`<div class="appDashboardContainer"></div>`)
		if (data.credit_score_info == false) {
			noCreditScore(data);
		} else {
			hasCreditScore(data)
		}

	} catch (error) {
		errorDisplay("An unexpected error occurred. Please try again.")
	}
}

Handler.PAYMENT_SELECTION = (data) => {
	bundledReport = data.bundled_report;
	if (data.allow_voucher) {
		if (data.discount_message) {
			topNotifyDisplay(data.discount_message);
			setTimeout(() => {
				$("#discountCode").val(data.discount_code);
			}, 400)

		}
	}

	$(".appDashboardContainer").remove();
	const templates = [{ name: "#paymentSelectionTemplate", data: data }]
	loadTemplateAfter('paymentselection.html', templates, '#myHeader')
}

Handler.ERROR = (data) => {
	nutunMessage(data.message);
	//loaderStop();
	if (data.redirect) {
		setTimeout(() => { document.location.href = "/credit_health/"; }, 5000)
	}
}

updateProgress = (step) => {
	$('.progressBlip.current').addClass('done');
	$('.progressBlip.current').addClass('blueBlip');
	$('.progressBlip.done').removeClass('current');
	$('.progressBlip.done').removeClass('whiteBlip');
	$('.progressBlip[step=' + step + ']').addClass('current');
}

checkMobile = () => {
	let check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

startButtonLoader = (target, text) => {
	$(target).empty().append(`<i class="fas fa-circle-notch fa-spin"></i>&nbsp;${text}`);
}

stopButtonLoader = (target, text) => {
	$(target).empty().append(`${text}`);
}

loaderStart = () => {
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	$('#loader_container').removeClass('done');
	$('#loader_container').css('display', '');

}

loaderStop = () => {
	pageLoader();
}

getCookiePage = () => {
	let cookie = document.getElementsByName('csrfmiddlewaretoken')[0].value;
	return cookie;
}

submitDetails = (data) => {
	//loaderStart();
	buttonLoadStart(data.the_button, "Submitting...")
	$('.topModal').removeClass('active');
	var xStepback = '';
	let tAction;
	if (!data.next_cap || data.next_cap == 'undefined') {
		tAction = $('#registration-form').attr('data-action');
	} else {
		tAction = data.next_cap;
	}
	grecaptcha.execute('6LcqDJgeAAAAANxQ4okgDf7CS6Uk9DBZMtm-6Smf', { action: tAction }).then(function (token) {
		if ($('input[name="g-recaptcha-response"]').length) {
			$('input[name="g-recaptcha-response"]').remove();
		}
		$('body').append('<input type="hidden" name="g-recaptcha-response">')
		$('[name=g-recaptcha-response]').val(token)
		if (!data["step_back"]) {
			$('.registration [name]').each(function (i, v) {
				if ($(this).attr('type') == "checkbox") {
					data.postData[$(this).attr('name')] = $(this).is(':checked');
				} else {
					data.postData[$(this).attr('name')] = $(this).val().trim();
				}
			})
		} else {
			xStepback = data["next_step"];
		}
		url = '/credit_health/register/';
		data.postData["recaptcha"] = token;
		data.postData['quick_auth'] = data['quick_auth'] === 'true';
		fetch(url, {
			method: 'POST',
			body: JSON.stringify(data.postData),
			headers: { "X-CSRFToken": getCookiePage('csrftoken'), "X-Steps": data["next_step"], "X-Idnumber": data.postData["idnumber"], "X-Step-Back": xStepback }
		}).then((resp) => {
			return resp.json()
		}).then((data) => {
			if (data['refresh']) {
				window.location.reload()

			}
			var tFunction = data["function"]
			_nextStep = data['next_step']
			Handler[tFunction](data);
			buttonLoadStop(data.the_button, data.the_button_default);
			//loaderStop();
		}).catch((error) => {
			buttonLoadStop(data.the_button, data.the_button_default);
			//loaderStop();
		});
	})
}

resend_otp = (data, method) => {
	url = '/credit_health/resend_otp/';
	fetch(url, {
		method: 'POST',
		body: JSON.stringify({ "otp_method": method }),
		headers: { "X-CSRFToken": getCookiePage('csrftoken'), "X-Steps": data }
	}).then((resp) => {
		return resp.json()
	}).then((data) => {
		var tFunction = data["function"]
		console.log(data)
		Handler[tFunction](data);
	}).catch((error) => {
		console.log(error);
	});
}


credit_score_graph = (score, target, heading, colour) => {
	var ctx = document.getElementById(target).getContext("2d");
	var config = {
		type: "radialGauge",
		data: {
			labels: [heading],
			datasets: [
				{
					data: [score],
					backgroundColor: [colour],
					borderWidth: 0,
					label: "Score"
				}
			]
		},
		options: {
			responsive: true,
			legend: {},
			title: {
				display: false,
				text: heading
			},
			centerPercentage: 90,
			domain: [0, 1000],
			trackColor: 'rgba(204, 221, 238,0.1)',
		}
	};
	window.myRadialGauge = new Chart(ctx, config);
}

credit_score_doughnut = (data, score, target) => {
	if ((typeof (data) == 'string') && (data.indexOf('&#39;') > 0)) {
		data = JSON.parse(data.replace(/&#39;/g, '"'));
	}
	backGroudColorArray = [];
	borderColorArray = [];
	labelsArray = [];
	dataArray = []
	$.each(data, function (key, value) {
		if (parseInt(score) >= parseInt(value["low"]) && parseInt(score) <= parseInt(value["high"])) {
			tOpac = 1;
		} else {
			tOpac = 0.2;
		}
		backGroudColorArray.push(hexToRgba(value["colour"], tOpac));
		borderColorArray.push(hexToRgba(value["colour"], tOpac));
		labelsArray.push(value['message']);
		dataArray.push(parseInt(value['population_percentage']));
	})
	const ctx = document.getElementById(target).getContext('2d');
	const config = {
		type: 'doughnut',
		data: {
			labels: labelsArray,
			datasets: [{
				data: dataArray,
				backgroundColor: backGroudColorArray,
				borderColor: borderColorArray,
			}]
		},
		options: {
			responsive: true,
			legend: {
				display: false
			},
			tooltips: {
				enabled: true
			}
		}
	};
	window.myRadialGauge = new Chart(ctx, config);
}

$(document).on('click', '.select-report', function (e) {
	let theTarget = $(this).find('.report-purchase-container').find('.cart');
	let CreditReportRequired = $(this).closest('.appDashboardContainerTwoItem').attr('report-selection');
	let next_cap = $(this).attr('data-action')
	_nextStep = 'credit-report-selected'
	tData = {
		"next_step": _nextStep,
		"next_cap": next_cap,
		"postData": {
			"credit-report-selected": CreditReportRequired
		},
		"the_button": theTarget,
		"the_button_default": theTarget.html()

	}
	if (!submitDetails(tData)) {
		return false;
	}
})

$(document).on('click', '.step-back', function (e) {
	e.stopImmediatePropagation();
	let tBtn = $(this);
	tData = {
		"next_step": $(this).attr('step'),
		"step_back": true,
		"postData": {},
		"the_button": tBtn,
		"the_button_default": tBtn.html()
	};
	submitDetails(tData);
})

$(document).on('click', '.navbar-toggle', function (e) {
	$(this).toggleClass('is-active');
	$('.navbar-list').toggleClass('active');
})

$(document).on('click', '.consent-checker', function (e) {
	if ($(this).is(":checked")) {
		$('#signup').addClass('visible');
	} else {
		$('#signup').removeClass('visible');
	}
})

/*
$(document).on('click', '.consent-checker-debt', function (e) {
	if ($(this).is(":checked")) {
		$('#submit-debt-counsel').removeAttr('hidden');
	} else {
		$('#submit-debt-counsel').attr('hidden', true);
	}
})
*/

$(document).on('click', '.consent-checker-debt', function (e) {
	if ($(this).is(":checked")) {
		$('#submit-debt-counsel').removeClass('disabled');
		$('#submit-debt-counsel').prop('disabled', false);

	} else {
		$('#submit-debt-counsel').addClass('disabled');
		$('#submit-debt-counsel').prop('disabled', true);
	}
})

$(document).on('click', '#signup', function (e) {
	let tBtn = $(this);
	var tStep = $('.registration').attr('data-form');
	tData = {
		"next_step": tStep,
		"postData": {},
		"quick_auth": $('.registration').attr('quick-auth'),
		"the_button": tBtn,
		"the_button_default": tBtn.html()
	}

	//VALIDATION
	inputFails = 0
	$('.registration .required').each(function (e) {
		if (!validateFieldParent($(this))) {
			++inputFails
		};
	})

	if (inputFails == 0) {
		if ($('.must-match').length) {
			if ($('.must-match')[0].value == $('.must-match')[1].value) {

				submitDetails(tData);
				$('#modalDIV').remove();

			} else {
				errorDisplay('The provided email addresses do not match. Please correct them before continuing.')
			}
		} else {
			submitDetails(tData);
			$('#modalDIV').remove();
		}

	}
})

$(document).on('click', '#resend-otp', function (e) {
	resend_otp(getCookiePage('csrftoken'), otpMethod);
})

$(document).on('click', '#cardOption', function (e) {
	$('#payment').show();
})

$(document).on('click', '.consent-checker-contact', function (e) {
	var checked = false
	$('.consent-checker-contact').each(function (i, v) {
		if ($(this).is(":checked")) {
			checked = true;
		}
	})
	if (checked) {
		$('.communication-method').addClass('visible');
		//$('.selection-container').addClass('visible');
	} else {
		$('.communication-method').removeClass('visible');
		//$('.selection-container').removeClass('visible');
	}
})

$(document).on('keyup', '.otp-entry', function (e) {
	if ($(this).val().length == 1) {
		$(`[name^=otp_${Number(e.target.name.split("otp_")[1]) + 1}]`).focus();
	}
})

$(document).on('keydown', '.otp-entry', function (e) {
	var key = e.keyCode || e.charCode;
	if (key == 8 || key == 46) {
		if (e.target.name == 'otp_5') {
			e.target.value = '';
		}
		$(`[name^=otp_${Number(e.target.name.split("otp_")[1]) - 1}]`).focus();
	}
})

$(document).on('click', '.get-old-report', function (e) {
	displayModal('#report-download-modal');
	let transactionNumber = $(this).closest('.report-card').attr("trans-number");
	let theReport = $(this).closest('.report-card').attr("report");

	if (!transactionNumber || !theReport) {
		$('#report-download-modal').find('.group').html('<p>Could not retrieve your report</p>')
		return;
	}

	$('#report-download-modal').find('.status-modal-content').html('<i class="fas fa-spinner fa-2x fa-spin"></i>')


	url = '/credit_health/old_report/?id=' + transactionNumber + "&report=" + theReport;
	fetch(url, {
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		resp.json().then((data) => {
			return { "status": resp.status, data };
		}).then((data) => {
			if (data.status == 200) {
				if (data.data.report_type == "bundle") {
					tHtml = `<p class="alignCenter">Your reports have been downloaded, and can be found in your device's default download location. <br>Alternatively, you can download your reports below:<br></p>`;
					tHtml += `<div class="download-report-table">`
					$.each(data.data.encoded_pdf, function (key, value) {
						tHtml += `
						<div class="download-report-line">
						<div class="download-report-name">
						${key}
						</div>
						<div class="download-options">
						<a class="auto_report_download" href="data:application/octet-stream;base64,${value.encoded_pdf}" download="${value.filename}">DOWNLOAD</a>
					
						</div>
						</div>`;
					})
					tHtml += `</div>`;
					$('#report-download-modal').find('.group').css({
						"margin-top": "0px"
					})

				} else {
					tHtml = `<p style="text-align:center">Your report has been downloaded, and can be found in your device's default download location. <br>Alternatively, you can download your report from <a class="auto_report_download" href="data:application/octet-stream;base64,${data.data.encoded_pdf}" download="${data.data.filename}">HERE</a>.</p>`;
				}

				$('#report-download-modal').find('.status-modal-content').html(tHtml);

				setTimeout(() => {
					clickFunction = () => {
						return true;
					}
					tElem = document.getElementsByClassName('auto_report_download');
					for (i = 0; i < tElem.length; i++) {
						tElem[i].click();
					}

				}, 500)
			} else {
				errorDisplay(data.data.message)
			}
		})
	}).catch((error) => {
		errorDisplay()
	})

})


$(document).on('click', '.modal-close', function (e) {
	$(this).closest('.modal').remove();
})

$(document).on('click', '.dropdown-header', function (e) {
	let theTarget = $(this).attr('data-target');
	$(theTarget).toggleClass('show');
})

$(document).on('click', '[type=checkbox].payment-options', function (e) {
	let tempName = $(this).attr('name');
	$('[type=checkbox].payment-options').each(function (k, v) {
		if ($(this).attr('name') != tempName) {
			$(this).attr('disabled', false);
			$(this)[0].checked = false;
		}
	})
	$(this).attr('disabled', 'disabled');
})

$(document).on('change', '[type=checkbox].communication-method-option', function (e) {
	let tempName = $(this).attr('name');
	let theGroup = $(this).closest(".checkbox-group")
	$(theGroup).find('[type=checkbox].communication-method-option').each(function (k, v) {
		if ($(this).attr('name') != tempName) {
			$(this).attr('disabled', false);
			$(this)[0].checked = false;
		}
	})
	$(this).attr('disabled', 'disabled')
})

$(document).on('click', '#payment', function (e) {
	let uid = $(this).attr('uid');
	let type = '';
	let tBtn = $(this);
	let tBtnDefault = tBtn.html();

	$('[type=checkbox].payment-options').each(function (k, v) {
		if ($(this).is(':checked')) {
			type = $(this).val()
		}
	})
	if (type == '') {
		nutunMessage("Please select a payment method");
		return false;
	}

	if (uid == '') {
		nutunMessage("Unable to load payment screen");
		return false;
	}
	buttonLoadStart(tBtn, "Submitting...")
	if (bundledReport) {
		new Promise((resolve, reject) => {
			tHtml = `<div class="flex-container-modal show" id="bundled-reports-modal">
					
					<div class="modal-container">
					<div class="brand-border top"><div class="responsive-brand-top"></div></div>
						<div class="modalHeader">
							<div>
								<h4>Bundled Reports</h4>
							</div>
						</div>
						<div class="modalBody">
						<div class="group">
							<p class="alignCenter"><strong>Please Note: </strong>Bundled reports takes longer to generate than single reports.<br>Please do not refresh your browser or reload the page after a successful payment.
							</p>
						</div>
						</div>
						<div class="modalFooter">
							<div class="group" style="display: flex; flex-direction: row; justify-content: space-evenly;">
								<div>
									<button class="nutun-slide-button-dark modal-close" id="continue_purchase">Continue</button>
								</div>
								<div>
								<button class="nutun-slide-button-dark modal-close" id="cancel_purchase">Cancel</button>
								</div>
							</div>
						</div>
						<div class="brand-border bottom"><div class="responsive-brand-bottom"></div></div>
					</div>
					
				</div>`;
			$('#bundled-reports-modal').remove();
			$('body').append(tHtml);
			document.getElementById('continue_purchase').addEventListener('click', () => {
				resolve(true);
			})
			document.getElementById('cancel_purchase').addEventListener('click', () => {
				resolve(false);
			})
		}).then((data) => {
			if (data) {
				window.location.href = '/credit_health/payments/?uid=' + uid + '&type=' + type;
			}
		})
	} else {
		window.location.href = '/credit_health/payments/?uid=' + uid + '&type=' + type;
	}
	buttonLoadStop(tBtn, tBtnDefault);

})
/*
$(document).on('click', '#old-reports', function (e) {
	loaderStart();
	url = '/credit_health/get_old_report/';
	fetch(url, {
		method: 'POST',
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		return resp.json()
	}).then((data) => {
		let tFunction = data["function"]

		if (tFunction != 'ERROR') {
			Handler[tFunction](JSON.parse(data.old_reports_info));
		} else {
			Handler[tFunction](data);
		}

		loaderStop();
	}).catch((error) => {
		errorDisplay()
	});
})
*/

$(document).on('click', '.go-to-section', function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	let hiddenCSS = 'opacity: 0; transform: scale(0.8);'
	let visibleCSS = 'opacity: 1; box-shadow: black 0px 0px 0px 0px; transform: translateY(0px) scale(1);'
	tLocation = $(this).attr('href');
	newLocation = tLocation.substring(1);
	if ($('.navbar-list').hasClass('active')) {
		$('.navbar-list').removeClass('active');
	}
	if (!checkMobile()) {

		//Remove the visible from all the sections
		$('section.cd-section').removeClass("visible");

		//Add class to the go section
		$(tLocation).addClass("visible");

		//Set the containers css
		//First Blank
		$('section.cd-section').children('div').attr('style', hiddenCSS);

		//Then Active
		$('section.cd-section' + tLocation).children('div').attr('style', visibleCSS);

	}
	//Remove the active on the menu toggle
	$('.navbar-toggle').removeClass('is-active');

	window.location.hash = newLocation;
})

$(document).on('click', '.events', function (e) {
	e.stopImmediatePropagation();
	tCsrf = getCookiePage('csrftoken')
	tLeadUid = $(this).attr("leaduid")
	tType = $(this).attr("type")
	trackGeneric('credit_health', tLeadUid, tCsrf, tType, 'ch');

})

$(document).on('click', '.otp-clear', function (e) {
	e.preventDefault();
	$('.otp-entry').val('');
	$('.otp-entry:first').focus();
})

//FOR NOTIFICATION
$(function () {
	let message = '';
	if (message != '') {
		$('body').append('<div class="notifications"></div>');
		$('.notifications').css({
			"width": "calc(100vw - 35px)",
			"left": "50%",
			"transform": "translateX(-50%)",
			"position": "fixed",
			"top": "100px",
			"z-index": "3",
			"padding": "15px",
			"background-color": "rgba(47, 47, 145, 0.8)",
			"color": "white",

		});
		$('.notifications').append('<div class="notify-close"><i class="far fa-times-circle fa-2x"></i></div>');

		$('.notify-close').css({
			"display": "flex",
			"justify-content": "flex-end"
		})

		$('.notifications').append('<div class="notify-message"></i></div>');
		$(".notify-message").append(message);
		$(".notify-message").css({
			"text-align": "center"
		})

		$(document).on('click', '.notify-close', function (e) {
			$('.notifications').remove();
		})
	}
})


$(document).on('click', '.generate-new-report', function (e) {
	let selectedReport = $(e.currentTarget).attr('report-selection');
	loaderStart();
	fetch("/credit_health/get_new_report/", {
		method: 'POST',
		body: JSON.stringify({ "selected_report": selectedReport }),
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		loaderStop();
		$('.registration').empty();
		$('.registration-info').text('');
		$('.registration-heading').text('Please wait, while we are fetching your new report.')
		window.location.reload();
	}).catch((error) => {
		console.log(error);
	});
})

$(document).on('click', '#selectAll', function (e) {
	/* If the selectAll has a checked attribute remove it, and all the modal
		checkboxes get set to the same unchecked value and vice versa
	*/
	$('#selectAll').is(':checked') ? $(".product-service").prop("checked", true) : $(".product-service").prop("checked", false);
})

$(document).on('click', '.product-service', function () {
	let checkboxes = $(".product-service");
	let checkboxesChecked = [];
	for (box of checkboxes) {
		checkboxesChecked.push(box.checked);
	}
	let allUnchecked = checkboxesChecked.every((checked) => {
		return checked == false;
	})

	allUnchecked ? $('#selectAll').prop("checked", false) : $('#selectAll').prop("checked", true);
})

$(document).on('click', '#showOutstanding', function (e) {
	$('#outstanding').show(280);
	$('#outstanding').css("display", "flex");
})

$(document).on('click', '#submit-debt-counsel', function (e) {
	let theButton = $(this);
	let theButtonDefault = theButton.html();
	let tMessage = '';
	theButton.attr('disabled', 'disabled');

	tMessage = $('#text-message').val()
	dataToPost = { "text-message": tMessage }
	dataToPost[$('#debt-counsel-consent').attr('name')] = $('#debt-counsel-consent').is(":checked");
	buttonLoadStart(theButton, "Submitting...")
	fetch("/credit_health/debt_counsel_contact/", {
		method: 'POST',
		body: JSON.stringify(dataToPost),
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		resp.json().then((data) => {
			return { "status": resp.status, "message": data.message };
		}).then((data) => {
			if (data.status == 200) {
				buttonLoadStart
				nutunMessage(data.message);
				buttonLoadStop(theButton, theButtonDefault)
			} else {
				nutunMessage(data.message);
				buttonLoadStop(theButton, theButtonDefault)
			}
		})
	}).catch((error) => {
		nutunMessage("We could not process your request.")
		buttonLoadStop(theButton, theButtonDefault)
	});
})


$(document).on('click', '#seeArrearsAccounts', function (e) {
	let tBtn = $(this);
	let tBtnDefault = tBtn.html()
	buttonLoadStart(tBtn, "Fetching...")
	//loaderStart();
	$("#outstanding").empty();
	fetch("/credit_health/get_arrears_accounts/", {
		method: 'GET',
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		resp.json().then((data) => {
			let states = ['#1stState', '#2ndState', '#3rdState'];
			if (data.unpaid_accounts) {
				for (let state of states) {
					if ($(state).length) {
						let appendText = `
						<div><h3>Accounts Requiring Attention</h3></div>
						<div>Currently, there are ${data.unpaid_accounts.length} accounts which requires urgent attention, the accounts have been listed below</div>
						`;
						emptyAppendState(state, appendText);
						let unpaidAccounts = { outStandingAccounts: data.unpaid_accounts }
						const templates = [
							{ name: "#accountsOutstandingTemplate", data: unpaidAccounts }
						]
						loadTemplateAppend('accountsoutstanding.html', templates, state)
					}
				}

			} else {
				for (let state of states) {
					if ($(state).length) {
						let appendText = `
						<div class="appParentStyles blueDark appDivSpacing">
						<div id="${state}">
							<div><h3>Accounts Up to Date</h3></div>
							<div>Well done! You do not have any outstanding accounts. Remember to check your credit score often.<br></div>		
							<div style="display:flex;">
							<img style="width:50%;margin:auto;" src="${baseUrl}/css/credit_health/images/thumbs-up.png">
							</div>	
						</div>
					</div>
						`;
						emptyAppendState(state, appendText);
					}
				}
			}
		})
		buttonLoadStop(tBtn, tBtnDefault);
	}).catch((error) => {
		buttonLoadStop(tBtn, tBtnDefault);
		nutunMessage("We could not process your request.")
	});
})

emptyAppendState = (stateId, appendText) => {
	$(stateId).empty();
	$(stateId).append(appendText)
}
/* new tMenuHtml */

menuOptions = (unsub_url, user_opt_in, authed) => {
	tMenuHtml = '<div class="flex-menu-item">\
		<a href="'+ unsub_url + '" class="manage_subscriptions" fean="ch">Manage Subscriptions</a>\
	</div>';
	if (user_opt_in) {
		tMenuHtml += '<div class="flex-menu-item">\
		<a href="/credit_health/popi_agreement/" class="get_opt_in_agreement" fean="ch">Opt In Agreement</a>\
	</div>';
	}
	if (authed) {
		tMenuHtml += '<div class="flex-menu-item">\
		<a href="/credit_health/logout" class="logout">Logout</a>\
	</div>';
	}

	$('.flex-menu-item .manage_subscriptions').remove();
	$('.flex-menu-item .get_opt_in_agreement').remove();
	$('.flex-menu-item .logout').remove();
	$('.flex-menu').find('ul').append(tMenuHtml);

	/*
	tMenuHtml = '<div class="flex-menu-item">\
		<a href="'+ unsub_url + '" class="manage_subscriptions" fean="ch">Manage Subscriptions</a>\
	</div>';
	if (user_opt_in) {
		tMenuHtml += '<div class="flex-menu-item">\
		<a href="/credit_health/popi_agreement/" class="get_opt_in_agreement" fean="ch">Opt In Agreement</a>\
	</div>';
	}
	if (authed) {

		tMenuHtml += '<div class="flex-menu-desktop"><a href="/credit_health/logout" class="logout">Logout</a></div>';
	}
	$('.manage_subscriptions').parent('div').remove();
	$('.flex-menu-desktop .get_opt_in_agreement').remove();
	$('.flex-menu').append(tMenuHtml);
	$('.flex-menu-desktop').each((index, element) => {
		if ($(element).children().length < 1) {
			$(element).remove()
		}
	})
	*/

}

/* old tMenuHtml */
/* menuOptions = (unsub_url, user_opt_in) => {
	tMenuHtml = '<li class="navbar-item">\
		<a href="'+ unsub_url + '" class="manage_subscriptions" fean="ch">Manage Subscriptions</a>\
	</li>';
	if (user_opt_in) {
		tMenuHtml += '<li class="navbar-item">\
		<a href="/credit_health/popi_agreement/" class="get_opt_in_agreement" fean="ch">Opt In Agreement</a>\
	</li>';
	}
	$('.navbar-item .manage_subscriptions').remove();
	$('.navbar-item .get_opt_in_agreement').remove();
	$('.navbar-list').append(tMenuHtml);
}
*/

getImageRelatedToKey = (key) => {
	let basepath = `${baseUrl}/css/credit_health/images/`;
	let imagePath;
	switch (key) {
		case 'Vericred':
			imagePath = basepath + "vericred.png"
			break;
		case 'XDS':
			imagePath = basepath + "xds.png"
			break;
		case 'CPB':
			imagePath = basepath + "cpb.png"
			break;
		case 'TransUnion':
			imagePath = basepath + "trans-union.png"
			break;
		case 'Experian':
			imagePath = basepath + "experian.png"
			break;
	}
	return imagePath;
}

credit_score_chart_message = (data) => {
	try {
		if ((typeof (data) == 'string') && (data.indexOf('&#39;') > 0)) {
			data = JSON.parse(data.replace(/&#39;/g, '"'));
		}

		$.each(data.credit_score_band_dict, function (key, value) {
			if (parseInt(data.credit_score.credit_score) > parseInt(value["low"]) && parseInt(data.credit_score.credit_score) <= parseInt(value["high"])) {
				tMessage = value["message"]
				tPerc = value["population_percentage"]
				tNextHigh = parseInt(value["high"])
			}
		})
		let tPersonalMessage = 'You are part of ' + tPerc + '% of South Africans in the same Credit Score Band.';


		return tPersonalMessage;
	} catch (e) {
		//console.log(e);
	}
}

credit_score_message = (data) => {
	if ((typeof (data) == 'string') && (data.indexOf('&#39;') > 0)) {
		data = JSON.parse(data.replace(/&#39;/g, '"'));
	}

	$.each(data.credit_score_band_dict, function (key, value) {
		if (parseInt(data.credit_score.credit_score) >= parseInt(value["low"]) && parseInt(data.credit_score.credit_score) <= parseInt(value["high"])) {
			tMessage = value["message"]
			tPerc = value["population_percentage"]
			tNextHigh = parseInt(value["high"])
		}
	})
	let tPersonalMessage = 'Your Credit Score puts you in a <strong>' + tMessage + '</strong> category.';
	let tPersonalMessage2 = '';
	if (parseInt(data.credit_score.credit_score) >= 851) {
		tPersonalMessage2 = 'You are in the <strong>highest score band</strong>. Keep checking your Credit Report for changes that might impact your Credit Score.';
	} else {
		tCalc = tNextHigh - parseInt(data.credit_score.credit_score)
		tPersonalMessage2 = 'You are <strong>' + tCalc + ' points</strong> away from the next Score Band. Use your Credit Report to improve your Credit Score.';
	}

	return tPersonalMessage + " " + tPersonalMessage2
}

function hasCreditScore(data) {
	const next_recap = data.next_recap
	const creditScoreInfo = data.credit_score_info.credit_score;
	const creditScoreBands = data.credit_score_info.credit_score_band_dict;
	const oldReportsInfo = data.old_reports_info;
	const oldReportsInfoEmtpy = $.isEmptyObject(oldReportsInfo)
	const creditBureauSelection = data.selection;
	const bulkCreditBureauSelection = data.bulk_selection;
	const ddcAccountData = data.ddc_account_data;
	const actualCreditScore = data.credit_score_info.credit_score.credit_score;
	const creditChartMessage = credit_score_chart_message(data.credit_score_info);
	const creditInfoMessage = credit_score_message(data.credit_score_info)
	const prepopFuneralCover = data.prepop_funeral_cover;
	let exceptionMessage = ''
	if (data.credit_score_info.credit_score.exception != '') {
		exceptionMessage = data.credit_score_info.credit_score.exception
	}

	var actualScoreBand;

	for (let key in creditScoreBands) {
		let band = creditScoreBands[key];
		if (actualCreditScore >= Number(band['low']) && actualCreditScore <= Number(band['high'])) {
			actualScoreBand = band;
			_chartMyScoreBandPercentage = actualScoreBand;
			_actualColour = band["colour"]
		}
	}

	// Gets a list of selectable bureaus from creditBureauSelection
	let bureaus = Object.keys(creditBureauSelection).map(item => { return item })
	let bureauInformation = [];
	for (bureau of bureaus) {
		// Get bureau keys
		let keys = Object.keys(creditBureauSelection[bureau]);
		let objects = [];
		for (key of keys) {
			// Add bureau keys as object to array. Evaluate object key by using [key]		
			objects.push({ [key]: creditBureauSelection[bureau][key], next_recap: next_recap })
		}
		// Merge bureau keys from array of multiple objects, to a single object
		bureauInformation.push(Object.assign(...objects))
	}

	//let reportBureaus = Object.keys(oldReportsInfo).map(item => { return item })
	// Easier to use a relevant array of objects instead of an object of objects of objects.
	const cbSelectionTemplates = [
		{ name: "#creditScoreTemplate", data: { creditScoreInfo, actualScoreBand, creditChartMessage, creditInfoMessage, exceptionMessage, prepopFuneralCover } },
		{ name: "#bulkCreditBureauSelectionTemplate", data: { bulkCreditBureauSelection } },
		{ name: "#creditBureauSelectionTemplate", data: { bureauInformation } },
		{ name: "#oldReportsTemplate", data: { oldReportsInfo, oldReportsInfoEmtpy } },
		{ name: "#debtCounsellingArrearsAccountTemplate", data: { ddcAccountData } }
	]
	loadTemplateAppend('cbselection.html', cbSelectionTemplates, '.appDashboardContainer');
	const arrearsAccountsModalTemplates = [{ name: "#arrearsAccountsModal" }]
	loadTemplateAfter('arrearsaccountsmodal.html', arrearsAccountsModalTemplates, '.appDashboardContainer');
	setTimeout(() => {
		credit_score_graph(Math.round(creditScoreInfo.credit_score), 'credit-score-chart', 'Your XDS Credit Score', _actualColour);
		credit_score_doughnut(creditScoreBands, Math.round(creditScoreInfo.credit_score), 'population-chart');
		$("#datepicker").datepicker({
			dateFormat: "dd-mm-yy",
			changeMonth: true,
			changeYear: true,
			yearRange: "-59:+00"
		});
	}, 1200)

}

function overrideCbSelectionTemplate(data) {
	const templateData = JSON.parse(data);
	menuOptions(templateData.sub_url, templateData.user_opt_in, templateData.authed)
	// if (!$('.logout').length) {
	// 	templateData.authed ? $(".flex-menu").append(`
	// 	<div class="flex-menu-desktop"><a href="/credit_health/logout" class="logout">Logout</a></div>
	// 	`) : null;
	// }

	if (templateData.credit_score_info == false || templateData.credit_score_info == null) {
		noCreditScore(templateData);
	} else {
		hasCreditScore(templateData)
	}
}

function reportGenerationFailed(data) {
	$("body").append(`
	<div style="text-align: center;width: 50%;margin: auto;">
    <h1>${data.heading}</h1>
    <h2>${data.message}</h2>
<a href="/credit_health/register/?s=${data.redirect_param}" class="blockButton blueButton">Go back</a>
</div>
	`)
}

function noCreditScore(data) {

	const oldReportsInfo = data.old_reports_info;
	const oldReportsInfoEmtpy = $.isEmptyObject(oldReportsInfo)
	const creditBureauSelection = data.selection;
	const ddcAccountData = data.ddc_account_data;
	const bulkCreditBureauSelection = data.bulk_selection;
	var creditScoreInfo = false;
	const next_recap = data.next_recap
	const prepopFuneralCover = data.prepop_funeral_cover;
	// Gets a list of selectable bureaus from creditBureauSelection
	let bureaus = Object.keys(creditBureauSelection).map(item => { return item })
	let bureauInformation = [];
	for (bureau of bureaus) {
		// Get bureau keys
		let keys = Object.keys(creditBureauSelection[bureau]);
		let objects = [];
		for (key of keys) {
			// Add bureau keys as object to array. Evaluate object key by using [key]		
			objects.push({ [key]: creditBureauSelection[bureau][key], next_recap: next_recap })
		}
		// Merge bureau keys from array of multiple objects, to a single object
		bureauInformation.push(Object.assign(...objects))
	}
	/*
	let reportBureaus = Object.keys(oldReportsInfo).map(item => { return item })
	// Easier to use a relevant array of objects instead of an object of objects of objects.

	let amendedData = [];
	for (let bureau of reportBureaus) {
		let count = 0;
		for (let key of Object.keys(oldReportsInfo[bureau])) {
			let date, time;
			[date, time] = oldReportsInfo[bureau][key].split(" ");
			time = time.split(".")[0]
			date = new Date(date).toLocaleString().split(",")[0]
			amendedData.push({ "bureau": bureau, "bureau_index_value": bureau + "_" + count, "date": date, "time": time, "image_path": getImageRelatedToKey(bureau) })
			count += 1;
		}
	}
	*/
	const cbSelectionTemplates = [
		{ name: "#creditScoreTemplate", data: { creditScoreInfo, prepopFuneralCover } },
		{ name: "#bulkCreditBureauSelectionTemplate", data: { bulkCreditBureauSelection } },
		{ name: "#creditBureauSelectionTemplate", data: { bureauInformation } },
		{ name: "#oldReportsTemplate", data: { oldReportsInfo, oldReportsInfoEmtpy } },
		{ name: "#debtCounsellingArrearsAccountTemplate", data: { ddcAccountData } }
	]
	loadTemplateAppend('cbselection.html', cbSelectionTemplates, '.appDashboardContainer');
	const arrearsAccountsModalTemplates = [{ name: "#arrearsAccountsModal" }]
	loadTemplateAfter('arrearsaccountsmodal.html', arrearsAccountsModalTemplates, '.appDashboardContainer');
	setTimeout(() => {
		$("#datepicker").datepicker({
			dateFormat: "dd-mm-yy",
			changeMonth: true,
			changeYear: true,
			yearRange: "-59:+00"
		});
		if (data['success'] == false) {
			$('.heading').text(data.heading);
			$('.message').text(data.message);
			$('.heading').css({ "text-align": "center" })
			$('.message').css({ "text-align": "center" })
			$("#getFreeCreditReport").length ? $("#getFreeCreditReport").remove() : null;
		}
	}, 200);

}


$(document).on('click', $('#credit-score-terms-modal').find('input')[0], function () {
	var creditScoreTermsBox = $('#creditScoreTerms')[0];
	var optInCheckbox = document.querySelector("#credit-score-terms-modal");
	if (optInCheckbox) {
		optInCheckbox = optInCheckbox.querySelectorAll('input')[0];
	}
	if (creditScoreTermsBox && optInCheckbox) {
		optInCheckbox.checked ? creditScoreTermsBox.checked = true : creditScoreTermsBox.checked = false;
	}
})


$(document).on('click', '#creditScoreTerms', function () {
	var creditScoreTermsBox = $('#creditScoreTerms')[0];
	var optInCheckbox = document.querySelector("#credit-score-terms-modal").querySelectorAll('input')[0];
	creditScoreTermsBox.checked ? optInCheckbox.checked = true : optInCheckbox.checked = false;
})

$(document).on('click', '#getCreditScoreConsent', function () {
	loaderStart();
	url = '/credit_health/get_credit_score_with_consent/';
	fetch(url, {
		method: 'POST',
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		return resp.json()
	}).then((data) => {
		if (data.credit_score.exception === null) {
			const creditScoreInfo = data.credit_score;
			const creditScoreBands = data.credit_score_band_dict;
			const actualCreditScore = data.credit_score.credit_score;
			const prepopFuneralCover = data.prepop_funeral_cover;
			var actualScoreBand;
			const creditChartMessage = credit_score_chart_message(data);
			const creditInfoMessage = credit_score_message(data);

			for (let key in creditScoreBands) {
				let band = creditScoreBands[key];
				if (actualCreditScore >= Number(band['low']) && actualCreditScore <= Number(band['high'])) {
					actualScoreBand = band;
					_chartMyScoreBandPercentage = actualScoreBand;
					_actualColour = band["colour"]
				}
			}
			const cbSelectionTemplates = [
				{ name: "#creditScoreTemplate", data: { creditScoreInfo, actualScoreBand, creditChartMessage, creditInfoMessage, prepopFuneralCover } },
			]
			loadTemplatePrepend('cbselection.html', cbSelectionTemplates, '.appDashboardContainer');
			setTimeout(() => {
				credit_score_graph(Math.round(creditScoreInfo.credit_score), 'credit-score-chart', 'Your XDS Credit Score', _actualColour);
				credit_score_doughnut(creditScoreBands, Math.round(creditScoreInfo.credit_score), 'population-chart');
				$("#datepicker").datepicker({
					dateFormat: "dd-mm-yy",
					changeMonth: true,
					changeYear: true,
					yearRange: "-59:+00"
				});
			}, 1200)
			$('#getFreeCreditReport').remove();
			$("#funeralCover").remove();
		} else {
			errorDisplay('We were unable to retrieve your credit score. Please try again later.')
		}
		loaderStop();
	}).catch((error) => {
		loaderStop();
		errorDisplay('We were unable to retrieve your credit score. Please try again later.')
	});

})

function validateFuneralCoverForm(payload) {
	const validMaritalStatuses = ["Divorced", "Separated", "Single", "Widowed", "Married", "Other"];
	const validGenders = ["Male", "Female", "Other"];
	const maxAge = 60;
	const minAge = 18;
	const maxAmount = 80000;

	// Javascript really does not like dd/mm/YYY
	const formatDate = (date, separator = '-') => {
		const [day, month, year] = date.split('-');
		return month + separator + day + separator + year;
	};

	if (!validateEmail(payload["email_address"])) {
		nutunMessage("Please provide a valid email address");
		return false;
	}


	if (payload['first_name'].trim() == "") {
		nutunMessage("Please provide a first name");
		return false;
	}

	if (payload['last_name'].trim() == "") {
		nutunMessage("Please provide a last name");
		return false;
	}

	if (payload["date_of_birth"] == "") {
		nutunMessage("Please provide a date of birth");
		return false;
	}

	if (!validMaritalStatuses.includes(payload['marital_status'])) {
		nutunMessage("Please provide a valid marital status")
		return false;
	}
	if (!validGenders.includes(payload['gender'])) {
		nutunMessage("Please provide a valid gender");
		return false;
	}

	if (new Date().getFullYear() - new Date(formatDate(payload['date_of_birth'])).getFullYear() > maxAge) {
		nutunMessage("You must be 60 years or younger to apply for funeral cover")
		return false;
	}

	if (new Date().getFullYear() - new Date(formatDate(payload['date_of_birth'])).getFullYear() < minAge) {
		nutunMessage("You must be 18 years or older to apply for funeral cover")
		return false;
	}

	if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(payload['phone_number'])) {
		nutunMessage("Please provide a valid phone number")
		return false;
	}

	return true;

}

$(document).on('click', '#getFuneralCoverBtn', function (e) {
	e.preventDefault();
	let form = $(this).closest('.funeralCoverForm');
	let payload = new Object();
	$(form).find('[name]').each(function (i, v) {
		if ($(this).attr('type') == "checkbox") {
			payload[$(this).attr('name')] = $(this).is(':checked');
		} else {
			payload[$(this).attr('name')] = $(this).val().trim();
		}
	})
	if (!validateFuneralCoverForm(payload)) {
		return;
	}

	let tBtn = $(this);
	let tBtnHtml = $(this).html();
	var newWindow;
	//CONVERT DATE FORMAT
	tempDateArray = payload["date_of_birth"].split("-");
	payload["date_of_birth"] = `${tempDateArray[2]}-${tempDateArray[1]}-${tempDateArray[0]}`

	buttonLoadStart(tBtn, "Please Wait...");
	/*
	setTimeout(() => {
		closeModal("#funeralCoverSignUpModal");
	}, 2000)
	setTimeout(() => {
		displayModal("#funeralCoverResultModal");
	},1200)
	setTimeout(() => {
		
	},5200)
	*/
	fetch("/credit_health/get_funeral_cover/", {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {

		resp.json().then((data) => {
			return { "status": resp.status, "message": data.message };
		}).then((data) => {
			buttonLoadStop(tBtn, tBtnHtml)
			if (data.status == 200) {
				$("#getUpUrl").prop("href", data.message);
				newWindow = window.open();
				setTimeout(() => {
					newWindow.location = data.message;
					displayModal("#funeralCoverResultModal");
				}, 500)
				closeModal("#funeralCoverSignUpModal");

			} else {
				//closeModal("#funeralCoverResultModal")
				nutunMessage(data.message);
				return
			}
		})
	}).catch((error) => {
		buttonLoadStop(tBtn, tBtnHtml)
		nutunMessage("An unexpected error occured. Please try again later.")
	});
})


$(document).on('click', '#applyDiscountCode', function () {
	let tBtn = $(this);
	let discountCode = $('#discountCode').val();
	if (discountCode == '') {
		nutunMessage("Please enter a discount code");
		return;
	}
	buttonLoadStart(tBtn, "Submitting...")
	$(this).prop("disabled", true);
	dataToPost = { "code": discountCode }
	fetch("/credit_health/apply_discount_code/", {
		method: 'POST',
		body: JSON.stringify(dataToPost),
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		resp.json().then((data) => {
			return { "status": resp.status, "message": data.message, "discount": data.discount };
		}).then((data) => {
			if (data.status == 200) {
				let currentAmount = Number($('#payAmount').first().text().split("R")[1]);
				$('#payAmount').children("strong").css("text-decoration", "line-through");
				$('#payAmount').append(`<div id="discountText"><br><strong>R${parseFloat(currentAmount - (data.discount / 100 * currentAmount)).toFixed(2)}</strong></div>`)
				$(this).removeClass('blueButton');
				nutunMessage(data.message);
				$('#discountDetails').append(`
				<div id="clearDiscountContainer" class="appContainerItemInput" style="display: flex;justify-content: flex-end; cursor:pointer;">
					<small id="clearDiscountCode">Clear discount code</small>
					</div>
				`)
				buttonLoadStop(tBtn, "Apply Code")
			} else {
				nutunMessage(data.message);
				buttonLoadStop(tBtn, "Apply Code")
				$(this).prop("disabled", false);
			}
		})
	}).catch((error) => {
		nutunMessage("An unexpected error occured. Please try again later.")
		buttonLoadStop(tBtn, "Apply Code")
		$(this).prop("disabled", false);
	});

})

$(document).on('click', '#clearDiscountCode', function () {
	fetch("/credit_health/clear_discount_code/", {
		method: 'POST',
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		resp.json().then((data) => {
			return { "status": resp.status, "message": data.message };
		}).then((data) => {
			if (data.status == 200) {
				nutunMessage(data.message)
				$('#payAmount').children("strong").css("text-decoration", "none");
				$('#payAmount strong:last').remove();
				$('#applyDiscountCode').prop("disabled", false);
				$('#applyDiscountCode').addClass('blueButton');
				$('#clearDiscountContainer').remove();
				$('#discountText').remove();
				$('#applyDiscountCode').removeClass("disabled");
			} else {
				nutunMessage(data.message);
			}
		})
	}).catch((error) => {
		nutunMessage("An unexpected error occured. Please try again later.")
	});
})

$(document).on('input', "#cover_band", function (e) {
	$('#cover_band_label').text("R" + $(this).val() + ".00");
})

function loadTemplateAfter(templateName, templates, target) {
	/**
	 * Loads a template after a target element.
	 * @param {string} templateName - The name of the html template.
	 * @param {Array} templates - An Array of template objects containing a # template name, and the data associated with the template.
	 * @param {string} target - The target element to append the template on to.
	 */
	var path = templateBaseUrl + templateName;
	if (_loadedTemplates) {
		_loadedTemplates.map(template => {
			$(template.name).remove();
		})
	}
	_loadedTemplates = templates;
	try {
		$("<div/>").load(path, function () {
			$(this).appendTo("body").unwrap();
			templates.map(template => {
				if (template.hasOwnProperty("data")) {
					$(target).after($.templates(template.name).render(template.data, utils)).hide().fadeIn(200)
				} else {
					$(target).after($.templates(template.name).render()).hide().fadeIn(200)
				}
			})
			$(this).remove();
		});
	} catch (error) {
		console.error(error);
	}

}

function loadTemplateAppend(templateName, templates, target) {
	/**
 * Appends a template to a target element.
 * @param {string} templateName - The name of the html template.
 * @param {Array} templates - An Array of template objects containing a # template name, and the data associated with the template.
 * @param {string} target - The target element to append the template on to.
	
 */
	//Unload a previous template if there is one to prevent form conflicts
	var path = templateBaseUrl + templateName;
	if (_loadedTemplates) {
		_loadedTemplates.map(template => {
			$(template).remove();
		})
	}
	_loadedTemplates = templates;
	try {
		$("<div/>").load(path, function () {
			$(this).appendTo("body").unwrap();
			templates.map(template => {
				if (template.hasOwnProperty("data")) {
					$(target).append($.templates(template.name).render(template.data, utils)).hide().fadeIn(200)
				} else {
					$(target).append($.templates(template.name).render()).hide().fadeIn(200)
				}
			})
			$(this).remove();
		});
	} catch (error) {
		console.error(e)
	}

}

function loadTemplatePrepend(templateName, templates, target) {
	/**
 * Prepend a template to a target element.
 * @param {string} templateName - The name of the html template.
 * @param {Array} templates - An Array of template objects containing a # template name, and the data associated with the template.
 * @param {string} target - The target element to append the template on to.
 */

	//Unload a previous template if there is one to prevent form conflicts
	var path = templateBaseUrl + templateName;
	if (_loadedTemplates) {
		_loadedTemplates.map(template => {
			$(template).remove();
		})
	}
	_loadedTemplates = templates;
	try {
		$("<div/>").load(path, function () {
			$(this).appendTo("body").unwrap();
			templates.map(template => {
				if (template.hasOwnProperty("data")) {
					$(target).prepend($.templates(template.name).render(template.data, utils)).hide().fadeIn(200)
				} else {
					$(target).prepend($.templates(template.name).render()).hide().fadeIn(200)
				}
			})
			$(this).remove();
		});
	} catch (error) {
		console.error(e)
	}

}

changeMethod = async (otpMethod) => {
	otpMethod == "sms" ? newMethod = "whatsapp" : newMethod = "sms";
	return new Promise((resolve, reject) => {
		html = `<div class="flex-container-modal show" id="otp-method-change-modal">\
			<div class="appDivSpacing appParentStyles appLighttBG">\
				<div class="modalHeader">\
				<div>\
				<h4>OTP Delivery</h4>\
				</div>\
				</div>\
				<div class="modalBody">\
				<div class="group">\
				<p class="alignCenter">\
					You are current using <strong>${otpMethod.toUpperCase()}</strong> as a delivery method for the OTP. Perhaps <strong>${newMethod.toUpperCase()}</strong> might work better. Can we try that?
				</p>\
				</div>\
				</div>\
				<div class="modalFooter">\
				<div class="group" style="display: flex; flex-direction: row; justify-content: space-evenly;">\
				<div><div id="change_method_agree" class="blockButton blueButton otp_method" type="${newMethod}">Yes</div></div>\
				<div><div id="change_method_decline" class="blockButton otp_method" type="${otpMethod}">No</div></div>\
				</div>\
				</div>\
				</div>\
				</div>`;
		$('body').append(html);
		tOptions = document.getElementsByClassName('otp_method')
		for (i = 0; i < tOptions.length; i++) {
			tOptions[i].addEventListener("click", (e) => {
				let attr = e.target.getAttribute('type');
				resolve(attr)
			})
		}
	})
}

$(document).on('click', '.submit-fin-wellness', function (e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	let dataToPost = {};
	let submitButton = $(this);
	inputFails = 0

	if (submitButton.hasClass('quiz-submit')) {
		tUrl = "/credit_health/post_quiz/";
		$('.debt-wellness-quiz .required').each(function (e) {
			if (!validateFieldParent($(this))) {
				++inputFails
			};
		})
		$('.debt-wellness-quiz [name]').each(function (i, v) {
			if ($(this).attr('type') == "checkbox") {
				dataToPost[$(this).attr('name')] = $(this).is(':checked');
			} else {
				dataToPost[$(this).attr('name')] = $(this).val().trim();
			}
		})
	} else {
		tUrl = "/credit_health/debt_counsel_contact/";
		$('.debt-wellness .required').each(function (e) {
			if (!validateFieldParent($(this))) {
				++inputFails
			};
		})
		$('.debt-wellness [name]').each(function (i, v) {
			if ($(this).attr('type') == "checkbox") {
				dataToPost[$(this).attr('name')] = $(this).is(':checked');
			} else {
				dataToPost[$(this).attr('name')] = $(this).val().trim();
			}
		})
	}


	if (inputFails > 0) {
		errorDisplay("Please complete the required fields.")
		return false;
	}

	//Lets add this for the BE
	dataToPost["prelogin"] = true



	//Lets do some sanity check..., eg email
	if (dataToPost['Email']) {
		if (!validateEmail(dataToPost["email_address"])) {
			errorDisplay("Please supply a valid email address")
			return false;
		}
	}



	fetch(tUrl, {
		method: 'POST',
		body: JSON.stringify(dataToPost),
		headers: { "X-CSRFToken": getCookiePage('csrftoken') }
	}).then((resp) => {
		resp.json().then((data) => {
			return { "status": resp.status, "message": data.message };
		}).then((data) => {
			if (data.status == 200) {
				successDisplay(data.message);
			} else {
				errorDisplay(data.message);
			}
		})
	}).catch((error) => {
		errorDisplay("We could not process your request.")
	});
})
/*

$(document).on('click', '.testModal', function (e) {
	otpMethod = "sms";
	e.preventDefault();
	e.stopImmediatePropagation();
	changeMethod(otpMethod).then((resp) => {
		console.log(resp)
	})
})
*/

$(document).on("keyup", '#searchFilter', function (e) {
	if (e.target.value == '') {
		$(".search-results").empty();
		return;
	}
	let articleTitleElements = $(".article-title");
	var articleTitles = articleTitleElements.map((_, article) => $(article).text());
	var searchResults = articleTitles.toArray().filter(article => article.toLowerCase().includes(e.target.value.toLowerCase()));
	$(".search-results").empty();
	if (searchResults.length == 0) {
		$('#results-container').hide();
		$(".search-results").append(`<p>There are no articles matching your search  </p>`);
		return;
	}
	$('#results-container').show();
	$(".search-results").append(`<p>We found ${searchResults.length} result(s) matching your search term</p>`);
	let articleTitleArray = articleTitles.toArray();
	for (result of searchResults) {
		var index = articleTitleArray.indexOf(result)
		let singleArticleTitle = articleTitles.prevObject[index];
		let href = $(singleArticleTitle).parent().children().closest('a').attr('href');
		$(".search-results").append(`<a class="search-result-item" href="${href}">${result}</a>`)
	}

})

$(document).on("click", ".logout", function (e) {

})

$(document).on("click", ".reg_details_changes", function (e) {
	e.preventDefault();
	new Promise((resolve, reject) => {
		tHtml = `<div class="flex-container-modal show" id="bundled-reports-modal">
					
					<div class="modal-container">
					<div class="brand-border top"><div class="responsive-brand-top"></div></div>
						<div class="modalHeader">
							<div>
								<h4>Account Reset</h4>
							</div>
						</div>
						<div class="modalBody">
						<div class="group">
							<p class="alignCenter"><strong>Please Note: </strong>Changing your cellphone number, will require you to register again. Do you want to continue?
							</p>
						</div>
						</div>
						<div class="modalFooter">
							<div class="group" style="display: flex; flex-direction: row; justify-content: space-evenly;">
								<div>
									<button class="nutun-slide-button-dark modal-close" id="continue-number-change">Continue</button>
								</div>
								<div>
								<button class="nutun-slide-button-dark modal-close" id="cancel-number-change">Cancel</button>
								</div>
							</div>
						</div>
						<div class="brand-border bottom"><div class="responsive-brand-bottom"></div></div>
					</div>
				</div>`;

		$('#bundled-reports-modal').remove();
		$('body').append(tHtml);
		document.getElementById('continue-number-change').addEventListener('click', () => {
			resolve(true);
		})
		document.getElementById('cancel-number-change').addEventListener('click', () => {
			resolve(false);
		})
	}).then((data) => {
		if (data) {
			tUrl = "/credit_health/registration_reset";

			fetch(tUrl, {
				method: "GET",
				headers: { "X-CSRFToken": getCookiePage('csrftoken') }
			}).then((data) => {
				location.reload();
			})
		}
	})
	/*
	
	*/
})