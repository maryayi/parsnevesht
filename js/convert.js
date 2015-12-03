// this code convert arabic ك and ي to persian ک and ی in a given text string
// Author: Mahdi Aryayi (mahdiaryayi@gmail.com)
// published under license: GNU Public License (GPL v3)

$(document).ready(function () {

    // Defining Conversion functions

    // 1- converting ك to ک
    function convertKa(inputStr) {
        var regex1 = /ك/g;
        var stat = 0;

        // get number of cases
        if (inputStr.match(regex1) !== null) {
            stat += inputStr.match(regex1).length;
        }

        // converting
        var out = inputStr.replace(regex1, 'ک');

        return [out, stat];
    }

    // 2- converting ي to ی
    function convertYa(inputStr) {
        var regex1 = /ي/g;
        var stat = 0;

        // get number of cases
        if (inputStr.match(regex1) !== null) {
            stat += inputStr.match(regex1).length;
        }

        // converting
        var out = inputStr.replace(regex1, 'ی');

        return [out, stat];
    }

    // 3- converting Arabic numbers to Persian Numbers
    function convertArabicNum(inputStr) {
        var regex0 = /٠/g;
        var regex1 = /١/g;
        var regex2 = /٢/g;
        var regex3 = /٣/g;
        var regex4 = /٤/g;
        var regex5 = /٥/g;
        var regex6 = /٦/g;
        var regex7 = /٧/g;
        var regex8 = /٨/g;
        var regex9 = /٩/g;
        var regexDecimal = /([۰۱۲۳۴۵۶۷۸۹]+)([\.\/])([۰۱۲۳۴۵۶۷۸۹]+)/g;
        var regexFix = /([۰۱۲۳۴۵۶۷۸۹]+)٫([۰۱۲۳۴۵۶۷۸۹]+)\/([۰۱۲۳۴۵۶۷۸۹]+)/g;
        var stat = 0;

        // get number of cases 0
        if (inputStr.match(regex0) !== null) {
            stat += inputStr.match(regex0).length;
        }

        // converting 0
        var out0 = inputStr.replace(regex0, '۰');

        // get number of cases 1
        if (out0.match(regex1) !== null) {
            stat += out0.match(regex1).length;
        }

        // converting 1
        var out1 = out0.replace(regex1, '۱');

        // get number of cases 2
        if (out1.match(regex2) !== null) {
            stat += out1.match(regex2).length;
        }

        // converting 2
        var out2 = out1.replace(regex2, '۲');

        // get number of cases 3
        if (out2.match(regex3) !== null) {
            stat += out2.match(regex3).length;
        }

        // converting 3
        var out3 = out2.replace(regex3, '۳');

        // get number of cases 4
        if (out3.match(regex4) !== null) {
            stat += out3.match(regex4).length;
        }

        // converting 4
        var out4 = out3.replace(regex4, '۴');

        // get number of cases 5
        if (out4.match(regex5) !== null) {
            stat += out4.match(regex5).length;
        }

        // converting 5
        var out5 = out4.replace(regex5, '۵');

        // get number of cases 6
        if (out5.match(regex6) !== null) {
            stat += out5.match(regex6).length;
        }

        // converting 6
        var out6 = out5.replace(regex6, '۶');

        // get number of cases 7
        if (out6.match(regex7) !== null) {
            stat += out6.match(regex7).length;
        }

        // converting 7
        var out7 = out6.replace(regex7, '۷');

        // get number of cases 8
        if (out7.match(regex8) !== null) {
            stat += out7.match(regex8).length;
        }

        // converting 8
        var out8 = out7.replace(regex8, '۸');

        // get number of cases 9
        if (out8.match(regex9) !== null) {
            stat += out8.match(regex9).length;
        }

        // converting 9
        var out9 = out8.replace(regex9, '۹');

        // get number of cases decimal separator
        if (out9.match(regexDecimal) !== null) {
            stat += out9.match(regexDecimal).length;
        }

        //converting decimal separator
        var out10 = out9.replace(regexDecimal, '$1٫$3');

        // get number of fixing dates

        // get number of cases fix seperator
        if (out10.match(regexFix) !== null) {
            stat -= out10.match(regexFix).length;
        }

        //converting fix separator
        var out11 = out10.replace(regexFix, '$1/$2/$3');


        return [out11, stat];
    }

    // 4- converting English numbers to Persian Numbers
    function convertEnglishNum(inputStr) {
        var regex0 = /0/g;
        var regex1 = /1/g;
        var regex2 = /2/g;
        var regex3 = /3/g;
        var regex4 = /4/g;
        var regex5 = /5/g;
        var regex6 = /6/g;
        var regex7 = /7/g;
        var regex8 = /8/g;
        var regex9 = /9/g;
        var regexDecimal = /([۰۱۲۳۴۵۶۷۸۹]+)([\.\/])([۰۱۲۳۴۵۶۷۸۹]+)/g;
        var regexFix = /([۰۱۲۳۴۵۶۷۸۹]+)٫([۰۱۲۳۴۵۶۷۸۹]+)\/([۰۱۲۳۴۵۶۷۸۹]+)/g;
        var stat = 0;

        // get number of cases 0
        if (inputStr.match(regex0) !== null) {
            stat += inputStr.match(regex0).length;
        }

        // converting 0
        var out0 = inputStr.replace(regex0, '۰');

        // get number of cases 1
        if (out0.match(regex1) !== null) {
            stat += out0.match(regex1).length;
        }

        // converting 1
        var out1 = out0.replace(regex1, '۱');

        // get number of cases 2
        if (out1.match(regex2) !== null) {
            stat += out1.match(regex2).length;
        }

        // converting 2
        var out2 = out1.replace(regex2, '۲');

        // get number of cases 3
        if (out2.match(regex3) !== null) {
            stat += out2.match(regex3).length;
        }

        // converting 3
        var out3 = out2.replace(regex3, '۳');

        // get number of cases 4
        if (out3.match(regex4) !== null) {
            stat += out3.match(regex4).length;
        }

        // converting 4
        var out4 = out3.replace(regex4, '۴');

        // get number of cases 5
        if (out4.match(regex5) !== null) {
            stat += out4.match(regex5).length;
        }

        // converting 5
        var out5 = out4.replace(regex5, '۵');

        // get number of cases 6
        if (out5.match(regex6) !== null) {
            stat += out5.match(regex6).length;
        }

        // converting 6
        var out6 = out5.replace(regex6, '۶');

        // get number of cases 7
        if (out6.match(regex7) !== null) {
            stat += out6.match(regex7).length;
        }

        // converting 7
        var out7 = out6.replace(regex7, '۷');

        // get number of cases 8
        if (out7.match(regex8) !== null) {
            stat += out7.match(regex8).length;
        }

        // converting 8
        var out8 = out7.replace(regex8, '۸');

        // get number of cases 9
        if (out8.match(regex9) !== null) {
            stat += out8.match(regex9).length;
        }

        // converting 9
        var out9 = out8.replace(regex9, '۹');

        // get number of cases decimal seperator
        if (out9.match(regexDecimal) !== null) {
            stat += out9.match(regexDecimal).length;
        }

        //converting decimal separator
        var out10 = out9.replace(regexDecimal, '$1٫$3');

        // get number of cases fix seperator
        if (out10.match(regexFix) !== null) {
            stat -= out10.match(regexFix).length;
        }

        //converting fix separator
        var out11 = out10.replace(regexFix, '$1/$2/$3');


        return [out11, stat];
    }

    // 5- converting Decimal separator
    function convertDecimalSeparator(inputStr) {
        var regexDecimal = /([۰۱۲۳۴۵۶۷۸۹]+)([\.\/])([۰۱۲۳۴۵۶۷۸۹]+)/g;
        var regexFix = /([۰۱۲۳۴۵۶۷۸۹]+)٫([۰۱۲۳۴۵۶۷۸۹]+)\/([۰۱۲۳۴۵۶۷۸۹]+)/g;
        var stat = 0;

        // get number of cases
        if (inputStr.match(regexDecimal) !== null) {
            stat += inputStr.match(regexDecimal).length;
        }

        // converting
        var out1 = inputStr.replace(regexDecimal, '$1٫$3');

        // get number of cases fix seperator
        if (out1.match(regexFix) !== null) {
            stat -= out1.match(regexFix).length;
        }

        //converting fix separator
        var out2 = out1.replace(regexFix, '$1/$2/$3');

        return [out2, stat];
    }

    // 6- converting () [] {} spacing
    function convertParenthesisSpace(inputStr) {
        var regexParenthesis1 = /([\wا-ی]+)(\s{0}|\s{2,})([\(\[\{])/g;
        var regexParenthesis2 = /([\(\[\{])\s+/g;
        var regexParenthesis3 = /\s+([\)\]\}])/g;
        var regexParenthesis4 = /([\)\]\}])(\s{0}|\s{2,})([\wا-ی]+)/g;

        var stat = 0;

        // get number of cases before opening parenthesis
        if (inputStr.match(regexParenthesis1) !== null) {
            stat += inputStr.match(regexParenthesis1).length;
        }

        // converting before opening parenthesis
        var out1 = inputStr.replace(regexParenthesis1, '$1 $3');

        // get number of cases after opening parenthesis
        if (out1.match(regexParenthesis2) !== null) {
            stat += out1.match(regexParenthesis2).length;
        }

        //converting after opening parenthesis
        var out2 = out1.replace(regexParenthesis2, '$1');

        // get number of cases before closing parenthesis
        if (out2.match(regexParenthesis3) !== null) {
            stat += out2.match(regexParenthesis3).length;
        }

        //converting before closing parenthesis
        var out3 = out2.replace(regexParenthesis3, '$1');

         // get number of cases before closing parenthesis
        if (out3.match(regexParenthesis4) !== null) {
            stat += out3.match(regexParenthesis4).length;
        }

        //converting before closing parenthesis
        var out4 = out3.replace(regexParenthesis4, '$1 $3');

        return [out4, stat];
    }


    // 7- converting punctuation spacing
    function convertPunctuationSpace(inputStr) {
        var regexPunctuation1 = /([\wا-ی]+)\s+([\.\؟\!\?])/g;
        var regexPunctuation2 = /([\.\؟\!\?])(\s{0}|\s{2,})([\wا-ی]+)/g;

        var stat = 0;

        // get number of cases before punctuation
        if (inputStr.match(regexPunctuation1) !== null) {
            stat += inputStr.match(regexPunctuation1).length;
        }

        // converting before punctuation
        var out1 = inputStr.replace(regexPunctuation1, '$1$2');

        // get number of cases after punctuation
        if (out1.match(regexPunctuation2) !== null) {
            stat += out1.match(regexPunctuation2).length;
        }

        //converting after punctuation
        var out2 = out1.replace(regexPunctuation2, '$1 $3');


        return [out2, stat];
    }

    $('#convertButton').on('click', function () {


        var inText = $('#inputText').val();
        var msg = 'گزارش عملکرد: <br>';
        var totalStat = 0;
        // List of selected checkboxes and replacing strings
        var trueItems = [];
        if ($('#kaCheck').prop('checked')) {
            var out = convertKa(inText);
            inText = out[0];
            var statKa = out[1];
            totalStat += statKa;
            if (statKa > 0) {
                msg = msg + statKa + ' عدد جایگزینی «کاف» <br>';
            }

        }
        if ($('#yaCheck').prop('checked')) {
            var out = convertYa(inText);
            inText = out[0];
            var statYa = out[1];
            totalStat += statYa;
            if (statYa > 0) {
                msg = msg + statYa + ' عدد جایگزینی «ی» <br>';
            }
        }

        if ($('#momayezCheck').prop('checked')) {
            var out = convertDecimalSeparator(inText);
            inText = out[0];
            var statDecimalNum = out[1];
            totalStat += statDecimalNum;
            if (statDecimalNum > 0) {
                msg = msg + statDecimalNum + ' عدد جایگزینی ممیز اعشار <br>';
            }
        }

        if ($('#arabicNumberCheck').prop('checked')) {
            var out = convertArabicNum(inText);
            inText = out[0];
            var statArabicNum = out[1];
            totalStat += statArabicNum;
            if (statArabicNum > 0) {
                msg = msg + statArabicNum + ' عدد جایگزینی اعداد عربی <br>';
            }
        }
        if ($('#englishNumberCheck').prop('checked')) {
            var out = convertEnglishNum(inText);
            inText = out[0];
            var statEnglishNum = out[1];
            totalStat += statEnglishNum;
            if (statEnglishNum > 0) {
                msg = msg + statEnglishNum + ' عدد جایگزینی اعداد انگلیسی <br>';
            }
        }

        if ($('#prantezCheck').prop('checked')) {
            var out = convertParenthesisSpace(inText);
            inText = out[0];
            var statParenthesisNum = out[1];
            totalStat += statParenthesisNum;
            if (statParenthesisNum > 0) {
                msg = msg + statParenthesisNum + ' عدد اصلاح فاصله پرانتز/کروشه/آکولاد <br>';
            }
        }
        if ($('#alamatCheck').prop('checked')) {
            var out = convertPunctuationSpace(inText);
            inText = out[0];
            var statPunctuationNum = out[1];
            totalStat += statPunctuationNum;
            if (statPunctuationNum > 0) {
                msg = msg + statPunctuationNum + ' عدد اصلاح فاصله علامت آخر جمله <br>';
            }
        }

        var outText = inText;


        if (totalStat > 0) {
            $('.chevronBox').css('visibility', 'visible');
            $('#outputText').val(outText);
            $('#outputText').select();
            msg += 'اکنون می‌توانید نوشته اصلاح شده را از کادر سمت چپ copy کنید و در محل مورد نظر paste نمایید'
        } else {
            msg = 'هیچ موردی برای تغییر یافت نشد';
            $('#outputText').val('هیچ موردی برای تغییر یافت نشد');
        }

        $('#msgPlaceHolder').append('<div class="alert alert-success alert-dismissible" id="finalMsg" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+msg+'</div>');


    });
    $('#resetButton').on('click', function() {
        $('#inputText').val('');
        $('#outputText').val('');
        $('.chevronBox').css('visibility', 'hidden');
    });
});
