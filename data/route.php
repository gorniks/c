<?php
	$action = $_POST['action'];

	require_once 'data.php';

	switch ( $action ) {
		case 'getCalendar':
			echo result(null, null, getCalendar());
		break;

		case 'saveData':
			$data = saveData($_POST['phone'], $_POST['dates']);

			echo result($data->type, $data->message, $data->data);
		break;

		case 'getData':
			echo result(null, null, getData());
		break;
		
		default:
			echo result( 'error',
				'Неизвестный метод '.$action,
				false );
		break;
	}

	function result( $status, $message, $data ){
		$o = new stdClass();

		$o->status = $status;
		$o->message = $message;

		if ( $data ){
			$o->data = $data;
		}

		return json_encode( $o );
	}
?>