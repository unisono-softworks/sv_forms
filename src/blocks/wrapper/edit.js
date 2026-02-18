import InspectorControls from './components/inspector_controls';
import { WrapperProvider, InputsConsumer } from '../../blocks';

const { __ } = wp.i18n;
const { Button } = wp.components;
const { select, dispatch } = wp.data;
const { InnerBlocks } = wp.blockEditor;
const { Component, Fragment } = wp.element;
const { editPost } = dispatch( 'core/editor' );
const { 
    getBlock,
    getEditedPostAttribute, 
    __experimentalGetReusableBlocks
} = select( 'core/editor' );

export default class extends Component {
    constructor(props) {
        super(...arguments);

        this.props = props;
        this.oldProps = {};
        this.template = [
            ['straightvisions/sv-forms-form'],
            ['straightvisions/sv-forms-thank-you'],
            ['straightvisions/sv-forms-user-mail'],
            ['straightvisions/sv-forms-admin-mail'],
        ];

    }

    // React Lifecycle Methos
    componentDidMount = () => {
        if ( ! this.doesFormExist() || ( this.doesFormExist() && this.isDuplicate() ) ) {
            this.props.setAttributes({ postId: select('core/editor').getCurrentPostId() });
            this.props.setAttributes({ formId: this.props.clientId });
            
            this.updatePostMeta( 'update' );
        }

        this.toggleBody( false );
    };

    componentWillUpdate = () => {
        this.oldProps = this.props;
    };

    componentDidUpdate = () => {
        // Only updates when the attributes have changed
        if ( _.isEqual( this.props.attributes, this.oldProps.attributes ) ) return;

        this.updatePostMeta( 'update' );
    };

    componentWillUnmount = () => {
        this.updatePostMeta( 'remove' );
    };

    // Checks if the block already exists inside the current post
	doesFormExist = () => {
		const meta = getEditedPostAttribute('meta') || {};
		const formId = this.props?.attributes?.formId;
		if (!formId) return false;
		
		try {
			const forms = JSON.parse(meta._sv_forms_forms || '{}');
			return !!forms[formId];
		} catch {
			return false;
		}
	};
	
	
	// Checks if this block is a duplicate of an existing one in the current post
    isDuplicate = () => {
        const currentBlocks = wp.data.select('core/block-editor').getBlocks();
        let formsWithSameId = 0;

        currentBlocks.forEach( block => {
            if ( 
                block.name === 'straightvisions/sv-forms' 
                && block.attributes.formId === this.props.attributes.formId  
            ) {
                formsWithSameId++;
            }
        } );

        if ( formsWithSameId > 1 ) {
            return true;
        }

        return false;
    };

    // Updates the current post meta with the block attributes
	updatePostMeta = (action) => {
		const formId = this.props?.attributes?.formId;
		if (!formId) return false;
		
		const currentMeta = getEditedPostAttribute('meta') || {};
		
		let currentForms = {};
		try {
			currentForms = JSON.parse(currentMeta._sv_forms_forms || '{}') || {};
		} catch (e) {
			currentForms = {};
		}
		
		switch (action) {
			case 'update':
				currentForms[formId] = this.props.attributes;
				break;
			
			case 'remove':
				delete currentForms[formId];
				break;
			
			default:
				return false;
		}
		
		editPost({
			meta: {
				...currentMeta,
				_sv_forms_forms: JSON.stringify(currentForms),
			},
		});
		
		return true;
	};
	
	
	// Togles the collapsed state of the body
    toggleBody = change => {
        const body = jQuery( 'div[data-block="' + this.props.clientId + '"] .' + this.props.className + ' > .sv_forms_body' );
        const icon = jQuery( 'div[data-block="' + this.props.clientId + '"] .' + this.props.className + ' > .sv_forms_header > .sv_forms_label_wrapper > button.components-button > span' );

        if ( change ) {
            if ( this.props.attributes.collapsed ) {
                icon.removeClass( 'dashicons-hidden' );
                icon.addClass( 'dashicons-visibility' );
                body.slideDown();
            } else {
                icon.removeClass( 'dashicons-visibility' );
                icon.addClass( 'dashicons-hidden' );
                body.slideUp();
            }

            this.props.setAttributes({ collapsed: ! this.props.attributes.collapsed });
        } else {
            if ( this.props.attributes.collapsed ) {
                icon.removeClass( 'dashicons-visibility' );
                icon.addClass( 'dashicons-hidden' );
                body.slideUp();
            } else {
                icon.removeClass( 'dashicons-hidden' );
                icon.addClass( 'dashicons-visibility' );
                body.slideDown();
            }
        }
    };

    updateFormInputs = inputs => {
        if ( inputs.length > 0 ) {
            this.props.setAttributes({ formInputs: JSON.stringify( inputs ) });
        }
    };

    render = () => {
        return (
            <Fragment>
                <div className={ this.props.className }>
                    <div className='sv_forms_header'>
                        <div className='sv_forms_label_wrapper'>
                            <div className='sv_forms_form_label'>{ this.props.attributes.formLabel }</div>
                            <Button onClick={ () => this.toggleBody( true ) }>
                                <span class='dashicons dashicons-visibility'></span>
                            </Button>
                        </div>
                        <div className='sv_forms_form_id'>Form ID: { this.props.attributes.formId }</div>
                        <div className='sv_forms_title'>{ __( 'SV Forms', 'sv_forms' ) }</div>
                    </div>
                    <div class='sv_forms_body'>
                        <WrapperProvider value={ this.props }>
                            <InnerBlocks 
                                allowedBlocks={ this.template }
                                template={ this.template }
                                templateLock={ true }
                            />
                        </WrapperProvider>
                    </div>
                </div>
                <InspectorControls props={ this.props } />
                <InputsConsumer>{ inputs => this.updateFormInputs( inputs ) }</InputsConsumer>
            </Fragment>
        );
    }
}