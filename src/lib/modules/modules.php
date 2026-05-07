<?php
namespace sv_forms;

class modules extends init {
	// SSL Cryption Properties
	private $ciphering 		= 'AES-128-CTR';
	private $options		= 0;
	private $cryption_key	= 'sv_forms_sg_cryption_key';
	private $cryption_iv	= '1234567891011121';
	
	public function init() {
		// Do not change to following module init order!
		$this->load_module('post');				// Always init first!
		$this->load_module('taxonomy'); 		// Dependency: post module - Only init after post init
		$this->load_module('archive');			// Dependency: taxonomy module - Only init after taxonomy init

		// The following module init order can be changed
		$this->load_module('sv_forms');
		$this->load_module('files');
		$this->load_module('submission');
		$this->load_module('personal_data');

		$this->load_module('update');
	}

	// Allows to use an array of needles for strpos
	protected function strpos_array( $haystack, $needles ) {
		if ( is_array( $needles ) ) {
			foreach ( $needles as $str ) {
				if ( is_array( $str ) ) {
					$pos = strpos_array( $haystack, $str );
				} else {
					$pos = strpos( $haystack, $str );
				}

				if ( $pos !== FALSE ) {
					return $pos;
				}
			}
		} else {
			return strpos( $haystack, $needles );
		}
	}

	// Returns an input value from an data array, by it's input name
	protected function get_input_value( string $name, array $data, bool $single = true ) {
		$values = array();
		
		foreach( $data as $input ) {
			if ( $input['name'] === $name ) {
				if ( $single ) {
					return $input['value'];
				} else {
					$values[] = $input['value'];
				}
			}
		}

		return $values;
	}

	// Removes a certain input value from an data array, by it's input name and returns the updated data array
	protected function remove_input_value( $name, array $data ): array {	
		$new_data = $data;
		
		foreach( $data as $index => $input ) {
			if ( is_string( $name ) ) {
				if ( $input['name'] === $name ) {
					unset( $new_data[ $index ] );
				}
			}

			if ( is_array( $name ) ) {
				if ( in_array( $input['name'], $name, true ) ) {
					unset( $new_data[ $index ] );
				}
			}
		}

		return $new_data;
	}

	// Returns an encrypted string
	// Source: https://www.geeksforgeeks.org/how-to-encrypt-and-decrypt-a-php-string/
	protected function encrypt_string( string $string ): string {
		return openssl_encrypt( $string, $this->ciphering, $this->cryption_key, $this->options, $this->cryption_iv );
	}

	// Returns a decrypted string
	// Source: https://www.geeksforgeeks.org/how-to-encrypt-and-decrypt-a-php-string/
	protected function decrypt_string( string $string ): string {
		return openssl_decrypt( $string, $this->ciphering, $this->cryption_key, $this->options, $this->cryption_iv );
	}
}