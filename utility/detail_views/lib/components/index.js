'use strict';

const DICTIONARY = require('../dictionary');
const capitalize = require('capitalize');
const pluralize = require('pluralize');
const contenttabs = require('./contenttabs');
const indextable = require('./indextable');
const buildDetail = require('./buildDetail');
const buildAdvancedDetail = require('./buildAdvancedDetail');
const helpers = require('../helpers');
pluralize.addIrregularRule('data', 'datas');

/**
 * This constructs a mongo schema detail page
 *
 * @param {*} schema 
 * @param {*} label 
 * @param {*} options 
 */
const constructDetail = function (schema, label, options = {}, newEntity) {
  let usablePrefix = helpers.getDataPrefix(options.prefix,undefined,schema,label,options);
  // console.log({ label, usablePrefix });
  // console.log({usablePrefix,label},`${(usablePrefix.charAt(0)!=='/')?'/'+usablePrefix:usablePrefix}/${pluralize(label)}/:id?format=json`);
  return {
    resources: (newEntity)?undefined: {
      [ helpers.getDetailLabel(label) ]: `${(usablePrefix.charAt(0)!=='/')?'/'+usablePrefix:usablePrefix}/${pluralize(label)}/:id?format=json`,
    },
    onFinish:'render',
    pageData:{
      title:`Content › ${pluralize(capitalize(label))}`,
      navLabel:`Content › ${pluralize(capitalize(label))}`,
    },
    layout: {
      component:'div',
      props:{
        style:{
          marginTop:80,
          marginBottom:80,
        },
      },
      children: [
        contenttabs(schema, label, options),
        {
          component: 'Container',
          props: {
          },
          children: [
            {
              component: 'ResponsiveTabs',
              asyncprops: {
                formdata: [helpers.getDetailLabel(label), label, ],
              },
              props: {
                tabsType: 'navBar',
                tabsProps: {
                  style: {
                    border: 'none',
                    fontSize: 14,
                  },
                },
                tabgroupProps: {
                  style: {
                    border: 'none',
                    fontSize: 14,
                  },
                },
                tabs: [
                  {
                    name: 'Basic Editor',
                    layout: {
                      component: 'div',
                      children: buildDetail(schema, label, options, newEntity),
                    },
                  },
                  {
                    name: 'Advanced Editor',
                    layout: {
                      component: 'div',
                      children: buildAdvancedDetail(schema, label, options, newEntity),
                    },
                  },
                ],
              },
              // children:'',
            },
          ],
          // .concat(buildDetail(schema, label, options)),
        },
      ],
    },
  };
};

/**
 * constructs index page
 *
 * @param {*} schema 
 * @param {*} label 
 * @param {*} options 
 */
const constructIndex = function (schema, label, options = {}) {
  // console.log('constructIndex', { schema, label, options })
  let usablePrefix = helpers.getDataPrefix(options.prefix,undefined,schema,label,options);
  let manifestPrefix = helpers.getManifestPathPrefix(options.prefix);
  // console.log({ label, usablePrefix });
  return {
    resources: {
      [ helpers.getIndexLabel(label) ]:  `${(usablePrefix.charAt(0)!=='/')?'/'+usablePrefix:usablePrefix}/${pluralize(label)}?format=json`,
    },
    onFinish:'render',
    pageData:{
      title:`Content › ${pluralize(capitalize(label))}`,
      navLabel:`Content › ${pluralize(capitalize(label))}`,
    },
    layout: {
      component: 'div',
      props: {
        style:{
          marginTop:80,
          marginBottom:80,
        },
      },
      children: [
        contenttabs(schema, label, options),
        {
          component: 'Container',
          props: {
          },
          children: [
            {
              component: 'div',
              props: {
                style: {
                  display: 'flex',
                  flex: 1,
                },
              },
              children: [
                {
                  component: 'Title',
                  props: {
                    style: {
                      marginTop: 30,
                      display: 'flex',
                      flex:1,
                    },
                  },
                  children: capitalize(label),
                },
                {
                  component: 'ResponsiveButton',
                  children: `Create ${capitalize(label)}`,  
                  props: {
                    onClick: 'func:this.props.reduxRouter.push',
                    onclickProps: `${manifestPrefix}/${pluralize(label)}/new`,
                    buttonProps: {
                      size: 'isMedium',
                      color:'isPrimary',
                    },
                    style: {
                      alignSelf: 'center',
                      textAlign: 'right',
                      // padding: 0,
                    },
                  },
                },
              ],
            },
          ]
          .concat(indextable(schema, label, options)),
        },
      ],
    },
  };
};

module.exports = {
  constructDetail,
  constructIndex,
};