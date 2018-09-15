(function( $ ){
	$.fn.sendRequest = function (query, callback){
		$('#loading').addClass('show');
		$.ajax({
			dataType: 'json',
			url: 'data/route.php',
			type: 'post',
			data: query,
			success: function( d ){
				setTimeout(()=>{
					$('#loading').removeClass('show');
				}, 500);
				;
				callback( d );
			}
		});
	};

	var calendar_month = ( title, month_id ) =>{
		return `<div class="month-container">
		<div class="month" data-month-id=${month_id}>
		<div class="calendar_header_month">${title}</div>
		<div class="calendar_header"></div>
		</div>
		</div>`;
	};

	var week_title = ( title ) => {
		return `<div>${title}</div>`;
	};

	var calendar_week = () => {
		return `<div class="calendar_week"></div>`;
	};

	var calendar_day = ( day ) => {
		if ( day === '*' ) {
			return `<div class="calendar_day"></div>`;
		}
		return `<div class="calendar_day">${day}</div>`;
	};

	function createCalendar(){
		let query = {'action': 'getCalendar'};
		$(this).sendRequest(query, (d)=> {
			let calendar = d.data.calendar;
			let weeks_titlies = d.data.weeks;

			for (n in calendar) {
				$('#calendar').append( calendar_month( calendar[n].title, n ) );

				for (w in weeks_titlies) {
					$('#calendar').find(`[data-month-id="${n}"]`).find('.calendar_header').append( week_title( weeks_titlies[w] ) );
				}

				let weeks = calendar[n].dates;

				for (dt in weeks) {
					$('#calendar').find(`[data-month-id="${n}"]`).append( calendar_week() );

					let daysOfWeek = weeks[dt];

					for (day in daysOfWeek) {
						$('#calendar').find(`[data-month-id="${n}"]`).find('.calendar_week').last().append( calendar_day( daysOfWeek[day] ) );
					}				
				}
			}

			$('#calendar').on('click', '.calendar_day', function(e){
				if ( !e.shiftKey || $('.selected').length > 2 ) {
					$('.selected').removeClass('selected');
				}

				if ( $(this).text() != '' ) {
					$(this).addClass('selected');

					if ( $('.selected').length > 1 ) {
						let first = $('.selected').first();
						let last = $('.selected').last();

						var canAddSelect = false;

						$('.calendar_day').each(function(i, el) {
							if ( $(el)[0] === first[0] ) {
								canAddSelect = true;
							}

							if ( $(el)[0] === last[0] ) {
								canAddSelect = false;
							} else {
								$(el).removeClass('selected');
							}

							if ( canAddSelect ) {
								if ( $(el).text() != '' ) {
									$(el).addClass('selected');
								}
							}
						});
					}
				}
			});

			setSelections();
		});
	}

	function setSelections(){
		let query = {'action': 'getData' };
		$(this).sendRequest(query, (d) => {
			if ( d.hasOwnProperty('data') ) {
				d = d.data;

				if ( d.startMonth == d.endMonth && d.startDay == d.endDay ) {
					console.log('qwe');
					$(`[data-month-id="${d.startMonth}"]`).find(`.calendar_day:contains("${d.startDay}")`).addClass('selected');
				} else {
					for (var i = +d.startMonth; i <= +d.endMonth; i++) {
						$(`[data-month-id="${i}"]`).find('.calendar_day').each(function(index, el) {
							if ( $(el).text() != '' ) {
								if ( i == d.startMonth && +$(el).text() >= d.startDay) {
									$(el).addClass('selected');
								} else if ( i > d.startMonth && i < d.endMonth ) {
									$(el).addClass('selected');
								} else if ( i == d.endMonth && +$(el).text() <= d.endDay) {
									$(el).addClass('selected');
								}
							}
						});
					}
				}
			}
		});
	}

	function saveData( number, dates){
		let dl = dates.length;
		let nl = number.length;

		if ( dates.length && number ){
			let firstSelectedMonth = dates.first().closest('.month').attr('data-month-id');
			let lastSelectedMonth = dates.last().closest('.month').attr('data-month-id');

			let s = `${dates.first().text()}.${firstSelectedMonth}-${dates.last().text()}.${lastSelectedMonth}`;

			let query = {'action': 'saveData', 'phone': number, 'dates': s };
			$(this).sendRequest(query, (d)=>{
				showMessage( d.status, d.message );
			});
		} else if ( !dl ) {
			showMessage( 'error', 'Не выбрана ни одна дата.' );
		} else if ( !nl ) {
			showMessage( 'error', 'Ошибка при вводе телефонного номера.' );
		}
	}

	function showMessage( type, text ){
		$('#popup-icon i').removeClass('show');
		$(`#popup-icon .${type}`).addClass('show');

		let title = type == 'error' ? 'Ошибка!' :
		type == 'success' ? 'Успех!' : '';

		$('#popup-title').text( title );

		$('#popup-text').text( text );

		$('#popup').addClass('show');
	}

	$(function(){
		jQuery(document).ready(function($) {
			createCalendar();

			$('#phone').mask("+7 (999) 999-99-99", {autoсlear: false});

			$('body').on('keyup','#phone',function(){
				var phoneVal = $(this).val();

				if ( (phoneVal.indexOf("_") != -1) || phoneVal == '' ) {
					$('#send').attr('disabled',true).addClass('disabled');
				} else {
					$('#send').removeAttr('disabled').removeClass('disabled');
				}
			});

			$('body').on('click', '#send', function() {
				if ( !$(this).attr('disabled') && !$(this).hasClass('disabled') ) {
					saveData( $('#phone').val(), $('.calendar_day.selected') );
				}
			});

			$('body').on('click', '#close, #overflow', function() {
				$('#popup').removeClass('show');
			});
		});
	});
})( jQuery );