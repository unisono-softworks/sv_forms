<?php
/*
	Version: 2.0.07
	Plugin Name: SV Forms
	Text Domain: sv_forms
	Description: Build forms in the WordPress Gutenberg Block-Editor with ease.
	Plugin URI: https://straightvisions.com/
	Author: straightvisions GmbH
	Author URI: https://straightvisions.com
	Domain Path: /languages
	License: GPL-3.0-or-later
	License URI: https://www.gnu.org/licenses/gpl-3.0-standalone.html
*/

namespace sv_forms;

if ( ! class_exists( '\sv_dependencies\init' ) ) {
	require_once( 'src/core_plugin/dependencies/sv_dependencies.php' );
}

if ( $GLOBALS['sv_dependencies']->set_instance_name( 'SV Forms' )->check_php_version() ) {
	require_once( dirname( __FILE__ ) . '/src/init.php' );
} else {
	$GLOBALS['sv_dependencies']->php_update_notification()->prevent_plugin_activation();
}