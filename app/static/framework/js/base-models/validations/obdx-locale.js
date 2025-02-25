define([
  "base-models/validations/data-types",
  "extensions/validations/obdx-locale",
  "jquery",
  "ojL10n!resources/nls/obdx-locale"
], function(DataTypes, extension, $, locale) {
  "use strict";
  var Locale = {
    DataTypes: DataTypes,
    validations: {
      ACCOUNT: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.ACCOUNT
        }
      }, {
        type: "length",
        options: {
          min: 5,
          max: 34

        }
      }],
      NAME: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithAllSpecial,
          messageDetail: locale.messages.NAME
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 80

        }
      }],
      USER_NAME: [{
        type: "regExp",
        options: {
          pattern: "[a-zA-Z0-9\@\_\.]*",
          messageDetail: locale.messages.NAME
        }
      }, {
        type: "length",
        options: {
          min: 6,
          max: 80
        }
      }],
      RESOURCE_NAME: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithAllSpecial,
          messageDetail: locale.messages.NAME
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 255
        }
      }],
      SEARCH_USER_NAME: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithAllSpecial,
          messageDetail: locale.messages.NAME
        }
      }, {
        type: "length",
        options: {
          min: 4,
          max: 256
        }
      }],
      TENURE_MONTHS: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Numbers,
          messageDetail: locale.messages.TENURE_MONTHS
        }
      }, {
        type: "numberRange",
        options: {
          min: 0,
          max: 120
        }
      }],
      TENURE_YEARS: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Numbers,
          messageDetail: locale.messages.TENURE_YEARS
        }
      }, {
        type: "numberRange",
        options: {
          min: 0,
          max: 30
        }
      }],
      TENURE_DAYS: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Numbers,
          messageDetail: locale.messages.TENURE_DAYS
        }
      }, {
        type: "numberRange",
        options: {
          min: 0,
          max: 365
        }
      }],
      AMOUNT: [{
        type: "numberRange",
        options: {
          min: 0,
          max: 9999999999999.99
        }
      }],

      REFERENCE_NUMBER: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.REFERENCE_NUMBER
        }
      }],
      CITY: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithSpecial,
          messageDetail: locale.messages.CITY
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 40

        }
      }],
      IBAN: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.IBAN
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 34

        }
      }],
      DEBTOR_IBAN: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.DEBTOR_IBAN
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 20

        }
      }],
      COMMENTS: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithSomeSpecial,
          messageDetail: locale.messages.COMMENTS
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 80

        }
      }],
      PARTY_ID: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.PARTY_ID
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 20

        }
      }],
      MESSAGE: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithSpace,
          messageDetail: locale.messages.MESSAGE
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 2000
        }
      }],
      PIN: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Numbers,
          messageDetail: locale.messages.PIN
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 4
        }
      }],
      CVV: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Numbers,
          messageDetail: locale.messages.CVV
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 3
        }
      }],

      ONLY_NUMERIC: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Numbers,
          messageDetail: locale.messages.ONLY_NUMERIC
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 3
        }
      }],

      ONLY_SPECIAL: [{
        type: "regExp",
        options: {
          pattern: DataTypes.SpaceWithAllSpecial,
          messageDetail: locale.messages.ONLY_SPECIAL
        }
      }],
      BANK_CODE: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.BANK_CODE
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 20

        }
      }],
      BANK_NAME: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithSpace,
          messageDetail: locale.messages.BANK_NAME
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 60

        }
      }],
      CHEQUE_NUMBER: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.CHEQUE_NUMBER
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 6

        }
      }],

      EMAIL: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Email,
          messageDetail: locale.messages.EMAIL
        }
      }],
      MOBILE_NO: [{
        type: "regExp",
        options: {
          pattern: "^(\\+\\d{1,3}[- ]?)?\\d{8}$",
          messageDetail: locale.messages.MOBILE_NO
        }
      }],
      IFSC_CODE: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.IFSC_CODE
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 11

        }
      }],
      ADDRESS: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithSpecial,
          messageDetail: locale.messages.ADDRESS
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 70

        }
      }],
      POSTAL_CODE: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.POSTAL_CODE
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 20
        }
      }],

      OTP: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Numbers,
          messageDetail: locale.messages.OTP
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 10

        }
      }],
      //TODO
      CARD_NUMBER: [{
        type: "regExp",
        options: {
          pattern: "[0-9 ]{1,24}",
          messageDetail: locale.messages.CARD_NUMBER
        }
      }],

      APPLICATION_CODE: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithAllSpecial,
          messageDetail: locale.messages.APPLICATION_CODE
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 20

        }
      }],
      APPLICATION_NAME: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithAllSpecial,
          messageDetail: locale.messages.APPLICATION_NAME
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 40

        }
      }],

      APPLICATION_DESCRIPTION: [{
        type: "regExp",
        options: {
          pattern: DataTypes.AlphanumericWithAllSpecial,
          messageDetail: locale.messages.APPLICATION_DESCRIPTION
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 100

        }
      }],
      //TODO
      USER_ID: [{
        type: "regExp",
        options: {
          pattern: "[a-zA-Z0-9.@_ ]{0,35}",
          messageDetail: locale.messages.USER_ID
        }
      }],

      //TODO
      BILLER_NAME: [{
        type: "regExp",
        options: {
          pattern: "[a-zA-Z0-9_\. ]{2,35}",
          messageDetail: locale.messages.BILLER_NAME
        }
      }],

      //TODO
      SSN: [{
        type: "regExp",
        options: {
          pattern: "[0-9-]{11}",
          messageDetail: locale.messages.SSN
        }
      }],
      PERCENTAGE: {
        type: "numberRange",
        options: {
          min: 0,
          max: 100
        }
      },
      //TODO
      PHONE_NO: [{
        type: "regExp",
        options: {
          pattern: "[0-9]{1,15}",
          messageDetail: locale.messages.PHONE_NO
        }
      }],
      IP_ADDRESS: [{
        type: "regExp",
        options: {
          pattern: DataTypes.IpAddress,
          messageDetail: locale.messages.IP_ADDRESS
        }
      }],
      PORT: [{
        type: "regExp",
        options: {
          pattern: "^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$",
          messageDetail: locale.messages.PORT
        }
      }],
      BRANCH: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Alphanumeric,
          messageDetail: locale.messages.BRANCH
        }
      }, {
        type: "length",
        options: {
          min: 3,
          max: 6
        }
      }],
      //TODO
      VEHICLE_MODEL: [{
        type: "regExp",
        options: {
          pattern: "[a-zA-Z0-9 ]{1,35}",
          messageDetail: locale.messages.VEHICLE_MODEL
        }
      }],
      //TODO
      REGISTRATION_NO: [{
        type: "regExp",
        options: {
          pattern: "[a-zA-Z0-9 ]{1,35}",
          messageDetail: locale.messages.REGISTRATION_NO
        }
      }],
      YEAR: [{
        type: "regExp",
        options: {
          pattern: DataTypes.Numbers,
          messageDetail: locale.messages.YEAR
        }
      }, {
        type: "length",
        options: {
          min: 4,
          max: 4

        }
      }],
      OIN_NUMBER: [{
        type: "regExp",
        options: {
          pattern: "[a-zA-Z0-9]{1,35}",
          messageDetail: locale.messages.OIN_NUMBER
        }
      }],
      PAYMENT_DETAILS: [{
        type: "regExp",
        options: {
          pattern: DataTypes.SWIFT,
          messageDetail: locale.messages.PAYMENT_DETAILS
        }
      }, {
        type: "length",
        options: {
          min: 1,
          max: 35

        }
      }],
      ATTRIBUTE_MASK: [{
        type: "regExp",
        options: {
          pattern: "[D+d+X+x+]*$",
          messageDetail: locale.messages.ATTRIBUTE_MASK
        }
      }],
      LATITUDE: [
        {
          type: "numberRange",
          options: {
            min: -90,
            max: +90
          }
        }
      ],
      LONGITUDE: [
        {
          type: "numberRange",
          options: {
            min: -180,
            max: +180
          }
        }
      ]
    },
    dateFormat: "dd MMM yyyy",
    serverDate: "yyyy-MM-dd",
    dateMonthFormat: "dd MMM",
    dateTimeStampFormat: "dd MMM yyyy hh:mm:ss a",
    dateTimehhmmFormat: "dd MMM yyyy hh:mm a",
    timeFormat: "h:mm a",
    monthYearFormat: "MMM yyyy",
    dateTimeFormat: "dd MMM hh:mm a",
    timeStampFormat: "hh:mm:ss",
    localCurrency: "@@localCurrency"
  };

  if (extension) {
    if (extension.validations) {
      Object.keys(extension.validations).forEach(function(key) {
        for (var i = 0; i < extension.validations[key].length; i++) {
          var notfound = true;
          if (Locale.validations[key]) {
            for (var j = 0; j < Locale.validations[key].length; j++) {
              if (extension.validations[key][i].type === Locale.validations[key][j].type) {
                Locale.validations[key][j] = extension.validations[key][i];
                notfound = false;
                break;
              }
            }
          }
          if (notfound) {
            Locale.validations[key] = Locale.validations[key] || [];
            Locale.validations[key].push(extension.validations[key][i]);
          }
        }
      });
      Object.keys(extension).forEach(function(key) {
        if (typeof extension[key] === "string") {
          Locale[key] = extension[key];
        }
      });
    }
  }
  return Locale;
});
