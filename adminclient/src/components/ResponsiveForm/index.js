import React, { Component, } from 'react';
import { Columns, Card, CardContent, CardFooter, CardFooterItem, Notification, Column, } from 're-bulma'; 
import ResponsiveCard from '../ResponsiveCard';
import { getRenderedComponent, } from '../AppLayoutMap';
import utilities from '../../util';
import { getFormTextInputArea, getFormCheckbox, getFormSubmit, getFormSelect, getCardFooterItem, getFormCode, getFormTextArea, } from './FormElements';
import flatten from 'flat';

class ResponsiveForm extends Component{
  constructor(props) {
    super(props);
    let formdata = (props.flattenFormData) ? flatten(props.formdata, props.flattenDataOptions) : props.formdata;
    // console.log('form state', { formdata, });
    this.state = Object.assign({
      formDataError: null,
      formDataStatusDate: new Date(),
      formDataLists:{},
      formDataTables:{},
      formDataFiles:{},
    }, formdata);
    this.datalists = {};

    this.getRenderedComponent = getRenderedComponent.bind(this);
    this.getFormSubmit = getFormSubmit.bind(this);
    this.getFormCode = getFormCode.bind(this);
    this.getFormTextInputArea = getFormTextInputArea.bind(this);
    this.getFormTextArea = getFormTextArea.bind(this);
    this.getFormCheckbox = getFormCheckbox.bind(this);
    this.getCardFooterItem = getCardFooterItem.bind(this);
    this.getFormSelect = getFormSelect.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    let formdata = (nextProps.flattenFormData) ? flatten(nextProps.formdata, nextProps.flattenDataOptions) : nextProps.formdata;
    this.setState(formdata);
  }
  
  submitForm() {
    console.debug('this.props.getState()', this.props.getState());
    let state = this.props.getState();
    let headers = (state.settings.userprofile) ? state.settings.userprofile.options.headers : {};
    let formdata = Object.assign({}, this.state);
    delete formdata.formDataError;
    delete formdata.formDataLists;
    delete formdata.formDataStatusDate;
    delete formdata.formDataTables;
    console.debug({ formdata });
    if (typeof this.props.onSubmit === 'string' && this.props.onSubmit.indexOf('func:this.props') !== -1) {
      this.props[this.props.onSubmit.replace('func:this.props.', '')](formdata);
    } else if (typeof this.props.onSubmit !== 'function') {
      let fetchOptions = this.props.onSubmit;
      let formBody = new FormData();
      let fetchPostBody;

      //if file
      if (Object.keys(formdata.formDataFiles).length) {
        delete headers[ 'Content-Type' ];
        delete headers[ 'content-type' ];
        Object.keys(formdata).forEach(form_name => {
          formBody.append(form_name, formdata[ form_name ]);
        });
        fetchPostBody = formBody;
      }
      else {
        delete formdata.formDataFiles;
        fetchPostBody = JSON.stringify(formdata);        
      }

      fetchOptions.options = Object.assign(
        { headers },
        fetchOptions.options,
        {
          body: fetchPostBody, 
        });
      console.debug({ fetchOptions, fetchPostBody, headers, },'has formData',formBody);
      console.debug('got formdata in here')

      // https://lowrey.me/upload-files-as-a-gist-using-javascripts-fetch-api/
      // https://www.raymondcamden.com/2016/05/10/uploading-multiple-files-at-once-with-fetch
      /*     var formData = new FormData();
        if($f1.val()) {
            var fileList = $f1.get(0).files;
            for(var x=0;x<fileList.length;x++) {
                formData.append('file'+x, fileList.item(x));    
            }
        }

        fetch('http://localhost:3000/upload', {
            method:'POST',
            body:formData   
        }).then(function(res) {
            console.log('Status', res);
        }).catch(function(e) {
            console.log('Error',e);
        }); */
      //http://stackoverflow.com/questions/36067767/how-do-i-upload-a-file-with-the-html5-js-fetch-api
      /* var input = document.querySelector('input[type="file"]')

        var data = new FormData()
        data.append('file', input.files[0])
        data.append('user', 'hubot')

        fetch('/avatars', {
          method: 'POST',
          body: data
        }) */
      // https://github.com/yawetse/formie/blob/master/lib/formie.js
      fetch(fetchOptions.url,
        fetchOptions.options
      )
        .then(utilities.checkStatus)
        .then(res => res.json())
        .catch(e => {
          if (typeof this.props.onError !== 'function') {
            console.error(e);
            this.props.errorNotification(e);
          } else {
            this.props.onError(e);
          }
        });
    } else {
      this.props.onSubmit(formdata);
    }
  }
  componentWillUpdate(prevProps, prevState) {
    if (this.props.onChange) {
      this.props.onChange(prevState);
    }
  }
  removeFromSingleItemProp(options) {
    let { value, attribute, } = options;
    let attrArray = attribute.split('.');
    let arrayToSet = Object.assign([], this.state[ attrArray[ 0 ] ][ attrArray[ 1 ] ]);
    // let removedItem = arrayToSet.splice(value, 1);
    arrayToSet.splice(value, 1);

    this.setFormSingleProp({ value: arrayToSet, attribute, });    
    // console.log('remove prop form state', { value, attribute, arrayToSet, removedItem, });
  }
  addSingleItemProp(options) {
    // console.log('addSingleItemProp');
    let { value, attribute, } = options;
    let attrArray = attribute.split('.');
    if (!this.state[ attrArray[ 0 ] ]) {
      // this.state[ attrArray[ 0 ] ] = {};
      this.setState({ [ attrArray[ 0 ] ]: {}, });
    }
    let arrayToSet = Object.assign([], this.state[ attrArray[ 0 ] ][ attrArray[ 1 ] ]);
    // let removedItem = arrayToSet.splice(value, 1);
    arrayToSet.push(value);

    this.setFormSingleProp({ value: arrayToSet, attribute, });    
    // console.log('remove prop form state', { value, attribute, arrayToSet, removedItem, });
  }
  setFormSingleProp(options) {
    // console.log('setFormSingleProp');
    let { value, attribute, } = options;
    let updatedStateProp = {};
    // console.log('setFormSingleProp prop form state', { value, attribute, }, 'this.state.formDataLists', this.state.formDataLists);
    let updatedFormData = Object.assign({}, this.state.formDataLists);
    updatedFormData[ attribute ].data = [];
    // let dataFromState = this.state.formDataLists[ formElement.name ].data;

    if (attribute.indexOf('.') === -1) {
      updatedStateProp[ attribute ] = value;
      updatedStateProp.formDataLists = updatedFormData;
      this.setState(updatedStateProp);
    } else {
      let attrArray = attribute.split('.');
      let stateToSet = Object.assign({}, this.state[ attrArray[ 0 ] ]);
      stateToSet[attrArray[1]]=value;
      this.setState({
        [ attrArray[ 0 ] ]: stateToSet,
        formDataLists: updatedFormData,
      });
    }
  }
  render() {
    let keyValue = 0;
    let formGroupData = this.props.formgroups.map((formgroup, i) => {
      let gridProps = Object.assign({
        isMultiline: true,
        key: i,
      }, formgroup.gridProps);
      let getFormElements = (formElement, j) => {
        if (formElement.type === 'text' ) {
          return this.getFormTextInputArea({ formElement,  i:j, formgroup, });
        } else if (formElement.type === 'textarea') {
          return this.getFormTextArea({ formElement,  i:j, formgroup, });
        } else if (formElement.type === 'checkbox') {
          return this.getFormCheckbox({ formElement,  i:j, formgroup, });
        } else if (formElement.type === 'code') {
          return this.getFormCode({ formElement,  i:j, formgroup, }); 
        } else if (formElement.type === 'select') {
          return this.getFormSelect({ formElement,  i:j, formgroup, }); 
        } else if (formElement.type === 'layout') {
          return (<div key={j} {...formElement.layoutProps}>{this.getRenderedComponent(formElement.value)}</div>);
        } else if (formElement.type === 'submit') {
          return this.getFormSubmit({ formElement,  i:j, formgroup, }); 
        } else {
          return <div key={j} />;
        }
      };
      /** If the formgroup is a card and has two columns, it will create a single card with two inputs split into two columns based on which ones are set in each column */
      if (formgroup.card && formgroup.card.twoColumns) {
        keyValue++;
        keyValue += i;
        return (
          <ResponsiveCard {...formgroup.card.props} key={keyValue++}>
          <Columns>
            <Column size="isHalf">
            {formgroup.formElements[0].formGroupElementsLeft.map(getFormElements)}
            </Column>
            <Column size="isHalf">
              {formgroup.formElements[0].formGroupElementsRight.map(getFormElements)}
            </Column>  
          </Columns>
        </ResponsiveCard>);
      }

      /** If a formgroup is a card and doubleCard is true, it will create two columns, each with a card. The cards will be independant of each other but will share the same horizontal space */
      if (formgroup.card && formgroup.card.doubleCard) {
        keyValue++;
        keyValue += i;
        return (
          <Columns>
            <Column size="isHalf">
              <ResponsiveCard {...formgroup.card.leftCardProps} key={keyValue++}>
                {formgroup.formElements[0].formGroupCardLeft.map(getFormElements)}
              </ResponsiveCard>
            </Column>
            <Column size="isHalf">
              <ResponsiveCard {...formgroup.card.rightCardProps} key={keyValue++}>
                {formgroup.formElements[0].formGroupCardRight.map(getFormElements)}
              </ResponsiveCard>
            </Column>
          </Columns>);
      }

      /** If a formgroup is a card, and is not a doubleCard or twoColumns, it will be a single card in a horizontal space in a half size column  */
      if (formgroup.card && !formgroup.card.twoColumns && !formgroup.card.doubleCard) {
        keyValue++;
        keyValue += i;
        return (<Columns {...gridProps}>
        <Column size="isHalf">  
          <ResponsiveCard {...formgroup.card.props} key={keyValue++}>
            {formgroup.formElements.map(getFormElements)}
            </ResponsiveCard>
          </Column>  
        </Columns>);
      }
      return (<Columns {...gridProps}>
        {formgroup.formElements.map(getFormElements)}
      </Columns>);
    });
    let footerGroupData = (this.props.footergroups)
      ? this.props.footergroups.map((formgroup, i) => { 
        let gridProps = Object.assign({
          isMultiline: true,
          key: i,
        }, formgroup.gridProps);
        let getFormElements = (formElement, j) => {
          if (formElement.type === 'submit') {
            return this.getCardFooterItem({ formElement,  i:j, formgroup, });
          } else {
            return <CardFooterItem>
              <div key={j} />
            </CardFooterItem>;
          }
        };      
        return (<CardFooter {...gridProps}>
          {formgroup.formElements.map(getFormElements)}
        </CardFooter>);
      })
      : [];

    if (this.props.cardForm) {
      return (<Card {...this.props.cardFormProps}>
        <CardContent>
          {formGroupData}
        </CardContent>
        {footerGroupData}
      </Card>);
    } else if(this.props.notificationForm){
      return(<div>
      <Notification>{formGroupData}</Notification>
      </div>);
    } else {
      return (<div>{ formGroupData }</div>);
    }
  }
  componentDidUpdate() {
    // console.log('componentDidUpdate this.props.error', this.props.error);
    if (this.props.formerror) {
      this.props.onError(this.props.formerror);
    }
  }
}

export default ResponsiveForm;