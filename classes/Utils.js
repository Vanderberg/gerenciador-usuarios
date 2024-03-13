class Utils {

    static dateFormat(date) {

        function addZero(i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        }

        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes())

    }

}