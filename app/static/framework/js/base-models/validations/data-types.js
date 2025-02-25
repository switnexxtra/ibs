define(["extensions/validations/data-types", "jquery"], function(extension, $) {
    "use strict";
    var DataTypes = {
        Alphanumeric: "[a-zA-Z0-9]*",
        AlphanumericWithSpace: "[a-zA-Z0-9 ]*",
        Numbers: "[0-9]*",
        Decimals: "^[0-9]*\.[0-9]+$",
        Alphabets: "[a-zA-Z]*",
        AlphabetsWithSpace: "[a-zA-Z ]*",
        AlphabetsWithSomeSpecial: "[a-zA-Z\-']*",
        LowerAlphabets: "[a-z]*",
        UpperAlphabets: "[A-Z]*",
        LowerAlphabetsWithSpace: "[a-z ]*",
        UpperAlphabetsWithSpace: "[A-Z ]*",
        AlphanumericWithSpecial: "[a-zA-Z0-9 \%\&\:\,\)\(\.\_'\-\//;]*",
        AlphanumericWithSomeSpecial: "[a-zA-Z0-9 \&\:\$\,\.\_]*",
        SWIFT: "[a-zA-Z0-9\- \+\:,\)\(\.'\?\/]*",
        AlphanumericWithAllSpecial: "[a-zA-Z0-9\- \=\&\#\*\+\:,\)\(\.\!\$_\|'\`\?\[\\\]\/]*",
        SpaceWithAllSpecial: "[!\"\#\$\%\&'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\\\]\^\_\`\{\|\}\~\ ]*",
        SWIFT_X: "[A-Za-z0-9\/\\-\?\:\(\)\.\,\'\+\\s\r\n]*",
        SWIFT_Y: "[A-Za-z0-9\/\\-\?\:\(\)\.\,\'\+\\s\=\!\"\%\&\*\<\>\;]*",
        SWIFT_Z: "[A-Za-z0-9\/\\-\?\:\(\)\.\,\'\+\\s\_\=\!\"\%\&\*\<\>\;\@\#\{\r\n]*",
        Email: "^(([^<>()[\\]\\.,;:\\s@\\\"]+(\\.[^<>()[\\]\\.,;:\\s@\\\"]+)*)|(\".+\"))@(([^<>()[\\]\\.,;:\\s@\"]+\\.)+[^<>()[\\]\\.,;:\\s@\"]{2,})$",
        FreeText: "(.|\n)*",
        Url: "^((http|https?):\/\/)?([w|W]{3}\.)+[a-zA-Z0-9\-\.]{2,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$",
        IpAddress: "^([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])$"
    };
    return $.extend(true, DataTypes, extension);
});