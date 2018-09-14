<?php
function getCalendar(){
	$data = json_decode(file_get_contents( __DIR__.DIRECTORY_SEPARATOR.'cached.json' ));

	if ( $data == null || $data->year != date('Y') ) {
		$data = new stdClass();

		$data->year != date('Y');

		$result = new stdClass();

		$result->weeks = (object)array( 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс' );
		$months = array( 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' );

		$result->calendar = new stdClass();

		for ($i = 1; $i <= 12; $i++) {

			$result->calendar->$i = new stdClass();
			$result->calendar->$i->title = new stdClass();
			$result->calendar->$i->dates = new stdClass();

			$result->calendar->$i->title = $months[$i - 1];
			$result->calendar->$i->dates = getMonthDates( $i, date('Y') );
		}

		$data->content = $result;

		file_put_contents( __DIR__.DIRECTORY_SEPARATOR.'cached.json', json_encode( $data ) );

		return $result;
	} else {
		return $data->content;
	}
}

function saveData( $phone, $dates ){
	$result = new stdClass();

	$t = preg_replace('/[\s\+\(\)\-]/', '', $phone);

	if ( !is_numeric($t) ) {
		$result->type = 'error';
		$result->message = 'Некорректные данные (номер телефона)!';

		return $result;
	}	

	$t =  preg_split('/[\.\-]/', $dates);

	if ( count($t) > 4 ||
			$t[0] > 31 || !is_numeric($t[0]) ||
			$t[1] > 12 || !is_numeric($t[1]) ||
			$t[2] > 31 || !is_numeric($t[2]) ||
			$t[3] > 12 || !is_numeric($t[3]) ) 
	{
		$result->type = 'error';
		$result->message = 'Не выбрана ни одна дата.';
		return $result;
	}

	$output = new stdClass();
	$output->dates = $dates;
	$output->phone = $phone;

	file_put_contents( __DIR__.DIRECTORY_SEPARATOR.'data.json', json_encode( $output ) );

	$result->type = 'success';
	$result->message = 'Данные успешно сохранены.';

	return $result;
}

function getData(){
	$output = new stdClass();

	$o = json_decode(file_get_contents( __DIR__.DIRECTORY_SEPARATOR.'data.json' ));

	if ( $o == null ) {
		$output = null;
	} else {
		$t =  preg_split('/[\.\-]/', $o->dates);

		$output->startDay = $t[0];
		$output->startMonth = $t[1];
		$output->endDay = $t[2];
		$output->endMonth = $t[3];

		//$output->phone = $o->phone;
	}

	return $output;
}

function getMonthDates( $month, $year ){
	$rows = explode(', ', date('t, w', mktime(0, 0, 0, $month, 1, $year)));
	$rows[1] = (int)trim($rows[1]) - 1;
	if ($rows[1] < 0) {
		$rows[1] = 6;
	}

	$all_places = ( ceil(($rows[0] + $rows[1]) / 7) * 7 - ($rows[0] + $rows[1]) ) + ($rows[0] + $rows[1]);

	$mm = array();

	$dates = "";
	for($i = 1; $i <= $all_places; $i++){
		if ( ($i <= $rows[1]) || $i > ($rows[0] + $rows[1]) ){
			$dates .= "* ";
		} else {
			$dates .= str_pad( ($i - $rows[1]), 2, '-', STR_PAD_LEFT ) . " ";
		}
		if ( ($i % 7) == 0 ) {
			$dates = trim( $dates );
			if ( $i < $all_places ){
				$dates .= '/';
			}
		}
	}

	$dates = preg_replace( '/\-/', '', $dates );
	$dates = explode( '/', $dates );

	foreach ($dates as $k => $v) {
		$dates[$k] = explode(' ', $v);
	}

	return $dates;
}
?>