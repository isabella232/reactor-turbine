/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var getReplaceTokens = function(options) {
  options = options || {};

  return require('inject!../replaceTokens')({
    './isPlainObject': require('../isPlainObject'),
    '../isVar': options.isVar || function() { return true; },
    '../getVar': options.getVar || function() {},
    '../state': options.state || {
      getPropertySettings: function() {
        return {};
      }
    }
  });
};

describe('replaceTokens', function() {
  it('replaces nested tokens', function() {
    var replaceTokens = getReplaceTokens({
      getVar: function(variableName) {
        return 'replaced:' + variableName;
      }
    });

    var result = replaceTokens({
      foo: [
        {},
        {
          bar: '%unicorn% and %dinosaur% tracks',
          zoo: '%unicorn% and %dinosaur%'
        }
      ],
      fruits: [
        '%apple%',
        'banana'
      ]
    });

    expect(result).toEqual({
      foo: [
        {},
        {
          bar: 'replaced:unicorn and replaced:dinosaur tracks',
          zoo: 'replaced:unicorn and replaced:dinosaur'
        }
      ],
      fruits: [
        'replaced:apple',
        'banana'
      ]
    });
  });

  it('replaces token with empty string if value is null and ' +
    'undefinedVarsReturnEmpty = true', function() {
    var replaceVarTokens = getReplaceTokens({
      getVar: function() {
        return null;
      },
      state: {
        getPropertySettings: function() {
          return {
            undefinedVarsReturnEmpty: true
          };
        }
      }
    });

    expect(replaceVarTokens('foo %bar%')).toBe('foo ');
  });

  it('replace token if var value is null and ' +
    'undefinedVarsReturnEmpty = false', function() {
    var replaceVarTokens = getReplaceTokens({
      getVar: function() {
        return null;
      },
      state: {
        getPropertySettings: function() {
          return {
            undefinedVarsReturnEmpty: false
          };
        }
      }
    });

    expect(replaceVarTokens('foo %bar%')).toBe('foo null');
  });

  it('does not replace token if var definition is not found', function() {
    var replaceVarTokens = getReplaceTokens({
      isVar: function() {
        return false;
      }
    });

    expect(replaceVarTokens('foo %bar%')).toBe('foo %bar%');
  });

  it('returns the data element\'s raw value if only a ' +
    'single data element token is given', function() {
    var objValue = {};

    var replaceVarTokens = getReplaceTokens({
      getVar: function() {
        return objValue;
      }
    });

    expect(replaceVarTokens('%foo%')).toBe(objValue);
  });

  it('does not return the data element\'s raw value if string starts and ends with different ' +
    'data element tokens', function() {
    var replaceVarTokens = getReplaceTokens({
      getVar: function() {
        return 'quux';
      }
    });

    // tests regex robustness
    expect(replaceVarTokens('%foo% and %bar%')).toBe('quux and quux');
  });

  it('returns the argument unmodified if it is an unsupported type', function() {
    var replaceVarTokens = getReplaceTokens();

    var fn = function() {};
    expect(replaceVarTokens(fn)).toBe(fn);
  });
});